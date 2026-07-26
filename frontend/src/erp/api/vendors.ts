import { apiRequest } from './client';

export interface VendorApi {
  id: number;
  name: string;
  code: string;
  category: string;
  contact_person: string;
  phone: string;
  email: string;
  city: string;
  address: string;
  account_id?: number | null;
  status: string;
  notes: string;
  created_at: string;
  updated_at: string;
}

export interface VendorInput {
  name: string;
  code?: string;
  category?: string;
  contact_person?: string;
  phone?: string;
  email?: string;
  city?: string;
  address?: string;
  status?: string;
  notes?: string;
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

export interface VendorOrderHistoryApi {
  id: number;
  po_number: string;
  status: string;
  total_amount: number;
  required_date: string | null;
  created_at: string;
}

export interface VendorDetailApi {
  vendor: VendorApi;
  account_balance: number;
  purchase_orders: VendorOrderHistoryApi[];
  ledger: LedgerLineApi[];
}

export async function fetchVendors(search?: string): Promise<VendorApi[]> {
  const query = new URLSearchParams({ limit: '500' });
  if (search) query.set('search', search);
  return apiRequest<VendorApi[]>(`/api/v1/vendors?${query}`);
}

export async function fetchVendorDetail(id: number): Promise<VendorDetailApi> {
  return apiRequest<VendorDetailApi>(`/api/v1/vendors/${id}/detail`);
}

export async function createVendor(data: VendorInput): Promise<VendorApi> {
  return apiRequest<VendorApi>('/api/v1/vendors', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateVendor(id: number, data: VendorInput): Promise<VendorApi> {
  return apiRequest<VendorApi>(`/api/v1/vendors/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteVendor(id: number): Promise<void> {
  await apiRequest<void>(`/api/v1/vendors/${id}`, { method: 'DELETE' });
}
