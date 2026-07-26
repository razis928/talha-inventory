import { useMemo, useState } from 'react';
import DataTable, { Column } from '../components/DataTable';
import FilterPanel from '../components/FilterPanel';
import PageToolbar from '../components/PageToolbar';
import ScreenFrame from '../components/ScreenFrame';
import { PURCHASE_FILTERS } from '../config/entityFields';
import { useErp } from '../context/ErpContext';
import { useConfirmDelete } from '../context/ThemeContext';
import { PurchaseOrderApi } from '../api/purchase';
import { useListExport } from '../hooks/useListExport';
import { applyFilters, hasActiveFilters, matchesSearch } from '../utils/filter';
import { formatPkr } from '../utils/currency';

const PAGE_SIZE = 6;

const statusColor: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-700',
  Approved: 'bg-blue-50 text-blue-700',
  Partial: 'bg-violet-50 text-violet-700',
  Received: 'bg-emerald-50 text-emerald-700',
  Cancelled: 'bg-slate-100 text-slate-600',
};

interface PurchaseScreenProps {
  searchQuery: string;
  onOpenAdd: () => void;
  onOpenEdit: (record: PurchaseOrderApi) => void;
}

export default function PurchaseScreen({ searchQuery, onOpenAdd, onOpenEdit }: PurchaseScreenProps) {
  const { purchaseOrders, deletePurchaseOrder, approvePurchaseOrderById, vendors } = useErp();
  const confirmDelete = useConfirmDelete();
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const [approvingId, setApprovingId] = useState<number | null>(null);

  const purchaseFilters = useMemo(() => {
    const vendorNames = Array.from(
      new Set([
        ...vendors.map((v) => v.name),
        ...purchaseOrders.map((po) => po.vendor).filter(Boolean),
      ])
    ).sort((a, b) => a.localeCompare(b));
    return PURCHASE_FILTERS.map((f) =>
      f.key === 'vendor' ? { ...f, options: ['All', ...vendorNames] } : f
    );
  }, [vendors, purchaseOrders]);

  const filtered = useMemo(() => {
    return purchaseOrders.filter((row) => {
      const asRecord = {
        ...row,
        poNumber: row.po_number,
        totalAmount: row.total_amount,
        requiredDate: row.required_date,
        paymentTerms: row.payment_terms,
        itemName: row.lines.map((l) => l.item_name).join(', '),
      } as unknown as Record<string, unknown>;
      if (!matchesSearch(asRecord, searchQuery)) return false;
      return applyFilters(asRecord, purchaseFilters, activeFilters);
    });
  }, [purchaseOrders, searchQuery, activeFilters, purchaseFilters]);

  const columns: Column<PurchaseOrderApi>[] = [
    { key: 'po_number', header: 'PO Number', render: (r) => <span className="erp-strong">{r.po_number}</span> },
    { key: 'vendor', header: 'Vendor', render: (r) => r.vendor },
    {
      key: 'lines',
      header: 'Items',
      render: (r) => (
        <span className="text-xs">
          {r.lines.map((line) => `${line.item_name} ${line.size ? `(${line.size})` : ''} × ${line.quantity}`).join(', ')}
        </span>
      ),
    },
    { key: 'tax_amount', header: 'Tax', render: (r) => formatPkr(Number(r.tax_amount)) },
    { key: 'total_amount', header: 'Amount', render: (r) => formatPkr(Number(r.total_amount)) },
    { key: 'required_date', header: 'Required', render: (r) => r.required_date ?? '—' },
    { key: 'payment_terms', header: 'Payment Terms', render: (r) => r.payment_terms || '—' },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${statusColor[r.status] ?? 'bg-slate-100 text-slate-600'}`}>
          {r.status}
        </span>
      ),
    },
    {
      key: 'id',
      header: 'Accept',
      render: (r) =>
        r.status === 'Pending' ? (
          <button
            type="button"
            className="erp-btn-ghost text-xs"
            disabled={approvingId === r.id}
            title="Accept purchase order"
            onClick={(e) => {
              e.stopPropagation();
              setApprovingId(r.id);
              void approvePurchaseOrderById(r.id)
                .then(() => window.alert(`Accepted ${r.po_number}`))
                .catch((err) =>
                  window.alert(err instanceof Error ? err.message : 'Failed to accept PO')
                )
                .finally(() => setApprovingId(null));
            }}
          >
            {approvingId === r.id ? '…' : 'Accept'}
          </button>
        ) : (
          <span className="text-xs erp-muted">—</span>
        ),
    },
  ];

  const pdfColumns = [
    { key: 'po_number', header: 'PO Number' },
    { key: 'vendor', header: 'Vendor' },
    { key: 'tax_amount', header: 'Tax' },
    { key: 'total_amount', header: 'Amount' },
    { key: 'required_date', header: 'Required' },
    { key: 'payment_terms', header: 'Payment Terms' },
    { key: 'status', header: 'Status' },
  ];

  const exportRows = filtered.map((row) => ({ ...row } as unknown as Record<string, unknown>));
  const { handleExportPdf, handlePrint, hasData } = useListExport({
    title: 'Purchase Orders',
    subtitle: 'Manage procurement and supplier orders',
    filename: 'purchase-orders',
    columns: pdfColumns,
    data: exportRows,
  });

  return (
    <ScreenFrame
      title="Purchase Orders"
      subtitle="Accept to approve · Receiving posts Dr Purchases / Cr Vendor (open for Vendor Payments)"
      toolbar={
        <PageToolbar
          onFilter={() => setFilterOpen((o) => !o)}
          onAdd={onOpenAdd}
          addLabel="+ New Purchase Order"
          onExportPdf={hasData ? handleExportPdf : undefined}
          onPrint={hasData ? handlePrint : undefined}
        />
      }
      formPanel={
        filterOpen ? (
          <FilterPanel
            filters={purchaseFilters}
            values={activeFilters}
            onChange={(key, value) => setActiveFilters((prev) => ({ ...prev, [key]: value }))}
            onClear={() => setActiveFilters({})}
          />
        ) : undefined
      }
    >
      {hasActiveFilters(purchaseFilters, activeFilters) && (
        <div className="px-3 pt-2 text-xs erp-muted">{filtered.length} result{filtered.length !== 1 ? 's' : ''}</div>
      )}
      <DataTable
        columns={columns}
        data={filtered}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        onEdit={onOpenEdit}
        onDelete={(row) => {
          confirmDelete(row.po_number, 'Purchase Order', () => {
            void deletePurchaseOrder(row.id);
          });
        }}
        keyExtractor={(row) => String(row.id)}
      />
    </ScreenFrame>
  );
}
