import { useEffect, useMemo, useState } from 'react';
import DataTable, { Column } from '../components/DataTable';
import PageToolbar from '../components/PageToolbar';
import ScreenFrame from '../components/ScreenFrame';
import StatCard from '../components/StatCard';
import { FieldDef, FilterDef } from '../config/entityFields';
import { useConfirmDelete } from '../context/ThemeContext';
import { useListExport } from '../hooks/useListExport';
import { PdfColumn } from '../utils/pdfExport';
import FilterPanel from '../components/FilterPanel';
import RecordModal from '../components/RecordModal';
import { applyFilters, hasActiveFilters, matchesSearch } from '../utils/filter';

interface GenericListScreenProps {
  title: string;
  subtitle: string;
  entityName: string;
  stats?: { label: string; value: string | number }[];
  columns: Column<Record<string, unknown>>[];
  data: Record<string, unknown>[];
  searchQuery: string;
  fields: FieldDef[];
  filters?: FilterDef[];
  addLabel?: string;
  pageSize?: number;
  onAdd: (data: Record<string, unknown>) => void | Promise<void>;
  onEdit: (id: string, data: Record<string, unknown>) => void | Promise<void>;
  onDelete: (id: string) => void | Promise<void>;
  deleteConfirmField?: string;
  pdfColumns?: PdfColumn[];
  pdfFilename?: string;
  onOpenAdd?: () => void;
  onOpenEdit?: (record: Record<string, unknown>) => void;
}

export default function GenericListScreen({
  title,
  subtitle,
  entityName,
  stats,
  columns,
  data,
  searchQuery,
  fields,
  filters = [],
  addLabel,
  pageSize = 6,
  onAdd,
  onEdit,
  onDelete,
  deleteConfirmField = 'name',
  pdfColumns,
  pdfFilename,
  onOpenAdd,
  onOpenEdit,
}: GenericListScreenProps) {
  const usePageForm = Boolean(onOpenAdd && onOpenEdit);
  const [page, setPage] = useState(1);
  const [modalOpen, setModalOpen] = useState(false);
  const [editRecord, setEditRecord] = useState<Record<string, unknown> | undefined>();
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});
  const confirmDelete = useConfirmDelete();

  useEffect(() => {
    setPage(1);
  }, [searchQuery, activeFilters]);

  const filtered = useMemo(() => {
    return data.filter((row) => {
      if (!matchesSearch(row, searchQuery)) return false;
      return applyFilters(row, filters, activeFilters);
    });
  }, [data, searchQuery, activeFilters, filters]);

  const handleSave = (formData: Record<string, unknown>) => {
    void (async () => {
      try {
        if (editRecord?.id) await onEdit(String(editRecord.id), formData);
        else await onAdd(formData);
        setModalOpen(false);
        setEditRecord(undefined);
      } catch {
        // Caller shows error alert; keep modal open
      }
    })();
  };

  const exportColumns = pdfColumns ?? columns.map((c) => ({ key: c.key, header: c.header }));
  const { handleExportPdf, handlePrint, hasData } = useListExport({
    title,
    subtitle,
    filename: pdfFilename ?? title.toLowerCase().replace(/\s+/g, '-'),
    columns: exportColumns,
    data: filtered,
  });

  const formPanel = (
    <>
      {filterOpen && filters.length > 0 && (
        <FilterPanel
          filters={filters}
          values={activeFilters}
          onChange={(key, value) => setActiveFilters((prev) => ({ ...prev, [key]: value }))}
          onClear={() => setActiveFilters({})}
        />
      )}
      {stats && stats.length > 0 && (
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          {stats.map((s) => (
            <StatCard key={s.label} label={s.label} value={String(s.value)} />
          ))}
        </div>
      )}
    </>
  );

  const hasFormPanel = (filterOpen && filters.length > 0) || (stats && stats.length > 0);

  return (
    <div className="space-y-3">
      <ScreenFrame
        title={title}
        subtitle={subtitle}
        toolbar={
          <PageToolbar
            onFilter={filters.length ? () => setFilterOpen((o) => !o) : undefined}
            onAdd={addLabel && onOpenAdd ? onOpenAdd : addLabel ? () => { setEditRecord(undefined); setModalOpen(true); } : undefined}
            addLabel={addLabel}
            onExportPdf={handleExportPdf}
            onPrint={handlePrint}
            exportDisabled={!hasData}
          />
        }
        formPanel={hasFormPanel ? formPanel : undefined}
      >
        {(searchQuery || hasActiveFilters(filters, activeFilters)) && (
          <p className="erp-muted border-b border-[var(--color-erp-border)] px-3 py-2 text-xs">
            {filtered.length} result{filtered.length !== 1 ? 's' : ''}
            {searchQuery ? ` for "${searchQuery}"` : ''}
            {hasActiveFilters(filters, activeFilters) ? ' (filtered)' : ''}
          </p>
        )}

        <DataTable
          columns={columns}
          data={filtered}
          page={page}
          pageSize={pageSize}
          onPageChange={setPage}
          keyExtractor={(row) => String(row.id)}
          onEdit={onOpenEdit ? (row) => onOpenEdit(row) : (row) => { setEditRecord(row); setModalOpen(true); }}
          onDelete={(row) => {
            const label = String(row[deleteConfirmField] ?? row.id);
            confirmDelete(label, entityName, () => onDelete(String(row.id)));
          }}
        />
      </ScreenFrame>

      {!usePageForm && (
        <RecordModal
          isOpen={modalOpen}
          mode={editRecord ? 'edit' : 'add'}
          title={entityName}
          fields={fields}
          record={editRecord}
          onClose={() => { setModalOpen(false); setEditRecord(undefined); }}
          onSave={handleSave}
        />
      )}
    </div>
  );
}
