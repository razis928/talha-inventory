from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.modules.inventory.stock_models import StockTransaction, StockTxnType


def list_stock_transactions(
    db: Session,
    *,
    item_id: int | None = None,
    txn_type: StockTxnType | None = None,
    search: str | None = None,
    skip: int = 0,
    limit: int = 200,
) -> list[StockTransaction]:
    query = select(StockTransaction).order_by(StockTransaction.id.desc())

    if item_id is not None:
        query = query.where(StockTransaction.item_id == item_id)
    if txn_type is not None:
        query = query.where(StockTransaction.transaction_type == txn_type)
    if search:
        pattern = f"%{search.strip()}%"
        query = query.where(
            or_(
                StockTransaction.item_name.ilike(pattern),
                StockTransaction.reference_number.ilike(pattern),
            )
        )

    return list(db.scalars(query.offset(skip).limit(limit)).all())