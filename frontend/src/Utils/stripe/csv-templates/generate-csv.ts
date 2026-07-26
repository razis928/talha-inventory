// import { asBlob, generateCsv, mkConfig } from 'export-to-csv';
// import { AcceptedData } from 'export-to-csv/output/lib/types';

// export async function generateCSV(
//   jsonData: { [k: string]: AcceptedData; [k: number]: AcceptedData }[],
// ): Promise<Blob> {
//   const csvConfig = mkConfig({
//     useKeysAsHeaders: true,
//   });

//   const csv = generateCsv(csvConfig)(jsonData);
//   const blob = asBlob(csvConfig)(csv);

//   return blob;
// }

import Papa from 'papaparse';

export async function generateCSV(
  jsonData: { [key: string]: string | number | boolean }[], // Adjusted type to match typical JSON data for CSV
): Promise<Blob> {
  // Convert JSON data to CSV using PapaParse
  const csvString = Papa.unparse(jsonData, {
    header: true,
    skipEmptyLines: true,
    quotes: true,
  });

  // Convert CSV string to Blob for file storage
  const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });

  return blob;
}
