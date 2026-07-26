import React from 'react';

import { getCompanyAccounts } from '@/lib/stripe/account-details';

import { TabsContent } from '@/components/ui/tabs';

import PaymentDetails from '@/app/dashboard/settings/payment-details/_components';

export const revalidate = 0;

const Page = async () => {
  const companyAccounts = await getCompanyAccounts();

  return (
    <TabsContent value='payment-details'>
      <PaymentDetails accounts={companyAccounts} />
    </TabsContent>
  );
};

export default Page;
