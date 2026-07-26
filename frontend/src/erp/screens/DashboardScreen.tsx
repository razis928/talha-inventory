import { useCallback, useEffect, useMemo, useState } from 'react';
import StatCard from '../components/StatCard';
import ScreenFrame from '../components/ScreenFrame';
import { useErp } from '../context/ErpContext';
import { matchesSearch } from '../utils/filter';
import { formatPkr } from '../utils/currency';
import {
  AccountingSummary,
  fetchAccountingSummary,
  fetchPayments,
  PaymentApi,
} from '../api/accounting';

function Panel({
  title,
  children,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`border border-[var(--color-erp-border)] ${className}`}>
      <div className="erp-titlebar text-xs">{title}</div>
      <div className="erp-form-panel">{children}</div>
    </div>
  );
}

interface ActivityRow {
  id: string;
  kind: string;
  reference: string;
  party: string;
  date: string;
  amount: number | null;
  detail: string;
}

function sortDateDesc(a: string, b: string) {
  return b.localeCompare(a);
}

export default function DashboardScreen({ searchQuery }: { searchQuery: string }) {
  const {
    inventory,
    purchaseOrders,
    jobOrders,
    dispatches,
    stockTransactions,
    refreshStockTransactions,
  } = useErp();

  const [summary, setSummary] = useState<AccountingSummary | null>(null);
  const [payments, setPayments] = useState<PaymentApi[]>([]);
  const [loadingExtra, setLoadingExtra] = useState(true);

  const loadExtra = useCallback(async () => {
    setLoadingExtra(true);
    try {
      const [s, pays] = await Promise.all([
        fetchAccountingSummary(),
        fetchPayments(),
        refreshStockTransactions(),
      ]);
      setSummary(s);
      setPayments(pays);
    } catch {
      setSummary(null);
      setPayments([]);
    } finally {
      setLoadingExtra(false);
    }
  }, [refreshStockTransactions]);

  useEffect(() => {
    void loadExtra();
  }, [loadExtra]);

  const inventoryValue = useMemo(
    () =>
      inventory.reduce(
        (sum, item) => sum + Number(item.stockLevel || 0) * Number(item.costPrice || 0),
        0
      ),
    [inventory]
  );

  const openPos = useMemo(
    () =>
      purchaseOrders.filter(
        (po) => !['Received', 'Cancelled', 'Closed'].includes(po.status)
      ),
    [purchaseOrders]
  );

  const activeJobs = useMemo(
    () =>
      jobOrders.filter((job) =>
        ['Pending', 'In Progress'].includes(job.status)
      ),
    [jobOrders]
  );

  const lowStockAlerts = useMemo(
    () =>
      inventory
        .filter((item) => item.type === 'Raw' && item.stockLevel <= item.minStock)
        .map((item) => ({
          id: item.id,
          name: item.name,
          sku: item.sku,
          stock: item.stockLevel,
          minStock: item.minStock,
          category: item.category,
        })),
    [inventory]
  );

  const pendingDispatchJobs = useMemo(
    () =>
      jobOrders
        .filter((job) =>
          job.lines.some((line) => line.order_pending_quantity > 0)
          && !['Cancelled', 'Completed'].includes(job.status)
        )
        .slice(0, 8),
    [jobOrders]
  );

  const recentActivity = useMemo(() => {
    const rows: ActivityRow[] = [];

    for (const po of purchaseOrders) {
      rows.push({
        id: `po-${po.id}`,
        kind: 'Purchase',
        reference: po.po_number,
        party: po.vendor || '—',
        date: String(po.created_at).slice(0, 10),
        amount: Number(po.total_amount) || 0,
        detail: po.status,
      });
    }
    for (const job of jobOrders) {
      rows.push({
        id: `job-${job.id}`,
        kind: 'Job',
        reference: job.job_number,
        party: job.customer_name || '—',
        date: String(job.created_at).slice(0, 10),
        amount: Number(job.total_amount) || 0,
        detail: job.status,
      });
    }
    for (const gp of dispatches) {
      const qty = gp.lines.reduce((sum, line) => sum + line.quantity, 0);
      rows.push({
        id: `gp-${gp.id}`,
        kind: 'Gate Pass',
        reference: gp.pass_number,
        party: gp.customer_name || gp.job_number || '—',
        date: String(gp.dispatch_date).slice(0, 10),
        amount: null,
        detail: `${qty} units · ${gp.status}`,
      });
    }
    for (const tx of stockTransactions) {
      rows.push({
        id: `stk-${tx.id}`,
        kind: `Stock ${tx.transaction_type}`,
        reference: tx.reference_number || `STK-${tx.id}`,
        party: tx.item_name,
        date: String(tx.created_at).slice(0, 10),
        amount: null,
        detail: `${tx.transaction_type} ${tx.quantity} ${tx.unit}`,
      });
    }
    for (const pay of payments) {
      rows.push({
        id: `pay-${pay.id}`,
        kind: pay.payment_type === 'Receipt' ? 'Receipt' : 'Payment',
        reference: pay.reference,
        party: pay.party_name || '—',
        date: String(pay.payment_date).slice(0, 10),
        amount: Number(pay.amount) || 0,
        detail: pay.method,
      });
    }

    return rows.sort((a, b) => sortDateDesc(a.date, b.date)).slice(0, 12);
  }, [purchaseOrders, jobOrders, dispatches, stockTransactions, payments]);

  const filteredActivity = useMemo(
    () =>
      recentActivity.filter((row) =>
        matchesSearch(row as unknown as Record<string, unknown>, searchQuery)
      ),
    [recentActivity, searchQuery]
  );

  const filteredLowStock = useMemo(
    () =>
      lowStockAlerts.filter((row) =>
        matchesSearch(row as unknown as Record<string, unknown>, searchQuery)
      ),
    [lowStockAlerts, searchQuery]
  );

  return (
    <ScreenFrame
      title="Executive Dashboard"
      subtitle="Live overview of inventory, orders, gate passes & accounts"
      formPanel={
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Inventory Value"
            value={formatPkr(inventoryValue)}
            highlight
          />
          <StatCard label="Open Purchase Orders" value={String(openPos.length)} />
          <StatCard label="Active Job Orders" value={String(activeJobs.length)} />
          <StatCard
            label="Cash + Bank"
            value={
              summary
                ? formatPkr(summary.cash_balance + summary.bank_balance)
                : loadingExtra
                  ? '…'
                  : formatPkr(0)
            }
          />
          <StatCard
            label="Receivables (AR)"
            value={summary ? formatPkr(summary.receivables) : loadingExtra ? '…' : formatPkr(0)}
          />
          <StatCard
            label="Payables (AP)"
            value={summary ? formatPkr(summary.payables) : loadingExtra ? '…' : formatPkr(0)}
          />
          <StatCard label="Low Stock (Raw)" value={String(lowStockAlerts.length)} />
          <StatCard label="Gate Passes" value={String(dispatches.length)} />
        </div>
      }
    >
      {searchQuery && (
        <p className="erp-muted border-b border-[var(--color-erp-border)] px-3 py-2 text-xs">
          Filtering dashboard for &quot;{searchQuery}&quot;
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 p-3 lg:grid-cols-3">
        <Panel title="Recent Activity" className="lg:col-span-2">
          <div className="overflow-x-auto">
            <table className="erp-classic-table min-w-[560px]">
              <thead>
                <tr>
                  <th>Type</th>
                  <th>Reference</th>
                  <th>Party / Item</th>
                  <th>Date</th>
                  <th>Amount / Detail</th>
                </tr>
              </thead>
              <tbody>
                {filteredActivity.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="erp-muted py-6 text-center">
                      No recent activity yet.
                    </td>
                  </tr>
                ) : (
                  filteredActivity.map((row) => (
                    <tr key={row.id}>
                      <td className="text-xs">{row.kind}</td>
                      <td className="erp-strong">{row.reference}</td>
                      <td>{row.party}</td>
                      <td>{row.date}</td>
                      <td className="erp-strong">
                        {row.amount != null ? formatPkr(row.amount) : row.detail}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title={`Low Stock — Raw (${filteredLowStock.length})`}>
          <div className="max-h-72 space-y-2 overflow-y-auto">
            {filteredLowStock.length === 0 ? (
              <p className="erp-muted text-xs">All raw items above minimum stock.</p>
            ) : (
              filteredLowStock.map((item) => (
                <div
                  key={item.id}
                  className="erp-stat-box border-amber-600 bg-[var(--color-erp-status-active)]"
                >
                  <p className="erp-strong text-xs">{item.name}</p>
                  <p className="erp-muted text-[10px]">
                    {item.sku} · {item.category || '—'}
                  </p>
                  <p className="mt-1 text-[10px] font-bold">
                    {item.stock} / {item.minStock} min stock
                  </p>
                </div>
              ))
            )}
          </div>
        </Panel>
      </div>

      <div className="grid grid-cols-1 gap-3 p-3 pt-0 lg:grid-cols-2">
        <Panel title="Jobs Pending Dispatch">
          <div className="overflow-x-auto">
            <table className="erp-classic-table">
              <thead>
                <tr>
                  <th>Job No</th>
                  <th>Customer</th>
                  <th>Status</th>
                  <th>Pending Qty</th>
                </tr>
              </thead>
              <tbody>
                {pendingDispatchJobs.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="erp-muted py-6 text-center">
                      No open job lines pending dispatch.
                    </td>
                  </tr>
                ) : (
                  pendingDispatchJobs.map((job) => {
                    const pending = job.lines.reduce(
                      (sum, line) => sum + line.order_pending_quantity,
                      0
                    );
                    return (
                      <tr key={job.id}>
                        <td className="erp-strong">{job.job_number}</td>
                        <td>{job.customer_name}</td>
                        <td>{job.status}</td>
                        <td className="erp-cell-highlight">{pending}</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </Panel>

        <Panel title="Open Purchase Orders">
          <div className="overflow-x-auto">
            <table className="erp-classic-table">
              <thead>
                <tr>
                  <th>PO No</th>
                  <th>Vendor</th>
                  <th>Status</th>
                  <th>Amount</th>
                </tr>
              </thead>
              <tbody>
                {openPos.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="erp-muted py-6 text-center">
                      No open purchase orders.
                    </td>
                  </tr>
                ) : (
                  openPos.slice(0, 8).map((po) => (
                    <tr key={po.id}>
                      <td className="erp-strong">{po.po_number}</td>
                      <td>{po.vendor}</td>
                      <td>{po.status}</td>
                      <td className="erp-strong">{formatPkr(po.total_amount)}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </Panel>
      </div>

      {summary && (
        <div className="p-3 pt-0">
          <Panel title="Profit & Loss Snapshot">
            <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
              <div className="erp-stat-box">
                <p className="erp-muted text-[10px] font-bold uppercase">Revenue</p>
                <p className="erp-strong text-lg">{formatPkr(summary.revenue)}</p>
              </div>
              <div className="erp-stat-box">
                <p className="erp-muted text-[10px] font-bold uppercase">Expenses / Costs</p>
                <p className="erp-strong text-lg">{formatPkr(summary.expenses)}</p>
              </div>
              <div className="erp-stat-box erp-stat-box-highlight">
                <p className="text-[10px] font-bold uppercase text-white/80">Net Profit</p>
                <p className="text-lg font-bold text-white">{formatPkr(summary.net_profit)}</p>
              </div>
            </div>
          </Panel>
        </div>
      )}
    </ScreenFrame>
  );
}
