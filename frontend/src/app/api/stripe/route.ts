import { NextResponse } from 'next/server';

import { stripe } from '@/config/stripe-config';
import { createClient } from '@/utils/supabase/server';

export const dynamic = 'force-dynamic';
/**
 * Creates a Stripe customer and a Checkout session for setting up a US bank account payment method.
 *
 * @param {Request} req - The request object containing the email of the customer.
 * @return {Promise<NextResponse>} A promise that resolves to a JSON response containing the URL of the Checkout session.
 */
export async function POST(req: Request): Promise<NextResponse> {
  try {
    const { email, customerId } = await req.json();

    const supabase = createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    const baseURL = req.headers.get('origin');
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    let customer_id = customerId || undefined;
    if (!customerId) {
      const paymentIntent = await stripe.customers.create({
        email,
      });

      const { id } = paymentIntent;
      customer_id = id;
      await supabase
        .from('users')
        .update({ stripe_customer_id: id })
        .eq('id', user?.id)
        .single();
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'setup',
      customer: customer_id,
      payment_method_types: ['us_bank_account'],
      payment_method_options: {
        us_bank_account: {
          financial_connections: {
            prefetch: ['balances', 'ownership', 'transactions'],
            permissions: [
              'payment_method',
              'balances',
              'ownership',
              'transactions',
            ],
          },
        },
      },
      success_url: `${baseURL}/dashboard/settings/payment-details`,
      cancel_url: `${baseURL}/dashboard/settings/payment-details`,
    });

    const { url } = session;

    return NextResponse.json({ url });
  } catch (error: unknown) {
    if (error instanceof Error) {
      // eslint-disable-next-line no-console
      console.error('Error creating Stripe session:', error.message);
      return NextResponse.json(
        { error: `An error occurred: ${error.message}`, details: error },
        { status: 500 },
      );
    } else {
      // eslint-disable-next-line no-console
      console.error('Unknown error:', error);
      return NextResponse.json(
        { error: 'An error occurred', details: error },
        { status: 500 },
      );
    }
  }
}
