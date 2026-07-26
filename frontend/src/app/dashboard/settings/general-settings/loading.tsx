import { Card } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <Card className='h-[355px] w-[700px] rounded-lg pb-24'>
      <div className='flex items-center justify-between pe-12 ps-9 pt-6'>
        <div className='flex gap-7'>
          <Skeleton className='h-12 w-12 rounded-full bg-slate-200' />
          <div className='flex flex-col gap-2'>
            <Skeleton className='h-6 w-24 bg-slate-200' />
            <Skeleton className='h-4 w-48 bg-slate-200' />
          </div>
        </div>
        <Skeleton className='h-6 w-10 rounded-full bg-slate-200' />
      </div>
      <div className='mx-10 mt-11 border-b border-black opacity-5'></div>
      <div className='mt-11 flex items-center justify-between pe-12 ps-9'>
        <div className='flex gap-7'>
          <Skeleton className='h-12 w-12 rounded-full bg-slate-200' />
          <div>
            <Skeleton className='mb-2 h-6 w-24 bg-slate-200' />
            <Skeleton className='h-4 w-48 bg-slate-200' />
          </div>
        </div>
      </div>
      <div className='ms-32 mt-7'>
        <div className='flex w-full gap-3 pr-10'>
          <Skeleton className='h-10 w-full bg-slate-200' />
          <Skeleton className='h-10 w-32 bg-slate-200' />
        </div>
      </div>
    </Card>
  );
}
