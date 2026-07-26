import dynamic from 'next/dynamic';
import React from 'react';
const SignUpForm = dynamic(
  () => import('@/app/(auth)/signup/_components/form'),
  { ssr: false },
);

const page = () => {
  return <SignUpForm />;
};

export default page;
