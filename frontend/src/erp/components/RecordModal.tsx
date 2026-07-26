import { X } from 'lucide-react';
import { FieldDef } from '../config/entityFields';

interface RecordModalProps {
  isOpen: boolean;
  mode: 'add' | 'edit';
  title: string;
  fields: FieldDef[];
  record?: Record<string, unknown>;
  onClose: () => void;
  onSave: (data: Record<string, unknown>) => void;
}

function parseValue(field: FieldDef, raw: FormDataEntryValue | null): string | number | boolean {
  if (field.type === 'number') return Number(raw) || 0;
  if (field.type === 'checkbox') return raw === 'on' || raw === 'true';
  return String(raw ?? '');
}

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function fieldDefault(field: FieldDef, record?: Record<string, unknown>) {
  const existing = record?.[field.key];
  if (existing !== undefined && existing !== null && existing !== '') return existing;
  if (field.type === 'number') return 0;
  if (field.type === 'date') return todayIso();
  if (field.type === 'checkbox') return false;
  return '';
}

const FORM_ID = 'record-modal-form';

export default function RecordModal({
  isOpen,
  mode,
  title,
  fields,
  record,
  onClose,
  onSave,
}: RecordModalProps) {
  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    fields.forEach((field) => {
      data[field.key] = parseValue(field, fd.get(field.key));
    });
    onSave(data);
  };

  const modalTitle = mode === 'add' ? `Add ${title}` : `Edit ${title}`;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="erp-document relative max-h-[90vh] w-full max-w-lg overflow-y-auto">
        <div className="erp-titlebar flex items-center justify-between pr-2">
          <span>{modalTitle}</span>
          <button type="button" onClick={onClose} className="p-0.5"><X size={16} /></button>
        </div>

        <form id={FORM_ID} onSubmit={handleSubmit} className="erp-form-panel space-y-3">
          {fields.map((field) => {
            const defaultVal = fieldDefault(field, record);
            if (field.type === 'checkbox') {
              return (
                <div key={field.key} className="erp-field-row flex items-center gap-2">
                  <input
                    id={`field-${field.key}`}
                    name={field.key}
                    type="checkbox"
                    defaultChecked={Boolean(defaultVal)}
                    className="erp-input h-4 w-4"
                  />
                  <label htmlFor={`field-${field.key}`} className="erp-field-label mb-0">
                    {field.label}
                  </label>
                </div>
              );
            }
            return (
              <div key={field.key} className="erp-field-row">
                <label className="erp-field-label">{field.label}</label>
                {field.type === 'select' ? (
                  <select name={field.key} defaultValue={String(defaultVal)} required={field.required} className="erp-classic-select w-full">
                    {field.options?.map((opt) => {
                      const value = typeof opt === 'string' ? opt : opt.value;
                      const label = typeof opt === 'string' ? opt : opt.label;
                      return (
                        <option key={value} value={value}>{label}</option>
                      );
                    })}
                  </select>
                ) : (
                  <input
                    name={field.key}
                    type={field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type === 'email' ? 'email' : 'text'}
                    defaultValue={String(defaultVal)}
                    required={field.required}
                    step={field.type === 'number' ? 'any' : undefined}
                    className="erp-input w-full"
                  />
                )}
              </div>
            );
          })}
        </form>

        <div className="erp-toolbar flex justify-between">
          <button type="button" onClick={onClose} className="erp-btn-ghost">Cancel</button>
          <button type="submit" form={FORM_ID} className="erp-btn-primary erp-btn-save">
            {mode === 'add' ? 'Add' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}
