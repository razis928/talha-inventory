from datetime import date

from sqlalchemy import func, or_, select
from sqlalchemy.orm import Session, selectinload

from app.modules.accounting.models import (
    Account,
    AccountType,
    CustomerInvoice,
    DocStatus,
    Expense,
    JournalEntry,
    JournalLine,
    Payment,
    PaymentType,
    VendorBill,
)
from app.modules.accounting.party_accounts import ensure_customer_account, ensure_vendor_account
from app.modules.accounting.schemas import (
    AccountCreate,
    AccountUpdate,
    AccountingSummary,
    CustomerInvoiceCreate,
    ExpenseCreate,
    JobCostingRow,
    PaymentCreate,
    VendorBillCreate,
)
from app.modules.customers.models import Customer
from app.modules.job_orders.models import JobOrder
from app.modules.purchase.models import PurchaseOrder
from app.modules.vendors.models import Vendor


class NotFoundError(Exception):
    pass


class DuplicateError(Exception):
    pass


class ValidationError(Exception):
    pass


# ── Helpers ────────────────────────────────────────────────────────

def _get_account_by_code(db: Session, code: str) -> Account:
    account = db.scalar(select(Account).where(Account.code == code))
    if account is None:
        raise ValidationError(f"System account '{code}' not found — restart to seed COA")
    return account


def _get_account(db: Session, account_id: int) -> Account:
    account = db.get(Account, account_id)
    if account is None:
        raise NotFoundError(f"Account {account_id} not found")
    return account


def _account_balance(db: Session, account_id: int) -> float:
    """Asset/Expense: debit − credit. Liability/Equity/Income: credit − debit."""
    account = _get_account(db, account_id)
    debit = float(
        db.scalar(
            select(func.coalesce(func.sum(JournalLine.debit_amount), 0))
            .select_from(JournalLine)
            .join(JournalEntry)
            .where(
                JournalLine.debit_account_id == account_id,
                JournalEntry.status == DocStatus.POSTED,
            )
        )
        or 0
    )
    credit = float(
        db.scalar(
            select(func.coalesce(func.sum(JournalLine.credit_amount), 0))
            .select_from(JournalLine)
            .join(JournalEntry)
            .where(
                JournalLine.credit_account_id == account_id,
                JournalEntry.status == DocStatus.POSTED,
            )
        )
        or 0
    )
    if account.type in (AccountType.ASSET, AccountType.EXPENSE) or account.type is None:
        return round(debit - credit, 2)
    return round(credit - debit, 2)


def get_account_ledger(
    db: Session,
    account_id: int,
    *,
    date_from: date | None = None,
    date_to: date | None = None,
) -> list[dict]:
    """Chronological ledger for one account with running balance.

    Running balance is computed over the full history so filtered rows keep
    correct cumulative balances. Optional date_from / date_to limit which rows
    are returned.
    """
    account = _get_account(db, account_id)
    is_debit_normal = account.type in (AccountType.ASSET, AccountType.EXPENSE) or account.type is None

    rows = db.execute(
        select(JournalLine, JournalEntry)
        .join(JournalEntry, JournalLine.journal_entry_id == JournalEntry.id)
        .where(
            JournalEntry.status == DocStatus.POSTED,
            or_(
                JournalLine.debit_account_id == account_id,
                JournalLine.credit_account_id == account_id,
            ),
        )
        .order_by(JournalEntry.entry_date.asc(), JournalEntry.id.asc(), JournalLine.id.asc())
    ).all()

    running = 0.0
    ledger: list[dict] = []
    for line, entry in rows:
        debit = float(line.debit_amount) if line.debit_account_id == account_id else 0.0
        credit = float(line.credit_amount) if line.credit_account_id == account_id else 0.0
        if is_debit_normal:
            running = round(running + debit - credit, 2)
        else:
            running = round(running + credit - debit, 2)

        if date_from is not None and entry.entry_date < date_from:
            continue
        if date_to is not None and entry.entry_date > date_to:
            continue

        contra_id = (
            line.credit_account_id if line.debit_account_id == account_id else line.debit_account_id
        )
        contra = db.get(Account, contra_id)
        ledger.append(
            {
                "date": entry.entry_date,
                "entry_number": entry.entry_number,
                "description": entry.description,
                "memo": getattr(line, "memo", None) or "",
                "reference_type": entry.reference_type,
                "reference_id": entry.reference_id,
                "purchase_order_id": entry.purchase_order_id,
                "job_order_id": entry.job_order_id,
                "contra_account": contra.code if contra else "",
                "debit": debit,
                "credit": credit,
                "balance": running,
            }
        )
    return ledger


