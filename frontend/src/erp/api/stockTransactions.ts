import { apiRequest } from './client';

export interface StockTransactionApi {
  id: number;
  item_id: number;
  item_name: string;
  transaction_type: 'IN' | 'OUT' | 'ADJUST';
  quantity: number;
  balance_after: number;
  unit: string;
  reference_type: string;
  reference_id: number | null;
  reference_number: string;
  notes: string;
  created_at: string;
}

export async function fetchStockTransactions(params?: {
  search?: string;
  itemId?: number;
  type?: 'IN' | 'OUT' | 'ADJUST';
}): Promise<StockTransactionApi[]> {
  const query = new URLSearchParams({ limit: '500' });
  if (params?.search) query.set('search', params.search);
  if (params?.itemId) query.set('item_id', String(params.itemId));
  if (params?.type) query.set('type', params.type);
  return apiRequest<StockTransactionApi[]>(`/api/v1/inventory/stock-transactions?${query}`);
}
