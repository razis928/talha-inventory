'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AccountingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [selectedTab, setSelectedTab] = useState('account-receivables');
  const pathname = usePathname();

  useEffect(() => {
    const selectedTab = pathname.split('/').pop() || 'account-receivables';
    setSelectedTab(selectedTab);
  }, [pathname]);

  return (
    <section>
      <Tabs className='flex flex-col gap-10' value={selectedTab}>
        <TabsList className='w-[588px] bg-white p-0 font-poppins'>
          <Link
            href='/dashboard/accounting/account-receivables'
            prefetch={true}
            scroll={false}
          >
            <TabsTrigger
              value='account-receivables'
              className='trigger-tabs h-[100%] rounded-none pe-10'
            >
              <span className='pl-[29px]'> Accounts Receivable </span>
            </TabsTrigger>
          </Link>
          <Link
            href='/dashboard/accounting/account-payables'
            prefetch={true}
            scroll={false}
          >
            <TabsTrigger
              value='account-payables'
              className='trigger-tabs h-[100%] rounded-none pe-10 ps-10'
            >
              Accounts Payable
            </TabsTrigger>
          </Link>
          <Link
            href='/dashboard/accounting/reports'
            prefetch={true}
            scroll={false}
          >
            <TabsTrigger
              value='reports'
              className='trigger-tabs h-[100%] rounded-none pe-10 pl-[10px] ps-10'
            >
              Reports
            </TabsTrigger>
          </Link>
        </TabsList>
        {children}
      </Tabs>
    </section>
  );
}
