import { apiRequest } from './client';

export interface AccountApi {
  id: number;
  code: string;
  name: string;
  type: string | null;
  parent_id: number | null;
  parent_code?: string | null;
  parent_name?: string | null;
  is_system: boolean;
  is_active: boolean;
  balance: number;
  created_at: string;
}

export interface AccountInput {
  code: string;
  name: string;
  type?: string | null;
  parent_id?: number | null;
  is_system?: boolean;
}

export interface AccountingSummary {
  cash_balance: number;
  bank_balance: number;
  receivables: number;
  payables: number;
  revenue: number;
  expenses: number;
  net_profit: number;
}

export interface VendorBillApi {
  id: number;
  bill_number: string;
  vendor_id: number | null;
  vendor_name: string;
  purchase_order_id: number | null;
  job_order_id: number | null;
  bill_date: string;
  due_date: string | null;
  amount: number;
  paid_amount: number;
  balance: number;
  description: string;
  status: string;
  created_at: string;
}

export interface VendorBillInput {
  bill_number: string;
  vendor_id?: number | null;
  vendor_name?: string;
  purchase_order_id?: number | null;
  job_order_id?: number | null;
  bill_date: string;
  due_date?: string | null;
  amount: number;
  description?: string;
}

export interface CustomerInvoiceApi {
  id: number;
  invoice_number: string;
  customer_name: string;
  job_order_id: number | null;
  invoice_date: string;
  due_date: string | null;
  amount: number;
  paid_amount: number;
  balance: number;
  description: string;
  status: string;
  created_at: string;
}

export interface CustomerInvoiceInput {
  invoice_number: string;
  customer_id?: number | null;
  customer_name?: string;
  job_order_id?: number | null;
  purchase_order_id?: number | null;
  invoice_date: string;
  due_date?: string | null;
  amount: number;
  description?: string;
}

export interface PaymentApi {
  id: number;
  reference: string;
  payment_type: 'Payment' | 'Receipt';
  party_name: string;
  vendor_bill_id: number | null;
  customer_invoice_id: number | null;
  amount: number;
  method: string;
  payment_date: string;
  notes: string;
  status: string;
  created_at: string;
}

export interface PaymentInput {
  reference: string;
  payment_type: 'Payment' | 'Receipt';
  party_name?: string;
  vendor_bill_id?: number | null;
  customer_invoice_id?: number | null;
  amount: number;
  method?: string;
  payment_date: string;
  notes?: string;
}

export interface ExpenseApi {
  id: number;
  expense_number: string;
  title: string;
  category: string;
  paid_to: string;
  amount: number;
  expense_date: string;
  payment_method: string;
  debit_account_id: number;
  credit_account_id: number;
  job_order_id: number | null;
  notes: string;
  status: string;
  created_at: string;
}

export interface ExpenseInput {
  expense_number: string;
  title: string;
  category?: string;
  paid_to?: string;
  amount: number;
  expense_date: string;
  payment_method?: string;
  debit_account_id?: number | null;
  credit_account_id?: number | null;
  job_order_id?: number | null;
  notes?: string;
}

export interface JobCostingApi {
  job_order_id: number;
  job_number: string;
  customer_name: string;
  status: string;
  revenue: number;
  costs: number;
  expenses: number;
  total_cost: number;
  margin: number;
  margin_percent: number;
}

export async function fetchAccounts(search?: string): Promise<AccountApi[]> {
  const q = new URLSearchParams();
  if (search) q.set('search', search);
  const qs = q.toString();
  return apiRequest<AccountApi[]>(`/api/v1/accounting/accounts${qs ? `?${qs}` : ''}`);
}

