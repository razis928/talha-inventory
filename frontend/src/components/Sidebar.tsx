/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { SidebarTab } from '../types';
import {
  LayoutDashboard,
  Boxes,
  ShoppingCart,
  Tag,
  DoorOpen,
  Landmark,
  Users,
  BarChart3,
  Settings,
  HelpCircle,
  Plus
} from 'lucide-react';
import { motion } from 'motion/react';

interface SidebarProps {
  activeTab: SidebarTab;
  onTabChange: (tab: SidebarTab) => void;
  onQuickAction: () => void;
}

export default function Sidebar({ activeTab, onTabChange, onQuickAction }: SidebarProps) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'inventory', label: 'Inventory', icon: Boxes },
    { id: 'purchase', label: 'Purchase', icon: ShoppingCart },
    { id: 'sales', label: 'Sales', icon: Tag },
    { id: 'gatepass', label: 'Gate Pass', icon: DoorOpen },
    { id: 'accounts', label: 'Accounts', icon: Landmark },
    { id: 'vendors', label: 'Vendors', icon: Users },
    { id: 'reports', label: 'Reports', icon: BarChart3 },
  ] as const;

  const footerItems = [
    { id: 'settings', label: 'Settings', icon: Settings },
    { id: 'support', label: 'Support', icon: HelpCircle },
  ] as const;

  return (
    <aside className="w-60 h-screen fixed left-0 top-0 bg-[#00236f] text-white shadow-lg flex flex-col z-50 overflow-hidden select-none">
      {/* Brand Header */}
      <div className="p-6 border-b border-white/5">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-500 flex items-center justify-center font-bold text-white shadow-md shadow-indigo-600/30">
            M
          </div>
          <div>
            <h1 className="font-sans font-bold text-lg leading-none tracking-tight">ManufacturePro</h1>
            <p className="text-[10px] text-indigo-200 mt-1 uppercase tracking-widest font-semibold opacity-85">Enterprise ERP</p>
          </div>
        </div>
      </div>

      {/* Main Navigation Items */}
      <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto custom-scrollbar">
        {navItems.map((item) => {
          const isActive = activeTab === item.id;
          const Icon = item.icon;
          return (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={`w-full relative flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 text-left ${
                isActive
                  ? 'bg-[#645efb] text-white font-medium shadow-md shadow-indigo-700/10'
                  : 'text-slate-300 hover:text-white hover:bg-white/5'
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute left-0 top-1/4 bottom-1/4 w-1 bg-white rounded-r-md"
                  transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                />
              )}
              <Icon size={18} className={isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'} />
              <span className="text-sm font-sans">{item.label}</span>
            </button>
          );
        })}
      </nav>

      {/* Sidebar Quick Action & Footer */}
      <div className="p-4 border-t border-white/10 space-y-4 bg-[#00174e]/50">
        <button
          onClick={onQuickAction}
          className="w-full bg-[#645efb] hover:bg-[#524be3] text-white py-2.5 px-4 rounded-lg flex items-center justify-center gap-2 text-sm font-semibold active:scale-98 transition-transform shadow-lg shadow-indigo-600/10 cursor-pointer"
        >
          <Plus size={16} />
          <span>Quick Action</span>
        </button>

        <div className="space-y-1">
          {footerItems.map((item) => {
            const isActive = activeTab === item.id;
            const Icon = item.icon;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`w-full flex items-center gap-3 px-4 py-2 rounded-lg transition-all duration-150 text-left text-xs ${
                  isActive
                    ? 'bg-[#645efb] text-white font-medium'
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon size={14} />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
