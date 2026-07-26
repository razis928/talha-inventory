import Stripe from 'stripe';

export interface StripeTransaction
  extends Stripe.FinancialConnections.Transaction {
  account_tag_id: string;
}
