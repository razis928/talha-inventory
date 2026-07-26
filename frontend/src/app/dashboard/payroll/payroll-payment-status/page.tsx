import Image from 'next/image';
import Link from 'next/link';
import React from 'react';

// Define the type for the progress bar component props
interface ProgressBarProps {
  paid: number;
  pending: number;
  unpaid: number;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ paid, pending, unpaid }) => (
  <div className='mb-4 flex h-5 overflow-hidden rounded-[10px] border-[2px] border-white'>
    <div
      className='bg-[#007EA7] transition-all duration-500 ease-out'
      style={{ width: `${paid}%` }}
    />
    <div
      className='bg-[#FBC173] transition-all duration-500 ease-out'
      style={{ width: `${pending}%` }}
    />
    <div
      className='bg-[#03045E] transition-all duration-500 ease-out'
      style={{ width: `${unpaid}%` }}
    />
  </div>
);

interface EmployeeProps {
  name: string;
  leaveType: string;
  leaveDates: string;
  imageUrl: string;
}

const EmployeeCard: React.FC<EmployeeProps> = ({
  name,
  leaveType,
  leaveDates,
  imageUrl,
}) => (
  <div className='flex flex-row items-center justify-between border-b border-[#0000000F] py-[25px]'>
    <div className='flex flex-row items-center'>
      <Image
        src={imageUrl}
        height='37'
        width='37'
        alt='user logo'
        className='h-[37px] w-[37px] rounded-full'
      />
      <div className='ml-[12px] flex flex-col'>
        <p className='font-poppins text-[12px] font-bold text-black'>{name}</p>
        <p className='font-poppins text-[10px] font-light text-gray-600'>
          {leaveType}
        </p>
      </div>
    </div>
    <p className='font-poppins text-[12px] text-[#EE6068]'>{leaveDates}</p>
  </div>
);

const Page: React.FC = () => {
  const paid = 68;
  const pending = 17;
  const unpaid = 15;

  const employees = [
    {
      name: 'Jane Cooper',
      leaveType: 'sick leave',
      leaveDates: '26-28 Jun 2024',
      imageUrl: '/assets/human-resources/user.svg',
    },
    {
      name: 'John Doe',
      leaveType: 'vacation',
      leaveDates: '1-4 Jul 2024',
      imageUrl: '/assets/human-resources/user.svg',
    },
    {
      name: 'Emma Stone',
      leaveType: 'personal leave',
      leaveDates: '10-12 Jul 2024',
      imageUrl: '/assets/human-resources/user.svg',
    },
  ];

  return (
    <div className='container mt-[50px] flex justify-center'>
      <div className='flex w-[529px] flex-col items-center rounded-[5px] bg-white py-[60px]'>
        <div className='relative mx-5 mb-10 w-[85%]'>
          {/* ProgressBar component */}
          <ProgressBar paid={paid} pending={pending} unpaid={unpaid} />

          {/* Progress labels */}
          <div className='mb-2 flex items-center justify-start text-xs'>
            {[
              { label: `${paid}% successful paid`, color: '#007EA77D' },
              { label: `${pending}% pending`, color: '#FBC173' },
              { label: `${unpaid}% unpaid`, color: '#03045E' },
            ].map(({ label, color }, index) => (
              <div key={index} className='ml-[12px] flex flex-row items-center'>
                <div
                  className='h-[8px] w-[8px] rounded-full'
                  style={{ backgroundColor: color }}
                ></div>
                <p className='pl-[5px] font-poppins text-[12px] font-normal text-gray-600'>
                  {label}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className='w-[85%]'>
          <div className='flex flex-row justify-between'>
            <p className='font-poppins text-[16px] font-semibold'>
              Employee Time-off
            </p>
            <Link
              href='#'
              className='cursor-pointer font-poppins text-[12px] text-[#a6a6a6] hover:underline'
            >
              View All
            </Link>
          </div>

          {/* Employee Cards */}
          <div>
            {employees.map((employee, index) => (
              <EmployeeCard
                key={index}
                name={employee.name}
                leaveType={employee.leaveType}
                leaveDates={employee.leaveDates}
                imageUrl={employee.imageUrl}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
