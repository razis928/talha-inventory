import React from 'react';

import { getCompanyClients } from '@/lib/supabase/clients';

import Report from '@/app/(financial_statements)/account-receivable-subsidary-ledger/report';
import {
  AccountReceiveableSubsidaryLedger,
  generateReceiveableSubsidaryLedgerReport,
} from '@/utils/financials/receivables/receivable-subsidary-ledger';
import { createClient } from '@/utils/supabase/server';

import { Client } from '@/types/client';

const AccountRecivable = async () => {
  const supabase = createClient();

  const companyVendors = await getCompanyClients(supabase);

  const subsidaryLedgers: AccountReceiveableSubsidaryLedger[] | [] =
    (await generateReceiveableSubsidaryLedgerReport(
      companyVendors as Client[],
      supabase,
    )) || [];

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

export default AccountRecivable;
