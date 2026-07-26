from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.modules.purchase import service
from app.modules.purchase.schemas import (
    PurchaseOrderCreate,
    PurchaseOrderRead,
    PurchaseOrderUpdate,
    ReceivingCreate,
    ReceivingRead,
)

router = APIRouter(prefix="/purchase", tags=["purchase"])


@router.get("/orders", response_model=list[PurchaseOrderRead])
def list_orders(
    search: str | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
) -> list[PurchaseOrderRead]:
    return service.list_purchase_orders(db, search=search, skip=skip, limit=limit)


@router.get("/orders/{po_id}", response_model=PurchaseOrderRead)
def get_order(po_id: int, db: Session = Depends(get_db)) -> PurchaseOrderRead:
    try:
        return service.get_purchase_order(db, po_id)
    except service.PurchaseNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/orders", response_model=PurchaseOrderRead, status_code=status.HTTP_201_CREATED)
def create_order(payload: PurchaseOrderCreate, db: Session = Depends(get_db)) -> PurchaseOrderRead:
    try:
        return service.create_purchase_order(db, payload)
    except service.DuplicateNumberError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except service.ValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.put("/orders/{po_id}", response_model=PurchaseOrderRead)
def update_order(
    po_id: int,
    payload: PurchaseOrderUpdate,
    db: Session = Depends(get_db),
) -> PurchaseOrderRead:
    try:
        return service.update_purchase_order(db, po_id, payload)
    except service.PurchaseNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except service.DuplicateNumberError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except service.ValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.delete("/orders/{po_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(po_id: int, db: Session = Depends(get_db)) -> None:
    try:
        service.delete_purchase_order(db, po_id)
    except service.PurchaseNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except service.ValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.post("/orders/{po_id}/approve", response_model=PurchaseOrderRead)
def approve_order(po_id: int, db: Session = Depends(get_db)) -> PurchaseOrderRead:
    """Accept PO (status only). Payable posts on receiving."""
    try:
        return service.approve_purchase_order(db, po_id)
    except service.PurchaseNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except service.ValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.get("/receivings", response_model=list[ReceivingRead])
def list_receivings(
    search: str | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
) -> list[ReceivingRead]:
    return service.list_receivings(db, search=search, skip=skip, limit=limit)


@router.get("/receivings/{receiving_id}", response_model=ReceivingRead)
def get_receiving(receiving_id: int, db: Session = Depends(get_db)) -> ReceivingRead:
    try:
        return service.get_receiving(db, receiving_id)
    except service.ReceivingNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("/receivings", response_model=ReceivingRead, status_code=status.HTTP_201_CREATED)
def create_receiving(payload: ReceivingCreate, db: Session = Depends(get_db)) -> ReceivingRead:
    try:
        return service.create_receiving(db, payload)
    except service.DuplicateNumberError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except service.PurchaseNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except service.ValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
