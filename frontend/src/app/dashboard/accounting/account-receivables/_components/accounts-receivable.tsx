'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { FC, useEffect, useLayoutEffect, useState } from 'react';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { NewPayable } from '@/app/dashboard/accounting/_components/model';
import AccountsPagination from '@/app/dashboard/accounting/_components/pagination';
import CustomTooltip from '@/app/dashboard/accounting/_components/Tooltip';
import { AccountReceivable } from '@/utils/financials/receivables/account-receivable';

const tableCellClasses =
  'pl-6 py-4 whitespace-nowrap text-sm text-peacoat font-poppins bg-white';

interface Props {
  accountReceivables: AccountReceivable[];
}
const AccountReceivables: FC<Props> = ({ accountReceivables }) => {
  const [copyReceiveables, setCopyReceiveables] = useState<AccountReceivable[]>(
    [],
  );
  const [searchedAccountReceivables, setSearchedAccountReceivables] = useState<
    AccountReceivable[]
  >([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Add state for current page
  const rowsPerPage = 10; // Define items per page
  const totalRecords = Math.ceil(
    searchedAccountReceivables.length / rowsPerPage,
  );
  // Calculate the index of the last item on the current page
  const indexOfLastItem = currentPage * rowsPerPage;
  // Calculate the index of the first item on the current page
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  // Get the current items to display
  const currentRecords = searchedAccountReceivables.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  useLayoutEffect(() => {
    setCopyReceiveables(accountReceivables);
    setSearchedAccountReceivables(accountReceivables);
  }, [accountReceivables]);

  useEffect(() => {
    const searchedAccountReceivables = copyReceiveables.filter(
      (account) =>
        account.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.status.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.received_amount.toString().includes(searchQuery),
    );
    setSearchedAccountReceivables(searchedAccountReceivables);
    setCurrentPage(1);
  }, [accountReceivables, copyReceiveables, searchQuery]);

  const clientTooltipText =
    'Client details are missing for this entry and will be reviewed.';

  const miscellaneousClass = `text-gray-300 font-normal italic`;

  return (
    <div className='overflow-x-auto'>
      <div className='mb-4 flex justify-between gap-2'>
        <Input
          placeholder='Filter by name, email, status, or amount...'
          value={searchQuery}
          onChange={(event) =>
            setSearchQuery((event.target as HTMLInputElement).value)
          }
          className='max-w-sm border border-borderGray placeholder:text-gray-300'
        />
        <div className='flex gap-3'>
          <Link href='/dashboard/clients'>
            <Button variant='outline'>Add Clients</Button>
          </Link>
          <NewPayable buttonName='New Invoice' type='client' />
        </div>
      </div>
      <Table className='divide-y divide-gray-200'>
        <TableHeader>
          <TableRow className='border-transparent bg-[rgba(3,4,94,0.08)]'>
            <TableHead className='pl-11 font-poppins text-sm font-medium leading-[21px]'>
              Clients Name
            </TableHead>
            <TableHead className='font-poppins text-sm font-medium leading-[21px]'>
              Email Address
            </TableHead>
            <TableHead className='font-poppins text-sm font-medium leading-[21px]'>
              Account Balance
            </TableHead>
            <TableHead className='font-poppins text-sm font-medium leading-[21px]'>
              Taxes
            </TableHead>
            <TableHead className='font-poppins text-sm font-medium leading-[21px]'>
              Payment Received
            </TableHead>
            <TableHead className='font-poppins text-sm font-medium leading-[21px]'>
              Status
            </TableHead>
            <TableHead className='font-poppins text-sm font-medium leading-[21px]'>
              Invoice
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className='bg-white'>
          {currentRecords?.map((member, index) => (
            <TableRow key={index} className='relative border-none'>
              <TableCell
                className={`${tableCellClasses} ${member.isUnassigned ? miscellaneousClass : ''}`.trim()}
              >
                <div className='flex items-center gap-2'>
                  <Avatar className='bg-gray-100'>
                    <AvatarFallback>{member?.name?.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className=''>
                    <div
                      className={`font-poppins text-xs leading-[18px] ${member.isUnassigned ? miscellaneousClass : 'font-semibold text-black'}`}
                    >
                      {member.name || '---'}
                      {member.isUnassigned && (
                        <CustomTooltip text={clientTooltipText} />
                      )}
                    </div>
                    <p className='text-[10px] font-normal'>---</p>
                  </div>
                </div>
              </TableCell>
              <TableCell
                className={`whitespace-nowrap ${member.isUnassigned ? miscellaneousClass : 'text-black'} py-4 pl-6 font-poppins text-xs font-normal leading-[18px]`}
              >
                <span className='font-poppins text-xs font-normal'>
                  {' '}
                  {member.email}
                </span>
                {member.isUnassigned && (
                  <CustomTooltip text={clientTooltipText} />
                )}
              </TableCell>
              <TableCell className='whitespace-nowrap py-4 pl-4 font-poppins text-sm leading-[18px]'>
                <div className='flex items-center gap-2'>
                  <span className='font-poppins text-xs font-medium leading-[18px]'>
                    {member.account_balance}
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
                <span>{member.received_amount || 0}</span>
              </TableCell>
              <TableCell className='whitespace-nowrap py-4 pl-4'>
                <div className='flex items-center gap-2 leading-[18px]'>
                  <div className='relative h-[10px] w-[10px]'>
                    <Image
                      src={`/assets/setting/team/${member.status == 'completed' ? 'online' : 'cancelled'}.svg`}
                      alt={`${member.status} pic`}
                      layout='fill'
                      objectFit='contain'
                    />
                  </div>
                  <div
                    className={`font-poppins text-xs font-medium ${member.status === 'pending' ? 'text-red-500' : 'text-black'}`}
                  >
                    {member.status == 'completed' ? 'Completed' : 'Pending'}
                  </div>
                </div>
              </TableCell>
              <TableCell className='whitespace-nowrap py-4 pl-6'>
                <div className='flex items-center gap-2 leading-[18px]'>
                  <div className='font-poppins text-xs font-medium leading-[18px] text-black'>
                    ---
                  </div>
                  <div className='relative h-[16px] w-[16px]'>
                    <Image
                      src='/assets/setting/team/pauseicon.svg'
                      alt='img'
                      layout='fill'
                      objectFit='contain'
                    />
                  </div>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
      <AccountsPagination
        totalPages={totalRecords}
        currentPage={currentPage}
        handleNextPage={(pageNumber) =>
          setCurrentPage(
            pageNumber + 1 > totalRecords ? pageNumber : pageNumber + 1,
          )
        }
        handlePreviousPage={(pageNumber) => setCurrentPage(pageNumber)}
        handleSelectedChange={(pageNumber) => setCurrentPage(pageNumber)}
      />
    </div>
  );
};

export default AccountReceivables;
