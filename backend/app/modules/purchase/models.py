import enum
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class PurchaseOrderStatus(str, enum.Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    PARTIAL = "Partial"
    RECEIVED = "Received"
    CANCELLED = "Cancelled"


class PurchaseOrder(Base):
    __tablename__ = "purchase_orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    po_number: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    vendor_id: Mapped[int | None] = mapped_column(
        ForeignKey("vendors.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    vendor: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    required_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    # Legacy column kept for older SQLite DBs
    delivery_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    payment_terms: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    remarks: Mapped[str] = mapped_column(Text, nullable=False, default="")
    notes: Mapped[str] = mapped_column(Text, nullable=False, default="")
    tax_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    status: Mapped[PurchaseOrderStatus] = mapped_column(
        Enum(PurchaseOrderStatus),
        nullable=False,
        default=PurchaseOrderStatus.PENDING,
        index=True,
    )
    created_by: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )
    updated_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        onupdate=func.now(),
        nullable=False,
    )

    lines: Mapped[list["PurchaseOrderLine"]] = relationship(
        back_populates="purchase_order",
        cascade="all, delete-orphan",
        order_by="PurchaseOrderLine.id",
    )
    receivings: Mapped[list["Receiving"]] = relationship(back_populates="purchase_order")


class PurchaseOrderLine(Base):
    __tablename__ = "purchase_order_lines"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    purchase_order_id: Mapped[int] = mapped_column(
        ForeignKey("purchase_orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    item_id: Mapped[int] = mapped_column(ForeignKey("items.id"), nullable=False, index=True)
    item_name: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    gsm: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    size: Mapped[str] = mapped_column(String(50), nullable=False, default="")
    unit: Mapped[str] = mapped_column(String(50), nullable=False, default="")
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    received_quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    po_rate: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    # Legacy column kept for older SQLite DBs
    unit_price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    gst_percent: Mapped[float] = mapped_column(Numeric(8, 2), nullable=False, default=0)
    gross_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    line_total: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)

    purchase_order: Mapped["PurchaseOrder"] = relationship(back_populates="lines")


class Receiving(Base):
    __tablename__ = "receivings"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    receiving_number: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    purchase_order_id: Mapped[int | None] = mapped_column(
        ForeignKey("purchase_orders.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    vendor_id: Mapped[int | None] = mapped_column(
        ForeignKey("vendors.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    vendor: Mapped[str] = mapped_column(String(255), nullable=False, default="", index=True)
    received_date: Mapped[date] = mapped_column(Date, nullable=False)
    notes: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_by: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    purchase_order: Mapped["PurchaseOrder | None"] = relationship(back_populates="receivings")
    lines: Mapped[list["ReceivingLine"]] = relationship(
        back_populates="receiving",
        cascade="all, delete-orphan",
        order_by="ReceivingLine.id",
    )


class ReceivingLine(Base):
    __tablename__ = "receiving_lines"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    receiving_id: Mapped[int] = mapped_column(
        ForeignKey("receivings.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    purchase_order_line_id: Mapped[int | None] = mapped_column(
        ForeignKey("purchase_order_lines.id", ondelete="SET NULL"),
        nullable=True,
        index=True,
    )
    item_id: Mapped[int] = mapped_column(ForeignKey("items.id"), nullable=False, index=True)
    item_name: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    unit: Mapped[str] = mapped_column(String(50), nullable=False, default="")
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    receiving: Mapped["Receiving"] = relationship(back_populates="lines")
