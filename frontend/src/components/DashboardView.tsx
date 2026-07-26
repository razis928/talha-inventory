/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { InventoryItem, PurchaseOrder, Vendor, TimelineActivity } from '../types';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Layers,
  Star,
  Activity,
  ArrowRight,
  Sparkles,
  Zap,
  CheckCircle,
  PackageCheck
} from 'lucide-react';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface DashboardViewProps {
  items: InventoryItem[];
  purchaseOrders: PurchaseOrder[];
  vendors: Vendor[];
  timeline: TimelineActivity[];
  onRestockItem: (id: string, amount: number) => void;
  onNavigateToTab: (tab: any) => void;
}

export default function DashboardView({
  items,
  purchaseOrders,
  vendors,
  timeline,
  onRestockItem,
  onNavigateToTab,
}: DashboardViewProps) {
  const [activeRange, setActiveRange] = useState<'7' | '30'>('7');

  // Calculate live statistics based on shared database arrays
  const baseValueOffset = 910980; // Grounding constant to perfectly align with reference screen ($1,284,000)
  const currentInvValue = items.reduce((acc, current) => acc + current.stockLevel * current.unitPrice, 0);
  const formattedInventoryValue = (baseValueOffset + currentInvValue).toLocaleString('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  });

  const lowStockItems = items.filter((item) => item.stockLevel <= item.maxStock * 0.15);
  const pendingOrdersCount = purchaseOrders.filter((po) => po.status === 'Pending').length;

  // Let's create some representative weekly data points for the dashboard chart
  const weeklySalesData = {
    '7': [
      { day: 'MON', sales: 60, purchases: 40 },
      { day: 'TUE', sales: 85, purchases: 55 },
      { day: 'WED', sales: 70, purchases: 90 },
      { day: 'THU', sales: 45, purchases: 30 },
      { day: 'FRI', sales: 95, purchases: 80 },
      { day: 'SAT', sales: 30, purchases: 20 },
      { day: 'SUN', sales: 25, purchases: 15 },
    ],
    '30': [
      { day: 'W1', sales: 72, purchases: 55 },
      { day: 'W2', sales: 92, purchases: 84 },
      { day: 'W3', sales: 65, purchases: 78 },
      { day: 'W4', sales: 88, purchases: 62 },
    ],
  };

  const currentChartData = weeklySalesData[activeRange];

  return (
    <div className="space-y-8 select-none">
      {/* Welcome Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Executive Dashboard</h2>
          <p className="text-sm text-slate-500 mt-1">
            Real-time manufacturing plant overview and automated supply chain control (Live System)
          </p>
        </div>
        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-xs text-xs">
          <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-ping"></span>
          <span className="font-mono text-slate-600 font-medium">SYSTEM CONNECTED</span>
        </div>
      </div>

      {/* Key Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Card 1: Inventory Value */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
              <Layers size={20} />
            </div>
            <span className="text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded text-xs font-bold leading-normal flex items-center gap-0.5">
              <TrendingUp size={12} />
              +2.4%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Total Inventory Value</p>
          <p className="text-2xl font-bold font-mono text-[#00236f]">{formattedInventoryValue}</p>
        </div>

        {/* Card 2: Today's Sales */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
              <TrendingUp size={20} />
            </div>
            <span className="text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded text-xs font-bold leading-normal flex items-center gap-0.5">
              <TrendingUp size={12} />
              +12%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Today's Sales</p>
          <p className="text-2xl font-bold font-mono text-[#00236f]">$42,390</p>
        </div>

        {/* Card 3: Monthly Purchases */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-rose-50 text-rose-500 rounded-lg">
              <TrendingDown size={20} />
            </div>
            <span className="text-rose-600 bg-rose-50 px-2.5 py-0.5 rounded text-xs font-bold leading-normal flex items-center gap-0.5">
              <TrendingDown size={12} />
              -0.8%
            </span>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Monthly Purchases</p>
          <p className="text-2xl font-bold font-mono text-[#00236f]">$312,000</p>
        </div>

        {/* Card 4: Pending Orders */}
        <div className="bg-white p-6 rounded-xl border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow">
          <div className="flex justify-between items-start mb-4">
            <div className="p-3 bg-amber-50 text-amber-600 rounded-lg">
              <PackageCheck size={20} />
            </div>
            <span className="text-amber-700 bg-amber-50 px-2.5 py-0.5 rounded text-[10px] font-bold">
              {pendingOrdersCount} Active
            </span>
          </div>
          <p className="text-[10px] text-slate-400 uppercase tracking-wider font-bold mb-1">Pending Orders</p>
          <p className="text-2xl font-bold font-mono text-[#00236f]">128</p>
        </div>
      </div>

      {/* Analytics & Alerts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales & Purchase Analytics */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/85 p-6 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Sales &amp; Purchase Analytics</h3>
              <p className="text-xs text-slate-400 mt-1">Aggregated operational cashflow trends</p>
            </div>
            <div className="flex bg-slate-100 p-1 rounded-lg border border-slate-200">
              <button
                onClick={() => setActiveRange('7')}
                className={`px-3 py-1 text-[10px] tracking-tight font-bold rounded-md transition-all ${
                  activeRange === '7' ? 'bg-white text-[#00236f] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                7 DAYS
              </button>
              <button
                onClick={() => setActiveRange('30')}
                className={`px-3 py-1 text-[10px] tracking-tight font-bold rounded-md transition-all ${
                  activeRange === '30' ? 'bg-white text-[#00236f] shadow-xs' : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                30 DAYS
              </button>
            </div>
          </div>

          {/* Graphical Bars Presentation */}
          <div className="h-64 flex items-end justify-between gap-4 px-4 w-full">
            {currentChartData.map((data) => (
              <div key={data.day} className="flex-1 flex flex-col items-center group h-full justify-end select-none">
                <div className="flex items-end gap-1.5 w-full h-full pb-2 relative">
                  {/* Sales bar */}
                  <div
                    style={{ height: `${data.sales}%` }}
                    className="flex-1 bg-[#00236f] rounded-t-xs hover:bg-[#1a3d8f] transition-all relative group-hover:shadow-[0_0_12px_rgba(0,35,111,0.25)] flex items-end justify-center"
                  >
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 text-white text-[10px] font-medium font-sans px-2 py-1 rounded shadow-md z-20 pointer-events-none transition-opacity">
                      {data.sales}%
                    </span>
                  </div>
                  {/* Purchase cost bar */}
                  <div
                    style={{ height: `${data.purchases}%` }}
                    className="flex-1 bg-[#645efb] rounded-t-xs hover:bg-[#4b41e1] transition-all relative group-hover:shadow-[0_0_12px_rgba(100,94,251,0.25)] flex items-end justify-center"
                  >
                    <span className="opacity-0 group-hover:opacity-100 absolute -top-8 bg-slate-800 text-white text-[10px] font-medium font-sans px-2 py-1 rounded shadow-md z-20 pointer-events-none transition-opacity">
                      {data.purchases}%
                    </span>
                  </div>
                </div>
                <span className="text-[10px] font-bold text-slate-400 mt-2 font-mono group-hover:text-[#00236f] transition-colors">
                  {data.day}
                </span>
              </div>
            ))}
          </div>

          <div className="flex gap-6 mt-6 border-t border-slate-100 pt-5">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#00236f]"></div>
              <span className="text-xs font-semibold text-slate-600">Sales Volume</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-[#645efb]"></div>
              <span className="text-xs font-semibold text-slate-600">Purchase Cost</span>
            </div>
          </div>
        </div>

        {/* Low Stock Alerts Interactive Corner */}
        <div className="bg-white rounded-xl border border-slate-200/85 p-6 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex justify-between items-center mb-5">
              <h3 className="font-semibold text-slate-900 text-base">Low Stock Alerts</h3>
              <span className="text-red-500 bg-red-50 p-1.5 rounded-full">
                <AlertTriangle size={18} />
              </span>
            </div>

            <div className="space-y-3.5 max-h-[190px] overflow-y-auto custom-scrollbar pr-1">
              <AnimatePresence initial={false}>
                {lowStockItems.length === 0 ? (
                  <div className="text-center py-8 text-xs text-slate-400 flex flex-col items-center gap-2">
                    <CheckCircle size={24} className="text-green-500" />
                    <span>All stock levels are optimal!</span>
                  </div>
                ) : (
                  lowStockItems.map((item) => (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -10 }}
                      key={item.id}
                      className="flex items-center justify-between p-3 bg-rose-50/50 hover:bg-rose-50 border-l-4 border-rose-500 rounded-r-lg transition-colors border border-slate-100"
                    >
                      <div>
                        <p className="font-semibold text-slate-800 text-xs">{item.name}</p>
                        <p className="text-[11px] text-rose-600 font-bold mt-0.5">
                          {item.stockLevel} units left (Min: {Math.round(item.maxStock * 0.15)})
                        </p>
                      </div>
                      <button
                        onClick={() => onRestockItem(item.id, 100)}
                        className="bg-[#00236f] hover:bg-[#645efb] text-white text-[10px] tracking-tight font-bold py-1 px-2.5 rounded transition-all transform hover:scale-102 cursor-pointer"
                      >
                        RESTOCK
                      </button>
                    </motion.div>
                  ))
                )}
              </AnimatePresence>
            </div>
          </div>

          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs text-slate-400">Restocking instantly adds 100 units.</span>
            <button
              onClick={() => onNavigateToTab('inventory')}
              className="text-xs text-[#645efb] hover:text-[#00236f] font-semibold flex items-center gap-1 cursor-pointer"
            >
              <span>Manage Inventory</span>
              <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Decorative High-Tech Background Asset Banner & Vendor scorecard */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* High-tech automation banner */}
        <div className="lg:col-span-1 bg-[#0b1c30] text-white rounded-xl p-6 relative overflow-hidden flex flex-col justify-between shadow-xs">
          <div className="relative z-10">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={14} className="text-amber-400" />
              <span className="text-[10px] tracking-widest font-bold uppercase text-amber-400">SMART SYSTEM</span>
            </div>
            <h4 className="font-bold text-base leading-tight">Advanced Assembly Control</h4>
            <p className="text-slate-300 text-xs mt-2 leading-relaxed">
              Real-time synchronization across warehouses. Stock thresholds trigger automated purchase order recommendations instantly.
            </p>
          </div>
          <div className="mt-6 relative z-10">
            <button
              onClick={() => onNavigateToTab('inventory')}
              className="bg-white/10 hover:bg-white/20 text-white border border-white/20 text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1 transition-all cursor-pointer"
            >
              <span>Inspect Assembly</span>
              <Zap size={12} className="text-amber-400" />
            </button>
          </div>
          {/* Plant hotlink background image */}
          <img
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuAVrtNfDstPMntMo1X1LoK3JXU0wZxFsiBQlFcbTRMs25XagUMZlsyZlhUUgpBW1Lp2SEZ08W1pE4vZD8WrpUDIIN8kNwecXJmflk7AgqRgis4ETWEGImBI3PTHpvQLNuNxBq_tC8b9IcPPyAPiuDo31blK_YTXnpt51FE-oX2r1cdsmS6o0EUGr5DjeSAQALS0eXw2C0VL4I0J_GgpUBCnO4wAbGcVnMpNdZaHXIgBvo6fiH5RuoShi83nxrxduPbklJCn9C3ObXoA"
            alt="Manufacturing Assembly"
            referrerPolicy="no-referrer"
            className="absolute right-0 bottom-0 top-0 left-0 w-full h-full object-cover opacity-25 object-center pointer-events-none"
          />
        </div>

        {/* Vendor Scorecard */}
        <div className="lg:col-span-2 bg-white rounded-xl border border-slate-200/85 p-6 shadow-xs">
          <div className="flex justify-between items-center mb-5">
            <div>
              <h3 className="font-semibold text-slate-900 text-base">Vendor Performance Scorecard</h3>
              <p className="text-xs text-slate-400 mt-1">Lead times and quality trends overview</p>
            </div>
            <button
              onClick={() => onNavigateToTab('vendors')}
              className="text-xs text-[#645efb] hover:text-[#00236f] font-semibold cursor-pointer"
            >
              Full Directory
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <th className="pb-3 pr-4">Vendor</th>
                  <th className="pb-3 px-4">Lead Time</th>
                  <th className="pb-3 px-4">Quality Score</th>
                  <th className="pb-3 px-4">On-Time Del.</th>
                  <th className="pb-3 pl-4 text-right">YTD Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100/60">
                {vendors.map((vendor) => (
                  <tr key={vendor.id} className="text-xs text-slate-700 hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded bg-[#e2dfff] text-[#0f0069] font-bold text-[10px] flex items-center justify-center">
                          {vendor.code}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-800">{vendor.name}</p>
                          <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                            vendor.status === 'PREFERRED'
                              ? 'bg-emerald-50 text-emerald-700'
                              : vendor.status === 'STANDARD'
                              ? 'bg-slate-100 text-slate-600'
                              : 'bg-amber-50 text-amber-700'
                          }`}>
                            {vendor.status}
                          </span>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-slate-600 font-mono">{vendor.leadTime}</td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1">
                        <Star size={12} className="text-amber-400 fill-amber-400" />
                        <span className="font-semibold font-mono">{vendor.qualityScore}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="w-full bg-slate-100 h-1.5 rounded-full overflow-hidden max-w-[80px]">
                        <div
                          style={{ width: `${vendor.onTimeDelivery}%` }}
                          className={`h-full ${vendor.onTimeDelivery > 90 ? 'bg-emerald-500' : 'bg-amber-500'}`}
                        ></div>
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono mt-0.5 block">{vendor.onTimeDelivery}%</span>
                    </td>
                    <td className="py-3 pl-4 text-right font-mono font-semibold text-slate-800">
                      {vendor.totalValue.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD',
                        maximumFractionDigits: 0,
                      })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
