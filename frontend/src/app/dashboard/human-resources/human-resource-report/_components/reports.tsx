'use client';
import Image from 'next/image';
import React from 'react';

import { Card, CardTitle } from '@/components/ui/card';

// Reusable ReportCard Component
const ReportCard = ({
  title,
  imageSrc,
  subText,
  value,
  index,
  see_all,
}: {
  title: string;
  imageSrc: string;
  subText: string;
  value: string;
  index: number;
  see_all: boolean;
}) => (
  <Card
    key={index}
    className='flex cursor-pointer flex-col rounded-[10px] p-3 text-start text-black transition-transform'
  >
    <div className='flex flex-row items-center justify-start'>
      <div
        className={
          index === 2
            ? 'flex h-[36px] w-[36px] items-center justify-center rounded-full bg-[#F24E1E91]'
            : ''
        }
      >
        <Image
          src={imageSrc}
          alt={title}
          width={index === 2 ? 24 : 36}
          height={index === 2 ? 24 : 36}
        />
      </div>
      <div className='pl-[12px] text-center'>
        <CardTitle className='max-w-[170px] font-poppins text-[14.5px] font-medium leading-[21.75px] tracking-[-0.375px] text-black'>
          {title}
        </CardTitle>
      </div>
    </div>
    <div className='mb-4 mt-4 flex flex-row items-center'>
      <p className='text-[36px] font-bold text-black'>{value}</p>
      <p className='pl-[5px] font-poppins text-[12px] font-normal'>{subText}</p>
    </div>
    {see_all && (
      <div className='flex flex-row items-end justify-end'>
        <button className='flex h-[20px] w-[60px] flex-row items-center justify-center bg-[#A6A6A62E] font-montserrat text-[10px] text-black'>
          See All
          <Image
            src='/assets/human-resources/arrow-right.svg'
            height={16}
            width={16}
            alt='arrow'
          />
        </button>
      </div>
    )}
  </Card>
);

const Reports = () => {
  const reportData = [
    {
      title: 'Onboarding Process',
      imageSrc: '/assets/human-resources/logo1.svg',
      value: '312',
      subText: 'numbers',
      index: 0,
      see_all: true,
    },
    {
      title: 'Payroll Overview',
      imageSrc: '/assets/human-resources/logo2.svg',
      value: '$500,000',
      subText: '',
      index: 1,
      see_all: false,
    },
    {
      title: 'Insurance Covered',
      imageSrc: '/assets/human-resources/logo3.svg',
      value: '179',
      subText: 'Employees',
      index: 2,
      see_all: false,
    },
  ];

  return (
    <div className='pt-8'>
      <div className='grid gap-4 pb-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3'>
        {reportData.map((card) => (
          <ReportCard key={card.index} {...card} />
        ))}
      </div>
    </div>
  );
};

export default Reports;
