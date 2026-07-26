from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.modules.dispatch import service
from app.modules.dispatch.schemas import DispatchCreate, DispatchRead

router = APIRouter(prefix="/dispatch", tags=["dispatch"])


@router.get("", response_model=list[DispatchRead])
def list_dispatches(
    search: str | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
) -> list[DispatchRead]:
    return service.list_dispatches(db, search=search, skip=skip, limit=limit)


@router.get("/{dispatch_id}", response_model=DispatchRead)
def get_dispatch(dispatch_id: int, db: Session = Depends(get_db)) -> DispatchRead:
    try:
        return service.get_dispatch(db, dispatch_id)
    except service.DispatchNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("", response_model=DispatchRead, status_code=status.HTTP_201_CREATED)
def create_dispatch(payload: DispatchCreate, db: Session = Depends(get_db)) -> DispatchRead:
    try:
        return service.create_dispatch(db, payload)
    except service.DuplicateNumberError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except service.ValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
