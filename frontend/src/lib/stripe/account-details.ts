import Stripe from 'stripe';

import { fetchCSVFromS3, listFilesInDirectory } from '@/lib/s3-bucket/csv';
import { getUserDetails, UserDetails } from '@/lib/supabase';
import { getCompanyDetails } from '@/lib/supabase/company';

import { BASE_URL } from '@/config/env-config';
import { createClient } from '@/utils/supabase/server';

export const getAccountsByCustomerId = async (stripe_customer_id: string) => {
  if (!stripe_customer_id) {
    return [];
  }

  try {
    const res = await fetch(
      `${BASE_URL}/api/stripe/accounts?customer_id=${stripe_customer_id}`,
      {
        next: {
          revalidate: 0,
          tags: ['stripe-accounts'],
        },
      },
    );

    if (!res.ok) {
      return [];
    }

    const data = await res.json();

    return data.accounts.data as Stripe.FinancialConnections.Account[];
  } catch (error) {
    return [];
  }
};

/**
 * Retrieves all Stripe FinancialConnections accounts associated with the users
 * of the same company as the logged-in user.
 *
 * @returns A promise that resolves to an array of Stripe FinancialConnections.Account objects
 * or an empty array if no accounts are found or if an error occurs.
 *
 * This function fetches user and company details from the database, extracts
 * Stripe customer IDs for each user in the company, and retrieves their
 * associated financial accounts from Stripe. If no Stripe customer IDs are
 * available or an error occurs during fetching, it returns an empty array.
 */
export const getCompanyAccounts = async () => {
  const supabase = createClient();
  const userDetails = (await getUserDetails(supabase)) as UserDetails;
  const companyDetails = await getCompanyDetails(
    supabase,
    userDetails.company.id,
  );

  if (!userDetails.id) {
    return [];
  }

  const stripe_customer_ids = companyDetails.user_companies
    .map((user) => user.users.stripe_customer_id)
    .filter((id) => id !== null && id !== undefined);

  if (stripe_customer_ids.length === 0) {
    return [];
  }

  try {
    // Fetch accounts for each stripe_customer_id concurrently
    const accountsPromises = stripe_customer_ids.map((id) =>
      getAccountsByCustomerId(id),
    );

    // Wait for all promises to resolve
    const accounts = (await Promise.all(accountsPromises)).flat() || [];
    return accounts as Stripe.FinancialConnections.Account[];
  } catch (error) {
    return [];
  }
};

export const getCSVFromS3 = async (
  csvType: 'accounts' | 'transactions' | 'ownerships',
) => {
  const supabase = createClient();
  const user = (await getUserDetails(supabase)) as UserDetails;
  if (!user) {
    return [];
  }

  const csvKey = `stripe-data/${user.company?.company_name}/users/${user?.email}/${csvType}`;

  if (csvType.includes('transactions')) {
    const listFilesInTransactions = (await listFilesInDirectory(
      `stripe_data/${user.company?.company_name}/users/${user?.email}/${csvType}/`,
    )) as string[];

    const transactionsData = [];
    for await (const transactionKey of listFilesInTransactions) {
      const csvData = await fetchCSVFromS3(transactionKey);
      transactionsData.push(...csvData);
    }
    return transactionsData;
  }

  try {
    const csvData = await fetchCSVFromS3(csvKey);

    return csvData;
  } catch (error) {
    return [];
  }
};

export const getCSVTemplateFromS3 = async () => {
  const csvKey = `transactions-template/template.csv`;

  try {
    const csvData = await fetchCSVFromS3(csvKey);

    return csvData;
  } catch (error) {
    return [];
  }
};
