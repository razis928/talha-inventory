"""Seed default chart of accounts used by AP / AR / expenses."""

from sqlalchemy import select
from sqlalchemy.orm import Session

from app.modules.accounting.models import Account, AccountType

DEFAULT_ACCOUNTS: list[tuple[str, str, AccountType]] = [
    ("1000", "Cash in Hand", AccountType.ASSET),
    ("1100", "Bank Account", AccountType.ASSET),
    ("1200", "Accounts Receivable", AccountType.ASSET),
    ("2000", "Accounts Payable", AccountType.LIABILITY),
    ("3000", "Owner Equity", AccountType.EQUITY),
    ("4000", "Sales Revenue", AccountType.INCOME),
    ("5000", "Purchase / Direct Costs", AccountType.EXPENSE),
    ("5100", "Operating Expenses", AccountType.EXPENSE),
]


def ensure_default_accounts(db: Session) -> None:
    existing = {a.code for a in db.scalars(select(Account)).all()}
    created = False
    for code, name, acc_type in DEFAULT_ACCOUNTS:
        if code in existing:
            continue
        db.add(
            Account(
                code=code,
                name=name,
                type=acc_type,
                parent_id=None,
                is_system=True,
                is_active=True,
            )
        )
        created = True
    if created:
        db.commit()

    # Backfill payable/receivable sub-accounts for existing parties
    from app.modules.accounting.party_accounts import ensure_customer_account, ensure_vendor_account
    from app.modules.customers.models import Customer
    from app.modules.vendors.models import Vendor

    changed = False
    for vendor in db.scalars(select(Vendor)).all():
        ensure_vendor_account(db, vendor)
        changed = True
    for customer in db.scalars(select(Customer)).all():
        ensure_customer_account(db, customer)
        changed = True
    if changed:
        db.commit()

    # Backfill AP bills for receivings that predated auto-posting
    from app.modules.accounting.service import backfill_receiving_vendor_bills

    try:
        backfill_receiving_vendor_bills(db)
    except Exception:
        db.rollback()
