import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

export default function Loading() {
  return (
    <div className='w-full px-4'>
      <div className='flex flex-col items-start justify-between sm:flex-row sm:items-center'>
        <div className='flex flex-col gap-2'>
          <Skeleton className='h-6 w-20 bg-white' />
          <Skeleton className='h-4 w-40 bg-white' />
        </div>
        <div className='mt-4 sm:mt-0'>
          <Skeleton className='h-10 w-32 bg-white' />
        </div>
      </div>
      <div className='mt-11 overflow-x-auto'>
        <Table className='bg-white'>
          <TableHeader className='bg-opacBlue'>
            <TableRow className='border-transparent'>
              <TableHead></TableHead>
              <TableHead>
                <Skeleton className='h-5 w-16 bg-white' />
              </TableHead>
              <TableHead>
                <Skeleton className='h-5 w-16 bg-white' />
              </TableHead>
              <TableHead>
                <Skeleton className='h-5 w-16 bg-white' />
              </TableHead>
              <TableHead>
                <Skeleton className='h-5 w-16 bg-white' />
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className='bg-white'>
            {[...Array(5)].map((_, index) => (
              <TableRow key={index} className='relative border-none'>
                <TableCell className='whitespace-nowrap text-right'>
                  <Skeleton className='h-5 w-5 rounded bg-slate-200' />
                </TableCell>
                <TableCell className='whitespace-nowrap px-6 py-4 pl-0'>
                  <div className='flex items-center gap-5 pt-6'>
                    <Skeleton className='h-10 w-10 rounded-full bg-slate-200' />
                    <div className='flex flex-col gap-1'>
                      <Skeleton className='h-5 w-24 bg-slate-200' />
                      <Skeleton className='h-3 w-16 bg-slate-200' />
                    </div>
                  </div>
                </TableCell>
                <TableCell className='whitespace-nowrap px-6 py-4 pl-[15px]'>
                  <div className='flex items-center gap-3'>
                    <Skeleton className='h-5 w-20 bg-slate-200' />
                    <Skeleton className='h-4 w-4 rounded bg-slate-200' />
                  </div>
                </TableCell>
                <TableCell className='whitespace-nowrap px-6 py-4 pl-[10px]'>
                  <div className='flex items-center gap-3'>
                    <Skeleton className='h-4 w-4 rounded-full bg-slate-200' />
                    <Skeleton className='h-4 w-16 bg-slate-200' />
                  </div>
                </TableCell>
                <TableCell className='whitespace-nowrap px-6 py-4 pl-0'>
                  <div className='flex items-center gap-20'>
                    <Skeleton className='h-4 w-24 bg-slate-200' />
                    <Skeleton className='h-4 w-4 bg-slate-200' />
                  </div>
                </TableCell>
                <span className='absolute bottom-0 left-[25px] w-[calc(100%-60px)] border-b border-gray-900 opacity-20' />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
