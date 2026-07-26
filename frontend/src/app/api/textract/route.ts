import {
  ExpenseDocument,
  GetExpenseAnalysisCommand,
  StartExpenseAnalysisCommand,
  StartExpenseAnalysisCommandInput,
} from '@aws-sdk/client-textract';
import { TextractClient } from '@aws-sdk/client-textract';
import { NextResponse } from 'next/server';

import { deleteS3File, uploadFile } from '@/lib/s3-bucket/file-upload';

import {
  FILES3_ACCESS_KEY_ID,
  FILES3_BUCKET_NAME,
  FILES3_REGION,
  FILES3_SECRET_ACCESS_KEY,
} from '@/config/env-config';

// Initialize the Textract client
const textractClient = new TextractClient({
  region: FILES3_REGION as string,
  credentials: {
    accessKeyId: FILES3_ACCESS_KEY_ID as string,
    secretAccessKey: FILES3_SECRET_ACCESS_KEY as string,
  },
});
// Function to start the asynchronous expense analysis
async function startExpenseAnalysis(bucketName: string, documentKey: string) {
  const startParams: StartExpenseAnalysisCommandInput = {
    DocumentLocation: {
      S3Object: {
        Bucket: bucketName,
        Name: documentKey,
      },
    },
  };
  const startCommand = new StartExpenseAnalysisCommand(startParams);
  try {
    const startResponse = await textractClient.send(startCommand);
    return startResponse.JobId as string;
  } catch (error) {
    return error;
  }
}
// Function to get the expense analysis results using the job ID
async function getExpenseAnalysisResults(jobId: string) {
  const getCommand = new GetExpenseAnalysisCommand({ JobId: jobId });
  try {
    // Poll until the job completes
    let jobStatus = 'IN_PROGRESS';
    // let pageCount = 1;
    const expenseDocuments: ExpenseDocument[] = []; // Collect results here
    while (jobStatus === 'IN_PROGRESS') {
      const getResponse = await textractClient.send(getCommand);
      jobStatus = getResponse.JobStatus!;
      if (jobStatus === 'SUCCEEDED') {
        // Collect all pages of results
        if (getResponse.ExpenseDocuments) {
          expenseDocuments.push(...getResponse.ExpenseDocuments);
        }
        // Check if there are more pages of results
        if (getResponse.NextToken) {
          getCommand.input.NextToken = getResponse.NextToken;
          // pageCount++;
        } else {
          return expenseDocuments;
        }
      } else if (jobStatus === 'FAILED') {
        throw new Error('Expense analysis job failed');
      } else {
        // If still in progress, wait and retry
        await new Promise((resolve) => setTimeout(resolve, 5000));
      }
    }
  } catch (error) {
    return error;
  }
}

type LineItem = {
  ITEM?: string;
  QUANTITY?: string;
  UNIT_PRICE?: string;
  PRODUCT_CODE?: string;
  PRICE?: string;
  [key: string]: string | undefined; // Allows dynamic keys for line item fields
};

// Type for processed data items
type ProcessedDataItem = {
  Type?: string;
  Value?: string;
  Text?: string;
};

// Matched data structure
type MatchedData = {
  [key: string]: string | LineItem[] | undefined;
  LINE_ITEMS?: LineItem[];
};

