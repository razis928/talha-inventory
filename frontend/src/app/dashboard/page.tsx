import Link from 'next/link';
import React from 'react';

import { Button } from '@/components/ui/button';

import Data from '@/app/dashboard/_components/charts/chartData.json';

const PerformanceChart = dynamic(
  () => import('@/app/dashboard/_components/charts/performance-chart'),
  {
    ssr: false,
  },
);

const TaskStatusChart = dynamic(
  () => import('@/app/dashboard/_components/charts/task-status-chart'),
  {
    ssr: false,
  },
);

const CashFlowChart = dynamic(
  () => import('@/app/dashboard/_components/charts/cashflow-chart'),
  {
    ssr: false,
  },
);
import dynamic from 'next/dynamic';

import { fetchRiskInsights } from '@/lib/external/risk-insight';

import Revenue from '@/app/dashboard/_components/revenue';
import VendorsTable from '@/app/dashboard/_components/vendors-table';
import {
  AccountReceivable,
  getCompanyTransactionsWithClientsDetails,
} from '@/utils/financials/receivables/account-receivable';
import { createClient } from '@/utils/supabase/server';
const { cashFlow, insurance } = Data;

export const revalidate = 30;
const Dashboard = async () => {
  const supabase = createClient();
  const severanceCalculation = await fetchRiskInsights(supabase);

  const accountReceivables =
    (await getCompanyTransactionsWithClientsDetails()) as unknown as AccountReceivable[];

  return (
    <div className='h-full overflow-auto'>
      <div className='mx-3 mb-6 flex justify-end'>
        <Link href='/dashboard/actions' prefetch={false}>
          <Button
            variant='secondary'
            className='px-[50px] font-poppins text-sm font-normal'
          >
            Start Tasks
          </Button>
        </Link>
      </div>
      <div className='flex gap-5'>
        <div className='flex-1'>
          <div className='w-full'>
            <PerformanceChart chartData={severanceCalculation} />
          </div>

          <div className='mt-5'>
            <CashFlowChart title='Cash Flow' chartData={cashFlow} />
          </div>
        </div>
        <div className='flex flex-1 flex-col'>
          <div className='flex h-[260px]'>
            <div className='h-full w-1/2'>
              <TaskStatusChart />
            </div>
            <div className='h-full w-1/2'>
              <Revenue accountReceivables={accountReceivables} />
            </div>
          </div>
          <div className='mt-7 flex flex-1 flex-col justify-end p-0'>
            <CashFlowChart
              cashFlow={true}
              title='Insurance'
              chartData={insurance}
            />
          </div>
        </div>
      </div>
      <div className='mt-10'>
        <div className='mx-3 mb-5 mt-16 flex items-center justify-between'>
          <div className='font-poppins text-xl font-bold leading-[30px] text-smoke-400'>
            Vendors
          </div>
        </div>
        <VendorsTable />
      </div>
    </div>
  );
};

export default Dashboard;
