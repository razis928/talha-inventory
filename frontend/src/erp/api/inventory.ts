import { InventoryFormData, InventoryItem } from '../types';
import { apiRequest } from './client';

export interface InventoryApiItem {
  id: number;
  name: string;
  sku: string;
  type: 'Raw' | 'Finished';
  category: string;
  cost_price: number;
  selling_price: number;
  stock_quantity: number;
  min_stock: number;
  max_stock: number;
  gsm: number;
  size: number;
  unit: string;
  created_at: string;
  updated_at: string;
}

function normalizeCategory(type: 'Raw' | 'Finished', category: string): string {
  if (type === 'Finished' && category === 'Finished Products') return '—';
  return category;
}

export function mapApiItemToInventory(item: InventoryApiItem): InventoryItem {
  return {
    id: String(item.id),
    name: item.name,
    sku: item.sku,
    type: item.type,
    category: item.category,
    costPrice: Number(item.cost_price),
    sellingPrice: Number(item.selling_price),
    stockLevel: item.stock_quantity,
    minStock: item.min_stock,
    maxStock: item.max_stock,
    gsm: Number(item.gsm),
    size: Number(item.size),
    unit: item.unit,
  };
}

function mapFormToApiPayload(data: InventoryFormData, maxStock?: number) {
  const category = normalizeCategory(data.type, data.category);
  return {
    name: data.name,
    sku: data.sku,
    type: data.type,
    category,
    cost_price: data.costPrice,
    selling_price: data.sellingPrice,
    stock_quantity: data.stockLevel,
    min_stock: data.minStock,
    max_stock: maxStock ?? Math.max(data.stockLevel * 2, 100),
    gsm: data.gsm,
    size: data.size,
    unit: data.unit,
  };
}

export async function fetchInventoryItems(params?: {
  search?: string;
  type?: 'Raw' | 'Finished';
}): Promise<InventoryItem[]> {
  const query = new URLSearchParams();
  if (params?.search) query.set('search', params.search);
  if (params?.type) query.set('type', params.type);
  query.set('limit', '500');

  const qs = query.toString();
  const items = await apiRequest<InventoryApiItem[]>(
    `/api/v1/inventory/items${qs ? `?${qs}` : ''}`
  );
  return items.map(mapApiItemToInventory);
}

export async function createInventoryItem(data: InventoryFormData): Promise<InventoryItem> {
  const created = await apiRequest<InventoryApiItem>('/api/v1/inventory/items', {
    method: 'POST',
    body: JSON.stringify(mapFormToApiPayload(data)),
  });
  return mapApiItemToInventory(created);
}

export async function updateInventoryItem(
  id: string,
  data: InventoryFormData,
  maxStock?: number
): Promise<InventoryItem> {
  const updated = await apiRequest<InventoryApiItem>(`/api/v1/inventory/items/${id}`, {
    method: 'PUT',
    body: JSON.stringify(mapFormToApiPayload(data, maxStock)),
  });
  return mapApiItemToInventory(updated);
}

export async function deleteInventoryItem(id: string): Promise<void> {
  await apiRequest<void>(`/api/v1/inventory/items/${id}`, {
    method: 'DELETE',
  });
}
