import { useEffect, useMemo, useState } from 'react';
import gatePassData from '../../data/json/gate-pass.json';
import PageToolbar from '../components/PageToolbar';
import ScreenFrame from '../components/ScreenFrame';
import RecordModal from '../components/RecordModal';
import StatCard from '../components/StatCard';
import DataTable, { Column } from '../components/DataTable';
import { GATE_PASS_FILTERS, GATE_PASS_INWARD_FIELDS, GATE_PASS_OUTWARD_FIELDS } from '../config/entityFields';
import { useErp } from '../context/ErpContext';
import { useConfirmDelete } from '../context/ThemeContext';
import { useListExport } from '../hooks/useListExport';
import FilterPanel from '../components/FilterPanel';
import { applyFilters, hasActiveFilters, matchesSearch } from '../utils/filter';
import { formatQuantityPcs } from '../utils/displayFormat';
import { PdfColumn } from '../utils/pdfExport';

type Pass = Record<string, unknown>;

const columns: Column<Pass>[] = [
  { key: 'passNumber', header: 'Pass #', render: (r) => <span className="erp-strong">{String(r.passNumber)}</span> },
  { key: 'party', header: 'Party', render: (r) => String(r.vendor ?? r.customer) },
  { key: 'productName', header: 'Product Name', render: (r) => String(r.productName) },
  { key: 'size', header: 'Size', render: (r) => String(r.size) },
  { key: 'quantityPcs', header: 'Qty (pcs)', highlight: true, render: (r) => formatQuantityPcs(r.quantityPcs) },
  { key: 'date', header: 'Date', render: (r) => String(r.date) },
  { key: 'status', header: 'Status', render: (r) => <span className="erp-badge erp-badge-green">{String(r.status)}</span> },
];

const pdfColumns: PdfColumn[] = [
  { key: 'passNumber', header: 'Pass #' },
  { key: 'party', header: 'Party' },
  { key: 'productName', header: 'Product Name' },
  { key: 'size', header: 'Size' },
  { key: 'quantityPcs', header: 'Qty (pcs)' },
  { key: 'vehicleNo', header: 'Vehicle' },
  { key: 'driver', header: 'Driver' },
  { key: 'date', header: 'Date' },
  { key: 'status', header: 'Status' },
];

interface GatePassScreenProps {
  searchQuery: string;
  tab: 'inward' | 'outward';
  onTabChange: (tab: 'inward' | 'outward') => void;
}

export default function GatePassScreen({ searchQuery, tab, onTabChange }: GatePassScreenProps) {
  const { inwardGatePasses, outwardGatePasses, inwardGatePassCrud, outwardGatePassCrud } = useErp();
  const confirmDelete = useConfirmDelete();
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Pass | undefined>();
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  const rawData = tab === 'inward' ? inwardGatePasses : outwardGatePasses;
  const crud = tab === 'inward' ? inwardGatePassCrud : outwardGatePassCrud;
  const fields = tab === 'inward' ? GATE_PASS_INWARD_FIELDS : GATE_PASS_OUTWARD_FIELDS;

  useEffect(() => { setPage(1); }, [searchQuery, activeFilters, tab]);

  const filtered = useMemo(() =>
    rawData.filter((row) => {
      if (!matchesSearch(row, searchQuery)) return false;
      return applyFilters(row, GATE_PASS_FILTERS, activeFilters);
    }),
  [rawData, searchQuery, activeFilters]);

  const { handleExportPdf, handlePrint, hasData } = useListExport({
    title: `${gatePassData.title} — ${tab === 'inward' ? 'Inward' : 'Outward'}`,
    subtitle: gatePassData.subtitle,
    filename: `gate-pass-${tab}`,
    columns: pdfColumns,
    data: filtered,
  });

  return (
    <>
      <ScreenFrame
        title={gatePassData.title}
        subtitle={gatePassData.subtitle}
        toolbar={
          <PageToolbar
            onFilter={() => setFilterOpen(!filterOpen)}
            onAdd={() => { setEditRecord(undefined); setModalOpen(true); }}
            addLabel="+ New Gate Pass"
            onExportPdf={handleExportPdf}
            onPrint={handlePrint}
            exportDisabled={!hasData}
          />
        }
        formPanel={
          <>
            <div className="mb-2 flex flex-wrap gap-2">
              {(['inward', 'outward'] as const).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => { onTabChange(t); setPage(1); }}
                  className={tab === t ? 'erp-btn-primary' : 'erp-btn-ghost'}
                >
                  {t === 'inward' ? 'Inward Gate Pass' : 'Outward Gate Pass'}
                </button>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
              {gatePassData.stats.map((s) => <StatCard key={s.label} label={s.label} value={String(s.value)} />)}
            </div>
            {filterOpen && (
              <div className="mt-2">
                <FilterPanel
                  filters={GATE_PASS_FILTERS}
                  values={activeFilters}
                  onChange={(key, value) => setActiveFilters((prev) => ({ ...prev, [key]: value }))}
                  onClear={() => setActiveFilters({})}
                />
              </div>
            )}
          </>
        }
      >
        {(searchQuery || hasActiveFilters(GATE_PASS_FILTERS, activeFilters)) && (
          <p className="erp-muted border-b border-[var(--color-erp-border)] px-3 py-2 text-xs">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            {searchQuery ? ` for "${searchQuery}"` : ''}
            {hasActiveFilters(GATE_PASS_FILTERS, activeFilters) ? ' (filtered)' : ''}
          </p>
        )}

        <DataTable
          columns={columns}
          data={filtered}
          page={page}
          pageSize={6}
          onPageChange={setPage}
          keyExtractor={(r) => String(r.id)}
          onEdit={(row) => { setEditRecord(row); setModalOpen(true); }}
          onDelete={(row) => confirmDelete(String(row.passNumber), 'Gate Pass', () => crud.remove(String(row.id)))}
        />
      </ScreenFrame>

      <RecordModal
        isOpen={modalOpen}
        mode={editRecord ? 'edit' : 'add'}
        title="Gate Pass"
        fields={fields}
        record={editRecord}
        onClose={() => { setModalOpen(false); setEditRecord(undefined); }}
        onSave={(data) => {
          if (editRecord?.id) crud.update(String(editRecord.id), data);
          else crud.add(data);
          setModalOpen(false);
          setEditRecord(undefined);
        }}
      />
    </>
  );
}
