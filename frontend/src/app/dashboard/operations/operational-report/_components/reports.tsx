'use client';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';

// Reusable ReportCard Component
const ReportCard = ({
  title,
  imageSrc,
  value,
  index,
}: {
  title: string;
  imageSrc: string;

  value: string;

  index: number;
}) => (
  <Card
    key={index}
    className='flex cursor-pointer flex-col rounded-[10px] p-3 text-start text-black transition-transform'
  >
    <div className='flex flex-row items-center justify-between'>
      <div className='text-center'>
        <CardTitle className='max-w-[170px] font-poppins text-[14.5px] font-medium leading-[21.75px] tracking-[-0.375px] text-black'>
          {title}
        </CardTitle>
      </div>
      <div
        className={
          index === 0
            ? 'flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#08966324]'
            : ''
        }
      >
        <Image
          src={imageSrc}
          alt={title}
          width={index === 0 ? 24 : 36}
          height={index === 0 ? 24 : 36}
        />
      </div>
    </div>
    <p className='mb-4 mt-4 text-2xl font-bold text-black'>{value}</p>
  </Card>
);

// Reusable Dropdown Report Menu Component
const ReportMenu = () => (
  <Link href='/dashboard/actions/history' prefetch={false}>
    <Button variant='outline' className='px-4 py-2 text-[12px] font-medium'>
      <Image src='/assets/vendors/plus.svg' alt='Add' width={16} height={16} />
      <span className='ml-2 font-poppins text-xs font-semibold'>
        Report Status
      </span>
    </Button>
  </Link>
);

const Reports = () => {
  const reportData = [
    {
      title: 'Production Volume',
      imageSrc: '/assets/sale-marketing/logo1.svg',

      value: '1,234',

      index: 0,
    },
    {
      title: 'Uptime',
      imageSrc: '/assets/cyber-security/logo1.svg',

      value: '99.9%',

      index: 1,
    },
    {
      title: 'Order Fullfillment Rate',
      imageSrc: '/assets/cyber-security/logo2.svg',

      value: '95%',

      index: 2,
    },
    {
      title: 'Operational Efficiency',
      imageSrc: '/assets/cyber-security/logo3.svg',

      value: '87%',

      index: 3,
    },
  ];

  return (
    <div className='pt-8'>
      <div className='mb-4 flex justify-between'>
        <p className='font-martel-sans font-bold text-[#3C3744]'>
          General operation
        </p>
        <ReportMenu />
      </div>

      <div className='grid gap-4 pb-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
        {reportData.map((card) => (
          <ReportCard key={card.index} {...card} />
        ))}
      </div>
    </div>
  );
};

export default Reports;
