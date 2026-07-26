'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRef } from 'react';

import { Input } from '@/components/ui/input';
import { Sheet, SheetTrigger } from '@/components/ui/sheet';

import ChatSidebar from '@/app/dashboard/actions/_components/chat-sidebar';

export function SelectCategories() {
  // Array of categories with just labels
  const categories = [
    { label: 'Finance', route: 'dashboard/accounting/reports' },
    { label: 'Operations', route: 'dashboard/operations' },
    { label: 'Human Resources', route: 'dashboard/human-resources' },
    { label: 'Insurance', route: 'dashboard/insurance' },
    { label: 'Taxes', route: 'taxes-report' },
    { label: 'Payroll', route: 'dashboard/payroll' },
    { label: 'Cyber Security', route: 'dashboard/cyber-security' },
    { label: 'Compliance', route: 'dashboard/actions/compliance' },
    { label: 'Sales & Marketing', route: 'dashboard/sales-marketing' },
  ];

  // Ref for the file input
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Function to handle file upload
  const handleFileUploadClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className='flex flex-col'>
      {/* Scrollable container for categories */}
      <div className='flex-1 overflow-y-auto p-4'>
        <div className='mb-8 mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3'>
          {categories.map((category, index) => (
            <Link
              key={index}
              href={`/${category.route}`}
              className='flex h-[100px] cursor-pointer items-center justify-center rounded-lg bg-[rgba(255,255,255,0.54)] shadow-md hover:bg-[rgba(220,220,220,0.7)]'
            >
              <h1 className='text-center text-[14px] text-[rgba(148,140,140,0.93)]'>
                {category.label}
              </h1>
            </Link>
          ))}
        </div>
      </div>

      {/* Fixed input section at the bottom */}
      <div className='fixed bottom-0 left-64 right-0 z-10 flex justify-center p-4'>
        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          id='file-upload'
          type='file'
          accept='.svg, .png, .jpg, .gif'
          className='hidden'
        />

        {/* Input box with icons centered */}
        <Sheet>
          <SheetTrigger asChild>
            <div className='para-text--extra-small mx-auto flex h-[55px] w-full max-w-[70%] items-center justify-between gap-3 rounded-full border border-gray-300 bg-white px-4'>
              {/* Attachment Icon */}
              <span
                className='flex cursor-pointer items-center'
                onClick={handleFileUploadClick}
              >
                <Image
                  src='/assets/action/attachment-02.svg'
                  alt='uploadFile'
                  width={16}
                  height={16}
                />
              </span>

              {/* Centered text input field */}
              <Input
                type='text'
                placeholder='What’s your task?'
                className='flex-1 bg-transparent outline-none'
              />

              {/* Star Icon to trigger file upload */}
              <div className='cursor-pointer'>
                <Image
                  src='/assets/action/star.svg'
                  alt='uploadFile'
                  width={35}
                  height={35}
                />
              </div>
            </div>
          </SheetTrigger>
          <ChatSidebar />
        </Sheet>
      </div>
    </div>
  );
}
