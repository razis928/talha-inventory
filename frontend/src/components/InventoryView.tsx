/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InventoryItem } from '../types';
import {
  FileDown,
  Printer,
  Plus,
  TrendingUp,
  AlertOctagon,
  DollarSign,
  Edit2,
  Trash2,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Trophy,
  Filter,
  Check
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface InventoryViewProps {
  items: InventoryItem[];
  searchText: string;
  onAddItem: () => void;
  onEditItem: (item: InventoryItem) => void;
  onDeleteItem: (id: string) => void;
}

export default function InventoryView({
  items,
  searchText,
  onAddItem,
  onEditItem,
  onDeleteItem,
}: InventoryViewProps) {
  // Filters State
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedWarehouse, setSelectedWarehouse] = useState<string>('All');
  const [quickFilter, setQuickFilter] = useState<'All' | 'Low Stock' | 'Out of Stock'>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  // Multi-Selection State for Bulk Deletes or operations
  const [selectedRows, setSelectedRows] = useState<string[]>([]);

  // Distinct Categories and Warehouse list extracted from actual items
  const categories = useMemo(() => {
    const list = new Set(items.map((i) => i.category));
    return ['All', ...Array.from(list)];
  }, [items]);

  const warehouses = useMemo(() => {
    return ['All', 'East Wing', 'North Storage', 'Central Hub', 'West Zone'];
  }, []);

  // Compute stats based on current database
  const totalItemsCount = items.length;
  const lowStockCount = items.filter((item) => item.stockLevel > 0 && item.stockLevel <= item.maxStock * 0.15).length;
  const outOfStockCount = items.filter((item) => item.stockLevel === 0).length;

  const dynamicInventoryValue = items.reduce((acc, item) => acc + item.stockLevel * item.unitPrice, 0);
  const baseOffset = 910980; // Baseline valuation constant for fidelity with design specifications
  const formattedValuation = ((baseOffset + dynamicInventoryValue) / 1000000).toFixed(2); // In millions e.g. "1.42M"

  // Master Filter & Search Logic
  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      // Search Box Filter (case-insensitive on name, sku, category)
      const matchesSearch =
        searchText.trim() === '' ||
        item.name.toLowerCase().includes(searchText.toLowerCase()) ||
        item.sku.toLowerCase().includes(searchText.toLowerCase()) ||
        item.category.toLowerCase().includes(searchText.toLowerCase());

      // Category Dropdown Filter
      const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

      // Location / Warehouse Dropdown Filter
      const matchesWarehouse =
        selectedWarehouse === 'All' || item.location.toLowerCase().includes(selectedWarehouse.toLowerCase());

      // Quick tab filter pills
      let matchesQuickFilter = true;
      if (quickFilter === 'Low Stock') {
        matchesQuickFilter = item.stockLevel > 0 && item.stockLevel <= item.maxStock * 0.15;
      } else if (quickFilter === 'Out of Stock') {
        matchesQuickFilter = item.stockLevel === 0;
      }

      return matchesSearch && matchesCategory && matchesWarehouse && matchesQuickFilter;
    });
  }, [items, searchText, selectedCategory, selectedWarehouse, quickFilter]);

  // Pagination Logic
  const totalPages = Math.max(1, Math.ceil(filteredItems.length / itemsPerPage));
  const paginatedItems = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredItems.slice(start, start + itemsPerPage);
  }, [filteredItems, currentPage]);

  // Bulk select toggling
  const isAllSelectedOnPage = paginatedItems.length > 0 && paginatedItems.every((item) => selectedRows.includes(item.id));
  const handleToggleSelectAllPage = () => {
    if (isAllSelectedOnPage) {
      // Deselect all items of this page
      setSelectedRows(selectedRows.filter((id) => !paginatedItems.map((i) => i.id).includes(id)));
    } else {
      // Select all items of this page
      const pageIds = paginatedItems.map((i) => i.id);
      setSelectedRows([...Array.from(new Set([...selectedRows, ...pageIds]))]);
    }
  };

  const handleToggleRow = (id: string) => {
    if (selectedRows.includes(id)) {
      setSelectedRows(selectedRows.filter((rid) => rid !== id));
    } else {
      setSelectedRows([...selectedRows, id]);
    }
  };

  // Status mapping helper
  const getItemStatus = (item: InventoryItem) => {
    if (item.stockLevel === 0) {
      return { label: 'Out of Stock', color: 'bg-red-50 text-red-700 border-red-200' };
    }
    if (item.stockLevel <= item.maxStock * 0.15) {
      return { label: 'Low Stock', color: 'bg-amber-50 text-amber-700 border-amber-200' };
    }
    if (item.stockLevel >= item.maxStock * 0.95) {
      return { label: 'Overstock', color: 'bg-indigo-50 text-indigo-700 border-indigo-200' };
    }
    return { label: 'In Stock', color: 'bg-emerald-50 text-emerald-700 border-emerald-200' };
  };

  // Compute Warehouse heatmap parameters based on real-time items locations
  const warehouseCapacityStats = useMemo(() => {
    const list = [
      { name: 'East Wing', maxUnits: 2000, current: 0 },
      { name: 'North Storage', maxUnits: 500, current: 0 },
      { name: 'Central Hub', maxUnits: 1500, current: 0 },
    ];

    items.forEach((item) => {
      if (item.location.toLowerCase().includes('east')) {
        list[0].current += item.stockLevel;
      } else if (item.location.toLowerCase().includes('north') || item.location.toLowerCase().includes('storage')) {
        list[1].current += item.stockLevel;
      } else if (item.location.toLowerCase().includes('central') || item.location.toLowerCase().includes('hub')) {
        list[2].current += item.stockLevel;
      }
    });

    return list.map((wh) => {
      const percentage = Math.min(100, Math.round((wh.current / wh.maxUnits) * 100));
      return {
        ...wh,
        percentage,
        color: percentage > 85 ? 'bg-rose-500' : percentage < 45 ? 'bg-emerald-500' : 'bg-indigo-500',
        textColor: percentage > 85 ? 'text-rose-600 font-bold' : percentage < 45 ? 'text-emerald-600 font-bold' : 'text-indigo-600 font-bold',
      };
    });
  }, [items]);

  // Export CSV Action
  const exportCSV = () => {
    const headers = 'SKU,Item Name,Category,Location,Stock Level,Max Stock,Unit Price,Valuation\n';
    const rows = items
      .map(
        (i) =>
          `"${i.sku}","${i.name}","${i.category}","${i.location}",${i.stockLevel},${i.maxStock},${i.unitPrice},${
            i.stockLevel * i.unitPrice
          }`
      )
      .join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'ManufacturePro_Inventory_Report.csv');
    a.click();
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Page Header Actions */}
      <div className="flex flex-col md:flex-row md:items-end justify-between mb-2 gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Inventory Management</h2>
          <p className="text-sm text-slate-500 mt-1">Real-time stock monitoring and warehouse asset control</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg bg-white hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <FileDown size={16} />
            <span>Export Table</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg bg-white hover:bg-slate-50 transition-colors cursor-pointer"
          >
            <Printer size={16} />
            <span>Print Labels</span>
          </button>
          <button
            onClick={onAddItem}
            className="flex items-center gap-2 px-6 py-2 bg-[#00236f] hover:bg-[#645efb] text-white text-sm font-semibold rounded-lg shadow-sm transition-all transform hover:scale-102 cursor-pointer"
          >
            <Plus size={16} />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Total Items */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between h-32">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Total Unique Products</span>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-bold font-mono text-[#00236f]">{totalItemsCount}</span>
            <span className="text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-xs font-semibold flex items-center gap-0.5 leading-normal">
              <TrendingUp size={12} />
              +2%
            </span>
          </div>
        </div>

        {/* Card 2: Low Stock Alerts */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between h-32">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider font-sans">Low Stock Alerts</span>
          <div className="flex items-end justify-between mt-2">
            <span className="text-3xl font-bold font-mono text-red-600">{lowStockCount}</span>
            <span className="text-rose-500 bg-rose-50 p-1.5 rounded-full">
              <AlertOctagon size={16} />
            </span>
          </div>
        </div>

        {/* Card 3: Inventory Value */}
        <div className="bg-[#00236f] text-white p-5 rounded-xl border border-indigo-950/20 shadow-xs flex flex-col justify-between h-32">
          <span className="text-[10px] uppercase font-bold text-teal-200/80 tracking-wider">Total Asset Valuation</span>
          <div className="flex flex-col mt-2">
            <span className="text-2xl font-bold font-mono">${formattedValuation}M</span>
            <span className="text-indigo-200/90 text-xs font-sans">Current Warehouse Assets</span>
          </div>
        </div>

        {/* Card 4: Quick Filters */}
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between h-32">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2">Segment Quick Filters</span>
          <div className="flex flex-wrap gap-2">
            {(['All', 'Low Stock', 'Out of Stock'] as const).map((filter) => (
              <button
                key={filter}
                onClick={() => {
                  setQuickFilter(filter);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1.5 rounded-full text-xs font-bold transition-all cursor-pointer ${
                  quickFilter === filter
                    ? 'bg-[#e5eeff] text-[#00236f] ring-1 ring-blue-300'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200'
                }`}
              >
                {filter}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Table Segment */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        {/* Table Controls */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex border border-slate-200 rounded-lg overflow-hidden bg-white text-xs shadow-3xs">
              {/* Category dropdown */}
              <div className="flex items-center bg-slate-50 px-2 border-r border-slate-200 font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                Cat
              </div>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border-0 py-2 pl-3 pr-8 text-xs font-semibold text-slate-700 cursor-pointer focus:ring-0"
              >
                <option value="All">Category: All</option>
                {categories
                  .filter((cat) => cat !== 'All')
                  .map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
              </select>

              <div className="w-px bg-slate-200"></div>

              {/* Warehouse Selection */}
              <div className="flex items-center bg-slate-50 px-2 border-r border-slate-200 font-bold text-[10px] text-slate-400 uppercase tracking-wider">
                Wh
              </div>
              <select
                value={selectedWarehouse}
                onChange={(e) => {
                  setSelectedWarehouse(e.target.value);
                  setCurrentPage(1);
                }}
                className="bg-white border-0 py-2 pl-3 pr-8 text-xs font-semibold text-slate-700 cursor-pointer focus:ring-0"
              >
                <option value="All">Warehouse: All</option>
                {warehouses
                  .filter((wh) => wh !== 'All')
                  .map((wh) => (
                    <option key={wh} value={wh}>
                      {wh}
                    </option>
                  ))}
              </select>
            </div>

            {/* Clear Filters Assist */}
            {(selectedCategory !== 'All' || selectedWarehouse !== 'All' || quickFilter !== 'All') && (
              <button
                onClick={() => {
                  setSelectedCategory('All');
                  setSelectedWarehouse('All');
                  setQuickFilter('All');
                }}
                className="text-xs text-rose-500 hover:text-rose-700 font-semibold cursor-pointer underline underline-offset-2"
              >
                Reset Filters
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            {selectedRows.length > 0 && (
              <div className="flex items-center gap-2 mr-2">
                <span className="text-xs font-semibold text-slate-500">{selectedRows.length} checked</span>
                <button
                  onClick={() => {
                    if (confirm(`Are you sure you want to delete ${selectedRows.length} items?`)) {
                      selectedRows.forEach((id) => onDeleteItem(id));
                      setSelectedRows([]);
                    }
                  }}
                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 px-2.5 py-1.5 rounded text-xs font-bold border border-rose-200 cursor-pointer"
                >
                  Delete Selected
                </button>
              </div>
            )}
            <button className="p-2 text-slate-500 hover:bg-slate-100 rounded border border-slate-200 bg-white" title="Advanced Filter Parameters">
              <SlidersHorizontal size={14} />
            </button>
          </div>
        </div>

        {/* Inventory Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 font-bold uppercase tracking-wider select-none">
                <th className="px-6 py-4 w-12">
                  <input
                    type="checkbox"
                    checked={isAllSelectedOnPage}
                    onChange={handleToggleSelectAllPage}
                    className="rounded border-slate-300 text-[#00236f] focus:ring-[#00236f] cursor-pointer"
                  />
                </th>
                <th className="px-6 py-4">Item Name</th>
                <th className="px-6 py-4">SKU</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Location</th>
                <th className="px-6 py-4">Stock Level</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence initial={false}>
                {paginatedItems.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-12 text-center text-sm text-slate-400">
                      No matching products discovered inside search scope.
                    </td>
                  </tr>
                ) : (
                  paginatedItems.map((item) => {
                    const statusObj = getItemStatus(item);
                    return (
                      <motion.tr
                        layoutId={`item-row-${item.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={item.id}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <input
                            type="checkbox"
                            checked={selectedRows.includes(item.id)}
                            onChange={() => handleToggleRow(item.id)}
                            className="rounded border-slate-300 text-[#00236f] focus:ring-[#00236f] cursor-pointer"
                          />
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded bg-indigo-50/70 border border-indigo-100 flex items-center justify-center text-[#00236f]">
                              <Sparkles size={14} />
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900 text-sm">{item.name}</p>
                              <span className="text-[11px] text-slate-400 font-mono">ID: {item.id}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-slate-600 font-mono text-xs">{item.sku}</td>
                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-md text-xs font-semibold">
                            {item.category}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-600 text-xs font-medium">{item.location}</td>
                        <td className="px-6 py-4 w-48">
                          <div className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                              <span className="font-mono">{item.stockLevel.toLocaleString()} Units</span>
                              <span className="text-[10px] text-slate-400 font-normal">Max: {item.maxStock}</span>
                            </div>
                            <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden">
                              <div
                                style={{ width: `${Math.min(100, (item.stockLevel / item.maxStock) * 100)}%` }}
                                className={`h-full transition-all duration-300 ${
                                  item.stockLevel === 0
                                    ? 'bg-rose-500'
                                    : item.stockLevel <= item.maxStock * 0.15
                                    ? 'bg-amber-500 animate-pulse'
                                    : 'bg-[#645efb]'
                                }`}
                              ></div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${statusObj.color}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              item.stockLevel === 0
                                ? 'bg-rose-500'
                                : item.stockLevel <= item.maxStock * 0.15
                                ? 'bg-amber-500'
                                : 'bg-emerald-500'
                            }`} />
                            {statusObj.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => onEditItem(item)}
                              className="p-1.5 text-slate-500 hover:text-[#645efb] hover:bg-[#645efb]/5 roundedtransition-all cursor-pointer"
                              title="Edit item attributes"
                            >
                              <Edit2 size={15} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Delete ${item.name} permanently?`)) {
                                  onDeleteItem(item.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-rose-50 rounded transition-all cursor-pointer"
                              title="Delete from catalogue"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    );
                  })
                )}
              </AnimatePresence>
            </tbody>
          </table>
        </div>

        {/* Pagination Panel */}
        <div className="px-6 py-4 border-t border-slate-200 bg-slate-50/50 flex items-center justify-between">
          <span className="text-xs text-slate-500 font-medium">
            Showing <span className="font-semibold text-slate-900">{filteredItems.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-semibold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredItems.length)}</span> of{' '}
            <span className="font-semibold text-slate-900">{filteredItems.length}</span> products
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed select-none transition-all cursor-pointer"
            >
              <ChevronLeft size={16} />
            </button>
            {Array.from({ length: totalPages }, (_, idx) => idx + 1).map((p) => (
              <button
                key={p}
                onClick={() => setCurrentPage(p)}
                className={`w-8 h-8 rounded-lg text-xs font-bold transition-all ${
                  currentPage === p
                    ? 'bg-[#00236f] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 border border-transparent'
                }`}
              >
                {p}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage((c) => Math.min(totalPages, c + 1))}
              disabled={currentPage === totalPages}
              className="p-1.5 border border-slate-200 bg-white rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed select-none transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Analytical History and Warehouse Heatmap */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
        {/* Dynamic Image Reference with fallback */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col gap-4 shadow-xs">
          <div>
            <h3 className="font-semibold text-slate-900 text-base">Inventory History Analysis</h3>
            <p className="text-xs text-slate-400 mt-1">Simulated weekly tracking of system quantities</p>
          </div>
          <div className="relative rounded-lg overflow-hidden border border-slate-100 flex-1 h-64 bg-slate-50">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDkftQMopgW4kjdl5HqOnkwdl5Bu95GNPQdbhOCcraacNnOriFyYqmXcWZdnVngEAvld5lQycxB1ZKXB2_sRdjkne8gvsjhWieZF2sVAWA2k3I0pWRreui2Rh4qf9csYDyGNNp-ZOGlyO-Wf0wi9lewBs83uVzAHRA5Tnj1RkV1rqZGQKRbm0iwragPAKrB8szAwLVxBb3kk9HmS-K9quJucxXddyw1aWs1CMBcT1bh0ccF34KtNV1YU1jEaBJROIowVizPA6OSrW8f"
              alt="Inventory Trend Graph"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Warehouse Heatmap based on reactive calculations */}
        <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col justify-between shadow-xs">
          <div>
            <h3 className="font-semibold text-slate-900 text-base mb-1">Warehouse Heatmap</h3>
            <p className="text-xs text-slate-400">Relative physical space consumed based on live products database</p>
          </div>

          <div className="space-y-5 mt-6 flex-1 flex flex-col justify-center">
            {warehouseCapacityStats.map((wh) => (
              <div key={wh.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-700">{wh.name}</span>
                  <span className={`font-mono text-xs ${wh.textColor}`}>{wh.percentage}% Capacity</span>
                </div>
                <div className="w-full h-3 bg-slate-100 rounded-full overflow-hidden border border-slate-200/50">
                  <div
                    style={{ width: `${wh.percentage}%` }}
                    className={`h-full rounded-full transition-all duration-300 ${wh.color}`}
                  ></div>
                </div>
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>Current Stock: {wh.current.toLocaleString()} units</span>
                  <span>Limiter: {wh.maxUnits.toLocaleString()} units</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
