import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';
const DebtCancellation = dynamic(
  () =>
    import(
      '@/app/(financial_statements)/debt-cancellation/_components/cancallation'
    ),
  {
    ssr: false,
  },
);
const page = () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <DebtCancellation />
      </Suspense>
    </div>
  );
};

export default page;