def _tree_balance(db: Session, parent_id: int) -> float:
    """Parent balance = own activity + all children."""
    total = _account_balance(db, parent_id)
    children = db.scalars(select(Account).where(Account.parent_id == parent_id)).all()
    for child in children:
        total = round(total + _tree_balance(db, child.id), 2)
    return total


def _next_entry_number(db: Session) -> str:
    count = db.scalar(select(func.count()).select_from(JournalEntry)) or 0
    return f"JE-{count + 1:05d}"


def _post_journal(
    db: Session,
    *,
    entry_date: date,
    description: str,
    reference_type: str,
    reference_id: int | None,
    pairs: list[tuple[Account, Account, float, str]],
    purchase_order_id: int | None = None,
    job_order_id: int | None = None,
) -> JournalEntry:
    """
    Post paired lines: (debit_account, credit_account, amount, memo).
    debit_amount == credit_amount on each pair.
    """
    if not pairs:
        raise ValidationError("Journal needs at least one debit/credit pair")

    total = 0.0
    lines: list[JournalLine] = []
    for debit_acc, credit_acc, amount, memo in pairs:
        amt = round(float(amount), 2)
        if amt <= 0:
            raise ValidationError("Journal line amount must be greater than 0")
        if debit_acc.id == credit_acc.id:
            raise ValidationError("Debit and credit accounts must differ")
        total = round(total + amt, 2)
        lines.append(
            JournalLine(
                debit_account_id=debit_acc.id,
                credit_account_id=credit_acc.id,
                debit_amount=amt,
                credit_amount=amt,
                purchase_order_id=purchase_order_id,
                job_order_id=job_order_id,
                memo=memo,
            )
        )

    entry = JournalEntry(
        entry_number=_next_entry_number(db),
        entry_date=entry_date,
        description=description,
        reference_type=reference_type,
        reference_id=reference_id,
        purchase_order_id=purchase_order_id,
        job_order_id=job_order_id,
        status=DocStatus.POSTED,
        lines=lines,
    )
    db.add(entry)
    db.flush()
    return entry


def _cash_or_bank(db: Session, method: str, override_code: str | None = None) -> Account:
    if override_code:
        return _get_account_by_code(db, override_code)
    method_l = (method or "").lower()
    if "cash" in method_l:
        return _get_account_by_code(db, "1000")
    return _get_account_by_code(db, "1100")


def _serialize_account(db: Session, a: Account) -> dict:
    parent = db.get(Account, a.parent_id) if a.parent_id else None
    return {
        "id": a.id,
        "code": a.code,
        "name": a.name,
        "type": a.type,
        "parent_id": a.parent_id,
        "parent_code": parent.code if parent else None,
        "parent_name": parent.name if parent else None,
        "is_system": a.is_system,
        "is_active": a.is_active,
        "balance": _account_balance(db, a.id),
        "created_at": a.created_at,
    }


# ── Chart of accounts ──────────────────────────────────────────────

def list_accounts(db: Session, *, search: str | None = None) -> list[Account]:
    query = select(Account).order_by(Account.code.asc())
    if search:
        pattern = f"%{search.strip()}%"
        query = query.where(or_(Account.code.ilike(pattern), Account.name.ilike(pattern)))
    return list(db.scalars(query).all())


def accounts_with_balances(db: Session, *, search: str | None = None) -> list[dict]:
    return [_serialize_account(db, a) for a in list_accounts(db, search=search)]


def create_account(db: Session, payload: AccountCreate) -> dict:
    if db.scalar(select(Account).where(Account.code == payload.code)):
        raise DuplicateError(f"Account code '{payload.code}' already exists")
    if payload.parent_id is not None:
        _get_account(db, payload.parent_id)
    account = Account(
        code=payload.code,
        name=payload.name,
        type=payload.type,
        parent_id=payload.parent_id,
        is_system=bool(payload.is_system),
        is_active=True,
    )
    db.add(account)
    db.commit()
    db.refresh(account)
    return _serialize_account(db, account)


def update_account(db: Session, account_id: int, payload: AccountUpdate) -> dict:
    account = _get_account(db, account_id)
    data = payload.model_dump(exclude_unset=True)
    if "code" in data:
        conflict = db.scalar(
            select(Account).where(Account.code == data["code"], Account.id != account_id)
        )
        if conflict:
            raise DuplicateError(f"Account code '{data['code']}' already exists")
    if data.get("parent_id") is not None:
        if data["parent_id"] == account_id:
            raise ValidationError("Account cannot be its own parent")
        _get_account(db, data["parent_id"])
    for field, value in data.items():
        setattr(account, field, value)
    db.commit()
    db.refresh(account)
    return _serialize_account(db, account)


