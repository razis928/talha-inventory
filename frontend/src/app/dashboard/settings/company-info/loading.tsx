import React from 'react';

import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
export default function Loading() {
  return (
    <>
      <Card className='rounded-lg'>
        <div className='flex flex-col items-center justify-between pt-6 sm:flex-row'>
          <div className='sm:px-9'>
            <Skeleton className='mb-2 h-6 w-40 bg-slate-100' />
            <Skeleton className='h-4 w-60 bg-white' />
          </div>
          <div className='flex flex-wrap gap-2 px-4 sm:gap-3 sm:px-5'>
            <Skeleton className='h-10 w-24 bg-slate-100' />
            <Skeleton className='h-10 w-24 bg-slate-100' />
          </div>
        </div>
        <div className='border-grey-900 mx-6 mt-6 border-b opacity-25'></div>
        <div className='mt-6 flex w-11/12 flex-row justify-between gap-4 px-9'>
          <div className='flex flex-col gap-2'>
            <Skeleton className='mb-2 h-6 w-32 bg-slate-100' />
            <Skeleton className='h-4 w-48 bg-slate-100' />
          </div>
          <div className='w-1/2'>
            <Skeleton className='mb-4 h-10 w-full bg-slate-100' />
            <Skeleton className='h-10 w-full bg-slate-100' />
          </div>
        </div>
        <div className='border-opacity-24 mx-4 mb-4 mt-4 border border-gray-200 sm:mx-8'></div>
        <div className='mt-6 flex w-[84%] flex-col px-9 sm:flex-row'>
          <div className='flex w-1/2 flex-col gap-2'>
            <Skeleton className='mb-2 h-6 w-32 bg-slate-100' />
            <Skeleton className='h-4 w-48 bg-slate-100' />
          </div>
          <div className='w-1/2'>
            <Skeleton className='h-32 w-full bg-slate-100' />
          </div>
        </div>
        <div className='border-opacity-24 mx-4 mb-4 mt-4 border border-gray-200 sm:mx-8'></div>
        <div className='mt-6 flex w-4/5 flex-col px-9 pb-16 sm:flex-row'>
          <div className='flex w-3/5 flex-col gap-2'>
            <Skeleton className='mb-2 h-6 w-32 bg-slate-100' />
            <Skeleton className='h-4 w-48 bg-slate-100' />
          </div>
          <div className='w-2/5'>
            <div className='mb-4 flex items-center space-x-2'>
              <Skeleton className='h-4 w-4 bg-slate-100' />
              <Skeleton className='h-4 w-24 bg-slate-100' />
            </div>
            <Skeleton className='mb-4 h-3 w-40 bg-slate-100' />
            <div className='mb-4 flex items-center space-x-2'>
              <Skeleton className='h-4 w-4 bg-slate-100' />
              <Skeleton className='h-4 w-24 bg-slate-100' />
            </div>
            <Skeleton className='h-3 w-40 bg-slate-100' />
          </div>
        </div>
      </Card>
    </>
  );
}
