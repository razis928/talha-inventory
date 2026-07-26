import Link from 'next/link';
import React from 'react';

import { SelectCategories } from '@/app/dashboard/actions/_components/select-categories';

const Page = () => {
  return (
    <div className=''>
      <div className='w-full pt-10'>
        <div className='font-popines flex justify-between pe-16 ps-12 text-[14px] font-[500] text-[rgba(60,55,68,1)]'>
          <h3 className='font-poppins'>Select Categories</h3>
          <Link
            href='/dashboard/actions/history'
            className='cursor-pointer underline'
            prefetch={false}
          >
            <h3 className='pl-12 font-poppins font-[500] text-[rgba(3,4,94,1)]'>
              History
            </h3>
          </Link>
        </div>
        <div className='me-12 ms-12'>
          <SelectCategories />
        </div>
      </div>
    </div>
  );
};

export default Page;
