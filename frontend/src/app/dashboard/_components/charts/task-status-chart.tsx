'use client';

import { useCallback, useEffect, useState } from 'react';
import { Cell, LabelList, Pie, PieChart } from 'recharts';

import { getUserDetails, UserDetails } from '@/lib/supabase';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  ChartConfig,
  ChartContainer,
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
import { toast } from '@/components/ui/use-toast';

import { createClient } from '@/utils/supabase/client';

// Define the month list
const monthList = [
  'Jan',
  'Feb',
  'Mar',
  'Apr',
  'May',
  'Jun',
  'Jul',
  'Aug',
  'Sep',
  'Oct',
  'Nov',
  'Dec',
];

const chartConfig = {
  visitors: { label: 'Visitors' },
  approved: {
    label: 'Approved',
    color: 'hsl(var(--chart-4))',
  },
  declined: {
    label: 'Declined',
    color: 'hsl(var(--chart-1))',
  },
} satisfies ChartConfig;

interface TaskInterface {
  id: number;
  title: string;
  description: string;
  task_category: string;
  task_status: string;
  user_id: string;
  created_at: string;
}

interface PieChartData {
  name: string;
  value: number;
  fill: string;
}

function TaskStatusChart() {
  const [selectedMonth, setSelectedMonth] = useState<string>('Jul');
  const [taskData, setTaskData] = useState<TaskInterface[]>([]);
  const [pieChartData, setPieChartData] = useState<PieChartData[]>([]);

  // Fetch task data from Supabase
  useEffect(() => {
    const fetchTaskData = async () => {
      const supabase = createClient();
      const userDetails = (await getUserDetails(supabase)) as UserDetails;

      const { data, error } = await supabase
        .from('task_status')
        .select()
        .eq('user_id', userDetails.id);

      if (error) {
        toast({
          title: 'Error',
          description: 'There was an error fetching the task status.',
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        setTaskData(data);
      }
    };

    fetchTaskData();
  }, []);

  // Function to get the month abbreviation from date string
  const GrabMonthFromDate = (createdAt: string): string => {
    const date = new Date(createdAt);
    const options: { month: 'short' } = { month: 'short' };
    return date.toLocaleString('en-US', options);
  };

  // Memoized callback to generate pie chart data for the selected month
  const generatePieChartData = useCallback(() => {
    // Filter task data for the selected month
    const filteredTasks = taskData.filter(
      (item) => GrabMonthFromDate(item.created_at) === selectedMonth,
    );

    // Count tasks by status (Approved and Declined)
    const taskStatusCounts = filteredTasks.reduce(
      (acc, task) => {
        if (task.task_status === 'approved') acc.approved += 1;
        else if (task.task_status === 'declined') acc.declined += 1;
        return acc;
      },
      { approved: 0, declined: 0 },
    );

    const totalTask = taskStatusCounts.approved + taskStatusCounts.declined;

    // Set the pie chart data
    setPieChartData([
      {
        name: 'Approved',
        value: totalTask
          ? Math.round((taskStatusCounts.approved / totalTask) * 100)
          : 0,
        fill: 'hsl(var(--chart-4))',
      },
      {
        name: 'Declined',
        value: totalTask
          ? Math.round((taskStatusCounts.declined / totalTask) * 100)
          : 0,
        fill: 'hsl(var(--chart-1))',
      },
    ]);
  }, [taskData, selectedMonth]);

  // Re-generate pie chart data whenever selectedMonth or taskData changes
  useEffect(() => {
    generatePieChartData();
  }, [generatePieChartData]);

  const totalTaskCount = taskData.filter(
    (item) => GrabMonthFromDate(item.created_at) === selectedMonth,
  ).length;

  return (
    <Card className='flex h-full flex-col'>
      <CardHeader className='pb-0'>
        <div className='flex items-center justify-between'>
          <h3 className='sidebar-text font-medium uppercase'>Tasks status</h3>
          <div>
            <Select
              value={selectedMonth}
              onValueChange={(value) => setSelectedMonth(value as string)}
            >
              <SelectTrigger className='w-30 para-text--small border-none bg-white'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='z-10 border-none bg-white'>
                <SelectGroup>
                  {monthList.map((month) => (
                    <SelectItem key={month} value={month}>
                      {month}
                    </SelectItem>
                  ))}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent className='flex flex-1 items-center justify-center pb-0'>
        <ChartContainer config={chartConfig} className='mx-auto h-1/2 w-full'>
          <PieChart width={300} height={300}>
            <ChartTooltip
              cursor={false}
              content={<ChartTooltipContent hideLabel />}
            />
            <Pie
              data={pieChartData}
              dataKey='value'
              nameKey='name'
              innerRadius={30}
              outerRadius={50}
              strokeWidth={5}
              isAnimationActive={false}
            >
              {pieChartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.fill} />
              ))}
              <LabelList
                dataKey='value'
                className='fill-background'
                stroke='none'
                fontSize={8}
                formatter={(value: number) => `${value}%`}
              />
            </Pie>
          </PieChart>
        </ChartContainer>
        <div className='ml-4 flex flex-col items-start'>
          <p className='para-text--small text-gray-800'>Total Task:</p>
          <p className='text-3xl font-bold text-secondary'>{totalTaskCount}</p>
          <div className='flex items-center gap-2 text-sm'>
            <div className='h-3 w-3 rounded-full bg-primary'></div>
            <p className='para-text--small font-medium text-black'>Approved</p>
          </div>
          <div className='flex items-center gap-2 text-sm'>
            <div className='h-3 w-3 rounded-full bg-secondary'></div>
            <p className='para-text--small font-medium text-black'>Declined</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default TaskStatusChart;
