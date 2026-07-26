// aptasks.tsx

import Link from 'next/link';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { MonthlyCloseField } from '@/app/dashboard/actions/_components/mockdata';

const MonthlyClose = () => {
  return (
    <div>
      <div className='overflow-x-auto font-poppins'>
        <Table className='min-w-full'>
          <TableHeader className='opacity-86 rounded-t-lg bg-[#03045E] text-sm'>
            <TableRow>
              <TableHead className='px-6 py-3 text-left font-poppins text-sm tracking-wider text-white'>
                Frequency
              </TableHead>
              <TableHead className='px-6 py-3 text-left font-poppins text-sm tracking-wider text-white'>
                Tasks
              </TableHead>
              <TableHead className='px-6 py-3 text-left font-poppins text-sm tracking-wider text-white'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {MonthlyCloseField?.map((row, index) => (
              <TableRow
                key={index}
                className='border-b border-gray-200 px-2 py-2 leading-[21.38px]'
              >
                <TableCell className='font-md whitespace-nowrap px-6 text-left font-poppins font-medium leading-[21.38px] text-[#3C3744]'>
                  {row.frequency || 'N/A'}
                </TableCell>
                <TableCell className='whitespace-nowrap px-4 text-left text-[14.25px] font-normal leading-[21.38px] text-[#86898D]'>
                  <Link href='/dashboard/vendors' prefetch={false}>
                    {row.feild || 'N/A'}
                  </Link>
                </TableCell>
                <TableCell className='flex justify-end whitespace-nowrap px-4 text-left'>
                  <button className='opacity-86 h-[38px] w-[145px] rounded-lg border border-gray-500 px-6 py-1 font-poppins text-xs font-semibold leading-[18px] text-[#655e5ee8] transition hover:bg-[#03045E] hover:text-white'>
                    Start Task
                  </button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default MonthlyClose;
