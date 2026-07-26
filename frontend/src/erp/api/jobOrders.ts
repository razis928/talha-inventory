import { apiRequest } from './client';

export interface JobOrderLineApi {
  id: number;
  item_id: number | null;
  item_name: string;
  unit: string;
  quality: string;
  colour: string;
  size: string;
  order_quantity: number;
  order_pending_quantity: number;
  remarks: string;
  rate: number;
  gst_percent: number;
  gross_amount: number;
  line_total: number;
}

export interface JobOrderApi {
  id: number;
  job_number: string;
  customer_name: string;
  required_date: string | null;
  payment_terms: string;
  remarks: string;
  pi_number: string;
  freight_charges: number;
  currency: string;
  tax_amount: number;
  total_amount: number;
  status: string;
  lines: JobOrderLineApi[];
  created_at: string;
  updated_at: string;
}

export interface JobOrderLineInput {
  item_id?: number | null;
  item_name?: string;
  unit?: string;
  quality: string;
  colour: string;
  size: string;
  order_quantity: number;
  order_pending_quantity?: number | null;
  remarks: string;
  rate: number;
  gst_percent: number;
}

export interface JobOrderInput {
  job_number: string;
  customer_name: string;
  required_date?: string | null;
  payment_terms?: string;
  remarks?: string;
  pi_number?: string;
  freight_charges?: number;
  currency?: string;
  status?: string;
  lines: JobOrderLineInput[];
}

export async function fetchJobOrders(search?: string): Promise<JobOrderApi[]> {
  const query = new URLSearchParams({ limit: '500' });
  if (search) query.set('search', search);
  return apiRequest<JobOrderApi[]>(`/api/v1/job-orders?${query}`);
}

export async function createJobOrder(data: JobOrderInput): Promise<JobOrderApi> {
  return apiRequest<JobOrderApi>('/api/v1/job-orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updateJobOrder(id: number, data: JobOrderInput): Promise<JobOrderApi> {
  return apiRequest<JobOrderApi>(`/api/v1/job-orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deleteJobOrder(id: number): Promise<void> {
  await apiRequest<void>(`/api/v1/job-orders/${id}`, { method: 'DELETE' });
}

export interface JobConsumedItemApi {
  id: number;
  job_order_id: number;
  item_id: number;
  item_name: string;
  unit: string;
  quantity: number;
  consumed_date: string;
  notes: string;
  created_at: string;
}

export interface JobConsumptionLineInput {
  item_id: number;
  quantity: number;
  notes?: string;
}

export interface JobConsumptionInput {
  consumed_date: string;
  notes?: string;
  lines: JobConsumptionLineInput[];
}

export async function fetchJobConsumptions(jobId: number): Promise<JobConsumedItemApi[]> {
  return apiRequest<JobConsumedItemApi[]>(`/api/v1/job-orders/${jobId}/consumptions`);
}

export async function createJobConsumptions(
  jobId: number,
  data: JobConsumptionInput
): Promise<JobConsumedItemApi[]> {
  return apiRequest<JobConsumedItemApi[]>(`/api/v1/job-orders/${jobId}/consumptions`, {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
