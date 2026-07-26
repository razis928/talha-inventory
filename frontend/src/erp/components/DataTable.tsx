import { ChevronLeft, ChevronRight, Pencil, Printer, Trash2 } from 'lucide-react';
import { ReactNode } from 'react';

export interface Column<T> {
  key: string;
  header: string;
  render: (row: T) => ReactNode;
  className?: string;
  highlight?: boolean;
}

interface DataTableProps<T> {
  columns: Column<T>[];
  data: T[];
  page: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onPrint?: (row: T) => void;
  onRowClick?: (row: T) => void;
  showActions?: boolean;
  keyExtractor: (row: T) => string;
}

export default function DataTable<T>({
  columns,
  data,
  page,
  pageSize,
  onPageChange,
  onEdit,
  onDelete,
  onPrint,
  onRowClick,
  showActions = true,
  keyExtractor,
}: DataTableProps<T>) {
  const total = data.length;
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start = (page - 1) * pageSize;
  const rows = data.slice(start, start + pageSize);
  const hasActions = showActions && Boolean(onEdit || onDelete || onPrint);

  return (
    <div className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="erp-classic-table min-w-[640px]">
          <thead>
            <tr>
              {columns.map((col) => (
                <th key={col.key} className={col.className ?? ''}>
                  {col.header}
                </th>
              ))}
              {hasActions && <th className="text-right">Actions</th>}
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 ? (
              <tr>
                <td
                  colSpan={columns.length + (hasActions ? 1 : 0)}
                  className="erp-muted py-8 text-center"
                >
                  No records found.
                </td>
              </tr>
            ) : (
              rows.map((row) => (
                <tr
                  key={keyExtractor(row)}
                  className={
                    onRowClick
                      ? 'cursor-pointer hover:bg-[var(--color-erp-table-head)]/40'
                      : undefined
                  }
                  onClick={onRowClick ? () => onRowClick(row) : undefined}
                >
                  {columns.map((col) => (
                    <td
                      key={col.key}
                      className={`${col.highlight ? 'erp-cell-highlight' : ''} ${col.className ?? ''}`}
                    >
                      {col.render(row)}
                    </td>
                  ))}
                  {hasActions && (
                    <td className="text-right" onClick={(e) => e.stopPropagation()}>
                      <div className="flex items-center justify-end gap-1">
                        {onPrint && (
                          <button
                            type="button"
                            onClick={() => onPrint(row)}
                            className="erp-btn-ghost p-1"
                            title="Print / PDF"
                          >
                            <Printer size={14} />
                          </button>
                        )}
                        {onEdit && (
                          <button
                            type="button"
                            onClick={() => onEdit(row)}
                            className="erp-btn-ghost p-1"
                            title="Edit"
                          >
                            <Pencil size={14} />
                          </button>
                        )}
                        {onDelete && (
                          <button
                            type="button"
                            onClick={() => onDelete(row)}
                            className="erp-btn-ghost p-1 text-red-700 dark:text-red-400"
                            title="Delete"
                          >
                            <Trash2 size={14} />
                          </button>
                        )}
                      </div>
                    </td>
                  )}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="erp-card-2 flex flex-col gap-2 border-t border-[var(--color-erp-border)] px-3 py-2 sm:flex-row sm:items-center sm:justify-between">
        <span className="erp-muted text-center text-xs sm:text-left">
          Showing {total === 0 ? 0 : start + 1}–{Math.min(start + pageSize, total)} of {total}
        </span>
        <div className="flex items-center justify-center gap-2">
          <button
            type="button"
            onClick={() => onPageChange(Math.max(1, page - 1))}
            disabled={page === 1}
            className="erp-btn-ghost flex h-7 w-7 items-center justify-center disabled:opacity-40"
          >
            <ChevronLeft size={14} />
          </button>
          <span className="erp-text text-xs font-bold">
            Page {page}/{totalPages}
          </span>
          <button
            type="button"
            onClick={() => onPageChange(Math.min(totalPages, page + 1))}
            disabled={page === totalPages}
            className="erp-btn-ghost flex h-7 w-7 items-center justify-center disabled:opacity-40"
          >
            <ChevronRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}
