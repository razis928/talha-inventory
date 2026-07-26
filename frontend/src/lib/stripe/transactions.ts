import { SupabaseClient } from '@supabase/supabase-js';

import { fetchCSVFromS3 } from '@/lib/s3-bucket/csv';
import { getUserDetails, UserDetails } from '@/lib/supabase';
import { CompanyDetails, getCompanyDetails } from '@/lib/supabase/company';

import { CSVTransaction } from '@/types/transactions';

/**
 * Retrieves monthly transactions for a user's company from S3.
 *
 * @param supabase - The Supabase client instance used for database operations.
 * @param month - The month for which transactions are to be retrieved, in string format.
 * @returns A promise that resolves to an array of CSVTransaction objects or an empty array if no transactions are found.
 *
 * This function first fetches user details and company details from the database.
 * It generates S3 keys for the transactions CSV files for each user associated with the company
 * who has a Stripe customer ID. It then retrieves and parses these CSV files from S3 using PapaParse.
 * If any errors occur, or if user or company details are not found, it returns an empty array.
 */
export const getMonthlyTransactions = async (
  supabase: SupabaseClient,
  month: string,
): Promise<CSVTransaction[] | []> => {
  try {
    const user = (await getUserDetails(supabase)) as UserDetails | null;
    const company = (await getCompanyDetails(
      supabase,
      user?.company.id as string,
    )) as CompanyDetails | null;

    if (!user || !company) {
      return [];
    }

    const csvKeys = company.user_companies
      ?.filter((companyUser) => companyUser.users.stripe_customer_id)
      .map((companyUser) => {
        // return `stripe_data/GoMo Inc /goroxe4394@abatido.com/transactions/${month}`;
        return `stripe_data/${company.company_name}/${companyUser.users.email}/transactions/${month}`;
      });

    const monthlyTransactions: CSVTransaction[] = [];

    for await (const csvKey of csvKeys) {
      const csvData = await fetchCSVFromS3(csvKey);
      const jsonResult = csvData as CSVTransaction[];
      monthlyTransactions.push(...jsonResult);
    }
    return monthlyTransactions;
  } catch (error) {
    return [];
  }
};
