import { FileDown, Printer } from 'lucide-react';

interface ExportButtonsProps {
  onExportPdf: () => void;
  onPrint: () => void;
  disabled?: boolean;
}

export default function ExportButtons({ onExportPdf, onPrint, disabled }: ExportButtonsProps) {
  return (
    <>
      <button
        type="button"
        onClick={onExportPdf}
        disabled={disabled}
        title="Download PDF"
        className="erp-btn-ghost flex items-center gap-1.5 disabled:opacity-40"
      >
        <FileDown size={14} />
        <span>PDF</span>
      </button>
      <button
        type="button"
        onClick={onPrint}
        disabled={disabled}
        title="Print document"
        className="erp-btn-ghost flex items-center gap-1.5 disabled:opacity-40"
      >
        <Printer size={14} />
        <span>Print</span>
      </button>
    </>
  );
}
