from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, model_validator


class AccountType(str, Enum):
    ASSET = "Asset"
    LIABILITY = "Liability"
    EQUITY = "Equity"
    INCOME = "Income"
    EXPENSE = "Expense"


class DocStatus(str, Enum):
    DRAFT = "Draft"
    POSTED = "Posted"
    VOID = "Void"


class PaymentType(str, Enum):
    PAYMENT = "Payment"
    RECEIPT = "Receipt"


# ── Chart of accounts ──────────────────────────────────────────────

class AccountCreate(BaseModel):
    code: str = Field(..., min_length=1, max_length=50)
    name: str = Field(..., min_length=1, max_length=255)
    type: AccountType | None = None
    parent_id: int | None = None
    is_system: bool = False


class AccountUpdate(BaseModel):
    code: str | None = Field(default=None, min_length=1, max_length=50)
    name: str | None = Field(default=None, min_length=1, max_length=255)
    type: AccountType | None = None
    parent_id: int | None = None
    is_system: bool | None = None
    is_active: bool | None = None


class AccountRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    code: str
    name: str
    type: AccountType | None = None
    parent_id: int | None = None
    parent_code: str | None = None
    parent_name: str | None = None
    is_system: bool
    is_active: bool
    balance: float = 0
    created_at: datetime


# ── Vendor bills (AP) ──────────────────────────────────────────────

class VendorBillCreate(BaseModel):
    bill_number: str = Field(..., min_length=1, max_length=100)
    vendor_id: int | None = None
    vendor_name: str = Field(default="", max_length=255)
    purchase_order_id: int | None = None
    job_order_id: int | None = None
    bill_date: date
    due_date: date | None = None
    amount: float = Field(..., gt=0)
    description: str = ""


class VendorBillRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    bill_number: str
    vendor_id: int | None
    vendor_name: str
    vendor_account_id: int | None = None
    purchase_order_id: int | None
    job_order_id: int | None
    bill_date: date
    due_date: date | None
    amount: float
    paid_amount: float
    balance: float = 0
    description: str
    status: DocStatus
    created_at: datetime


# ── Customer invoices (AR) ─────────────────────────────────────────

class CustomerInvoiceCreate(BaseModel):
    invoice_number: str = Field(..., min_length=1, max_length=100)
    customer_id: int | None = None
    customer_name: str = Field(default="", max_length=255)
    job_order_id: int | None = None
    purchase_order_id: int | None = None
    invoice_date: date
    due_date: date | None = None
    amount: float = Field(..., gt=0)
    description: str = ""


class CustomerInvoiceRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    invoice_number: str
    customer_id: int | None = None
    customer_name: str
    customer_account_id: int | None = None
    job_order_id: int | None
    purchase_order_id: int | None = None
    invoice_date: date
    due_date: date | None
    amount: float
    paid_amount: float
    balance: float = 0
    description: str
    status: DocStatus
    created_at: datetime


# ── Payments / receipts ────────────────────────────────────────────

class PaymentCreate(BaseModel):
    reference: str = Field(..., min_length=1, max_length=100)
    payment_type: PaymentType
    party_name: str = Field(default="", max_length=255)
    vendor_bill_id: int | None = None
    customer_invoice_id: int | None = None
    amount: float = Field(..., gt=0)
    method: str = Field(default="Cash", max_length=50)
    payment_date: date
    notes: str = ""
    # Cash vs Bank credit/debit account — defaults applied in service
    cash_account_code: str | None = None

    @model_validator(mode="after")
    def validate_link(self) -> "PaymentCreate":
        if self.payment_type == PaymentType.PAYMENT and self.customer_invoice_id:
            raise ValueError("Vendor payment cannot link to a customer invoice")
        if self.payment_type == PaymentType.RECEIPT and self.vendor_bill_id:
            raise ValueError("Customer receipt cannot link to a vendor bill")
        return self


class PaymentRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    reference: str
    payment_type: PaymentType
    party_name: str
    vendor_bill_id: int | None
    customer_invoice_id: int | None
    amount: float
    method: str
    payment_date: date
    notes: str
    status: DocStatus
    created_at: datetime


# ── Expenses ───────────────────────────────────────────────────────

class ExpenseCreate(BaseModel):
    expense_number: str = Field(..., min_length=1, max_length=100)
    title: str = Field(..., min_length=1, max_length=255)
    category: str = Field(default="Other", max_length=100)
    paid_to: str = Field(default="", max_length=255)
    amount: float = Field(..., gt=0)
    expense_date: date
    payment_method: str = Field(default="Cash", max_length=50)
    debit_account_id: int | None = None
    credit_account_id: int | None = None
    job_order_id: int | None = None
    purchase_order_id: int | None = None
    notes: str = ""


class ExpenseRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    expense_number: str
    title: str
    category: str
    paid_to: str
    amount: float
    expense_date: date
    payment_method: str
    debit_account_id: int
    credit_account_id: int
    job_order_id: int | None
    purchase_order_id: int | None = None
    notes: str
    status: DocStatus
    created_at: datetime


# ── Summaries ──────────────────────────────────────────────────────

class AccountingSummary(BaseModel):
    cash_balance: float
    bank_balance: float
    receivables: float
    payables: float
    revenue: float
    expenses: float
    net_profit: float


class JobCostingRow(BaseModel):
    job_order_id: int
    job_number: str
    customer_name: str
    status: str
    revenue: float
    costs: float
    expenses: float
    total_cost: float
    margin: float
    margin_percent: float


class LedgerLine(BaseModel):
    date: date
    entry_number: str
    description: str
    memo: str = ""
    reference_type: str = ""
    reference_id: int | None = None
    purchase_order_id: int | None = None
    job_order_id: int | None = None
    contra_account: str = ""
    debit: float
    credit: float
    balance: float
