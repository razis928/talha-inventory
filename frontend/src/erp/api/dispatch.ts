import { apiRequest } from './client';

export interface DispatchLineApi {
  id: number;
  job_order_line_id: number;
  item_id: number | null;
  item_name: string;
  unit: string;
  quantity: number;
}

export interface DispatchApi {
  id: number;
  pass_number: string;
  job_order_id: number;
  job_number: string;
  customer_name: string;
  dispatch_date: string;
  vehicle_no: string;
  driver: string;
  notes: string;
  created_by: string;
  status: string;
  lines: DispatchLineApi[];
  created_at: string;
}

export interface DispatchLineInput {
  job_order_line_id: number;
  item_id?: number | null;
  quantity: number;
}

export interface DispatchInput {
  pass_number: string;
  job_order_id: number;
  dispatch_date: string;
  vehicle_no?: string;
  driver?: string;
  notes?: string;
  created_by?: string;
  lines: DispatchLineInput[];
}

export async function fetchDispatches(search?: string): Promise<DispatchApi[]> {
  const query = new URLSearchParams({ limit: '500' });
  if (search) query.set('search', search);
  return apiRequest<DispatchApi[]>(`/api/v1/dispatch?${query}`);
}

export async function createDispatch(data: DispatchInput): Promise<DispatchApi> {
  return apiRequest<DispatchApi>('/api/v1/dispatch', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
