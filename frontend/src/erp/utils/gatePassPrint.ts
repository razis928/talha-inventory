import { DispatchApi } from '../api/dispatch';
import { JobOrderApi } from '../api/jobOrders';
import { exportGatePassPdf, GatePassPrintOptions, printGatePassDocument } from '../utils/pdfExport';

export function buildGatePassPrintOptions(
  gp: DispatchApi,
  jobOrders: JobOrderApi[] = []
): GatePassPrintOptions {
  const job = jobOrders.find((j) => j.id === gp.job_order_id);
  const poNumber = gp.job_number || job?.job_number || '—';

  return {
    passNumber: gp.pass_number,
    date: gp.dispatch_date,
    customerName: gp.customer_name,
    jobNumber: poNumber,
    vehicleNo: gp.vehicle_no,
    driver: gp.driver,
    notes: gp.notes,
    lines: gp.lines.map((line) => {
      const jobLine = job?.lines.find((l) => l.id === line.job_order_line_id);
      return {
        poNumber,
        itemName: line.item_name,
        size: jobLine?.size || '—',
        qty: line.quantity,
      };
    }),
  };
}

export function printIndividualGatePass(gp: DispatchApi, jobOrders: JobOrderApi[] = []) {
  printGatePassDocument(buildGatePassPrintOptions(gp, jobOrders));
}

export async function downloadIndividualGatePassPdf(
  gp: DispatchApi,
  jobOrders: JobOrderApi[] = []
) {
  await exportGatePassPdf(buildGatePassPrintOptions(gp, jobOrders));
}
