import dynamic from 'next/dynamic';
import React from 'react';

import { getCompanyTransactionsWithVendorsDetails } from '@/utils/financials/payables/account-payable';
import {
  AccountReceivable,
  getCompanyTransactionsWithClientsDetails,
} from '@/utils/financials/receivables/account-receivable';

import { AccountPayables } from '@/types/vendor';

const Report = dynamic(
  () => import('@/app/(financial_statements)/general-ledger/generate-report'),
  { ssr: false },
);

export interface GeneralLedgerReportTemplate {
  postedDate: string;
  docDate: string;
  doc: string;
  memo: string;
  jnl: string;
  debit: string;
  credit: string;
  balance: number;
}

const page = async () => {
  // get app AR and AP
  const accountReceivables =
    (await getCompanyTransactionsWithClientsDetails()) as unknown as AccountReceivable[];
  const accountPayables =
    (await getCompanyTransactionsWithVendorsDetails()) as unknown as AccountPayables[];

  // Function to clean up the "$" symbol and convert to number
  const parseAmount = (amount: string) => {
    return parseFloat(amount.replace('$', '').replace(',', ''));
  };

  //  Given data from the mockdata
  const total_revenue = accountReceivables.reduce((sum, item) => {
    return sum + parseAmount(item.received_amount.toString()); // Add the cleaned amount to the sum
  }, 0);

  const total_expenses = accountPayables.reduce((sum, item) => {
    return sum + parseAmount(item.amount); // Add the cleaned amount to the sum
  }, 0);

  const generalLedgerReportData: GeneralLedgerReportTemplate[] = [
    {
      jnl: 'Account Receivable',
      postedDate: new Date().toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      docDate: new Date().toLocaleDateString('en-GB', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }),
      doc: '',
      memo: '',
      debit: '0',
      credit: '$' + total_revenue,
      balance: 0,
    },
    {
      jnl: 'Inventory',
      postedDate: '',
      docDate: '',
      doc: '',
      memo: '',
      debit: '0',
      credit: '0',
      balance: 0,
    },
    {
      jnl: 'Fixed Assets',
      postedDate: '',
      docDate: '',
      doc: '',
      memo: '',
      debit: '0',
      credit: '0',
      balance: 0,
    },
    {
      jnl: 'Account Payable',
      postedDate: '',
      docDate: '',
      doc: '',
      memo: '',
      debit: '$' + total_expenses,
      credit: '0',
      balance: 0,
    },
    {
      jnl: 'Loan Payable',
      postedDate: '',
      docDate: '',
      doc: '',
      memo: '',
      debit: '0',
      credit: '0',
      balance: 0,
    },
    {
      jnl: "Owner's Equity",
      postedDate: '',
      docDate: '',
      doc: '',
      memo: '',
      debit: '0',
      credit: '0',
      balance: 0,
    },
    {
      jnl: 'Revenue',
      postedDate: '',
      docDate: '',
      doc: '',
      memo: '',
      debit: '0',
      credit: '$' + total_revenue,
      balance: 0,
    },
    {
      jnl: 'Expenses',
      postedDate: '',
      docDate: '',
      doc: '',
      memo: '',
      debit: '$' + total_expenses,
      credit: '0',
      balance: 0,
    },
  ];

  return <Report reportData={generalLedgerReportData} />;
};
export default page;
