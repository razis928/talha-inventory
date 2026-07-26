import { useCallback, useEffect, useMemo, useState } from 'react';
import { ArrowLeft, FileText, Plus } from 'lucide-react';
import PageToolbar from '../components/PageToolbar';
import ScreenFrame from '../components/ScreenFrame';
import RecordModal from '../components/RecordModal';
import StatCard from '../components/StatCard';
import DataTable, { Column } from '../components/DataTable';
import { ACCOUNT_FIELDS } from '../config/entityFields';
import { useConfirmDelete } from '../context/ThemeContext';
import { useErp } from '../context/ErpContext';
import { formatPkr } from '../utils/currency';
import {
  AccountApi,
  AccountingSummary,
  createAccount,
  createCustomerInvoice,
  createCustomerInvoiceFromJob,
  createVendorBill,
  createVendorBillFromPo,
  CustomerInvoiceApi,
  deleteAccount,
  deleteCustomerInvoice,
  deleteVendorBill,
  fetchAccountLedger,
  fetchAccountingSummary,
  fetchAccounts,
  fetchCustomerInvoices,
  fetchJobCosting,
  fetchVendorBills,
  JobCostingApi,
  LedgerLineApi,
  updateAccount,
  VendorBillApi,
} from '../api/accounting';
type Tab = 'coa' | 'payables' | 'receivables' | 'job-costing';

const today = () => new Date().toISOString().slice(0, 10);

