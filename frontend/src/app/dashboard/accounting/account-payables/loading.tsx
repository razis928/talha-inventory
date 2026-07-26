import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
const tableHeadClasses = ' text-white font-light text-sm font-poppins';
const tableCellClasses =
  'pl-6 py-4 whitespace-nowrap text-sm text-peacoat font-poppins bg-white';
export default function Loading() {
  return (
    <>
      <div className='mb-4 flex justify-between gap-2'>
        <Skeleton className='h-10 w-[300px] bg-slate-200' />
        <div className='flex gap-3'>
          <Skeleton className='h-10 w-[120px] bg-slate-200' />
          <Skeleton className='h-10 w-[120px] bg-slate-200' />
        </div>
      </div>
      <div className='mt-5 overflow-x-auto bg-white'>
        <div className='inline-block min-w-full'>
          <Table className='min-w-[800px] divide-y divide-gray-200 bg-white'>
            <TableHeader className=''>
              <TableRow className='border-transparent bg-slate-300'>
                {[...Array(7)].map((_, index) => (
                  <TableHead key={index} className={tableHeadClasses}>
                    <Skeleton className='h-6 w-[100px] bg-slate-200' />
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody className='bg-white'>
              {[...Array(5)].map((_, rowIndex) => (
                <TableRow key={rowIndex} className='relative border-none'>
                  {[...Array(7)].map((_, cellIndex) => (
                    <TableCell key={cellIndex} className={tableCellClasses}>
                      <Skeleton className='h-4 w-[100px] bg-slate-200' />
                    </TableCell>
                  ))}
                  <span className='absolute bottom-0 left-[25px] w-[calc(100%-40px)] border-b border-[rgba(60,55,68,0.12)]' />
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className='mt-4 flex justify-center'>
            <Skeleton className='h-10 w-[300px] bg-white' />
          </div>
        </div>
      </div>
    </>
  );
}
