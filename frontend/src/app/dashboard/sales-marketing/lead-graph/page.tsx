'use client';

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartConfig = {
  financialStability: {
    label: 'financial Stability',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

function LeadGraph() {
  const filteredData = [
    { month: 'Social', financialStability: 30.3675 },
    { month: 'Email', financialStability: 50.3675 },
    { month: 'Direct', financialStability: 70.3675 },
    { month: 'Organic', financialStability: 60.3675 },
  ];

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <h3 className='sidebar-text font-medium uppercase'>LEAD SOURCES</h3>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className='max-h-[180px] w-full'>
          <BarChart
            width={800}
            height={600}
            data={filteredData}
            barSize={30}
            barGap={20}
          >
            <CartesianGrid
              verticalCoordinatesGenerator={(props: { width: number }) =>
                props.width > 450 ? [220, 370, 520, 670] : [200, 400, 600]
              }
            />

            <XAxis
              dataKey='month'
              tickLine={false}
              axisLine={false}
              tickMargin={6}
              tickFormatter={(value: string) => value.slice(0, 10)}
            />
            <YAxis type='number' interval='preserveStart' />
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent indicator='dot' />}
            />

            <ChartLegend
              align='left'
              iconType='circle'
              content={
                <div className='flex items-center justify-between pt-2'>
                  <div className='flex gap-2'>
                    <div className='flex items-center gap-1'>
                      <div className='h-3 w-3 rounded-full bg-secondary'></div>
                      <p className='text-smoke-200 font-poppins text-[10px] font-medium leading-[15px] opacity-65'>
                        Value
                      </p>
                    </div>
                  </div>
                </div>
              }
            />

            <Bar
              dataKey='financialStability'
              fill='var(--color-financialStability)'
            />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

export default LeadGraph;
