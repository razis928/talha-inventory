import { format, isSameMonth, parseISO } from 'date-fns';

import { getCompanyTransactionsFromS3 } from '@/lib/s3-bucket/csv';
import { getCSVTemplateFromS3 } from '@/lib/stripe/account-details';

import { formatTransactionsAmount } from '@/utils/stripe/csv-templates/transactions';
import { createClient } from '@/utils/supabase/server';

import { StripeTransaction } from '@/types/stripe';
import { CSVTransaction } from '@/types/transactions';
import { Vendor } from '@/types/vendor';

/**
 * Retrieves account payables for a list of vendors.
 *
 * This function processes an array of Vendor objects to generate an array of
 * updated Vendor objects. It fetches transaction data from an external source
 * to determine the payment status and description for each vendor. If a
 * matching transaction is found, the status is set to 'Paid'; otherwise, it is
 * set to 'Unpaid'. The function also copies the description from the matched
 * transaction to the vendor.
 *
 * @param {Vendor[]} vendors - An array of Vendor objects to generate account
 * payables for.
 * @returns {Promise<Vendor[]>} A promise that resolves to an array
 * of Vendor objects containing the payment status and description for each
 * vendor.
 */
export const getAccountPayables = async (
  vendors: Vendor[],
): Promise<Vendor[]> => {
  if (!vendors) {
    return [];
  }

  const transactions = (await getCSVTemplateFromS3()) as StripeTransaction[];

  const updatedVendors: Vendor[] = [];
  for await (const vendor of vendors) {
    const matchedVendor = transactions.find(
      (transaction) =>
        transaction?.account_tag_id == vendor.transaction_tagging_id,
    );

    updatedVendors.push({
      ...vendor,
      status: matchedVendor ? 'Paid' : 'Unpaid',
      description: matchedVendor?.description || '',
    });
  }
  return updatedVendors;
};

export interface AccountPayableStats {
  payout: number;
}

/**
 * Generates a report of account payable stats for a given month.
 *
 * This function filters the provided list of account payables to include only
 * those with an inserted_at date within the specified month. It then calculates
 * the total payout amount for the filtered accounts and returns it as the
 * 'payout' property of the output object.
 *
 * If the input array is empty, an error is thrown.
 *
 * @param {Vendor[]} accountPayables - An array of Vendor objects representing
 * account payables.
 * @param {Date} monthDate - A date object representing the month to generate
 * the report for.
 * @returns {Promise<AccountPayableStats>} A promise that resolves to an object
 * with a 'payout' property representing the total payout for the month.
 * @throws {Error} If the input array is empty.
 */
export const getAccountPayableStats = async (
  accountPayables: Vendor[],
  monthDate: Date,
): Promise<AccountPayableStats> => {
  const output: AccountPayableStats = {
    payout: 0,
  };
  if (accountPayables.length === 0) {
    return output;
  }

  const monthlyReceivables = accountPayables?.filter((account) =>
    isSameMonth(parseISO(account.inserted_at), monthDate),
  );

  const totalPayouts = monthlyReceivables
    // .filter((account) => account.status === 'Paid') // Filter for paid accounts
    .reduce((acc, account) => {
      const receivedAmount = +account.amount || 0;
      return acc + receivedAmount;
    }, 0);

  output.payout = totalPayouts;

  return output;
};

export const getCompanyTransactionsWithVendorsDetails = async () => {
  const supabaseClient = createClient();
  const [transactions] = await Promise.all([
    getCompanyTransactionsFromS3(supabaseClient) as Promise<CSVTransaction[]>,
  ]);

  const accountPayables = await Promise.all(
    transactions
      ?.filter((transaction) => +transaction.amount < 0) // Filter for Negative amounts
      .map((transaction) => {
        const transacted_at = new Date(transaction.invoice_date);
        return {
          id: transaction.id,
          invoice_date: transaction.invoice_date || 'Unassigned',
          due_date: transaction.due_date || 'Unassigned',
          isUnassigned: transaction.company_name ? false : true,
          company_name: transaction.company_name || 'Unassigned',
          description: transaction.description,
          invoice_tagging_id: transaction.code,
          invoice_number: transaction.invoice_number || 'Unassigned',
          amount: formatTransactionsAmount({
            amount: Math.abs(+transaction.amount),
            isInCents: false,
            currency: 'usd',
          }),
          status:
            {
              posted: 'Paid',
              pending: 'pending',
            }[transaction.status] || 'Unpaid',
          inserted_at: format(transacted_at, 'yyyy-MM-dd'),
        };
      }),
  );

  const sortedResults = accountPayables.sort((a, b) => {
    const dateA = new Date(a.inserted_at);
    const dateB = new Date(b.inserted_at);
    return dateB.getTime() - dateA.getTime();
  });

  return sortedResults;
};
