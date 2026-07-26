import { useEffect, useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { InventoryItem } from '../types';
import ScreenFrame from '../components/ScreenFrame';
import PageToolbar from '../components/PageToolbar';
import { formatPkrPrice } from '../utils/currency';
import { fetchStockTransactions, StockTransactionApi } from '../api/stockTransactions';

interface StockDetailsScreenProps {
  item: InventoryItem;
  onBack: () => void;
}

export default function StockDetailsScreen({ item, onBack }: StockDetailsScreenProps) {
  const [history, setHistory] = useState<StockTransactionApi[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    void fetchStockTransactions({ itemId: Number(item.id) })
      .then((rows) => {
        if (!cancelled) setHistory(rows);
      })
      .catch((err: unknown) => {
        if (!cancelled) {
          setError(err instanceof Error ? err.message : 'Failed to load stock history');
          setHistory([]);
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [item.id]);

  return (
    <ScreenFrame
      title={item.name}
      toolbar={
        <PageToolbar
          extra={
            <button type="button" onClick={onBack} className="erp-btn-ghost flex items-center gap-1">
              <ArrowLeft size={14} />
              Back to Inventory
            </button>
          }
        />
      }
      formPanel={
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { label: 'SKU', value: item.sku },
            { label: 'Category', value: item.category || '—' },
            { label: 'Type', value: item.type },
            { label: 'Current Stock', value: `${item.stockLevel} ${item.unit}` },
            { label: 'GSM', value: String(item.gsm) },
            { label: 'Size', value: String(item.size) },
            { label: 'Unit', value: item.unit },
            { label: 'Item Price', value: formatPkrPrice(item.costPrice || item.sellingPrice) },
          ].map((stat) => (
            <div key={stat.label} className="erp-stat-box">
              <p className="erp-field-label">{stat.label}</p>
              <p className="erp-strong text-sm">{stat.value}</p>
            </div>
          ))}
        </div>
      }
    >
      <div className="border-t border-[var(--color-erp-border)] p-3">
        <div className="erp-titlebar mb-0 text-xs">Stock History</div>
        {loading && <p className="erp-muted px-2 py-3 text-sm">Loading stock history…</p>}
        {error && <p className="px-2 py-3 text-sm text-red-600">{error}</p>}
        {!loading && !error && (
          <div className="overflow-x-auto">
            <table className="erp-classic-table min-w-[560px]">
              <thead>
                <tr>
                  {['Date', 'Type', 'Quantity', 'Reference', 'Balance'].map((h) => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {history.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="erp-muted py-6 text-center">
                      No stock movements for this item yet.
                    </td>
                  </tr>
                ) : (
                  history.map((h) => (
                    <tr key={h.id}>
                      <td>{new Date(h.created_at).toLocaleString()}</td>
                      <td>
                        <span className={`erp-badge ${
                          h.transaction_type === 'IN'
                            ? 'erp-badge-green'
                            : h.transaction_type === 'OUT'
                              ? 'erp-badge-red'
                              : ''
                        }`}>
                          {h.transaction_type === 'IN'
                            ? 'Stock In'
                            : h.transaction_type === 'OUT'
                              ? 'Stock Out'
                              : 'Adjustment'}
                        </span>
                      </td>
                      <td className={`erp-cell-highlight font-bold ${
                        h.transaction_type === 'OUT' ? 'text-red-700' : 'text-green-700'
                      }`}>
                        {h.transaction_type === 'OUT' ? '-' : '+'}
                        {h.quantity} {h.unit}
                      </td>
                      <td>{h.reference_number || '—'}</td>
                      <td className="erp-strong">{h.balance_after} {h.unit}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </ScreenFrame>
  );
}
