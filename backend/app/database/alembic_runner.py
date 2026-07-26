"""Run Alembic migrations against the configured database."""

from __future__ import annotations

from pathlib import Path

from alembic import command
from alembic.config import Config
from alembic.runtime.migration import MigrationContext
from alembic.script import ScriptDirectory
from sqlalchemy import inspect
from sqlalchemy.engine import Engine


def _alembic_config() -> Config:
    backend_root = Path(__file__).resolve().parents[2]
    cfg = Config(str(backend_root / "alembic.ini"))
    cfg.set_main_option("script_location", str(backend_root / "alembic"))
    return cfg


def run_migrations(engine: Engine) -> None:
    """
    Apply pending Alembic revisions.

    If the database already has application tables (created via the older
    ``create_all`` path) but no Alembic revision is recorded, stamp ``head``
    so we do not try to recreate existing tables.
    """
    cfg = _alembic_config()
    script = ScriptDirectory.from_config(cfg)
    head = script.get_current_head()
    if head is None:
        return

    with engine.connect() as connection:
        context = MigrationContext.configure(connection)
        current = context.get_current_revision()
        table_names = set(inspect(connection).get_table_names())

    if current is None and "items" in table_names:
        command.stamp(cfg, head)
        return

    command.upgrade(cfg, "head")
