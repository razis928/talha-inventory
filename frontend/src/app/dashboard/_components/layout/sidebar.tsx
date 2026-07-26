'use client';
import {
  Briefcase,
  CircleHelp,
  LayoutGrid,
  Settings,
  User,
} from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useSelectedLayoutSegment } from 'next/navigation';
import React from 'react';

import { cn } from '@/lib/utils';

const Sidebar = () => {
  const activeSegment = useSelectedLayoutSegment();

  return (
    <div className='bg-muted/40 hidden h-screen bg-white md:block'>
      <div className='flex h-full max-h-screen flex-col gap-2'>
        <div className='mt-9 px-8'>
          <Image
            src='/assets/logos/dashboard.svg'
            className='pl-3'
            alt='Logo'
            width={104}
            height={38}
          />
        </div>
        <div className='mt-16 flex-1'>
          <nav className='grid items-start gap-4 px-2 text-sm font-medium lg:px-4'>
            <Link
              prefetch={true}
              scroll={false}
              href='/dashboard'
              className={cn(
                'sidebar-text flex items-center gap-3 rounded-lg bg-muted p-3 transition-all hover:text-primary',
                activeSegment === null && 'bg-gray-200 font-bold text-primary',
              )}
            >
              <LayoutGrid className='h-4 w-4' />
              Dashboard
            </Link>
            <Link
              prefetch={true}
              scroll={false}
              href='/dashboard/accounting/account-receivables'
              className={cn(
                'sidebar-text flex items-center gap-3 rounded-lg bg-muted p-3 transition-all hover:text-primary',
                activeSegment === 'accounting' &&
                  'bg-gray-200 font-bold text-primary',
              )}
            >
              <Briefcase className='h-4 w-4' />
              Accounting
            </Link>
            <Link
              prefetch={true}
              scroll={false}
              href='/dashboard/actions'
              className={cn(
                'sidebar-text flex items-center gap-3 rounded-lg bg-muted p-3 transition-all hover:text-primary',
                activeSegment === 'actions' &&
                  'bg-gray-200 font-bold text-primary',
              )}
            >
              <User className='h-4 w-4' />
              Action
            </Link>
            <Link
              prefetch={true}
              scroll={false}
              href='/dashboard/settings/company-info'
              className={cn(
                'sidebar-text flex items-center gap-3 rounded-lg bg-muted p-3 transition-all hover:text-primary',
                activeSegment === 'company-info' &&
                  'bg-gray-200 font-bold text-primary',
              )}
            >
              <Settings className='h-4 w-4' />
              Settings{' '}
            </Link>
          </nav>
        </div>
        <Link href='/help-support' prefetch={false}>
          <div className='sidebar-text mt-auto flex items-center gap-3 px-4 py-10'>
            <CircleHelp className='h-4 w-4' />
            <p>Help and Support</p>
          </div>
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
