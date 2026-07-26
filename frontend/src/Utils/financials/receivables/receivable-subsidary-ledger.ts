import { SupabaseClient } from '@supabase/supabase-js';
import { format } from 'date-fns';

import { getCompanyTransactionsFromS3 } from '@/lib/s3-bucket/csv';

import { formatTransactionsAmount } from '@/utils/stripe/csv-templates/transactions';

import { Client } from '@/types/client';
import { CSVTransaction } from '@/types/transactions';

interface GroupedInvoices {
  date: string;
  description: string;
  debit: string;
  credit: string;
  balance: string;
  code: string;
  ein: string;
  invoice_number: string;
  postRef: string;
}

export interface AccountReceiveableSubsidaryLedger {
  id: string;
  company_name: string;
  address: string;
  invoices: GroupedInvoices[];
}

/**
 * Generate a subsidiary ledger report for each vendor in the given array of Vendors.
 *
 * @param payables An array of Vendor objects.
 * @returns An array of AccountPayableSubsidaryLedger objects.
 */
export const generateReceiveableSubsidaryLedgerReport = async (
  receivebles: Client[],
  supabase: SupabaseClient,
): Promise<AccountReceiveableSubsidaryLedger[]> => {
  if (receivebles.length === 0) {
    return [];
  }

  const transactions = await getCompanyTransactionsFromS3(supabase);

  // Filter out receivable transactions
  const receivableTransactions = transactions.filter(
    (transaction) => +transaction.amount > 0,
  );

  // Group client invoices and then enrich with vendor invoices
  const clientInvoices = groupCompanyInvoices(
    receivableTransactions,
    'company_name',
  );

  // Calculate and update balances in a single pass
  clientInvoices.forEach((client) => {
    let runningBalance = 0;
    client.invoices.forEach((invoice) => {
      const debit = parseFloat(invoice.debit);
      const credit = parseFloat(invoice.credit);
      runningBalance += +credit + +debit;

      // Format values after calculations
      invoice.debit = formatTransactionsAmount({
        amount: debit,
        isInCents: false,
        currency: 'usd',
      });
      invoice.credit = formatTransactionsAmount({
        amount: credit,
        isInCents: false,
        currency: 'usd',
      });
      invoice.balance = formatTransactionsAmount({
        amount: runningBalance,
        isInCents: false,
        currency: 'usd',
      });
    });
  });

  return clientInvoices;
};

// Optimized grouping of invoices using Map
type List = CSVTransaction[];
type AllowedKeys = Extract<keyof CSVTransaction, string>;

export const groupCompanyInvoices = (list: List, key: AllowedKeys) => {
  const grouped = list.reduce<Map<string, AccountReceiveableSubsidaryLedger>>(
    (acc, item) => {
      const companyKey = String(item[key as keyof typeof item]);
      if (!acc.has(companyKey)) {
        acc.set(companyKey, {
          id: item.id,
          company_name: companyKey,
          address: item.address_1,
          invoices: [],
        });
      }

      const transactionType = +item.amount > 0 ? 'Invoice#' : 'Payment#';
      acc.get(companyKey)?.invoices.push({
        date: format(new Date(item.invoice_date), 'MMMM dd'),
        description: `${transactionType} ${item.invoice_number}`,
        code: item.code,
        ein: item.tax_payer_id,
        postRef: format(new Date(item.invoice_date), 'MM/dd/yyyy'),
        debit: +item.amount < 0 ? item.amount : '0',
        invoice_number: item.invoice_number,
        credit: +item.amount > 0 ? item.amount : '0',
        balance: '0',
      });

      return acc;
    },
    new Map(),
  );

  // Convert the Map values to an array
  return Array.from(grouped.values());
};
