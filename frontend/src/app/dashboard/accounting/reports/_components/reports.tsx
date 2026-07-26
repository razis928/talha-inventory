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
  {
    label: 'Budget Report',
    value: 'budget-report',
  },
];

// Define the type of the objects in the array
interface AccountReceivable {
  account_balance: number;
  email: string;
  id: string;
  inserted_at: string;
  late_payment: boolean;
  name: string;
  received_amount: number;
  status: string;
  taxes: number;
}
interface AccountPayable {
  amount: string;
  description: string;
  due_date: string;
  id: string;
  inserted_at: string;
  invoice_date: string;
  invoice_number: string;
  isUnassigned: boolean;
  // vendor_company_name: string;
}

const Reports: React.FC<{
  accountReceivables: AccountReceivable[];
  accountPayables: AccountPayable[];
}> = ({ accountReceivables, accountPayables }) => {
  const [activeCard, setActiveCard] = useState<number>(0);

  // Function to clean up the "$" symbol and convert to number
  const parseAmount = (amount: string) => {
    return parseFloat(amount.replace('$', '').replace(',', ''));
  };

  //  Given data from the mockdata
  const total_revenue = accountReceivables.reduce((sum, item) => {
    return sum + parseAmount(item.received_amount.toString()); // Add the cleaned amount to the sum
  }, 0);

  const total_expenses = accountPayables.reduce((sum, item) => {
    return sum + parseAmount(item.amount); // Add the cleaned amount to the sum
  }, 0);

  const total_assets = 0;

  const total_liabilities = total_expenses;

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
      title: 'Budget Operating Net Income',
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
                    className={`max-w-[125px] font-poppins text-[14.5px] font-medium leading-[21.75px] tracking-[-0.375px] ${
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