def delete_account(db: Session, account_id: int) -> None:
    account = _get_account(db, account_id)
    if db.scalar(select(Account.id).where(Account.parent_id == account_id).limit(1)):
        raise ValidationError("Account has child accounts and cannot be deleted")
    used = db.scalar(
        select(JournalLine.id)
        .where(
            or_(
                JournalLine.debit_account_id == account_id,
                JournalLine.credit_account_id == account_id,
            )
        )
        .limit(1)
    )
    if used is not None:
        raise ValidationError("Account has transactions and cannot be deleted")
    if account.is_system:
        raise ValidationError("System accounts cannot be deleted")
    db.delete(account)
    db.commit()


def get_summary(db: Session) -> AccountingSummary:
    cash = _account_balance(db, _get_account_by_code(db, "1000").id)
    bank = _account_balance(db, _get_account_by_code(db, "1100").id)
    ar = _tree_balance(db, _get_account_by_code(db, "1200").id)
    ap = _tree_balance(db, _get_account_by_code(db, "2000").id)
    revenue = _account_balance(db, _get_account_by_code(db, "4000").id)
    purchases = _account_balance(db, _get_account_by_code(db, "5000").id)
    opex = _account_balance(db, _get_account_by_code(db, "5100").id)
    expenses = round(purchases + opex, 2)
    return AccountingSummary(
        cash_balance=cash,
        bank_balance=bank,
        receivables=ar,
        payables=ap,
        revenue=revenue,
        expenses=expenses,
        net_profit=round(revenue - expenses, 2),
    )


# ── Vendor bills (AP) ──────────────────────────────────────────────

def _bill_to_read(bill: VendorBill) -> dict:
    amount = float(bill.amount)
    paid = float(bill.paid_amount)
    return {
        "id": bill.id,
        "bill_number": bill.bill_number,
        "vendor_id": bill.vendor_id,
        "vendor_name": bill.vendor_name,
        "vendor_account_id": bill.vendor_account_id,
        "purchase_order_id": bill.purchase_order_id,
        "job_order_id": bill.job_order_id,
        "bill_date": bill.bill_date,
        "due_date": bill.due_date,
        "amount": amount,
        "paid_amount": paid,
        "balance": round(amount - paid, 2),
        "description": bill.description,
        "status": bill.status,
        "created_at": bill.created_at,
    }


def list_vendor_bills(db: Session, *, search: str | None = None) -> list[dict]:
    query = select(VendorBill).order_by(VendorBill.id.desc())
    if search:
        pattern = f"%{search.strip()}%"
        query = query.where(
            or_(VendorBill.bill_number.ilike(pattern), VendorBill.vendor_name.ilike(pattern))
        )
    return [_bill_to_read(b) for b in db.scalars(query).all()]


def create_vendor_bill(
    db: Session, payload: VendorBillCreate, *, commit: bool = True
) -> dict:
    if db.scalar(select(VendorBill).where(VendorBill.bill_number == payload.bill_number)):
        raise DuplicateError(f"Bill number '{payload.bill_number}' already exists")

    vendor_name = payload.vendor_name.strip()
    vendor_id = payload.vendor_id
    vendor: Vendor | None = None
    if vendor_id:
        vendor = db.get(Vendor, vendor_id)
        if vendor is None:
            raise ValidationError(f"Vendor {vendor_id} not found")
        vendor_name = vendor.name
    elif vendor_name:
        vendor = db.scalar(select(Vendor).where(Vendor.name == vendor_name))

    if not vendor_name:
        raise ValidationError("Vendor name is required")

    if payload.purchase_order_id:
        po = db.get(PurchaseOrder, payload.purchase_order_id)
        if po is None:
            raise ValidationError(f"Purchase order {payload.purchase_order_id} not found")
        if vendor is None and po.vendor_id:
            vendor = db.get(Vendor, po.vendor_id)

    if payload.job_order_id:
        job = db.get(JobOrder, payload.job_order_id)
        if job is None:
            raise ValidationError(f"Job order {payload.job_order_id} not found")

    if vendor is None:
        raise ValidationError(
            "Select a registered vendor so a payable sub-account can be used"
        )

    vendor_account = ensure_vendor_account(db, vendor)
    purchases = _get_account_by_code(db, "5000")
    amount = round(payload.amount, 2)

    bill = VendorBill(
        bill_number=payload.bill_number,
        vendor_id=vendor.id,
        vendor_name=vendor.name,
        vendor_account_id=vendor_account.id,
        purchase_order_id=payload.purchase_order_id,
        job_order_id=payload.job_order_id,
        bill_date=payload.bill_date,
        due_date=payload.due_date,
        amount=amount,
        paid_amount=0,
        description=payload.description,
        status=DocStatus.POSTED,
    )
    db.add(bill)
    db.flush()

    entry = _post_journal(
        db,
        entry_date=payload.bill_date,
        description=f"Vendor bill {payload.bill_number} — {vendor.name}",
        reference_type="vendor_bill",
        reference_id=bill.id,
        purchase_order_id=payload.purchase_order_id,
        job_order_id=payload.job_order_id,
        pairs=[
            (purchases, vendor_account, amount, "Dr Purchases / Cr Vendor payable"),
        ],
    )
    bill.journal_entry_id = entry.id
    if commit:
        db.commit()
        db.refresh(bill)
    return _bill_to_read(bill)


