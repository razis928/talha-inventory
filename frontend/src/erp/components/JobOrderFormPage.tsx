import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import ScreenFrame from './ScreenFrame';
import RecordModal from './RecordModal';
import { InventoryItem } from '../types';
import { JobConsumedItemApi, JobConsumptionInput, JobOrderApi, JobOrderInput, fetchJobConsumptions } from '../api/jobOrders';
import { CustomerApi, CustomerInput } from '../api/customers';
import { DispatchInput } from '../api/dispatch';
import { CUSTOMER_FIELDS } from '../config/entityFields';
import { useErp } from '../context/ErpContext';

interface LineDraft {
  key: string;
  lineId: number | null;
  itemId: string;
  itemName: string;
  unit: string;
  quality: string;
  colour: string;
  size: string;
  orderQty: number;
  pendingQty: number;
  remarks: string;
  rate: number;
  gstPercent: number;
}

interface ConsumeDraft {
  key: string;
  itemId: string;
  quantity: number;
}

interface JobOrderFormPageProps {
  mode: 'add' | 'edit';
  inventory: InventoryItem[];
  units: string[];
  customers: string[];
  record?: JobOrderApi;
  onBack: () => void;
  onSave: (data: JobOrderInput) => void | Promise<void>;
  onAddCustomer: (data: CustomerInput) => Promise<CustomerApi>;
  onDispatch?: (data: DispatchInput) => void | Promise<void>;
  onConsume?: (jobId: number, data: JobConsumptionInput) => void | Promise<void>;
}

const CURRENCIES = ['PKR', 'USD', 'EUR', 'GBP'];
const PAYMENT_TERMS = [
  'Cash on delivery',
  '15 days after delivery',
  '30 days after delivery',
  '45 days after delivery',
  '60 days after delivery',
];

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function mapRecordLines(record: JobOrderApi): LineDraft[] {
  return record.lines.map((line) => ({
    key: `line-${line.id}`,
    lineId: line.id,
    itemId: line.item_id != null ? String(line.item_id) : '',
    itemName: line.item_name ?? '',
    unit: line.unit ?? '',
    quality: line.quality ?? '',
    colour: line.colour ?? '',
    size: String(line.size ?? ''),
    orderQty: line.order_quantity,
    pendingQty: line.order_pending_quantity,
    remarks: line.remarks ?? '',
    rate: Number(line.rate),
    gstPercent: Number(line.gst_percent),
  }));
}

