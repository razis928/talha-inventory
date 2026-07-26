from sqlalchemy import or_, select
from sqlalchemy.orm import Session, selectinload

from app.modules.inventory.models import Item, ItemType
from app.modules.inventory.stock_models import StockTransaction, StockTxnType
from app.modules.job_orders.models import JobConsumedItem, JobOrder, JobOrderLine, JobOrderStatus
from app.modules.job_orders.schemas import (
    JobConsumptionCreate,
    JobOrderCreate,
    JobOrderLineCreate,
    JobOrderUpdate,
)


class JobOrderNotFoundError(Exception):
    pass


class DuplicateNumberError(Exception):
    pass


class ValidationError(Exception):
    pass


def _get_finished_item_or_raise(db: Session, item_id: int) -> Item:
    item = db.get(Item, item_id)
    if item is None:
        raise ValidationError(f"Item {item_id} not found")
    if item.type != ItemType.FINISHED:
        raise ValidationError(f"Item '{item.name}' is not a finished item")
    return item


def _build_lines(db: Session, lines: list[JobOrderLineCreate]) -> list[JobOrderLine]:
    built: list[JobOrderLine] = []
    for line in lines:
        item: Item | None = None
        if line.item_id is not None:
            item = _get_finished_item_or_raise(db, line.item_id)

        pending = (
            line.order_pending_quantity
            if line.order_pending_quantity is not None
            else line.order_quantity
        )
        if pending > line.order_quantity:
            raise ValidationError(
                f"Order pending quantity ({pending}) cannot exceed order quantity ({line.order_quantity})"
            )

        item_name = (line.item_name or "").strip() or (item.name if item else "")
        if not item_name:
            raise ValidationError("Each line needs a finished item or an item name")

        unit = (line.unit or "").strip() or (item.unit if item else "")
        size_value = line.size.strip() if line.size else (str(item.size or "") if item else "")

        gross = round(line.order_quantity * line.rate, 2)
        gst_amount = round(gross * (line.gst_percent / 100), 2)
        net = round(gross + gst_amount, 2)
        built.append(
            JobOrderLine(
                item_id=item.id if item else None,
                item_name=item_name,
                unit=unit,
                quality=line.quality,
                colour=line.colour,
                size=size_value,
                order_quantity=line.order_quantity,
                order_pending_quantity=pending,
                remarks=line.remarks,
                rate=line.rate,
                gst_percent=line.gst_percent,
                gross_amount=gross,
                line_total=net,
            )
        )
    return built


def _refresh_totals(job: JobOrder) -> None:
    tax = round(
        sum(float(line.gross_amount) * float(line.gst_percent) / 100 for line in job.lines),
        2,
    )
    lines_total = round(sum(float(line.line_total) for line in job.lines), 2)
    freight = float(job.freight_charges or 0)
    job.tax_amount = tax
    job.total_amount = round(lines_total + freight, 2)


def list_job_orders(
    db: Session,
    *,
    search: str | None = None,
    skip: int = 0,
    limit: int = 100,
) -> list[JobOrder]:
    query = (
        select(JobOrder)
        .options(selectinload(JobOrder.lines))
        .order_by(JobOrder.id.desc())
    )
    if search:
        pattern = f"%{search.strip()}%"
        query = query.where(
            or_(JobOrder.job_number.ilike(pattern), JobOrder.customer_name.ilike(pattern))
        )
    return list(db.scalars(query.offset(skip).limit(limit)).all())


def get_job_order(db: Session, job_id: int) -> JobOrder:
    job = db.scalar(
        select(JobOrder)
        .options(selectinload(JobOrder.lines))
        .where(JobOrder.id == job_id)
    )
    if job is None:
        raise JobOrderNotFoundError(f"Job order {job_id} not found")
    return job


