import enum
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, Numeric, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class JobOrderStatus(str, enum.Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"


class JobOrder(Base):
    __tablename__ = "job_orders"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    job_number: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    required_date: Mapped[date | None] = mapped_column(Date, nullable=True)
    payment_terms: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    remarks: Mapped[str] = mapped_column(Text, nullable=False, default="")
    pi_number: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    freight_charges: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    currency: Mapped[str] = mapped_column(String(20), nullable=False, default="PKR")
    tax_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    total_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    status: Mapped[JobOrderStatus] = mapped_column(
        Enum(JobOrderStatus),
        nullable=False,
        default=JobOrderStatus.PENDING,
        index=True,
    )
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

    lines: Mapped[list["JobOrderLine"]] = relationship(
        back_populates="job_order",
        cascade="all, delete-orphan",
        order_by="JobOrderLine.id",
    )
    consumed_items: Mapped[list["JobConsumedItem"]] = relationship(
        back_populates="job_order",
        cascade="all, delete-orphan",
        order_by="JobConsumedItem.id",
    )


class JobOrderLine(Base):
    __tablename__ = "job_order_lines"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    job_order_id: Mapped[int] = mapped_column(
        ForeignKey("job_orders.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    item_id: Mapped[int | None] = mapped_column(ForeignKey("items.id"), nullable=True, index=True)
    item_name: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    unit: Mapped[str] = mapped_column(String(50), nullable=False, default="")
    quality: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    colour: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    size: Mapped[str] = mapped_column(String(50), nullable=False, default="")
    order_quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    order_pending_quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    remarks: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    rate: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    gst_percent: Mapped[float] = mapped_column(Numeric(8, 2), nullable=False, default=0)
    gross_amount: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    line_total: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)

    job_order: Mapped["JobOrder"] = relationship(back_populates="lines")


class JobConsumedItem(Base):
    """Raw material issued / consumed against a job order."""

    __tablename__ = "job_consumed_items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    job_order_id: Mapped[int] = mapped_column(
        ForeignKey("job_orders.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    item_id: Mapped[int] = mapped_column(ForeignKey("items.id"), nullable=False, index=True)
    item_name: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    unit: Mapped[str] = mapped_column(String(50), nullable=False, default="")
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    consumed_date: Mapped[date] = mapped_column(Date, nullable=False)
    notes: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    job_order: Mapped["JobOrder"] = relationship(back_populates="consumed_items")
