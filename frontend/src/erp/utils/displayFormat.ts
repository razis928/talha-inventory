export function formatSizeWithUnit(row: Record<string, unknown>): string {
  const size = row.size;
  const unit = row.sizeUnit;
  if (size == null || size === '') return '—';
  return unit ? `${size} ${unit}` : String(size);
}

export function formatTaxPercent(tax: unknown): string {
  if (tax == null || tax === '') return '—';
  return `${tax}%`;
}

export function formatQuantityPcs(qty: unknown): string {
  if (qty == null || qty === '') return '—';
  return `${qty} pcs`;
}
