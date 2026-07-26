import dynamic from 'next/dynamic';
import { Suspense } from 'react';
const Invoice = dynamic(
  () => import('@/app/(financial_statements)/invoice/_components/invoice'),
  {
    ssr: false,
  },
);
const page = () => {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <Invoice />
      </Suspense>
    </>
  );
};

export default page;
