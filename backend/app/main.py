from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.api.v1.router import api_router
from app.core.config import get_settings
from app.database.base import Base
from app.database.migrate import ensure_sqlite_columns
from app.database.session import engine

# Import models so SQLAlchemy registers them on Base.metadata
from app.modules.accounting import models as accounting_models  # noqa: F401
from app.modules.customers import models as customers_models  # noqa: F401
from app.modules.dispatch import models as dispatch_models  # noqa: F401
from app.modules.inventory import models as inventory_models  # noqa: F401
from app.modules.inventory import stock_models as inventory_stock_models  # noqa: F401
from app.modules.job_orders import models as job_orders_models  # noqa: F401
from app.modules.purchase import models as purchase_models  # noqa: F401
from app.modules.vendors import models as vendors_models  # noqa: F401

settings = get_settings()


@asynccontextmanager
async def lifespan(_: FastAPI):
    Base.metadata.create_all(bind=engine)
    ensure_sqlite_columns(engine)
    from app.database.session import SessionLocal
    from app.modules.accounting.seed import ensure_default_accounts

    db = SessionLocal()
    try:
        ensure_default_accounts(db)
    finally:
        db.close()
    yield


app = FastAPI(title=settings.app_name, lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(api_router, prefix=settings.api_v1_prefix)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok"}
