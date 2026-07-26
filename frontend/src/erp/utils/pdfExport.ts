import { COMPANY_BRAND } from '../config/companyBrand';
import { formatPkr, formatPkrPrice, isCurrencyField } from './currency';
import { formatQuantityPcs, formatSizeWithUnit, formatTaxPercent } from './displayFormat';

export interface PdfColumn {
  key: string;
  header: string;
}

/** Light-mode ERP palette — black, gray, white */
const C = {
  text: [26, 28, 35] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  headerBg: [26, 28, 35] as [number, number, number],
  headerSub: [203, 213, 225] as [number, number, number],
  accentBar: [71, 85, 105] as [number, number, number],
  bg: [248, 249, 251] as [number, number, number],
  surface: [255, 255, 255] as [number, number, number],
  border: [232, 236, 241] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
};

export function getPdfCellValue(row: Record<string, unknown>, key: string): string {
  if (key === 'party') return String(row.vendor ?? row.customer ?? '');
  if (key === 'sizeDisplay') return formatSizeWithUnit(row);
  if (key === 'tax') return formatTaxPercent(row.tax);
  if (key === 'quantityPcs') return formatQuantityPcs(row.quantityPcs);
  const val = row[key];
  if (val == null) return '—';
  if (typeof val === 'number') {
    if (isCurrencyField(key)) {
      return ['costPrice', 'sellingPrice'].includes(key) ? formatPkrPrice(val) : formatPkr(val);
    }
    return String(val);
  }
  return String(val);
}

function formatDocDate(): string {
  return new Date().toLocaleString('en-PK', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

function drawPdfHeader(
  doc: import('jspdf').jsPDF,
  pageWidth: number,
  title: string,
  subtitle: string | undefined,
  recordCount: number
): number {
  const margin = 14;
  const headerH = 38;

  doc.setFillColor(...C.headerBg);
  doc.rect(0, 0, pageWidth, headerH, 'F');
  doc.setFillColor(...C.accentBar);
  doc.rect(0, headerH, pageWidth, 2, 'F');

  doc.setTextColor(...C.headerSub);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(COMPANY_BRAND.name, margin, 10);

  doc.setTextColor(...C.white);
  doc.setFontSize(15);
  doc.text(title, margin, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.headerSub);
  doc.text(formatDocDate(), pageWidth - margin, 10, { align: 'right' });

  if (subtitle) {
    doc.setFontSize(9);
    doc.text(subtitle, margin, 25);
  }

  doc.setFontSize(8);
  doc.text(`${recordCount} record${recordCount !== 1 ? 's' : ''}`, pageWidth - margin, 18, { align: 'right' });

  let y = headerH + 12;

  const cardH = 11;
  const cardW = (pageWidth - margin * 2 - 8) / 2;

  const cards = [
    { label: 'Generated On', value: formatDocDate() },
    { label: 'Total Records', value: String(recordCount) },
  ];

  cards.forEach((card, i) => {
    const x = margin + i * (cardW + 8);
    doc.setFillColor(...C.bg);
    doc.setDrawColor(...C.border);
    doc.roundedRect(x, y, cardW, cardH, 2, 2, 'FD');

    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(...C.muted);
    doc.text(card.label.toUpperCase(), x + 4, y + 4.5);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.text);
    doc.text(card.value, x + 4, y + 9);
  });

  return y + cardH + 10;
}

function drawPdfFooter(
  doc: import('jspdf').jsPDF,
  pageWidth: number,
  pageHeight: number,
  pageNum: number,
  pageCount: number
) {
  const margin = 14;
  const footerY = pageHeight - 10;

  doc.setDrawColor(...C.border);
  doc.setLineWidth(0.3);
  doc.line(margin, footerY - 5, pageWidth - margin, footerY - 5);

  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.text);
  doc.text(COMPANY_BRAND.name, margin, footerY);

  doc.setFont('helvetica', 'normal');
  doc.setTextColor(...C.muted);
  doc.text(`Page ${pageNum} of ${pageCount}  ·  Confidential`, pageWidth - margin, footerY, { align: 'right' });
}

