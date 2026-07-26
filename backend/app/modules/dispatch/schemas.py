from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field, model_validator


class DispatchStatus(str, Enum):
    DISPATCHED = "Dispatched"
    CANCELLED = "Cancelled"


class DispatchLineCreate(BaseModel):
    job_order_line_id: int
    item_id: int | None = None
    quantity: int = Field(..., gt=0)


class DispatchLineRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    job_order_line_id: int
    item_id: int | None
    item_name: str
    unit: str
    quantity: int


class DispatchCreate(BaseModel):
    pass_number: str = Field(..., min_length=1, max_length=100)
    job_order_id: int
    dispatch_date: date
    vehicle_no: str = Field(default="", max_length=100)
    driver: str = Field(default="", max_length=150)
    notes: str = ""
    created_by: str = Field(default="", max_length=100)
    lines: list[DispatchLineCreate] = Field(..., min_length=1)

    @model_validator(mode="after")
    def validate_lines(self) -> "DispatchCreate":
        if not self.lines:
            raise ValueError("At least one dispatch line is required")
        return self


class DispatchRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    pass_number: str
    job_order_id: int
    job_number: str
    customer_name: str
    dispatch_date: date
    vehicle_no: str
    driver: str
    notes: str
    created_by: str
    status: DispatchStatus
    lines: list[DispatchLineRead]
    created_at: datetime
