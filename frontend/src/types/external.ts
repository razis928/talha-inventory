export interface SeverancePackagePayload {
  calc_type: 'severance_package';
  data: {
    payment_history?: {
      late_payment: {
        on_time: number;
        late: number;
      };
      asset_ratio: {
        assets: number;
        payout: number;
      };
      history_length: {
        value: number;
      };
      benefit_percentage: {
        num_employees: number;
        num_employees_on_benefits: number;
      };
    };
    income_stability?: {
      history_length: {
        value: number;
      };
      years_in_business: {
        value: number;
      };
      age_of_employee_30_60: {
        value: number;
      };
    };
    income_utilization?: {
      utilization_over_severance: {
        utilization: number;
        severance_amount: number;
      };
      advance_payment: {
        value: number;
      };
    };
    balance_sheet?: {
      checking: {
        value: number;
      };
      savings: {
        value: number;
      };
      assets: {
        value: number;
      };
    };
    past_severance_payouts?: {
      employer_payout: {
        premiums: number;
        payout: number;
      };
      partial_employer_payout: {
        premiums: number;
        payout: number;
      };
    };
    present_severance_payouts?: {
      avaliable_funds: {
        funds: number;
        living_cost: number;
      };
    };
  };
}
