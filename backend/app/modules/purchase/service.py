from sqlalchemy import or_, select
from sqlalchemy.orm import Session, selectinload

from app.modules.inventory.models import Item
from app.modules.inventory.stock_models import StockTransaction, StockTxnType
from app.modules.purchase.models import (
    PurchaseOrder,
    PurchaseOrderLine,
    PurchaseOrderStatus,
    Receiving,
    ReceivingLine,
)
from app.modules.purchase.schemas import (
    PurchaseOrderCreate,
    PurchaseOrderLineCreate,
    PurchaseOrderUpdate,
    ReceivingCreate,
)
from app.modules.vendors.models import Vendor


class PurchaseNotFoundError(Exception):
    pass


class ReceivingNotFoundError(Exception):
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


def _get_vendor_or_raise(db: Session, vendor_id: int) -> Vendor:
    vendor = db.get(Vendor, vendor_id)
    if vendor is None:
        raise ValidationError(f"Vendor {vendor_id} not found")
    return vendor


def _build_po_lines(db: Session, lines: list[PurchaseOrderLineCreate]) -> list[PurchaseOrderLine]:
    built: list[PurchaseOrderLine] = []
    for line in lines:
        item = _get_item_or_raise(db, line.item_id)
        gross = round(line.quantity * line.po_rate, 2)
        gst_amount = round(gross * (line.gst_percent / 100), 2)
        net = round(gross + gst_amount, 2)
        size_value = line.size.strip() if line.size else str(item.size or "")
        built.append(
            PurchaseOrderLine(
                item_id=item.id,
                item_name=item.name,
                gsm=float(item.gsm or 0),
                size=size_value,
                unit=item.unit,
                quantity=line.quantity,
                received_quantity=0,
                po_rate=line.po_rate,
                unit_price=line.po_rate,
                gst_percent=line.gst_percent,
                gross_amount=gross,
                line_total=net,
            )
        )
    return built


def _refresh_po_totals(po: PurchaseOrder) -> None:
    tax = round(sum(float(line.gross_amount) * float(line.gst_percent) / 100 for line in po.lines), 2)
    po.tax_amount = tax
    po.total_amount = round(sum(float(line.line_total) for line in po.lines), 2)


def _update_po_status_from_receipts(po: PurchaseOrder) -> None:
    if not po.lines:
        return
    if all(line.received_quantity >= line.quantity for line in po.lines):
        po.status = PurchaseOrderStatus.RECEIVED
    elif any(line.received_quantity > 0 for line in po.lines):
        po.status = PurchaseOrderStatus.PARTIAL


def list_purchase_orders(
    db: Session,
    *,
    search: str | None = None,
    skip: int = 0,
    limit: int = 100,
) -> list[PurchaseOrder]:
    query = (
        select(PurchaseOrder)
        .options(selectinload(PurchaseOrder.lines))
        .order_by(PurchaseOrder.id.desc())
    )
    if search:
        pattern = f"%{search.strip()}%"
        query = query.where(
            or_(PurchaseOrder.po_number.ilike(pattern), PurchaseOrder.vendor.ilike(pattern))
        )
    return list(db.scalars(query.offset(skip).limit(limit)).all())


def get_purchase_order(db: Session, po_id: int) -> PurchaseOrder:
    po = db.scalar(
        select(PurchaseOrder)
        .options(selectinload(PurchaseOrder.lines))
        .where(PurchaseOrder.id == po_id)
    )
    if po is None:
        raise PurchaseNotFoundError(f"Purchase order {po_id} not found")
    return po


def create_purchase_order(db: Session, payload: PurchaseOrderCreate) -> PurchaseOrder:
    existing = db.scalar(select(PurchaseOrder).where(PurchaseOrder.po_number == payload.po_number))
    if existing is not None:
        raise DuplicateNumberError(f"PO number '{payload.po_number}' already exists")

    vendor = _get_vendor_or_raise(db, payload.vendor_id)
    lines = _build_po_lines(db, payload.lines)
    po = PurchaseOrder(
        po_number=payload.po_number,
        vendor_id=vendor.id,
        vendor=vendor.name,
        required_date=payload.required_date,
        delivery_date=payload.required_date,
        payment_terms=payload.payment_terms,
        remarks=payload.remarks,
        notes=payload.remarks,
        status=PurchaseOrderStatus.PENDING,
        lines=lines,
    )
    _refresh_po_totals(po)
    db.add(po)
    db.commit()
    return get_purchase_order(db, po.id)


def update_purchase_order(db: Session, po_id: int, payload: PurchaseOrderUpdate) -> PurchaseOrder:
    po = get_purchase_order(db, po_id)
    data = payload.model_dump(exclude_unset=True, exclude={"lines", "vendor_id"})

    if "po_number" in data:
        conflict = db.scalar(
            select(PurchaseOrder).where(
                PurchaseOrder.po_number == data["po_number"],
                PurchaseOrder.id != po_id,
            )
        )
        if conflict is not None:
            raise DuplicateNumberError(f"PO number '{data['po_number']}' already exists")

    for field, value in data.items():
        setattr(po, field, value)

    if payload.vendor_id is not None:
        vendor = _get_vendor_or_raise(db, payload.vendor_id)
        po.vendor_id = vendor.id
        po.vendor = vendor.name

    if "required_date" in payload.model_dump(exclude_unset=True):
        po.delivery_date = payload.required_date
    if "remarks" in payload.model_dump(exclude_unset=True) and payload.remarks is not None:
        po.notes = payload.remarks

    if payload.lines is not None:
        if any(line.received_quantity > 0 for line in po.lines):
            raise ValidationError("Cannot replace lines after receiving has started")
        po.lines.clear()
        po.lines.extend(_build_po_lines(db, payload.lines))
        _refresh_po_totals(po)

    db.commit()
    return get_purchase_order(db, po.id)


