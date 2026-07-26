import { useCallback, useMemo, useState } from 'react';
import { FileSpreadsheet, Play } from 'lucide-react';
import PageToolbar from '../components/PageToolbar';
import ScreenFrame from '../components/ScreenFrame';
import { useErp } from '../context/ErpContext';
import { formatPkr } from '../utils/currency';
import { matchesSearch } from '../utils/filter';
import { exportToPdf, printTableDocument, PdfColumn } from '../utils/pdfExport';
import {
  fetchAccountingSummary,
  fetchCustomerInvoices,
  fetchExpenses,
  fetchJobCosting,
  fetchPayments,
  fetchVendorBills,
} from '../api/accounting';
import { fetchCustomerDetail } from '../api/customers';
import { fetchVendorDetail } from '../api/vendors';
import { fetchStockTransactions } from '../api/stockTransactions';

type ReportId =
  | 'gate-pass'
  | 'stock-valuation'
  | 'low-stock'
  | 'stock-movement'
  | 'purchase-orders'
  | 'job-orders'
  | 'job-costing'
  | 'customer-ledger'
  | 'vendor-ledger'
  | 'customer-outstanding'
  | 'vendor-payables'
  | 'expenses'
  | 'payments'
  | 'pnl';

interface ReportDef {
  id: ReportId;
  category: string;
  name: string;
  description: string;
  needsParty?: 'customer' | 'vendor';
}

