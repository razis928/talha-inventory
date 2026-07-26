from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.database.session import get_db
from app.modules.job_orders import service
from app.modules.job_orders.schemas import (
    JobConsumedItemRead,
    JobConsumptionCreate,
    JobOrderCreate,
    JobOrderRead,
    JobOrderUpdate,
)

router = APIRouter(prefix="/job-orders", tags=["job-orders"])


@router.get("", response_model=list[JobOrderRead])
def list_orders(
    search: str | None = Query(default=None),
    skip: int = Query(default=0, ge=0),
    limit: int = Query(default=100, ge=1, le=500),
    db: Session = Depends(get_db),
) -> list[JobOrderRead]:
    return service.list_job_orders(db, search=search, skip=skip, limit=limit)


@router.get("/{job_id}", response_model=JobOrderRead)
def get_order(job_id: int, db: Session = Depends(get_db)) -> JobOrderRead:
    try:
        return service.get_job_order(db, job_id)
    except service.JobOrderNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post("", response_model=JobOrderRead, status_code=status.HTTP_201_CREATED)
def create_order(payload: JobOrderCreate, db: Session = Depends(get_db)) -> JobOrderRead:
    try:
        return service.create_job_order(db, payload)
    except service.DuplicateNumberError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except service.ValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.put("/{job_id}", response_model=JobOrderRead)
def update_order(
    job_id: int,
    payload: JobOrderUpdate,
    db: Session = Depends(get_db),
) -> JobOrderRead:
    try:
        return service.update_job_order(db, job_id, payload)
    except service.JobOrderNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except service.DuplicateNumberError as exc:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail=str(exc)) from exc
    except service.ValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc


@router.delete("/{job_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_order(job_id: int, db: Session = Depends(get_db)) -> None:
    try:
        service.delete_job_order(db, job_id)
    except service.JobOrderNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.get("/{job_id}/consumptions", response_model=list[JobConsumedItemRead])
def list_consumptions(job_id: int, db: Session = Depends(get_db)) -> list[JobConsumedItemRead]:
    try:
        return service.list_job_consumptions(db, job_id)
    except service.JobOrderNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc


@router.post(
    "/{job_id}/consumptions",
    response_model=list[JobConsumedItemRead],
    status_code=status.HTTP_201_CREATED,
)
def create_consumptions(
    job_id: int,
    payload: JobConsumptionCreate,
    db: Session = Depends(get_db),
) -> list[JobConsumedItemRead]:
    try:
        return service.create_job_consumptions(db, job_id, payload)
    except service.JobOrderNotFoundError as exc:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail=str(exc)) from exc
    except service.ValidationError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=str(exc)) from exc
