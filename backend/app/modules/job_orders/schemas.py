from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, field_validator, model_validator


class JobOrderStatus(str, Enum):
    PENDING = "Pending"
    IN_PROGRESS = "In Progress"
    COMPLETED = "Completed"
    CANCELLED = "Cancelled"


class JobOrderLineCreate(BaseModel):
    item_id: int | None = None
    item_name: str = Field(default="", max_length=255)
    unit: str = Field(default="", max_length=50)
    quality: str = Field(default="", max_length=100)
    colour: str = Field(default="", max_length=100)
    size: str = Field(default="", max_length=50)
    order_quantity: int = Field(..., gt=0)
    order_pending_quantity: int | None = Field(default=None, ge=0)
    remarks: str = Field(default="", max_length=255)
    rate: float = Field(default=0, ge=0)
    gst_percent: float = Field(default=0, ge=0)

    @model_validator(mode="after")
    def require_item_or_name(self) -> "JobOrderLineCreate":
        name = (self.item_name or "").strip()
        if self.item_id is None and not name:
            raise ValueError("Each line needs a finished item or an item name")
        return self


class JobOrderLineRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    item_id: int | None
    item_name: str
    unit: str
    quality: str
    colour: str
    size: str
    order_quantity: int
    order_pending_quantity: int
    remarks: str
    rate: float
    gst_percent: float
    gross_amount: float
    line_total: float

    @field_validator("size", mode="before")
    @classmethod
    def coerce_size(cls, value: object) -> str:
        if value is None:
            return ""
        return str(value)


class JobOrderCreate(BaseModel):
    job_number: str = Field(..., min_length=1, max_length=100)
    customer_name: str = Field(..., min_length=1, max_length=255)
    required_date: date | None = None
    payment_terms: str = Field(default="", max_length=255)
    remarks: str = ""
    pi_number: str = Field(default="", max_length=100)
    freight_charges: float = Field(default=0, ge=0)
    currency: str = Field(default="PKR", max_length=20)
    lines: list[JobOrderLineCreate] = Field(..., min_length=1)

    @model_validator(mode="after")
    def validate_lines(self) -> "JobOrderCreate":
        if not self.lines:
            raise ValueError("At least one line item is required")
        return self


class JobOrderUpdate(BaseModel):
    job_number: str | None = Field(default=None, min_length=1, max_length=100)
    customer_name: str | None = Field(default=None, min_length=1, max_length=255)
    required_date: date | None = None
    payment_terms: str | None = Field(default=None, max_length=255)
    remarks: str | None = None
    pi_number: str | None = Field(default=None, max_length=100)
    freight_charges: float | None = Field(default=None, ge=0)
    currency: str | None = Field(default=None, max_length=20)
    status: JobOrderStatus | None = None
    lines: list[JobOrderLineCreate] | None = Field(default=None, min_length=1)


class JobOrderRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_number: str
    customer_name: str
    required_date: date | None
    payment_terms: str
    remarks: str
    pi_number: str
    freight_charges: float
    currency: str
    tax_amount: float
    total_amount: float
    status: JobOrderStatus
    lines: list[JobOrderLineRead]
    created_at: datetime
    updated_at: datetime


class JobConsumedLineCreate(BaseModel):
    item_id: int
    quantity: int = Field(..., gt=0)
    notes: str = Field(default="", max_length=255)


class JobConsumptionCreate(BaseModel):
    consumed_date: date
    notes: str = Field(default="", max_length=255)
    lines: list[JobConsumedLineCreate] = Field(..., min_length=1)

    @model_validator(mode="after")
    def validate_lines(self) -> "JobConsumptionCreate":
        if not self.lines:
            raise ValueError("At least one raw item line is required")
        return self


class JobConsumedItemRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_order_id: int
    item_id: int
    item_name: str
    unit: str
    quantity: int
    consumed_date: date
    notes: str
    created_at: datetime
