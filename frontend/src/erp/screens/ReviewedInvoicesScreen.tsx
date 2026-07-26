import { REVIEWED_INVOICE_FIELDS, REVIEWED_INVOICE_FILTERS } from '../config/entityFields';
import { useErp } from '../context/ErpContext';
import { Column } from '../components/DataTable';
import GenericListScreen from './GenericListScreen';
import { formatPkr } from '../utils/currency';

const columns: Column<Record<string, unknown>>[] = [
  { key: 'invoiceNumber', header: 'Invoice #', render: (r) => <span className="erp-strong">{String(r.invoiceNumber)}</span> },
  { key: 'party', header: 'Party', render: (r) => String(r.party) },
  { key: 'amount', header: 'Amount', render: (r) => formatPkr(Number(r.amount)) },
  { key: 'reviewedBy', header: 'Reviewed By', render: (r) => String(r.reviewedBy) },
  { key: 'reviewDate', header: 'Review Date', render: (r) => String(r.reviewDate) },
  { key: 'status', header: 'Status', render: (r) => <span className="rounded-md bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">{String(r.status)}</span> },
];

export default function ReviewedInvoicesScreen({ searchQuery }: { searchQuery: string }) {
  const { reviewedInvoices, reviewedInvoiceCrud } = useErp();
  return (
    <GenericListScreen
      title="Reviewed Invoices"
      subtitle="Invoices approved by management"
      entityName="Reviewed Invoice"
      columns={columns}
      data={reviewedInvoices}
      searchQuery={searchQuery}
      fields={REVIEWED_INVOICE_FIELDS}
      filters={REVIEWED_INVOICE_FILTERS}
      addLabel="+ Add Review"
      onAdd={reviewedInvoiceCrud.add}
      onEdit={reviewedInvoiceCrud.update}
      onDelete={reviewedInvoiceCrud.remove}
      deleteConfirmField="invoiceNumber"
    />
  );
}
