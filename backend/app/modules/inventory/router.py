from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.modules.inventory import service
from app.modules.inventory import stock_service
from app.modules.inventory.models import ItemType
from app.modules.inventory.schemas import ItemCreate, ItemRead, ItemUpdate
from app.modules.inventory.stock_models import StockTxnType
from app.modules.inventory.stock_schemas import StockTransactionRead

router = APIRouter(prefix="/inventory", tags=["inventory"])


@router.get("/items", response_model=list[ItemRead])
def list_items(
    search: str | None = Query(default=None, description="Search by name, SKU, or category"),
    item_type: ItemType | None = Query(default=None, alias="type"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
) -> list[ItemRead]:
    return service.list_items(
        db,
        search=search,
        item_type=item_type,
        skip=skip,
        limit=limit,
    )


@router.get("/stock-transactions", response_model=list[StockTransactionRead])
def list_stock_transactions(
    search: str | None = Query(default=None),
    item_id: int | None = Query(default=None),
    txn_type: StockTxnType | None = Query(default=None, alias="type"),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=200, ge=1, le=500),
    db: Session = Depends(get_db),
) -> list[StockTransactionRead]:
    return stock_service.list_stock_transactions(
        db,
        item_id=item_id,
        txn_type=txn_type,
        search=search,
        skip=skip,
        limit=limit,
    )


@router.get("/items/{item_id}", response_model=ItemRead)
def get_item(item_id: int, db: Session = Depends(get_db)) -> ItemRead:
    try:
        return service.get_item(db, item_id)
    except service.ItemNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/items", response_model=ItemRead, status_code=status.HTTP_201_CREATED)
def create_item(payload: ItemCreate, db: Session = Depends(get_db)) -> ItemRead:
    try:
        return service.create_item(db, payload)
    except service.DuplicateSkuError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.put("/items/{item_id}", response_model=ItemRead)
def update_item(
    item_id: int,
    payload: ItemUpdate,
    db: Session = Depends(get_db),
) -> ItemRead:
    try:
        return service.update_item(db, item_id, payload)
    except service.ItemNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except service.DuplicateSkuError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc


@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(item_id: int, db: Session = Depends(get_db)) -> None:
    try:
        service.delete_item(db, item_id)
    except service.ItemNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
