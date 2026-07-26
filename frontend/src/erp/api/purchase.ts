import { apiRequest } from './client';

export interface PurchaseOrderLineApi {
  id: number;
  item_id: number;
  item_name: string;
  gsm: number;
  size: string;
  unit: string;
  quantity: number;
  received_quantity: number;
  po_rate: number;
  gst_percent: number;
  gross_amount: number;
  line_total: number;
}

export interface PurchaseOrderApi {
  id: number;
  po_number: string;
  vendor_id: number | null;
  vendor: string;
  required_date: string | null;
  payment_terms: string;
  remarks: string;
  tax_amount: number;
  status: string;
  total_amount: number;
  lines: PurchaseOrderLineApi[];
  created_at: string;
  updated_at: string;
}

export interface PurchaseOrderLineInput {
  item_id: number;
  size: string;
  quantity: number;
  po_rate: number;
  gst_percent: number;
}

export interface PurchaseOrderInput {
  po_number: string;
  vendor_id: number;
  required_date?: string | null;
  payment_terms?: string;
  remarks?: string;
  lines: PurchaseOrderLineInput[];
}

export interface ReceivingLineApi {
  id: number;
  item_id: number;
  item_name: string;
  unit: string;
  quantity: number;
  purchase_order_line_id: number | null;
}

export interface ReceivingApi {
  id: number;
  receiving_number: string;
  purchase_order_id: number | null;
  vendor_id: number | null;
  vendor: string;
  received_date: string;
  notes: string;
  created_by: string;
  lines: ReceivingLineApi[];
  created_at: string;
}

export interface ReceivingLineInput {
  item_id: number;
  quantity: number;
  purchase_order_line_id?: number | null;
}

export interface ReceivingInput {
  receiving_number: string;
  purchase_order_id?: number | null;
  vendor_id?: number | null;
  vendor?: string;
  received_date: string;
  notes?: string;
  created_by?: string;
  lines: ReceivingLineInput[];
}

export async function fetchPurchaseOrders(search?: string): Promise<PurchaseOrderApi[]> {
  const query = new URLSearchParams({ limit: '500' });
  if (search) query.set('search', search);
  return apiRequest<PurchaseOrderApi[]>(`/api/v1/purchase/orders?${query}`);
}

export async function createPurchaseOrder(data: PurchaseOrderInput): Promise<PurchaseOrderApi> {
  return apiRequest<PurchaseOrderApi>('/api/v1/purchase/orders', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}

export async function updatePurchaseOrder(
  id: number,
  data: PurchaseOrderInput
): Promise<PurchaseOrderApi> {
  return apiRequest<PurchaseOrderApi>(`/api/v1/purchase/orders/${id}`, {
    method: 'PUT',
    body: JSON.stringify(data),
  });
}

export async function deletePurchaseOrder(id: number): Promise<void> {
  await apiRequest<void>(`/api/v1/purchase/orders/${id}`, { method: 'DELETE' });
}

export async function approvePurchaseOrder(id: number): Promise<PurchaseOrderApi> {
  return apiRequest<PurchaseOrderApi>(`/api/v1/purchase/orders/${id}/approve`, {
    method: 'POST',
  });
}

export async function fetchReceivings(search?: string): Promise<ReceivingApi[]> {
  const query = new URLSearchParams({ limit: '500' });
  if (search) query.set('search', search);
  return apiRequest<ReceivingApi[]>(`/api/v1/purchase/receivings?${query}`);
}

export async function createReceiving(data: ReceivingInput): Promise<ReceivingApi> {
  return apiRequest<ReceivingApi>('/api/v1/purchase/receivings', {
    method: 'POST',
    body: JSON.stringify(data),
  });
}
