import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';

export default function Loading() {
  return (
    <>
      <div className='p-4'>
        <div className='mb-4 flex justify-end'>
          <Skeleton className='h-10 w-[120px] bg-white' />
        </div>
        <div className='bg-white px-5 py-14'>
          <div className='grid gap-4 p-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
            {[...Array(4)].map((_, index) => (
              <Card
                key={index}
                className='relative flex cursor-pointer flex-col items-center rounded-lg border border-GrayOpac p-3 text-center'
              >
                <div className='flex'>
                  <Skeleton className='absolute left-2.5 top-2.5 h-12 w-12 rounded-full bg-slate-200' />
                  <div className='mt-4 text-center'>
                    <Skeleton className='ml-6 h-5 w-[100px] bg-slate-200' />
                  </div>
                </div>
                <CardContent>
                  <Skeleton className='mt-4 h-8 w-[120px] bg-slate-200' />
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
