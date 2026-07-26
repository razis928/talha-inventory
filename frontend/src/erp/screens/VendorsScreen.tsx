import vendorsData from '../../data/json/vendors.json';
import { VENDOR_FIELDS, VENDOR_FILTERS } from '../config/entityFields';
import { useErp } from '../context/ErpContext';
import { Column } from '../components/DataTable';
import GenericListScreen from './GenericListScreen';
import { VendorApi } from '../api/vendors';
import { toVendorInput } from '../utils/partyInput';

interface VendorsScreenProps {
  searchQuery: string;
  onOpenDetail: (vendor: VendorApi) => void;
}

const columns = (onOpenDetail: (id: string, name: string) => void): Column<Record<string, unknown>>[] => [
  {
    key: 'name',
    header: 'Vendor',
    render: (r) => (
      <button
        type="button"
        className="erp-strong text-left underline-offset-2 hover:underline"
        onClick={(e) => {
          e.stopPropagation();
          onOpenDetail(String(r.id), String(r.name));
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

function toRow(vendor: VendorApi): Record<string, unknown> & { id: string } {
  return {
    ...vendor,
    id: String(vendor.id),
  };
}

export default function VendorsScreen({ searchQuery, onOpenDetail }: VendorsScreenProps) {
  const {
    vendors,
    vendorLoading,
    vendorError,
    refreshVendors,
    addVendor,
    updateVendorById,
    deleteVendor,
  } = useErp();

  const rows = vendors.map(toRow);

  return (
    <>
      {vendorError && (
        <div className="mb-2 flex flex-wrap items-center justify-between gap-2 px-1 text-xs text-red-600">
          <span>{vendorError}</span>
          <button type="button" className="erp-btn-ghost" onClick={() => void refreshVendors()}>
            Retry
          </button>
        </div>
      )}
      <GenericListScreen
        title={vendorsData.title}
        subtitle={vendorsData.subtitle}
        entityName="Vendor"
        columns={columns((id) => {
          const vendor = vendors.find((v) => String(v.id) === id);
          if (vendor) onOpenDetail(vendor);
        })}
        data={vendorLoading && rows.length === 0 ? [] : rows}
        searchQuery={searchQuery}
        fields={VENDOR_FIELDS}
        filters={VENDOR_FILTERS}
        addLabel="+ Add Vendor"
        onAdd={async (data) => {
          try {
            await addVendor(toVendorInput(data));
          } catch (err) {
            window.alert(err instanceof Error ? err.message : 'Failed to add vendor');
            throw err;
          }
        }}
        onEdit={async (id, data) => {
          try {
            await updateVendorById(Number(id), toVendorInput(data));
          } catch (err) {
            window.alert(err instanceof Error ? err.message : 'Failed to update vendor');
            throw err;
          }
        }}
        onDelete={async (id) => {
          try {
            await deleteVendor(Number(id));
          } catch (err) {
            window.alert(err instanceof Error ? err.message : 'Failed to delete vendor');
            throw err;
          }
        }}
      />
    </>
  );
}