def delete_purchase_order(db: Session, po_id: int) -> None:
    po = get_purchase_order(db, po_id)
    if any(line.received_quantity > 0 for line in po.lines):
        raise ValidationError("Cannot delete a purchase order that has receivings")
    db.delete(po)
    db.commit()


def approve_purchase_order(db: Session, po_id: int) -> PurchaseOrder:
    """Accept/approve PO (status only). AP posts when goods are received."""
    po = get_purchase_order(db, po_id)
    if po.status == PurchaseOrderStatus.CANCELLED:
        raise ValidationError("Cannot approve a cancelled purchase order")
    if po.status == PurchaseOrderStatus.PENDING:
        po.status = PurchaseOrderStatus.APPROVED
    db.commit()
    return get_purchase_order(db, po.id)


def list_receivings(
    db: Session,
    *,
    search: str | None = None,
    skip: int = 0,
    limit: int = 100,
) -> list[Receiving]:
    query = (
        select(Receiving)
        .options(selectinload(Receiving.lines))
        .order_by(Receiving.id.desc())
    )
    if search:
        pattern = f"%{search.strip()}%"
        query = query.where(
            or_(Receiving.receiving_number.ilike(pattern), Receiving.vendor.ilike(pattern))
        )
    return list(db.scalars(query.offset(skip).limit(limit)).all())


def get_receiving(db: Session, receiving_id: int) -> Receiving:
    receiving = db.scalar(
        select(Receiving)
        .options(selectinload(Receiving.lines))
        .where(Receiving.id == receiving_id)
    )
    if receiving is None:
        raise ReceivingNotFoundError(f"Receiving {receiving_id} not found")
    return receiving


def create_receiving(db: Session, payload: ReceivingCreate) -> Receiving:
    existing = db.scalar(
        select(Receiving).where(Receiving.receiving_number == payload.receiving_number)
    )
    if existing is not None:
        raise DuplicateNumberError(f"Receiving number '{payload.receiving_number}' already exists")

    po: PurchaseOrder | None = None
    if payload.purchase_order_id is not None:
        po = get_purchase_order(db, payload.purchase_order_id)

    vendor_id = payload.vendor_id
    vendor_name = payload.vendor
    if po is not None:
        vendor_id = po.vendor_id
        vendor_name = po.vendor
    elif vendor_id is not None:
        vendor = _get_vendor_or_raise(db, vendor_id)
        vendor_id = vendor.id
        vendor_name = vendor.name

    if not vendor_name:
        raise ValidationError("Vendor is required")

    receiving = Receiving(
        receiving_number=payload.receiving_number,
        purchase_order_id=payload.purchase_order_id,
        vendor_id=vendor_id,
        vendor=vendor_name,
        received_date=payload.received_date,
        notes=payload.notes,
        created_by=payload.created_by,
        lines=[],
    )

    for line_payload in payload.lines:
        item = _get_item_or_raise(db, line_payload.item_id)
        po_line: PurchaseOrderLine | None = None

        if line_payload.purchase_order_line_id is not None:
            if po is None:
                raise ValidationError("purchase_order_line_id requires purchase_order_id")
            po_line = next(
                (line for line in po.lines if line.id == line_payload.purchase_order_line_id),
                None,
            )
            if po_line is None:
                raise ValidationError(
                    f"PO line {line_payload.purchase_order_line_id} not found on this purchase order"
                )
            if po_line.item_id != item.id:
                raise ValidationError("PO line item does not match receiving item")
            remaining = po_line.quantity - po_line.received_quantity
            if line_payload.quantity > remaining:
                raise ValidationError(
                    f"Cannot receive {line_payload.quantity} for '{item.name}'; "
                    f"only {remaining} remaining on PO"
                )

        receiving.lines.append(
            ReceivingLine(
                purchase_order_line_id=po_line.id if po_line else None,
                item_id=item.id,
                item_name=item.name,
                unit=item.unit,
                quantity=line_payload.quantity,
            )
        )

        # Increase stock + write history
        item.stock_quantity = int(item.stock_quantity) + line_payload.quantity
        db.add(
            StockTransaction(
                item_id=item.id,
                item_name=item.name,
                transaction_type=StockTxnType.IN,
                quantity=line_payload.quantity,
                balance_after=int(item.stock_quantity),
                unit=item.unit,
                reference_type="receiving",
                reference_id=None,  # filled after flush
                reference_number=payload.receiving_number,
                notes=f"Received against {payload.receiving_number}",
            )
        )

        if po_line is not None:
            po_line.received_quantity += line_payload.quantity

    db.add(receiving)
    db.flush()

    # Attach receiving id on stock txns created in this request
    pending_txns = db.scalars(
        select(StockTransaction).where(
            StockTransaction.reference_type == "receiving",
            StockTransaction.reference_number == payload.receiving_number,
            StockTransaction.reference_id.is_(None),
        )
    ).all()
    for txn in pending_txns:
        txn.reference_id = receiving.id

    if po is not None:
        _update_po_status_from_receipts(po)

        # Auto AP on receive: Dr Purchases / Cr Vendor — open bill for Vendor Payments
        from app.modules.accounting import service as accounting_service

        try:
            accounting_service.create_vendor_bill_from_receiving(
                db,
                receiving_id=receiving.id,
                receiving_number=receiving.receiving_number,
                purchase_order=po,
                receiving_lines=receiving.lines,
                received_date=receiving.received_date,
                commit=False,
            )
        except accounting_service.ValidationError as exc:
            raise ValidationError(str(exc)) from exc
        except accounting_service.DuplicateError as exc:
            raise ValidationError(str(exc)) from exc

    db.commit()
    return get_receiving(db, receiving.id)