export async function exportToPdf(options: {
  title: string;
  subtitle?: string;
  companyName?: string;
  columns: PdfColumn[];
  rows: Record<string, unknown>[];
  filename: string;
}) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc = new jsPDF({ orientation: 'landscape', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  const tableStartY = drawPdfHeader(
    doc,
    pageWidth,
    options.title,
    options.subtitle,
    options.rows.length
  );

  autoTable(doc, {
    startY: tableStartY,
    head: [options.columns.map((c) => c.header)],
    body: options.rows.map((row) => options.columns.map((c) => getPdfCellValue(row, c.key))),
    styles: {
      fontSize: 8.5,
      cellPadding: { top: 4, right: 4, bottom: 4, left: 4 },
      lineColor: C.border,
      lineWidth: 0.15,
      textColor: C.text,
      font: 'helvetica',
    },
    headStyles: {
      fillColor: C.headerBg,
      textColor: C.white,
      fontStyle: 'bold',
      fontSize: 8,
      cellPadding: { top: 5, right: 4, bottom: 5, left: 4 },
    },
    alternateRowStyles: { fillColor: C.bg },
    margin: { left: margin, right: margin, bottom: 18 },
    didDrawPage: (data) => {
      drawPdfFooter(doc, pageWidth, pageHeight, data.pageNumber, doc.getNumberOfPages());
    },
  });

  doc.save(`${options.filename}.pdf`);
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function buildPrintHtml(options: {
  title: string;
  subtitle?: string;
  columns: PdfColumn[];
  rows: Record<string, unknown>[];
}): string {
  const headers = options.columns.map((c) => c.header);
  const bodyRows = options.rows
    .map(
      (row, i) =>
        `<tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">${options.columns
          .map((c) => `<td>${escapeHtml(getPdfCellValue(row, c.key))}</td>`)
          .join('')}</tr>`
    )
    .join('');

  const subtitleBlock = options.subtitle
    ? `<p class="doc-subtitle">${escapeHtml(options.subtitle)}</p>`
    : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>${escapeHtml(options.title)}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Inter', Arial, sans-serif;
      color: #1a1c23;
      background: #f8f9fb;
      padding: 24px;
    }
    .page {
      max-width: 1100px;
      margin: 0 auto;
      background: #fff;
      border-radius: 12px;
      overflow: hidden;
      box-shadow: 0 4px 24px rgba(15, 23, 42, 0.06);
      border: 1px solid #e8ecf1;
    }
    .doc-header {
      background: linear-gradient(135deg, #1a1c23 0%, #2d3340 60%, #475569 100%);
      color: #fff;
      padding: 28px 36px 22px;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      gap: 24px;
    }
    .doc-company {
      font-size: 13px;
      font-weight: 700;
      letter-spacing: 0.3px;
      color: #cbd5e1;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .doc-header-left h1 {
      font-size: 24px;
      font-weight: 700;
      letter-spacing: -0.4px;
      margin-bottom: 4px;
    }
    .doc-header-sub {
      font-size: 12px;
      color: #cbd5e1;
      font-weight: 400;
    }
    .doc-header-right {
      text-align: right;
      font-size: 12px;
      color: #cbd5e1;
    }
    .doc-header-right .count {
      font-size: 13px;
      font-weight: 600;
      color: #fff;
      margin-bottom: 4px;
    }
    .accent-bar {
      height: 3px;
      background: linear-gradient(90deg, #1a1c23, #94a3b8);
    }
    .doc-body { padding: 28px 36px 32px; }
    .doc-subtitle {
      font-size: 13px;
      color: #64748b;
      margin-bottom: 20px;
    }
    .meta-row {
      display: flex;
      gap: 16px;
      margin-bottom: 24px;
      flex-wrap: wrap;
    }
    .meta-card {
      background: #f8f9fb;
      border: 1px solid #e8ecf1;
      border-radius: 8px;
      padding: 12px 18px;
      min-width: 180px;
      flex: 1;
    }
    .meta-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.8px;
      color: #64748b;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .meta-value {
      font-size: 14px;
      font-weight: 600;
      color: #1a1c23;
    }
    table {
      width: 100%;
      border-collapse: separate;
      border-spacing: 0;
      font-size: 12px;
      border: 1px solid #e8ecf1;
      border-radius: 8px;
      overflow: hidden;
    }
    thead th {
      background: #1a1c23;
      color: #fff;
      padding: 11px 14px;
      text-align: left;
      font-weight: 600;
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.6px;
    }
    tbody td {
      padding: 10px 14px;
      border-bottom: 1px solid #e8ecf1;
      color: #1a1c23;
    }
    tbody tr.row-even { background: #fff; }
    tbody tr.row-odd { background: #f8f9fb; }
    tbody tr:last-child td { border-bottom: none; }
    .footer {
      margin-top: 32px;
      padding-top: 16px;
      border-top: 1px solid #e8ecf1;
      display: flex;
      justify-content: space-between;
      align-items: center;
      font-size: 11px;
    }
    .footer-company {
      font-weight: 700;
      color: #1a1c23;
    }
    .footer-note {
      color: #64748b;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .page { box-shadow: none; border-radius: 0; border: none; }
      .doc-header { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      thead th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="doc-header">
      <div class="doc-header-left">
        <div class="doc-company">${escapeHtml(COMPANY_BRAND.name)}</div>
        <h1>${escapeHtml(options.title)}</h1>
        ${options.subtitle ? `<div class="doc-header-sub">${escapeHtml(options.subtitle)}</div>` : ''}
      </div>
      <div class="doc-header-right">
        <div class="count">${options.rows.length} record${options.rows.length !== 1 ? 's' : ''}</div>
        <div>${escapeHtml(formatDocDate())}</div>
      </div>
    </div>
    <div class="accent-bar"></div>
    <div class="doc-body">
      ${subtitleBlock}
      <div class="meta-row">
        <div class="meta-card">
          <div class="meta-label">Generated On</div>
          <div class="meta-value">${escapeHtml(formatDocDate())}</div>
        </div>
        <div class="meta-card">
          <div class="meta-label">Total Records</div>
          <div class="meta-value">${options.rows.length}</div>
        </div>
        <div class="meta-card">
          <div class="meta-label">Document Type</div>
          <div class="meta-value">${escapeHtml(options.title)}</div>
        </div>
      </div>
      <table>
        <thead><tr>${headers.map((h) => `<th>${escapeHtml(h)}</th>`).join('')}</tr></thead>
        <tbody>${bodyRows}</tbody>
      </table>
      <div class="footer">
        <span class="footer-company">${escapeHtml(COMPANY_BRAND.name)}</span>
        <span class="footer-note">Confidential Document</span>
      </div>
    </div>
  </div>
  <script>
    window.onload = () => { window.print(); window.onafterprint = () => window.close(); };
  </script>
</body>
</html>`;
}

export function printTableDocument(options: {
  title: string;
  subtitle?: string;
  columns: PdfColumn[];
  rows: Record<string, unknown>[];
}) {
  const html = buildPrintHtml(options);
  const win = window.open('', '_blank');
  if (!win) {
    alert('Please allow pop-ups to print documents.');
    return;
  }
  win.document.write(html);
  win.document.close();
}
