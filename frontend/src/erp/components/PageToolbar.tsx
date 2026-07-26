import { Filter, Plus } from 'lucide-react';
import { ReactNode } from 'react';
import ExportButtons from './ExportButtons';

interface PageToolbarProps {
  onFilter?: () => void;
  onAdd?: () => void;
  addLabel?: string;
  extra?: ReactNode;
  onExportPdf?: () => void;
  onPrint?: () => void;
  exportDisabled?: boolean;
}

export default function PageToolbar({
  onFilter,
  onAdd,
  addLabel = '+ Add Item',
  extra,
  onExportPdf,
  onPrint,
  exportDisabled,
}: PageToolbarProps) {
  const showExport = onExportPdf && onPrint;

  return (
    <>
      {extra}
      {showExport && (
        <ExportButtons onExportPdf={onExportPdf} onPrint={onPrint} disabled={exportDisabled} />
      )}
      {onFilter && (
        <button type="button" onClick={onFilter} className="erp-btn-ghost flex items-center gap-1.5">
          <Filter size={14} />
          Filter
        </button>
      )}
      {onAdd && (
        <button type="button" onClick={onAdd} className="erp-btn-primary flex items-center gap-1.5">
          <Plus size={14} />
          <span className="truncate">{addLabel}</span>
        </button>
      )}
    </>
  );
}
