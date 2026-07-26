from datetime import datetime
from enum import Enum

from pydantic import BaseModel, ConfigDict


class StockTxnType(str, Enum):
    IN = "IN"
    OUT = "OUT"
    ADJUST = "ADJUST"


class StockTransactionRead(BaseModel):
    model_config = ConfigDict(from_attributes=True)

    id: int
    item_id: int
    item_name: str
    transaction_type: StockTxnType
    quantity: int
    balance_after: int
    unit: str
    reference_type: str
    reference_id: int | None
    reference_number: str
    notes: str
    created_at: datetime