export async function createAccount(data: AccountInput): Promise<AccountApi> {
  return apiRequest<AccountApi>('/api/v1/accounting/accounts', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateAccount(id: number, data: Partial<AccountInput>): Promise<AccountApi> {
  return apiRequest<AccountApi>(`/api/v1/accounting/accounts/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteAccount(id: number): Promise<void> {
  await apiRequest<void>(`/api/v1/accounting/accounts/${id}`, { method: 'DELETE' });
}

export interface LedgerLineApi {
  date: string;
  entry_number: string;
  description: string;
  memo: string;
  reference_type: string;
  reference_id: number | null;
  purchase_order_id: number | null;
  job_order_id: number | null;
  contra_account: string;
  debit: number;
  credit: number;
  balance: number;
}

export async function fetchAccountLedger(
  accountId: number,
  options?: { from?: string; to?: string }
): Promise<LedgerLineApi[]> {
  const q = new URLSearchParams();
  if (options?.from) q.set('from', options.from);
  if (options?.to) q.set('to', options.to);
  const qs = q.toString();
  return apiRequest<LedgerLineApi[]>(
    `/api/v1/accounting/accounts/${accountId}/ledger${qs ? `?${qs}` : ''}`
  );
}

export async function fetchAccountingSummary(): Promise<AccountingSummary> {
  return apiRequest<AccountingSummary>('/api/v1/accounting/summary');
}

export async function fetchJobCosting(): Promise<JobCostingApi[]> {
  return apiRequest<JobCostingApi[]>('/api/v1/accounting/job-costing');
}

export async function fetchVendorBills(search?: string): Promise<VendorBillApi[]> {
  const q = new URLSearchParams();
  if (search) q.set('search', search);
  const qs = q.toString();
  return apiRequest<VendorBillApi[]>(`/api/v1/accounting/vendor-bills${qs ? `?${qs}` : ''}`);
}

export async function createVendorBill(data: VendorBillInput): Promise<VendorBillApi> {
  return apiRequest<VendorBillApi>('/api/v1/accounting/vendor-bills', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createVendorBillFromPo(poId: number): Promise<VendorBillApi> {
  return apiRequest<VendorBillApi>(`/api/v1/accounting/vendor-bills/from-po/${poId}`, {
    method: 'POST',
  });
}

export async function deleteVendorBill(id: number): Promise<void> {
  await apiRequest<void>(`/api/v1/accounting/vendor-bills/${id}`, { method: 'DELETE' });
}

export async function fetchCustomerInvoices(search?: string): Promise<CustomerInvoiceApi[]> {
  const q = new URLSearchParams();
  if (search) q.set('search', search);
  const qs = q.toString();
  return apiRequest<CustomerInvoiceApi[]>(
    `/api/v1/accounting/customer-invoices${qs ? `?${qs}` : ''}`
  );
}

export async function createCustomerInvoice(data: CustomerInvoiceInput): Promise<CustomerInvoiceApi> {
  return apiRequest<CustomerInvoiceApi>('/api/v1/accounting/customer-invoices', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function createCustomerInvoiceFromJob(jobId: number): Promise<CustomerInvoiceApi> {
  return apiRequest<CustomerInvoiceApi>(`/api/v1/accounting/customer-invoices/from-job/${jobId}`, {
    method: 'POST',
  });
}

export async function deleteCustomerInvoice(id: number): Promise<void> {
  await apiRequest<void>(`/api/v1/accounting/customer-invoices/${id}`, { method: 'DELETE' });
}

export async function fetchPayments(
  search?: string,
  paymentType?: 'Payment' | 'Receipt'
): Promise<PaymentApi[]> {
  const q = new URLSearchParams();
  if (search) q.set('search', search);
  if (paymentType) q.set('payment_type', paymentType);
  const qs = q.toString();
  return apiRequest<PaymentApi[]>(`/api/v1/accounting/payments${qs ? `?${qs}` : ''}`);
}

export async function createPayment(data: PaymentInput): Promise<PaymentApi> {
  return apiRequest<PaymentApi>('/api/v1/accounting/payments', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deletePayment(id: number): Promise<void> {
  await apiRequest<void>(`/api/v1/accounting/payments/${id}`, { method: 'DELETE' });
}

export async function fetchExpenses(search?: string): Promise<ExpenseApi[]> {
  const q = new URLSearchParams();
  if (search) q.set('search', search);
  const qs = q.toString();
  return apiRequest<ExpenseApi[]>(`/api/v1/accounting/expenses${qs ? `?${qs}` : ''}`);
}

export async function createExpense(data: ExpenseInput): Promise<ExpenseApi> {
  return apiRequest<ExpenseApi>('/api/v1/accounting/expenses', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function deleteExpense(id: number): Promise<void> {
  await apiRequest<void>(`/api/v1/accounting/expenses/${id}`, { method: 'DELETE' });
}
