import React from 'react';

import { getCompanyVendors } from '@/lib/supabase/vendors';

import Report from '@/app/(financial_statements)/budget-report/report';
import {
  AccountPayableSubsidaryLedger,
  generatePayableSubsidaryLedgerReport,
} from '@/utils/financials/payables/payable-subsidary-ledger';
import { createClient } from '@/utils/supabase/server';

import { Vendor } from '@/types/vendor';

export const revalidate = 0;

const BudgetReport = async () => {
  const supabase = createClient();

  const companyVendors = await getCompanyVendors(supabase);
  const subsidaryLedgers: AccountPayableSubsidaryLedger[] | [] =
    (await generatePayableSubsidaryLedgerReport(companyVendors as Vendor[])) ||
    [];

  return (
    <>
      <div className='m-auto max-w-[1100px]'>
        <Report ledgers={subsidaryLedgers} />
      </div>
    </>
  );
};

export default BudgetReport;
