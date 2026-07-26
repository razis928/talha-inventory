'use client';
import Image from 'next/image';
import React from 'react';

import { Avatar } from '@/components/ui/avatar';
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

const EmployeeListPage = () => {
  const data = [
    {
      employee_name: 'Guy Hawkins',
      imageSrc: '/assets/human-resources/user.svg',
      dob: '05-10-1998',
      posistion: 'Human Resource',
      tasks_value: '$10,310.00',
      emp_id: '10031',
      dep_id: '1020900',
      tagging_id: 'Green',
      status: 'Absent',
    },
    {
      employee_name: 'Guy Hawkins',
      imageSrc: '/assets/human-resources/user.svg',
      dob: '05-10-1998',
      posistion: 'Human Resource',
      tasks_value: '$10,310.00',
      emp_id: '10031',
      dep_id: '1020900',
      tagging_id: 'Red',
      status: 'Active',
    },
    {
      employee_name: 'Guy Hawkins',
      imageSrc: '/assets/human-resources/user.svg',
      dob: '05-10-1998',
      posistion: 'Human Resource',
      tasks_value: '$10,310.00',
      emp_id: '10031',
      dep_id: '1020900',
      tagging_id: 'Green',
      status: 'Active',
    },
    {
      employee_name: 'Guy Hawkins',
      imageSrc: '/assets/human-resources/user.svg',
      dob: '05-10-1998',
      posistion: 'Human Resource',
      tasks_value: '$10,310.00',
      emp_id: '10031',
      dep_id: '1020900',
      tagging_id: 'Red',
      status: 'Sick Leave',
    },
  ];

  return (
    <div className='overflow-x-auto'>
      <Table className='divide-y divide-gray-200'>
        <TableHeader>
          <TableRow className='border-transparent bg-[rgba(3,4,94,0.08)]'>
            <TableHead className='pl-11 font-poppins text-sm font-medium leading-[21px]'>
              Employee Name
            </TableHead>
            <TableHead className='font-poppins text-sm font-medium leading-[21px]'>
              Position
            </TableHead>
            <TableHead className='font-poppins text-sm font-medium leading-[21px]'>
              Value of Tasks
            </TableHead>
            <TableHead className='font-poppins text-sm font-medium leading-[21px]'>
              Emp ID
            </TableHead>
            <TableHead className='font-poppins text-sm font-medium leading-[21px]'>
              Dep ID
            </TableHead>
            <TableHead className='font-poppins text-sm font-medium leading-[21px]'>
              Tagging ID
            </TableHead>
            <TableHead className='font-poppins text-sm font-medium leading-[21px]'>
              Emp-Status
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
                  {member.posistion}
                </span>
                {/* {member.isUnassigned && (
                  <CustomTooltip text={clientTooltipText} />
                )} */}
              </TableCell>
              <TableCell className='whitespace-nowrap py-4 pl-4 font-poppins text-sm leading-[18px]'>
                <div className='flex items-center gap-2'>
                  <span className='font-poppins text-xs font-medium leading-[18px]'>
                    {member.tasks_value}
                  </span>
                </div>
              </TableCell>
              <TableCell className='whitespace-nowrap py-4 pl-3 text-xs leading-[18px] text-gray-500'>
                <div className='flex items-center gap-2'>
                  <span className='font-poppins font-medium leading-[18px] text-[#EF1522]'>
                    {member.emp_id}
                  </span>
                </div>
              </TableCell>
              <TableCell className='whitespace-nowrap py-4 pl-6 font-poppins text-xs font-medium leading-[18px]'>
                <span>{member.dep_id}</span>
              </TableCell>
              <TableCell className='whitespace-nowrap py-4 pl-4'>
                <div className='flex items-center gap-2 leading-[18px]'>
                  <div className='flex flex-row items-start'>
                    <div className='flex h-[16px] w-[16px] flex-row items-center justify-center rounded-full bg-[#08966333]'>
                      <div
                        className={`h-[10px] w-[10px] ${member.tagging_id === 'Green' ? 'bg-[#089663]' : 'bg-[#EF1522]'} rounded-full`}
                      ></div>
                    </div>
                    <p
                      className={`pl-[10px] font-poppins text-xs font-medium ${member.tagging_id === 'Green' ? 'text-[#089663]' : 'text-[#EF1522]'} `}
                    >
                      {member.tagging_id}
                    </p>
                  </div>
                </div>
              </TableCell>
              <TableCell className='whitespace-nowrap py-4 pl-6'>
                <div className='flex items-center gap-2 leading-[18px]'>
                  <div className='h-[18px] w-[73px] rounded-[10px] bg-[#08966333] text-center'>
                    <p
                      className={`font-poppins text-[10px] font-medium ${member.status === 'Active' ? 'text-[#089663]' : 'text-[#EF1522]'}`}
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

export default EmployeeListPage;
