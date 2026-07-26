'use client';
import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const reports = [
  { label: 'Reports here', value: 'report-here' },
  // Other report items are commented out, could be added back if necessary
];

// Reusable ReportCard Component
const ReportCard = ({
  title,
  imageSrc,
  subImg,
  value,
  subText,
  index,
}: {
  title: string;
  imageSrc: string;
  subImg: string;
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
    <p className='mt-4 text-2xl font-bold text-black'>{value}</p>
    <div className='mt-[6px] flex flex-row items-center'>
      <Image src={subImg} alt={title} width={12} height={8} />
      <p className='pl-1 text-[10px] font-normal text-[#3C3744]'>{subText}</p>
    </div>
  </Card>
);

// Reusable Dropdown Report Menu Component
const ReportMenu = () => (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Button variant='outline' className='px-4 py-2 text-[12px] font-medium'>
        <Image
          src='/assets/vendors/plus.svg'
          alt='Add'
          width={16}
          height={16}
        />
        <span className='ml-2 font-poppins text-xs font-semibold'>
          Report Status
        </span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align='end' className='w-60 border-none bg-white'>
      <Accordion
        type='single'
        collapsible
        defaultValue='item-1'
        className='m-auto w-11/12 border-none'
      >
        <AccordionItem value='item-1' className='border-none'>
          <AccordionTrigger className='font-inter text-xl font-semibold leading-6 hover:no-underline'>
            Reports
          </AccordionTrigger>
          {reports.map((report) => (
            <AccordionContent
              key={report.value}
              className='py-3 font-inter text-sm font-normal leading-[19.38px]'
            >
              <Link href={`/${report.value}`} prefetch={false}>
                {report.label}
              </Link>
            </AccordionContent>
          ))}
        </AccordionItem>
      </Accordion>
      <DropdownMenuSeparator />
    </DropdownMenuContent>
  </DropdownMenu>
);

const Reports = () => {
  const reportData = [
    {
      title: 'Revenue',
      imageSrc: '/assets/sale-marketing/logo1.svg',
      subImg: '/assets/sale-marketing/polygon-incr.svg',
      value: '$95,567',
      subText: '15% Increase',
      index: 0,
    },
    {
      title: 'New Leads',
      imageSrc: '/assets/cyber-security/logo1.svg',
      subImg: '/assets/sale-marketing/polygon-decr.svg',
      value: '459',
      subText: '45% decrease',
      index: 1,
    },
    {
      title: 'Conversation Rate',
      imageSrc: '/assets/cyber-security/logo2.svg',
      subImg: '/assets/sale-marketing/polygon-incr.svg',
      value: '5.9%',
      subText: '9% Increase',
      index: 2,
    },
    {
      title: 'CAC',
      imageSrc: '/assets/cyber-security/logo3.svg',
      subImg: '/assets/sale-marketing/polygon-incr.svg',
      value: '$159',
      subText: '5% Increase',
      index: 3,
    },
  ];

  return (
    <div className='pt-8'>
      <div className='mb-4 flex justify-between'>
        <p className='font-martel-sans font-bold text-[#3C3744]'>
          Sales & Marketing
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
