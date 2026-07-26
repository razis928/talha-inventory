'use client';

import Link from 'next/link';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { ARtaskFeild } from '@/app/dashboard/actions/_components/mockdata';

const Artask = () => {
  return (
    <div className='mb-4 w-[100%] font-poppins'>
      <div className='overflow-x-auto'>
        <Table className='min-w-full'>
          {' '}
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
            {ARtaskFeild?.map((row, index) => (
              <TableRow
                key={index}
                className='border-b border-gray-200 px-2 py-2 leading-[21.38px]'
              >
                <TableCell className='font-md whitespace-nowrap px-6 text-left font-poppins font-medium leading-[21.38px] text-[#3C3744]'>
                  {row.frequency || 'N/A'}
                </TableCell>
                <TableCell className='whitespace-nowrap px-4 text-left text-[14.25px] font-normal leading-[21.38px] text-[#86898D]'>
                  {row.feild || 'N/A'}
                </TableCell>
                <TableCell className='flex justify-end whitespace-nowrap px-4 text-left'>
                  <Link href={row.route || '#'}>
                    <button className='opacity-86 h-[38px] w-[145px] rounded-lg border border-gray-500 px-6 py-1 font-poppins text-xs font-semibold leading-[18px] text-[#655e5ee8] transition hover:bg-[#03045E] hover:text-white'>
                      Start Task
                    </button>
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Artask;
