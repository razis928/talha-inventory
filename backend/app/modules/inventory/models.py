import enum
from datetime import datetime

from sqlalchemy import DateTime, Enum, Integer, Numeric, String, func
from sqlalchemy.orm import Mapped, mapped_column

from app.database.base import Base


class ItemType(str, enum.Enum):
    RAW = "Raw"
    FINISHED = "Finished"


class Item(Base):
    __tablename__ = "items"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False, index=True)
    sku: Mapped[str] = mapped_column(String(100), nullable=False, unique=True, index=True)
    type: Mapped[ItemType] = mapped_column(Enum(ItemType), nullable=False, index=True)
    category: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    cost_price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    selling_price: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    stock_quantity: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    min_stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    max_stock: Mapped[int] = mapped_column(Integer, nullable=False, default=0)
    gsm: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    size: Mapped[float] = mapped_column(Numeric(12, 2), nullable=False, default=0)
    unit: Mapped[str] = mapped_column(String(50), nullable=False, default="")
    warehouse: Mapped[str] = mapped_column(String(100), nullable=False, default="")
    barcode: Mapped[str] = mapped_column(String(100), nullable=False, default="")
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
