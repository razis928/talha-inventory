export type FieldType = 'text' | 'number' | 'select' | 'date' | 'email' | 'checkbox';

export type SelectOption = string | { value: string; label: string };

export interface FieldDef {
  key: string;
  label: string;
  type: FieldType;
  options?: SelectOption[];
  required?: boolean;
}

export type FilterType = 'text' | 'select';

export interface FilterDef {
  key: string;
  label: string;
  type: FilterType;
  placeholder?: string;
  options?: string[];
  /** For text filters that match multiple row fields (e.g. gate pass party = vendor | customer) */
  keys?: string[];
}

export const SIZE_UNITS = ['KG', 'Liters', 'Rolls', 'PCS', 'Meters', 'Bags', 'Other'] as const;

export const PURCHASE_FIELDS: FieldDef[] = [
  { key: 'poNumber', label: 'PO Number', type: 'text', required: true },
  { key: 'vendor', label: 'Vendor', type: 'text', required: true },
  { key: 'requiredDate', label: 'Required Date', type: 'date' },
  { key: 'paymentTerms', label: 'Payment Terms', type: 'text' },
  { key: 'remarks', label: 'Remarks', type: 'text' },
  { key: 'taxAmount', label: 'Tax', type: 'number' },
  { key: 'totalAmount', label: 'Total Amount', type: 'number' },
];

export const PURCHASE_FILTERS: FilterDef[] = [
  { key: 'poNumber', label: 'PO Number', type: 'text', placeholder: 'e.g. PO-2024-0892' },
  { key: 'vendor', label: 'Vendor', type: 'select', options: ['All'] },
  { key: 'status', label: 'Status', type: 'select', options: ['All', 'Pending', 'Approved', 'Partial', 'Received', 'Cancelled'] },
];

export const JOB_ORDER_FILTERS: FilterDef[] = [
  { key: 'jobNumber', label: 'Job Number', type: 'text', placeholder: 'e.g. JO-26079' },
  { key: 'customer', label: 'Customer', type: 'select', options: ['All'] },
  { key: 'status', label: 'Status', type: 'select', options: ['All', 'Pending', 'In Progress', 'Completed', 'Cancelled'] },
];

export const USER_FIELDS: FieldDef[] = [
  { key: 'name', label: 'Name', type: 'text', required: true },
  { key: 'email', label: 'Email', type: 'email', required: true },
  { key: 'role', label: 'Role', type: 'select', options: ['Admin', 'Procurement Manager', 'Operations Director', 'Warehouse Manager', 'Accountant', 'Sales Executive'], required: true },
  { key: 'department', label: 'Department', type: 'text', required: true },
  { key: 'status', label: 'Status', type: 'select', options: ['Active', 'Inactive'], required: true },
  { key: 'lastLogin', label: 'Last Login', type: 'text' },
];

export const USER_FILTERS: FilterDef[] = [
  { key: 'name', label: 'Name', type: 'text', placeholder: 'Search name...' },
  { key: 'email', label: 'Email', type: 'text', placeholder: 'Search email...' },
  { key: 'role', label: 'Role', type: 'select', options: ['All', 'Admin', 'Procurement Manager', 'Operations Director', 'Warehouse Manager', 'Accountant', 'Sales Executive'] },
];

export const INVOICE_FIELDS: FieldDef[] = [
  { key: 'invoiceNumber', label: 'Invoice Number', type: 'text', required: true },
  { key: 'party', label: 'Party', type: 'text', required: true },
  { key: 'type', label: 'Type', type: 'select', options: ['Sales', 'Purchase'], required: true },
  { key: 'amount', label: 'Amount', type: 'number', required: true },
  { key: 'date', label: 'Date', type: 'date', required: true },
  { key: 'dueDate', label: 'Due Date', type: 'date', required: true },
  { key: 'status', label: 'Status', type: 'select', options: ['Paid', 'Unpaid', 'Pending', 'Overdue'], required: true },
];

export const INVOICE_FILTERS: FilterDef[] = [
  { key: 'invoiceNumber', label: 'Invoice Number', type: 'text', placeholder: 'e.g. INV-2024-...' },
  { key: 'party', label: 'Party Name', type: 'text', placeholder: 'Search party...' },
  { key: 'status', label: 'Status', type: 'select', options: ['All', 'Paid', 'Unpaid', 'Pending', 'Overdue'] },
];

