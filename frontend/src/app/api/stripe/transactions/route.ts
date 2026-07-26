import { NextResponse } from 'next/server';

import { stripe } from '@/config/stripe-config';

export async function GET(req: Request) {
  const url = new URL(req.url);
  let id = url.searchParams.get('account_id') || null;

  if (!id) {
    const accounts = await stripe.financialConnections.accounts.list({
      limit: 1,
    });
    id = accounts.data[0].id;
  }

  try {
    const accountDetails = await stripe.financialConnections.transactions.list({
      account: id,
    });

    return NextResponse.json(accountDetails, { status: 200 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to retrieve account details', errors: error },
      { status: 500 },
    );
  }
}