def create_vendor_bill_from_po(
    db: Session, po_id: int, bill_number: str | None = None, *, commit: bool = True
) -> dict:
    """Manual full-PO bill (prefer receiving-based bills in normal flow)."""
    po = db.get(PurchaseOrder, po_id)
    if po is None:
        raise NotFoundError(f"Purchase order {po_id} not found")
    amount = float(po.total_amount or 0)
    if amount <= 0:
        raise ValidationError("Purchase order total must be greater than 0")
    number = bill_number or f"BILL-{po.po_number}"
    existing = db.scalar(
        select(VendorBill).where(
            VendorBill.bill_number == number,
            VendorBill.status != DocStatus.VOID,
        )
    )
    if existing is not None:
        return _bill_to_read(existing)
    return create_vendor_bill(
        db,
        VendorBillCreate(
            bill_number=number,
            vendor_id=po.vendor_id,
            vendor_name=po.vendor,
            purchase_order_id=po.id,
            bill_date=date.today(),
            amount=amount,
            description=f"From PO {po.po_number}",
        ),
        commit=commit,
    )


def create_vendor_bill_from_receiving(
    db: Session,
    *,
    receiving_id: int,
    receiving_number: str,
    purchase_order: PurchaseOrder,
    receiving_lines: list,
    received_date: date | None = None,
    commit: bool = True,
) -> dict | None:
    """
    Post AP for goods received: Dr Purchases / Cr Vendor payable.
    Bill amount = received_qty × PO rate (per line). Open for Vendor Payments.
    """
    bill_number = f"BILL-{receiving_number}"
    existing = db.scalar(
        select(VendorBill).where(
            VendorBill.bill_number == bill_number,
            VendorBill.status != DocStatus.VOID,
        )
    )
    if existing is not None:
        return _bill_to_read(existing)

    po_lines_by_id = {line.id: line for line in purchase_order.lines}
    amount = 0.0
    for rline in receiving_lines:
        po_line = po_lines_by_id.get(rline.purchase_order_line_id) if rline.purchase_order_line_id else None
        if po_line is None:
            continue
        qty = int(rline.quantity)
        rate = float(po_line.po_rate or 0)
        # received qty × rate (+ GST if set on the PO line)
        line_amt = qty * rate
        gst = float(po_line.gst_percent or 0)
        if gst:
            line_amt *= 1 + gst / 100.0
        amount += line_amt

    amount = round(amount, 2)
    if amount <= 0:
        return None

    return create_vendor_bill(
        db,
        VendorBillCreate(
            bill_number=bill_number,
            vendor_id=purchase_order.vendor_id,
            vendor_name=purchase_order.vendor,
            purchase_order_id=purchase_order.id,
            bill_date=received_date or date.today(),
            amount=amount,
            description=f"Receiving {receiving_number} against PO {purchase_order.po_number}",
        ),
        commit=commit,
    )


