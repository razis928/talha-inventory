import dynamic from 'next/dynamic';
import { Suspense } from 'react';
const CargoPolicy = dynamic(
  () => import('@/app/(financial_statements)/cargo-policy/_components/policy'),
  {
    ssr: false,
  },
);
const page = () => {
  return (
    <>
      <Suspense fallback={<div>Loading...</div>}>
        <CargoPolicy />
      </Suspense>
    </>
  );
};

export default page;
