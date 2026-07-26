import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { getSignedURL } from '@/lib/s3-bucket/signed-url';

import { stripe } from '@/config/stripe-config';
import { generateAccountsCSV } from '@/utils/stripe/csv-templates/accounts';
import { generateAccountOwnershipsCSV } from '@/utils/stripe/csv-templates/ownerships';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const customerId =
    url.searchParams.get('customer_id') || 'cus_QaPhQ1SQLWaUqS';

  try {
    const accountsListing = await stripe.financialConnections.accounts.list({
      expand: ['data.ownership'],
      account_holder: {
        customer: customerId,
      },
    });
    if (!accountsListing || !accountsListing.data) {
      throw new Error('Failed to retrieve accounts');
    }

    // Refresh all accounts
    for await (const account of accountsListing.data) {
      await Promise.all([
        stripe.financialConnections.accounts.subscribe(account.id, {
          features: ['transactions'],
        }),
        stripe.financialConnections.accounts.refresh(account.id, {
          features: ['balance', 'ownership', 'transactions'],
        }),
      ]);
    }

    // Get updated accounts
    const accounts: Stripe.Response<
      Stripe.ApiList<Stripe.FinancialConnections.Account>
    > = await stripe.financialConnections.accounts.list({
      expand: ['data.ownership'],
      account_holder: {
        customer: customerId,
      },
    });

    const accountsTransactions: Stripe.Response<
      Stripe.ApiList<Stripe.FinancialConnections.Transaction>
    >[] = [];

    for await (const account of accounts.data) {
      const transactions = await stripe.financialConnections.transactions.list({
        account: account.id,
      });
      accountsTransactions.push(transactions);
    }

    for (const item of ['accounts', 'ownerships', 'transactions'] as (
      | 'transactions'
      | 'accounts'
      | 'ownerships'
    )[]) {
      let csvBlob;
      let _csvType: 'accounts' | 'transactions' | 'ownerships';
      switch (item) {
        case 'transactions':
          // csvBlob = await generateAccountTransactionsCSV(accountsTransactions);
          _csvType = 'transactions';
          break;
        case 'accounts':
          csvBlob = await generateAccountsCSV(accounts);
          _csvType = 'accounts';
          break;
        case 'ownerships':
          csvBlob = await generateAccountOwnershipsCSV(accounts);
          _csvType = 'ownerships';
          break;
        default:
          continue;
      }

      const { success, error } = await getSignedURL(item); // Get signed URL for S3 upload

      if (success) {
        const response = await fetch(success.url, {
          method: 'PUT',
          body: csvBlob, // Upload the CSV Blob
          headers: {
            'Content-Type': 'text/csv', // Set the content type
          },
        });
        if (!response.ok) {
          throw new Error(`Upload failed with status: ${response.status}`);
        }
      } else if (error) {
        throw new Error(`Failed to retrieve signed URL: ${error.message}`);
      } else {
        throw new Error('Failed to retrieve signed URL');
      }
    }

    // downloadCSV(updatedAccounts, 'transactions.csv');
    return NextResponse.json(
      {
        message:
          'Accounts, Transactions and Accounts ownerships CVS uploaded Successfully',
      },
      { status: 200 },
    );
  } catch (error) {
    const errorMessage =
      error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
