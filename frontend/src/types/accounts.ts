export interface StripeAccount {
  id: string;
  object: string;
  account_holder: { customer: string; type: string };
  balance: {
    as_of: number;
    cash: { available: number; current: { usd: number } };
    current: { usd: number };
    type: string;
  };
  balance_refresh: {
    last_attempted_at: number;
    next_refresh_available_at: null | number;
    status: string;
  };
  category: string;
  created: number;
  display_name: string;
  institution_name: string;
  last4: string;
  livemode: boolean;
  ownership: null | string;
  ownership_refresh: {
    last_attempted_at: number;
    next_refresh_available_at: null;
    status: string;
  };
  permissions: string[];
  status: string;
  subcategory: string;
  subscriptions: [];
  supported_payment_method_types: string[];
  transaction_refresh: {
    id: string;
    last_attempted_at: number;
    next_refresh_available_at: null;
    status: string;
  };
}
