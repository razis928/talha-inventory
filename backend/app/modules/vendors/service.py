from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.modules.vendors.models import Vendor
from app.modules.vendors.schemas import VendorCreate, VendorUpdate


class VendorNotFoundError(Exception):
    pass


class DuplicateVendorCodeError(Exception):
    pass


def list_vendors(
    db: Session,
    *,
    search: str | None = None,
    skip: int = 0,
    limit: int = 200,
) -> list[Vendor]:
    query = select(Vendor).order_by(Vendor.name.asc())
    if search:
        pattern = f"%{search.strip()}%"
        query = query.where(
            or_(
                Vendor.name.ilike(pattern),
                Vendor.code.ilike(pattern),
                Vendor.phone.ilike(pattern),
                Vendor.city.ilike(pattern),
            )
        )
    return list(db.scalars(query.offset(skip).limit(limit)).all())


def get_vendor(db: Session, vendor_id: int) -> Vendor:
    vendor = db.get(Vendor, vendor_id)
    if vendor is None:
        raise VendorNotFoundError(f"Vendor {vendor_id} not found")
    return vendor


def create_vendor(db: Session, payload: VendorCreate) -> Vendor:
    data = payload.model_dump()
    code = (data.get("code") or "").strip()
    if not code:
        # Auto code from name so AP account codes stay unique
        slug = "".join(ch for ch in payload.name.upper() if ch.isalnum())[:12] or "VND"
        code = slug
        n = 1
        while db.scalar(select(Vendor).where(Vendor.code == code)):
            n += 1
            code = f"{slug}-{n}"[:50]
    else:
        existing = db.scalar(select(Vendor).where(Vendor.code == code))
        if existing is not None:
            raise DuplicateVendorCodeError(f"Vendor code '{code}' already exists")

    data["code"] = code
    vendor = Vendor(**data)
    db.add(vendor)
    db.flush()

    from app.modules.accounting.party_accounts import ensure_vendor_account

    ensure_vendor_account(db, vendor)
    db.commit()
    db.refresh(vendor)
    return vendor


def update_vendor(db: Session, vendor_id: int, payload: VendorUpdate) -> Vendor:
    vendor = get_vendor(db, vendor_id)
    data = payload.model_dump(exclude_unset=True)

    if "code" in data:
        conflict = db.scalar(
            select(Vendor).where(Vendor.code == data["code"], Vendor.id != vendor_id)
        )
        if conflict is not None:
            raise DuplicateVendorCodeError(f"Vendor code '{data['code']}' already exists")

    for field, value in data.items():
        setattr(vendor, field, value)

    db.commit()
    db.refresh(vendor)
    return vendor


def delete_vendor(db: Session, vendor_id: int) -> None:
    vendor = get_vendor(db, vendor_id)
    db.delete(vendor)
    db.commit()


def get_vendor_detail(db: Session, vendor_id: int) -> dict:
    from app.modules.accounting import service as accounting_service
    from app.modules.accounting.party_accounts import ensure_vendor_account
    from app.modules.purchase.models import PurchaseOrder

    vendor = get_vendor(db, vendor_id)
    if not vendor.account_id:
        ensure_vendor_account(db, vendor)
        db.commit()
        db.refresh(vendor)

    orders = list(
        db.scalars(
            select(PurchaseOrder)
            .where(PurchaseOrder.vendor_id == vendor.id)
            .order_by(PurchaseOrder.id.desc())
            .limit(50)
        ).all()
    )
    ledger: list[dict] = []
    balance = 0.0
    if vendor.account_id:
        ledger = accounting_service.get_account_ledger(db, vendor.account_id)
        balance = accounting_service._account_balance(db, vendor.account_id)

    return {
        "vendor": vendor,
        "account_balance": balance,
        "purchase_orders": [
            {
                "id": po.id,
                "po_number": po.po_number,
                "status": po.status.value if hasattr(po.status, "value") else str(po.status),
                "total_amount": float(po.total_amount or 0),
                "required_date": po.required_date,
                "created_at": po.created_at,
            }
            for po in orders
        ],
        "ledger": ledger,
    }
