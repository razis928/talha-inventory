import { FilterDef } from '../config/entityFields';

interface FilterPanelProps {
  filters: FilterDef[];
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  onClear: () => void;
}

export default function FilterPanel({ filters, values, onChange, onClear }: FilterPanelProps) {
  const hasValues = filters.some((f) => {
    const v = values[f.key] ?? '';
    return v.trim() !== '' && v !== 'All';
  });

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {filters.map((filter) => (
        <div key={filter.key} className="erp-field-row">
          <label className="erp-field-label">{filter.label}</label>
          {filter.type === 'text' ? (
            <input
              type="text"
              value={values[filter.key] ?? ''}
              onChange={(e) => onChange(filter.key, e.target.value)}
              placeholder={filter.placeholder ?? `Search ${filter.label.toLowerCase()}...`}
              className="erp-input w-full"
            />
          ) : (
            <select
              value={values[filter.key] ?? 'All'}
              onChange={(e) => onChange(filter.key, e.target.value)}
              className="erp-classic-select w-full"
            >
              {(filter.options ?? ['All']).map((opt) => (
                <option key={opt} value={opt}>{opt}</option>
              ))}
            </select>
          )}
        </div>
      ))}
      {hasValues && (
        <div className="flex items-end">
          <button type="button" onClick={onClear} className="erp-btn-ghost text-red-700 dark:text-red-400">
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
