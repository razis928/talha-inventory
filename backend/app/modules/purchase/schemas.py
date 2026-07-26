from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class PurchaseOrderStatus(str, Enum):
    PENDING = "Pending"
    APPROVED = "Approved"
    PARTIAL = "Partial"
    RECEIVED = "Received"
    CANCELLED = "Cancelled"


class PurchaseOrderLineCreate(BaseModel):
    item_id: int
    size: str = Field(default="", max_length=50)
    quantity: int = Field(..., gt=0)
    po_rate: float = Field(default=0, ge=0)
    gst_percent: float = Field(default=0, ge=0)


class PurchaseOrderLineRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    item_id: int
    item_name: str
    gsm: float
    size: str
    unit: str
    quantity: int
    received_quantity: int
    po_rate: float
    gst_percent: float
    gross_amount: float
    line_total: float

    @field_validator("size", mode="before")
    @classmethod
    def coerce_size(cls, value: object) -> str:
        if value is None:
            return ""
        return str(value)


class PurchaseOrderCreate(BaseModel):
    po_number: str = Field(..., min_length=1, max_length=100)
    vendor_id: int
    required_date: date | None = None
    payment_terms: str = Field(default="", max_length=255)
    remarks: str = ""
    lines: list[PurchaseOrderLineCreate] = Field(..., min_length=1)

    @model_validator(mode="after")
    def validate_lines(self) -> "PurchaseOrderCreate":
        if not self.lines:
            raise ValueError("At least one line item is required")
        return self


class PurchaseOrderUpdate(BaseModel):
    po_number: str | None = Field(default=None, min_length=1, max_length=100)
    vendor_id: int | None = None
    required_date: date | None = None
    payment_terms: str | None = Field(default=None, max_length=255)
    remarks: str | None = None
    lines: list[PurchaseOrderLineCreate] | None = Field(default=None, min_length=1)


class PurchaseOrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    po_number: str
    vendor_id: int | None
    vendor: str
    required_date: date | None
    payment_terms: str
    remarks: str
    tax_amount: float
    status: PurchaseOrderStatus
    total_amount: float
    lines: list[PurchaseOrderLineRead]
    created_at: datetime
    updated_at: datetime


class ReceivingLineCreate(BaseModel):
    item_id: int
    quantity: int = Field(..., gt=0)
    purchase_order_line_id: int | None = None


class ReceivingLineRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    item_id: int
    item_name: str
    unit: str
    quantity: int
    purchase_order_line_id: int | None


class ReceivingCreate(BaseModel):
    receiving_number: str = Field(..., min_length=1, max_length=100)
    purchase_order_id: int | None = None
    vendor_id: int | None = None
    vendor: str = Field(default="", max_length=255)
    received_date: date
    notes: str = ""
    created_by: str = Field(default="", max_length=100)
    lines: list[ReceivingLineCreate] = Field(..., min_length=1)


class ReceivingRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    receiving_number: str
    purchase_order_id: int | None
    vendor_id: int | None
    vendor: str
    received_date: date
    notes: str
    created_by: str
    lines: list[ReceivingLineRead]
    created_at: datetime