export default function AccountsScreen({ searchQuery }: { searchQuery: string }) {
  const { purchaseOrders, jobOrders } = useErp();
  const confirmDelete = useConfirmDelete();
  const [tab, setTab] = useState<Tab>('coa');
  const [accounts, setAccounts] = useState<AccountApi[]>([]);
  const [bills, setBills] = useState<VendorBillApi[]>([]);
  const [invoices, setInvoices] = useState<CustomerInvoiceApi[]>([]);
  const [jobCosts, setJobCosts] = useState<JobCostingApi[]>([]);
  const [summary, setSummary] = useState<AccountingSummary | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [accountModal, setAccountModal] = useState(false);
  const [editAccount, setEditAccount] = useState<AccountApi | null>(null);
  const [billModal, setBillModal] = useState(false);
  const [invoiceModal, setInvoiceModal] = useState(false);
  const [page, setPage] = useState(1);
  const [ledgerAccount, setLedgerAccount] = useState<AccountApi | null>(null);
  const [ledger, setLedger] = useState<LedgerLineApi[]>([]);
  const [ledgerLoading, setLedgerLoading] = useState(false);
  const [ledgerError, setLedgerError] = useState<string | null>(null);
  const [ledgerFrom, setLedgerFrom] = useState('');
  const [ledgerTo, setLedgerTo] = useState('');

  const loadLedger = useCallback(
    async (account: AccountApi, from?: string, to?: string) => {
      setLedgerLoading(true);
      setLedgerError(null);
      try {
        setLedger(
          await fetchAccountLedger(account.id, {
            from: from || undefined,
            to: to || undefined,
          })
        );
      } catch (err) {
        setLedger([]);
        setLedgerError(err instanceof Error ? err.message : 'Failed to load ledger');
      } finally {
        setLedgerLoading(false);
      }
    },
    []
  );

  const openLedger = useCallback(
    async (account: AccountApi) => {
      setLedgerAccount(account);
      setLedgerFrom('');
      setLedgerTo('');
      await loadLedger(account);
    },
    [loadLedger]
  );

  const applyLedgerRange = useCallback(() => {
    if (!ledgerAccount) return;
    void loadLedger(ledgerAccount, ledgerFrom, ledgerTo);
  }, [ledgerAccount, ledgerFrom, ledgerTo, loadLedger]);

  const clearLedgerRange = useCallback(() => {
    if (!ledgerAccount) return;
    setLedgerFrom('');
    setLedgerTo('');
    void loadLedger(ledgerAccount);
  }, [ledgerAccount, loadLedger]);

  const refresh = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const [a, s, b, i, j] = await Promise.all([
        fetchAccounts(),
        fetchAccountingSummary(),
        fetchVendorBills(),
        fetchCustomerInvoices(),
        fetchJobCosting(),
      ]);
      setAccounts(a);
      setSummary(s);
      setBills(b);
      setInvoices(i);
      setJobCosts(j);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load accounting');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  useEffect(() => {
    setPage(1);
  }, [tab, searchQuery]);

  const q = searchQuery.trim().toLowerCase();

  const filteredAccounts = useMemo(
    () =>
      accounts.filter(
        (a) =>
          !q ||
          a.code.toLowerCase().includes(q) ||
          a.name.toLowerCase().includes(q)
      ),
    [accounts, q]
  );

  const filteredBills = useMemo(
    () =>
      bills.filter(
        (b) =>
          !q ||
          b.bill_number.toLowerCase().includes(q) ||
          b.vendor_name.toLowerCase().includes(q)
      ),
    [bills, q]
  );

  const filteredInvoices = useMemo(
    () =>
      invoices.filter(
        (i) =>
          !q ||
          i.invoice_number.toLowerCase().includes(q) ||
          i.customer_name.toLowerCase().includes(q)
      ),
    [invoices, q]
  );

  const filteredJobs = useMemo(
    () =>
      jobCosts.filter(
        (j) =>
          !q ||
          j.job_number.toLowerCase().includes(q) ||
          j.customer_name.toLowerCase().includes(q)
      ),
    [jobCosts, q]
  );

  const coaColumns: Column<AccountApi>[] = [
    { key: 'code', header: 'Code', render: (r) => <span className="font-mono text-xs">{r.code}</span> },
    { key: 'name', header: 'Account Name', render: (r) => <span className="erp-strong">{r.name}</span> },
    {
      key: 'is_system',
      header: 'System',
      render: (r) => (r.is_system ? 'Yes' : '—'),
    },
    { key: 'balance', header: 'Balance', highlight: true, render: (r) => formatPkr(r.balance) },
  ];

  const billColumns: Column<VendorBillApi>[] = [
    { key: 'bill_number', header: 'Bill #', render: (r) => <span className="erp-strong">{r.bill_number}</span> },
    { key: 'vendor_name', header: 'Vendor', render: (r) => r.vendor_name },
    { key: 'bill_date', header: 'Date', render: (r) => r.bill_date },
    { key: 'amount', header: 'Amount', render: (r) => formatPkr(r.amount) },
    { key: 'paid_amount', header: 'Paid', render: (r) => formatPkr(r.paid_amount) },
    { key: 'balance', header: 'Balance', highlight: true, render: (r) => formatPkr(r.balance) },
  ];

  const invoiceColumns: Column<CustomerInvoiceApi>[] = [
    { key: 'invoice_number', header: 'Invoice #', render: (r) => <span className="erp-strong">{r.invoice_number}</span> },
    { key: 'customer_name', header: 'Customer', render: (r) => r.customer_name },
    { key: 'invoice_date', header: 'Date', render: (r) => r.invoice_date },
    { key: 'amount', header: 'Amount', render: (r) => formatPkr(r.amount) },
    { key: 'paid_amount', header: 'Received', render: (r) => formatPkr(r.paid_amount) },
    { key: 'balance', header: 'Balance', highlight: true, render: (r) => formatPkr(r.balance) },
  ];

  const jobColumns: Column<JobCostingApi>[] = [
    { key: 'job_number', header: 'Job No', render: (r) => <span className="erp-strong">{r.job_number}</span> },
    { key: 'customer_name', header: 'Customer', render: (r) => r.customer_name },
    { key: 'revenue', header: 'Revenue', render: (r) => formatPkr(r.revenue) },
    { key: 'costs', header: 'PO / Bills', render: (r) => formatPkr(r.costs) },
    { key: 'expenses', header: 'Expenses', render: (r) => formatPkr(r.expenses) },
    { key: 'total_cost', header: 'Total Cost', render: (r) => formatPkr(r.total_cost) },
    { key: 'margin', header: 'Margin', highlight: true, render: (r) => formatPkr(r.margin) },
    {
      key: 'margin_percent',
      header: 'Margin %',
      render: (r) => `${r.margin_percent.toFixed(1)}%`,
    },
  ];

  const tabs: { id: Tab; label: string }[] = [
    { id: 'coa', label: 'Chart of Accounts' },
    { id: 'payables', label: 'Payables (AP)' },
    { id: 'receivables', label: 'Receivables (AR)' },
    { id: 'job-costing', label: 'Job Costing' },
  ];

  const addLabel =
    tab === 'coa'
      ? '+ Add Account'
      : tab === 'payables'
        ? '+ Vendor Bill'
        : tab === 'receivables'
          ? '+ Customer Invoice'
          : undefined;

  return (
    <>
      <ScreenFrame
        title="Accounts & Finance"
        subtitle="AP, AR, expenses posting & job costing — no inventory valuation"
        toolbar={
          <PageToolbar
            onAdd={
              addLabel
                ? () => {
                    if (tab === 'coa') {
                      setEditAccount(null);
                      setAccountModal(true);
                    }
                    if (tab === 'payables') setBillModal(true);
                    if (tab === 'receivables') setInvoiceModal(true);
                  }
                : undefined
            }
            addLabel={addLabel}
          />
        }
        formPanel={
          <>
            {error && (
              <div className="mb-2 flex items-center justify-between gap-2 text-xs text-red-600">
                <span>{error}</span>
                <button type="button" className="erp-btn-ghost" onClick={() => void refresh()}>
                  Retry
                </button>
              </div>
            )}
            {summary && (
              <div className="mb-2 grid grid-cols-1 gap-2 sm:grid-cols-2 xl:grid-cols-4">
                <StatCard label="Cash Balance" value={formatPkr(summary.cash_balance)} />
                <StatCard label="Bank Balance" value={formatPkr(summary.bank_balance)} />
                <StatCard label="Receivables (AR)" value={formatPkr(summary.receivables)} />
                <StatCard label="Payables (AP)" value={formatPkr(summary.payables)} />
              </div>
            )}
            {summary && (
              <div className="mb-3 grid grid-cols-1 gap-3 lg:grid-cols-3">
                <div className="border border-[var(--color-erp-border)] bg-[var(--color-erp-input-bg)] p-3 lg:col-span-2">
                  <p className="erp-titlebar mb-2 px-2 py-1 text-xs">Profit &amp; Loss</p>
                  <table className="erp-classic-table">
                    <tbody>
                      {[
                        { label: 'Revenue', value: summary.revenue },
                        { label: 'Expenses / Direct costs', value: -summary.expenses },
                        { label: 'Net Profit', value: summary.net_profit, bold: true },
                      ].map((row) => (
                        <tr key={row.label}>
                          <td className={row.bold ? 'erp-strong' : ''}>{row.label}</td>
                          <td
                            className={`text-right erp-cell-highlight ${row.bold ? 'erp-strong' : ''}`}
                          >
                            {formatPkr(Math.abs(row.value))}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
            <div className="mb-2 flex flex-wrap gap-1 border-b border-[var(--color-erp-border)] pb-1">
              {tabs.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  className={`px-2 py-1 text-xs ${
                    tab === t.id ? 'erp-nav-active' : 'erp-btn-ghost border-transparent bg-transparent'
                  }`}
                  onClick={() => setTab(t.id)}
                >
                  {t.label}
                </button>
              ))}
            </div>
            {loading && <p className="erp-muted px-2 py-4 text-xs">Loading…</p>}
          </>
        }
      >
        {!loading && tab === 'coa' && (
          <>
            {ledgerAccount ? (
              <div className="border-t border-[var(--color-erp-border)]">
                <div className="flex flex-wrap items-center justify-between gap-2 px-3 py-2">
                  <div>
                    <p className="erp-strong text-sm">
                      Ledger — {ledgerAccount.code} {ledgerAccount.name}
                    </p>
                    <p className="erp-muted text-xs">Balance {formatPkr(ledgerAccount.balance)}</p>
                  </div>
                  <button
                    type="button"
                    className="erp-btn-ghost flex items-center gap-1 text-xs"
                    onClick={() => {
                      setLedgerAccount(null);
                      setLedger([]);
                      setLedgerError(null);
                      setLedgerFrom('');
                      setLedgerTo('');
                    }}
                  >
                    <ArrowLeft size={14} />
                    Back to accounts
                  </button>
                </div>
                <div className="flex flex-wrap items-end gap-2 border-b border-[var(--color-erp-border)] px-3 pb-3">
                  <div className="erp-field-row mb-0">
                    <label className="erp-field-label">From</label>
                    <input
                      type="date"
                      value={ledgerFrom}
                      onChange={(e) => setLedgerFrom(e.target.value)}
                      className="erp-input w-auto"
                    />
                  </div>
                  <div className="erp-field-row mb-0">
                    <label className="erp-field-label">To</label>
                    <input
                      type="date"
                      value={ledgerTo}
                      onChange={(e) => setLedgerTo(e.target.value)}
                      className="erp-input w-auto"
                    />
                  </div>
                  <button type="button" className="erp-btn-primary text-xs" onClick={applyLedgerRange}>
                    Apply
                  </button>
                  <button type="button" className="erp-btn-ghost text-xs" onClick={clearLedgerRange}>
                    Clear
                  </button>
                </div>
                {ledgerLoading && <p className="erp-muted px-3 py-4 text-sm">Loading ledger…</p>}
                {ledgerError && <p className="px-3 py-4 text-sm text-red-600">{ledgerError}</p>}
                {!ledgerLoading && !ledgerError && (
                  <div className="overflow-x-auto px-1 pb-2">
                    <table className="erp-classic-table min-w-[520px]">
                      <thead>
                        <tr>
                          <th>Date</th>
                          <th>Description</th>
                          <th>Debit</th>
                          <th>Credit</th>
                          <th>Balance</th>
                        </tr>
                      </thead>
                      <tbody>
                        {ledger.length === 0 ? (
                          <tr>
                            <td colSpan={5} className="erp-muted py-6 text-center">
                              No ledger entries
                              {ledgerFrom || ledgerTo ? ' for this period' : ' for this account'}.
                            </td>
                          </tr>
                        ) : (
                          ledger.map((row, i) => (
                            <tr key={`${row.entry_number}-${i}`}>
                              <td>{String(row.date).slice(0, 10)}</td>
                              <td className="text-xs">{row.description || row.memo || '—'}</td>
                              <td>{row.debit ? formatPkr(row.debit) : '—'}</td>
                              <td>{row.credit ? formatPkr(row.credit) : '—'}</td>
                              <td className="erp-strong">{formatPkr(row.balance)}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            ) : (
              <DataTable
                columns={coaColumns}
                data={filteredAccounts}
                page={page}
                pageSize={10}
                onPageChange={setPage}
                onRowClick={(row) => void openLedger(row)}
                onEdit={(row) => {
                  setEditAccount(row);
                  setAccountModal(true);
                }}
                onDelete={(row) => {
                  confirmDelete(row.name, 'Account', () => {
                    void deleteAccount(row.id)
                      .then(() => refresh())
                      .catch((err) =>
                        window.alert(
                          err instanceof Error
                            ? err.message
                            : 'Cannot delete — account may have transactions'
                        )
                      );
                  });
                }}
                keyExtractor={(row) => String(row.id)}
              />
            )}
          </>
        )}

        {!loading && tab === 'payables' && (
          <>
            <div className="mb-2 flex flex-wrap gap-2 px-1">
              <span className="erp-muted text-xs self-center">Create bill from PO:</span>
              {purchaseOrders.slice(0, 8).map((po) => (
                <button
                  key={po.id}
                  type="button"
                  className="erp-btn-ghost flex items-center gap-1 text-xs"
                  title={`Bill ${po.po_number}`}
                  onClick={() => {
                    void createVendorBillFromPo(po.id)
                      .then(() => refresh())
                      .catch((err) =>
                        window.alert(err instanceof Error ? err.message : 'Failed to create bill')
                      );
                  }}
                >
                  <FileText size={12} />
                  {po.po_number}
                </button>
              ))}
            </div>
            <DataTable
              columns={billColumns}
              data={filteredBills}
              page={page}
              pageSize={8}
              onPageChange={setPage}
              onDelete={(row) => {
                confirmDelete(row.bill_number, 'Vendor Bill', () => {
                  void deleteVendorBill(row.id)
                    .then(() => refresh())
                    .catch((err) =>
                      window.alert(err instanceof Error ? err.message : 'Delete failed')
                    );
                });
              }}
              keyExtractor={(row) => String(row.id)}
            />
          </>
        )}

        {!loading && tab === 'receivables' && (
          <>
            <div className="mb-2 flex flex-wrap gap-2 px-1">
              <span className="erp-muted text-xs self-center">Create invoice from Job:</span>
              {jobOrders.slice(0, 8).map((job) => (
                <button
                  key={job.id}
                  type="button"
                  className="erp-btn-ghost flex items-center gap-1 text-xs"
                  title={`Invoice ${job.job_number}`}
                  onClick={() => {
                    void createCustomerInvoiceFromJob(job.id)
                      .then(() => refresh())
                      .catch((err) =>
                        window.alert(err instanceof Error ? err.message : 'Failed to create invoice')
                      );
                  }}
                >
                  <Plus size={12} />
                  {job.job_number}
                </button>
              ))}
            </div>
            <DataTable
              columns={invoiceColumns}
              data={filteredInvoices}
              page={page}
              pageSize={8}
              onPageChange={setPage}
              onDelete={(row) => {
                confirmDelete(row.invoice_number, 'Customer Invoice', () => {
                  void deleteCustomerInvoice(row.id)
                    .then(() => refresh())
                    .catch((err) =>
                      window.alert(err instanceof Error ? err.message : 'Delete failed')
                    );
                });
              }}
              keyExtractor={(row) => String(row.id)}
            />
          </>
        )}

        {!loading && tab === 'job-costing' && (
          <DataTable
            columns={jobColumns}
            data={filteredJobs}
            page={page}
            pageSize={8}
            onPageChange={setPage}
            showActions={false}
            keyExtractor={(row) => String(row.job_order_id)}
          />
        )}
      </ScreenFrame>

      <RecordModal
        isOpen={accountModal}
        mode={editAccount ? 'edit' : 'add'}
        title="Account"
        fields={ACCOUNT_FIELDS}
        record={
          editAccount
            ? {
                code: editAccount.code,
                name: editAccount.name,
                is_system: editAccount.is_system,
              }
            : { is_system: false }
        }
        onClose={() => {
          setAccountModal(false);
          setEditAccount(null);
        }}
        onSave={(data) => {
          const payload = {
            code: String(data.code ?? ''),
            name: String(data.name ?? ''),
            is_system: Boolean(data.is_system),
          };
          const request = editAccount
            ? updateAccount(editAccount.id, payload)
            : createAccount(payload);
          void request
            .then(() => {
              setAccountModal(false);
              setEditAccount(null);
              return refresh();
            })
            .catch((err) => window.alert(err instanceof Error ? err.message : 'Failed'));
        }}
      />

      <RecordModal
        isOpen={billModal}
        mode="add"
        title="Vendor Bill"
        fields={[
          { key: 'bill_number', label: 'Bill Number', type: 'text', required: true },
          { key: 'vendor_id', label: 'Vendor ID (from Vendors screen)', type: 'number', required: true },
          { key: 'bill_date', label: 'Bill Date', type: 'date', required: true },
          { key: 'amount', label: 'Amount', type: 'number', required: true },
          { key: 'purchase_order_id', label: 'Purchase Order ID (optional)', type: 'number' },
          { key: 'job_order_id', label: 'Job Order ID (optional, for costing)', type: 'number' },
          { key: 'description', label: 'Description', type: 'text' },
        ]}
        record={{ bill_date: today(), amount: 0, vendor_id: 0, purchase_order_id: 0, job_order_id: 0 }}
        onClose={() => setBillModal(false)}
        onSave={(data) => {
          const vendorId = Number(data.vendor_id) || null;
          if (!vendorId) {
            window.alert('Vendor ID is required (creates/uses payable sub-account)');
            return;
          }
          void createVendorBill({
            bill_number: String(data.bill_number ?? ''),
            vendor_id: vendorId,
            bill_date: String(data.bill_date ?? today()),
            amount: Number(data.amount) || 0,
            purchase_order_id: Number(data.purchase_order_id) || null,
            job_order_id: Number(data.job_order_id) || null,
            description: String(data.description ?? ''),
          })
            .then(() => {
              setBillModal(false);
              return refresh();
            })
            .catch((err) => window.alert(err instanceof Error ? err.message : 'Failed'));
        }}
      />

      <RecordModal
        isOpen={invoiceModal}
        mode="add"
        title="Customer Invoice"
        fields={[
          { key: 'invoice_number', label: 'Invoice Number', type: 'text', required: true },
          { key: 'customer_id', label: 'Customer ID (from Customers screen)', type: 'number', required: true },
          { key: 'invoice_date', label: 'Invoice Date', type: 'date', required: true },
          { key: 'amount', label: 'Amount', type: 'number', required: true },
          { key: 'job_order_id', label: 'Job Order ID (optional)', type: 'number' },
          { key: 'purchase_order_id', label: 'Purchase Order ID (optional)', type: 'number' },
          { key: 'description', label: 'Description', type: 'text' },
        ]}
        record={{ invoice_date: today(), amount: 0, customer_id: 0, job_order_id: 0, purchase_order_id: 0 }}
        onClose={() => setInvoiceModal(false)}
        onSave={(data) => {
          const customerId = Number(data.customer_id) || null;
          if (!customerId) {
            window.alert('Customer ID is required (creates/uses receivable sub-account)');
            return;
          }
          void createCustomerInvoice({
            invoice_number: String(data.invoice_number ?? ''),
            customer_id: customerId,
            invoice_date: String(data.invoice_date ?? today()),
            amount: Number(data.amount) || 0,
            job_order_id: Number(data.job_order_id) || null,
            purchase_order_id: Number(data.purchase_order_id) || null,
            description: String(data.description ?? ''),
          })
            .then(() => {
              setInvoiceModal(false);
              return refresh();
            })
            .catch((err) => window.alert(err instanceof Error ? err.message : 'Failed'));
        }}
      />
    </>
  );
}
