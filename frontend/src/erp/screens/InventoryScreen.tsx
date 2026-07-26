import { useEffect, useMemo, useState } from 'react';
import inventoryData from '../../data/json/inventory.json';
import DataTable, { Column } from '../components/DataTable';
import FilterPanel from '../components/FilterPanel';
import PageToolbar from '../components/PageToolbar';
import ScreenFrame from '../components/ScreenFrame';
import { INVENTORY_FILTERS } from '../config/entityFields';
import { useErp } from '../context/ErpContext';
import { useConfirmDelete } from '../context/ThemeContext';
import { InventoryItem } from '../types';
import { useListExport } from '../hooks/useListExport';
import { applyFilters, hasActiveFilters, matchesSearch } from '../utils/filter';
import { formatPkrPrice } from '../utils/currency';

interface InventoryScreenProps {
  searchQuery: string;
  onViewStock: (item: InventoryItem) => void;
  onAdd: () => void;
  onEdit: (item: InventoryItem) => void;
}

const PAGE_SIZE = 6;

export default function InventoryScreen({ searchQuery, onViewStock, onAdd, onEdit }: InventoryScreenProps) {
  const { inventory, inventoryLoading, inventoryError, refreshInventory, deleteInventory } = useErp();
  const confirmDelete = useConfirmDelete();
  const [page, setPage] = useState(1);
  const [filterOpen, setFilterOpen] = useState(false);
  const [activeFilters, setActiveFilters] = useState<Record<string, string>>({});

  useEffect(() => {
    setPage(1);
  }, [searchQuery, activeFilters]);

  const filterDefs = useMemo(() => {
    const categories = Array.from(
      new Set([
        ...inventoryData.categories,
        ...inventory.map((i) => i.category).filter(Boolean),
      ]),
    ).sort();
    return INVENTORY_FILTERS.map((f) =>
      f.key === 'category' ? { ...f, options: ['All', ...categories] } : f,
    );
  }, [inventory]);

  const filtered = useMemo(() => {
    return inventory.filter((item) => {
      const row = item as unknown as Record<string, unknown>;
      if (!matchesSearch(row, searchQuery)) return false;
      return applyFilters(row, filterDefs, activeFilters);
    });
  }, [inventory, searchQuery, activeFilters, filterDefs]);

  const columns: Column<InventoryItem>[] = [
    {
      key: 'name',
      header: 'Item Name',
      render: (row) => (
        <button type="button" onClick={() => onViewStock(row)} className="erp-strong underline">
          {row.name}
        </button>
      ),
    },
    { key: 'sku', header: 'Item Code', render: (row) => row.sku },
    {
      key: 'type',
      header: 'Type',
      render: (row) => (
        <span className={`erp-badge ${row.type === 'Raw' ? 'erp-badge-blue' : 'erp-badge-green'}`}>
          {row.type}
        </span>
      ),
    },
    { key: 'category', header: 'Category', render: (row) => row.category },
    { key: 'gsm', header: 'GSM', highlight: true, render: (row) => row.gsm },
    { key: 'size', header: 'Size', highlight: true, render: (row) => row.size },
    { key: 'unit', header: 'Unit', render: (row) => row.unit },
    { key: 'stockLevel', header: 'Stock Qty', highlight: true, render: (row) => row.stockLevel },
    { key: 'minStock', header: 'Demand Qty', highlight: true, render: (row) => row.minStock },
    {
      key: 'costPrice',
      header: 'Item Price',
      render: (row) => formatPkrPrice(row.costPrice || row.sellingPrice),
    },
  ];

  const pdfColumns = [
    { key: 'name', header: 'Item' },
    { key: 'type', header: 'Type' },
    { key: 'category', header: 'Category' },
    { key: 'gsm', header: 'GSM' },
    { key: 'size', header: 'Size' },
    { key: 'unit', header: 'Unit' },
    { key: 'costPrice', header: 'Item Price' },
    { key: 'stockLevel', header: 'Stock' },
    { key: 'sku', header: 'SKU' },
  ];
  const { handleExportPdf, handlePrint, hasData } = useListExport({
    title: inventoryData.title,
    subtitle: inventoryData.subtitle,
    filename: 'inventory-stock',
    columns: pdfColumns,
    data: filtered as unknown as Record<string, unknown>[],
  });

  return (
    <ScreenFrame
      title={inventoryData.title}
      subtitle={inventoryData.subtitle}
      toolbar={
        <PageToolbar
          onFilter={() => setFilterOpen(!filterOpen)}
          onAdd={onAdd}
          addLabel="+ Add Item"
          onExportPdf={handleExportPdf}
          onPrint={handlePrint}
          exportDisabled={!hasData}
        />
      }
      formPanel={
        filterOpen ? (
          <FilterPanel
            filters={filterDefs}
            values={activeFilters}
            onChange={(key, value) => setActiveFilters((prev) => ({ ...prev, [key]: value }))}
            onClear={() => setActiveFilters({})}
          />
        ) : undefined
      }
    >
      {inventoryError && (
        <div className="erp-muted flex flex-wrap items-center justify-between gap-2 border-b border-[var(--color-erp-border)] px-3 py-2 text-xs text-red-600">
          <span>Failed to load inventory: {inventoryError}</span>
          <button type="button" className="erp-btn-ghost" onClick={() => void refreshInventory()}>
            Retry
          </button>
        </div>
      )}

      {inventoryLoading && (
        <p className="erp-muted border-b border-[var(--color-erp-border)] px-3 py-2 text-xs">
          Loading inventory…
        </p>
      )}

      {(searchQuery || hasActiveFilters(filterDefs, activeFilters)) && (
        <p className="erp-muted border-b border-[var(--color-erp-border)] px-3 py-2 text-xs">
          {filtered.length} result{filtered.length !== 1 ? 's' : ''}
          {searchQuery ? ` for "${searchQuery}"` : ''}
          {hasActiveFilters(filterDefs, activeFilters) ? ' (filtered)' : ''}
        </p>
      )}

      <DataTable
        columns={columns}
        data={filtered}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        keyExtractor={(row) => row.id}
        onEdit={onEdit}
        onDelete={(row) =>
          confirmDelete(row.name, 'Inventory Item', () => {
            void deleteInventory(row.id).catch((err) => {
              window.alert(err instanceof Error ? err.message : 'Failed to delete inventory item');
            });
          })
        }
      />
    </ScreenFrame>
  );
}
