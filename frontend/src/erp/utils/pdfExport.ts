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

export interface GatePassPrintLine {
  poNumber: string;
  itemName: string;
  size: string;
  qty: string | number;
}

export interface GatePassPrintOptions {
  passNumber: string;
  date: string;
  customerName: string;
  jobNumber?: string;
  vehicleNo?: string;
  driver?: string;
  notes?: string;
  lines: GatePassPrintLine[];
  /** When true, also download a PDF via jsPDF */
  downloadPdf?: boolean;
}

function buildGatePassPrintHtml(options: GatePassPrintOptions): string {
  const rows = options.lines
    .map(
      (line, i) =>
        `<tr class="${i % 2 === 0 ? 'row-even' : 'row-odd'}">
          <td>${escapeHtml(line.poNumber || '—')}</td>
          <td>${escapeHtml(line.itemName || '—')}</td>
          <td>${escapeHtml(String(line.size || '—'))}</td>
          <td>${escapeHtml(String(line.qty ?? '—'))}</td>
        </tr>`
    )
    .join('');

  const metaBits = [
    ['Gate Pass #', options.passNumber],
    ['Date', options.date],
    ['Customer', options.customerName],
    ['PO #', options.jobNumber || '—'],
    ['Vehicle', options.vehicleNo || '—'],
    ['Driver', options.driver || '—'],
  ];

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <title>Gate Pass ${escapeHtml(options.passNumber)}</title>
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
      max-width: 820px;
      margin: 0 auto;
      background: #fff;
      border: 1px solid #e8ecf1;
      border-radius: 12px;
      overflow: hidden;
    }
    .doc-header {
      background: linear-gradient(135deg, #1a1c23 0%, #2d3340 60%, #475569 100%);
      color: #fff;
      padding: 24px 32px;
    }
    .doc-company {
      font-size: 12px;
      font-weight: 700;
      letter-spacing: 0.4px;
      color: #cbd5e1;
      text-transform: uppercase;
      margin-bottom: 6px;
    }
    .doc-header h1 {
      font-size: 22px;
      font-weight: 700;
      margin-bottom: 4px;
    }
    .doc-header-sub { font-size: 12px; color: #cbd5e1; }
    .accent-bar { height: 3px; background: linear-gradient(90deg, #1a1c23, #94a3b8); }
    .doc-body { padding: 28px 32px 36px; }
    .meta-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 12px;
      margin-bottom: 22px;
    }
    .meta-card {
      background: #f8f9fb;
      border: 1px solid #e8ecf1;
      border-radius: 8px;
      padding: 10px 14px;
    }
    .meta-label {
      font-size: 10px;
      text-transform: uppercase;
      letter-spacing: 0.7px;
      color: #64748b;
      font-weight: 600;
      margin-bottom: 4px;
    }
    .meta-value { font-size: 13px; font-weight: 600; color: #1a1c23; }
    .notes {
      margin-bottom: 18px;
      font-size: 12px;
      color: #64748b;
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
    }
    tbody tr.row-even { background: #fff; }
    tbody tr.row-odd { background: #f8f9fb; }
    tbody tr:last-child td { border-bottom: none; }
    .signatures {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 48px;
      margin-top: 56px;
      padding-top: 8px;
    }
    .sig-block { text-align: left; }
    .sig-line {
      border-bottom: 1px solid #1a1c23;
      height: 40px;
      margin-bottom: 8px;
    }
    .sig-label {
      font-size: 12px;
      font-weight: 600;
      color: #1a1c23;
    }
    .footer {
      margin-top: 28px;
      padding-top: 14px;
      border-top: 1px solid #e8ecf1;
      font-size: 11px;
      color: #64748b;
      display: flex;
      justify-content: space-between;
    }
    @media print {
      body { background: #fff; padding: 0; }
      .page { box-shadow: none; border-radius: 0; border: none; }
      .doc-header, thead th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="page">
    <div class="doc-header">
      <div class="doc-company">${escapeHtml(COMPANY_BRAND.name)}</div>
      <h1>Gate Pass</h1>
      <div class="doc-header-sub">${escapeHtml(options.passNumber)} · ${escapeHtml(options.date)}</div>
    </div>
    <div class="accent-bar"></div>
    <div class="doc-body">
      <div class="meta-grid">
        ${metaBits
          .map(
            ([label, value]) =>
              `<div class="meta-card"><div class="meta-label">${escapeHtml(label)}</div><div class="meta-value">${escapeHtml(String(value))}</div></div>`
          )
          .join('')}
      </div>
      ${
        options.notes
          ? `<p class="notes"><strong>Notes:</strong> ${escapeHtml(options.notes)}</p>`
          : ''
      }
      <table>
        <thead>
          <tr>
            <th>PO#</th>
            <th>Item Name</th>
            <th>Size</th>
            <th>Qty</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="4">No items</td></tr>'}</tbody>
      </table>
      <div class="signatures">
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-label">Signature by</div>
        </div>
        <div class="sig-block">
          <div class="sig-line"></div>
          <div class="sig-label">Received by</div>
        </div>
      </div>
      <div class="footer">
        <span>${escapeHtml(COMPANY_BRAND.name)}</span>
        <span>${escapeHtml(formatDocDate())}</span>
      </div>
    </div>
  </div>
  <script>
    window.onload = () => { window.print(); window.onafterprint = () => window.close(); };
  </script>
</body>
</html>`;
}

export function printGatePassDocument(options: GatePassPrintOptions) {
  const html = buildGatePassPrintHtml(options);
  const win = window.open('', '_blank');
  if (!win) {
    alert('Please allow pop-ups to print documents.');
    return;
  }
  win.document.write(html);
  win.document.close();
}

export async function exportGatePassPdf(options: GatePassPrintOptions) {
  const [{ default: jsPDF }, { default: autoTable }] = await Promise.all([
    import('jspdf'),
    import('jspdf-autotable'),
  ]);

  const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 14;

  doc.setFillColor(...C.headerBg);
  doc.rect(0, 0, pageWidth, 32, 'F');
  doc.setFillColor(...C.accentBar);
  doc.rect(0, 32, pageWidth, 2, 'F');

  doc.setTextColor(...C.headerSub);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text(COMPANY_BRAND.name, margin, 10);

  doc.setTextColor(...C.white);
  doc.setFontSize(16);
  doc.text('Gate Pass', margin, 18);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(...C.headerSub);
  doc.text(`${options.passNumber}  ·  ${options.date}`, margin, 26);

  const meta = [
    ['Customer', options.customerName || '—'],
    ['PO #', options.jobNumber || '—'],
    ['Vehicle', options.vehicleNo || '—'],
    ['Driver', options.driver || '—'],
  ];

  let y = 42;
  const cardW = (pageWidth - margin * 2 - 6) / 2;
  meta.forEach((pair, i) => {
    const col = i % 2;
    const row = Math.floor(i / 2);
    const x = margin + col * (cardW + 6);
    const cy = y + row * 14;
    doc.setFillColor(...C.bg);
    doc.setDrawColor(...C.border);
    doc.roundedRect(x, cy, cardW, 12, 2, 2, 'FD');
    doc.setFontSize(7);
    doc.setTextColor(...C.muted);
    doc.text(pair[0].toUpperCase(), x + 3, cy + 4.5);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...C.text);
    doc.text(pair[1], x + 3, cy + 9.5);
    doc.setFont('helvetica', 'normal');
  });

  y += 32;
  if (options.notes) {
    doc.setFontSize(9);
    doc.setTextColor(...C.muted);
    doc.text(`Notes: ${options.notes}`, margin, y);
    y += 8;
  }

  autoTable(doc, {
    startY: y,
    head: [['PO#', 'Item Name', 'Size', 'Qty']],
    body: options.lines.map((line) => [
      line.poNumber || '—',
      line.itemName || '—',
      String(line.size || '—'),
      String(line.qty ?? '—'),
    ]),
    styles: {
      fontSize: 9,
      cellPadding: 3.5,
      lineColor: C.border,
      lineWidth: 0.15,
      textColor: C.text,
    },
    headStyles: {
      fillColor: C.headerBg,
      textColor: C.white,
      fontStyle: 'bold',
      fontSize: 8,
    },
    alternateRowStyles: { fillColor: C.bg },
    margin: { left: margin, right: margin },
  });

  const finalY = Math.max(
    (doc as unknown as { lastAutoTable?: { finalY: number } }).lastAutoTable?.finalY ?? y + 40,
    y + 40
  );
  let sigY = finalY + 28;
  if (sigY > pageHeight - 40) {
    doc.addPage();
    sigY = 40;
  }

  const sigW = (pageWidth - margin * 2 - 30) / 2;
  doc.setDrawColor(...C.text);
  doc.setLineWidth(0.4);
  doc.line(margin, sigY, margin + sigW, sigY);
  doc.line(margin + sigW + 30, sigY, pageWidth - margin, sigY);
  doc.setFontSize(10);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(...C.text);
  doc.text('Signature by', margin, sigY + 7);
  doc.text('Received by', margin + sigW + 30, sigY + 7);

  doc.save(`gate-pass-${options.passNumber}.pdf`);
}
