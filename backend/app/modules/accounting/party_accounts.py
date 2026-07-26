"""Party sub-accounts under AP (2000) / AR (1200)."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.accounting.models import Account, AccountType
from app.modules.customers.models import Customer
from app.modules.vendors.models import Vendor

AP_PARENT_CODE = "2000"
AR_PARENT_CODE = "1200"


def _get_parent(db: Session, code: str) -> Account:
    parent = db.scalar(select(Account).where(Account.code == code))
    if parent is None:
        raise RuntimeError(f"Parent account '{code}' missing — restart to seed COA")
    return parent


def ensure_vendor_account(db: Session, vendor: Vendor) -> Account:
    """Create or return child payable account under Accounts Payable."""
    if vendor.account_id:
        existing = db.get(Account, vendor.account_id)
        if existing is not None:
            if existing.name != vendor.name:
                existing.name = vendor.name
            return existing

    parent = _get_parent(db, AP_PARENT_CODE)
    code = f"AP-{vendor.code}".upper()[:50]
    conflict = db.scalar(select(Account).where(Account.code == code))
    if conflict is not None:
        code = f"AP-{vendor.code}-{vendor.id or 'X'}"[:50]

    account = Account(
        code=code,
        name=vendor.name,
        type=AccountType.LIABILITY,
        parent_id=parent.id,
        is_system=False,
        is_active=True,
    )
    db.add(account)
    db.flush()
    vendor.account_id = account.id
    return account


def ensure_customer_account(db: Session, customer: Customer) -> Account:
    """Create or return child receivable account under Accounts Receivable."""
    if customer.account_id:
        existing = db.get(Account, customer.account_id)
        if existing is not None:
            if existing.name != customer.name:
                existing.name = customer.name
            return existing

    parent = _get_parent(db, AR_PARENT_CODE)
    slug = "".join(ch for ch in customer.name.upper() if ch.isalnum())[:20] or "CUST"
    code = f"AR-{slug}"[:50]
    if db.scalar(select(Account).where(Account.code == code)):
        code = f"AR-{slug}-{customer.id or 'X'}"[:50]

    account = Account(
        code=code,
        name=customer.name,
        type=AccountType.ASSET,
        parent_id=parent.id,
        is_system=False,
        is_active=True,
    )
    db.add(account)
    db.flush()
    customer.account_id = account.id
    return account
