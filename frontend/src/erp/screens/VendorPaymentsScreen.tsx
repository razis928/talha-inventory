import { useCallback, useEffect, useMemo, useState } from 'react';
import { Column } from '../components/DataTable';
import GenericListScreen from './GenericListScreen';
import { formatPkr } from '../utils/currency';
import {
  createPayment,
  deletePayment,
  fetchPayments,
  fetchVendorBills,
  PaymentApi,
  VendorBillApi,
} from '../api/accounting';
import { FieldDef } from '../config/entityFields';

const today = () => new Date().toISOString().slice(0, 10);

const columns: Column<Record<string, unknown>>[] = [
  {
    key: 'reference',
    header: 'Reference',
    render: (r) => <span className="erp-strong">{String(r.reference)}</span>,
  },
  { key: 'party_name', header: 'Vendor', render: (r) => String(r.party_name) },
  { key: 'amount', header: 'Amount', render: (r) => formatPkr(Number(r.amount)) },
  { key: 'method', header: 'Method', render: (r) => String(r.method) },
  { key: 'payment_date', header: 'Date', render: (r) => String(r.payment_date) },
  {
    key: 'vendor_bill_id',
    header: 'Bill',
    render: (r) => (r.vendor_bill_id != null ? String(r.vendor_bill_id) : '—'),
  },
];

function billOption(b: VendorBillApi): string {
  return `${b.id} — ${b.bill_number} · ${b.vendor_name} (bal ${formatPkr(b.balance)})`;
}

function parseBillId(option: string): number | null {
  const id = Number(String(option).split('—')[0]?.trim());
  return Number.isFinite(id) && id > 0 ? id : null;
}

function toRow(p: PaymentApi): Record<string, unknown> & { id: string } {
  return { ...p, id: String(p.id) };
}

export default function VendorPaymentsScreen({ searchQuery }: { searchQuery: string }) {
  const [payments, setPayments] = useState<PaymentApi[]>([]);
  const [bills, setBills] = useState<VendorBillApi[]>([]);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    try {
      const [p, b] = await Promise.all([
        fetchPayments(undefined, 'Payment'),
        fetchVendorBills(),
      ]);
      setPayments(p);
      setBills(b);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load vendor payments');
      setPayments([]);
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const openBills = useMemo(() => bills.filter((b) => b.balance > 0), [bills]);
  const billOptions = useMemo(() => openBills.map(billOption), [openBills]);

  const fields: FieldDef[] = useMemo(
    () => [
      { key: 'reference', label: 'Reference', type: 'text', required: true },
      {
        key: 'vendor_bill',
        label: 'Vendor Bill (open balance)',
        type: 'select',
        options: billOptions.length ? billOptions : ['No open bills'],
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
    [billOptions]
  );

  const rows = useMemo(() => payments.map(toRow), [payments]);
  const openTotal = openBills.reduce((sum, b) => sum + b.balance, 0);

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
        title="Vendor Payments"
        subtitle="Pay vendor bills — Dr Vendor payable / Cr Cash or Bank"
        entityName="Vendor Payment"
        stats={[
          { label: 'Payments', value: payments.length },
          { label: 'Open AP', value: formatPkr(openTotal) },
        ]}
        columns={columns}
        data={rows}
        searchQuery={searchQuery}
        fields={fields}
        filters={[
          { key: 'reference', label: 'Reference', type: 'text', placeholder: 'e.g. PAY-...' },
          { key: 'party_name', label: 'Vendor', type: 'text', placeholder: 'Search vendor...' },
        ]}
        addLabel="+ Pay Vendor"
        onAdd={async (data) => {
          try {
            const billId = parseBillId(String(data.vendor_bill ?? ''));
            if (!billId) throw new Error('Select a vendor bill with an open balance');
            const bill = bills.find((b) => b.id === billId);
            await createPayment({
              reference: String(data.reference ?? `VPAY-${Date.now().toString().slice(-6)}`),
              payment_type: 'Payment',
              party_name: bill?.vendor_name ?? '',
              amount: Number(data.amount) || 0,
              method: String(data.method ?? 'Cash'),
              payment_date: String(data.payment_date ?? today()),
              vendor_bill_id: billId,
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
