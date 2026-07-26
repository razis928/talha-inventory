import { API_URL } from '@/config/env-config';

import { SeverancePackagePayload } from '@/types/external';

export async function POST(req: Request) {
  const { payload }: { payload: SeverancePackagePayload } = await req.json();

  try {
    const response = await fetch(`${API_URL}/FairsplitAlgo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        calc_type: 'severance_package',
        data: {
          payment_history: {
            late_payment: payload.data?.payment_history?.late_payment,
            asset_ratio: payload.data?.payment_history?.asset_ratio,
            history_length: {
              value: 0,
            },
            benefit_percentage: {
              num_employees: 0,
              num_employees_on_benefits: 0,
            },
          },
          income_stability: {
            history_length: {
              value: 0,
            },
            years_in_business: {
              value: 0,
            },
            age_of_employee_30_60: {
              value: 0,
            },
          },
          income_utilization: {
            utilization_over_severance: {
              utilization: 2000,
              severance_amount: 1000,
            },
            advance_payment: {
              value: 0,
            },
          },
          balance_sheet: {
            checking: {
              value: 0,
            },
            savings: {
              value: 0,
            },
            assets: {
              value: 0,
            },
          },
          past_severance_payouts: {
            employer_payout: {
              premiums: 0,
              payout: 0,
            },
            partial_employer_payout: {
              premiums: 0,
              payout: 0,
            },
          },
          present_severance_payouts: {
            avaliable_funds: {
              funds: 3000,
              living_cost: 1200,
            },
          },
        },
        ...(payload.data || {}),
      }),
    });

    if (!response.ok) {
      throw new Error(
        `Network response was not ok: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();

    return new Response(JSON.stringify(data));
  } catch (error) {
    return new Response(JSON.stringify({ error: error }), {
      status: 500,
    });
  }
}
