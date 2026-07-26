from sqlalchemy import or_, select
from sqlalchemy.orm import Session

from app.modules.inventory.models import Item, ItemType
from app.modules.inventory.schemas import ItemCreate, ItemUpdate


class ItemNotFoundError(Exception):
    pass


class DuplicateSkuError(Exception):
    pass


def list_items(
    db: Session,
    *,
    search: str | None = None,
    item_type: ItemType | None = None,
    skip: int = 0,
    limit: int = 100,
) -> list[Item]:
    query = select(Item).order_by(Item.id.desc())

    if item_type is not None:
        query = query.where(Item.type == item_type)

    if search:
        pattern = f"%{search.strip()}%"
        query = query.where(
            or_(
                Item.name.ilike(pattern),
                Item.sku.ilike(pattern),
                Item.category.ilike(pattern),
            )
        )

    return list(db.scalars(query.offset(skip).limit(limit)).all())


def get_item(db: Session, item_id: int) -> Item:
    item = db.get(Item, item_id)
    if item is None:
        raise ItemNotFoundError(f"Item {item_id} not found")
    return item


def create_item(db: Session, payload: ItemCreate) -> Item:
    existing = db.scalar(select(Item).where(Item.sku == payload.sku))
    if existing is not None:
        raise DuplicateSkuError(f"SKU '{payload.sku}' already exists")

    item = Item(**payload.model_dump())
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


def update_item(db: Session, item_id: int, payload: ItemUpdate) -> Item:
    item = get_item(db, item_id)
    data = payload.model_dump(exclude_unset=True)

    if "sku" in data:
        conflict = db.scalar(
            select(Item).where(Item.sku == data["sku"], Item.id != item_id)
        )
        if conflict is not None:
            raise DuplicateSkuError(f"SKU '{data['sku']}' already exists")

    for field, value in data.items():
        setattr(item, field, value)

    db.commit()
    db.refresh(item)
    return item


def delete_item(db: Session, item_id: int) -> None:
    item = get_item(db, item_id)
    db.delete(item)
    db.commit()
