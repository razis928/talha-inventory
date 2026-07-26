from datetime import date, datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict, Field

from app.modules.accounting.schemas import LedgerLine


class VendorStatus(str, Enum):
    PREFERRED = "Preferred"
    STANDARD = "Standard"
    UNDER_REVIEW = "Under Review"
    INACTIVE = "Inactive"


class VendorBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    code: str = Field(default="", max_length=50)
    category: str = Field(default="", max_length=100)
    contact_person: str = Field(default="", max_length=150)
    phone: str = Field(default="", max_length=50)
    email: str = Field(default="", max_length=150)
    city: str = Field(default="", max_length=100)
    address: str = ""
    status: VendorStatus = VendorStatus.STANDARD
    notes: str = ""


class VendorCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=255)
    code: str = Field(default="", max_length=50)
    category: str = Field(default="", max_length=100)
    contact_person: str = Field(default="", max_length=150)
    phone: str = Field(default="", max_length=50)
    email: str = Field(default="", max_length=150)
    city: str = Field(default="", max_length=100)
    address: str = ""
    status: VendorStatus = VendorStatus.STANDARD
    notes: str = ""


class VendorUpdate(BaseModel):
    name: str | None = Field(default=None, min_length=1, max_length=255)
    code: str | None = Field(default=None, max_length=50)
    category: str | None = Field(default=None, max_length=100)
    contact_person: str | None = Field(default=None, max_length=150)
    phone: str | None = Field(default=None, max_length=50)
    email: str | None = Field(default=None, max_length=150)
    city: str | None = Field(default=None, max_length=100)
    address: str | None = None
    status: VendorStatus | None = None
    notes: str | None = None


class VendorRead(VendorBase):
    model_config = ConfigDict(from_attributes=True)

    id: int
    account_id: int | None = None
    created_at: datetime
    updated_at: datetime


class VendorOrderHistoryItem(BaseModel):
    id: int
    po_number: str
    status: str
    total_amount: float
    required_date: date | None = None
    created_at: datetime


class VendorDetailRead(BaseModel):
    vendor: VendorRead
    account_balance: float = 0
    purchase_orders: list[VendorOrderHistoryItem]
    ledger: list[LedgerLine]
