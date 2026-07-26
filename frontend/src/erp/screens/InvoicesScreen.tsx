import invoicesData from '../../data/json/invoices.json';
import { INVOICE_FIELDS, INVOICE_FILTERS } from '../config/entityFields';
import { useErp } from '../context/ErpContext';
import { Column } from '../components/DataTable';
import GenericListScreen from './GenericListScreen';
import { formatPkr } from '../utils/currency';

const columns: Column<Record<string, unknown>>[] = [
  { key: 'invoiceNumber', header: 'Invoice #', render: (r) => <span className="erp-strong">{String(r.invoiceNumber)}</span> },
  { key: 'party', header: 'Party', render: (r) => String(r.party) },
  { key: 'type', header: 'Type', render: (r) => String(r.type) },
  { key: 'amount', header: 'Amount', render: (r) => formatPkr(Number(r.amount)) },
  { key: 'date', header: 'Date', render: (r) => String(r.date) },
  { key: 'status', header: 'Status', render: (r) => (
    <span className={`rounded-md px-2 py-0.5 text-xs font-medium ${r.status === 'Paid' ? 'bg-emerald-50 text-emerald-700' : 'bg-amber-50 text-amber-700'}`}>{String(r.status)}</span>
  )},
];

export default function InvoicesScreen({ searchQuery }: { searchQuery: string }) {
  const { invoices, invoiceCrud } = useErp();
  return (
    <GenericListScreen
      title={invoicesData.title}
      subtitle={invoicesData.subtitle}
      entityName="Invoice"
      columns={columns}
      data={invoices}
      searchQuery={searchQuery}
      fields={INVOICE_FIELDS}
      filters={INVOICE_FILTERS}
      addLabel="+ New Invoice"
      onAdd={invoiceCrud.add}
      onEdit={invoiceCrud.update}
      onDelete={invoiceCrud.remove}
      deleteConfirmField="invoiceNumber"
      pdfFilename="invoices"
    />
  );
}
