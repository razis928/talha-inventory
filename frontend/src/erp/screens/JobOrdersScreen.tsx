import { useMemo, useState } from 'react';
import DataTable, { Column } from '../components/DataTable';
import FilterPanel from '../components/FilterPanel';
import PageToolbar from '../components/PageToolbar';
import ScreenFrame from '../components/ScreenFrame';
import { JOB_ORDER_FILTERS } from '../config/entityFields';
import { useErp } from '../context/ErpContext';
import { useConfirmDelete } from '../context/ThemeContext';
import { JobOrderApi } from '../api/jobOrders';
import { useListExport } from '../hooks/useListExport';
import { applyFilters, hasActiveFilters, matchesSearch } from '../utils/filter';
import { formatPkr } from '../utils/currency';

const PAGE_SIZE = 6;

const statusColor: Record<string, string> = {
  Pending: 'bg-amber-50 text-amber-700',
  'In Progress': 'bg-blue-50 text-blue-700',
  Completed: 'bg-emerald-50 text-emerald-700',
  Cancelled: 'bg-slate-100 text-slate-600',
};

interface JobOrdersScreenProps {
  searchQuery: string;
  onOpenAdd: () => void;
  onOpenEdit: (record: JobOrderApi) => void;
}

export default function JobOrdersScreen({ searchQuery, onOpenAdd, onOpenEdit }: JobOrdersScreenProps) {
  const { jobOrders, deleteJobOrder, customers } = useErp();
  const confirmDelete = useConfirmDelete();
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const jobFilters = useMemo(() => {
    const customerNames = Array.from(
      new Set([
        ...customers.map((c) => c.name),
        ...jobOrders.map((j) => j.customer_name).filter(Boolean),
      ])
    ).sort((a, b) => a.localeCompare(b));
    return JOB_ORDER_FILTERS.map((f) =>
      f.key === 'customer' ? { ...f, options: ['All', ...customerNames] } : f
    );
  }, [customers, jobOrders]);

  const filtered = useMemo(() => {
    return jobOrders.filter((row) => {
      const asRecord = {
        ...row,
        jobNumber: row.job_number,
        customer: row.customer_name,
        totalAmount: row.total_amount,
        requiredDate: row.required_date,
        itemName: row.lines.map((l) => l.item_name).join(', '),
      } as unknown as Record<string, unknown>;
      if (!matchesSearch(asRecord, searchQuery)) return false;
      return applyFilters(asRecord, jobFilters, activeFilters);
    });
  }, [jobOrders, searchQuery, activeFilters, jobFilters]);

  const columns: Column<JobOrderApi>[] = [
    { key: 'job_number', header: 'Job No', render: (r) => <span className="erp-strong">{r.job_number}</span> },
    { key: 'customer_name', header: 'Customer', render: (r) => r.customer_name },
    {
      key: 'lines',
      header: 'Items',
      render: (r) => (
        <span className="text-xs">
          {r.lines
            .map((line) => `${line.item_name} (ord ${line.order_quantity}/pend ${line.order_pending_quantity})`)
            .join(', ')}
        </span>
      ),
    },
    { key: 'tax_amount', header: 'Tax', render: (r) => formatPkr(Number(r.tax_amount)) },
    { key: 'total_amount', header: 'Amount', render: (r) => formatPkr(Number(r.total_amount)) },
    { key: 'required_date', header: 'Required', render: (r) => r.required_date ?? '—' },
    {
      key: 'status',
      header: 'Status',
      render: (r) => (
        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${statusColor[r.status] ?? 'bg-slate-100 text-slate-600'}`}>
          {r.status}
        </span>
      ),
    },
  ];

  const pdfColumns = [
    { key: 'job_number', header: 'Job No' },
    { key: 'customer_name', header: 'Customer' },
    { key: 'tax_amount', header: 'Tax' },
    { key: 'total_amount', header: 'Amount' },
    { key: 'required_date', header: 'Required' },
    { key: 'status', header: 'Status' },
  ];

  const exportRows = filtered.map((row) => ({ ...row } as unknown as Record<string, unknown>));
  const { handleExportPdf, handlePrint, hasData } = useListExport({
    title: 'Job Orders',
    subtitle: 'Production / job order management',
    filename: 'job-orders',
    columns: pdfColumns,
    data: exportRows,
  });

  return (
    <ScreenFrame
      title="Job Orders"
      subtitle="Dispatch posts Dr Customer receivable / Cr Sales automatically"
      toolbar={
        <PageToolbar
          onFilter={() => setFilterOpen((o) => !o)}
          onAdd={onOpenAdd}
          addLabel="+ New Job Order"
          onExportPdf={hasData ? handleExportPdf : undefined}
          onPrint={hasData ? handlePrint : undefined}
        />
      }
      formPanel={
        filterOpen ? (
          <FilterPanel
            filters={jobFilters}
            values={activeFilters}
            onChange={(key, value) => setActiveFilters((prev) => ({ ...prev, [key]: value }))}
            onClear={() => setActiveFilters({})}
          />
        ) : undefined
      }
    >
      {hasActiveFilters(jobFilters, activeFilters) && (
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
          confirmDelete(row.job_number, 'Job Order', () => {
            void deleteJobOrder(row.id);
          });
        }}
        keyExtractor={(row) => String(row.id)}
      />
    </ScreenFrame>
  );
}
