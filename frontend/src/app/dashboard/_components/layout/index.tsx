'use client';

import { Suspense } from 'react';

import { Toaster } from '@/components/ui/toaster';

import Header from '@/app/dashboard/_components/layout/header';
import Sidebar from '@/app/dashboard/_components/layout/sidebar';

export function Dashboard({ children }: { children: React.ReactNode }) {
  return (
    <div className='grid h-screen w-full grid-cols-[220px_1fr] lg:grid-cols-[266px_1fr]'>
      <Suspense fallback={<div>Loading...</div>}>
        <Sidebar />
      </Suspense>
      <div className='flex h-screen flex-col overflow-hidden p-[30px]'>
        <Suspense fallback={<div>Loading...</div>}>
          <Header />
        </Suspense>

        <main className='flex h-full flex-1 flex-col overflow-y-auto'>
          <div className='flex-1'>{children}</div>
          <Suspense fallback={<div>Loading...</div>}>
            <Toaster />
          </Suspense>
        </main>
      </div>
    </div>
  );
}
