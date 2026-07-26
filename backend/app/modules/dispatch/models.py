import enum
from datetime import date, datetime

from sqlalchemy import Date, DateTime, Enum, ForeignKey, Integer, String, Text, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database.base import Base


class DispatchStatus(str, enum.Enum):
    DISPATCHED = "Dispatched"
    CANCELLED = "Cancelled"


class Dispatch(Base):
    """Gate pass / dispatch against a Job Order (partial qty allowed)."""

    __tablename__ = "dispatches"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    pass_number: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    job_order_id: Mapped[int] = mapped_column(
        ForeignKey("job_orders.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    job_number: Mapped[str] = mapped_column(String(100), nullable=False, default="", index=True)
    customer_name: Mapped[str] = mapped_column(String(255), nullable=False, default="", index=True)
    dispatch_date: Mapped[date] = mapped_column(Date, nullable=False)
    vehicle_no: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    driver: Mapped[str] = mapped_column(String(150), nullable=False, default="")
    notes: Mapped[str] = mapped_column(Text, nullable=False, default="")
    created_by: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    status: Mapped[DispatchStatus] = mapped_column(
        Enum(DispatchStatus),
        nullable=False,
        default=DispatchStatus.DISPATCHED,
        index=True,
    )
    created_at: Mapped[datetime] = mapped_column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
    )

    lines: Mapped[list["DispatchLine"]] = relationship(
        back_populates="dispatch",
        cascade="all, delete-orphan",
        order_by="DispatchLine.id",
    )


class DispatchLine(Base):
    __tablename__ = "dispatch_lines"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    dispatch_id: Mapped[int] = mapped_column(
        ForeignKey("dispatches.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    job_order_line_id: Mapped[int] = mapped_column(
        ForeignKey("job_order_lines.id", ondelete="RESTRICT"),
        nullable=False,
        index=True,
    )
    item_id: Mapped[int | None] = mapped_column(ForeignKey("items.id"), nullable=True, index=True)
    item_name: Mapped[str] = mapped_column(String(255), nullable=False, default="")
    unit: Mapped[str] = mapped_column(String(50), nullable=False, default="")
    quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)

    dispatch: Mapped["Dispatch"] = relationship(back_populates="lines")
