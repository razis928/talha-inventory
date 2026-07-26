import { useMemo, useState } from 'react';
import DataTable, { Column } from '../components/DataTable';
import PageToolbar from '../components/PageToolbar';
import ScreenFrame from '../components/ScreenFrame';
import { useErp } from '../context/ErpContext';
import { DispatchApi } from '../api/dispatch';
import { matchesSearch } from '../utils/filter';

const PAGE_SIZE = 6;

interface DispatchScreenProps {
  searchQuery: string;
  onOpenAdd: () => void;
}

export default function DispatchScreen({ searchQuery, onOpenAdd }: DispatchScreenProps) {
  const { dispatches } = useErp();
  const [page, setPage] = useState(1);

  const filtered = useMemo(() => {
    return dispatches.filter((row) =>
      matchesSearch(
        {
          ...row,
          passNumber: row.pass_number,
          jobNumber: row.job_number,
          customer: row.customer_name,
          itemName: row.lines.map((l) => l.item_name).join(', '),
        } as unknown as Record<string, unknown>,
        searchQuery
      )
    );
  }, [dispatches, searchQuery]);

  const columns: Column<DispatchApi>[] = [
    {
      key: 'pass_number',
      header: 'Gate Pass #',
      render: (r) => <span className="erp-strong">{r.pass_number}</span>,
    },
    { key: 'job_number', header: 'Job No', render: (r) => r.job_number },
    { key: 'customer_name', header: 'Customer', render: (r) => r.customer_name },
    {
      key: 'lines',
      header: 'Dispatched',
      render: (r) => (
        <span className="text-xs">
          {r.lines.map((line) => `${line.item_name} (−${line.quantity} ${line.unit})`).join(', ')}
        </span>
      ),
    },
    { key: 'vehicle_no', header: 'Vehicle', render: (r) => r.vehicle_no || '—' },
    { key: 'driver', header: 'Driver', render: (r) => r.driver || '—' },
    { key: 'dispatch_date', header: 'Date', render: (r) => r.dispatch_date },
    {
      key: 'status',
      header: 'Status',
      render: (r) => <span className="erp-badge erp-badge-green">{r.status}</span>,
    },
  ];

  return (
    <ScreenFrame
      title="Dispatch / Gate Pass"
      subtitle="Outward dispatch against job orders — reduces Order Pending Quantity"
      toolbar={<PageToolbar onAdd={onOpenAdd} addLabel="+ New Dispatch" />}
    >
      <DataTable
        columns={columns}
        data={filtered}
        page={page}
        pageSize={PAGE_SIZE}
        onPageChange={setPage}
        showActions={false}
        keyExtractor={(row) => String(row.id)}
      />
    </ScreenFrame>
  );
}
