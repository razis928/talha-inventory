from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field

from app.modules.accounting.schemas import LedgerLine


class CustomerStatus(str, Enum):
    ACTIVE = "Active"
    INACTIVE = "Inactive"


class CustomerBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    contact_person: str = Field(default="", max_length=150)
    phone: str = Field(default="", max_length=50)
    email: str = Field(default="", max_length=150)
    city: str = Field(default="", max_length=100)
    address: str = ""
    total_orders: int = Field(default=0, ge=0)
    total_revenue: float = Field(default=0, ge=0)
    outstanding: float = Field(default=0, ge=0)
    status: CustomerStatus = CustomerStatus.ACTIVE
    notes: str = ""


class CustomerCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    contact_person: str = Field(default="", max_length=150)
    phone: str = Field(default="", max_length=50)
    email: str = Field(default="", max_length=150)
    city: str = Field(default="", max_length=100)
    address: str = ""
    total_orders: int = Field(default=0, ge=0)
    total_revenue: float = Field(default=0, ge=0)
    outstanding: float = Field(default=0, ge=0)
    status: CustomerStatus = CustomerStatus.ACTIVE
    notes: str = ""


class CustomerUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    contact_person: str | None = Field(default=None, max_length=150)
    phone: str | None = Field(default=None, max_length=50)
    email: str | None = Field(default=None, max_length=150)
    city: str | None = Field(default=None, max_length=100)
    address: str | None = None
    total_orders: int | None = Field(default=None, ge=0)
    total_revenue: float | None = Field(default=None, ge=0)
    outstanding: float | None = Field(default=None, ge=0)
    status: CustomerStatus | None = None
    notes: str | None = None


class CustomerRead(CustomerBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    account_id: int | None = None
    created_at: datetime
    updated_at: datetime


class CustomerJobHistoryItem(BaseModel):
    id: int
    job_number: str
    status: str
    total_amount: float
    required_date: date | None = None
    created_at: datetime


class CustomerDetailRead(BaseModel):
    customer: CustomerRead
    account_balance: float = 0
    job_orders: list[CustomerJobHistoryItem]
    ledger: list[LedgerLine]
