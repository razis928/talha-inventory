import React from 'react';

import { TabsContent } from '@/components/ui/tabs';

import AccountReceivables from '@/app/dashboard/accounting/account-receivables/_components/accounts-receivable';
import {
  AccountReceivable,
  getCompanyTransactionsWithClientsDetails,
} from '@/utils/financials/receivables/account-receivable';

export const revalidate = 0;
const page = async () => {
  const accountReceivables =
    (await getCompanyTransactionsWithClientsDetails()) as unknown as AccountReceivable[];

  return (
    <TabsContent value='account-receivables'>
      <AccountReceivables accountReceivables={accountReceivables} />
    </TabsContent>
  );
};

export default page;
