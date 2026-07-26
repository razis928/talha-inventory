'use client';
import Image from 'next/image';
import React, { FC, Suspense } from 'react';
import Stripe from 'stripe';

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

import AddNewPaymentMethodButton from '@/app/dashboard/settings/payment-details/_components/add-new-payment-method';

interface Props {
  accounts: Stripe.FinancialConnections.Account[];
}

const Paymentdetails: FC<Props> = ({ accounts }: Props) => {
  return !accounts || accounts.length === 0 ? (
    <NoAccountsFound />
  ) : (
    <div className='flex flex-col gap-5'>
      <div className='font-poppins text-base font-semibold leading-[24px] text-smoke-400'>
        Payment Details
      </div>
      <div className='mb-10 flex w-[90%] flex-col gap-10 bg-white px-9 py-16 2xl:w-[85%]'>
        <div className='flex w-full flex-wrap gap-5 2xl:w-[90%] 2xl:gap-8'>
          {accounts?.map((item, index) => (
            <Card className='w-[30%]' key={index}>
              <CardHeader>
                <div className='flex flex-row gap-10'>
                  <CardTitle className='font-poppins text-[14.9px] font-bold leading-[22.35px] text-smoke-400'>
                    {item.display_name}
                  </CardTitle>
                  <CardDescription className='flex items-center rounded-[10px] bg-green-300 px-2 font-poppins text-[9.25px] font-semibold leading-[13.88px] text-smoke-400'>
                    {item.balance?.current?.usd || 0}
                  </CardDescription>
                </div>
              </CardHeader>
              <CardFooter>
                <p className='font-poppins text-[14.9px] font-semibold leading-[22.35px] text-gray-500'>
                  {item.institution_name}- {item.last4}
                </p>
              </CardFooter>
            </Card>
          ))}
        </div>
        <div className='flex justify-end'>
          <Suspense fallback={<div>Loading...</div>}>
            <AddNewPaymentMethodButton />
          </Suspense>
        </div>
      </div>
    </div>
  );
};

export default React.memo(Paymentdetails);

const NoAccountsFound = () => {
  return (
    <div className='flex'>
      <div className='basis-3/5 gap-5 rounded-[5px] bg-white p-5'>
        <h3 className='font-poppins text-base font-semibold leading-[21px] text-smoke-400'>
          Payment method
        </h3>
        <Card className='my-7'>
          <CardContent className='my-20 flex flex-col items-center justify-center'>
            <Image
              src='/assets/setting/payment/fluent-payment.svg'
              alt='fluentPayment'
              width={36}
              height={36}
            />
            <p className='font-poppins text-xs font-semibold leading-[18px] text-gray-400'>
              No payment method added Yet
            </p>
          </CardContent>
        </Card>
        <Suspense fallback={<div>Loading...</div>}>
          <AddNewPaymentMethodButton />
        </Suspense>
      </div>
    </div>
  );
};