def create_job_order(db: Session, payload: JobOrderCreate) -> JobOrder:
    existing = db.scalar(select(JobOrder).where(JobOrder.job_number == payload.job_number))
    if existing is not None:
        raise DuplicateNumberError(f"Job number '{payload.job_number}' already exists")

    lines = _build_lines(db, payload.lines)
    job = JobOrder(
        job_number=payload.job_number,
        customer_name=payload.customer_name,
        required_date=payload.required_date,
        payment_terms=payload.payment_terms,
        remarks=payload.remarks,
        pi_number=payload.pi_number,
        freight_charges=payload.freight_charges,
        currency=payload.currency,
        status=JobOrderStatus.PENDING,
        lines=lines,
    )
    _refresh_totals(job)
    db.add(job)
    db.commit()
    return get_job_order(db, job.id)


def update_job_order(db: Session, job_id: int, payload: JobOrderUpdate) -> JobOrder:
    job = get_job_order(db, job_id)
    data = payload.model_dump(exclude_unset=True, exclude={"lines"})

    if "job_number" in data:
        conflict = db.scalar(
            select(JobOrder).where(
                JobOrder.job_number == data["job_number"],
                JobOrder.id != job_id,
            )
        )
        if conflict is not None:
            raise DuplicateNumberError(f"Job number '{data['job_number']}' already exists")

    for field, value in data.items():
        setattr(job, field, value)

    if payload.lines is not None:
        job.lines.clear()
        job.lines.extend(_build_lines(db, payload.lines))

    _refresh_totals(job)
    db.commit()
    return get_job_order(db, job.id)


def delete_job_order(db: Session, job_id: int) -> None:
    job = get_job_order(db, job_id)
    db.delete(job)
    db.commit()


def _get_raw_item_or_raise(db: Session, item_id: int) -> Item:
    item = db.get(Item, item_id)
    if item is None:
        raise ValidationError(f"Item {item_id} not found")
    if item.type != ItemType.RAW:
        raise ValidationError(f"Item '{item.name}' is not a raw item")
    return item


def list_job_consumptions(db: Session, job_id: int) -> list[JobConsumedItem]:
    get_job_order(db, job_id)
    return list(
        db.scalars(
            select(JobConsumedItem)
            .where(JobConsumedItem.job_order_id == job_id)
            .order_by(JobConsumedItem.id.desc())
        ).all()
    )


def create_job_consumptions(
    db: Session, job_id: int, payload: JobConsumptionCreate
) -> list[JobConsumedItem]:
    job = get_job_order(db, job_id)
    if job.status == JobOrderStatus.CANCELLED:
        raise ValidationError("Cannot consume materials against a cancelled job order")

    created: list[JobConsumedItem] = []
    for line in payload.lines:
        item = _get_raw_item_or_raise(db, line.item_id)
        stock = int(item.stock_quantity or 0)
        qty = int(line.quantity)
        if qty > stock:
            raise ValidationError(
                f"Insufficient stock for '{item.name}': available {stock}, requested {qty}"
            )

        row = JobConsumedItem(
            job_order_id=job.id,
            item_id=item.id,
            item_name=item.name,
            unit=item.unit or "",
            quantity=qty,
            consumed_date=payload.consumed_date,
            notes=(line.notes or payload.notes or "").strip(),
        )
        db.add(row)
        db.flush()

        item.stock_quantity = stock - qty
        db.add(
            StockTransaction(
                item_id=item.id,
                item_name=item.name,
                transaction_type=StockTxnType.OUT,
                quantity=qty,
                balance_after=int(item.stock_quantity),
                unit=item.unit or "",
                reference_type="job_consumption",
                reference_id=row.id,
                reference_number=job.job_number,
                notes=f"Consumed on job {job.job_number}"
                + (f" — {row.notes}" if row.notes else ""),
            )
        )
        created.append(row)

    if job.status == JobOrderStatus.PENDING:
        job.status = JobOrderStatus.IN_PROGRESS

    db.commit()
    for row in created:
        db.refresh(row)
    return created
