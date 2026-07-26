"""Legacy SQLite column patches (no-op on PostgreSQL). Prefer Alembic for schema changes."""

from sqlalchemy import text
from sqlalchemy.engine import Engine


def _existing_columns(conn, table: str) -> set[str]:
    rows = conn.execute(text(f"PRAGMA table_info({table})")).fetchall()
    return {row[1] for row in rows}


def _add_column_if_missing(conn, table: str, column: str, ddl: str) -> None:
    cols = _existing_columns(conn, table)
    if cols and column not in cols:
        conn.execute(text(f"ALTER TABLE {table} ADD COLUMN {ddl}"))


def _column_notnull(conn, table: str, column: str) -> bool | None:
    rows = conn.execute(text(f"PRAGMA table_info({table})")).fetchall()
    for row in rows:
        if row[1] == column:
            return bool(row[3])
    return None


def _ensure_nullable_item_id(conn, table: str) -> None:
    """Rebuild table when item_id is NOT NULL so free-text job lines are allowed."""
    cols = _existing_columns(conn, table)
    if "item_id" not in cols:
        return
    if _column_notnull(conn, table, "item_id") is not True:
        return

    if table == "job_order_lines":
        conn.execute(text("PRAGMA foreign_keys=OFF"))
        conn.execute(
            text(
                """
                CREATE TABLE job_order_lines__new (
                    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                    job_order_id INTEGER NOT NULL,
                    item_id INTEGER,
                    item_name VARCHAR(255) NOT NULL DEFAULT '',
                    unit VARCHAR(50) NOT NULL DEFAULT '',
                    quality VARCHAR(100) NOT NULL DEFAULT '',
                    colour VARCHAR(100) NOT NULL DEFAULT '',
                    size VARCHAR(50) NOT NULL DEFAULT '',
                    order_quantity INTEGER NOT NULL DEFAULT 0,
                    order_pending_quantity INTEGER NOT NULL DEFAULT 0,
                    remarks VARCHAR(255) NOT NULL DEFAULT '',
                    rate NUMERIC(12, 2) NOT NULL DEFAULT 0,
                    gst_percent NUMERIC(8, 2) NOT NULL DEFAULT 0,
                    gross_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
                    line_total NUMERIC(12, 2) NOT NULL DEFAULT 0,
                    FOREIGN KEY(job_order_id) REFERENCES job_orders (id) ON DELETE CASCADE,
                    FOREIGN KEY(item_id) REFERENCES items (id)
                )
                """
            )
        )
        conn.execute(
            text(
                """
                INSERT INTO job_order_lines__new (
                    id, job_order_id, item_id, item_name, unit, quality, colour, size,
                    order_quantity, order_pending_quantity, remarks, rate, gst_percent,
                    gross_amount, line_total
                )
                SELECT
                    id, job_order_id, item_id, item_name, unit, quality, colour, size,
                    order_quantity, order_pending_quantity, remarks, rate, gst_percent,
                    gross_amount, line_total
                FROM job_order_lines
                """
            )
        )
        conn.execute(text("DROP TABLE job_order_lines"))
        conn.execute(text("ALTER TABLE job_order_lines__new RENAME TO job_order_lines"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_job_order_lines_job_order_id ON job_order_lines (job_order_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_job_order_lines_item_id ON job_order_lines (item_id)"))
        conn.execute(text("PRAGMA foreign_keys=ON"))
        return

    if table == "dispatch_lines":
        conn.execute(text("PRAGMA foreign_keys=OFF"))
        conn.execute(
            text(
                """
                CREATE TABLE dispatch_lines__new (
                    id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                    dispatch_id INTEGER NOT NULL,
                    job_order_line_id INTEGER NOT NULL,
                    item_id INTEGER,
                    item_name VARCHAR(255) NOT NULL DEFAULT '',
                    unit VARCHAR(50) NOT NULL DEFAULT '',
                    quantity INTEGER NOT NULL DEFAULT 0,
                    FOREIGN KEY(dispatch_id) REFERENCES dispatches (id) ON DELETE CASCADE,
                    FOREIGN KEY(job_order_line_id) REFERENCES job_order_lines (id) ON DELETE RESTRICT,
                    FOREIGN KEY(item_id) REFERENCES items (id)
                )
                """
            )
        )
        conn.execute(
            text(
                """
                INSERT INTO dispatch_lines__new (
                    id, dispatch_id, job_order_line_id, item_id, item_name, unit, quantity
                )
                SELECT
                    id, dispatch_id, job_order_line_id, item_id, item_name, unit, quantity
                FROM dispatch_lines
                """
            )
        )
        conn.execute(text("DROP TABLE dispatch_lines"))
        conn.execute(text("ALTER TABLE dispatch_lines__new RENAME TO dispatch_lines"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_dispatch_lines_dispatch_id ON dispatch_lines (dispatch_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_dispatch_lines_job_order_line_id ON dispatch_lines (job_order_line_id)"))
        conn.execute(text("CREATE INDEX IF NOT EXISTS ix_dispatch_lines_item_id ON dispatch_lines (item_id)"))
        conn.execute(text("PRAGMA foreign_keys=ON"))


def _rebuild_journal_lines_if_needed(conn) -> None:
    """Migrate legacy journal_lines (account_id/debit/credit) to debit/credit account pairs."""
    cols = _existing_columns(conn, "journal_lines")
    if not cols:
        return
    if "debit_account_id" in cols and "credit_account_id" in cols:
        _add_column_if_missing(conn, "journal_lines", "purchase_order_id", "purchase_order_id INTEGER")
        _add_column_if_missing(conn, "journal_lines", "job_order_id", "job_order_id INTEGER")
        return
    if "account_id" not in cols:
        return

    conn.execute(text("PRAGMA foreign_keys=OFF"))
    conn.execute(
        text(
            """
            CREATE TABLE journal_lines__new (
                id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                journal_entry_id INTEGER NOT NULL,
                debit_account_id INTEGER NOT NULL,
                credit_account_id INTEGER NOT NULL,
                debit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
                credit_amount NUMERIC(12, 2) NOT NULL DEFAULT 0,
                purchase_order_id INTEGER,
                job_order_id INTEGER,
                memo VARCHAR(255) NOT NULL DEFAULT '',
                FOREIGN KEY(journal_entry_id) REFERENCES journal_entries (id) ON DELETE CASCADE,
                FOREIGN KEY(debit_account_id) REFERENCES accounts (id),
                FOREIGN KEY(credit_account_id) REFERENCES accounts (id)
            )
            """
        )
    )
    # Legacy unpaired lines cannot be reconstructed safely — reset.
    conn.execute(text("DROP TABLE journal_lines"))
    conn.execute(text("ALTER TABLE journal_lines__new RENAME TO journal_lines"))
    conn.execute(
        text("CREATE INDEX IF NOT EXISTS ix_journal_lines_journal_entry_id ON journal_lines (journal_entry_id)")
    )
    conn.execute(
        text("CREATE INDEX IF NOT EXISTS ix_journal_lines_debit_account_id ON journal_lines (debit_account_id)")
    )
    conn.execute(
        text("CREATE INDEX IF NOT EXISTS ix_journal_lines_credit_account_id ON journal_lines (credit_account_id)")
    )
    conn.execute(text("PRAGMA foreign_keys=ON"))


def _ensure_nullable_account_type(conn) -> None:
    """Allow accounts.type to be NULL (user-created accounts need not declare type)."""
    cols = _existing_columns(conn, "accounts")
    if "type" not in cols:
        return
    if _column_notnull(conn, "accounts", "type") is not True:
        return

    conn.execute(text("PRAGMA foreign_keys=OFF"))
    conn.execute(
        text(
            """
            CREATE TABLE accounts__new (
                id INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
                code VARCHAR(50) NOT NULL UNIQUE,
                name VARCHAR(255) NOT NULL,
                type VARCHAR(9),
                is_system BOOLEAN NOT NULL DEFAULT 0,
                is_active BOOLEAN NOT NULL DEFAULT 1,
                created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
                parent_id INTEGER,
                FOREIGN KEY(parent_id) REFERENCES accounts (id) ON DELETE SET NULL
            )
            """
        )
    )
    conn.execute(
        text(
            """
            INSERT INTO accounts__new (
                id, code, name, type, is_system, is_active, created_at, parent_id
            )
            SELECT id, code, name, type, is_system, is_active, created_at, parent_id
            FROM accounts
            """
        )
    )
    conn.execute(text("DROP TABLE accounts"))
    conn.execute(text("ALTER TABLE accounts__new RENAME TO accounts"))
    conn.execute(text("CREATE INDEX IF NOT EXISTS ix_accounts_code ON accounts (code)"))
    conn.execute(text("CREATE INDEX IF NOT EXISTS ix_accounts_name ON accounts (name)"))
    conn.execute(text("CREATE INDEX IF NOT EXISTS ix_accounts_type ON accounts (type)"))
    conn.execute(text("CREATE INDEX IF NOT EXISTS ix_accounts_parent_id ON accounts (parent_id)"))
    conn.execute(text("PRAGMA foreign_keys=ON"))


def ensure_sqlite_columns(engine: Engine) -> None:
    if not engine.url.drivername.startswith("sqlite"):
        return

    with engine.begin() as conn:
        _add_column_if_missing(conn, "items", "gsm", "gsm NUMERIC(12, 2) NOT NULL DEFAULT 0")
        _add_column_if_missing(conn, "items", "size", "size NUMERIC(12, 2) NOT NULL DEFAULT 0")

        _add_column_if_missing(conn, "purchase_orders", "vendor_id", "vendor_id INTEGER")
        _add_column_if_missing(conn, "purchase_orders", "required_date", "required_date DATE")
        _add_column_if_missing(
            conn, "purchase_orders", "payment_terms", "payment_terms VARCHAR(255) NOT NULL DEFAULT ''"
        )
        _add_column_if_missing(conn, "purchase_orders", "remarks", "remarks TEXT NOT NULL DEFAULT ''")
        _add_column_if_missing(
            conn, "purchase_orders", "tax_amount", "tax_amount NUMERIC(12, 2) NOT NULL DEFAULT 0"
        )

        _add_column_if_missing(
            conn, "purchase_order_lines", "po_rate", "po_rate NUMERIC(12, 2) NOT NULL DEFAULT 0"
        )
        _add_column_if_missing(
            conn, "purchase_order_lines", "gst_percent", "gst_percent NUMERIC(8, 2) NOT NULL DEFAULT 0"
        )
        _add_column_if_missing(
            conn, "purchase_order_lines", "gross_amount", "gross_amount NUMERIC(12, 2) NOT NULL DEFAULT 0"
        )

        po_cols = _existing_columns(conn, "purchase_orders")
        if "delivery_date" in po_cols and "required_date" in po_cols:
            conn.execute(
                text(
                    "UPDATE purchase_orders SET required_date = delivery_date "
                    "WHERE required_date IS NULL AND delivery_date IS NOT NULL"
                )
            )
        if "notes" in po_cols and "remarks" in po_cols:
            conn.execute(
                text(
                    "UPDATE purchase_orders SET remarks = notes "
                    "WHERE (remarks IS NULL OR remarks = '') AND notes IS NOT NULL AND notes != ''"
                )
            )

        line_cols = _existing_columns(conn, "purchase_order_lines")
        if "unit_price" in line_cols and "po_rate" in line_cols:
            conn.execute(
                text(
                    "UPDATE purchase_order_lines SET po_rate = unit_price "
                    "WHERE po_rate = 0 AND unit_price IS NOT NULL"
                )
            )
        if "unit_price" in line_cols and "gross_amount" in line_cols:
            conn.execute(
                text(
                    "UPDATE purchase_order_lines "
                    "SET gross_amount = ROUND(quantity * COALESCE(po_rate, unit_price, 0), 2) "
                    "WHERE gross_amount = 0"
                )
            )

        _add_column_if_missing(conn, "receivings", "vendor_id", "vendor_id INTEGER")

        _ensure_nullable_item_id(conn, "job_order_lines")
        _ensure_nullable_item_id(conn, "dispatch_lines")

        _add_column_if_missing(conn, "accounts", "parent_id", "parent_id INTEGER")
        _ensure_nullable_account_type(conn)
        _add_column_if_missing(conn, "vendors", "account_id", "account_id INTEGER")
        _add_column_if_missing(conn, "customers", "account_id", "account_id INTEGER")

        _add_column_if_missing(
            conn, "journal_entries", "purchase_order_id", "purchase_order_id INTEGER"
        )
        _add_column_if_missing(conn, "journal_entries", "job_order_id", "job_order_id INTEGER")

        _add_column_if_missing(
            conn, "vendor_bills", "vendor_account_id", "vendor_account_id INTEGER"
        )
        _add_column_if_missing(conn, "customer_invoices", "customer_id", "customer_id INTEGER")
        _add_column_if_missing(
            conn, "customer_invoices", "customer_account_id", "customer_account_id INTEGER"
        )
        _add_column_if_missing(
            conn, "customer_invoices", "purchase_order_id", "purchase_order_id INTEGER"
        )
        _add_column_if_missing(conn, "payments", "purchase_order_id", "purchase_order_id INTEGER")
        _add_column_if_missing(conn, "payments", "job_order_id", "job_order_id INTEGER")
        _add_column_if_missing(conn, "expenses", "purchase_order_id", "purchase_order_id INTEGER")

        _rebuild_journal_lines_if_needed(conn)