function newLine(finishedItems: InventoryItem[], units: string[]): LineDraft {
  const item = finishedItems[0];
  return {
    key: `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    lineId: null,
    itemId: item?.id ?? '',
    itemName: item?.name ?? '',
    unit: item?.unit ?? units[0] ?? 'KG',
    quality: '',
    colour: '',
    size: item ? String(item.size || '') : '',
    orderQty: 1,
    pendingQty: 1,
    remarks: '',
    rate: item ? Number(item.sellingPrice || item.costPrice) : 0,
    gstPercent: 18,
  };
}

function lineGross(line: LineDraft) {
  return line.orderQty * line.rate;
}

function lineGst(line: LineDraft) {
  return lineGross(line) * (line.gstPercent / 100);
}

function lineNet(line: LineDraft) {
  return lineGross(line) + lineGst(line);
}

function toCustomerInput(data: Record<string, unknown>): CustomerInput {
  return {
    name: String(data.name ?? '').trim(),
    phone: String(data.phone ?? ''),
    email: String(data.email ?? ''),
    city: String(data.city ?? ''),
    address: String(data.address ?? ''),
  };
}

export default function JobOrderFormPage({
  mode,
  inventory,
  units,
  customers,
  record,
  onBack,
  onSave,
  onAddCustomer,
  onDispatch,
  onConsume,
}: JobOrderFormPageProps) {
  const { dispatches } = useErp();
  const finishedItems = useMemo(
    () => inventory.filter((item) => item.type === 'Finished'),
    [inventory]
  );
  const rawItems = useMemo(
    () => inventory.filter((item) => item.type === 'Raw'),
    [inventory]
  );

  const [customerName, setCustomerName] = useState(
    record?.customer_name ?? customers[0] ?? ''
  );
  const [customerModalOpen, setCustomerModalOpen] = useState(false);
  const [paymentTerms, setPaymentTerms] = useState(
    record?.payment_terms || PAYMENT_TERMS[3]
  );
  const [currency, setCurrency] = useState(record?.currency || 'PKR');
  const [freight, setFreight] = useState(Number(record?.freight_charges ?? 0));
  const [lines, setLines] = useState<LineDraft[]>(() => {
    if (record?.lines?.length) return mapRecordLines(record);
    return [newLine(finishedItems, units)];
  });
  const [saving, setSaving] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchQtys, setDispatchQtys] = useState<Record<string, number>>({});
  const [passNumber, setPassNumber] = useState(`GP-${Date.now().toString().slice(-6)}`);
  const [dispatchDate, setDispatchDate] = useState(todayIso());
  const [vehicleNo, setVehicleNo] = useState('');
  const [driver, setDriver] = useState('');
  const [dispatchNotes, setDispatchNotes] = useState('');
  const [consuming, setConsuming] = useState(false);
  const [consumeDate, setConsumeDate] = useState(todayIso());
  const [consumeNotes, setConsumeNotes] = useState('');
  const [consumeLines, setConsumeLines] = useState<ConsumeDraft[]>(() => [
    {
      key: `c-${Date.now()}`,
      itemId: '',
      quantity: 1,
    },
  ]);
  const [consumptions, setConsumptions] = useState<JobConsumedItemApi[]>([]);

  useEffect(() => {
    if (!record?.lines?.length) return;
    setLines(mapRecordLines(record));
    setDispatchQtys({});
  }, [record]);

  useEffect(() => {
    if (!record?.id) {
      setConsumptions([]);
      return;
    }
    void fetchJobConsumptions(record.id)
      .then(setConsumptions)
      .catch(() => setConsumptions([]));
  }, [record?.id]);

  const jobDispatches = useMemo(() => {
    if (!record?.id) return [];
    return dispatches.filter((d) => d.job_order_id === record.id);
  }, [dispatches, record?.id]);

  const pendingDispatchLines = useMemo(
    () => lines.filter((line) => line.lineId != null && line.pendingQty > 0),
    [lines]
  );

  const canDispatch =
    mode === 'edit' &&
    Boolean(onDispatch && record) &&
    pendingDispatchLines.length > 0 &&
    !['Cancelled', 'Completed'].includes(record?.status ?? '');

  const canConsume =
    mode === 'edit' &&
    Boolean(onConsume && record) &&
    rawItems.length > 0 &&
    record?.status !== 'Cancelled';

  const taxTotal = lines.reduce((sum, line) => sum + lineGst(line), 0);
  const linesNet = lines.reduce((sum, line) => sum + lineNet(line), 0);
  const grandTotal = linesNet + freight;
  const qtyTotal = lines.reduce((sum, line) => sum + line.orderQty, 0);

  const updateLine = (key: string, patch: Partial<LineDraft>) => {
    setLines((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  };

  const handleItemNameChange = (key: string, itemName: string) => {
    const existing = lines.find((l) => l.key === key);
    if (existing && existing.orderQty > existing.pendingQty) return;
    const match = finishedItems.find(
      (item) => item.name.toLowerCase() === itemName.trim().toLowerCase()
    );
    if (match) {
      updateLine(key, {
        itemId: match.id,
        itemName: match.name,
        unit: match.unit,
        size: String(match.size || ''),
        rate: Number(match.sellingPrice || match.costPrice),
      });
      return;
    }
    updateLine(key, {
      itemId: '',
      itemName,
    });
  };

  const handleAddCustomer = (data: Record<string, unknown>) => {
    void (async () => {
      try {
        const created = await onAddCustomer(toCustomerInput(data));
        setCustomerName(created.name);
        setCustomerModalOpen(false);
      } catch (err) {
        window.alert(err instanceof Error ? err.message : 'Failed to add customer');
      }
    })();
  };

  const handleOrderQtyChange = (key: string, orderQty: number) => {
    const line = lines.find((l) => l.key === key);
    if (!line) return;
    // Pending tracks remaining to dispatch; keep it in sync when nothing has been dispatched yet.
    const pendingQty =
      line.pendingQty >= line.orderQty
        ? orderQty
        : Math.min(line.pendingQty, orderQty);
    updateLine(key, { orderQty, pendingQty });
  };

  const handleDispatch = async () => {
    if (!record || !onDispatch) return;
    const activeLines = pendingDispatchLines
      .map((line) => {
        const qty = dispatchQtys[line.key] ?? line.pendingQty;
        return { line, qty };
      })
      .filter(({ qty }) => qty > 0);

    if (activeLines.length === 0) {
      window.alert('Enter gate pass quantity for at least one line.');
      return;
    }
    if (activeLines.some(({ line, qty }) => qty > line.pendingQty)) {
      window.alert('Gate pass quantity cannot exceed pending quantity.');
      return;
    }
    if (!passNumber.trim()) {
      window.alert('Gate Pass # is required.');
      return;
    }

    const payload: DispatchInput = {
      pass_number: passNumber.trim(),
      job_order_id: record.id,
      dispatch_date: dispatchDate || todayIso(),
      vehicle_no: vehicleNo,
      driver,
      notes: dispatchNotes,
      lines: activeLines.map(({ line, qty }) => ({
        job_order_line_id: line.lineId as number,
        item_id: line.itemId ? Number(line.itemId) : null,
        quantity: qty,
      })),
    };

    try {
      setDispatching(true);
      await onDispatch(payload);
      setPassNumber(`GP-${Date.now().toString().slice(-6)}`);
      setDispatchDate(todayIso());
      setVehicleNo('');
      setDriver('');
      setDispatchNotes('');
      setDispatchQtys({});
      window.alert('Gate pass saved — pending qty and stock updated.');
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Failed to save gate pass');
    } finally {
      setDispatching(false);
    }
  };

  const handleConsume = async () => {
    if (!record || !onConsume) return;
    const active = consumeLines
      .map((line) => ({
        itemId: Number(line.itemId) || 0,
        quantity: Number(line.quantity) || 0,
      }))
      .filter((line) => line.itemId > 0 && line.quantity > 0);

    if (active.length === 0) {
      window.alert('Select at least one raw item with quantity greater than 0.');
      return;
    }

    for (const line of active) {
      const item = rawItems.find((r) => Number(r.id) === line.itemId);
      if (!item) {
        window.alert('Selected raw item was not found.');
        return;
      }
      if (line.quantity > item.stockLevel) {
        window.alert(
          `Insufficient stock for ${item.name}: available ${item.stockLevel}, requested ${line.quantity}`
        );
        return;
      }
    }

    const payload: JobConsumptionInput = {
      consumed_date: consumeDate || todayIso(),
      notes: consumeNotes,
      lines: active.map((line) => ({
        item_id: line.itemId,
        quantity: line.quantity,
      })),
    };

    try {
      setConsuming(true);
      await onConsume(record.id, payload);
      const latest = await fetchJobConsumptions(record.id);
      setConsumptions(latest);
      setConsumeDate(todayIso());
      setConsumeNotes('');
      setConsumeLines([{ key: `c-${Date.now()}`, itemId: '', quantity: 1 }]);
      window.alert('Raw materials consumed — stock decreased and logged.');
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Failed to save consumption');
    } finally {
      setConsuming(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!customerName.trim()) {
      window.alert('Please enter / select a customer name.');
      return;
    }
    if (lines.length === 0) {
      window.alert('Add at least one job line.');
      return;
    }
    if (lines.some((line) => !line.itemName.trim() || line.orderQty <= 0)) {
      window.alert('Each line needs an item name and order quantity greater than 0.');
      return;
    }
    if (lines.some((line) => line.pendingQty > line.orderQty)) {
      window.alert('Order pending quantity cannot exceed order quantity.');
      return;
    }

    const fd = new FormData(e.currentTarget);
    const payload: JobOrderInput = {
      job_number: String(fd.get('jobNumber') ?? ''),
      customer_name: customerName.trim(),
      required_date: String(fd.get('requiredDate') ?? '') || null,
      payment_terms: paymentTerms,
      remarks: String(fd.get('remarks') ?? ''),
      pi_number: String(fd.get('piNumber') ?? ''),
      freight_charges: freight,
      currency,
      lines: lines.map((line) => ({
        item_id: line.itemId ? Number(line.itemId) : null,
        item_name: line.itemName.trim(),
        unit: line.unit,
        quality: line.quality,
        colour: line.colour,
        size: line.size,
        order_quantity: Number(line.orderQty),
        order_pending_quantity: Number(line.pendingQty),
        remarks: line.remarks,
        rate: Number(line.rate),
        gst_percent: Number(line.gstPercent),
      })),
    };

    try {
      setSaving(true);
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  const title = mode === 'add' ? 'Add Job Order' : 'Edit Job Order';
  const datalistId = 'finished-item-names';

  return (
    <>
    <ScreenFrame
      title={title}
      toolbar={
        <button type="button" onClick={onBack} className="erp-btn-ghost flex items-center gap-1">
          <ArrowLeft size={14} />
          Back
        </button>
      }
      formPanel={
        <form id="job-order-form" onSubmit={handleSubmit}>
          <datalist id={datalistId}>
            {finishedItems.map((item) => (
              <option key={item.id} value={item.name} />
            ))}
          </datalist>

          <div className="mb-2">
            <span className="erp-accent-red text-sm font-semibold">LOCAL</span>
          </div>

          <div className="grid grid-cols-1 gap-3 lg:grid-cols-3">
            <div className="space-y-3">
              <Field label="Job No" name="jobNumber" defaultValue={record?.job_number ?? ''} required />
              <Field
                label="Required Date"
                name="requiredDate"
                type="date"
                defaultValue={record?.required_date ?? ''}
              />
              <div className="erp-field-row">
                <label className="erp-field-label">Remarks</label>
                <textarea
                  name="remarks"
                  defaultValue={record?.remarks ?? ''}
                  rows={2}
                  className="erp-input w-full"
                />
              </div>
            </div>

            <div className="space-y-3">
              <Field label="PI #" name="piNumber" defaultValue={record?.pi_number ?? ''} />
              <div className="erp-field-row">
                <label className="erp-field-label">Freight Charges</label>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={freight}
                  onChange={(e) => setFreight(Number(e.target.value) || 0)}
                  className="erp-input w-full"
                />
              </div>
              <div className="erp-field-row">
                <label className="erp-field-label">Customer Name</label>
                <div className="flex items-center gap-1">
                  {customers.length > 0 || customerName ? (
                    <select
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      className="erp-classic-select w-full"
                    >
                      {customers.length === 0 && customerName ? (
                        <option value={customerName}>{customerName}</option>
                      ) : null}
                      {customers.map((name) => (
                        <option key={name} value={name}>{name}</option>
                      ))}
                    </select>
                  ) : (
                    <input
                      value={customerName}
                      onChange={(e) => setCustomerName(e.target.value)}
                      required
                      className="erp-input w-full"
                      placeholder="Customer name"
                    />
                  )}
                  <button
                    type="button"
                    className="erp-btn-ghost shrink-0 p-1.5"
                    title="Add customer"
                    onClick={() => setCustomerModalOpen(true)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="erp-field-row">
                <label className="erp-field-label">Payment Terms</label>
                <select
                  value={paymentTerms}
                  onChange={(e) => setPaymentTerms(e.target.value)}
                  className="erp-classic-select w-full"
                >
                  {PAYMENT_TERMS.map((term) => (
                    <option key={term} value={term}>{term}</option>
                  ))}
                </select>
              </div>
              <div className="erp-field-row">
                <label className="erp-field-label">Currency</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="erp-classic-select w-full"
                >
                  {CURRENCIES.map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          <div className="mt-5 mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="erp-field-label">Job lines</span>
            <button
              type="button"
              className="erp-btn-ghost flex items-center gap-1"
              onClick={() => setLines((prev) => [...prev, newLine(finishedItems, units)])}
            >
              <Plus size={14} />
              Add item
            </button>
          </div>

          <div className="overflow-x-auto border border-[var(--color-erp-border)]">
            <table className="erp-classic-table min-w-[1100px]">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>UOM</th>
                  <th>Quality</th>
                  <th>Colour</th>
                  <th>Size</th>
                  <th>Order Quantity</th>
                  <th>Order Pending Quantity</th>
                  <th>Remarks</th>
                  <th>Rate</th>
                  <th>GST %</th>
                  <th>Gross</th>
                  <th>Net Amount</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {lines.length === 0 ? (
                  <tr>
                    <td colSpan={13} className="erp-muted py-6 text-center">
                      No job lines yet. Add an item or type a custom item name.
                    </td>
                  </tr>
                ) : (
                  lines.map((line) => {
                    const dispatched = line.orderQty > line.pendingQty;
                    return (
                    <tr key={line.key}>
                      <td>
                        <input
                          type="text"
                          list={datalistId}
                          value={line.itemName}
                          onChange={(e) => handleItemNameChange(line.key, e.target.value)}
                          className="erp-input w-full min-w-[160px]"
                          placeholder="Type or select finished item"
                          required
                          readOnly={dispatched}
                          title={dispatched ? 'Item locked — quantity already dispatched' : undefined}
                        />
                      </td>
                      <td>
                        <select
                          value={line.unit}
                          onChange={(e) => updateLine(line.key, { unit: e.target.value })}
                          className="erp-classic-select w-24"
                          disabled={Boolean(line.itemId) || dispatched}
                          title={
                            dispatched
                              ? 'UOM locked — quantity already dispatched'
                              : line.itemId
                                ? 'UOM from inventory item'
                                : undefined
                          }
                        >
                          {!units.includes(line.unit) && line.unit ? (
                            <option value={line.unit}>{line.unit}</option>
                          ) : null}
                          {units.map((u) => (
                            <option key={u} value={u}>{u}</option>
                          ))}
                        </select>
                      </td>
                      <td>
                        <input
                          type="text"
                          value={line.quality}
                          onChange={(e) => updateLine(line.key, { quality: e.target.value })}
                          className="erp-input w-24"
                          placeholder="e.g. 7PLY"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={line.colour}
                          onChange={(e) => updateLine(line.key, { colour: e.target.value })}
                          className="erp-input w-20"
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={line.size}
                          onChange={(e) => updateLine(line.key, { size: e.target.value })}
                          className="erp-input w-24"
                          placeholder="58x48x25"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={1}
                          value={line.orderQty}
                          onChange={(e) => handleOrderQtyChange(line.key, Number(e.target.value) || 0)}
                          className="erp-input w-24 erp-cell-highlight"
                          required
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          value={line.pendingQty}
                          className="erp-input w-28 erp-cell-highlight"
                          readOnly
                          tabIndex={-1}
                        />
                      </td>
                      <td>
                        <input
                          type="text"
                          value={line.remarks}
                          onChange={(e) => updateLine(line.key, { remarks: e.target.value })}
                          className="erp-input w-28"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={line.rate}
                          onChange={(e) => updateLine(line.key, { rate: Number(e.target.value) || 0 })}
                          className="erp-input w-24"
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          step="0.01"
                          value={line.gstPercent}
                          onChange={(e) => updateLine(line.key, { gstPercent: Number(e.target.value) || 0 })}
                          className="erp-input w-20"
                        />
                      </td>
                      <td>{lineGross(line).toFixed(2)}</td>
                      <td className="erp-strong">{lineNet(line).toFixed(2)}</td>
                      <td>
                        <button
                          type="button"
                          className="erp-btn-ghost p-1 text-red-600"
                          onClick={() => setLines((prev) => prev.filter((l) => l.key !== line.key))}
                          disabled={lines.length <= 1 || dispatched}
                          title={dispatched ? 'Cannot remove — quantity dispatched' : 'Remove line'}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 text-sm">
            <span>
              Order Qty Total: <span className="erp-strong">{qtyTotal}</span>
            </span>
            <div className="flex flex-wrap gap-4">
              <span>
                Tax: <span className="erp-strong">{taxTotal.toFixed(2)}</span>
              </span>
              <span>
                Total Amount: <span className="erp-strong text-base">{grandTotal.toFixed(2)}</span>
              </span>
            </div>
          </div>

          {mode === 'edit' && record && (
            <div className="mt-6 space-y-4">
              {canConsume && (
                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="erp-titlebar mb-0 text-xs">Consume raw materials</div>
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        className="erp-btn-ghost text-xs"
                        onClick={() =>
                          setConsumeLines((prev) => [
                            ...prev,
                            { key: `c-${Date.now()}-${prev.length}`, itemId: '', quantity: 1 },
                          ])
                        }
                      >
                        + Add raw line
                      </button>
                      <button
                        type="button"
                        className="erp-btn-primary text-xs"
                        disabled={consuming}
                        onClick={() => void handleConsume()}
                      >
                        {consuming ? 'Saving…' : 'Save Consumption'}
                      </button>
                    </div>
                  </div>
                  <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2">
                    <div className="erp-field-row">
                      <label className="erp-field-label">Consumed Date</label>
                      <input
                        type="date"
                        value={consumeDate}
                        onChange={(e) => setConsumeDate(e.target.value)}
                        className="erp-input w-full"
                      />
                    </div>
                    <div className="erp-field-row">
                      <label className="erp-field-label">Notes</label>
                      <input
                        type="text"
                        value={consumeNotes}
                        onChange={(e) => setConsumeNotes(e.target.value)}
                        className="erp-input w-full"
                        placeholder="Optional notes"
                      />
                    </div>
                  </div>
                  <div className="overflow-x-auto border border-[var(--color-erp-border)]">
                    <table className="erp-classic-table min-w-[520px]">
                      <thead>
                        <tr>
                          <th>Raw Item</th>
                          <th>Stock</th>
                          <th>Consume Qty</th>
                          <th />
                        </tr>
                      </thead>
                      <tbody>
                        {consumeLines.map((line) => {
                          const item = rawItems.find((r) => r.id === line.itemId);
                          return (
                            <tr key={line.key}>
                              <td>
                                <select
                                  value={line.itemId}
                                  onChange={(e) =>
                                    setConsumeLines((prev) =>
                                      prev.map((row) =>
                                        row.key === line.key
                                          ? { ...row, itemId: e.target.value }
                                          : row
                                      )
                                    )
                                  }
                                  className="erp-classic-select w-full min-w-[180px]"
                                >
                                  <option value="">— Select raw item —</option>
                                  {rawItems.map((raw) => (
                                    <option key={raw.id} value={raw.id}>
                                      {raw.name}
                                    </option>
                                  ))}
                                </select>
                              </td>
                              <td className="erp-cell-highlight">
                                {item ? `${item.stockLevel} ${item.unit}` : '—'}
                              </td>
                              <td>
                                <input
                                  type="number"
                                  min={1}
                                  max={item?.stockLevel ?? undefined}
                                  value={line.quantity}
                                  onChange={(e) =>
                                    setConsumeLines((prev) =>
                                      prev.map((row) =>
                                        row.key === line.key
                                          ? {
                                              ...row,
                                              quantity: Math.max(0, Number(e.target.value) || 0),
                                            }
                                          : row
                                      )
                                    )
                                  }
                                  className="erp-input w-24"
                                />
                              </td>
                              <td>
                                <button
                                  type="button"
                                  className="erp-btn-ghost p-1 text-red-600"
                                  disabled={consumeLines.length <= 1}
                                  onClick={() =>
                                    setConsumeLines((prev) => prev.filter((row) => row.key !== line.key))
                                  }
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div>
                <div className="erp-titlebar mb-0 text-xs">Raw consumption history</div>
                <div className="overflow-x-auto border border-[var(--color-erp-border)]">
                  <table className="erp-classic-table min-w-[480px]">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Raw Item</th>
                        <th>Qty</th>
                        <th>Notes</th>
                      </tr>
                    </thead>
                    <tbody>
                      {consumptions.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="erp-muted py-6 text-center">
                            No raw materials consumed on this job yet.
                          </td>
                        </tr>
                      ) : (
                        consumptions.map((row) => (
                          <tr key={row.id}>
                            <td>{row.consumed_date}</td>
                            <td className="erp-strong">{row.item_name}</td>
                            <td>
                              {row.quantity} {row.unit}
                            </td>
                            <td className="text-xs">{row.notes || '—'}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {canDispatch && (
                <div>
                  <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                    <div className="erp-titlebar mb-0 text-xs">Add Gate Pass against this Job</div>
                    <button
                      type="button"
                      className="erp-btn-primary text-xs"
                      disabled={dispatching}
                      onClick={() => void handleDispatch()}
                    >
                      {dispatching ? 'Saving…' : 'Save Gate Pass'}
                    </button>
                  </div>
                  <div className="mb-3 grid grid-cols-1 gap-2 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="erp-field-row">
                      <label className="erp-field-label">Gate Pass #</label>
                      <input
                        type="text"
                        value={passNumber}
                        onChange={(e) => setPassNumber(e.target.value)}
                        className="erp-input w-full"
                        required
                      />
                    </div>
                    <div className="erp-field-row">
                      <label className="erp-field-label">Date</label>
                      <input
                        type="date"
                        value={dispatchDate}
                        onChange={(e) => setDispatchDate(e.target.value)}
                        className="erp-input w-full"
                      />
                    </div>
                    <div className="erp-field-row">
                      <label className="erp-field-label">Vehicle No</label>
                      <input
                        type="text"
                        value={vehicleNo}
                        onChange={(e) => setVehicleNo(e.target.value)}
                        className="erp-input w-full"
                      />
                    </div>
                    <div className="erp-field-row">
                      <label className="erp-field-label">Driver</label>
                      <input
                        type="text"
                        value={driver}
                        onChange={(e) => setDriver(e.target.value)}
                        className="erp-input w-full"
                      />
                    </div>
                    <div className="erp-field-row sm:col-span-2">
                      <label className="erp-field-label">Notes</label>
                      <input
                        type="text"
                        value={dispatchNotes}
                        onChange={(e) => setDispatchNotes(e.target.value)}
                        className="erp-input w-full"
                        placeholder="Optional notes"
                      />
                    </div>
                  </div>
                  <div className="overflow-x-auto border border-[var(--color-erp-border)]">
                    <table className="erp-classic-table min-w-[520px]">
                      <thead>
                        <tr>
                          <th>Item</th>
                          <th>Order Qty</th>
                          <th>Pending</th>
                          <th>Dispatch now</th>
                        </tr>
                      </thead>
                      <tbody>
                        {pendingDispatchLines.map((line) => {
                          const value = dispatchQtys[line.key] ?? line.pendingQty;
                          return (
                            <tr key={line.key}>
                              <td className="erp-strong">
                                {line.itemName || '—'}
                                <span className="erp-muted ml-1 text-xs">{line.unit}</span>
                              </td>
                              <td>{line.orderQty}</td>
                              <td className="erp-cell-highlight">{line.pendingQty}</td>
                              <td>
                                <input
                                  type="number"
                                  min={0}
                                  max={line.pendingQty}
                                  value={value}
                                  onChange={(e) => {
                                    const next = Math.min(
                                      line.pendingQty,
                                      Math.max(0, Number(e.target.value) || 0)
                                    );
                                    setDispatchQtys((prev) => ({ ...prev, [line.key]: next }));
                                  }}
                                  className="erp-input w-24"
                                />
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              <div>
                <div className="erp-titlebar mb-0 text-xs">Gate Pass history</div>
                <div className="overflow-x-auto border border-[var(--color-erp-border)]">
                  <table className="erp-classic-table min-w-[480px]">
                    <thead>
                      <tr>
                        <th>Gate Pass #</th>
                        <th>Date</th>
                        <th>Items</th>
                        <th>Vehicle / Driver</th>
                      </tr>
                    </thead>
                    <tbody>
                      {jobDispatches.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="erp-muted py-6 text-center">
                            No gate passes yet for this job order.
                          </td>
                        </tr>
                      ) : (
                        jobDispatches.map((gp) => (
                          <tr key={gp.id}>
                            <td className="erp-strong">{gp.pass_number}</td>
                            <td>{gp.dispatch_date}</td>
                            <td className="text-xs">
                              {gp.lines
                                .map((l) => `${l.item_name} −${l.quantity} ${l.unit}`)
                                .join(', ')}
                            </td>
                            <td className="text-xs">
                              {[gp.vehicle_no, gp.driver].filter(Boolean).join(' / ') || '—'}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </form>
      }
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={onBack} className="erp-btn-ghost">Exit</button>
          <button
            type="submit"
            form="job-order-form"
            className="erp-btn-primary erp-btn-save"
            disabled={saving || lines.length === 0}
          >
            {saving ? 'Saving…' : 'Save'}
          </button>
        </div>
      }
    />
    <RecordModal
      isOpen={customerModalOpen}
      mode="add"
      title="Customer"
      fields={CUSTOMER_FIELDS}
      onClose={() => setCustomerModalOpen(false)}
      onSave={handleAddCustomer}
    />
    </>
  );
}

function Field({
  label,
  name,
  defaultValue,
  type = 'text',
  required,
}: {
  label: string;
  name: string;
  defaultValue: string | number;
  type?: string;
  required?: boolean;
}) {
  return (
    <div className="erp-field-row">
      <label className="erp-field-label">{label}</label>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="erp-input w-full"
      />
    </div>
  );
}
