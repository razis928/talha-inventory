import React from 'react';

import Report from '@/app/(financial_statements)/account-receivable-customer-list/report';
import {
  CustomerList,
  generateReceivableCustomersReport,
} from '@/utils/financials/receivables/customer-receivable-list';
import { createClient } from '@/utils/supabase/server';

const AccountRecivableCustomerList = async () => {
  const supabaseClient = createClient();
  const subsidaryLedgers: CustomerList[] | [] =
    (await generateReceivableCustomersReport(supabaseClient)) || [];

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

export default AccountRecivableCustomerList;
