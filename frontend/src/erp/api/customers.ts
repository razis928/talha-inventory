import { apiRequest } from './client';
import type { LedgerLineApi } from './vendors';

export interface CustomerApi {
  id: number;
  name: string;
  contact_person: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  account_id?: number | null;
  total_orders: number;
  total_revenue: number;
  outstanding: number;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface CustomerInput {
  name: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  city?: string;
  address?: string;
  total_orders?: number;
  total_revenue?: number;
  outstanding?: number;
  status?: string;
  notes?: string;
}

export interface CustomerJobHistoryApi {
  id: number;
  job_number: string;
  status: string;
  total_amount: number;
  required_date: string | null;
  created_at: string;
}

export interface CustomerDetailApi {
  customer: CustomerApi;
  account_balance: number;
  job_orders: CustomerJobHistoryApi[];
  ledger: LedgerLineApi[];
}

export async function fetchCustomers(search?: string): Promise<CustomerApi[]> {
  const query = new URLSearchParams({ limit: '500' });
  if (search) query.set('search', search);
  return apiRequest<CustomerApi[]>(`/api/v1/customers?${query}`);
}

export async function fetchCustomerDetail(id: number): Promise<CustomerDetailApi> {
  return apiRequest<CustomerDetailApi>(`/api/v1/customers/${id}/detail`);
}

export async function createCustomer(data: CustomerInput): Promise<CustomerApi> {
  return apiRequest<CustomerApi>('/api/v1/customers', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateCustomer(id: number, data: CustomerInput): Promise<CustomerApi> {
  return apiRequest<CustomerApi>(`/api/v1/customers/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteCustomer(id: number): Promise<void> {
  await apiRequest<void>(`/api/v1/customers/${id}`, { method: 'DELETE' });
}
