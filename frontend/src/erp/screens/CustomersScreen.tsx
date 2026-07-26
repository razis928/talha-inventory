import customersData from '../../data/json/customers.json';
import { CUSTOMER_FIELDS, CUSTOMER_FILTERS } from '../config/entityFields';
import { useErp } from '../context/ErpContext';
import { Column } from '../components/DataTable';
import GenericListScreen from './GenericListScreen';
import { CustomerApi } from '../api/customers';
import { toCustomerInput } from '../utils/partyInput';

interface CustomersScreenProps {
  searchQuery: string;
  onOpenDetail: (customer: CustomerApi) => void;
}

const columns = (
  onOpenDetail: (id: string) => void
): Column<Record<string, unknown>>[] => [
  {
    key: 'name',
    header: 'Customer',
    render: (r) => (
      <button
        type="button"
        className="erp-strong text-left underline-offset-2 hover:underline"
        onClick={(e) => {
          e.stopPropagation();
          onOpenDetail(String(r.id));
        }}
      >
        {String(r.name)}
      </button>
    ),
  },
  { key: 'phone', header: 'Phone', render: (r) => String(r.phone || '—') },
  { key: 'email', header: 'Email', render: (r) => String(r.email || '—') },
  { key: 'city', header: 'City', render: (r) => String(r.city || '—') },
  { key: 'address', header: 'Address', render: (r) => String(r.address || '—') },
];

function toRow(customer: CustomerApi): Record<string, unknown> & { id: string } {
  return {
    ...customer,
    id: String(customer.id),
  };
}

export default function CustomersScreen({ searchQuery, onOpenDetail }: CustomersScreenProps) {
  const {
    customers,
    customerLoading,
    customerError,
    refreshCustomers,
    addCustomer,
    updateCustomerById,
    deleteCustomer,
  } = useErp();

  const rows = customers.map(toRow);

  return (
    <>
      {customerError && (
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-red-600">
          <span>{customerError}</span>
          <button type="button" className="erp-btn-ghost" onClick={() => void refreshCustomers()}>
            Retry
          </button>
        </div>
      )}
      <GenericListScreen
        title={customersData.title}
        subtitle={customersData.subtitle}
        entityName="Customer"
        columns={columns((id) => {
          const customer = customers.find((c) => String(c.id) === id);
          if (customer) onOpenDetail(customer);
        })}
        data={customerLoading && rows.length === 0 ? [] : rows}
        searchQuery={searchQuery}
        fields={CUSTOMER_FIELDS}
        filters={CUSTOMER_FILTERS}
        addLabel="+ Add Customer"
        onAdd={async (data) => {
          try {
            await addCustomer(toCustomerInput(data));
          } catch (err) {
            window.alert(err instanceof Error ? err.message : 'Failed to add customer');
            throw err;
          }
        }}
        onEdit={async (id, data) => {
          try {
            await updateCustomerById(Number(id), toCustomerInput(data));
          } catch (err) {
            window.alert(err instanceof Error ? err.message : 'Failed to update customer');
            throw err;
          }
        }}
        onDelete={async (id) => {
          try {
            await deleteCustomer(Number(id));
          } catch (err) {
            window.alert(err instanceof Error ? err.message : 'Failed to delete customer');
            throw err;
          }
        }}
      />
    </>
  );
}
