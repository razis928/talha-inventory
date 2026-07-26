import dynamic from 'next/dynamic';
import React from 'react';

import {
  CompanyUsers,
  getCompanyUsers,
  getUserDetails,
  UserDetails,
} from '@/lib/supabase';

import { TabsContent } from '@/components/ui/tabs';

import { createClient } from '@/utils/supabase/server';

const Team = dynamic(
  () => import('@/app/dashboard/settings/team/_components'),
  { ssr: false },
);

export const revalidate = 0;

const Page = async () => {
  const supabase = createClient();
  const userDetails = (await getUserDetails(supabase)) as UserDetails;

  const companyId = userDetails?.company?.id;

  const companyUsers = (await getCompanyUsers(
    supabase,
    companyId,
  )) as CompanyUsers[];

  return (
    <TabsContent value='team'>
      <Team companyUsers={companyUsers} user={userDetails} />
    </TabsContent>
  );
};

export default Page;
