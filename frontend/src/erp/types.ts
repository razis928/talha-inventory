export type ErpScreen =
  | 'dashboard'
  | 'inventory'
  | 'stock-details'
  | 'stock-transactions'
  | 'purchase-orders'
  | 'receiving'
  | 'job-orders'
  | 'dispatch'
  | 'users-access'
  | 'invoices'
  | 'reviewed-invoices'
  | 'payments'
  | 'vendor-payments'
  | 'customer-payments'
  | 'customers'
  | 'vendors'
  | 'gate-pass'
  | 'accounts'
  | 'expenses'
  | 'reports'
  | 'settings'
  | 'support';

export interface InventoryItem {
  id: string;
  name: string;
  sku: string;
  type: 'Raw' | 'Finished';
  category: string;
  costPrice: number;
  sellingPrice: number;
  stockLevel: number;
  minStock: number;
  maxStock: number;
  gsm: number;
  size: number;
  unit: string;
}

export interface InventoryFormData {
  name: string;
  sku: string;
  type: 'Raw' | 'Finished';
  category: string;
  costPrice: number;
  sellingPrice: number;
  stockLevel: number;
  minStock: number;
  gsm: number;
  size: number;
  unit: string;
}
