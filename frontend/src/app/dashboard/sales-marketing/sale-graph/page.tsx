'use client';

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartTooltip,
  ChartTooltipContent,
} from '@/components/ui/chart';

const chartConfig = {
  desktop: {
    label: 'Desktop',
    color: 'hsl(var(--chart-1))',
  },
  mobile: {
    label: 'Desktop',
    color: 'hsl(var(--chart-5))',
  },
} satisfies ChartConfig;

function SaleGraph() {
  const data = [
    {
      month: 'Jan',
      value: 2500,
    },
    {
      month: 'Feb',
      value: 3000,
    },
    {
      month: 'Mar',
      value: 3500,
    },
    {
      month: 'Apr',
      value: 3000,
    },
    {
      month: 'May',
      value: 2000,
    },
    {
      month: 'Jun',
      value: 2000,
    },
    {
      month: 'Jul',
      value: 2000,
    },
    {
      month: 'Aug',
      value: 4000,
    },
  ];
  return (
    <Card>
      <CardHeader>
        <p className='text-left font-poppins text-sm font-medium uppercase leading-6 text-black'>
          SALES & LEADS TREND
        </p>
      </CardHeader>
      <CardContent>
        <div style={{ width: '100%' }}>
          <ChartContainer config={chartConfig} className='max-h-[180px] w-full'>
            <AreaChart
              width={undefined} // Auto width based on parent
              height={200} // Fixed height
              accessibilityLayer
              data={data}
            >
              <CartesianGrid vertical={true} horizontal={true} />
              <XAxis
                dataKey='month'
                tickLine={false}
                axisLine={false}
                tickMargin={6}
                tickFormatter={(value) => value.slice(0, 3)}
                style={{
                  fontWeight: '400',
                  fontFamily: 'Inter',
                  fontSize: '11.4px',
                  lineHeight: '12.1px',
                  color: 'black',
                }}
              />
              <YAxis
                tickLine={false}
                axisLine={false}
                tickCount={4}
                domain={[0, 'dataMax']}
                tickFormatter={(value) => value.toString()}
                style={{
                  fontWeight: '400',
                  fontFamily: 'Inter',
                  fontSize: '12px',
                  lineHeight: '14.52px',
                  color: 'black',
                }}
              />
              <ChartTooltip
                cursor={false}
                content={<ChartTooltipContent indicator='line' />}
              />
              <Area
                dataKey='value'
                type='natural'
                fill='hsl(var(--chart-5))'
                fillOpacity={0.4}
                stroke='hsl(var(--chart-1))'
                activeDot={{ r: 8 }}
                dot={{ r: 4 }}
              />
              <ChartLegend
                align='left'
                iconType='circle'
                content={
                  <div className='flex items-center justify-between pt-2'>
                    <div className='flex gap-2'>
                      <div className='flex items-center gap-1'>
                        <div className='h-3 w-3 rounded-full bg-secondary'></div>
                        <p className='font-poppins text-xs font-medium capitalize leading-[18px] text-black'>
                          Value
                        </p>
                      </div>
                    </div>
                  </div>
                }
              />
            </AreaChart>
          </ChartContainer>
        </div>
      </CardContent>
    </Card>
  );
}
export default SaleGraph;
