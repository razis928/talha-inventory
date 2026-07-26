import { useEffect, useMemo, useState } from 'react';
import DataTable, { Column } from '../components/DataTable';
import PageToolbar from '../components/PageToolbar';
import ScreenFrame from '../components/ScreenFrame';
import { useErp } from '../context/ErpContext';
import { StockTransactionApi } from '../api/stockTransactions';
import { matchesSearch } from '../utils/filter';

const PAGE_SIZE = 10;

interface StockTransactionsScreenProps {
  searchQuery: string;
}

export default function StockTransactionsScreen({ searchQuery }: StockTransactionsScreenProps) {
  const {
    stockTransactions,
    stockTxnLoading,
    stockTxnError,
    refreshStockTransactions,
    inventory,
  } = useErp();
  const [page, setPage] = useState(1);
  const [productId, setProductId] = useState('All');

  useEffect(() => {
    void refreshStockTransactions();
  }, [refreshStockTransactions]);

  useEffect(() => {
    setPage(1);
  }, [searchQuery, productId]);

  const productOptions = useMemo(() => {
    const names = new Map<string, string>();
    inventory.forEach((item) => names.set(item.id, item.name));
    stockTransactions.forEach((txn) => {
      if (!names.has(String(txn.item_id))) {
        names.set(String(txn.item_id), txn.item_name);
      }
    });
    return Array.from(names.entries()).sort((a, b) => a[1].localeCompare(b[1]));
  }, [inventory, stockTransactions]);

  const filtered = useMemo(() => {
    return stockTransactions.filter((row) => {
      if (productId !== 'All' && String(row.item_id) !== productId) return false;
      return matchesSearch(
        {
          ...row,
          itemName: row.item_name,
          referenceNumber: row.reference_number,
          type: row.transaction_type,
        } as unknown as Record<string, unknown>,
        searchQuery
      );
    });
  }, [stockTransactions, searchQuery, productId]);

  const columns: Column<StockTransactionApi>[] = [
    {
      key: 'created_at',
      header: 'Date',
      render: (r) => new Date(r.created_at).toLocaleString(),
    },
    { key: 'item_name', header: 'Item', render: (r) => <span className="erp-strong">{r.item_name}</span> },
    {
      key: 'transaction_type',
      header: 'Type',
      render: (r) => (
        <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${
          r.transaction_type === 'IN'
            ? 'bg-emerald-50 text-emerald-700'
            : r.transaction_type === 'OUT'
              ? 'bg-red-50 text-red-700'
              : 'bg-amber-50 text-amber-700'
        }`}>
          {r.transaction_type}
        </span>
      ),
    },
    {
      key: 'quantity',
      header: 'Qty',
      highlight: true,
      render: (r) => `${r.transaction_type === 'OUT' ? '-' : '+'}${r.quantity} ${r.unit}`,
    },
    { key: 'balance_after', header: 'Balance after', render: (r) => `${r.balance_after} ${r.unit}` },
    { key: 'reference_number', header: 'Reference', render: (r) => r.reference_number || '—' },
    { key: 'notes', header: 'Notes', render: (r) => r.notes || '—' },
  ];

  return (
    <ScreenFrame
      title="Stock Transactions"
      subtitle="Full history of stock in / out movements"
      toolbar={
        <PageToolbar
          extra={
            <div className="flex flex-wrap items-center gap-2">
              <label className="erp-field-label mb-0 whitespace-nowrap">Product</label>
              <select
                value={productId}
                onChange={(e) => setProductId(e.target.value)}
                className="erp-classic-select min-w-[180px]"
              >
                <option value="All">All products</option>
                {productOptions.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
              <button type="button" className="erp-btn-ghost" onClick={() => void refreshStockTransactions()}>
                Refresh
              </button>
            </div>
          }
        />
      }
    >
      {stockTxnLoading && <div className="px-3 py-2 text-sm erp-muted">Loading transactions…</div>}
      {stockTxnError && <div className="px-3 py-2 text-sm text-red-600">{stockTxnError}</div>}
      <DataTable
        columns={columns}
        data={filtered}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        showActions={false}
        keyExtractor={(row) => String(row.id)}
      />
    </ScreenFrame>
  );
}
