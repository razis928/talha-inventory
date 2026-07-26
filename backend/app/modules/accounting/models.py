from datetime import date, datetime
import enum

from sqlalchemy import Boolean, Date, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class AccountType(str, enum.Enum):
    ASSET = "Asset"
    LIABILITY = "Liability"
    EQUITY = "Equity"
    INCOME = "Income"
    EXPENSE = "Expense"


class DocStatus(str, enum.Enum):
    DRAFT = "Draft"
    POSTED = "Posted"
    VOID = "Void"


class PaymentType(str, enum.Enum):
    PAYMENT = "Payment"  # to vendor (AP)
    RECEIPT = "Receipt"  # from customer (AR)


class Account(Base):
    __tablename__ = "accounts"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    code: Mapped[str] = mapped_column(String(50), nullable=False, unique=True, index=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    type: Mapped[AccountType | None] = mapped_column(Enum(AccountType), nullable=True, index=True)
    parent_id: Mapped[int | None] = mapped_column(
        ForeignKey("accounts.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    is_system: Mapped[bool] = mapped_column(Boolean, nullable=False, default=False)
    is_active: Mapped[bool] = mapped_column(Boolean, nullable=False, default=True)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    parent: Mapped["Account | None"] = relationship(
        remote_side="Account.id",
        back_populates="children",
        foreign_keys=[parent_id],
    )
    children: Mapped[list["Account"]] = relationship(
        back_populates="parent",
        foreign_keys=[parent_id],
    )


class JournalEntry(Base):
    __tablename__ = "journal_entries"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    entry_number: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    entry_date: Mapped[date] = mapped_column(Date, nullable=False, index=True)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    reference_type: Mapped[str] = mapped_column(String(50), nullable=False, default="")
    reference_id: Mapped[int | None] = mapped_column(Integer, nullable=True)
    purchase_order_id: Mapped[int | None] = mapped_column(
        ForeignKey("purchase_orders.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    job_order_id: Mapped[int | None] = mapped_column(
        ForeignKey("job_orders.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    status: Mapped[DocStatus] = mapped_column(
        Enum(DocStatus), nullable=False, default=DocStatus.POSTED, index=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )

    lines: Mapped[list["JournalLine"]] = relationship(
        back_populates="journal_entry",
        cascade="all, delete-orphan",
        order_by="JournalLine.id",
    )


class JournalLine(Base):
    """
    Each line is a debit/credit pair for clear audit:
    debit_account_id / debit_amount and credit_account_id / credit_amount.
    """

    __tablename__ = "journal_lines"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    journal_entry_id: Mapped[int] = mapped_column(
        ForeignKey("journal_entries.id", ondelete="CASCADE"), nullable=False, index=True
    )
    debit_account_id: Mapped[int] = mapped_column(
        ForeignKey("accounts.id"), nullable=False, index=True
    )
    credit_account_id: Mapped[int] = mapped_column(
        ForeignKey("accounts.id"), nullable=False, index=True
    )
    debit_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    credit_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    purchase_order_id: Mapped[int | None] = mapped_column(
        ForeignKey("purchase_orders.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    job_order_id: Mapped[int | None] = mapped_column(
        ForeignKey("job_orders.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    memo: Mapped[str] = mapped_column(String(255), nullable=False, default="")

    journal_entry: Mapped["JournalEntry"] = relationship(back_populates="lines")
    debit_account: Mapped["Account"] = relationship(foreign_keys=[debit_account_id])
    credit_account: Mapped["Account"] = relationship(foreign_keys=[credit_account_id])


class VendorBill(Base):
    """Accounts Payable document — linked to vendor account, optional PO / job."""

    __tablename__ = "vendor_bills"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    bill_number: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    vendor_id: Mapped[int | None] = mapped_column(ForeignKey("vendors.id"), nullable=True, index=True)
    vendor_name: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    vendor_account_id: Mapped[int | None] = mapped_column(
        ForeignKey("accounts.id"), nullable=True, index=True
    )
    purchase_order_id: Mapped[int | None] = mapped_column(
        ForeignKey("purchase_orders.id", ondelete="SET NULL"), nullable=True, index=True
    )
    job_order_id: Mapped[int | None] = mapped_column(
        ForeignKey("job_orders.id", ondelete="SET NULL"), nullable=True, index=True
    )
    bill_date: Mapped[date] = mapped_column(Date, nullable=False)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    paid_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    status: Mapped[DocStatus] = mapped_column(
        Enum(DocStatus), nullable=False, default=DocStatus.POSTED, index=True
    )
    journal_entry_id: Mapped[int | None] = mapped_column(
        ForeignKey("journal_entries.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class CustomerInvoice(Base):
    """Accounts Receivable document — linked to customer account, optional job."""

    __tablename__ = "customer_invoices"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    invoice_number: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    customer_id: Mapped[int | None] = mapped_column(
        ForeignKey("customers.id"), nullable=True, index=True
    )
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    customer_account_id: Mapped[int | None] = mapped_column(
        ForeignKey("accounts.id"), nullable=True, index=True
    )
    job_order_id: Mapped[int | None] = mapped_column(
        ForeignKey("job_orders.id", ondelete="SET NULL"), nullable=True, index=True
    )
    purchase_order_id: Mapped[int | None] = mapped_column(
        ForeignKey("purchase_orders.id", ondelete="SET NULL"), nullable=True, index=True
    )
    invoice_date: Mapped[date] = mapped_column(Date, nullable=False)
    due_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    paid_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    description: Mapped[str] = mapped_column(Text, nullable=False, default="")
    status: Mapped[DocStatus] = mapped_column(
        Enum(DocStatus), nullable=False, default=DocStatus.POSTED, index=True
    )
    journal_entry_id: Mapped[int | None] = mapped_column(
        ForeignKey("journal_entries.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class Payment(Base):
    """Vendor payment (AP) or customer receipt (AR)."""

    __tablename__ = "payments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    reference: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    payment_type: Mapped[PaymentType] = mapped_column(Enum(PaymentType), nullable=False, index=True)
    party_name: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    vendor_bill_id: Mapped[int | None] = mapped_column(
        ForeignKey("vendor_bills.id", ondelete="SET NULL"), nullable=True, index=True
    )
    customer_invoice_id: Mapped[int | None] = mapped_column(
        ForeignKey("customer_invoices.id", ondelete="SET NULL"), nullable=True, index=True
    )
    purchase_order_id: Mapped[int | None] = mapped_column(
        ForeignKey("purchase_orders.id", ondelete="SET NULL"), nullable=True, index=True
    )
    job_order_id: Mapped[int | None] = mapped_column(
        ForeignKey("job_orders.id", ondelete="SET NULL"), nullable=True, index=True
    )
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    method: Mapped[str] = mapped_column(String(50), nullable=False, default="Cash")
    payment_date: Mapped[date] = mapped_column(Date, nullable=False)
    notes: Mapped[str] = mapped_column(Text, nullable=False, default="")
    status: Mapped[DocStatus] = mapped_column(
        Enum(DocStatus), nullable=False, default=DocStatus.POSTED, index=True
    )
    journal_entry_id: Mapped[int | None] = mapped_column(
        ForeignKey("journal_entries.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )


class Expense(Base):
    """Simple debit/credit expense voucher; optional job / PO for costing."""

    __tablename__ = "expenses"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    expense_number: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    title: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    category: Mapped[str] = mapped_column(String(100), nullable=False, default="Other")
    paid_to: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    expense_date: Mapped[date] = mapped_column(Date, nullable=False)
    payment_method: Mapped[str] = mapped_column(String(50), nullable=False, default="Cash")
    debit_account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), nullable=False)
    credit_account_id: Mapped[int] = mapped_column(ForeignKey("accounts.id"), nullable=False)
    job_order_id: Mapped[int | None] = mapped_column(
        ForeignKey("job_orders.id", ondelete="SET NULL"), nullable=True, index=True
    )
    purchase_order_id: Mapped[int | None] = mapped_column(
        ForeignKey("purchase_orders.id", ondelete="SET NULL"), nullable=True, index=True
    )
    notes: Mapped[str] = mapped_column(Text, nullable=False, default="")
    status: Mapped[DocStatus] = mapped_column(
        Enum(DocStatus), nullable=False, default=DocStatus.POSTED, index=True
    )
    journal_entry_id: Mapped[int | None] = mapped_column(
        ForeignKey("journal_entries.id"), nullable=True
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True), server_default=func.now(), nullable=False
    )
