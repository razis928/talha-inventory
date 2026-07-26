import { SupabaseClient } from '@supabase/supabase-js';

import { getCompanyTransactionsFromS3 } from '@/lib/s3-bucket/csv';

import {
  formatTransactionsAmount,
  unformatCurrency,
} from '@/utils/stripe/csv-templates/transactions';

import { CSVTransaction } from '@/types/transactions';

export interface CustomerList extends CSVTransaction {
  transactions: {
    date: string;
    description: string;
    amount: string;
    name: string;
    code: string;
  }[];
  balance: string;
}
/**
 * Generates a report for account payable vendors.
 *
 * This function processes an array of Vendor objects to create a detailed
 * report in the form of AccountReceiveableCustomerList objects. The report includes
 * vendor details and their associated transactions. Each transaction contains
 * the date, description, debit, credit, and balance.
 *
 * If a vendor has no matched transactions, a beginning balance entry is created.
 *
 * @param {Vendor[]} receivables - An array of Vendor objects to generate reports for.
 * @returns {Promise<CustomerList[]>} A promise that resolves to an
 * array of AccountPayableVendorList objects, each representing a vendor's
 * transaction report.
 *
 * @throws Will throw an error if the `payables` array or any vendor within
 * it is null or undefined.
 */
export const generateReceivableCustomersReport = async (
  supabaseClient: SupabaseClient,
): Promise<CustomerList[]> => {
  try {
    const transactions = await getCompanyTransactionsFromS3(supabaseClient);

    const customersList = await transactions.filter(
      (transaction) => +transaction.amount > 0,
    );

    const groupedCustomers = groupCustomersList(customersList);

    return groupedCustomers;
  } catch (error) {
    return [];
  }
};

export const groupCustomersList = (
  transactions: CSVTransaction[],
): CustomerList[] => {
  const result = transactions.reduce<Record<string, CustomerList>>(
    (accumulator, transaction) => {
      const { company_name, amount } = transaction;

      const key = company_name.toLowerCase();
      // Ensure amount is treated as a number
      const numericAmount = Number(amount);

      if (!accumulator[key]) {
        accumulator[key] = {
          ...transaction,
          balance: '0',
          transactions: [],
        };
      }

      // Unformat the current balance before adding
      const currentBalance = unformatCurrency(accumulator[key].balance);
      const newBalance = currentBalance + numericAmount;

      // Format the new balance and store it back
      accumulator[key].balance = formatTransactionsAmount({
        amount: newBalance,
        isInCents: false,
        currency: 'usd',
      });

      accumulator[key].transactions.push({
        date: transaction.invoice_date,
        description: transaction.description,
        amount: transaction.amount,
        name: transaction.company_name,
        code: transaction.code,
      });

      return accumulator;
    },
    {},
  );

  return Object.values(result);
};

export const getCompanyCustomersList = async (
  supabaseClient: SupabaseClient,
) => {
  const transactions = await getCompanyTransactionsFromS3(supabaseClient);

  const customersList = transactions.filter(
    (transaction) => +transaction.amount < 0,
  );

  const groupedCustomers = groupCustomersList(customersList);
  try {
    return groupedCustomers;
  } catch (error) {
    return [];
  }
};
