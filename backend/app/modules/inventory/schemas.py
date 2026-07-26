from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field


class ItemType(str, Enum):
    RAW = "Raw"
    FINISHED = "Finished"


class ItemBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    sku: str = Field(..., min_length=1, max_length=100)
    type: ItemType
    category: str = Field(default="", max_length=100)
    cost_price: float = Field(default=0, ge=0)
    selling_price: float = Field(default=0, ge=0)
    stock_quantity: int = Field(default=0, ge=0)
    min_stock: int = Field(default=0, ge=0)
    max_stock: int = Field(default=0, ge=0)
    gsm: float = Field(default=0, ge=0)
    size: float = Field(default=0, ge=0)
    unit: str = Field(default="", max_length=50)


class ItemCreate(ItemBase):
    pass


class ItemUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    sku: str | None = Field(default=None, min_length=1, max_length=100)
    type: ItemType | None = None
    category: str | None = Field(default=None, max_length=100)
    cost_price: float | None = Field(default=None, ge=0)
    selling_price: float | None = Field(default=None, ge=0)
    stock_quantity: int | None = Field(default=None, ge=0)
    min_stock: int | None = Field(default=None, ge=0)
    max_stock: int | None = Field(default=None, ge=0)
    gsm: float | None = Field(default=None, ge=0)
    size: float | None = Field(default=None, ge=0)
    unit: str | None = Field(default=None, max_length=50)


class ItemRead(ItemBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    created_at: datetime
    updated_at: datetime
