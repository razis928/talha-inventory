'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Toaster } from '@/components/ui/toaster';
import { toast } from '@/components/ui/use-toast';

import { createClient } from '@/utils/supabase/client';

const FormSchema = z
  .object({
    new_password: z
      .string()
      .min(2, {
        message: 'New password must be at least 2 characters.',
      })
      .nonempty({
        message: 'New password is required.',
      }),
    confirm_password: z
      .string()
      .min(2, {
        message: 'Confirm password must be at least 2 characters.',
      })
      .nonempty({
        message: 'Confirm password is required.',
      }),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ['confirm_password'], // path of error
  });

const Page = () => {
  const router = useRouter();
  const [loading, setLoading] = useState<boolean>(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      new_password: '',
      confirm_password: '',
    },
  });

  const onSubmit = useCallback(
    async (data: z.infer<typeof FormSchema>) => {
      setLoading(true);
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: data.new_password,
      });

      if (error) {
        toast({
          title: 'Error',
          description: error.message,
          variant: 'default',
        });
        setLoading(false);
        return;
      }

      toast({
        title: 'Success',
        description: 'Password updated successfully',
        variant: 'default',
      });
      setLoading(false);
      router.push('/login');
    },
    [router],
  );
  return (
    <div className='container mx-auto flex h-screen w-full flex-row items-center justify-center xl:w-2/5'>
      <Toaster />
      <Card className='p-10 xl:w-4/5'>
        <h2 className='text-center text-2xl font-bold'>Reset Password</h2>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='new_password'
              render={({ field }) => (
                <FormItem className='mb-5 items-center gap-5'>
                  <FormLabel className='w-full text-right font-medium md:w-[20.3333%]'>
                    New Password:
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='password'
                      className='mt-2 rounded-lg border border-gray-400 border-opacity-45 bg-white'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='confirm_password'
              render={({ field }) => (
                <FormItem className='mb-5 gap-5'>
                  <FormLabel className='w-full text-right font-medium md:w-[20.3333%]'>
                    Confirm New Password:
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='password'
                      className='mt-2 rounded-lg border border-gray-400 border-opacity-45 bg-white'
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className='flex justify-center'>
              <Button
                type='submit'
                className='h-[34px] w-[161px] max-w-xs rounded-lg bg-primary py-2 font-poppins text-sm font-normal leading-[21px]'
                disabled={loading}
              >
                {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Confirm
              </Button>
            </div>
          </form>
        </Form>
      </Card>
    </div>
  );
};

export default Page;