const REPORTS: ReportDef[] = [
  {
    id: 'gate-pass',
    category: 'Operations',
    name: 'Gate Pass Report',
    description: 'All dispatch / gate passes with job, customer, vehicle and quantities',
  },
  {
    id: 'stock-valuation',
    category: 'Inventory',
    name: 'Stock Valuation',
    description: 'Current stock levels with cost value by item',
  },
  {
    id: 'low-stock',
    category: 'Inventory',
    name: 'Low Stock Report',
    description: 'Raw items at or below minimum stock',
  },
  {
    id: 'stock-movement',
    category: 'Inventory',
    name: 'Stock Movement',
    description: 'Stock IN / OUT / ADJUST transactions',
  },
  {
    id: 'purchase-orders',
    category: 'Purchase',
    name: 'Purchase Orders Summary',
    description: 'PO list with vendor, status and amounts',
  },
  {
    id: 'job-orders',
    category: 'Sales',
    name: 'Job Orders Summary',
    description: 'Job orders with customer, status and totals',
  },
  {
    id: 'job-costing',
    category: 'Sales',
    name: 'Job Costing & Margin',
    description: 'Revenue, cost and margin by job',
  },
  {
    id: 'customer-ledger',
    category: 'Accounts',
    name: 'Customer Ledger',
    description: 'Receivable ledger for a selected customer',
    needsParty: 'customer',
  },
  {
    id: 'vendor-ledger',
    category: 'Accounts',
    name: 'Vendor Ledger',
    description: 'Payable ledger for a selected vendor',
    needsParty: 'vendor',
  },
  {
    id: 'customer-outstanding',
    category: 'Accounts',
    name: 'Customer Outstanding',
    description: 'Open customer invoices / AR balances',
  },
  {
    id: 'vendor-payables',
    category: 'Accounts',
    name: 'Vendor Payables',
    description: 'Open vendor bills / AP balances',
  },
  {
    id: 'expenses',
    category: 'Accounts',
    name: 'Expense Report',
    description: 'Expense vouchers with paid / credit accounts',
  },
  {
    id: 'payments',
    category: 'Accounts',
    name: 'Payments & Receipts',
    description: 'Vendor payments and customer receipts',
  },
  {
    id: 'pnl',
    category: 'Accounts',
    name: 'Profit & Loss Snapshot',
    description: 'Revenue, expenses and net profit summary',
  },
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function ReportsScreen({ searchQuery }: { searchQuery: string }) {
  const {
    inventory,
    purchaseOrders,
    jobOrders,
    dispatches,
    customers,
    vendors,
    refreshStockTransactions,
  } = useErp();

  const [selectedId, setSelectedId] = useState<ReportId>('gate-pass');
  const [partyId, setPartyId] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [rows, setRows] = useState<Record<string, unknown>[]>([]);
  const [columns, setColumns] = useState<PdfColumn[]>([]);
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ran, setRan] = useState(false);

  const filteredCatalog = useMemo(
    () =>
      REPORTS.filter((r) =>
        matchesSearch(r as unknown as Record<string, unknown>, searchQuery)
      ),
    [searchQuery]
  );

  const categories = useMemo(() => {
    const map = new Map<string, ReportDef[]>();
    for (const report of filteredCatalog) {
      const list = map.get(report.category) ?? [];
      list.push(report);
      map.set(report.category, list);
    }
    return [...map.entries()];
  }, [filteredCatalog]);

  const selected = REPORTS.find((r) => r.id === selectedId) ?? REPORTS[0];

  const inDateRange = useCallback(
    (raw: string | null | undefined) => {
      if (!raw) return true;
      const d = String(raw).slice(0, 10);
      if (dateFrom && d < dateFrom) return false;
      if (dateTo && d > dateTo) return false;
      return true;
    },
    [dateFrom, dateTo]
  );

  const runReport = useCallback(async () => {
    setLoading(true);
    setError(null);
    setRan(true);
    try {
      let nextRows: Record<string, unknown>[] = [];
      let nextCols: PdfColumn[] = [];
      let nextTitle = selected.name;
      let nextSubtitle = selected.description;

      switch (selected.id) {
        case 'gate-pass': {
          nextCols = [
            { key: 'pass_number', header: 'Gate Pass #' },
            { key: 'dispatch_date', header: 'Date' },
            { key: 'job_number', header: 'Job No' },
            { key: 'customer_name', header: 'Customer' },
            { key: 'items', header: 'Items' },
            { key: 'qty', header: 'Qty' },
            { key: 'vehicle_no', header: 'Vehicle' },
            { key: 'driver', header: 'Driver' },
            { key: 'status', header: 'Status' },
          ];
          nextRows = dispatches
            .filter((gp) => inDateRange(gp.dispatch_date))
            .map((gp) => ({
              pass_number: gp.pass_number,
              dispatch_date: gp.dispatch_date,
              job_number: gp.job_number,
              customer_name: gp.customer_name,
              items: gp.lines.map((l) => l.item_name).join(', '),
              qty: gp.lines.reduce((s, l) => s + l.quantity, 0),
              vehicle_no: gp.vehicle_no || '—',
              driver: gp.driver || '—',
              status: gp.status,
            }));
          break;
        }
        case 'stock-valuation': {
          nextCols = [
            { key: 'sku', header: 'SKU' },
            { key: 'name', header: 'Item' },
            { key: 'type', header: 'Type' },
            { key: 'unit', header: 'UOM' },
            { key: 'stockLevel', header: 'Qty' },
            { key: 'costPrice', header: 'Cost' },
            { key: 'value', header: 'Value' },
          ];
          nextRows = inventory.map((item) => ({
            sku: item.sku,
            name: item.name,
            type: item.type,
            unit: item.unit,
            stockLevel: item.stockLevel,
            costPrice: item.costPrice,
            value: Number(item.stockLevel || 0) * Number(item.costPrice || 0),
          }));
          break;
        }
        case 'low-stock': {
          nextCols = [
            { key: 'sku', header: 'SKU' },
            { key: 'name', header: 'Item' },
            { key: 'stockLevel', header: 'Stock' },
            { key: 'minStock', header: 'Min' },
            { key: 'unit', header: 'UOM' },
            { key: 'category', header: 'Category' },
          ];
          nextRows = inventory
            .filter((item) => item.type === 'Raw' && item.stockLevel <= item.minStock)
            .map((item) => ({
              sku: item.sku,
              name: item.name,
              stockLevel: item.stockLevel,
              minStock: item.minStock,
              unit: item.unit,
              category: item.category || '—',
            }));
          break;
        }
        case 'stock-movement': {
          await refreshStockTransactions();
          const txns = await fetchStockTransactions();
          nextCols = [
            { key: 'created_at', header: 'Date' },
            { key: 'item_name', header: 'Item' },
            { key: 'transaction_type', header: 'Type' },
            { key: 'quantity', header: 'Qty' },
            { key: 'unit', header: 'UOM' },
            { key: 'balance_after', header: 'Balance' },
            { key: 'reference_number', header: 'Reference' },
            { key: 'notes', header: 'Notes' },
          ];
          nextRows = txns
            .filter((tx) => inDateRange(tx.created_at))
            .map((tx) => ({
              created_at: String(tx.created_at).slice(0, 10),
              item_name: tx.item_name,
              transaction_type: tx.transaction_type,
              quantity: tx.quantity,
              unit: tx.unit,
              balance_after: tx.balance_after,
              reference_number: tx.reference_number || '—',
              notes: tx.notes || '—',
            }));
          break;
        }
        case 'purchase-orders': {
          nextCols = [
            { key: 'po_number', header: 'PO #' },
            { key: 'vendor', header: 'Vendor' },
            { key: 'status', header: 'Status' },
            { key: 'required_date', header: 'Required' },
            { key: 'total_amount', header: 'Amount' },
            { key: 'created_at', header: 'Created' },
          ];
          nextRows = purchaseOrders
            .filter((po) => inDateRange(po.created_at))
            .map((po) => ({
              po_number: po.po_number,
              vendor: po.vendor,
              status: po.status,
              required_date: po.required_date || '—',
              total_amount: po.total_amount,
              created_at: String(po.created_at).slice(0, 10),
            }));
          break;
        }
        case 'job-orders': {
          nextCols = [
            { key: 'job_number', header: 'Job #' },
            { key: 'customer_name', header: 'Customer' },
            { key: 'status', header: 'Status' },
            { key: 'required_date', header: 'Required' },
            { key: 'total_amount', header: 'Amount' },
            { key: 'created_at', header: 'Created' },
          ];
          nextRows = jobOrders
            .filter((job) => inDateRange(job.created_at))
            .map((job) => ({
              job_number: job.job_number,
              customer_name: job.customer_name,
              status: job.status,
              required_date: job.required_date || '—',
              total_amount: job.total_amount,
              created_at: String(job.created_at).slice(0, 10),
            }));
          break;
        }
        case 'job-costing': {
          const costs = await fetchJobCosting();
          nextCols = [
            { key: 'job_number', header: 'Job #' },
            { key: 'customer_name', header: 'Customer' },
            { key: 'status', header: 'Status' },
            { key: 'revenue', header: 'Revenue' },
            { key: 'total_cost', header: 'Cost' },
            { key: 'margin', header: 'Margin' },
            { key: 'margin_percent', header: 'Margin %' },
          ];
          nextRows = costs.map((row) => ({
            job_number: row.job_number,
            customer_name: row.customer_name,
            status: row.status,
            revenue: row.revenue,
            total_cost: row.total_cost,
            margin: row.margin,
            margin_percent: `${row.margin_percent}%`,
          }));
          break;
        }
        case 'customer-ledger': {
          const id = Number(partyId);
          if (!id) throw new Error('Select a customer');
          const detail = await fetchCustomerDetail(id);
          nextTitle = `Customer Ledger — ${detail.customer.name}`;
          nextSubtitle = `Balance ${formatPkr(detail.account_balance)}`;
          nextCols = [
            { key: 'date', header: 'Date' },
            { key: 'description', header: 'Description' },
            { key: 'debit', header: 'Debit' },
            { key: 'credit', header: 'Credit' },
            { key: 'balance', header: 'Balance' },
          ];
          nextRows = detail.ledger
            .filter((line) => inDateRange(String(line.date)))
            .map((line) => ({
              date: String(line.date).slice(0, 10),
              description: line.description || line.memo || '—',
              debit: line.debit,
              credit: line.credit,
              balance: line.balance,
            }));
          break;
        }
        case 'vendor-ledger': {
          const id = Number(partyId);
          if (!id) throw new Error('Select a vendor');
          const detail = await fetchVendorDetail(id);
          nextTitle = `Vendor Ledger — ${detail.vendor.name}`;
          nextSubtitle = `Balance ${formatPkr(detail.account_balance)}`;
          nextCols = [
            { key: 'date', header: 'Date' },
            { key: 'description', header: 'Description' },
            { key: 'debit', header: 'Debit' },
            { key: 'credit', header: 'Credit' },
            { key: 'balance', header: 'Balance' },
          ];
          nextRows = detail.ledger
            .filter((line) => inDateRange(String(line.date)))
            .map((line) => ({
              date: String(line.date).slice(0, 10),
              description: line.description || line.memo || '—',
              debit: line.debit,
              credit: line.credit,
              balance: line.balance,
            }));
          break;
        }
        case 'customer-outstanding': {
          const invoices = await fetchCustomerInvoices();
          nextCols = [
            { key: 'invoice_number', header: 'Invoice #' },
            { key: 'customer_name', header: 'Customer' },
            { key: 'invoice_date', header: 'Date' },
            { key: 'amount', header: 'Amount' },
            { key: 'paid_amount', header: 'Received' },
            { key: 'balance', header: 'Balance' },
            { key: 'status', header: 'Status' },
          ];
          nextRows = invoices
            .filter((inv) => inv.balance > 0 && inDateRange(inv.invoice_date))
            .map((inv) => ({
              invoice_number: inv.invoice_number,
              customer_name: inv.customer_name,
              invoice_date: inv.invoice_date,
              amount: inv.amount,
              paid_amount: inv.paid_amount,
              balance: inv.balance,
              status: inv.status,
            }));
          break;
        }
        case 'vendor-payables': {
          const bills = await fetchVendorBills();
          nextCols = [
            { key: 'bill_number', header: 'Bill #' },
            { key: 'vendor_name', header: 'Vendor' },
            { key: 'bill_date', header: 'Date' },
            { key: 'amount', header: 'Amount' },
            { key: 'paid_amount', header: 'Paid' },
            { key: 'balance', header: 'Balance' },
            { key: 'status', header: 'Status' },
          ];
          nextRows = bills
            .filter((bill) => bill.balance > 0 && inDateRange(bill.bill_date))
            .map((bill) => ({
              bill_number: bill.bill_number,
              vendor_name: bill.vendor_name,
              bill_date: bill.bill_date,
              amount: bill.amount,
              paid_amount: bill.paid_amount,
              balance: bill.balance,
              status: bill.status,
            }));
          break;
        }
        case 'expenses': {
          const expenses = await fetchExpenses();
          nextCols = [
            { key: 'expense_number', header: 'Expense #' },
            { key: 'title', header: 'Title' },
            { key: 'category', header: 'Category' },
            { key: 'paid_to', header: 'Paid To' },
            { key: 'payment_method', header: 'Credit From' },
            { key: 'amount', header: 'Amount' },
            { key: 'expense_date', header: 'Date' },
          ];
          nextRows = expenses
            .filter((exp) => inDateRange(exp.expense_date))
            .map((exp) => ({
              expense_number: exp.expense_number,
              title: exp.title,
              category: exp.category,
              paid_to: exp.paid_to || '—',
              payment_method: exp.payment_method || '—',
              amount: exp.amount,
              expense_date: exp.expense_date,
            }));
          break;
        }
        case 'payments': {
          const payments = await fetchPayments();
          nextCols = [
            { key: 'reference', header: 'Reference' },
            { key: 'payment_type', header: 'Type' },
            { key: 'party_name', header: 'Party' },
            { key: 'method', header: 'Method' },
            { key: 'amount', header: 'Amount' },
            { key: 'payment_date', header: 'Date' },
            { key: 'notes', header: 'Notes' },
          ];
          nextRows = payments
            .filter((pay) => inDateRange(pay.payment_date))
            .map((pay) => ({
              reference: pay.reference,
              payment_type: pay.payment_type,
              party_name: pay.party_name,
              method: pay.method,
              amount: pay.amount,
              payment_date: pay.payment_date,
              notes: pay.notes || '—',
            }));
          break;
        }
        case 'pnl': {
          const summary = await fetchAccountingSummary();
          nextCols = [
            { key: 'metric', header: 'Metric' },
            { key: 'amount', header: 'Amount' },
          ];
          nextRows = [
            { metric: 'Revenue', amount: summary.revenue },
            { metric: 'Expenses / Direct costs', amount: summary.expenses },
            { metric: 'Net Profit', amount: summary.net_profit },
            { metric: 'Cash Balance', amount: summary.cash_balance },
            { metric: 'Bank Balance', amount: summary.bank_balance },
            { metric: 'Receivables (AR)', amount: summary.receivables },
            { metric: 'Payables (AP)', amount: summary.payables },
          ];
          nextSubtitle = `As of ${todayIso()}`;
          break;
        }
        default:
          break;
      }

      setColumns(nextCols);
      setRows(nextRows);
      setTitle(nextTitle);
      setSubtitle(
        [nextSubtitle, dateFrom || dateTo ? `Period ${dateFrom || '…'} → ${dateTo || '…'}` : '']
          .filter(Boolean)
          .join(' · ')
      );
    } catch (err) {
      setRows([]);
      setColumns([]);
      setError(err instanceof Error ? err.message : 'Failed to run report');
    } finally {
      setLoading(false);
    }
  }, [
    selected,
    partyId,
    dateFrom,
    dateTo,
    dispatches,
    inventory,
    purchaseOrders,
    jobOrders,
    inDateRange,
    refreshStockTransactions,
  ]);

  const handleExportPdf = () => {
    if (!rows.length) return;
    void exportToPdf({
      title,
      subtitle,
      columns,
      rows,
      filename: `report-${selected.id}-${todayIso()}`,
    });
  };

  const handlePrint = () => {
    if (!rows.length) return;
    printTableDocument({ title, subtitle, columns, rows });
  };

  const cellDisplay = (row: Record<string, unknown>, key: string) => {
    const val = row[key];
    if (val == null || val === '') return '—';
    if (
      typeof val === 'number' &&
      ['amount', 'value', 'costPrice', 'total_amount', 'revenue', 'total_cost', 'margin', 'debit', 'credit', 'balance', 'paid_amount'].includes(key)
    ) {
      return formatPkr(val);
    }
    return String(val);
  };

  return (
    <ScreenFrame
      title="Reports & Analytics"
      subtitle="Run operational, stock and account reports — export or print as PDF"
      toolbar={
        <PageToolbar
          onExportPdf={handleExportPdf}
          onPrint={handlePrint}
          exportDisabled={!rows.length}
        />
      }
    >
      {searchQuery && (
        <p className="erp-muted border-b border-[var(--color-erp-border)] px-3 py-2 text-xs">
          Filtering report catalog for &quot;{searchQuery}&quot;
        </p>
      )}

      <div className="grid grid-cols-1 gap-3 p-3 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-1">
          {categories.map(([category, reports]) => (
            <div key={category} className="border border-[var(--color-erp-border)]">
              <div className="erp-titlebar text-xs">{category}</div>
              <div className="divide-y divide-[var(--color-erp-border)]">
                {reports.map((report) => (
                  <button
                    key={report.id}
                    type="button"
                    className={`flex w-full flex-col gap-0.5 px-3 py-2 text-left text-xs ${
                      selectedId === report.id
                        ? 'bg-[var(--color-erp-titlebar)] text-white'
                        : 'hover:bg-[var(--color-erp-table-head)]'
                    }`}
                    onClick={() => {
                      setSelectedId(report.id);
                      setPartyId('');
                      setRan(false);
                      setRows([]);
                      setError(null);
                    }}
                  >
                    <span className="erp-strong">{report.name}</span>
                    <span className={selectedId === report.id ? 'text-white/80' : 'erp-muted'}>
                      {report.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="lg:col-span-2">
          <div className="border border-[var(--color-erp-border)]">
            <div className="erp-titlebar text-xs">{selected.name}</div>
            <div className="erp-form-panel space-y-3">
              <p className="erp-muted text-xs">{selected.description}</p>

              <div className="grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                <div className="erp-field-row">
                  <label className="erp-field-label">From</label>
                  <input
                    type="date"
                    value={dateFrom}
                    onChange={(e) => setDateFrom(e.target.value)}
                    className="erp-input w-full"
                  />
                </div>
                <div className="erp-field-row">
                  <label className="erp-field-label">To</label>
                  <input
                    type="date"
                    value={dateTo}
                    onChange={(e) => setDateTo(e.target.value)}
                    className="erp-input w-full"
                  />
                </div>
                {selected.needsParty === 'customer' && (
                  <div className="erp-field-row">
                    <label className="erp-field-label">Customer</label>
                    <select
                      value={partyId}
                      onChange={(e) => setPartyId(e.target.value)}
                      className="erp-classic-select w-full"
                      required
                    >
                      <option value="">— Select customer —</option>
                      {customers.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                )}
                {selected.needsParty === 'vendor' && (
                  <div className="erp-field-row">
                    <label className="erp-field-label">Vendor</label>
                    <select
                      value={partyId}
                      onChange={(e) => setPartyId(e.target.value)}
                      className="erp-classic-select w-full"
                      required
                    >
                      <option value="">— Select vendor —</option>
                      {vendors.map((v) => (
                        <option key={v.id} value={v.id}>{v.name}</option>
                      ))}
                    </select>
                  </div>
                )}
              </div>

              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  className="erp-btn-primary flex items-center gap-1 text-xs"
                  disabled={loading}
                  onClick={() => void runReport()}
                >
                  <Play size={14} />
                  {loading ? 'Running…' : 'Run Report'}
                </button>
                <button
                  type="button"
                  className="erp-btn-ghost flex items-center gap-1 text-xs"
                  disabled={!rows.length}
                  onClick={handleExportPdf}
                >
                  <FileSpreadsheet size={14} />
                  Export PDF
                </button>
              </div>

              {error && <p className="text-xs text-red-600">{error}</p>}

              {ran && !loading && !error && (
                <div className="overflow-x-auto border border-[var(--color-erp-border)]">
                  <table className="erp-classic-table min-w-[520px]">
                    <thead>
                      <tr>
                        {columns.map((col) => (
                          <th key={col.key}>{col.header}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {rows.length === 0 ? (
                        <tr>
                          <td colSpan={Math.max(columns.length, 1)} className="erp-muted py-6 text-center">
                            No records for this report / period.
                          </td>
                        </tr>
                      ) : (
                        rows.map((row, i) => (
                          <tr key={i}>
                            {columns.map((col) => (
                              <td key={col.key}>{cellDisplay(row, col.key)}</td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                  {rows.length > 0 && (
                    <p className="erp-muted px-2 py-1 text-[10px]">{rows.length} record(s)</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ScreenFrame>
  );
}