def backfill_receiving_vendor_bills(db: Session) -> int:
    """Post missing AP bills for existing PO-linked receivings (idempotent)."""
    from app.modules.purchase.models import Receiving
    from app.modules.vendors.models import Vendor
    from sqlalchemy.orm import selectinload

    receivings = list(
        db.scalars(
            select(Receiving)
            .options(selectinload(Receiving.lines))
            .where(Receiving.purchase_order_id.is_not(None))
        ).all()
    )
    created = 0
    for receiving in receivings:
        po = db.get(PurchaseOrder, receiving.purchase_order_id)
        if po is None:
            continue
        _ = po.lines

        vendor = db.get(Vendor, po.vendor_id) if po.vendor_id else None
        if vendor is None and po.vendor:
            vendor = db.scalar(select(Vendor).where(Vendor.name == po.vendor))
            if vendor is not None:
                po.vendor_id = vendor.id
        if vendor is None:
            continue

        before = db.scalar(
            select(VendorBill.id).where(
                VendorBill.bill_number == f"BILL-{receiving.receiving_number}",
                VendorBill.status != DocStatus.VOID,
            )
        )
        if before is not None:
            continue

        try:
            result = create_vendor_bill_from_receiving(
                db,
                receiving_id=receiving.id,
                receiving_number=receiving.receiving_number,
                purchase_order=po,
                receiving_lines=receiving.lines,
                received_date=receiving.received_date,
                commit=False,
            )
        except (ValidationError, DuplicateError, NotFoundError):
            continue
        if result is not None:
            created += 1
    if created:
        db.commit()
    return created


def delete_vendor_bill(db: Session, bill_id: int) -> None:
    bill = db.get(VendorBill, bill_id)
    if bill is None:
        raise NotFoundError(f"Vendor bill {bill_id} not found")
    if float(bill.paid_amount) > 0:
        raise ValidationError("Cannot delete a bill with payments applied")
    if bill.journal_entry_id:
        entry = db.get(JournalEntry, bill.journal_entry_id)
        if entry:
            entry.status = DocStatus.VOID
    db.delete(bill)
    db.commit()


# ── Customer invoices (AR) ─────────────────────────────────────────

def _invoice_to_read(inv: CustomerInvoice) -> dict:
    amount = float(inv.amount)
    paid = float(inv.paid_amount)
    return {
        "id": inv.id,
        "invoice_number": inv.invoice_number,
        "customer_id": inv.customer_id,
        "customer_name": inv.customer_name,
        "customer_account_id": inv.customer_account_id,
        "job_order_id": inv.job_order_id,
        "purchase_order_id": inv.purchase_order_id,
        "invoice_date": inv.invoice_date,
        "due_date": inv.due_date,
        "amount": amount,
        "paid_amount": paid,
        "balance": round(amount - paid, 2),
        "description": inv.description,
        "status": inv.status,
        "created_at": inv.created_at,
    }


def list_customer_invoices(db: Session, *, search: str | None = None) -> list[dict]:
    query = select(CustomerInvoice).order_by(CustomerInvoice.id.desc())
    if search:
        pattern = f"%{search.strip()}%"
        query = query.where(
            or_(
                CustomerInvoice.invoice_number.ilike(pattern),
                CustomerInvoice.customer_name.ilike(pattern),
            )
        )
    return [_invoice_to_read(i) for i in db.scalars(query).all()]


def create_customer_invoice(
    db: Session, payload: CustomerInvoiceCreate, *, commit: bool = True
) -> dict:
    if db.scalar(
        select(CustomerInvoice).where(CustomerInvoice.invoice_number == payload.invoice_number)
    ):
        raise DuplicateError(f"Invoice number '{payload.invoice_number}' already exists")

    customer: Customer | None = None
    customer_name = (payload.customer_name or "").strip()
    if payload.customer_id:
        customer = db.get(Customer, payload.customer_id)
        if customer is None:
            raise ValidationError(f"Customer {payload.customer_id} not found")
        customer_name = customer.name
    elif customer_name:
        customer = db.scalar(select(Customer).where(Customer.name == customer_name))

    if payload.job_order_id:
        job = db.get(JobOrder, payload.job_order_id)
        if job is None:
            raise ValidationError(f"Job order {payload.job_order_id} not found")
        if not customer_name:
            customer_name = job.customer_name
            customer = db.scalar(select(Customer).where(Customer.name == customer_name))

    if not customer_name:
        raise ValidationError("Customer name is required")
    if customer is None:
        raise ValidationError(
            "Select a registered customer so a receivable sub-account can be used"
        )

    customer_account = ensure_customer_account(db, customer)
    sales = _get_account_by_code(db, "4000")
    amount = round(payload.amount, 2)

    invoice = CustomerInvoice(
        invoice_number=payload.invoice_number,
        customer_id=customer.id,
        customer_name=customer.name,
        customer_account_id=customer_account.id,
        job_order_id=payload.job_order_id,
        purchase_order_id=payload.purchase_order_id,
        invoice_date=payload.invoice_date,
        due_date=payload.due_date,
        amount=amount,
        paid_amount=0,
        description=payload.description,
        status=DocStatus.POSTED,
    )
    db.add(invoice)
    db.flush()

    entry = _post_journal(
        db,
        entry_date=payload.invoice_date,
        description=f"Invoice {payload.invoice_number} — {customer.name}",
        reference_type="customer_invoice",
        reference_id=invoice.id,
        purchase_order_id=payload.purchase_order_id,
        job_order_id=payload.job_order_id,
        pairs=[
            (customer_account, sales, amount, "Dr Customer receivable / Cr Sales"),
        ],
    )
    invoice.journal_entry_id = entry.id
    if commit:
        db.commit()
        db.refresh(invoice)
    return _invoice_to_read(invoice)


