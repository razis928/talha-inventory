/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { PurchaseOrder, Vendor, TimelineActivity, POStatus } from '../types';
import {
  Plus,
  Receipt,
  FileSpreadsheet,
  FileMinus,
  ChevronDown,
  Eye,
  Edit,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Award,
  Clock,
  ExternalLink,
  ShieldCheck,
  TrendingUp
} from 'lucide-react';
import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface PurchaseViewProps {
  purchaseOrders: PurchaseOrder[];
  vendors: Vendor[];
  timeline: TimelineActivity[];
  searchText: string;
  onCreatePO: () => void;
  onEditPO: (po: PurchaseOrder) => void;
  onDeletePO: (id: string) => void;
  onChangePOStatus: (id: string, nextStatus: POStatus) => void;
}

export default function PurchaseView({
  purchaseOrders,
  vendors,
  timeline,
  searchText,
  onCreatePO,
  onEditPO,
  onDeletePO,
  onChangePOStatus,
}: PurchaseViewProps) {
  // Local Filter segment
  const [selectedStatus, setSelectedStatus] = useState<POStatus | 'All'>('All');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 5;

  // Search and status mapping
  const filteredPOs = useMemo(() => {
    return purchaseOrders.filter((po) => {
      const matchesSearch =
        searchText.trim() === '' ||
        po.poNumber.toLowerCase().includes(searchText.toLowerCase()) ||
        po.vendorName.toLowerCase().includes(searchText.toLowerCase()) ||
        po.vendorCategory.toLowerCase().includes(searchText.toLowerCase());

      const matchesStatus = selectedStatus === 'All' || po.status === selectedStatus;

      return matchesSearch && matchesStatus;
    });
  }, [purchaseOrders, searchText, selectedStatus]);

  // Pagination bounds
  const totalPages = Math.max(1, Math.ceil(filteredPOs.length / itemsPerPage));
  const paginatedPOs = useMemo(() => {
    const start = (currentPage - 1) * itemsPerPage;
    return filteredPOs.slice(start, start + itemsPerPage);
  }, [filteredPOs, currentPage]);

  // Live Math calculations
  const totalPOsCount = purchaseOrders.length;
  const pendingApprovalCount = purchaseOrders.filter((po) => po.status === 'Pending').length;
  const pendingGRNCount = purchaseOrders.filter((po) => po.status === 'Approved').length;

  const totalProcurementSpend = useMemo(() => {
    return purchaseOrders.reduce((sum, po) => sum + po.totalAmount, 0);
  }, [purchaseOrders]);

  const formattedSpend = useMemo(() => {
    if (totalProcurementSpend >= 1000) {
      return `$${(totalProcurementSpend / 1000).toFixed(0)}K`;
    }
    return `$${totalProcurementSpend.toLocaleString()}`;
  }, [totalProcurementSpend]);

  const getStatusStyle = (status: POStatus) => {
    switch (status) {
      case 'Pending':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'Approved':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Received':
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
  };

  const formattedDate = (dateStr: string) => {
    try {
      const parts = dateStr.split('-');
      if (parts.length === 3) {
        const d = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
      }
      return dateStr;
    } catch {
      return dateStr;
    }
  };

  return (
    <div className="space-y-6 select-none font-sans">
      {/* Page Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Purchase Management</h2>
          <nav className="flex items-center gap-1.5 text-xs text-slate-500 mt-1">
            <span className="hover:text-slate-800 cursor-pointer">Dashboard</span>
            <span className="opacity-70">/</span>
            <span className="text-[#00236f] font-semibold">Purchase Orders</span>
          </nav>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => alert("Creating simulated Goods Receiving Note (GRN) from approved purchase orders...")}
            className="flex items-center gap-2 px-4 py-2.5 bg-white border border-[#00236f] text-[#00236f] font-semibold text-xs rounded-lg hover:bg-slate-50 transition-all transform active:scale-98 cursor-pointer"
          >
            <Receipt size={14} />
            <span>GRN (Goods Receiving Note)</span>
          </button>
          <button
            onClick={onCreatePO}
            className="flex items-center gap-2 px-6 py-2.5 bg-[#00236f] hover:bg-[#645efb] text-white font-semibold text-xs rounded-lg shadow-lg shadow-blue-900/10 transition-all transform active:scale-98 cursor-pointer animate-fade-in"
          >
            <Plus size={14} />
            <span>Create PO</span>
          </button>
        </div>
      </div>

      {/* Dashboard Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-5">
        {/* POs Count */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Total POs (Monthly)</span>
            <span className="text-blue-600 bg-blue-50 p-1 rounded-md">
              <Clock size={16} />
            </span>
          </div>
          <div className="text-3xl font-bold font-mono text-[#00236f] mt-1">{totalPOsCount}</div>
          <div className="text-emerald-600 flex items-center gap-1 text-[11px] font-bold mt-2">
            <TrendingUp size={11} />
            12% increase YTD
          </div>
        </div>

        {/* Pending Approval */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Pending Approval</span>
            <span className="text-amber-600 bg-amber-50 p-1 rounded-md">
              <Clock size={16} />
            </span>
          </div>
          <div className="text-3xl font-bold font-mono text-[#00236f] mt-1">{pendingApprovalCount}</div>
          <div className="text-amber-600 text-[11px] font-semibold mt-2">
            Requires Management Action
          </div>
        </div>

        {/* Pending GRN */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Pending GRN</span>
            <span className="text-indigo-600 bg-indigo-50 p-1 rounded-md">
              <Receipt size={16} />
            </span>
          </div>
          <div className="text-3xl font-bold font-mono text-[#00236f] mt-1">{pendingGRNCount}</div>
          <div className="text-slate-500 text-[11px] font-medium mt-2">
            Estimated inbound deliveries today
          </div>
        </div>

        {/* Total Spend */}
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between mb-2">
            <span className="text-slate-400 font-bold text-[10px] uppercase tracking-wider">Total Quarterly Spend</span>
            <span className="text-emerald-600 bg-emerald-50 p-1 rounded-md">
              <Award size={16} />
            </span>
          </div>
          <div className="text-3xl font-bold font-mono text-emerald-600 mt-1">{formattedSpend}</div>
          <div className="text-slate-500 text-[11px] font-medium mt-2">
            Enterprise procurement ledger
          </div>
        </div>
      </div>

      {/* Segment Filtering Banner */}
      <div className="bg-slate-50 p-4 rounded-t-xl border-x border-t border-slate-200 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button className="bg-white border border-slate-200 px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 text-slate-700 hover:bg-slate-50 cursor-pointer">
            <Clock size={13} />
            <span>Filter</span>
          </button>
          <div className="h-5 w-px bg-slate-300"></div>
          <div className="flex items-center gap-1 bg-white border border-slate-200 rounded-lg p-0.5">
            {(['All', 'Pending', 'Approved', 'Received'] as const).map((status) => (
              <button
                key={status}
                onClick={() => {
                  setSelectedStatus(status);
                  setCurrentPage(1);
                }}
                className={`px-3 py-1 text-xs font-bold rounded-md transition-all cursor-pointer ${
                  selectedStatus === status
                    ? 'bg-[#00236f] text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50'
                }`}
              >
                {status}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium font-sans">Export as:</span>
          <button
            onClick={() => alert("Exporting current purchases spreadsheet payload (CSV)...")}
            className="p-1 px-2 hover:bg-slate-200 rounded text-xs font-semibold text-slate-600 flex items-center gap-1 border border-slate-200 bg-white cursor-pointer"
            title="Export CSV Payload"
          >
            <FileSpreadsheet size={14} className="text-emerald-600" />
            <span>CSV</span>
          </button>
          <button
            onClick={() => alert("Generating print-ready PDF invoice ledger...")}
            className="p-1 px-2 hover:bg-slate-200 rounded text-xs font-semibold text-slate-600 flex items-center gap-1 border border-slate-200 bg-white cursor-pointer"
            title="Export PDF Document"
          >
            <FileMinus size={14} className="text-rose-500" />
            <span>PDF</span>
          </button>
        </div>
      </div>

      {/* PO Data Table List */}
      <div className="bg-white border border-slate-200 rounded-b-xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                <th className="px-6 py-4">
                  <span className="flex items-center gap-1 cursor-pointer hover:text-slate-700">
                    PO ID <ChevronDown size={12} />
                  </span>
                </th>
                <th className="px-6 py-4">Vendor & Supplier Profile</th>
                <th className="px-6 py-4">Total Amount</th>
                <th className="px-6 py-4">Delivery Date</th>
                <th className="px-6 py-4 text-center">Status</th>
                <th className="px-6 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              <AnimatePresence initial={false}>
                {paginatedPOs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-sm text-slate-400">
                      No matching purchase orders found matching standard limits.
                    </td>
                  </tr>
                ) : (
                  paginatedPOs.map((po) => {
                    const statusClass = getStatusStyle(po.status);
                    return (
                      <motion.tr
                        layoutId={`po-row-${po.id}`}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        key={po.id}
                        className="hover:bg-slate-50/50 transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <span className="font-semibold text-[#00236f] font-mono text-sm leading-none block">
                            {po.poNumber}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-8.5 h-8.5 rounded-lg bg-indigo-50 border border-indigo-100 text-[#00236f] font-bold text-xs flex items-center justify-center select-none shadow-3xs">
                              {po.vendorLogoCode}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-800 text-sm leading-tight">{po.vendorName}</p>
                              <span className="text-[10px] text-slate-400 font-medium">{po.vendorCategory}</span>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-mono font-bold text-slate-800 text-sm">
                          {po.totalAmount.toLocaleString('en-US', {
                            style: 'currency',
                            currency: 'USD',
                          })}
                        </td>
                        <td className="px-6 py-4 text-xs font-semibold text-slate-600">
                          {formattedDate(po.deliveryDate)}
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-block px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide border ${statusClass}`}>
                            {po.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            {/* Simple cycle button */}
                            {po.status === 'Pending' && (
                              <button
                                onClick={() => onChangePOStatus(po.id, 'Approved')}
                                className="px-2.5 py-1 bg-blue-50 text-blue-600 hover:bg-blue-100 text-[10px] font-bold rounded cursor-pointer"
                                title="Approve this Requisition PO"
                              >
                                APPROVE
                              </button>
                            )}
                            {po.status === 'Approved' && (
                              <button
                                onClick={() => onChangePOStatus(po.id, 'Received')}
                                className="px-2.5 py-1 bg-green-50 text-green-600 hover:bg-green-100 text-[10px] font-bold rounded cursor-pointer"
                                title="Confirm Products Intake"
                              >
                                REGISTER GRN
                              </button>
                            )}
                            <button
                              onClick={() => onEditPO(po)}
                              className="p-1.5 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded transition-all cursor-pointer"
                              title="Edit PO requisites"
                            >
                              <Edit size={14} />
                            </button>
                            <button
                              onClick={() => {
                                if (confirm(`Discard PO ${po.poNumber} permanently?`)) {
                                  onDeletePO(po.id);
                                }
                              }}
                              className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-all cursor-pointer"
                              title="Cancel PO order"
                            >
                              <Trash2 size={14} />
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
        <div className="px-6 py-4 bg-slate-50/50 border-t border-slate-200 flex items-center justify-between">
          <p className="text-xs text-slate-500 font-medium">
            Showing <span className="font-semibold text-slate-900">{filteredPOs.length === 0 ? 0 : (currentPage - 1) * itemsPerPage + 1}</span> to{' '}
            <span className="font-semibold text-slate-900">{Math.min(currentPage * itemsPerPage, filteredPOs.length)}</span> of{' '}
            <span className="font-semibold text-slate-900">{filteredPOs.length}</span> entries
          </p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setCurrentPage((c) => Math.max(1, c - 1))}
              disabled={currentPage === 1}
              className="p-1.5 border border-slate-200 bg-white rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed select-none transition-all cursor-pointer"
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
              className="p-1.5 border border-slate-200 bg-white rounded-lg hover:bg-slate-100 disabled:opacity-50 disabled:cursor-not-allowed select-none transition-all cursor-pointer"
            >
              <ChevronRight size={16} />
            </button>
          </div>
        </div>
      </div>

      {/* Procurement timelines and vendor health indicators side by side */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Timeline Activities Feed */}
        <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 p-6 shadow-xs relative overflow-hidden group">
          <div className="flex items-center justify-between mb-5">
            <h3 className="font-semibold text-slate-900 text-sm">Procurement Workflow Timeline</h3>
            <span className="text-[10px] tracking-wider font-bold text-slate-400 font-mono uppercase bg-slate-50 px-2 py-1 rounded">System Event Logs</span>
          </div>

          <div className="space-y-5 relative">
            {timeline.slice(0, 4).map((activity, index) => (
              <div key={activity.id} className="relative flex gap-4">
                {/* Timeline axis drawing */}
                {index < timeline.length - 1 && (
                  <div className="absolute left-4 top-8 bottom-0 w-0.5 bg-slate-100"></div>
                )}
                {/* Visual state bulb */}
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border shadow-3xs ${
                  activity.type === 'success'
                    ? 'bg-emerald-50 border-emerald-100 text-emerald-600'
                    : activity.type === 'info'
                    ? 'bg-blue-50 border-blue-100 text-blue-600'
                    : 'bg-amber-50 border-amber-100 text-amber-600'
                }`}>
                  <ShieldCheck size={16} />
                </div>
                <div>
                  <p className="font-semibold text-slate-800 text-sm leading-tight">{activity.title}</p>
                  <p className="text-xs text-slate-500 mt-1 leading-normal">{activity.description}</p>
                  <span className="text-[10px] text-slate-400 mt-1 block font-mono font-medium">{activity.timestamp}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Global Supplier performance card metrics */}
        <div className="bg-[#00236f] text-white rounded-xl p-6 shadow-md relative flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-center gap-1.5 mb-2">
              <ShieldCheck size={14} className="text-teal-300" />
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#90a8ff]">Supply Insights</span>
            </div>
            <h3 className="font-bold text-lg select-none">Supplier Performance</h3>
            <p className="text-xs text-indigo-100 opacity-90 mt-2.5 leading-relaxed">
              Overall manufacturing channel status remains optimal based on delivery SLAs & quality compliance tags.
            </p>
          </div>

          <div className="mt-6 border-t border-white/10 pt-5">
            <div className="flex items-end justify-between mb-2">
              <span className="text-xs font-semibold text-indigo-100">Quality Compliance Index</span>
              <span className="text-sm font-bold font-mono text-teal-300">94%</span>
            </div>
            <div className="h-2 w-full bg-slate-900/40 rounded-full overflow-hidden border border-white/5">
              <div className="h-full bg-teal-400 w-[94%] rounded-full transition-all duration-300"></div>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="flex -space-x-2">
              {vendors.map((v) => (
                <div
                  key={v.id}
                  className="w-8 h-8 rounded-full border-2 border-[#00236f] bg-slate-100 text-[#00236f] flex items-center justify-center text-[10px] font-bold font-sans select-none"
                  title={v.name}
                >
                  {v.code}
                </div>
              ))}
            </div>
            <span className="text-[10px] font-bold uppercase text-indigo-200">
              Active Tier Suppliers
            </span>
          </div>

          {/* Glowing gradient backdrops */}
          <div className="absolute -top-16 -right-16 w-32 h-32 bg-indigo-500/10 rounded-full blur-2xl pointer-events-none"></div>
        </div>
      </div>
    </div>
  );
}
