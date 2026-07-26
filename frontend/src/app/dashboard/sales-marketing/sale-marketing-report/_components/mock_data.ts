export const RevenueAccount = [
  {
    id: '1',
    name: 'Office Supplies Sale',
    amount: '$50000.00',
    tagging_id: 'PCU4010-90909',
  },
  {
    id: '1',
    name: 'Sales to Retailer',
    amount: '$20000.98',
    tagging_id: 'PCU4011-98989',
  },
];

export const expensesAccount = [
  {
    id: '201',
    name: 'Oprating Expense',
    amount: '$15000',
    tagging_id: 'PCU6000-98989',
  },
  {
    id: '202',
    name: 'Rent Expense',
    amount: '$5000',
    tagging_id: 'PCU6010-98989',
  },
  {
    id: '203',
    name: 'Utility Expense',
    amount: '$2000',
    tagging_id: 'PCU6020-98989',
  },
];

export const assets = [
  { id: '301', name: 'Cash', amount: '$10000', tagging_id: 'PCU1010-0000' },
  {
    id: '302',
    name: 'Accounts Receivable',
    amount: '$12000',
    tagging_id: 'PCU1020-0000',
  },
  { id: '303', name: 'Inventory', amount: '$8000', tagging_id: 'PCU1030-0000' },
];

export const liabilities = [
  {
    id: '401',
    name: 'Accounts Payable',
    amount: '$4000',
    tagging_id: 'PCU2010-0000',
  },
  {
    id: '402',
    name: 'Short-Term Loan',
    amount: '$2000',
    tagging_id: 'PCU2030-0000',
  },
  {
    id: '403',
    name: 'Long-Term Loan',
    amount: '$10000',
    tagging_id: 'PCU2210-0000',
  },
];

export const accountPayable = [
  {
    id: '',
    invoice_date: 'Unassigned',
    due_date: 'Unassigned',
    isUnassigned: true,
    vendor_company_name: 'Unassigned',
    description: 'Rocket Rides',
    invoice_number: 'Unassigned',
    amount: '$10.00',
    status: 'Paid',
    inserted_at: '2024-08-17',
    tagging_id: 'PCU2000-98989',
  },
  {
    id: '',
    invoice_date: 'Unassigned',
    due_date: 'Unassigned',
    isUnassigned: true,
    vendor_company_name: 'Unassigned',
    description: 'Rocket Rides',
    invoice_number: 'Unassigned',
    amount: '$10.00',
    status: 'Paid',
    inserted_at: '2024-08-17',
    tagging_id: 'PCU2010-98989',
  },
];

export const accountReceivables = [
  {
    account_balance: '$870.00',
    email: 'Unassigned',
    id: 'Unassigned',
    inserted_at: '2024-11-14',
    isUnassigned: true,
    late_payment: false,
    name: 'Unassigned',
    received_amount: '$100.00',
    status: 'completed',
    taxes: 0,
    tagging_id: 'PCU1000-0000',
  },
  {
    account_balance: '$870.00',
    email: 'Unassigned',
    id: 'Unassigned',
    inserted_at: '2024-11-14',
    isUnassigned: true,
    late_payment: false,
    name: 'Unassigned',
    received_amount: '$100.00',
    status: 'completed',
    taxes: 0,
    tagging_id: 'PCU1020-0000',
  },
];

// net income = total revenue  - total expense
// total liabilities = sum of all liabilities
// equity =  total assets - total liablities
// budget operating net income  = total revenue - operating income
