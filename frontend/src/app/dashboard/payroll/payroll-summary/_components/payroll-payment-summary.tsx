'use client';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import AccountsPagination from '@/app/dashboard/accounting/_components/pagination';

const tableCellClasses =
  'pl-6 py-4 whitespace-nowrap text-sm text-peacoat font-poppins bg-white';

// Reusable Dropdown Report Menu Component
const ReportMenu = () => (
  <Link href='/dashboard/payroll/payroll-payment-status' prefetch={false}>
    <Button variant='outline' className='px-4 py-2 text-[12px] font-medium'>
      <Image src='/assets/vendors/plus.svg' alt='Add' width={16} height={16} />
      <span className='ml-2 font-poppins text-xs font-semibold'>
        Report Status
      </span>
    </Button>
  </Link>
);

const PayrollPaymentSummaryPage = () => {
  const data = [
    {
      employee_name: 'Guy Hawkins',
      imageSrc: '/assets/human-resources/user.svg',
      dob: '05-10-1998',
      email: 'Guyhawkins@companyname.com',
      gross: '$10,310.00',
      taxes: '$100.31',
      net_salary: '$10,209.00',
      performance: 'Green',
      status: 'paid',
    },
    {
      employee_name: 'Guy Hawkins',
      imageSrc: '/assets/human-resources/user.svg',
      dob: '05-10-1998',
      email: 'Guyhawkins@companyname.com',
      gross: '$10,310.00',
      taxes: '$100.31',
      net_salary: '$10,209.00',
      performance: 'Green',
      status: 'unpaid',
    },
    {
      employee_name: 'Guy Hawkins',
      imageSrc: '/assets/human-resources/user.svg',
      dob: '05-10-1998',
      email: 'Guyhawkins@companyname.com',
      gross: '$10,310.00',
      taxes: '$100.31',
      net_salary: '$10,209.00',
      performance: 'Green',
      status: 'paid',
    },
    {
      employee_name: 'Guy Hawkins',
      imageSrc: '/assets/human-resources/user.svg',
      dob: '05-10-1998',
      email: 'Guyhawkins@companyname.com',
      gross: '$10,310.00',
      taxes: '$100.31',
      net_salary: '$10,209.00',
      performance: 'Green',
      status: 'paid',
    },
    {
      employee_name: 'Guy Hawkins',
      imageSrc: '/assets/human-resources/user.svg',
      dob: '05-10-1998',
      email: 'Guyhawkins@companyname.com',
      gross: '$10,310.00',
      taxes: '$100.31',
      net_salary: '$10,209.00',
      performance: 'Red',
      status: 'unpaid',
    },
  ];

  return (
    <div className='overflow-x-auto'>
      <div className='mb-4 flex justify-between'>
        <p className='font-martel-sans font-bold text-[#3C3744]'></p>
        <ReportMenu />
      </div>

      <Table className='divide-y divide-gray-200'>
        <TableHeader>
          <TableRow className='border-transparent bg-[rgba(3,4,94,0.08)]'>
            <TableHead className='pl-11 font-poppins text-sm font-medium leading-[21px]'>
              Employee Name
            </TableHead>
            <TableHead className='font-poppins text-sm font-medium leading-[21px]'>
              Email Address
            </TableHead>
            <TableHead className='font-poppins text-sm font-medium leading-[21px]'>
              Gross
            </TableHead>
            <TableHead className='font-poppins text-sm font-medium leading-[21px]'>
              Taxes
            </TableHead>
            <TableHead className='font-poppins text-sm font-medium leading-[21px]'>
              Net Salary
            </TableHead>
            <TableHead className='font-poppins text-sm font-medium leading-[21px]'>
              Performance
            </TableHead>
            <TableHead className='font-poppins text-sm font-medium leading-[21px]'>
              Status
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className='bg-white'>
          {data?.map((member, index) => (
            <TableRow key={index} className='relative border-none'>
              <TableCell className={`${tableCellClasses}`}>
                <div className='flex items-center gap-2'>
                  <Avatar className=''>
                    <Image
                      className='h-[36px] w-[36px] rounded-full'
                      src={member.imageSrc}
                      height={36}
                      width={36}
                      alt='avatar-logo'
                    />
                  </Avatar>
                  <div className=''>
                    <div className='leading- />[18px] flex flex-col font-poppins text-xs font-semibold text-black'>
                      <p>{member.employee_name}</p>
                      <p className='text-[10px] font-normal'>{member.dob}</p>
                    </div>
                  </div>
                </div>
              </TableCell>
              <TableCell className='whitespace-nowrap py-4 pl-6 font-poppins text-xs font-normal leading-[18px] text-black'>
                <span className='font-poppins text-xs font-normal'>
                  {member.email}
                </span>
                {/* {member.isUnassigned && (
                  <CustomTooltip text={clientTooltipText} />
                )} */}
              </TableCell>
              <TableCell className='whitespace-nowrap py-4 pl-4 font-poppins text-sm leading-[18px]'>
                <div className='flex items-center gap-2'>
                  <span className='font-poppins text-xs font-medium leading-[18px]'>
                    {member.gross}
                  </span>
                </div>
              </TableCell>
              <TableCell className='whitespace-nowrap py-4 pl-3 text-xs leading-[18px] text-gray-500'>
                <div className='flex items-center gap-2'>
                  <span className='font-poppins font-medium leading-[18px] text-[#EF1522]'>
                    {member.taxes}
                  </span>
                </div>
              </TableCell>
              <TableCell className='whitespace-nowrap py-4 pl-6 font-poppins text-xs font-medium leading-[18px]'>
                <span>{member.net_salary}</span>
              </TableCell>
              <TableCell className='whitespace-nowrap py-4 pl-4'>
                <div className='flex items-center gap-2 leading-[18px]'>
                  <div className='flex flex-row items-start'>
                    <div className='flex h-[16px] w-[16px] flex-row items-center justify-center rounded-full bg-[#08966333]'>
                      <div
                        className={`h-[10px] w-[10px] ${member.performance === 'Green' ? 'bg-[#089663]' : 'bg-[#EF1522]'} rounded-full`}
                      ></div>
                    </div>
                    <p
                      className={`pl-[10px] font-poppins text-xs font-medium ${member.performance === 'Green' ? 'text-[#089663]' : 'text-[#EF1522]'} `}
                    >
                      {member.performance}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className='whitespace-nowrap py-4 pl-6'>
                <div className='flex items-center gap-2 leading-[18px]'>
                  <div className='h-[18px] w-[73px] rounded-[10px] bg-[#08966333] text-center'>
                    <p
                      className={`font-poppins text-[10px] font-medium ${member.status === 'paid' ? 'text-[#089663]' : 'text-[#EF1522]'}`}
                    >
                      {member.status}
                    </p>
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <AccountsPagination
        totalPages={0}
        currentPage={0}
        handleNextPage={() => {}}
        handlePreviousPage={() => {}}
        handleSelectedChange={() => {}}
      />
    </div>
  );
};

export default PayrollPaymentSummaryPage;
