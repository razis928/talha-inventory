'use client';
import React, { FC } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';

const FormSchema = z.object({
  name: z.string().min(2, {
    message: 'Vendor Company Name must be at least 2 characters.',
  }),
  email_address: z.string().email({ message: 'Invalid email address.' }),
  description: z.string().optional(),
});

const Help_Support: FC = () => {
  const form = useForm<z.infer<typeof FormSchema>>({
    defaultValues: {
      name: '',
      email_address: '',
      description: '',
    },
  });

  return (
    <div className='mx-auto mt-7 max-w-[1000px] p-4'>
      <Card className='rounded-lg bg-white'>
        <CardHeader>
          <CardTitle className='flex justify-center'>
            <h4 className='text-smoke-600 pb-2 pe-4 ps-4 pt-2 font-poppins text-[24px] font-bold leading-[30px] shadow-md'>
              Help and Support
            </h4>
          </CardTitle>
        </CardHeader>

        <CardContent className='space-y-6 pt-8'>
          <Form {...form}>
            <form>
              {/* Row 1: Name & Email Address */}
              <div className='mb-7 flex flex-col gap-6 md:flex-row'>
                <FormField
                  name='name'
                  render={({ field }) => (
                    <FormItem className='flex w-full flex-col md:w-1/2'>
                      <FormLabel className='para-text text-left font-medium'>
                        Name
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id='company_name'
                          required
                          className='mt-2 rounded-lg border border-gray-400 border-opacity-45 bg-white'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  name='email_address'
                  render={({ field }) => (
                    <FormItem className='flex w-full flex-col md:w-1/2'>
                      <FormLabel className='para-text text-left font-medium'>
                        Email
                      </FormLabel>
                      <FormControl>
                        <Input
                          {...field}
                          id='email_address'
                          required
                          className='mt-2 rounded-lg border border-gray-400 border-opacity-45 bg-white'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Description Text Area */}
              <div className='mb-7'>
                <FormField
                  name='description'
                  render={({ field }) => (
                    <FormItem className='flex w-full flex-col'>
                      <FormLabel className='para-text text-left font-medium'>
                        Description
                      </FormLabel>
                      <FormControl>
                        <textarea
                          {...field}
                          id='description'
                          className='mt-2 rounded-lg border border-gray-400 border-opacity-45 bg-white p-2'
                          rows={4}
                          placeholder='Enter description...'
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <div className='flex justify-center'>
                <Button
                  type='submit'
                  className='h-[34px] w-[161px] max-w-xs rounded-lg bg-primary py-2 font-poppins text-sm font-normal leading-[21px]'
                >
                  Submit
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Help_Support;
