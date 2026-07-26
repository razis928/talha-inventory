import { Card, CardFooter, CardHeader } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
export default function Loading() {
  return (
    <div className='flex flex-col gap-5'>
      <Skeleton className='h-6 w-40 bg-white' />
      <div className='mb-10 flex w-[90%] flex-col gap-10 bg-white px-9 py-16 2xl:w-[85%]'>
        <div className='flex w-full flex-wrap gap-5 2xl:w-[90%] 2xl:gap-8'>
          {[...Array(3)].map((_, index) => (
            <Card className='w-[30%]' key={index}>
              <CardHeader>
                <div className='flex flex-row gap-10'>
                  <Skeleton className='h-5 w-24 bg-slate-100' />
                  <Skeleton className='h-5 w-16 rounded-[10px] bg-slate-100' />
                </div>
              </CardHeader>
              <CardFooter>
                <Skeleton className='h-5 w-40 bg-slate-100' />
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className='flex justify-end'>
          <Skeleton className='h-10 w-40 bg-slate-100' />
        </div>
      </div>
    </div>
  );
}
