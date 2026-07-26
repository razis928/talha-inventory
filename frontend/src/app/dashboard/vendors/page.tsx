import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';

const VendorForm = dynamic(
  () => import('@/app/dashboard/vendors/_components/vendor-form'),
  {
    ssr: false,
  },
);

const Vendors = async () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <VendorForm type='add' />
      </Suspense>
    </div>
  );
};

export default Vendors;
