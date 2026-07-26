import React from 'react';

import Report from '@/app/(financial_statements)/account-payable-vendor-list/report';
import {
  getCompanyVendorsList,
  VendorList,
} from '@/utils/financials/payables/payable-vendors-list';
import { createClient } from '@/utils/supabase/server';

const AccountPayableVendorListReport = async () => {
  const supabaseClient = createClient();
  const subsidaryLedgers: VendorList[] | [] =
    (await getCompanyVendorsList(supabaseClient)) || [];

  return (
    <div className='m-auto my-3 max-w-[1100px] bg-[white]'>
      {subsidaryLedgers.length === 0 ? (
        <div className='my-auto'>
          <h2 className='text-center text-xl'>No data found</h2>
        </div>
      ) : (
        <Report ledgers={subsidaryLedgers} />
      )}
    </div>
  );
};

export default AccountPayableVendorListReport;
