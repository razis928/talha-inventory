import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { Button } from '@/components/ui/button';

import { getCompanyVendorsList } from '@/utils/financials/payables/payable-vendors-list';
import { createClient } from '@/utils/supabase/server';

const VendorDetails = async ({ params }: { params: { id: string } }) => {
  const { id } = params;

  const supabase = createClient();
  const vendorsList = (await getCompanyVendorsList(supabase)) || [];

  const vendorById = vendorsList?.find((vendor) => vendor.id === id);

  if (!vendorById) {
    return (
      <div className='flex h-screen items-center justify-center'>
        <h1>Vendor Details not found</h1>
      </div>
    );
  }

  return (
    <div className='h-screen p-4'>
      <div className='mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-md'>
        <div className='mb-8 flex items-center'>
          <Image
            src='/assets/vendors/vendor.svg' // Update path as necessary
            alt='Info Icon'
            width={40}
            height={40}
            className='mr-4'
          />
          <h1 className='font-poppins text-2xl font-semibold leading-[36px] text-peacoat'>
            {vendorById?.company_name}
          </h1>
        </div>

        <div className='space-y-4 pl-[50px] font-poppins leading-5 text-peacoat'>
          <div className='item-center flex justify-between gap-8'>
            <span className='text-xl font-semibold leading-8'>
              Company's Address:
            </span>
            <span className='w-[64%] pt-2 text-left font-medium'>
              {vendorById?.address_1}
            </span>
          </div>
          <div className='item-center flex justify-between gap-8'>
            <span className='text-xl font-semibold leading-8'>
              Company's 2 Address:
            </span>
            <span className='w-[64%] pt-2 text-left font-medium'>
              {vendorById?.address_2}
            </span>
          </div>
          <div className='item-center flex justify-between gap-8'>
            <span className='text-xl font-semibold leading-8'>
              Phone Number:
            </span>
            <span className='w-[64%] pt-2 text-left font-medium'>
              {vendorById?.phone}
            </span>
          </div>
          <div className='item-center flex justify-between gap-8'>
            <span className='text-xl font-semibold leading-8'>
              Email Address:
            </span>
            <span className='w-[64%] pt-2 text-left font-medium'>
              {vendorById?.email}
            </span>
          </div>
          <div className='item-center flex justify-between gap-8'>
            <span className='text-xl font-semibold leading-8'>Tax ID:</span>
            <span className='w-[64%] pt-2 text-left font-medium'>
              {vendorById?.tax_payer_id}
            </span>
          </div>
        </div>

        <div className='mt-12 flex justify-start'>
          <Link href={`/dashboard/vendors/update/${vendorById?.id}`}>
            <Button className='ml-[48px] rounded bg-primary px-12 py-2 font-poppins font-normal text-white'>
              Edit Vendor Details
            </Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default VendorDetails;
