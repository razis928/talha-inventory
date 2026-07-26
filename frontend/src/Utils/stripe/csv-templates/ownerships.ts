import Stripe from 'stripe';

import { generateCSV } from '@/utils/stripe/csv-templates/generate-csv';

export async function generateAccountOwnershipsCSV(
  data: Stripe.Response<Stripe.ApiList<Stripe.FinancialConnections.Account>>,
) {
  const jsonData = data.data?.flatMap(
    (item: Stripe.FinancialConnections.Account) => {
      if (
        typeof item.ownership === 'object' &&
        item.ownership !== null &&
        'owners' in item.ownership
      ) {
        return (
          item.ownership.owners.data?.map(
            (row: Stripe.FinancialConnections.AccountOwner) => ({
              current_owner_id:
                typeof item.ownership === 'object' && item.ownership !== null
                  ? item.ownership.id
                  : '',
              id: row.id,
              object: row.object,
              email: row.email,
              name: row.name,
              ownership: row.ownership,
              phone: row.phone,
              raw_address: row.raw_address,
              refreshed_at: row.refreshed_at,
            }),
          ) || []
        );
      }
      return [];
    },
  ) as {
    [k: string]: string | number | boolean;
    [k: number]: string | number | boolean;
  }[];

  const csv = await generateCSV(jsonData);
  return csv;
}