def create_customer_invoice_from_job(
    db: Session, job_id: int, invoice_number: str | None = None, *, commit: bool = True
) -> dict:
    job = db.scalar(
        select(JobOrder).options(selectinload(JobOrder.lines)).where(JobOrder.id == job_id)
    )
    if job is None:
        raise NotFoundError(f"Job order {job_id} not found")
    amount = float(job.total_amount or 0)
    if amount <= 0:
        raise ValidationError("Job order total must be greater than 0")
    number = invoice_number or f"INV-{job.job_number}"
    customer = db.scalar(select(Customer).where(Customer.name == job.customer_name))
    return create_customer_invoice(
        db,
        CustomerInvoiceCreate(
            invoice_number=number,
            customer_id=customer.id if customer else None,
            customer_name=job.customer_name,
            job_order_id=job.id,
            invoice_date=date.today(),
            amount=amount,
            description=f"From job {job.job_number}",
        ),
        commit=commit,
    )


def create_customer_invoice_from_dispatch(
    db: Session,
    *,
    dispatch_id: int,
    pass_number: str,
    job: JobOrder,
    dispatch_lines: list,
    commit: bool = True,
) -> dict | None:
    """Post AR for dispatched qty: Dr customer receivable / Cr sales.
    Invoice amount = dispatched_qty × job line rate (per line).
    """
    existing = db.scalar(
        select(CustomerInvoice).where(
            CustomerInvoice.invoice_number == f"INV-{pass_number}",
            CustomerInvoice.status != DocStatus.VOID,
        )
    )
    if existing is not None:
        return _invoice_to_read(existing)

    amount = 0.0
    job_lines_by_id = {line.id: line for line in job.lines}
    for dline in dispatch_lines:
        job_line = job_lines_by_id.get(dline.job_order_line_id)
        if job_line is None:
            continue
        qty = int(dline.quantity)
        rate = float(job_line.rate or 0)
        # dispatched qty × rate (+ GST if set on the job line)
        line_amt = qty * rate
        gst = float(job_line.gst_percent or 0)
        if gst:
            line_amt *= 1 + gst / 100.0
        amount += line_amt

    amount = round(amount, 2)
    if amount <= 0:
        return None

    customer = db.scalar(select(Customer).where(Customer.name == job.customer_name))
    return create_customer_invoice(
        db,
        CustomerInvoiceCreate(
            invoice_number=f"INV-{pass_number}",
            customer_id=customer.id if customer else None,
            customer_name=job.customer_name,
            job_order_id=job.id,
            invoice_date=date.today(),
            amount=amount,
            description=f"Dispatch {pass_number} against job {job.job_number}",
        ),
        commit=commit,
    )


def delete_customer_invoice(db: Session, invoice_id: int) -> None:
    invoice = db.get(CustomerInvoice, invoice_id)
    if invoice is None:
        raise NotFoundError(f"Customer invoice {invoice_id} not found")
    if float(invoice.paid_amount) > 0:
        raise ValidationError("Cannot delete an invoice with receipts applied")
    if invoice.journal_entry_id:
        entry = db.get(JournalEntry, invoice.journal_entry_id)
        if entry:
            entry.status = DocStatus.VOID
    db.delete(invoice)
    db.commit()


# ── Payments / receipts ────────────────────────────────────────────

def list_payments(
    db: Session,
    *,
    search: str | None = None,
    payment_type: PaymentType | None = None,
) -> list[Payment]:
    query = select(Payment).order_by(Payment.id.desc())
    if payment_type is not None:
        query = query.where(Payment.payment_type == payment_type)
    if search:
        pattern = f"%{search.strip()}%"
        query = query.where(
            or_(Payment.reference.ilike(pattern), Payment.party_name.ilike(pattern))
        )
    return list(db.scalars(query).all())


