/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  category: string;
  location: string;
  stockLevel: number;
  maxStock: number; // For visualization progress bars
  unitPrice: number;
}

export type POStatus = 'Pending' | 'Approved' | 'Received';

export interface PurchaseOrder {
  id: string; // Internal ID
  poNumber: string; // Visual ID e.g., PO-2023-0892
  vendorName: string;
  vendorLogoCode: string; // SN, TP, AG, IL, etc.
  vendorCategory: string; // Tier 1 Supplier, Electronics Vendor, etc.
  totalAmount: number;
  deliveryDate: string;
  status: POStatus;
}

export type VendorStatus = 'PREFERRED' | 'STANDARD' | 'UNDER REVIEW';

export interface Vendor {
  id: string;
  name: string;
  code: string; // SC, BP, MT, etc.
  leadTime: string;
  qualityScore: number;
  onTimeDelivery: number; // Percentage e.g. 98.5
  totalValue: number; // YTD
  status: VendorStatus;
}

export interface TimelineActivity {
  id: string;
  type: 'success' | 'info' | 'warning';
  title: string;
  description: string;
  timestamp: string;
}

export type SidebarTab =
  | 'dashboard'
  | 'inventory'
  | 'purchase'
  | 'sales'
  | 'gatepass'
  | 'accounts'
  | 'vendors'
  | 'reports'
  | 'settings'
  | 'support';

export interface DashboardStats {
  totalInventoryValue: number;
  todaysSales: number;
  monthlyPurchases: number;
  pendingOrdersCount: number;
}
