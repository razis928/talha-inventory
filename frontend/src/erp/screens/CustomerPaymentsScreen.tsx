import { useCallback, useEffect, useMemo, useState } from 'react';
import { Column } from '../components/DataTable';
import GenericListScreen from './GenericListScreen';
import { formatPkr } from '../utils/currency';
import {
  createPayment,
  CustomerInvoiceApi,
  deletePayment,
  fetchCustomerInvoices,
  fetchPayments,
  PaymentApi,
} from '../api/accounting';
import { FieldDef } from '../config/entityFields';

const today = () => new Date().toISOString().slice(0, 10);

const columns: Column<Record<string, unknown>>[] = [
  {
    key: 'reference',
    header: 'Reference',
    render: (r) => <span className="erp-strong">{String(r.reference)}</span>,
  },
  { key: 'party_name', header: 'Customer', render: (r) => String(r.party_name) },
  { key: 'amount', header: 'Amount', render: (r) => formatPkr(Number(r.amount)) },
  { key: 'method', header: 'Method', render: (r) => String(r.method) },
  { key: 'payment_date', header: 'Date', render: (r) => String(r.payment_date) },
  {
    key: 'customer_invoice_id',
    header: 'Invoice',
    render: (r) => (r.customer_invoice_id != null ? String(r.customer_invoice_id) : '—'),
  },
];

function invoiceOption(inv: CustomerInvoiceApi): string {
  return `${inv.id} — ${inv.invoice_number} · ${inv.customer_name} (bal ${formatPkr(inv.balance)})`;
}

function parseInvoiceId(option: string): number | null {
  const id = Number(String(option).split('—')[0]?.trim());
  return Number.isFinite(id) && id > 0 ? id : null;
}

function toRow(p: PaymentApi): Record<string, unknown> & { id: string } {
  return { ...p, id: String(p.id) };
}

export default function CustomerPaymentsScreen({ searchQuery }: { searchQuery: string }) {
  const [payments, setPayments] = useState<PaymentApi[]>([]);
  const [invoices, setInvoices] = useState<CustomerInvoiceApi[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [p, i] = await Promise.all([
        fetchPayments(undefined, 'Receipt'),
        fetchCustomerInvoices(),
      ]);
      setPayments(p);
      setInvoices(i);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load customer payments');
      setPayments([]);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const openInvoices = useMemo(() => invoices.filter((inv) => inv.balance > 0), [invoices]);
  const invoiceOptions = useMemo(() => openInvoices.map(invoiceOption), [openInvoices]);

  const fields: FieldDef[] = useMemo(
    () => [
      { key: 'reference', label: 'Reference', type: 'text', required: true },
      {
        key: 'customer_invoice',
        label: 'Customer Invoice (open balance)',
        type: 'select',
        options: invoiceOptions.length ? invoiceOptions : ['No open invoices'],
        required: true,
      },
      { key: 'amount', label: 'Amount', type: 'number', required: true },
      {
        key: 'method',
        label: 'Method',
        type: 'select',
        options: ['Cash', 'Bank Transfer', 'Cheque', 'Card'],
        required: true,
      },
      { key: 'payment_date', label: 'Date', type: 'date', required: true },
      { key: 'notes', label: 'Notes', type: 'text' },
    ],
    [invoiceOptions]
  );

  const rows = useMemo(() => payments.map(toRow), [payments]);
  const openTotal = openInvoices.reduce((sum, inv) => sum + inv.balance, 0);

  return (
    <>
      {error && (
        <div className="mb-2 flex justify-between gap-2 px-1 text-xs text-red-600">
          <span>{error}</span>
          <button type="button" className="erp-btn-ghost" onClick={() => void refresh()}>
            Retry
          </button>
        </div>
      )}
      <GenericListScreen
        title="Customer Payments"
        subtitle="Receive against invoices — Dr Cash or Bank / Cr Customer receivable"
        entityName="Customer Payment"
        stats={[
          { label: 'Receipts', value: payments.length },
          { label: 'Open AR', value: formatPkr(openTotal) },
        ]}
        columns={columns}
        data={rows}
        searchQuery={searchQuery}
        fields={fields}
        filters={[
          { key: 'reference', label: 'Reference', type: 'text', placeholder: 'e.g. RCPT-...' },
          { key: 'party_name', label: 'Customer', type: 'text', placeholder: 'Search customer...' },
        ]}
        addLabel="+ Receive Payment"
        onAdd={async (data) => {
          try {
            const invoiceId = parseInvoiceId(String(data.customer_invoice ?? ''));
            if (!invoiceId) throw new Error('Select a customer invoice with an open balance');
            const invoice = invoices.find((inv) => inv.id === invoiceId);
            await createPayment({
              reference: String(data.reference ?? `RCPT-${Date.now().toString().slice(-6)}`),
              payment_type: 'Receipt',
              party_name: invoice?.customer_name ?? '',
              amount: Number(data.amount) || 0,
              method: String(data.method ?? 'Cash'),
              payment_date: String(data.payment_date ?? today()),
              customer_invoice_id: invoiceId,
              notes: String(data.notes ?? ''),
            });
            await refresh();
          } catch (err) {
            window.alert(err instanceof Error ? err.message : 'Failed to record receipt');
            throw err;
          }
        }}
        onEdit={async () => {
          window.alert('Edit not supported — delete and re-create the receipt.');
          throw new Error('edit unsupported');
        }}
        onDelete={async (id) => {
          try {
            await deletePayment(Number(id));
            await refresh();
          } catch (err) {
            window.alert(err instanceof Error ? err.message : 'Failed to delete');
            throw err;
          }
        }}
        deleteConfirmField="reference"
      />
    </>
  );
}
