import { SupabaseClient } from '@supabase/supabase-js';

import { getCompanyTransactionsFromS3 } from '@/lib/s3-bucket/csv';

import {
  formatTransactionsAmount,
  unformatCurrency,
} from '@/utils/stripe/csv-templates/transactions';

import { CSVTransaction } from '@/types/transactions';

export interface VendorList extends CSVTransaction {
  transactions: {
    date: string;
    description: string;
    amount: string;
    name: string;
    code: string;
  }[];
  balance: string;
}
// export interface VendorList {
//   id: string;
//   company_name: string;
//   address: string;
//   phone: string;
//   contact_name: string;
//   invoice_date: string;
//   transactions: {
//     date: string;
//     description: string;
//     amount: string;
//     name: string;
//     code: string;
//   }[];
//   company_tagging_id: string;
//   description?: string;
//   debit?: number;
//   credit?: number;
//   balance: string;
//   tagging_id?: string;
//   invoice_number?: string;
//   postRef?: string;
// }

export const groupVendorsList = (
  transactions: CSVTransaction[],
): VendorList[] => {
  const result = transactions.reduce<Record<string, VendorList>>(
    (accumulator, transaction) => {
      const { company_name, amount } = transaction;

      // Ensure amount is treated as a number
      const numericAmount = Number(amount);

      if (!accumulator[company_name]) {
        accumulator[company_name] = {
          ...transaction,
          balance: '0',
          transactions: [],
        };
      }

      // Unformat the current balance before adding
      const currentBalance = unformatCurrency(
        accumulator[company_name].balance,
      );
      const newBalance = Math.abs(currentBalance + numericAmount);

      // Format the new balance and store it back
      accumulator[company_name].balance = formatTransactionsAmount({
        amount: newBalance,
        isInCents: false,
        currency: 'usd',
      });

      accumulator[company_name].transactions.push({
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

export const getCompanyVendorsList = async (supabaseClient: SupabaseClient) => {
  const transactions = await getCompanyTransactionsFromS3(supabaseClient);

  const vendorsList = transactions.filter(
    (transaction) => +transaction.amount < 0,
  );

  const groupedVendors = groupVendorsList(vendorsList);
  try {
    return groupedVendors;
  } catch (error) {
    return [];
  }
};
