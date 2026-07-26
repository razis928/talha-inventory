from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.modules.customers.models import Customer
from app.modules.customers.schemas import CustomerCreate, CustomerUpdate


class CustomerNotFoundError(Exception):
    pass


class DuplicateCustomerNameError(Exception):
    pass


def list_customers(
    db: Session,
    *,
    search: str | None = None,
    skip: int = 0,
    limit: int = 200,
) -> list[Customer]:
    query = select(Customer).order_by(Customer.name.asc())
    if search:
        pattern = f"%{search.strip()}%"
        query = query.where(
            or_(
                Customer.name.ilike(pattern),
                Customer.contact_person.ilike(pattern),
                Customer.phone.ilike(pattern),
                Customer.email.ilike(pattern),
                Customer.city.ilike(pattern),
            )
        )
    return list(db.scalars(query.offset(skip).limit(limit)).all())


def get_customer(db: Session, customer_id: int) -> Customer:
    customer = db.get(Customer, customer_id)
    if customer is None:
        raise CustomerNotFoundError(f"Customer {customer_id} not found")
    return customer


def create_customer(db: Session, payload: CustomerCreate) -> Customer:
    existing = db.scalar(select(Customer).where(Customer.name == payload.name))
    if existing is not None:
        raise DuplicateCustomerNameError(f"Customer '{payload.name}' already exists")

    customer = Customer(**payload.model_dump())
    db.add(customer)
    db.flush()

    from app.modules.accounting.party_accounts import ensure_customer_account

    ensure_customer_account(db, customer)
    db.commit()
    db.refresh(customer)
    return customer


def update_customer(db: Session, customer_id: int, payload: CustomerUpdate) -> Customer:
    customer = get_customer(db, customer_id)
    data = payload.model_dump(exclude_unset=True)

    if "name" in data:
        conflict = db.scalar(
            select(Customer).where(Customer.name == data["name"], Customer.id != customer_id)
        )
        if conflict is not None:
            raise DuplicateCustomerNameError(f"Customer '{data['name']}' already exists")

    for field, value in data.items():
        setattr(customer, field, value)

    db.commit()
    db.refresh(customer)
    return customer


def delete_customer(db: Session, customer_id: int) -> None:
    customer = get_customer(db, customer_id)
    db.delete(customer)
    db.commit()


def get_customer_detail(db: Session, customer_id: int) -> dict:
    from app.modules.accounting import service as accounting_service
    from app.modules.accounting.party_accounts import ensure_customer_account
    from app.modules.job_orders.models import JobOrder

    customer = get_customer(db, customer_id)
    if not customer.account_id:
        ensure_customer_account(db, customer)
        db.commit()
        db.refresh(customer)

    jobs = list(
        db.scalars(
            select(JobOrder)
            .where(JobOrder.customer_name == customer.name)
            .order_by(JobOrder.id.desc())
            .limit(50)
        ).all()
    )
    ledger: list[dict] = []
    balance = 0.0
    if customer.account_id:
        ledger = accounting_service.get_account_ledger(db, customer.account_id)
        balance = accounting_service._account_balance(db, customer.account_id)

    return {
        "customer": customer,
        "account_balance": balance,
        "job_orders": [
            {
                "id": job.id,
                "job_number": job.job_number,
                "status": job.status.value if hasattr(job.status, "value") else str(job.status),
                "total_amount": float(job.total_amount or 0),
                "required_date": job.required_date,
                "created_at": job.created_at,
            }
            for job in jobs
        ],
        "ledger": ledger,
    }
