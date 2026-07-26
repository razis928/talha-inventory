'use client';
import Image from 'next/image';
import React, { FC } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { complianceData } from '@/app/dashboard/actions/compliance/mockdata';
const tableCellClasses = ' text-sm bg-white text-[#3C3744] whitespace-nowrap';

const Compliance: FC = () => {
  return (
    <div className='m-auto mb-12 mt-12 max-w-[1200px] overflow-x-auto rounded-lg'>
      <Table className='table-fixed border-collapse divide-y divide-gray-200 font-poppins'>
        <TableHeader>
          <TableRow className='rounded-lg border-transparent bg-[rgba(3,4,94,0.04)]'>
            <TableHead className='ps-16 text-left font-poppins text-sm font-medium leading-[21px]'>
              Compliance
            </TableHead>
            <TableHead className='ps-20 text-left font-poppins text-sm font-medium leading-[21px]'>
              Type
            </TableHead>
            <TableHead className='ps-20 text-left font-poppins text-sm font-medium leading-[21px]'>
              Date Created
            </TableHead>
            <TableHead className='ps-20 text-left font-poppins text-sm font-medium leading-[21px]'>
              Due Date
            </TableHead>
            <TableHead className='ps-20 text-left font-poppins text-sm font-medium leading-[21px]'>
              Priority
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className='bg-white'>
          {complianceData.map((row, index) => (
            <TableRow
              key={index}
              className='relative border-b border-gray-200' // Added border-bottom here
            >
              <TableCell
                className={`${tableCellClasses} py-8 ps-16 font-poppins`}
              >
                {row.compliance}
              </TableCell>
              <TableCell
                className={`${tableCellClasses} py-8 ps-20 font-poppins`}
              >
                {row.type}
              </TableCell>
              <TableCell
                className={`${tableCellClasses} py-8 ps-20 font-poppins`}
              >
                {row.dateCreated}
              </TableCell>
              <TableCell
                className={`${tableCellClasses} py-8 ps-20 font-poppins`}
              >
                {row.dueDate}
              </TableCell>
              <TableCell
                className={`${tableCellClasses} py-8 ps-20 font-poppins`}
              >
                <div className='flex items-center gap-2'>
                  <Image
                    src={row.priorityImage} // Dynamic image for each row
                    alt='Priority Image'
                    width={50}
                    height={20}
                  />
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
export default Compliance;
