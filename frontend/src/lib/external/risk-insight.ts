import { SupabaseClient } from '@supabase/supabase-js';

import { getCompanyAccounts } from '@/lib/stripe/account-details';
import { getCompanyClients } from '@/lib/supabase/clients';
import { getCompanyVendors } from '@/lib/supabase/vendors';

import { BASE_URL } from '@/config/env-config';
import {
  getAccountPayables,
  getAccountPayableStats,
} from '@/utils/financials/payables/account-payable';
import {
  getAccountReceivables,
  getAccountReceivableStats,
} from '@/utils/financials/receivables/account-receivable';

import { Client } from '@/types/client';
import { SeverancePackagePayload } from '@/types/external';
import { Vendor } from '@/types/vendor';

/**
 * Fetches risk insights for a company over the past 5 months.
 *
 * This function retrieves company clients and vendors, then calculates
 * account receivables and payables for each of the past 5 months. It then
 * calculates financial stability points based on these figures along with
 * other financial metrics.
 *
 * @param supabase - The Supabase client instance used for database operations.
 * @returns A promise that resolves to an array of objects containing the month
 * and its corresponding financial stability score.
 * @throws {Error} If an error occurs during data retrieval or calculation.
 */
export const fetchRiskInsights = async (
  supabase: SupabaseClient,
): Promise<{ month: string; financialStability: number }[]> => {
  try {
    const [companyClients, companyVendors, stripeAccounts] = await Promise.all([
      getCompanyClients(supabase),
      getCompanyVendors(supabase),
      getCompanyAccounts(),
    ]);
    const [receivables, payables] = await Promise.all([
      getAccountReceivables(companyClients as Client[]),
      getAccountPayables(companyVendors as Vendor[]),
    ]);

    const currentDate = new Date();
    const months = [];

    for (let i = 0; i < 5; i++) {
      const monthName = currentDate.toLocaleString('default', {
        month: 'long',
      });
      const completeDate = new Date(
        currentDate.getFullYear(),
        currentDate.getMonth(),
        1,
      );

      months.push({
        month: monthName,
        completeDate: completeDate,
        financialStability: 0,
      });
      currentDate.setMonth(currentDate.getMonth() - 1); // Move to the previous month
    }

    const checking = stripeAccounts?.filter(
      ({ subcategory }) => subcategory === 'checking',
    );
    const totalCheckingBalance = checking?.reduce(
      (sum, account) => sum + (account.balance?.current['usd'] || 0),
      0,
    );

    const savings = stripeAccounts?.filter(
      ({ subcategory }) => subcategory === 'savings',
    );
    const totalSavingsBalance = savings?.reduce(
      (sum, account) => sum + (account.balance?.current['usd'] || 0),
      0,
    );

    const results = [];
    for await (const month of months) {
      const [receiveableStats, payableStats] = await Promise.all([
        getAccountReceivableStats(receivables, month.completeDate),
        getAccountPayableStats(payables, month.completeDate),
      ]);

      const points = await fetchSeverancePackageCalculation({
        data: {
          payment_history: {
            asset_ratio: {
              assets: receiveableStats.assets,
              payout: payableStats.payout,
            },
            late_payment: {
              late: receiveableStats.latePayments,
              on_time: receiveableStats.onTimePayments,
            },
            benefit_percentage: {
              num_employees: 1,
              num_employees_on_benefits: 0,
            },
            history_length: {
              value: 0,
            },
          },
          balance_sheet: {
            assets: {
              value: receiveableStats.assets,
            },
            checking: {
              value: totalCheckingBalance || 0,
            },
            savings: {
              value: totalSavingsBalance || 0,
            },
          },
        },
      });

      results.unshift({
        month: month.month,
        financialStability: points.points,
      });
    }

    return results;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(error.message);
    }
    throw error;
  }
};

/**
 * Sends a request to calculate severance package points based on the provided payload.
 *
 * This function constructs a payload body with financial data, including payment history,
 * income stability, income utilization, balance sheet, and severance payouts. It then
 * sends a POST request to an external API to perform the calculation.
 *
 * @param payload - Partial payload containing severance package information.
 * @returns A promise that resolves to an object containing the calculated points.
 * @throws {Error} If the network response is not ok or an error occurs during the fetch.
 */
export const fetchSeverancePackageCalculation = async (
  payload: Partial<SeverancePackagePayload>,
): Promise<{
  points: number;
}> => {
  const payloadBody = {
    calc_type: 'severance_package',
    data: {
      payment_history: {
        late_payment: payload.data?.payment_history?.late_payment,
        asset_ratio: payload.data?.payment_history?.asset_ratio,
        history_length: {
          value: 0,
        },
        benefit_percentage: {
          num_employees:
            payload.data?.payment_history?.benefit_percentage.num_employees ||
            0,
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
          value: payload.data?.balance_sheet?.checking.value || 0,
        },
        savings: {
          value: payload.data?.balance_sheet?.savings.value || 0,
        },
        assets: {
          value: payload.data?.balance_sheet?.assets.value || 0,
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
  };
  try {
    const response = await fetch(`${BASE_URL}/api/external/fairsplit-algo`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      next: {
        revalidate: 20,
        tags: ['risk-insights'],
      },
      body: JSON.stringify({ payload: payloadBody }),
    });

    if (!response.ok) {
      throw new Error(
        `Network response was not ok: ${response.status} ${response.statusText}`,
      );
    }

    const data = await response.json();
    return data || { points: 0 };
  } catch (error) {
    if (error instanceof Error) throw new Error(error.message);
    throw error;
  }
};