export const REVIEWED_INVOICE_FILTERS: FilterDef[] = [
  { key: 'invoiceNumber', label: 'Invoice Number', type: 'text', placeholder: 'e.g. INV-2024-...' },
  { key: 'party', label: 'Party Name', type: 'text', placeholder: 'Search party...' },
  { key: 'status', label: 'Status', type: 'select', options: ['All', 'Approved', 'Rejected'] },
];

export const REVIEWED_INVOICE_FIELDS: FieldDef[] = [
  { key: 'invoiceNumber', label: 'Invoice Number', type: 'text', required: true },
  { key: 'party', label: 'Party', type: 'text', required: true },
  { key: 'amount', label: 'Amount', type: 'number', required: true },
  { key: 'reviewedBy', label: 'Reviewed By', type: 'text', required: true },
  { key: 'reviewDate', label: 'Review Date', type: 'date', required: true },
  { key: 'status', label: 'Status', type: 'select', options: ['Approved', 'Rejected'], required: true },
];

export const PAYMENT_FIELDS: FieldDef[] = [
  { key: 'reference', label: 'Reference', type: 'text', required: true },
  { key: 'party', label: 'Party', type: 'text', required: true },
  { key: 'type', label: 'Type', type: 'select', options: ['Receipt', 'Payment'], required: true },
  { key: 'amount', label: 'Amount', type: 'number', required: true },
  { key: 'method', label: 'Method', type: 'select', options: ['Cash', 'Bank Transfer', 'Cheque', 'Card'], required: true },
  { key: 'date', label: 'Date', type: 'date', required: true },
  { key: 'status', label: 'Status', type: 'select', options: ['Completed', 'Pending', 'Failed'], required: true },
];

export const EXPENSE_FIELDS: FieldDef[] = [
  { key: 'expenseNumber', label: 'Expense Number', type: 'text', required: true },
  { key: 'title', label: 'Title', type: 'text', required: true },
  { key: 'category', label: 'Category', type: 'select', options: ['Utilities', 'Salaries', 'Transport', 'Maintenance', 'Office', 'Marketing', 'Rent', 'Other'], required: true },
  { key: 'paidTo', label: 'Paid To', type: 'text', required: true },
  { key: 'amount', label: 'Amount (PKR)', type: 'number', required: true },
  { key: 'date', label: 'Date', type: 'date', required: true },
  { key: 'paymentMethod', label: 'Payment Method', type: 'select', options: ['Cash', 'Bank Transfer', 'Cheque', 'Card'], required: true },
  { key: 'status', label: 'Status', type: 'select', options: ['Paid', 'Pending', 'Approved', 'Rejected'], required: true },
];

export const EXPENSE_FILTERS: FilterDef[] = [
  { key: 'expenseNumber', label: 'Expense Number', type: 'text', placeholder: 'e.g. EXP-2024-...' },
  { key: 'paidTo', label: 'Paid To', type: 'text', placeholder: 'Search vendor or party...' },
  { key: 'status', label: 'Status', type: 'select', options: ['All', 'Paid', 'Pending', 'Approved', 'Rejected'] },
];

export const PAYMENT_FILTERS: FilterDef[] = [
  { key: 'reference', label: 'Reference', type: 'text', placeholder: 'e.g. PAY-2024-...' },
  { key: 'party', label: 'Party Name', type: 'text', placeholder: 'Search party...' },
  { key: 'status', label: 'Status', type: 'select', options: ['All', 'Completed', 'Pending', 'Failed'] },
];

export const CUSTOMER_FILTERS: FilterDef[] = [
  { key: 'name', label: 'Customer Name', type: 'text', placeholder: 'Search customer...' },
  { key: 'phone', label: 'Phone', type: 'text', placeholder: 'Search phone...' },
  { key: 'city', label: 'City', type: 'text', placeholder: 'Search city...' },
];

export const CUSTOMER_FIELDS: FieldDef[] = [
  { key: 'name', label: 'Customer Name', type: 'text', required: true },
  { key: 'phone', label: 'Phone', type: 'text' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'city', label: 'City', type: 'text' },
  { key: 'address', label: 'Address', type: 'text' },
];

