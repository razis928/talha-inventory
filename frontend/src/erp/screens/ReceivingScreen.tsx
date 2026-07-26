import { useMemo, useState } from 'react';
import DataTable, { Column } from '../components/DataTable';
import PageToolbar from '../components/PageToolbar';
import ScreenFrame from '../components/ScreenFrame';
import { useErp } from '../context/ErpContext';
import { ReceivingApi } from '../api/purchase';
import { matchesSearch } from '../utils/filter';

const PAGE_SIZE = 6;

interface ReceivingScreenProps {
  searchQuery: string;
  onOpenAdd: () => void;
}

export default function ReceivingScreen({ searchQuery, onOpenAdd }: ReceivingScreenProps) {
  const { receivings, purchaseOrders } = useErp();
  const [page, setPage] = useState(1);

  const poMap = useMemo(() => {
    const map = new Map<number, string>();
    purchaseOrders.forEach((po) => map.set(po.id, po.po_number));
    return map;
  }, [purchaseOrders]);

  const filtered = useMemo(() => {
    return receivings.filter((row) =>
      matchesSearch(
        {
          ...row,
          receivingNumber: row.receiving_number,
          poNumber: row.purchase_order_id ? poMap.get(row.purchase_order_id) : '',
          itemName: row.lines.map((l) => l.item_name).join(', '),
        } as unknown as Record<string, unknown>,
        searchQuery
      )
    );
  }, [receivings, searchQuery, poMap]);

  const columns: Column<ReceivingApi>[] = [
    {
      key: 'receiving_number',
      header: 'Receiving #',
      render: (r) => <span className="erp-strong">{r.receiving_number}</span>,
    },
    {
      key: 'purchase_order_id',
      header: 'PO',
      render: (r) => (r.purchase_order_id ? poMap.get(r.purchase_order_id) ?? '—' : '—'),
    },
    { key: 'vendor', header: 'Vendor', render: (r) => r.vendor || '—' },
    {
      key: 'lines',
      header: 'Received items',
      render: (r) => (
        <span className="text-xs">
          {r.lines.map((line) => `${line.item_name} (+${line.quantity} ${line.unit})`).join(', ')}
        </span>
      ),
    },
    { key: 'received_date', header: 'Date', render: (r) => r.received_date },
    { key: 'created_by', header: 'By', render: (r) => r.created_by || '—' },
  ];

  return (
    <ScreenFrame
      title="Receiving"
      subtitle="Goods receipt — stock in + Dr Purchases / Cr Vendor (Vendor Payments)"
      toolbar={<PageToolbar onAdd={onOpenAdd} addLabel="+ New Receiving" />}
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
