import { Skeleton } from '@/components/ui/skeleton';
// import { Skeleton } from '@/components/ui/skeleton';
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
    <>
      <div className='overflow-x-auto'>
        <div className='mb-4 flex justify-between gap-2'>
          <Skeleton className='h-10 w-[300px] bg-white' />
          <div className='flex gap-3'>
            <Skeleton className='h-10 w-[120px] bg-white' />
            <Skeleton className='h-10 w-[120px] bg-white' />
          </div>
        </div>
        <Table className='divide-y divide-gray-200'>
          <TableHeader>
            <TableRow className='border-transparent bg-[rgba(3,4,94,0.08)]'>
              {[...Array(6)].map((_, index) => (
                <TableHead
                  key={index}
                  className='px-6 py-4 text-left font-poppins text-sm font-medium leading-[21px]'
                >
                  <Skeleton className='h-5 w-[100px] bg-white' />
                </TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody className='bg-white'>
            {[...Array(5)].map((_, rowIndex) => (
              <TableRow key={rowIndex} className='relative border-none'>
                <TableCell className='whitespace-nowrap bg-white px-6 py-4 text-left font-poppins text-sm text-peacoat'>
                  <div className='flex items-center gap-2'>
                    <Skeleton className='h-[35px] w-[35px] rounded-full bg-slate-200' />
                    <div className=''>
                      <Skeleton className='mb-1 h-4 w-[100px] bg-slate-200' />
                      <Skeleton className='h-3 w-[60px] bg-slate-200' />
                    </div>
                  </div>
                </TableCell>
                {[...Array(5)].map((_, cellIndex) => (
                  <TableCell
                    key={cellIndex}
                    className='whitespace-nowrap px-6 py-4 text-left font-poppins text-xs font-normal leading-[18px]'
                  >
                    <Skeleton className='h-4 w-[100px] bg-slate-200' />
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className='mt-4 flex justify-center'>
          <Skeleton className='h-10 w-[300px] bg-white' />
        </div>
      </div>
    </>
  );
}
