'use client';
import { useState } from 'react';
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

const chartConfig = {
  financialStability: {
    label: 'financial Stability',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

interface Props {
  chartData: { month: string; financialStability: number }[];
}
function PerformanceChart({ chartData }: Props) {
  const [months, setMonths] = useState(4);

  const handleSelectChange = (value: string) => {
    setMonths(parseInt(value.replace('last', '').replace('Month', '')));
  };

  const filteredData = chartData.slice(-months);

  return (
    <Card>
      <CardHeader>
        <div className='flex items-center justify-between'>
          <h3 className='sidebar-text font-medium uppercase'>
            Performance risk insight
          </h3>

          <Select defaultValue='last4Month' onValueChange={handleSelectChange}>
            <SelectTrigger className='w-30 para-text--small border-none bg-white font-medium'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent className='z-10 border-none bg-white'>
              <SelectGroup>
                <SelectItem isChecked={true} value='last4Month'>
                  Last 4 months
                </SelectItem>
                <SelectItem isChecked={true} value='last5Month'>
                  Last 5 months
                </SelectItem>
              </SelectGroup>
            </SelectContent>
          </Select>
        </div>
        <p className='para-text--small text-gray-800'>
          Company financial risk score
        </p>
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
              tickFormatter={(value: string) => value.slice(0, 3)}
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
                        Financial Stability
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

export default PerformanceChart;
