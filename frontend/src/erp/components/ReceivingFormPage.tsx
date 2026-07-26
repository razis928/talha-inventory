import { useMemo, useState } from 'react';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import ScreenFrame from './ScreenFrame';
import { InventoryItem } from '../types';
import { PurchaseOrderApi, ReceivingInput } from '../api/purchase';
import { VendorApi } from '../api/vendors';

interface LineDraft {
  key: string;
  itemId: string;
  purchaseOrderLineId: number | null;
  quantity: number;
  maxQuantity?: number;
  unit: string;
  itemName: string;
}

interface ReceivingFormPageProps {
  inventory: InventoryItem[];
  purchaseOrders: PurchaseOrderApi[];
  vendors: VendorApi[];
  onBack: () => void;
  onSave: (data: ReceivingInput) => void | Promise<void>;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function ReceivingFormPage({
  inventory,
  purchaseOrders,
  vendors,
  onBack,
  onSave,
}: ReceivingFormPageProps) {
  const openPos = useMemo(
    () =>
      purchaseOrders.filter((po) =>
        ['Pending', 'Approved', 'Partial'].includes(po.status)
        && po.lines.some((line) => line.received_quantity < line.quantity)
      ),
    [purchaseOrders]
  );

  const [poId, setPoId] = useState<string>('');
  const [vendorId, setVendorId] = useState(String(vendors[0]?.id ?? ''));
  const [lines, setLines] = useState<LineDraft[]>([]);
  const [saving, setSaving] = useState(false);

  const selectedPo = openPos.find((po) => String(po.id) === poId);

  const applyPo = (nextPoId: string) => {
    setPoId(nextPoId);
    const po = openPos.find((item) => String(item.id) === nextPoId);
    if (!po) {
      setLines([]);
      return;
    }
    if (po.vendor_id) setVendorId(String(po.vendor_id));
    setLines(
      po.lines
        .filter((line) => line.received_quantity < line.quantity)
        .map((line) => ({
          key: `po-line-${line.id}`,
          itemId: String(line.item_id),
          purchaseOrderLineId: line.id,
          quantity: line.quantity - line.received_quantity,
          maxQuantity: line.quantity - line.received_quantity,
          unit: line.unit,
          itemName: line.item_name,
        }))
    );
  };

  const addManualLine = () => {
    const item = inventory[0];
    if (!item) return;
    setLines((prev) => [
      ...prev,
      {
        key: `manual-${Date.now()}`,
        itemId: item.id,
        purchaseOrderLineId: null,
        quantity: 1,
        unit: item.unit,
        itemName: item.name,
      },
    ]);
  };

  const updateLine = (key: string, patch: Partial<LineDraft>) => {
    setLines((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (lines.length === 0) {
      window.alert('Add at least one receiving line.');
      return;
    }
    if (lines.some((line) => !line.itemId || line.quantity <= 0)) {
      window.alert('Each line needs an item and quantity greater than 0.');
      return;
    }

    const fd = new FormData(e.currentTarget);
    const payload: ReceivingInput = {
      receiving_number: String(fd.get('receivingNumber') ?? ''),
      purchase_order_id: poId ? Number(poId) : null,
      vendor_id: vendorId ? Number(vendorId) : null,
      vendor: selectedPo?.vendor ?? vendors.find((v) => String(v.id) === vendorId)?.name ?? '',
      received_date: String(fd.get('receivedDate') ?? todayIso()),
      notes: String(fd.get('notes') ?? ''),
      created_by: String(fd.get('createdBy') ?? ''),
      lines: lines.map((line) => ({
        item_id: Number(line.itemId),
        quantity: Number(line.quantity),
        purchase_order_line_id: line.purchaseOrderLineId,
      })),
    };

    try {
      setSaving(true);
      await onSave(payload);
    } finally {
      setSaving(false);
    }
  };

  return (
    <ScreenFrame
      title="Add Receiving"
      subtitle="Receive stock against a purchase order"
      toolbar={
        <button type="button" onClick={onBack} className="erp-btn-ghost flex items-center gap-1">
          <ArrowLeft size={14} />
          Back
        </button>
      }
      formPanel={
        <form id="receiving-form" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field label="Receiving Number" name="receivingNumber" defaultValue={`RCV-${Date.now().toString().slice(-6)}`} required />
            <div className="erp-field-row">
              <label className="erp-field-label">Purchase Order</label>
              <select
                value={poId}
                onChange={(e) => applyPo(e.target.value)}
                className="erp-classic-select w-full"
              >
                <option value="">— Optional / Manual —</option>
                {openPos.map((po) => (
                  <option key={po.id} value={po.id}>
                    {po.po_number} — {po.vendor}
                  </option>
                ))}
              </select>
            </div>
            <div className="erp-field-row">
              <label className="erp-field-label">Vendor</label>
              <select
                value={vendorId}
                onChange={(e) => setVendorId(e.target.value)}
                required={!selectedPo}
                disabled={Boolean(selectedPo)}
                className="erp-classic-select w-full"
              >
                {vendors.length === 0 ? (
                  <option value="">No vendors</option>
                ) : (
                  vendors.map((vendor) => (
                    <option key={vendor.id} value={vendor.id}>
                      {vendor.name} ({vendor.code})
                    </option>
                  ))
                )}
              </select>
            </div>
            <Field label="Received Date" name="receivedDate" type="date" defaultValue={todayIso()} required />
            <Field label="Created By" name="createdBy" defaultValue="" />
            <Field label="Notes" name="notes" defaultValue="" />
          </div>

          <div className="mt-5 mb-2 flex flex-wrap items-center justify-between gap-2">
            <span className="erp-field-label">Items to receive (stock will increase)</span>
            {!poId && (
              <button
                type="button"
                className="erp-btn-ghost flex items-center gap-1"
                onClick={addManualLine}
                disabled={inventory.length === 0}
              >
                <Plus size={14} />
                Add item
              </button>
            )}
          </div>

          <div className="overflow-x-auto border border-[var(--color-erp-border)]">
            <table className="erp-classic-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>Unit</th>
                  <th>Receive Qty</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {lines.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="erp-muted py-6 text-center">
                      Select a purchase order or add items manually.
                    </td>
                  </tr>
                ) : (
                  lines.map((line) => (
                    <tr key={line.key}>
                      <td>
                        {poId ? (
                          <span className="erp-strong">{line.itemName}</span>
                        ) : (
                          <select
                            value={line.itemId}
                            onChange={(e) => {
                              const item = inventory.find((i) => i.id === e.target.value);
                              updateLine(line.key, {
                                itemId: e.target.value,
                                unit: item?.unit ?? '',
                                itemName: item?.name ?? '',
                              });
                            }}
                            className="erp-classic-select w-full min-w-[180px]"
                          >
                            {inventory.map((item) => (
                              <option key={item.id} value={item.id}>
                                {item.name} ({item.sku})
                              </option>
                            ))}
                          </select>
                        )}
                      </td>
                      <td>{line.unit || '—'}</td>
                      <td>
                        <input
                          type="number"
                          min={1}
                          max={line.maxQuantity}
                          value={line.quantity}
                          onChange={(e) => updateLine(line.key, { quantity: Number(e.target.value) || 0 })}
                          className="erp-input w-28 erp-cell-highlight"
                          required
                        />
                        {line.maxQuantity != null && (
                          <span className="erp-muted ml-2 text-xs">max {line.maxQuantity}</span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          className="erp-btn-ghost p-1"
                          onClick={() => setLines((prev) => prev.filter((l) => l.key !== line.key))}
                        >
                          <Trash2 size={14} />
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </form>
      }
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={onBack} className="erp-btn-ghost">Cancel</button>
          <button
            type="submit"
            form="receiving-form"
            className="erp-btn-primary erp-btn-save"
            disabled={saving || lines.length === 0}
          >
            {saving ? 'Saving…' : 'Receive & update stock'}
          </button>
        </div>
      }
    />
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
  defaultValue: string;
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
