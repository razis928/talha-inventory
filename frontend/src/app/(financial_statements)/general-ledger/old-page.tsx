import dynamic from 'next/dynamic';
import React from 'react';

import { getCSVTemplateFromS3 } from '@/lib/stripe/account-details';

import { createClient } from '@/utils/supabase/server';

import { StripeTransaction } from '@/types/stripe';

const Report = dynamic(
  () => import('@/app/(financial_statements)/general-ledger/generate-report'),
  { ssr: false },
);

export interface GeneralLedgerReportTemplate {
  postedDate: string;
  docDate: string;
  doc: string;
  memo: string;
  location: string;
  jnl: string;
  debit: number;
  credit: number;
  balance: number;
}
function extractCodeFromTaggingId(code: string) {
  // Step 1: Split the string by the hyphen (-)
  const parts = code.split('-');

  // Step 2: Extract the first part (before the hyphen)
  const firstPart = parts[0];

  // Step 3: Use a regular expression to get the numeric digits from the first part
  const digits = firstPart.match(/\d+/);

  // Return the digits if they exist, otherwise return null or a default value
  return digits ? digits[0] : null;
}

const page = async () => {
  const supabase = createClient();
  const templateTransactions =
    (await getCSVTemplateFromS3()) as StripeTransaction[];

  const generalLedgerReportData: GeneralLedgerReportTemplate[] = [];
  for await (const transaction of templateTransactions) {
    const tagging_id_code = extractCodeFromTaggingId(
      transaction?.account_tag_id,
    );
    const { data: account } = await supabase
      .from('chart_of_accounts')
      .select('name')
      .eq('code', tagging_id_code)
      .single();

    // Check if the account exists and has a name
    if (account && account.name) {
      // Find or create an entry for the account in the report data
      let accountEntry = generalLedgerReportData.find(
        (entry) => entry.location === account.name,
      );
      const isAccountsReceivable = account.name === 'Accounts Receivable';
      if (!accountEntry) {
        accountEntry = {
          location: account.name,
          credit: 0,
          debit: 0,
          balance: 0,
          doc: '',
          jnl: '',
          postedDate: isAccountsReceivable ? '04/01/2024' : '',
          docDate: isAccountsReceivable ? '04/30/2024' : '',
          memo: isAccountsReceivable ? 'Adjust prepaid insurance balance' : '',
        };

        generalLedgerReportData.push(accountEntry);
      }

      // Update credit and debit based on transaction amount
      const amount = +transaction.amount; // Assuming transaction has an amount property
      if (amount > 0) {
        accountEntry.credit += +amount;
      } else {
        accountEntry.debit += Math.abs(amount);
      }

      // Update the balance
      accountEntry.balance = accountEntry.credit - accountEntry.debit;
    }
  }
  return <Report reportData={[]} />;
  // return <Report reportData={generalLedgerReportData} />;
};
export default page;
