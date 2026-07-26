import { useCallback, useEffect, useMemo, useState } from 'react';
import paymentsData from '../../data/json/payments.json';
import { Column } from '../components/DataTable';
import GenericListScreen from './GenericListScreen';
import { formatPkr } from '../utils/currency';
import {
  createPayment,
  deletePayment,
  fetchCustomerInvoices,
  fetchPayments,
  fetchVendorBills,
  PaymentApi,
  CustomerInvoiceApi,
  VendorBillApi,
} from '../api/accounting';
import { FieldDef } from '../config/entityFields';

const today = () => new Date().toISOString().slice(0, 10);

const PAYMENT_API_FIELDS: FieldDef[] = [
  { key: 'reference', label: 'Reference', type: 'text', required: true },
  { key: 'payment_type', label: 'Type', type: 'select', options: ['Payment', 'Receipt'], required: true },
  { key: 'party_name', label: 'Party Name', type: 'text', required: true },
  { key: 'amount', label: 'Amount', type: 'number', required: true },
  {
    key: 'method',
    label: 'Method',
    type: 'select',
    options: ['Cash', 'Bank Transfer', 'Cheque', 'Card'],
    required: true,
  },
  { key: 'payment_date', label: 'Date', type: 'date', required: true },
  { key: 'vendor_bill_id', label: 'Vendor Bill ID (for Payment)', type: 'number' },
  { key: 'customer_invoice_id', label: 'Customer Invoice ID (for Receipt)', type: 'number' },
  { key: 'notes', label: 'Notes', type: 'text' },
];

const PAYMENT_FILTERS = [
  { key: 'reference', label: 'Reference', type: 'text' as const, placeholder: 'e.g. PAY-...' },
  { key: 'party_name', label: 'Party Name', type: 'text' as const, placeholder: 'Search party...' },
  {
    key: 'payment_type',
    label: 'Type',
    type: 'select' as const,
    options: ['All', 'Payment', 'Receipt'],
  },
];

const columns: Column<Record<string, unknown>>[] = [
  {
    key: 'reference',
    header: 'Reference',
    render: (r) => <span className="erp-strong">{String(r.reference)}</span>,
  },
  { key: 'party_name', header: 'Party', render: (r) => String(r.party_name) },
  { key: 'payment_type', header: 'Type', render: (r) => String(r.payment_type) },
  { key: 'amount', header: 'Amount', render: (r) => formatPkr(Number(r.amount)) },
  { key: 'method', header: 'Method', render: (r) => String(r.method) },
  { key: 'payment_date', header: 'Date', render: (r) => String(r.payment_date) },
];

function toRow(p: PaymentApi): Record<string, unknown> & { id: string } {
  return { ...p, id: String(p.id) };
}

export default function PaymentsScreen({ searchQuery }: { searchQuery: string }) {
  const [payments, setPayments] = useState<PaymentApi[]>([]);
  const [bills, setBills] = useState<VendorBillApi[]>([]);
  const [invoices, setInvoices] = useState<CustomerInvoiceApi[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [p, b, i] = await Promise.all([
        fetchPayments(),
        fetchVendorBills(),
        fetchCustomerInvoices(),
      ]);
      setPayments(p);
      setBills(b);
      setInvoices(i);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load payments');
      setPayments([]);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const rows = useMemo(() => payments.map(toRow), [payments]);

  const hint = [
    bills.filter((b) => b.balance > 0).slice(0, 3).map((b) => `Bill ${b.id}=${b.bill_number} (${b.balance})`).join(', '),
    invoices
      .filter((i) => i.balance > 0)
      .slice(0, 3)
      .map((i) => `Inv ${i.id}=${i.invoice_number} (${i.balance})`)
      .join(', '),
  ]
    .filter(Boolean)
    .join(' · ');

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
      {hint && <p className="mb-1 px-1 text-[10px] erp-muted">Open balances: {hint}</p>}
      <GenericListScreen
        title={paymentsData.title}
        subtitle="Payment clears AP · Receipt clears AR (posts debit/credit)"
        entityName="Payment"
        columns={columns}
        data={rows}
        searchQuery={searchQuery}
        fields={PAYMENT_API_FIELDS}
        filters={PAYMENT_FILTERS}
        addLabel="+ Record Payment"
        onAdd={async (data) => {
          try {
            const type = String(data.payment_type ?? 'Payment') as 'Payment' | 'Receipt';
            await createPayment({
              reference: String(data.reference ?? `PAY-${Date.now().toString().slice(-6)}`),
              payment_type: type,
              party_name: String(data.party_name ?? ''),
              amount: Number(data.amount) || 0,
              method: String(data.method ?? 'Cash'),
              payment_date: String(data.payment_date ?? today()),
              vendor_bill_id: type === 'Payment' ? Number(data.vendor_bill_id) || null : null,
              customer_invoice_id:
                type === 'Receipt' ? Number(data.customer_invoice_id) || null : null,
              notes: String(data.notes ?? ''),
            });
            await refresh();
          } catch (err) {
            window.alert(err instanceof Error ? err.message : 'Failed to record payment');
            throw err;
          }
        }}
        onEdit={async () => {
          window.alert('Edit not supported — delete and re-create the payment.');
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
