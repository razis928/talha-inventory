import { useMemo, useState } from 'react';
import { ArrowLeft, Trash2 } from 'lucide-react';
import ScreenFrame from './ScreenFrame';
import { JobOrderApi } from '../api/jobOrders';
import { DispatchInput } from '../api/dispatch';

interface LineDraft {
  key: string;
  jobOrderLineId: number;
  itemId: number | null;
  itemName: string;
  unit: string;
  orderQty: number;
  pendingQty: number;
  dispatchQty: number;
}

interface DispatchFormPageProps {
  jobOrders: JobOrderApi[];
  onBack: () => void;
  onSave: (data: DispatchInput) => void | Promise<void>;
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export default function DispatchFormPage({
  jobOrders,
  onBack,
  onSave,
}: DispatchFormPageProps) {
  const openJobs = useMemo(
    () =>
      jobOrders.filter((job) =>
        ['Pending', 'In Progress'].includes(job.status)
        && job.lines.some((line) => line.order_pending_quantity > 0)
      ),
    [jobOrders]
  );

  const [jobId, setJobId] = useState('');
  const [lines, setLines] = useState<LineDraft[]>([]);
  const [saving, setSaving] = useState(false);

  const selectedJob = openJobs.find((job) => String(job.id) === jobId);

  const applyJob = (nextJobId: string) => {
    setJobId(nextJobId);
    const job = openJobs.find((item) => String(item.id) === nextJobId);
    if (!job) {
      setLines([]);
      return;
    }
    setLines(
      job.lines
        .filter((line) => line.order_pending_quantity > 0)
        .map((line) => ({
          key: `job-line-${line.id}`,
          jobOrderLineId: line.id,
          itemId: line.item_id,
          itemName: line.item_name,
          unit: line.unit,
          orderQty: line.order_quantity,
          pendingQty: line.order_pending_quantity,
          dispatchQty: line.order_pending_quantity,
        }))
    );
  };

  const updateLine = (key: string, patch: Partial<LineDraft>) => {
    setLines((prev) => prev.map((line) => (line.key === key ? { ...line, ...patch } : line)));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!jobId) {
      window.alert('Select a job order to dispatch against.');
      return;
    }
    const activeLines = lines.filter((line) => line.dispatchQty > 0);
    if (activeLines.length === 0) {
      window.alert('Enter dispatch quantity for at least one line.');
      return;
    }
    if (activeLines.some((line) => line.dispatchQty > line.pendingQty)) {
      window.alert('Dispatch quantity cannot exceed pending quantity.');
      return;
    }

    const fd = new FormData(e.currentTarget);
    const payload: DispatchInput = {
      pass_number: String(fd.get('passNumber') ?? ''),
      job_order_id: Number(jobId),
      dispatch_date: String(fd.get('dispatchDate') ?? todayIso()),
      vehicle_no: String(fd.get('vehicleNo') ?? ''),
      driver: String(fd.get('driver') ?? ''),
      notes: String(fd.get('notes') ?? ''),
      created_by: String(fd.get('createdBy') ?? ''),
      lines: activeLines.map((line) => ({
        job_order_line_id: line.jobOrderLineId,
        item_id: line.itemId,
        quantity: Number(line.dispatchQty),
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
      title="New Dispatch / Gate Pass"
      subtitle="Partial dispatch against a job order — pending qty decreases"
      toolbar={
        <button type="button" onClick={onBack} className="erp-btn-ghost flex items-center gap-1">
          <ArrowLeft size={14} />
          Back
        </button>
      }
      formPanel={
        <form id="dispatch-form" onSubmit={handleSubmit}>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Gate Pass #"
              name="passNumber"
              defaultValue={`GP-${Date.now().toString().slice(-6)}`}
              required
            />
            <div className="erp-field-row">
              <label className="erp-field-label">Job Order</label>
              <select
                value={jobId}
                onChange={(e) => applyJob(e.target.value)}
                required
                className="erp-classic-select w-full"
              >
                <option value="">— Select job order —</option>
                {openJobs.map((job) => (
                  <option key={job.id} value={job.id}>
                    {job.job_number} — {job.customer_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="erp-field-row">
              <label className="erp-field-label">Customer</label>
              <input
                value={selectedJob?.customer_name ?? ''}
                readOnly
                className="erp-input w-full"
                placeholder="From job order"
              />
            </div>
            <Field label="Dispatch Date" name="dispatchDate" type="date" defaultValue={todayIso()} required />
            <Field label="Vehicle No" name="vehicleNo" defaultValue="" />
            <Field label="Driver" name="driver" defaultValue="" />
            <Field label="Created By" name="createdBy" defaultValue="" />
            <Field label="Notes" name="notes" defaultValue="" />
          </div>

          <div className="mt-5 mb-2">
            <span className="erp-field-label">
              Items to dispatch (pending qty will reduce; stock will decrease)
            </span>
          </div>

          <div className="overflow-x-auto border border-[var(--color-erp-border)]">
            <table className="erp-classic-table">
              <thead>
                <tr>
                  <th>Item</th>
                  <th>UOM</th>
                  <th>Order Qty</th>
                  <th>Pending Qty</th>
                  <th>Dispatch Qty</th>
                  <th />
                </tr>
              </thead>
              <tbody>
                {lines.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="erp-muted py-6 text-center">
                      {openJobs.length === 0
                        ? 'No open job orders with pending quantity.'
                        : 'Select a job order to load pending lines.'}
                    </td>
                  </tr>
                ) : (
                  lines.map((line) => (
                    <tr key={line.key}>
                      <td className="erp-strong">{line.itemName}</td>
                      <td>{line.unit || '—'}</td>
                      <td>{line.orderQty}</td>
                      <td className="erp-cell-highlight">{line.pendingQty}</td>
                      <td>
                        <input
                          type="number"
                          min={0}
                          max={line.pendingQty}
                          value={line.dispatchQty}
                          onChange={(e) =>
                            updateLine(line.key, { dispatchQty: Number(e.target.value) || 0 })
                          }
                          className="erp-input w-28 erp-cell-highlight"
                          required
                        />
                        <span className="erp-muted ml-2 text-xs">max {line.pendingQty}</span>
                      </td>
                      <td>
                        <button
                          type="button"
                          className="erp-btn-ghost p-1"
                          onClick={() => setLines((prev) => prev.filter((l) => l.key !== line.key))}
                          title="Remove line"
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
            form="dispatch-form"
            className="erp-btn-primary erp-btn-save"
            disabled={saving || !jobId || lines.length === 0}
          >
            {saving ? 'Saving…' : 'Dispatch & update pending'}
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
