import { format, isSameMonth } from 'date-fns';
import Stripe from 'stripe';

import { getCompanyTransactionsFromS3 } from '@/lib/s3-bucket/csv';
import { getCompanyAccounts } from '@/lib/stripe/account-details';

import { formatTransactionsAmount } from '@/utils/stripe/csv-templates/transactions';
import { createClient } from '@/utils/supabase/server';

import { Client } from '@/types/client';
import { CSVTransaction } from '@/types/transactions';

export interface AccountReceivable {
  id: string;
  name: string;
  email: string;
  account_balance: number;
  taxes: number;
  received_amount: number;
  status: 'completed' | 'pending';
  late_payment: boolean;
  inserted_at: string;
  isUnassigned?: boolean;
}
/**
 * Retrieves account receivables for a list of clients.
 *
 * This function processes an array of Client objects to generate an array of
 * AccountReceivable objects. It fetches transaction data from an external source
 * to determine the status and late payment information for each client. If a
 * matching transaction is found, the completion status is set to 'completed';
 * otherwise, it is set to 'pending'. The function also checks if the transaction
 * date is before the due date to determine if a payment is late.
 *
 * @param {Client[]} clients - An array of Client objects to generate account
 * receivables for.
 * @returns {Promise<AccountReceivable[]>} A promise that resolves to an array
 * of AccountReceivable objects containing the financial details of each client.
 */
export const getAccountReceivables = async (
  clients: Client[],
): Promise<AccountReceivable[]> => {
  if (clients.length === 0) {
    return [];
  }
  const supabaseClient = createClient();
  const transactions = (await getCompanyTransactionsFromS3(
    supabaseClient,
  )) as CSVTransaction[];

  const updatedClients: AccountReceivable[] = [];
  for await (const client of clients) {
    const matchedClient = transactions.find(
      (transaction) => transaction?.code == client.transaction_tagging_id,
    );

    const late_payment = true;
    // if (matchedClient) {
    //   const transactionDate = fromUnixTime(Number(matchedClient.transacted_at));
    //   const dueDate = fromUnixTime(Number(client.due_date));

    //   // Compare dates directly
    //   late_payment = isBefore(transactionDate, dueDate);
    // }

    updatedClients.push({
      id: client.id,
      name: client.company_name,
      email: client.email_address,
      account_balance: 0,
      taxes: 0,
      received_amount: +client.amount,
      status: matchedClient ? 'completed' : 'pending',
      late_payment: late_payment,
      inserted_at: client.inserted_at,
    });
  }
  return updatedClients;
};

export interface AccountReceivableStats {
  assets: number;
  latePayments: number;
  onTimePayments: number;
}

/**
 * Generate a report of account receivable stats for a given month.
 *
 * This function takes an array of account receivable objects and a month date.
 * It then filters the array to only include objects with an inserted_at date
 * that is within the given month. It then calculates the total of the received_amount
 * property for all objects in the filtered array and returns it as the 'assets'
 * property of the output object. Additionally, it counts the number of objects
 * with late_payment set to true or false and returns the counts as the
 * 'latePayments' and 'onTimePayments' properties of the output object,
 * respectively.
 *
 * If the input array is empty, throws an error.
 *
 * @param {AccountReceivable[]} accountReceivables - An array of account receivable objects.
 * @param {Date} monthDate - A date object representing the month to generate the report for.
 * @returns {Promise<AccountReceivableStats>} A promise that resolves to an object with 'assets',
 * 'latePayments', and 'onTimePayments' properties.
 */
export const getAccountReceivableStats = async (
  accountReceivables: AccountReceivable[],
  monthDate: Date,
): Promise<AccountReceivableStats> => {
  // const monthlyReceivables = accountReceivables;
  const monthlyReceivables = accountReceivables.filter((account) =>
    isSameMonth(new Date(account.inserted_at), monthDate),
  );

  const output: AccountReceivableStats = {
    assets: 0,
    latePayments: 0,
    onTimePayments: 0,
  };
  if (accountReceivables.length === 0) {
    return output;
  }

  monthlyReceivables.forEach((account) => {
    if (account.late_payment) {
      output.latePayments += 1;
    } else {
      output.onTimePayments += 1;
    }
  });

  const totalAssets = monthlyReceivables.reduce((acc, account) => {
    const receivedAmount = +account.received_amount || 0;
    return acc + receivedAmount;
  }, 0);

  if (isNaN(totalAssets)) {
    output.assets = 0;
  }
  output.assets = totalAssets;

  return output;
};

export const getCompanyTransactionsWithClientsDetails = async () => {
  const supabaseClient = createClient();
  const [transactions, stripeAccounts] = await Promise.all([
    getCompanyTransactionsFromS3(supabaseClient) as Promise<CSVTransaction[]>,
    getCompanyAccounts() as unknown as Stripe.FinancialConnections.Account[],
  ]);

  // if (transactions.length === 0 || stripeAccounts.length === 0) {
  //   return [];
  // }

  const accountReceivables = await Promise.all(
    transactions
      ?.filter((transaction) => +transaction.amount > 0) // Filter for positive amounts
      .map((transaction) => {
        // const matchedClient = companyClients?.find(
        //   (client) =>
        //     transaction.account_tag_id === client.transaction_tagging_id,
        // );
        const stripeAccount = stripeAccounts?.find(
          (account) => transaction.account_number === account.id,
        );
        const transacted_at = new Date(transaction.invoice_date);
        return {
          id: transaction.id,
          name: transaction.company_name || 'Unassigned',
          email: transaction.email || 'Unassigned',
          isUnassigned: transaction.company_name ? false : true,
          account_balance: stripeAccount
            ? formatTransactionsAmount({
                amount: Number(stripeAccount.balance?.current['usd'] || 0),
                isInCents: true,
                currency: 'USD',
              })
            : 0.0,
          taxes: transaction.tax || 'Unassigned',
          received_amount: formatTransactionsAmount({
            amount: +transaction.amount,
            isInCents: false,
            currency: 'USD',
          }),
          invoice_tagging_id: transaction.code || 'Unassigned',
          status:
            {
              posted: 'completed',
              pending: 'pending',
            }[transaction.status] || 'void',
          late_payment: false,
          inserted_at: format(transacted_at, 'yyyy-MM-dd'),
        };
      }),
  );

  // const updatedClients =
  //   companyClients?.map((client) => {
  //     const late_payment = isBefore(client.invoice_date, client.due_date);

  //     return {
  //       id: client.id,
  //       name: client.company_name,
  //       email: client.email_address,
  //       isUnassigned: false,
  //       account_balance: 0.0,
  //       taxes: client.tax,
  //       received_amount: formatTransactionsAmount({
  //         amount: client.amount,
  //         isInCents: false,
  //         currency: 'USD',
  //       }),
  //       status: 'completed',
  //       late_payment: late_payment,
  //       invoice_tagging_id: client.transaction_tagging_id,
  //       inserted_at: format(client.inserted_at, 'yyyy-MM-dd'),
  //     };
  //   }) || [];

  const sortedResults = accountReceivables.sort((a, b) => {
    const dateA = new Date(a.inserted_at);
    const dateB = new Date(b.inserted_at);
    return dateB.getTime() - dateA.getTime();
  });

  return sortedResults;
};
