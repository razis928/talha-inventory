import React from 'react';

import { getUserDetails, UserDetails } from '@/lib/supabase';
import { CompanyDetails, getCompanyDetails } from '@/lib/supabase/company';

import { TabsContent } from '@/components/ui/tabs';

import GeneralSetting from '@/app/dashboard/settings/general-settings/_components';
import { createClient } from '@/utils/supabase/server';

export const revalidate = 0;

const Page = async () => {
  const supabase = createClient();
  const userDetails = (await getUserDetails(supabase)) as UserDetails;
  const companyDetails = (await getCompanyDetails(
    supabase,
    userDetails.company.id,
  )) as CompanyDetails;

  return (
    <TabsContent value='general-settings'>
      <GeneralSetting user={userDetails} companyDetails={companyDetails} />
    </TabsContent>
  );
};

export default Page;