def create_payment(db: Session, payload: PaymentCreate) -> Payment:
    if db.scalar(select(Payment).where(Payment.reference == payload.reference)):
        raise DuplicateError(f"Payment reference '{payload.reference}' already exists")

    amount = round(payload.amount, 2)
    cash_bank = _cash_or_bank(db, payload.method, payload.cash_account_code)
    party = payload.party_name.strip()

    bill: VendorBill | None = None
    invoice: CustomerInvoice | None = None
    po_id: int | None = None
    job_id: int | None = None
    pairs: list[tuple[Account, Account, float, str]]

    if payload.payment_type == PaymentType.PAYMENT:
        if not payload.vendor_bill_id:
            raise ValidationError("Vendor payment requires a vendor bill ID")
        bill = db.get(VendorBill, payload.vendor_bill_id)
        if bill is None:
            raise ValidationError(f"Vendor bill {payload.vendor_bill_id} not found")
        remaining = float(bill.amount) - float(bill.paid_amount)
        if amount > remaining + 0.001:
            raise ValidationError(f"Payment exceeds bill balance ({remaining})")
        party = party or bill.vendor_name
        po_id = bill.purchase_order_id
        job_id = bill.job_order_id
        if bill.vendor_account_id:
            payable_acc = _get_account(db, bill.vendor_account_id)
        elif bill.vendor_id:
            vendor = db.get(Vendor, bill.vendor_id)
            if vendor is None:
                raise ValidationError("Vendor not found for bill")
            payable_acc = ensure_vendor_account(db, vendor)
        else:
            raise ValidationError("Bill has no vendor account")
        # Clear vendor payable, pay from cash/bank
        pairs = [(payable_acc, cash_bank, amount, f"Pay vendor via {payload.method}")]
    else:
        if not payload.customer_invoice_id:
            raise ValidationError("Customer receipt requires a customer invoice ID")
        invoice = db.get(CustomerInvoice, payload.customer_invoice_id)
        if invoice is None:
            raise ValidationError(f"Customer invoice {payload.customer_invoice_id} not found")
        remaining = float(invoice.amount) - float(invoice.paid_amount)
        if amount > remaining + 0.001:
            raise ValidationError(f"Receipt exceeds invoice balance ({remaining})")
        party = party or invoice.customer_name
        po_id = invoice.purchase_order_id
        job_id = invoice.job_order_id
        if invoice.customer_account_id:
            receivable_acc = _get_account(db, invoice.customer_account_id)
        elif invoice.customer_id:
            customer = db.get(Customer, invoice.customer_id)
            if customer is None:
                raise ValidationError("Customer not found for invoice")
            receivable_acc = ensure_customer_account(db, customer)
        else:
            raise ValidationError("Invoice has no customer account")
        pairs = [(cash_bank, receivable_acc, amount, f"Receive via {payload.method}")]

    if not party:
        raise ValidationError("Party name is required")

    payment = Payment(
        reference=payload.reference,
        payment_type=payload.payment_type,
        party_name=party,
        vendor_bill_id=payload.vendor_bill_id,
        customer_invoice_id=payload.customer_invoice_id,
        purchase_order_id=po_id,
        job_order_id=job_id,
        amount=amount,
        method=payload.method,
        payment_date=payload.payment_date,
        notes=payload.notes,
        status=DocStatus.POSTED,
    )
    db.add(payment)
    db.flush()

    entry = _post_journal(
        db,
        entry_date=payload.payment_date,
        description=f"{payload.payment_type.value} {payload.reference} — {party}",
        reference_type="payment",
        reference_id=payment.id,
        purchase_order_id=po_id,
        job_order_id=job_id,
        pairs=pairs,
    )
    payment.journal_entry_id = entry.id

    if bill is not None:
        bill.paid_amount = round(float(bill.paid_amount) + amount, 2)
    if invoice is not None:
        invoice.paid_amount = round(float(invoice.paid_amount) + amount, 2)

    db.commit()
    db.refresh(payment)
    return payment


def delete_payment(db: Session, payment_id: int) -> None:
    payment = db.get(Payment, payment_id)
    if payment is None:
        raise NotFoundError(f"Payment {payment_id} not found")
    amount = float(payment.amount)
    if payment.vendor_bill_id:
        bill = db.get(VendorBill, payment.vendor_bill_id)
        if bill:
            bill.paid_amount = max(0.0, round(float(bill.paid_amount) - amount, 2))
    if payment.customer_invoice_id:
        invoice = db.get(CustomerInvoice, payment.customer_invoice_id)
        if invoice:
            invoice.paid_amount = max(0.0, round(float(invoice.paid_amount) - amount, 2))
    if payment.journal_entry_id:
        entry = db.get(JournalEntry, payment.journal_entry_id)
        if entry:
            entry.status = DocStatus.VOID
    db.delete(payment)
    db.commit()


