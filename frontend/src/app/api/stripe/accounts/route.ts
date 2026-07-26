import { NextResponse } from 'next/server';

import { stripe } from '@/config/stripe-config';

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const id = url.searchParams.get('customer_id') as string;
  try {
    const accountsListing = await stripe.financialConnections.accounts.list({
      account_holder: {
        customer: id,
      },
    });

    const filterValidAccounts = accountsListing.data?.filter(
      (account) => account.status !== 'inactive',
    );

    for await (const account of filterValidAccounts) {
      await stripe.financialConnections.accounts.refresh(account.id, {
        features: ['balance'],
      });
    }
    const accounts = await stripe.financialConnections.accounts.list({
      account_holder: { customer: id },
    });

    return NextResponse.json({ accounts }, { status: 200 });
  } catch (error: unknown) {
    if (error instanceof Error) {
      return NextResponse.json(
        {
          error: `Failed to retrieve accounts: ${error.message}`,
          details: error,
        },
        { status: 500 },
      );
    } else {
      return NextResponse.json(
        { error: 'Failed to retrieve accounts', details: error },
        { status: 500 },
      );
    }
  }
}
