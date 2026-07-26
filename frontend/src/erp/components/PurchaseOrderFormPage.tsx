import { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import ScreenFrame from './ScreenFrame';
import RecordModal from './RecordModal';
import { InventoryItem } from '../types';
import { PurchaseOrderApi, PurchaseOrderInput, ReceivingInput } from '../api/purchase';
import { VendorApi, VendorInput } from '../api/vendors';
import { QUICK_VENDOR_FIELDS } from '../config/entityFields';
import { useErp } from '../context/ErpContext';

interface LineDraft {
  key: string;
  lineId: number | null;
  itemId: string;
  itemName: string;
  unit: string;
  size: string;
  quantity: number;
  receivedQuantity: number;
  poRate: number;
  gstPercent: number;
}

interface PurchaseOrderFormPageProps {
  mode: 'add' | 'edit';
  inventory: InventoryItem[];
  vendors: VendorApi[];
  record?: PurchaseOrderApi;
  onBack: () => void;
  onSave: (data: PurchaseOrderInput) => void | Promise<void>;
  onAddVendor: (data: VendorInput) => Promise<VendorApi>;
  onReceive?: (data: ReceivingInput) => void | Promise<void>;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function newLine(inventory: InventoryItem[]): LineDraft {
  const item = inventory[0];
  return {
    key: `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    lineId: null,
    itemId: item?.id ?? '',
    itemName: item?.name ?? '',
    unit: item?.unit ?? '',
    size: item ? String(item.size || '') : '',
    quantity: 1,
    receivedQuantity: 0,
    poRate: item ? Number(item.costPrice) : 0,
    gstPercent: 0,
  };
}

function lineGross(line: LineDraft) {
  return line.quantity * line.poRate;
}

function lineGst(line: LineDraft) {
  return lineGross(line) * (line.gstPercent / 100);
}

function lineNet(line: LineDraft) {
  return lineGross(line) + lineGst(line);
}

function toVendorInput(data: Record<string, unknown>): VendorInput {
  return {
    name: String(data.name ?? '').trim(),
    phone: String(data.phone ?? ''),
    email: String(data.email ?? ''),
    city: String(data.city ?? ''),
    address: String(data.address ?? ''),
  };
}

export default function PurchaseOrderFormPage({
  mode,
  inventory,
  vendors,
  record,
  onBack,
  onSave,
  onAddVendor,
  onReceive,
}: PurchaseOrderFormPageProps) {
  const { receivings } = useErp();
  const [vendorId, setVendorId] = useState(
    String(record?.vendor_id ?? vendors[0]?.id ?? '')
  );
  const [vendorModalOpen, setVendorModalOpen] = useState(false);
  const [lines, setLines] = useState<LineDraft[]>(() => {
    if (record?.lines?.length) {
      return record.lines.map((line) => ({
        key: `line-${line.id}`,
        lineId: line.id,
        itemId: String(line.item_id),
        itemName: line.item_name,
        unit: line.unit,
        size: String(line.size ?? ''),
        quantity: line.quantity,
        receivedQuantity: line.received_quantity ?? 0,
        poRate: Number(line.po_rate),
        gstPercent: Number(line.gst_percent),
      }));
    }
    return inventory.length ? [newLine(inventory)] : [];
  });
  const [saving, setSaving] = useState(false);
  const [receiving, setReceiving] = useState(false);
  const [receiveQtys, setReceiveQtys] = useState<Record<string, number>>({});
  const [receiveNotes, setReceiveNotes] = useState('');

  useEffect(() => {
    if (!record?.lines?.length) return;
    setLines(
      record.lines.map((line) => ({
        key: `line-${line.id}`,
        lineId: line.id,
        itemId: String(line.item_id),
        itemName: line.item_name,
        unit: line.unit,
        size: String(line.size ?? ''),
        quantity: line.quantity,
        receivedQuantity: line.received_quantity ?? 0,
        poRate: Number(line.po_rate),
        gstPercent: Number(line.gst_percent),
      }))
    );
    setReceiveQtys({});
  }, [record]);

  const poReceivings = useMemo(() => {
    if (!record?.id) return [];
    return receivings.filter((r) => r.purchase_order_id === record.id);
  }, [receivings, record?.id]);

  const pendingReceiveLines = useMemo(
    () =>
      lines.filter(
        (line) => line.lineId != null && line.receivedQuantity < line.quantity
      ),
    [lines]
  );

  const canReceive =
    mode === 'edit' &&
    Boolean(onReceive && record) &&
    pendingReceiveLines.length > 0 &&
    !['Cancelled', 'Received'].includes(record?.status ?? '');

  const lineItems = useMemo(
    () =>
      lines.map((line) => {
        const item = inventory.find((i) => i.id === line.itemId);
        return { ...line, item };
      }),
    [lines, inventory]
  );

  const taxTotal = lineItems.reduce((sum, line) => sum + lineGst(line), 0);
  const netTotal = lineItems.reduce((sum, line) => sum + lineNet(line), 0);

  const updateLine = (key: string, patch: Partial<LineDraft>) => {
    setLines((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  };

  const handleItemChange = (key: string, itemId: string) => {
    const line = lines.find((l) => l.key === key);
    if (line && line.receivedQuantity > 0) return;
    const item = inventory.find((i) => i.id === itemId);
    updateLine(key, {
      itemId,
      itemName: item?.name ?? '',
      unit: item?.unit ?? '',
      size: item ? String(item.size || '') : '',
      poRate: item ? Number(item.costPrice) : 0,
    });
  };

  const handleReceive = async () => {
    if (!record || !onReceive) return;
    const receiveLines = pendingReceiveLines
      .map((line) => {
        const remaining = line.quantity - line.receivedQuantity;
        const qty = Number(receiveQtys[line.key] ?? remaining);
        return { line, qty, remaining };
      })
      .filter((row) => row.qty > 0);

    if (receiveLines.length === 0) {
      window.alert('Enter a receive quantity greater than 0 for at least one line.');
      return;
    }
    for (const row of receiveLines) {
      if (row.qty > row.remaining) {
        window.alert(
          `Cannot receive ${row.qty} for ${row.line.itemName || 'item'} — only ${row.remaining} remaining.`
        );
        return;
      }
    }

    const payload: ReceivingInput = {
      receiving_number: `RCV-${Date.now().toString().slice(-6)}`,
      purchase_order_id: record.id,
      vendor_id: record.vendor_id,
      vendor: record.vendor,
      received_date: todayIso(),
      notes: receiveNotes,
      created_by: '',
      lines: receiveLines.map(({ line, qty }) => ({
        item_id: Number(line.itemId),
        quantity: qty,
        purchase_order_line_id: line.lineId,
      })),
    };

    try {
      setReceiving(true);
      await onReceive(payload);
      setReceiveNotes('');
      window.alert('Receiving saved — stock and vendor payable updated.');
    } catch (err) {
      window.alert(err instanceof Error ? err.message : 'Failed to receive');
    } finally {
      setReceiving(false);
    }
  };

  const handleAddVendor = (data: Record<string, unknown>) => {
    void (async () => {
      try {
        const created = await onAddVendor(toVendorInput(data));
        setVendorId(String(created.id));
        setVendorModalOpen(false);
      } catch (err) {
        window.alert(err instanceof Error ? err.message : 'Failed to add vendor');
      }
    })();
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!vendorId) {
      window.alert('Please select a vendor. Use + to add one if the list is empty.');
      return;
    }
    if (lines.length === 0) {
      window.alert('Add at least one item line.');
      return;
    }
    if (lines.some((line) => !line.itemId || line.quantity <= 0)) {
      window.alert('Each line needs an item and quantity greater than 0.');
      return;
    }

    const fd = new FormData(e.currentTarget);
    const payload: PurchaseOrderInput = {
      po_number: String(fd.get('poNumber') ?? ''),
      vendor_id: Number(vendorId),
      required_date: String(fd.get('requiredDate') ?? '') || null,
      payment_terms: String(fd.get('paymentTerms') ?? ''),
      remarks: String(fd.get('remarks') ?? ''),
      lines: lines.map((line) => ({
        item_id: Number(line.itemId),
        size: line.size,
        quantity: Number(line.quantity),
        po_rate: Number(line.poRate),
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

  const title = mode === 'add' ? 'Add Purchase Order' : 'Edit Purchase Order';

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
          <form id="purchase-order-form" onSubmit={handleSubmit}>
            <div className="mb-2">
              <span className="erp-accent-red text-sm">LOCAL</span>
            </div>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
              <Field label="PO No" name="poNumber" defaultValue={record?.po_number ?? ''} required />
              <div className="erp-field-row">
                <label className="erp-field-label">Vendor Name</label>
                <div className="flex items-center gap-1">
                  <select
                    value={vendorId}
                    onChange={(e) => setVendorId(e.target.value)}
                    required
                    className="erp-classic-select w-full"
                  >
                    {vendors.length === 0 ? (
                      <option value="">No vendors — click + to add</option>
                    ) : (
                      vendors.map((vendor) => (
                        <option key={vendor.id} value={vendor.id}>
                          {vendor.name} ({vendor.code})
                        </option>
                      ))
                    )}
                  </select>
                  <button
                    type="button"
                    className="erp-btn-ghost shrink-0 p-1.5"
                    title="Add vendor"
                    onClick={() => setVendorModalOpen(true)}
                  >
                    <Plus size={16} />
                  </button>
                </div>
              </div>
              <Field
                label="Required Date"
                name="requiredDate"
                type="date"
                defaultValue={record?.required_date ?? ''}
              />
              <Field
                label="Payment Terms"
                name="paymentTerms"
                defaultValue={record?.payment_terms ?? ''}
              />
              <div className="erp-field-row sm:col-span-2">
                <label className="erp-field-label">Remarks</label>
                <textarea
                  name="remarks"
                  defaultValue={record?.remarks ?? ''}
                  rows={2}
                  className="erp-input w-full"
                />
              </div>
            </div>

            <div className="mt-5 mb-2 flex flex-wrap items-center justify-between gap-2">
              <span className="erp-field-label">Purchase lines</span>
              <button
                type="button"
                className="erp-btn-ghost flex items-center gap-1"
                onClick={() => setLines((prev) => [...prev, newLine(inventory)])}
                disabled={inventory.length === 0}
              >
                <Plus size={14} />
                Add item
              </button>
            </div>

            <div className="overflow-x-auto border border-[var(--color-erp-border)]">
              <table className="erp-classic-table">
                <thead>
                  <tr>
                    <th>Item</th>
                    <th>UOM</th>
                    <th>Size</th>
                    <th>PO Qty</th>
                    <th>Received</th>
                    <th>PO Rate</th>
                    <th>GST %</th>
                    <th>Gross</th>
                    <th>Net Amount</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {lineItems.length === 0 ? (
                    <tr>
                      <td colSpan={10} className="erp-muted py-6 text-center">
                        No inventory items available. Create an item first.
                      </td>
                    </tr>
                  ) : (
                    lineItems.map((line) => {
                      const locked = line.receivedQuantity > 0;
                      return (
                        <tr key={line.key}>
                          <td>
                            <select
                              value={line.itemId}
                              onChange={(e) => handleItemChange(line.key, e.target.value)}
                              className="erp-classic-select w-full min-w-[160px]"
                              required
                              disabled={locked}
                              title={locked ? 'Item locked — quantity already received' : undefined}
                            >
                              {inventory.map((item) => (
                                <option key={item.id} value={item.id}>
                                  {item.name} ({item.sku})
                                </option>
                              ))}
                            </select>
                          </td>
                          <td>{line.item?.unit || '—'}</td>
                          <td>
                            <input
                              type="text"
                              value={line.size}
                              onChange={(e) => updateLine(line.key, { size: e.target.value })}
                              className="erp-input w-24"
                              placeholder="e.g. 8x10"
                              disabled={locked}
                            />
                          </td>
                          <td>
                            <input
                              type="number"
                              min={Math.max(1, line.receivedQuantity)}
                              value={line.quantity}
                              onChange={(e) => {
                                const qty = Number(e.target.value) || 0;
                                updateLine(line.key, {
                                  quantity: Math.max(qty, line.receivedQuantity || 0),
                                });
                              }}
                              className="erp-input w-24"
                              required
                            />
                          </td>
                          <td className="erp-cell-highlight erp-strong">{line.receivedQuantity}</td>
                          <td>
                            <input
                              type="number"
                              min={0}
                              step="0.01"
                              value={line.poRate}
                              onChange={(e) => updateLine(line.key, { poRate: Number(e.target.value) || 0 })}
                              className="erp-input w-28"
                              disabled={locked}
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
                              disabled={locked}
                            />
                          </td>
                          <td>{lineGross(line).toFixed(2)}</td>
                          <td className="erp-strong">{lineNet(line).toFixed(2)}</td>
                          <td>
                            <button
                              type="button"
                              className="erp-btn-ghost p-1"
                              onClick={() => setLines((prev) => prev.filter((l) => l.key !== line.key))}
                              disabled={lines.length <= 1 || locked}
                              title={locked ? 'Cannot remove — quantity received' : 'Remove line'}
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
            <div className="mt-2 flex flex-wrap gap-4 text-sm">
              <span>
                Tax: <span className="erp-strong">{taxTotal.toFixed(2)}</span>
              </span>
              <span>
                Total Amount: <span className="erp-strong">{netTotal.toFixed(2)}</span>
              </span>
            </div>

            {mode === 'edit' && record && (
              <div className="mt-6 space-y-4">
                {canReceive && (
                  <div>
                    <div className="mb-2 flex flex-wrap items-center justify-between gap-2">
                      <div className="erp-titlebar mb-0 text-xs">Receive against this PO</div>
                      <button
                        type="button"
                        className="erp-btn-primary text-xs"
                        disabled={receiving}
                        onClick={() => void handleReceive()}
                      >
                        {receiving ? 'Receiving…' : 'Save Receiving'}
                      </button>
                    </div>
                    <div className="overflow-x-auto border border-[var(--color-erp-border)]">
                      <table className="erp-classic-table min-w-[520px]">
                        <thead>
                          <tr>
                            <th>Item</th>
                            <th>PO Qty</th>
                            <th>Received</th>
                            <th>Remaining</th>
                            <th>Receive now</th>
                          </tr>
                        </thead>
                        <tbody>
                          {pendingReceiveLines.map((line) => {
                            const remaining = line.quantity - line.receivedQuantity;
                            const value = receiveQtys[line.key] ?? remaining;
                            return (
                              <tr key={line.key}>
                                <td className="erp-strong">
                                  {line.itemName || '—'}
                                  <span className="erp-muted ml-1 text-xs">{line.unit}</span>
                                </td>
                                <td>{line.quantity}</td>
                                <td>{line.receivedQuantity}</td>
                                <td className="erp-cell-highlight">{remaining}</td>
                                <td>
                                  <input
                                    type="number"
                                    min={0}
                                    max={remaining}
                                    value={value}
                                    onChange={(e) => {
                                      const next = Math.min(
                                        remaining,
                                        Math.max(0, Number(e.target.value) || 0)
                                      );
                                      setReceiveQtys((prev) => ({ ...prev, [line.key]: next }));
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
                    <div className="erp-field-row mt-2">
                      <label className="erp-field-label">Receiving notes</label>
                      <input
                        type="text"
                        value={receiveNotes}
                        onChange={(e) => setReceiveNotes(e.target.value)}
                        className="erp-input w-full"
                        placeholder="Optional notes"
                      />
                    </div>
                  </div>
                )}

                <div>
                  <div className="erp-titlebar mb-0 text-xs">Receivings against this PO</div>
                  <div className="overflow-x-auto border border-[var(--color-erp-border)]">
                    <table className="erp-classic-table min-w-[480px]">
                      <thead>
                        <tr>
                          <th>Receiving #</th>
                          <th>Date</th>
                          <th>Items</th>
                          <th>By</th>
                        </tr>
                      </thead>
                      <tbody>
                        {poReceivings.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="erp-muted py-6 text-center">
                              No receivings yet for this purchase order.
                            </td>
                          </tr>
                        ) : (
                          poReceivings.map((rcv) => (
                            <tr key={rcv.id}>
                              <td className="erp-strong">{rcv.receiving_number}</td>
                              <td>{rcv.received_date}</td>
                              <td className="text-xs">
                                {rcv.lines
                                  .map((l) => `${l.item_name} +${l.quantity} ${l.unit}`)
                                  .join(', ')}
                              </td>
                              <td>{rcv.created_by || '—'}</td>
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
            <button type="button" onClick={onBack} className="erp-btn-ghost">Cancel</button>
            <button
              type="submit"
              form="purchase-order-form"
              className="erp-btn-primary erp-btn-save"
              disabled={saving || inventory.length === 0 || !vendorId || lines.length === 0}
            >
              {saving ? 'Saving…' : 'Save'}
            </button>
          </div>
        }
      />

      <RecordModal
        isOpen={vendorModalOpen}
        mode="add"
        title="Vendor"
        fields={QUICK_VENDOR_FIELDS}
        onClose={() => setVendorModalOpen(false)}
        onSave={handleAddVendor}
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
