export const CURRENCY_CODE = 'PKR';

const pkrFormatter = (decimals: number) =>
  new Intl.NumberFormat('en-PK', {
    style: 'currency',
    currency: CURRENCY_CODE,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

/** Whole amounts — stats, invoices, balances */
export function formatPkr(amount: number): string {
  const decimals = Number.isInteger(amount) ? 0 : 2;
  return pkrFormatter(decimals).format(amount);
}

/** Unit prices — cost/selling price with 2 decimals */
export function formatPkrPrice(amount: number): string {
  return pkrFormatter(2).format(amount);
}

export const CURRENCY_FIELD_KEYS = [
  'costPrice',
  'sellingPrice',
  'amount',
  'totalAmount',
  'totalRevenue',
  'outstanding',
  'balance',
  'totalValue',
] as const;

export function isCurrencyField(key: string): boolean {
  return (CURRENCY_FIELD_KEYS as readonly string[]).includes(key);
}
