from fastapi import APIRouter

from app.modules.accounting.router import router as accounting_router
from app.modules.customers.router import router as customers_router
from app.modules.dispatch.router import router as dispatch_router
from app.modules.inventory.router import router as inventory_router
from app.modules.job_orders.router import router as job_orders_router
from app.modules.purchase.router import router as purchase_router
from app.modules.vendors.router import router as vendors_router

api_router = APIRouter()
api_router.include_router(inventory_router)
api_router.include_router(purchase_router)
api_router.include_router(vendors_router)
api_router.include_router(customers_router)
api_router.include_router(job_orders_router)
api_router.include_router(dispatch_router)
api_router.include_router(accounting_router)
