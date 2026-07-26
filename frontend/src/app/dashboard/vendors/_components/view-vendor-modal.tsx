import { VisuallyHidden } from '@radix-ui/react-visually-hidden';
import Image from 'next/image';
import Link from 'next/link';
import React, { FC, useState } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

import { Vendor } from '@/types/vendor';

interface Props {
  vendor: Vendor;
  setVendor: (vendor: Vendor | null) => void;
}

const VendorDetailsModal: FC<Props> = ({ vendor, setVendor }: Props) => {
  const [open, setOpen] = useState(true);
  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        setOpen(open);
        if (!open) setVendor(null);
      }}
    >
      <DialogContent className='border-none bg-transparent shadow-none lg:max-w-5xl'>
        <DialogHeader>
          <VisuallyHidden>
            <DialogTitle>Edit profile</DialogTitle>
          </VisuallyHidden>
        </DialogHeader>
        <div className='grid gap-4'>
          <div className='p-4'>
            <div className='mx-auto max-w-4xl rounded-lg bg-white p-8 shadow-md'>
              <div className='mb-8 flex items-center'>
                <Image
                  src='/assets/vendors/vendor.svg'
                  alt='Info Icon'
                  width={40}
                  height={40}
                  className='mr-4'
                />
                <h1 className='font-poppins text-2xl font-semibold leading-[36px] text-peacoat'>
                  {vendor?.company_name}
                </h1>
              </div>

              <div className='space-y-4 pl-[50px] font-poppins leading-5 text-peacoat'>
                <div className='item-center flex justify-between gap-8'>
                  <span className='text-xl font-semibold leading-8'>
                    Company's Address:
                  </span>
                  <span className='w-[64%] pt-2 text-left font-medium'>
                    {vendor?.address_1}
                  </span>
                </div>
                <div className='item-center flex justify-between gap-8'>
                  <span className='text-xl font-semibold leading-8'>
                    Payment Account #;
                  </span>
                  <span className='w-[64%] pt-2 text-left font-medium'>
                    {vendor?.account_number}
                  </span>
                </div>
                <div className='item-center flex justify-between gap-8'>
                  <span className='text-xl font-semibold leading-8'>
                    Phone Number:
                  </span>
                  <span className='w-[64%] pt-2 text-left font-medium'>
                    {vendor?.phone_number}
                  </span>
                </div>
                <div className='item-center flex justify-between gap-8'>
                  <span className='text-xl font-semibold leading-8'>
                    Email Address:
                  </span>
                  <span className='w-[64%] pt-2 text-left font-medium'>
                    {vendor?.email_address}
                  </span>
                </div>
                <div className='item-center flex justify-between gap-8'>
                  <span className='text-xl font-semibold leading-8'>
                    Tax Payer ID :
                  </span>
                  <span className='w-[64%] pt-2 text-left font-medium'>
                    {vendor?.tax_payer_id}
                  </span>
                </div>
              </div>

              <div className='mt-12 flex justify-start'>
                <Link href={`/dashboard/vendors/update/${vendor.id}`}>
                  <Button className='ml-[48px] rounded bg-primary px-12 py-2 font-poppins font-normal text-white'>
                    Edit Vendor Details
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default VendorDetailsModal;
