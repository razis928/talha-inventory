from datetime import date

from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.modules.accounting import service
from app.modules.accounting.schemas import (
    AccountCreate,
    AccountRead,
    AccountUpdate,
    AccountingSummary,
    CustomerInvoiceCreate,
    CustomerInvoiceRead,
    ExpenseCreate,
    ExpenseRead,
    JobCostingRow,
    LedgerLine,
    PaymentCreate,
    PaymentRead,
    VendorBillCreate,
    VendorBillRead,
)

router = APIRouter(prefix="/accounting", tags=["accounting"])


def _http(exc: Exception) -> HTTPException:
    if isinstance(exc, service.NotFoundError):
        return HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc))
    if isinstance(exc, service.DuplicateError):
        return HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc))
    if isinstance(exc, service.ValidationError):
        return HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc))
    return HTTPException(status_code=status.HTTP_500_INTERNAL_SERVER_ERROR, detail=str(exc))


@router.get("/accounts", response_model=list[AccountRead])
def list_accounts(
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[AccountRead]:
    return service.accounts_with_balances(db, search=search)


@router.post("/accounts", response_model=AccountRead, status_code=status.HTTP_201_CREATED)
def create_account(payload: AccountCreate, db: Session = Depends(get_db)) -> AccountRead:
    try:
        return service.create_account(db, payload)
    except (service.DuplicateError, service.ValidationError) as exc:
        raise _http(exc) from exc


@router.put("/accounts/{account_id}", response_model=AccountRead)
def update_account(
    account_id: int, payload: AccountUpdate, db: Session = Depends(get_db)
) -> AccountRead:
    try:
        return service.update_account(db, account_id, payload)
    except (service.NotFoundError, service.DuplicateError, service.ValidationError) as exc:
        raise _http(exc) from exc


@router.delete("/accounts/{account_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_account(account_id: int, db: Session = Depends(get_db)) -> None:
    try:
        service.delete_account(db, account_id)
    except (service.NotFoundError, service.ValidationError) as exc:
        raise _http(exc) from exc


@router.get("/accounts/{account_id}/ledger", response_model=list[LedgerLine])
def account_ledger(
    account_id: int,
    date_from: date | None = Query(default=None, alias="from"),
    date_to: date | None = Query(default=None, alias="to"),
    db: Session = Depends(get_db),
) -> list[LedgerLine]:
    try:
        return service.get_account_ledger(
            db, account_id, date_from=date_from, date_to=date_to
        )
    except service.NotFoundError as exc:
        raise _http(exc) from exc


@router.get("/summary", response_model=AccountingSummary)
def accounting_summary(db: Session = Depends(get_db)) -> AccountingSummary:
    try:
        return service.get_summary(db)
    except service.ValidationError as exc:
        raise _http(exc) from exc


@router.get("/job-costing", response_model=list[JobCostingRow])
def job_costing(db: Session = Depends(get_db)) -> list[JobCostingRow]:
    return service.list_job_costing(db)


@router.get("/vendor-bills", response_model=list[VendorBillRead])
def list_vendor_bills(
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[VendorBillRead]:
    return service.list_vendor_bills(db, search=search)


@router.post("/vendor-bills", response_model=VendorBillRead, status_code=status.HTTP_201_CREATED)
def create_vendor_bill(payload: VendorBillCreate, db: Session = Depends(get_db)) -> VendorBillRead:
    try:
        return service.create_vendor_bill(db, payload)
    except (service.DuplicateError, service.ValidationError) as exc:
        raise _http(exc) from exc


@router.post(
    "/vendor-bills/from-po/{po_id}",
    response_model=VendorBillRead,
    status_code=status.HTTP_201_CREATED,
)
def create_vendor_bill_from_po(
    po_id: int,
    bill_number: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> VendorBillRead:
    try:
        return service.create_vendor_bill_from_po(db, po_id, bill_number)
    except (service.NotFoundError, service.DuplicateError, service.ValidationError) as exc:
        raise _http(exc) from exc


@router.delete("/vendor-bills/{bill_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_vendor_bill(bill_id: int, db: Session = Depends(get_db)) -> None:
    try:
        service.delete_vendor_bill(db, bill_id)
    except (service.NotFoundError, service.ValidationError) as exc:
        raise _http(exc) from exc


@router.get("/customer-invoices", response_model=list[CustomerInvoiceRead])
def list_customer_invoices(
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[CustomerInvoiceRead]:
    return service.list_customer_invoices(db, search=search)


@router.post(
    "/customer-invoices",
    response_model=CustomerInvoiceRead,
    status_code=status.HTTP_201_CREATED,
)
def create_customer_invoice(
    payload: CustomerInvoiceCreate, db: Session = Depends(get_db)
) -> CustomerInvoiceRead:
    try:
        return service.create_customer_invoice(db, payload)
    except (service.DuplicateError, service.ValidationError) as exc:
        raise _http(exc) from exc


@router.post(
    "/customer-invoices/from-job/{job_id}",
    response_model=CustomerInvoiceRead,
    status_code=status.HTTP_201_CREATED,
)
def create_customer_invoice_from_job(
    job_id: int,
    invoice_number: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> CustomerInvoiceRead:
    try:
        return service.create_customer_invoice_from_job(db, job_id, invoice_number)
    except (service.NotFoundError, service.DuplicateError, service.ValidationError) as exc:
        raise _http(exc) from exc


@router.delete("/customer-invoices/{invoice_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_customer_invoice(invoice_id: int, db: Session = Depends(get_db)) -> None:
    try:
        service.delete_customer_invoice(db, invoice_id)
    except (service.NotFoundError, service.ValidationError) as exc:
        raise _http(exc) from exc


@router.get("/payments", response_model=list[PaymentRead])
def list_payments(
    search: str | None = Query(default=None),
    payment_type: str | None = Query(default=None, description="Payment or Receipt"),
    db: Session = Depends(get_db),
) -> list[PaymentRead]:
    from app.modules.accounting.models import PaymentType

    pt: PaymentType | None = None
    if payment_type:
        try:
            pt = PaymentType(payment_type)
        except ValueError as exc:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="payment_type must be 'Payment' or 'Receipt'",
            ) from exc
    return service.list_payments(db, search=search, payment_type=pt)


@router.post("/payments", response_model=PaymentRead, status_code=status.HTTP_201_CREATED)
def create_payment(payload: PaymentCreate, db: Session = Depends(get_db)) -> PaymentRead:
    try:
        return service.create_payment(db, payload)
    except (service.DuplicateError, service.ValidationError) as exc:
        raise _http(exc) from exc


@router.delete("/payments/{payment_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_payment(payment_id: int, db: Session = Depends(get_db)) -> None:
    try:
        service.delete_payment(db, payment_id)
    except (service.NotFoundError, service.ValidationError) as exc:
        raise _http(exc) from exc


@router.get("/expenses", response_model=list[ExpenseRead])
def list_expenses(
    search: str | None = Query(default=None),
    db: Session = Depends(get_db),
) -> list[ExpenseRead]:
    return service.list_expenses(db, search=search)


@router.post("/expenses", response_model=ExpenseRead, status_code=status.HTTP_201_CREATED)
def create_expense(payload: ExpenseCreate, db: Session = Depends(get_db)) -> ExpenseRead:
    try:
        return service.create_expense(db, payload)
    except (service.DuplicateError, service.ValidationError) as exc:
        raise _http(exc) from exc


@router.delete("/expenses/{expense_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_expense(expense_id: int, db: Session = Depends(get_db)) -> None:
    try:
        service.delete_expense(db, expense_id)
    except (service.NotFoundError, service.ValidationError) as exc:
        raise _http(exc) from exc