export const VENDOR_FIELDS: FieldDef[] = [
  { key: 'name', label: 'Vendor Name', type: 'text', required: true },
  { key: 'phone', label: 'Phone', type: 'text' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'city', label: 'City', type: 'text' },
  { key: 'address', label: 'Address', type: 'text' },
];

/** Slim fields for adding a vendor from Purchase Order screen */
export const QUICK_VENDOR_FIELDS: FieldDef[] = [
  { key: 'name', label: 'Vendor Name', type: 'text', required: true },
  { key: 'phone', label: 'Phone', type: 'text' },
  { key: 'email', label: 'Email', type: 'email' },
  { key: 'city', label: 'City', type: 'text' },
  { key: 'address', label: 'Address', type: 'text' },
];

export const VENDOR_FILTERS: FilterDef[] = [
  { key: 'name', label: 'Vendor Name', type: 'text', placeholder: 'Search vendor...' },
  { key: 'phone', label: 'Phone', type: 'text', placeholder: 'Search phone...' },
  { key: 'city', label: 'City', type: 'text', placeholder: 'Search city...' },
];

export const INVENTORY_FILTERS: FilterDef[] = [
  { key: 'name', label: 'Item Name', type: 'text', placeholder: 'Search item name...' },
  { key: 'sku', label: 'SKU / Number', type: 'text', placeholder: 'Search SKU...' },
  { key: 'type', label: 'Type', type: 'select', options: ['All', 'Raw', 'Finished'] },
  {
    key: 'category',
    label: 'Category',
    type: 'select',
    options: ['All', 'Ink', 'Glue', 'Cligate', 'Dory', 'Packaging Material', 'Reel', 'Roll', 'Finished Products'],
  },
];

export const GATE_PASS_INWARD_FIELDS: FieldDef[] = [
  { key: 'passNumber', label: 'Pass Number', type: 'text', required: true },
  { key: 'vendor', label: 'Vendor', type: 'text', required: true },
  { key: 'productName', label: 'Product Name', type: 'text', required: true },
  { key: 'size', label: 'Size', type: 'text', required: true },
  { key: 'quantityPcs', label: 'Quantity (pcs)', type: 'number', required: true },
  { key: 'vehicleNo', label: 'Vehicle No', type: 'text', required: true },
  { key: 'driver', label: 'Driver', type: 'text', required: true },
  { key: 'date', label: 'Date', type: 'date', required: true },
  { key: 'status', label: 'Status', type: 'select', options: ['Pending', 'Approved', 'Rejected'], required: true },
];

export const GATE_PASS_OUTWARD_FIELDS: FieldDef[] = [
  { key: 'passNumber', label: 'Pass Number', type: 'text', required: true },
  { key: 'customer', label: 'Customer', type: 'text', required: true },
  { key: 'productName', label: 'Product Name', type: 'text', required: true },
  { key: 'size', label: 'Size', type: 'text', required: true },
  { key: 'quantityPcs', label: 'Quantity (pcs)', type: 'number', required: true },
  { key: 'vehicleNo', label: 'Vehicle No', type: 'text', required: true },
  { key: 'driver', label: 'Driver', type: 'text', required: true },
  { key: 'date', label: 'Date', type: 'date', required: true },
  { key: 'status', label: 'Status', type: 'select', options: ['Pending', 'Approved', 'Dispatched'], required: true },
];

export const GATE_PASS_FILTERS: FilterDef[] = [
  { key: 'passNumber', label: 'Pass Number', type: 'text', placeholder: 'e.g. GP-IN-...' },
  { key: 'party', label: 'Party Name', type: 'text', placeholder: 'Vendor or customer...', keys: ['vendor', 'customer', 'productName'] },
  { key: 'status', label: 'Status', type: 'select', options: ['All', 'Pending', 'Approved', 'Rejected', 'Dispatched'] },
];

export const ACCOUNT_FIELDS: FieldDef[] = [
  { key: 'code', label: 'Account Code', type: 'text', required: true },
  { key: 'name', label: 'Account Name', type: 'text', required: true },
  { key: 'is_system', label: 'System account', type: 'checkbox' },
];

export const ACCOUNT_FILTERS: FilterDef[] = [
  { key: 'code', label: 'Account Code', type: 'text', placeholder: 'e.g. 1000' },
  { key: 'name', label: 'Account Name', type: 'text', placeholder: 'Search account...' },
];
