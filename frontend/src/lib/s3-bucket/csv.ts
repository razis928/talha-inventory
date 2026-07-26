import { GetObjectCommand, ListObjectsV2Command } from '@aws-sdk/client-s3';
import { SupabaseClient } from '@supabase/supabase-js';
import Papa from 'papaparse';

import { getUserDetails, UserDetails } from '@/lib/supabase';
import { getCompanyDetails } from '@/lib/supabase/company';

import { s3Client } from '@/config/aws-config';
import { FILES3_BUCKET_NAME } from '@/config/env-config';

import { CSVTransaction } from '@/types/transactions';

/**
 * Fetches a CSV file from the S3 bucket.
 *
 * @param key - The key of the CSV file to fetch.
 * @returns A promise that resolves to an array of CSVTransaction objects or an empty array if the file is not found.
 *
 * This function first checks if the FILES3_BUCKET_NAME is defined. If not, it throws an error.
 * It then uses the AWS SDK to get the object from S3. If there is an error, it returns an empty array.
 * If the object is successfully retrieved, it parses the CSV data using Papa.parse.
 * If there are any errors in the CSV data, it returns an empty array.
 * Otherwise, it returns the parsed CSV data.
 */
export const fetchCSVFromS3 = async (key: string) => {
  if (!FILES3_BUCKET_NAME) {
    throw new Error('S3_BUCKET_NAME is not defined');
  }

  const command = new GetObjectCommand({
    Bucket: FILES3_BUCKET_NAME,
    Key: key,
  });

  try {
    const response = await s3Client.send(command);
    const str = (await response.Body?.transformToString()) || '';
    const jsonData = Papa.parse(str, {
      header: true,
      skipEmptyLines: true,
    });
    if (jsonData.errors.length > 0) {
      return [];
    }
    return jsonData.data;
  } catch (err) {
    return [];
  }
};

// Function to get all files in a specific directory in an S3 bucket
export async function listFilesInDirectory(directoryPrefix: string) {
  try {
    const command = new ListObjectsV2Command({
      Bucket: FILES3_BUCKET_NAME,
      Prefix: directoryPrefix,
      Delimiter: '/',
      MaxKeys: 100,
    });
    const listedObjects = await s3Client.send(command);

    // Extract and map object keys
    const fileKeys = listedObjects.Contents?.map((item) => item.Key) || [];
    return fileKeys;
  } catch (error) {
    return [];
  }
}

/**
 * Retrieves all transactions for a user's company from S3.
 *
 * @returns A promise that resolves to an array of CSVTransaction objects or an empty array if no transactions are found.
 *
 * This function first fetches user details and company details from the database.
 * It generates S3 keys for the transactions CSV files for each user associated with the company
 * who has a Stripe customer ID. It then retrieves and parses these CSV files from S3 using PapaParse.
 * If any errors occur, or if user or company details are not found, it returns an empty array.
 */
export const getCompanyTransactionsFromS3 = async (
  supabaseClient: SupabaseClient,
): Promise<CSVTransaction[]> => {
  const user = (await getUserDetails(supabaseClient)) as UserDetails;
  if (!user) {
    return [];
  }

  const transactionsData: CSVTransaction[] = [];
  try {
    const companyDetails = await getCompanyDetails(
      supabaseClient,
      user.company.id,
    );

    for await (const companyUser of companyDetails.user_companies) {
      // const prefix = `stripe_data/FairSplit Inc/oblack@fairsplit.us/transactions/`;
      const prefix = `stripe_data/${companyDetails.company_name}/users/${companyUser.users.email}/transactions/`;
      const listFilesInTransactions = (await listFilesInDirectory(
        prefix,
      )) as string[];
      // Collect all promises for fetching CSV data
      const fetchPromises = await listFilesInTransactions.map(
        async (transactionKey) => {
          return (await fetchCSVFromS3(transactionKey)) as CSVTransaction[];
        },
      );

      // Wait for all promises to resolve
      const results = await Promise.all(fetchPromises);

      transactionsData.push(...results.flat());
    }
    return transactionsData;
  } catch (error) {
    return [];
  }
};