# ── Expenses ───────────────────────────────────────────────────────

def list_expenses(db: Session, *, search: str | None = None) -> list[Expense]:
    query = select(Expense).order_by(Expense.id.desc())
    if search:
        pattern = f"%{search.strip()}%"
        query = query.where(
            or_(
                Expense.expense_number.ilike(pattern),
                Expense.title.ilike(pattern),
                Expense.paid_to.ilike(pattern),
            )
        )
    return list(db.scalars(query).all())


def create_expense(db: Session, payload: ExpenseCreate) -> Expense:
    if db.scalar(select(Expense).where(Expense.expense_number == payload.expense_number)):
        raise DuplicateError(f"Expense number '{payload.expense_number}' already exists")

    if payload.job_order_id:
        job = db.get(JobOrder, payload.job_order_id)
        if job is None:
            raise ValidationError(f"Job order {payload.job_order_id} not found")

    debit = (
        _get_account(db, payload.debit_account_id)
        if payload.debit_account_id
        else _get_account_by_code(db, "5100")
    )
    credit = (
        _get_account(db, payload.credit_account_id)
        if payload.credit_account_id
        else _cash_or_bank(db, payload.payment_method)
    )
    amount = round(payload.amount, 2)
    paid_to = (payload.paid_to or "").strip() or debit.name
    payment_method = (payload.payment_method or "").strip() or f"{credit.code} {credit.name}"

    expense = Expense(
        expense_number=payload.expense_number,
        title=payload.title,
        category=payload.category,
        paid_to=paid_to,
        amount=amount,
        expense_date=payload.expense_date,
        payment_method=payment_method,
        debit_account_id=debit.id,
        credit_account_id=credit.id,
        job_order_id=payload.job_order_id,
        purchase_order_id=getattr(payload, "purchase_order_id", None),
        notes=payload.notes,
        status=DocStatus.POSTED,
    )
    db.add(expense)
    db.flush()

    entry = _post_journal(
        db,
        entry_date=payload.expense_date,
        description=f"Expense {payload.expense_number} — {payload.title}",
        reference_type="expense",
        reference_id=expense.id,
        purchase_order_id=getattr(payload, "purchase_order_id", None),
        job_order_id=payload.job_order_id,
        pairs=[
            (debit, credit, amount, f"{payload.title} via {credit.name}"),
        ],
    )
    expense.journal_entry_id = entry.id
    db.commit()
    db.refresh(expense)
    return expense


def delete_expense(db: Session, expense_id: int) -> None:
    expense = db.get(Expense, expense_id)
    if expense is None:
        raise NotFoundError(f"Expense {expense_id} not found")
    if expense.journal_entry_id:
        entry = db.get(JournalEntry, expense.journal_entry_id)
        if entry:
            entry.status = DocStatus.VOID
    db.delete(expense)
    db.commit()


# ── Job costing ────────────────────────────────────────────────────

def list_job_costing(db: Session) -> list[JobCostingRow]:
    jobs = list(db.scalars(select(JobOrder).order_by(JobOrder.id.desc())).all())
    rows: list[JobCostingRow] = []
    for job in jobs:
        revenue = float(
            db.scalar(
                select(func.coalesce(func.sum(CustomerInvoice.amount), 0)).where(
                    CustomerInvoice.job_order_id == job.id,
                    CustomerInvoice.status == DocStatus.POSTED,
                )
            )
            or 0
        )
        bill_costs = float(
            db.scalar(
                select(func.coalesce(func.sum(VendorBill.amount), 0)).where(
                    VendorBill.job_order_id == job.id,
                    VendorBill.status == DocStatus.POSTED,
                )
            )
            or 0
        )
        exp_costs = float(
            db.scalar(
                select(func.coalesce(func.sum(Expense.amount), 0)).where(
                    Expense.job_order_id == job.id,
                    Expense.status == DocStatus.POSTED,
                )
            )
            or 0
        )
        total_cost = round(bill_costs + exp_costs, 2)
        margin = round(revenue - total_cost, 2)
        margin_pct = round((margin / revenue) * 100, 2) if revenue else 0.0
        rows.append(
            JobCostingRow(
                job_order_id=job.id,
                job_number=job.job_number,
                customer_name=job.customer_name,
                status=job.status.value if hasattr(job.status, "value") else str(job.status),
                revenue=revenue,
                costs=bill_costs,
                expenses=exp_costs,
                total_cost=total_cost,
                margin=margin,
                margin_percent=margin_pct,
            )
        )
    return rows
