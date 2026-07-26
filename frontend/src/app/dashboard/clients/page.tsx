import dynamic from 'next/dynamic';
import React, { Suspense } from 'react';

const ClientForm = dynamic(
  () => import('@/app/dashboard/clients/_components/client-form'),
  {
    ssr: false,
  },
);

const Clients = async () => {
  return (
    <div>
      <Suspense fallback={<div>Loading...</div>}>
        <ClientForm type='add' />
      </Suspense>
    </div>
  );
};

export default Clients;
