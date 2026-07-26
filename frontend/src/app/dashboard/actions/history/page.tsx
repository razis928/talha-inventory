'use client';
import React, { useCallback, useEffect, useState } from 'react';

import { getUserDetails, UserDetails } from '@/lib/supabase';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';

import AccountsPagination from '@/app/dashboard/accounting/_components/pagination';
import { createClient } from '@/utils/supabase/client';

interface TaskHistory {
  id: number;
  description: string;
  task_category: string;
  completion_percentage: number;
  task_status: string;
  created_at: string;
}

const Page: React.FC = () => {
  const [taskHistory, setTaskHistory] = useState<TaskHistory[]>([]);
  const [currentPage, setCurrentPage] = useState<number>(1);

  const rowsPerPage = 10;

  const fetchTaskHistory = useCallback(async () => {
    const supabase = createClient();
    const userDetails = (await getUserDetails(supabase)) as UserDetails;
    const { data, error } = await supabase
      .from('task_status')
      .select()
      .eq('user_id', userDetails.id);

    if (error) {
      toast({
        title: 'Error',
        description: 'There was an error fetching the task history.',
        variant: 'destructive',
      });
      return;
    }

    if (data) {
      setTaskHistory(data);
    }
  }, []);

  useEffect(() => {
    fetchTaskHistory();
  }, [fetchTaskHistory]);

  // Pagination logic
  const totalRecords = Math.ceil(taskHistory.length / rowsPerPage);
  const indexOfLastItem = currentPage * rowsPerPage;
  const indexOfFirstItem = indexOfLastItem - rowsPerPage;
  const currentRecords = taskHistory.slice(indexOfFirstItem, indexOfLastItem);

  const handlePageChange = (pageNumber: number) => {
    if (pageNumber >= 1 && pageNumber <= totalRecords) {
      setCurrentPage(pageNumber);
    }
  };

  const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className='overflow-x-auto'>
      <h1 className='mb-3 font-poppins text-2xl font-semibold leading-[43.78px] text-smoke-400'>
        <span className='font-martel-sans font-bold'>Tasks History</span>
      </h1>

      <Table className='divide-y divide-gray-200'>
        <TableHeader>
          <TableRow className='border-transparent bg-[rgba(3,4,94,0.08)]'>
            <TableHead className='pl-11 font-poppins text-sm font-medium leading-[21px]'>
              ID
            </TableHead>
            <TableHead className='pl-11 font-poppins text-sm font-medium leading-[21px]'>
              Task Description
            </TableHead>
            <TableHead className='font-poppins text-sm font-medium leading-[21px]'>
              Task Category
            </TableHead>
            <TableHead className='font-poppins text-sm font-medium leading-[21px]'>
              Completion Percentage
            </TableHead>
            <TableHead className='font-poppins text-sm font-medium leading-[21px]'>
              Status
            </TableHead>
            <TableHead className='font-poppins text-sm font-medium leading-[21px]'>
              Created At
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody className='bg-white'>
          {currentRecords.map((task) => (
            <TableRow key={task.id} className='relative border-none'>
              <TableCell className='whitespace-nowrap py-4 pl-4 font-poppins text-sm leading-[18px]'>
                <span className='font-poppins text-xs font-medium leading-[18px] text-black'>
                  {task.id}
                </span>
              </TableCell>
              <TableCell className='whitespace-nowrap py-4 pl-3 text-xs leading-[18px] text-black'>
                <span className='font-poppins font-medium leading-[18px]'>
                  {task.description}
                </span>
              </TableCell>
              <TableCell className='whitespace-nowrap py-4 pl-3 text-xs leading-[18px]'>
                <span className='font-poppins font-medium leading-[18px] text-black'>
                  {task.task_category}
                </span>
              </TableCell>
              <TableCell className='whitespace-nowrap py-4 pl-3 text-xs leading-[18px]'>
                <span className='font-poppins font-medium leading-[18px] text-black'>
                  {task.completion_percentage}%
                </span>
              </TableCell>
              <TableCell className='whitespace-nowrap py-4 pl-3 text-xs leading-[18px] text-gray-500'>
                <span
                  className={`font-poppins font-medium leading-[18px] ${task.task_status === 'approved' ? 'text-[#008000]' : 'text-[#EF1522]'}`}
                >
                  {task.task_status}
                </span>
              </TableCell>
              <TableCell className='whitespace-nowrap py-4 pl-3 text-xs leading-[18px] text-gray-500'>
                <span className='font-poppins font-medium leading-[18px] text-black'>
                  {formatDate(task.created_at)}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <AccountsPagination
        totalPages={totalRecords}
        currentPage={currentPage}
        handleNextPage={() => handlePageChange(currentPage + 1)}
        handlePreviousPage={() => handlePageChange(currentPage - 1)}
        handleSelectedChange={handlePageChange}
      />
    </div>
  );
};

export default Page;
