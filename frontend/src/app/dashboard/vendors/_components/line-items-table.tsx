import React, { FC } from 'react';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import { LineItem } from '@/types/client';

interface Props {
  line_items: LineItem[];
}
const LineItemsTable: FC<Props> = ({ line_items }: Props) => {
  return (
    line_items.length > 0 && (
      <Table className='relative left-0 right-0 m-auto mb-4 w-full border border-gray-200 md:w-9/12'>
        <TableHeader className=''>
          <TableRow className='bg-primary'>
            <TableHead className='text-lg font-normal text-white'>
              Item
            </TableHead>
            <TableHead className='text-lg font-normal text-white'>
              Description
            </TableHead>
            <TableHead className='text-center text-lg font-normal text-white'>
              Qty
            </TableHead>
            <TableHead className='text-right text-lg font-normal text-white'>
              Unit Price
            </TableHead>
            <TableHead className='text-right text-lg font-normal text-white'>
              Amount
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {line_items?.map((item, index) => (
            <TableRow
              key={index}
              className='divide-x divide-gray-200 border-b hover:bg-gray-50'
            >
              <TableCell className='text-gray-600'>{item.item}</TableCell>
              <TableCell className='text-gray-600'>
                {item.description}
              </TableCell>
              <TableCell className='text-center text-gray-600'>
                {item.qty}
              </TableCell>
              <TableCell className='text-right text-gray-600'>
                {item.unitPrice}
              </TableCell>
              <TableCell className='text-right text-gray-600'>
                {item.amount}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    )
  );
};

export default LineItemsTable;
