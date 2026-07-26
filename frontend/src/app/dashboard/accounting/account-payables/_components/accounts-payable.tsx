'use client';
import { format } from 'date-fns';
import Link from 'next/link';
import React, { FC, useEffect, useLayoutEffect, useState } from 'react';

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

import { AccountPayables } from '@/types/vendor';

const tableHeadClasses =
  'bg-primary text-white font-light text-sm font-poppins';
const tableCellClasses =
  'pl-6 py-4 whitespace-nowrap text-sm text-peacoat font-poppins bg-white';

interface Props {
  accountPayables: AccountPayables[] | [];
}

const AccountsPayable: FC<Props> = ({ accountPayables }) => {
  const [copyPayables, setCopyPayables] = useState<AccountPayables[]>([]);
  const [searchedAccountPayables, setSearchedAccountPayables] = useState<
    AccountPayables[]
  >([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1); // Add state for current page
  const rowsPerPage = 10; // Define items per page
  const totalRecords = Math.ceil(searchedAccountPayables.length / rowsPerPage);
  // Calculate the index of the last item on the current page
  const indexOfLastItem = currentPage * rowsPerPage;
  // Calculate the index of the first item on the current page
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  // Get the current items to display
  const currentRecords = searchedAccountPayables.slice(
    indexOfFirstItem,
    indexOfLastItem,
  );

  useLayoutEffect(() => {
    setCopyPayables(accountPayables);
    setSearchedAccountPayables(accountPayables);
  }, [accountPayables]);

  useEffect(() => {
    const searchedAccountPayables = copyPayables.filter(
      (account) =>
        account.company_name
          ?.toLowerCase()
          .includes(searchQuery.toLowerCase()) ||
        account.status?.toLowerCase().includes(searchQuery?.toLowerCase()) ||
        account.description?.toLowerCase().toString()?.includes(searchQuery),
    );
    setSearchedAccountPayables(searchedAccountPayables);
    setCurrentPage(1);
  }, [accountPayables, copyPayables, searchQuery]);

  const vendorTooltipText =
    'Vendor details are missing for this entry and will be reviewed.';
  const miscellaneousClass = `text-gray-300 italic font-normal`;

  return (
    <>
      <div className='mb-4 flex justify-between gap-2'>
        <Input
          placeholder='Filter by vendor_name, description, status...'
          value={searchQuery}
          onChange={(event) =>
            setSearchQuery((event.target as HTMLInputElement).value)
          }
          className='max-w-sm border border-borderGray placeholder:text-gray-300'
        />
        <div className='flex gap-3'>
          <Link href='/dashboard/vendors'>
            <Button variant='outline'>Add Vendor</Button>
          </Link>
          <NewPayable buttonName='New Payable' type='vendor' />
        </div>
      </div>
      <div className='mt-5 overflow-x-auto'>
        <div className='inline-block min-w-full'>
          <Table className='min-w-[800px] divide-y divide-gray-200 bg-white'>
            <TableHeader className='bg-white'>
              <TableRow className='border-transparent'>
                <TableHead className={tableHeadClasses}>Invoice Date</TableHead>
                <TableHead className={tableHeadClasses}>Due Date</TableHead>
                <TableHead className={tableHeadClasses}>Vendor Name</TableHead>
                <TableHead className={tableHeadClasses}>Description</TableHead>
                <TableHead className={tableHeadClasses}>
                  Invoice Number
                </TableHead>
                <TableHead className={tableHeadClasses}>Amount ($)</TableHead>
                <TableHead className={tableHeadClasses}>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className='bg-white'>
              {currentRecords?.map((account, index) => (
                <TableRow key={index} className='relative border-none'>
                  <TableCell
                    className={`${tableCellClasses} ${account.isUnassigned ? miscellaneousClass : ''}`.trim()}
                  >
                    <div className='pb-2 pt-2 text-sm font-light'>
                      {isNaN(new Date(account.invoice_date).getTime()) ? (
                        <>
                          {account.invoice_date}
                          <CustomTooltip text={vendorTooltipText} />
                        </>
                      ) : (
                        format(new Date(account.invoice_date), 'MM/dd/yyyy')
                      )}
                    </div>
                  </TableCell>
                  <TableCell
                    className={`${tableCellClasses} ${account.isUnassigned ? miscellaneousClass : ''}`.trim()}
                  >
                    {isNaN(new Date(account.due_date).getTime()) ? (
                      <>
                        {account.due_date}
                        <CustomTooltip text={vendorTooltipText} />
                      </>
                    ) : (
                      format(new Date(account.due_date), 'MM/dd/yyyy')
                    )}
                  </TableCell>
                  <TableCell
                    className={`${tableCellClasses} ${account.isUnassigned ? miscellaneousClass : ''}`.trim()}
                  >
                    {account.company_name}
                    {account.isUnassigned && (
                      <CustomTooltip text={vendorTooltipText} />
                    )}
                  </TableCell>
                  <TableCell className='whitespace-nowrap bg-white py-4 pl-6 text-sm text-gray-500'>
                    <div className='flex items-center gap-2'>
                      <span className='font-poppins text-sm text-peacoat'>
                        {account.description}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell
                    className={`${tableCellClasses} ${account.isUnassigned ? miscellaneousClass : ''}`.trim()}
                  >
                    {account.invoice_number}
                    {account.isUnassigned && (
                      <CustomTooltip text={vendorTooltipText} />
                    )}
                  </TableCell>
                  <TableCell className='whitespace-nowrap py-4 pl-6 text-sm text-black'>
                    <div className='font-poppins text-sm text-peacoat'>
                      {account.amount}
                    </div>
                  </TableCell>
                  <TableCell className='whitespace-nowrap py-4 pl-6 text-sm text-black'>
                    <div className='font-poppins text-sm text-peacoat'>
                      {account.status}
                    </div>
                  </TableCell>
                  <span className='absolute bottom-0 left-[25px] w-[calc(100%-40px)] border-b border-[rgba(60,55,68,0.12)]' />
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <AccountsPagination
            totalPages={totalRecords}
            currentPage={currentPage}
            handleNextPage={(pageNumber) => {
              const nextPage = pageNumber + 1;
              setCurrentPage(nextPage > totalRecords ? totalRecords : nextPage);
            }}
            handlePreviousPage={(pageNumber) => setCurrentPage(pageNumber)}
            handleSelectedChange={(pageNumber) => setCurrentPage(pageNumber)}
          />
        </div>
      </div>
    </>
  );
};

export default AccountsPayable;
