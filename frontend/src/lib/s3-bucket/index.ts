import { PutObjectCommand } from '@aws-sdk/client-s3';
import Papa from 'papaparse';

import { fetchCSVFromS3 } from '@/lib/s3-bucket/csv';

import { s3Client } from '@/config/aws-config';
import { FILES3_BUCKET_NAME } from '@/config/env-config';

import { CSVTransaction } from '@/types/transactions';

export const updateCSVInS3 = async (
  key: string,
  newData: CSVTransaction[],
  updateRecord: boolean,
) => {
  if (!FILES3_BUCKET_NAME) {
    throw new Error('FILES3_BUCKET_NAME is not defined');
  }

  try {
    // Step 1: Fetch existing CSV data
    const existingData =
      ((await fetchCSVFromS3(key)) as CSVTransaction[]) || [];

    // Step 2: Check for duplicate records in new data
    const hasDuplicates = newData.some((newItem) =>
      existingData.some(
        (item) =>
          Math.abs(+newItem.amount) === Math.abs(+item.amount) &&
          newItem.invoice_number === item.invoice_number &&
          newItem.company_name === item.company_name &&
          newItem.invoice_date === item.invoice_date &&
          JSON.stringify(newItem.line_items) ===
            JSON.stringify(item.line_items),
      ),
    );

    if (hasDuplicates && !updateRecord) {
      throw new Error(
        'Duplicate invoice detected: Company Name, Amount, Invoice Number, Invoice Date, and Purchase Items must be unique.',
      );
    }

    // Step 3: Update existing records with matching IDs
    const updatedData = existingData.map((item) => {
      const match = newData.find((newItem) => newItem.id === item.id);
      return match || item; // Replace with new data if matched, otherwise keep old
    });

    // Step 4: Combine updated data with non-matching new records
    const nonMatchingNewData = newData.filter(
      (newItem) => !existingData.some((item) => item.id === newItem.id),
    );
    const finalData = [...updatedData, ...nonMatchingNewData];

    // Step 5: Convert updated data back to CSV format
    const csvString = Papa.unparse(finalData);

    // Step 6: Upload the updated CSV back to S3
    const command = new PutObjectCommand({
      Bucket: FILES3_BUCKET_NAME,
      Key: key,
      Body: csvString,
      ContentType: 'text/csv',
    });

    const result = await s3Client.send(command);
    return result;
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message);
  }
};

export const generateAndUploadCSV = async (
  key: string,
  newData: CSVTransaction[],
) => {
  const updatedData = newData;
  const csvString = Papa.unparse(updatedData);
  const command = new PutObjectCommand({
    Bucket: FILES3_BUCKET_NAME,
    Key: key,
    Body: csvString,
    ContentType: 'text/csv',
  });
  try {
    await s3Client.send(command);
  } catch (error) {
    return error;
  }
};
