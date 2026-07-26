import type { ComponentType } from 'react';
import {
  LayoutDashboard, Package, ShoppingCart, Briefcase, Users,
  Wallet, UserCircle, Building2,
  ChevronLeft, ChevronRight, DoorOpen, Landmark, BarChart3, CircleDollarSign, X,
  PackagePlus, History, Banknote,
  // Settings,
} from 'lucide-react';
import { ErpScreen } from '../types';

interface NavItem {
  id: ErpScreen;
  label: string;
  icon: ComponentType<{ size?: number; className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'inventory', label: 'Inventory', icon: Package },
  { id: 'stock-transactions', label: 'Stock History', icon: History },
  { id: 'purchase-orders', label: 'Purchase Orders', icon: ShoppingCart },
  { id: 'receiving', label: 'Receiving', icon: PackagePlus },
  { id: 'job-orders', label: 'Job Orders', icon: Briefcase },
  { id: 'dispatch', label: 'Dispatch / Gate Pass', icon: DoorOpen },
  { id: 'users-access', label: 'Users & access', icon: Users },
  { id: 'vendor-payments', label: 'Vendor Payments', icon: Wallet },
  { id: 'customer-payments', label: 'Customer Payments', icon: Banknote },
  { id: 'customers', label: 'Customers', icon: UserCircle },
  { id: 'vendors', label: 'Vendors', icon: Building2 },
  { id: 'accounts', label: 'Accounts', icon: Landmark },
  { id: 'expenses', label: 'Expenses', icon: CircleDollarSign },
  { id: 'reports', label: 'Reports', icon: BarChart3 },
  // { id: 'settings', label: 'Settings', icon: Settings },
];

interface ErpSidebarProps {
  activeScreen: ErpScreen;
  collapsed: boolean;
  mobileOpen: boolean;
  onScreenChange: (screen: ErpScreen) => void;
  onToggleCollapse: () => void;
  onMobileClose: () => void;
}

export default function ErpSidebar({
  activeScreen,
  collapsed,
  mobileOpen,
  onScreenChange,
  onToggleCollapse,
  onMobileClose,
}: ErpSidebarProps) {
  const handleNav = (screen: ErpScreen) => {
    onScreenChange(screen);
    onMobileClose();
  };

  return (
    <>
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close menu"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={onMobileClose}
        />
      )}

      <aside
        className={`erp-document fixed left-0 top-0 z-50 flex h-screen flex-col transition-transform duration-300 ease-in-out lg:transition-[width] ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0 ${
          collapsed ? 'w-[min(260px,85vw)] lg:w-[56px]' : 'w-[min(260px,85vw)] lg:w-[220px]'
        }`}
      >
        <div className="erp-titlebar flex items-center justify-between gap-2">
          {(!collapsed || mobileOpen) && <span className="truncate">Taimor Packages</span>}
          {collapsed && !mobileOpen && <span className="hidden lg:inline">T</span>}
          <button type="button" onClick={onMobileClose} className="p-0.5 lg:hidden" aria-label="Close">
            <X size={16} />
          </button>
        </div>

        <nav className="custom-scrollbar flex-1 overflow-y-auto bg-[var(--color-erp-toolbar)] p-1">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleNav(item.id)}
                title={collapsed && !mobileOpen ? item.label : undefined}
                className={`mb-0.5 flex w-full items-center gap-2 px-2 py-1.5 text-left text-xs ${
                  isActive ? 'erp-nav-active' : 'erp-btn-ghost border-transparent bg-transparent'
                } ${collapsed && !mobileOpen ? 'lg:justify-center' : ''}`}
              >
                <Icon size={16} className="shrink-0" />
                <span className={`truncate ${collapsed && !mobileOpen ? 'lg:hidden' : ''}`}>{item.label}</span>
              </button>
            );
          })}
        </nav>

        <div className="hidden border-t border-[var(--color-erp-border)] bg-[var(--color-erp-toolbar)] p-1 lg:block">
          <button type="button" onClick={onToggleCollapse} className="erp-btn-ghost flex w-full items-center justify-center gap-1 text-xs">
            {collapsed ? <ChevronRight size={14} /> : <><ChevronLeft size={14} /><span>Collapse</span></>}
          </button>
        </div>
      </aside>
    </>
  );
}
