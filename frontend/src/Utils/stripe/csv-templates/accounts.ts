import Stripe from 'stripe';

import { generateCSV } from '@/utils/stripe/csv-templates/generate-csv';

/**
 * Takes a list of Stripe FinancialConnections accounts and generates a CSV file.
 *
 * @param data - The list of Stripe FinancialConnections accounts.
 * @returns A Blob containing the generated CSV file.
 */
export async function generateAccountsCSV(
  data: Stripe.Response<Stripe.ApiList<Stripe.FinancialConnections.Account>>,
) {
  const jsonData = data.data?.map((row) => {
    return {
      id: row.id,
      object: row.object,
      account_holder_customer: row.account_holder?.customer,
      account_holder_type: row.account_holder?.type,
      balance_as_of: row.balance?.as_of,
      balance_cash: JSON.stringify(row?.balance?.cash?.available), // Convert objects to string
      balance_current: JSON.stringify(row?.balance?.current), // Convert objects to string
      balance_type: row.balance?.type,
      balance_refresh_last_attempted_at: row.balance_refresh?.last_attempted_at,
      balance_refresh_next_refresh_available_at:
        row.balance_refresh?.next_refresh_available_at,
      balance_refresh_status: row.balance_refresh?.status,
      category: row.category,
      created: row.created,
      display_name: row.display_name,
      institution_name: row.institution_name,
      last4: row.last4,
      livemode: row.livemode,
      ownership_refresh_last_attempted_at:
        row.ownership_refresh?.last_attempted_at,
      ownership_refresh_next_refresh_available_at:
        row.ownership_refresh?.next_refresh_available_at,
      ownership_refresh_status: row.ownership_refresh?.status,
      permissions: row.permissions?.join('|'), // Join array to string
      status: row.status,
      subcategory: row.subcategory,
      subscriptions: JSON.stringify(row.subscriptions?.join(',')), // Convert array to string
      supported_payment_method_types:
        row.supported_payment_method_types.join('|'), // Join array to string
      transaction_refresh_id: row.transaction_refresh?.id,
      transaction_refresh_last_attempted_at:
        row.transaction_refresh?.last_attempted_at,
      transaction_refresh_next_refresh_available_at:
        row.transaction_refresh?.next_refresh_available_at,
      transaction_refresh_status: row.transaction_refresh?.status,
    };
  }) as {
    [k: string]: string | number | boolean;
    [k: number]: string | number | boolean;
  }[]; // Default to an empty array if data is undefined

  const csv = await generateCSV(jsonData);

  return csv;
}
