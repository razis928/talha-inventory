import React, { Suspense } from 'react';

import { TabsContent } from '@/components/ui/tabs';

import AccountsPayable from '@/app/dashboard/accounting/account-payables/_components/accounts-payable';
import { getCompanyTransactionsWithVendorsDetails } from '@/utils/financials/payables/account-payable';

import { AccountPayables } from '@/types/vendor';

export const revalidate = 0;
const page = async () => {
  // const vendors = await getCompanyVendors(supabase);

  // const accountPayables = await getAccountPayables(vendors || []);

  const accountPayables =
    (await getCompanyTransactionsWithVendorsDetails()) as unknown as AccountPayables[];

  return (
    <TabsContent value='account-payables'>
      <Suspense fallback='loading...'>
        <AccountsPayable accountPayables={accountPayables} />
      </Suspense>
    </TabsContent>
  );
};

export default page;
