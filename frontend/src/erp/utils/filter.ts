import { FilterDef } from '../config/entityFields';

export function matchesSearch(row: Record<string, unknown>, query: string): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return Object.values(row).some((val) => {
    if (val == null) return false;
    return String(val).toLowerCase().includes(q);
  });
}

export function matchesTextFilter(
  row: Record<string, unknown>,
  keys: string[],
  query: string
): boolean {
  const q = query.trim().toLowerCase();
  if (!q) return true;
  return keys.some((key) => String(row[key] ?? '').toLowerCase().includes(q));
}

export function matchesSelectFilter(
  row: Record<string, unknown>,
  fieldKey: string,
  filterValue: string
): boolean {
  if (!filterValue || filterValue === 'All') return true;
  return String(row[fieldKey] ?? '') === filterValue;
}

/** @deprecated Use applyFilters instead */
export function matchesFieldFilter(
  row: Record<string, unknown>,
  fieldKey: string,
  filterValue: string
): boolean {
  return matchesSelectFilter(row, fieldKey, filterValue);
}

export function applyFilters(
  row: Record<string, unknown>,
  filters: FilterDef[],
  activeFilters: Record<string, string>
): boolean {
  return filters.every((filter) => {
    const value = (activeFilters[filter.key] ?? '').trim();
    if (!value || value === 'All') return true;

    if (filter.type === 'text') {
      return matchesTextFilter(row, filter.keys ?? [filter.key], value);
    }
    return matchesSelectFilter(row, filter.key, value);
  });
}

export function hasActiveFilters(
  filters: FilterDef[],
  activeFilters: Record<string, string>
): boolean {
  return filters.some((f) => {
    const v = activeFilters[f.key] ?? '';
    return v.trim() !== '' && v !== 'All';
  });
}
