import { ArrowLeft } from 'lucide-react';
import { FieldDef } from '../config/entityFields';
import ScreenFrame from './ScreenFrame';

interface RecordFormPageProps {
  mode: 'add' | 'edit';
  title: string;
  subtitle?: string;
  fields: FieldDef[];
  record?: Record<string, unknown>;
  onBack: () => void;
  onSave: (data: Record<string, unknown>) => void;
}

function parseValue(field: FieldDef, raw: FormDataEntryValue | null): string | number {
  if (field.type === 'number') return Number(raw) || 0;
  return String(raw ?? '');
}

export default function RecordFormPage({
  mode,
  title,
  subtitle,
  fields,
  record,
  onBack,
  onSave,
}: RecordFormPageProps) {
  const formId = `record-form-${title.replace(/\s+/g, '-').toLowerCase()}`;
  const screenTitle = mode === 'add' ? `Add ${title}` : `Edit ${title}`;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {};
    fields.forEach((field) => {
      data[field.key] = parseValue(field, fd.get(field.key));
    });
    onSave(data);
  };

  const isQtyField = (key: string) => /qty|quantity|stock|amount|gsm/i.test(key);

  return (
    <ScreenFrame
      title={screenTitle}
      subtitle={subtitle ?? title}
      toolbar={
        <button type="button" onClick={onBack} className="erp-btn-ghost flex items-center gap-1">
          <ArrowLeft size={14} />
          Back
        </button>
      }
      formPanel={
        <form id={formId} onSubmit={handleSubmit}>
          <div className="mb-2 flex flex-wrap items-center gap-4">
            <span className="erp-accent-red text-sm">LOCAL</span>
            <span className="erp-field-label">Party Type</span>
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {fields.map((field) => {
              const defaultVal = record?.[field.key] ?? (field.type === 'number' ? 0 : '');
              const highlight = isQtyField(field.key);
              return (
                <div key={field.key} className="erp-field-row">
                  <label className="erp-field-label">{field.label}</label>
                  {field.type === 'select' ? (
                    <select
                      name={field.key}
                      defaultValue={String(defaultVal)}
                      required={field.required}
                      className="erp-classic-select w-full"
                    >
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
                      className={`erp-input w-full ${highlight ? 'erp-cell-highlight' : ''}`}
                    />
                  )}
                </div>
              );
            })}
          </div>
        </form>
      }
      footer={
        <div className="flex w-full flex-wrap items-center justify-between gap-2">
          <button type="button" onClick={onBack} className="erp-btn-ghost">Cancel</button>
          <button type="submit" form={formId} className="erp-btn-primary erp-btn-save">Save</button>
        </div>
      }
    />
  );
}
