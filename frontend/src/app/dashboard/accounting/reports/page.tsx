import React from 'react';

import { TabsContent } from '@/components/ui/tabs';

import Reports from '@/app/dashboard/accounting/reports/_components/reports';
import { getCompanyTransactionsWithVendorsDetails } from '@/utils/financials/payables/account-payable';
import {
  AccountReceivable,
  getCompanyTransactionsWithClientsDetails,
} from '@/utils/financials/receivables/account-receivable';

import { AccountPayables } from '@/types/vendor';

export const revalidate = 0;
const page = async () => {
  const accountReceivables =
    (await getCompanyTransactionsWithClientsDetails()) as unknown as AccountReceivable[];
  const accountPayables =
    (await getCompanyTransactionsWithVendorsDetails()) as unknown as AccountPayables[];

  return (
    <TabsContent value='reports'>
      <Reports
        accountReceivables={accountReceivables}
        accountPayables={accountPayables}
      />
    </TabsContent>
  );
};

export default page;
