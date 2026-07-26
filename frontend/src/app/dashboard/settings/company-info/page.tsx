import React from 'react';

import { getUserDetails, UserDetails } from '@/lib/supabase';
import { CompanyDetails, getCompanyDetails } from '@/lib/supabase/company';

import { TabsContent } from '@/components/ui/tabs';

import Companyinfo from '@/app/dashboard/settings/company-info/_components';
import { createClient } from '@/utils/supabase/server';

export const revalidate = 10;

const CompanyInfo = async () => {
  const supabase = createClient();
  const user = (await getUserDetails(supabase)) as UserDetails;

  if (!user) {
    return <h3>User not found</h3>;
  }
  const companyDetails = (await getCompanyDetails(
    supabase,
    user.company?.id,
  )) as CompanyDetails;

  return (
    <TabsContent value='company-info'>
      <Companyinfo user={user} companyDetails={companyDetails} />
    </TabsContent>
  );
};

export default CompanyInfo;
