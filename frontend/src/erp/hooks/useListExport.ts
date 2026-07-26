import { useCallback } from 'react';
import { PdfColumn, exportToPdf, printTableDocument } from '../utils/pdfExport';

interface UseListExportOptions {
  title: string;
  subtitle?: string;
  filename: string;
  columns: PdfColumn[];
  data: Record<string, unknown>[];
}

export function useListExport({ title, subtitle, filename, columns, data }: UseListExportOptions) {
  const handleExportPdf = useCallback(() => {
    if (data.length === 0) return;
    void exportToPdf({ title, subtitle, columns, rows: data, filename });
  }, [title, subtitle, filename, columns, data]);

  const handlePrint = useCallback(() => {
    if (data.length === 0) return;
    printTableDocument({ title, subtitle, columns, rows: data });
  }, [title, subtitle, columns, data]);

  return { handleExportPdf, handlePrint, hasData: data.length > 0 };
}
