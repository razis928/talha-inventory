'use client';
import Image from 'next/image';
import React from 'react';

import { Card, CardTitle } from '@/components/ui/card';

// Reusable ReportCard Component
const ReportCard = ({
  title,
  imageSrc,
  value,
  subText,
  index,
}: {
  title: string;
  imageSrc: string;
  value: string;
  subText: string;
  index: number;
}) => (
  <Card
    key={index}
    className='flex cursor-pointer flex-col rounded-[10px] p-3 text-start text-black transition-transform'
  >
    <div className='flex flex-row items-center justify-between'>
      <div className='text-center'>
        <CardTitle className='max-w-[125px] font-poppins text-[14.5px] font-medium leading-[21.75px] tracking-[-0.375px] text-black'>
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
    <p className='mt-4 text-2xl font-bold text-black'>{value}</p>
    <p className='mt-[6px] text-[10px] font-normal text-[#3C3744]'>{subText}</p>
  </Card>
);

const Reports = () => {
  const reportData = [
    {
      title: 'Active Threats',
      imageSrc: '/assets/cyber-security/logo4.svg',
      value: '17',
      subText: '+2 in last hour',
      index: 0,
    },
    {
      title: 'Blocked Attacks',
      imageSrc: '/assets/cyber-security/logo1.svg',
      value: '9,873',
      subText: 'Today',
      index: 1,
    },
    {
      title: 'System Uptime',
      imageSrc: '/assets/cyber-security/logo2.svg',
      value: '99.9%',
      subText: 'Last 30 days',
      index: 2,
    },
    {
      title: 'Active Users',
      imageSrc: '/assets/cyber-security/logo3.svg',
      value: '2,557',
      subText: 'Across all systems',
      index: 3,
    },
  ];

  return (
    <div className='pt-8'>
      <div className='mb-4 flex justify-between'>
        <p className='font-martel-sans font-bold text-[#3C3744]'>
          Cyber-Security
        </p>
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
