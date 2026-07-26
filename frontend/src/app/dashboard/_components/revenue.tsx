'use client';
import Image from 'next/image';

import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

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

const Revenue: React.FC<{ accountReceivables: AccountReceivable[] }> = ({
  accountReceivables,
}) => {
  // Function to clean up the "$" symbol and convert to number
  const parseAmount = (amount: string) => {
    return parseFloat(amount.replace('$', '').replace(',', ''));
  };

  //  Given data from the mockdata
  const total_revenue = accountReceivables.reduce((sum, item) => {
    return sum + parseAmount(item.received_amount.toString()); // Add the cleaned amount to the sum
  }, 0);

  return (
    <div className='h-full w-full px-4'>
      {/* Add padding to the outer div for spacing */}
      <Card className='h-full w-full px-4' x-chunk='dashboard-01-chunk-0'>
        <CardHeader className='flex flex-row items-center justify-between px-0 pb-0 pt-4'>
          <p className='sidebar-text font-medium uppercase'>Total Revenue</p>
          <div>
            <Select defaultValue='july'>
              <SelectTrigger className='w-30 para-text--small border-none bg-transparent font-medium'>
                <SelectValue />
              </SelectTrigger>
              <SelectContent className='z-10 border-none bg-white'>
                <SelectGroup>
                  <SelectItem isChecked={true} value='last4Month'>
                    July
                  </SelectItem>
                  <SelectItem isChecked={true} value='last5Month'>
                    August
                  </SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className='p-0'>
          <div className='mt-10 w-full font-poppins text-[32px] font-medium leading-[48px] tracking-[-3.75%] text-primary'>
            ${total_revenue.toLocaleString()}
          </div>
          <div className='mt-4 flex items-center gap-1'>
            <div className=''>
              <Image
                src='/assets/dashboard/price-appreciate.svg'
                alt=''
                width={13}
                height={8.25}
              />
            </div>

            <p className='font-montserrat text-[10px] font-medium capitalize leading-[12.19px] text-smoke-400'>
              0%
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Revenue;
