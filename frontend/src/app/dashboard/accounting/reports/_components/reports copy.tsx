'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

const reports = [
  {
    label: 'General Ledger',
    value: 'general-ledger',
  },
  {
    label: 'Balance Sheet',
    value: 'balance-sheet',
  },

  {
    label: 'Bank Reconciliation',
    value: 'bank-reconciliation',
  },
  {
    label: 'Profit & Loss Statement',
    value: 'profit_loss',
  },
  {
    label: 'Accounts Payable Subsidiary',
    value: 'account-payable-subsidiary-ledger',
  },
  {
    label: 'Accounts Payable Vendor List',
    value: 'account-payable-vendor-list',
  },
  {
    label: 'Accounts Receivable Subsidiary',
    value: 'account-receivable-subsidary-ledger',
  },
  {
    label: 'Accounts Receivable Customer List',
    value: 'account-receivable-customer-list',
  },
];
const Reports = () => {
  const [activeCard, setActiveCard] = useState<number>(0);

  //  Given data from the spreadsheet
  const total_revenue = 78787878;
  const total_expenses = 16680382.91;
  const total_assets = 15270030.86;
  const total_liabilities = 15152628.73;
  const budgetValue = 3000000;

  const [netIncome] = useState<number>(total_revenue - total_expenses);
  const [totalLiabilities] = useState<number>(total_liabilities);
  const [budget] = useState<number>(budgetValue);
  const [equity] = useState<number>(total_assets - total_liabilities);

  const handleCardClick = (index: number) => {
    setActiveCard(index);
  };

  const reportData = [
    {
      title: 'Net Income',
      imageSrc: '/assets/reports/net-income.svg',
      amount: `$${netIncome.toLocaleString()}`,
      index: 0,
    },
    {
      title: 'Total Liabilities',
      imageSrc: '/assets/reports/total-liabilities.svg',
      amount: `$${totalLiabilities.toLocaleString()}`,
      index: 1,
    },
    {
      title: 'Budget',
      imageSrc: '/assets/reports/budget.svg',
      amount: `$${budget.toLocaleString()}`,
      index: 2,
    },
    {
      title: 'Equity',
      imageSrc: '/assets/reports/equity.svg',
      amount: `$${equity.toLocaleString()}`,
      index: 3,
    },
  ];

  return (
    <div className='p-4'>
      <div className='mb-4 flex justify-end'>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              variant='outline'
              type='submit'
              className='px-4 py-2 text-[12px] font-medium'
            >
              <Image
                src='/assets/vendors/plus.svg'
                alt='Add'
                width={16}
                height={16}
              />
              <span className='ml-2 font-poppins text-xs font-semibold'>
                New Report
              </span>
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent
            align='end'
            className='w-60 border-none bg-white'
          >
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
                    className='font-in py-3 font-inter text-sm font-normal leading-[19.38px]'
                    key={report.value}
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
      </div>
      <div className='bg-white px-5 py-14'>
        <div className='grid gap-4 p-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4'>
          {reportData.map((card) => (
            <Card
              key={card.index}
              onClick={() => handleCardClick(card.index)}
              className={`relative flex cursor-pointer flex-col items-center rounded-lg border border-GrayOpac p-3 text-center transition-transform ${
                activeCard === card.index
                  ? 'bg-primary text-white'
                  : 'text-black'
              }`}
            >
              <div className={`flex ${card.index === 1 ? 'ps-9' : ''}`}>
                <div className='absolute left-2.5 top-2.5 h-12 w-12 overflow-hidden rounded-full'>
                  <Image
                    src={card.imageSrc}
                    alt={card.title}
                    width={48}
                    height={48}
                  />
                </div>
                <div
                  className={`mt-4 text-center ${card.index === 1 ? 'mt-16' : ''}`}
                >
                  <CardTitle
                    className={`font-poppins text-[14.5px] font-medium leading-[21.75px] tracking-[-0.375px] ${
                      activeCard === card.index ? 'text-white' : 'text-black'
                    }`}
                  >
                    {card.title}
                  </CardTitle>
                </div>
              </div>
              <CardContent>
                <p
                  className={`mt-4 text-2xl font-bold ${
                    activeCard === card.index ? 'text-white' : 'text-black'
                  }`}
                >
                  {card.amount}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Reports;
