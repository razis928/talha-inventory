from sqlalchemy import or_, select
from sqlalchemy.orm import Session, selectinload

from app.modules.dispatch.models import Dispatch, DispatchLine, DispatchStatus
from app.modules.dispatch.schemas import DispatchCreate
from app.modules.inventory.models import Item
from app.modules.inventory.stock_models import StockTransaction, StockTxnType
from app.modules.job_orders.models import JobOrder, JobOrderLine, JobOrderStatus
from app.modules.job_orders.service import JobOrderNotFoundError, get_job_order


class DispatchNotFoundError(Exception):
    pass


class DuplicateNumberError(Exception):
    pass


class ValidationError(Exception):
    pass


def _get_item_or_raise(db: Session, item_id: int) -> Item:
    item = db.get(Item, item_id)
    if item is None:
        raise ValidationError(f"Item {item_id} not found")
    return item


def _update_job_status_from_pending(job: JobOrder) -> None:
    if not job.lines:
        return
    if all(line.order_pending_quantity <= 0 for line in job.lines):
        job.status = JobOrderStatus.COMPLETED
    elif any(line.order_pending_quantity < line.order_quantity for line in job.lines):
        job.status = JobOrderStatus.IN_PROGRESS
    else:
        job.status = JobOrderStatus.PENDING


def list_dispatches(
    db: Session,
    *,
    search: str | None = None,
    skip: int = 0,
    limit: int = 100,
) -> list[Dispatch]:
    query = (
        select(Dispatch)
        .options(selectinload(Dispatch.lines))
        .order_by(Dispatch.id.desc())
    )
    if search:
        pattern = f"%{search.strip()}%"
        query = query.where(
            or_(
                Dispatch.pass_number.ilike(pattern),
                Dispatch.job_number.ilike(pattern),
                Dispatch.customer_name.ilike(pattern),
            )
        )
    return list(db.scalars(query.offset(skip).limit(limit)).all())


def get_dispatch(db: Session, dispatch_id: int) -> Dispatch:
    dispatch = db.scalar(
        select(Dispatch)
        .options(selectinload(Dispatch.lines))
        .where(Dispatch.id == dispatch_id)
    )
    if dispatch is None:
        raise DispatchNotFoundError(f"Dispatch {dispatch_id} not found")
    return dispatch


def create_dispatch(db: Session, payload: DispatchCreate) -> Dispatch:
    existing = db.scalar(select(Dispatch).where(Dispatch.pass_number == payload.pass_number))
    if existing is not None:
        raise DuplicateNumberError(f"Pass number '{payload.pass_number}' already exists")

    try:
        job = get_job_order(db, payload.job_order_id)
    except JobOrderNotFoundError as exc:
        raise ValidationError(str(exc)) from exc

    if job.status == JobOrderStatus.CANCELLED:
        raise ValidationError("Cannot dispatch against a cancelled job order")
    if job.status == JobOrderStatus.COMPLETED:
        raise ValidationError("Job order is already fully dispatched")

    dispatch = Dispatch(
        pass_number=payload.pass_number,
        job_order_id=job.id,
        job_number=job.job_number,
        customer_name=job.customer_name,
        dispatch_date=payload.dispatch_date,
        vehicle_no=payload.vehicle_no,
        driver=payload.driver,
        notes=payload.notes,
        created_by=payload.created_by,
        status=DispatchStatus.DISPATCHED,
        lines=[],
    )

    for line_payload in payload.lines:
        job_line = next(
            (line for line in job.lines if line.id == line_payload.job_order_line_id),
            None,
        )
        if job_line is None:
            raise ValidationError(
                f"Job line {line_payload.job_order_line_id} not found on this job order"
            )

        item: Item | None = None
        if job_line.item_id is not None:
            item = _get_item_or_raise(db, job_line.item_id)
            if line_payload.item_id is not None and line_payload.item_id != item.id:
                raise ValidationError("Job line item does not match dispatch item")
        elif line_payload.item_id is not None:
            raise ValidationError("Job line has no inventory item to dispatch")

        item_name = item.name if item else job_line.item_name
        unit = item.unit if item else job_line.unit

        pending = int(job_line.order_pending_quantity)
        if line_payload.quantity > pending:
            raise ValidationError(
                f"Cannot dispatch {line_payload.quantity} for '{item_name}'; "
                f"only {pending} pending on job order"
            )

        dispatch.lines.append(
            DispatchLine(
                job_order_line_id=job_line.id,
                item_id=item.id if item else None,
                item_name=item_name,
                unit=unit,
                quantity=line_payload.quantity,
            )
        )

        job_line.order_pending_quantity = pending - line_payload.quantity

        if item is not None:
            stock = int(item.stock_quantity or 0)
            item.stock_quantity = stock - line_payload.quantity
            db.add(
                StockTransaction(
                    item_id=item.id,
                    item_name=item.name,
                    transaction_type=StockTxnType.OUT,
                    quantity=line_payload.quantity,
                    balance_after=int(item.stock_quantity),
                    unit=item.unit,
                    reference_type="dispatch",
                    reference_id=None,
                    reference_number=payload.pass_number,
                    notes=f"Dispatched against job {job.job_number} ({payload.pass_number})",
                )
            )

    db.add(dispatch)
    db.flush()

    pending_txns = db.scalars(
        select(StockTransaction).where(
            StockTransaction.reference_type == "dispatch",
            StockTransaction.reference_number == payload.pass_number,
            StockTransaction.reference_id.is_(None),
        )
    ).all()
    for txn in pending_txns:
        txn.reference_id = dispatch.id

    _update_job_status_from_pending(job)

    # Auto AR: Dr customer receivable / Cr sales for dispatched value
    from app.modules.accounting import service as accounting_service

    try:
        accounting_service.create_customer_invoice_from_dispatch(
            db,
            dispatch_id=dispatch.id,
            pass_number=dispatch.pass_number,
            job=job,
            dispatch_lines=dispatch.lines,
            commit=False,
        )
    except accounting_service.ValidationError as exc:
        raise ValidationError(str(exc)) from exc
    except accounting_service.DuplicateError as exc:
        raise ValidationError(str(exc)) from exc

    db.commit()
    return get_dispatch(db, dispatch.id)
