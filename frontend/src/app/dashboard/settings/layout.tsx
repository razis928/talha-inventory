'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

import { cn } from '@/lib/utils';

import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function AccountingLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [selectedTab, setSelectedTab] = useState('payment-details');
  const pathname = usePathname();

  const tabs = [
    { name: 'Company Info', href: 'company-info' },
    { name: 'Payment Details', href: 'payment-details' },
    { name: 'Team', href: 'team' },
    { name: 'General Settings', href: 'general-settings' },
  ];

  useEffect(() => {
    const selectedTab = pathname.split('/').pop() || 'payment-details';
    setSelectedTab(selectedTab);
  }, [pathname]);

  return (
    <section>
      <Tabs className='h-full w-full' value={selectedTab}>
        <TabsList className='mb-10 grid w-full max-w-[800px] grid-cols-2 bg-white p-0 md:grid-cols-4'>
          {tabs.map((tab) => (
            <Link
              key={tab.href}
              href={`/dashboard/settings/${tab.href}`}
              passHref
              scroll={false}
              legacyBehavior
            >
              <TabsTrigger
                value={tab.href}
                className={cn(
                  'data-[state=active]:bg-primary',
                  'data-[state=active]:text-white',
                  'data-[state=active]:h-full',
                  'data-[state=active]:w-full',
                  'data-[state=active]:rounded-sm',
                  'whitespace-nowrap text-sm md:text-base',
                  'flex items-center justify-center',
                )}
              >
                {tab.name}
              </TabsTrigger>
            </Link>
          ))}
        </TabsList>
        {children}
      </Tabs>
    </section>
  );
}
