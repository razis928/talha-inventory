import { format } from 'date-fns';
import Link from 'next/link';
import * as React from 'react';

import {
  Table as ShadcnTable,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import {
  getCompanyVendorsList,
  VendorList,
} from '@/utils/financials/payables/payable-vendors-list';
import { createClient } from '@/utils/supabase/server';

const VendorsTable: React.FC = async () => {
  const supabaseClient = createClient();
  const companyVendors = (await getCompanyVendorsList(
    supabaseClient,
  )) as VendorList[];

  return (
    <>
      <div className='mx-3 overflow-x-auto'>
        <ShadcnTable className='min-w-full'>
          <TableHeader className='mb-5 rounded-t-lg bg-primary opacity-90'>
            <TableRow className=''>
              <TableHead className='w-1/3 px-6 py-3 pl-[97px] text-left font-poppins text-base font-normal tracking-wider text-white'>
                Company
              </TableHead>
              <TableHead className='w-1/3 px-6 py-3 text-center font-poppins text-base font-normal tracking-wider text-white'>
                Unpaid Balance
              </TableHead>
              <TableHead className='w-1/3 px-6 py-3 text-center font-poppins text-base font-normal tracking-wider text-white'>
                Date
              </TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className='bg-white py-5'>
            {companyVendors?.map((row, index) => (
              <TableRow
                key={index}
                className='border-b border-smoke400Opac px-2 py-2 leading-[21.38px]'
              >
                <TableCell className='relative float-left whitespace-nowrap px-4 text-center text-[14.25px] font-medium leading-[21.38px]'>
                  <Link
                    href={`/dashboard/vendors/${row?.id}`}
                    className='pl-[84px]'
                    prefetch={false}
                  >
                    <span className='absolute bottom-0 right-0 w-[calc(100%-20px)] text-smoke-400' />
                    {row?.company_name}
                  </Link>
                </TableCell>
                <TableCell className='relative whitespace-nowrap px-4 text-[14.25px] font-semibold leading-[21.38px]'>
                  <Link href={`/dashboard/vendors/${row?.id}`} prefetch={false}>
                    <span className='bottom-0 right-0 flex h-full w-[calc(100%-20px)] items-center justify-center text-smoke-400'>
                      {row.balance}
                    </span>
                  </Link>
                </TableCell>
                <TableCell className='relative whitespace-nowrap px-4 text-center text-[14.25px] font-semibold leading-[21.38px]'>
                  <Link href={`/dashboard/vendors/${row?.id}`} prefetch={false}>
                    <span className='absolute bottom-0 left-0 w-[calc(100%-20px)]' />

                    {format(new Date(row?.invoice_date), 'MM/dd/yyyy')}
                  </Link>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </ShadcnTable>
      </div>
    </>
  );
};

export default VendorsTable;