async function getNewFormattedDetails(
  ExpenseDocuments: ExpenseDocument[],
): Promise<MatchedData> {
  const predefinedKeys = {
    INVOICE_RECEIPT_DATE: '',
    INVOICE_RECEIPT_ID: '',
    TAX_PAYER_ID: '',
    CUSTOMER_NUMBER: '',
    ACCOUNT_NUMBER: '',
    VENDOR_NAME: '',
    RECEIVER_NAME: '',
    VENDOR_ADDRESS: '',
    RECEIVER_ADDRESS: '',
    ORDER_DATE: '',
    DUE_DATE: '',
    DELIVERY_DATE: '',
    PO_NUMBER: '',
    PAYMENT_TERMS: '',
    TOTAL: '',
    AMOUNT_DUE: '',
    AMOUNT_PAID: '',
    SUBTOTAL: '',
    TAX: '',
    NAME: '',
    SERVICE_CHARGE: '',
    GRATUITY: '',
    PRIOR_BALANCE: '',
    DISCOUNT: '',
    VENDOR_PHONE: '',
    RECEIVER_PHONE: '',
    VENDOR_URL: '',
    COUNTRY: '',
    CITY: '',
    STATE: '',
    ADDRESS: '',
    LINE_ITEMS: [],
  };

  const processedData = ExpenseDocuments?.flatMap((doc) => {
    const summaryFieldsData =
      doc.SummaryFields?.map((summaryField) => ({
        Type: summaryField.Type?.Text,
        Value: summaryField.ValueDetection?.Text,
      })) || [];

    const lineItemGroupsData =
      doc.LineItemGroups?.flatMap(
        (lineItemGroup) =>
          lineItemGroup.LineItems?.flatMap((lineItem) =>
            lineItem.LineItemExpenseFields?.map((expenseField) => ({
              Type: expenseField.Type?.Text,
              Value: expenseField.ValueDetection?.Text,
            })),
          ) || [],
      ) || [];

    const blocksData =
      doc.Blocks?.map((block) => ({
        Type: block.BlockType,
        Text: block.Text,
      })) || [];

    return [...summaryFieldsData, ...lineItemGroupsData, ...blocksData];
  }) as {
    Type: string;
    Text: string;
    Value: string;
  }[];

  const findMatchedData = (key: string) => {
    return processedData.find(
      (data) =>
        data?.Type?.toUpperCase() === key || data?.Text?.toUpperCase() === key,
    );
  };

  const addLineItem = (items: LineItem[], newItem: LineItem) => {
    const isDuplicate = items.some(
      (item) =>
        item.ITEM === newItem.ITEM &&
        item.QUANTITY === newItem.QUANTITY &&
        item.UNIT_PRICE === newItem.UNIT_PRICE &&
        item.PRICE === newItem.PRICE,
    );
    if (!isDuplicate) items.push(newItem);
  };

  const matchedData: MatchedData = Object.keys(predefinedKeys).reduce(
    (acc: MatchedData, key: string) => {
      if (key === 'LINE_ITEMS') {
        // Handle line items with duplicate checks
        acc.LINE_ITEMS = processedData
          .filter((data) =>
            [
              'ITEM',
              'QUANTITY',
              'UNIT_PRICE',
              'PRODUCT_CODE',
              'PRICE',
            ].includes(data?.Type?.toUpperCase() || ''),
          )
          .reduce((items: LineItem[], data: ProcessedDataItem) => {
            const fieldType = data.Type?.toUpperCase();
            if (fieldType) {
              const lastItem = items[items.length - 1];
              // Start a new line item or add to the current one
              if (!lastItem || lastItem[fieldType]) {
                const newItem: LineItem = { [fieldType]: data.Value };
                addLineItem(items, newItem);
              } else {
                lastItem[fieldType] = data.Value;
              }
            }
            return items;
          }, []);
      } else {
        // Handle non-line-item keys
        const match = findMatchedData(key);
        acc[key] = match?.Value || match?.Text || '';
      }
      return acc;
    },
    {} as MatchedData,
  );

  return matchedData;
}
async function getFormattedDetailsTwo(ExpenseDocuments: ExpenseDocument[]) {
  const processedData =
    ExpenseDocuments?.flatMap((doc) => {
      // Extract summary fields
      const summaryFieldsData =
        doc.SummaryFields?.map((summaryField) => ({
          Type: summaryField.Type?.Text,
          Value: summaryField.ValueDetection?.Text,
        })) || [];

      // Extract line item data
      const lineItemGroupsData =
        doc.LineItemGroups?.flatMap(
          (lineItemGroup) =>
            lineItemGroup.LineItems?.map((lineItem) => ({
              Type: lineItem.LineItemExpenseFields?.[0]?.Type?.Text, // Ensure index is correct
              Value: lineItem.LineItemExpenseFields?.[0]?.ValueDetection?.Text, // Ensure index is correct
            })) || [],
        ) || [];

      // Extract block data
      const blocksData =
        doc.Blocks?.map((block) => ({
          Type: block.BlockType,
          Text: block.Text,
        })) || [];

      // Combine all extracted data
      return [...summaryFieldsData, ...lineItemGroupsData, ...blocksData];
    }) || [];

  return processedData;
}

// Main function to execute the expense analysis
async function analyzeExpense(bucketName: string, documentKey: string) {
  try {
    const jobId = (await startExpenseAnalysis(
      bucketName,
      documentKey,
    )) as string;
    if (jobId) {
      const result = await getExpenseAnalysisResults(jobId);
      return result;
    }
  } catch (error) {
    return error;
  }
}
export async function GET(req: Request): Promise<NextResponse> {
  const url = new URL(req.url);
  const key = url.searchParams.get('key') || null;
  try {
    const bucketName = FILES3_BUCKET_NAME as string;
    const documentKey = key || 'textract/sample-invoice.jpeg';
    const results = (await analyzeExpense(
      bucketName,
      documentKey,
    )) as ExpenseDocument[];
    const data = await getFormattedDetailsTwo(results);
    // const data = await processTextDetection();
    // const response = data;
    return NextResponse.json(data);
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
export async function POST(request: Request): Promise<NextResponse> {
  try {
    // Parse the form data from the request
    const formData = await request.formData();
    // Assuming you are uploading a file with the name 'file'
    const file = formData.get('file') as File; // Cast to File if needed
    const buffer = await file.arrayBuffer();
    const key = `textract/${file.name}`;
    await uploadFile({
      key,
      filePath: buffer as unknown as File,
    });
    const bucketName = FILES3_BUCKET_NAME as string;
    const results = (await analyzeExpense(
      bucketName,
      key,
    )) as ExpenseDocument[];
    const [data] = await Promise.all([
      getNewFormattedDetails(results),
      // getFormattedDetails(results),
      deleteS3File(key),
    ]);
    return NextResponse.json({ data });
  } catch (error) {
    if (error instanceof Error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ error: error }, { status: 500 });
  }
}
