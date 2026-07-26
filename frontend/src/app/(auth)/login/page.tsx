'use client';

import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import React, { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';

import { emailLogin } from '@/app/actions/actions';

const LoginForm = () => {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.target as HTMLFormElement);

    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    let errorMessage = '';

    // Basic validation
    if (!email) {
      errorMessage = 'Email is required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errorMessage = 'Please enter a valid email address.';
    } else if (!password) {
      errorMessage = 'Password is required.';
    }

    if (errorMessage) {
      toast({ title: errorMessage, variant: 'destructive' });
      return; // Exit early if validation fails
    }

    const response = await emailLogin(formData); // Pass email and password as an object

    if (response?.error) {
      toast({
        title: 'Error',
        description: response?.error,
        variant: 'default',
      });
      setLoading(false);
    }
  };
  return (
    <>
      <div className='bg-[#FFFFFF]'>
        <form onSubmit={handleSubmit}>
          <Toaster />
          <div className='w-full lg:grid lg:grid-cols-2'>
            <div className='relative left-1 right-[70px] m-5 hidden bg-muted lg:block'>
              <Image
                src='/assets/auth/signup/auth.svg'
                alt='Image'
                width='1920'
                height='1080'
                className='max-h-[95vh] w-full object-center dark:brightness-[0.2] dark:grayscale'
              />
            </div>
            <div className='right[30px] relative flex items-center justify-center py-12'>
              <div className='relative right-[20px] mx-auto grid w-[482px] gap-6'>
                <div className='grid gap-2 text-center'>
                  <h1 className='text-left font-montserrat text-[36px] font-bold leading-[17.26px] text-smoke-100'>
                    Sign In
                  </h1>
                </div>
                <div className='grid gap-4'>
                  <div className='mt-16 flex flex-col gap-2'>
                    <Label htmlFor='email' className='input-label'>
                      Email
                    </Label>
                    <Input
                      className='input bg-white'
                      type='email'
                      name='email'
                      required
                    />
                  </div>

                  <div className='flex flex-col gap-2'>
                    <Label htmlFor='password' className='input-label'>
                      Password
                    </Label>
                    <Input
                      className='input'
                      type='password'
                      name='password'
                      required
                    />
                  </div>
                  <Button type='submit' className='mt-6 w-full'>
                    {loading && (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    )}
                    Sign In
                  </Button>
                  <div className='mt-3 flex items-center justify-center'>
                    <div className='flex-grow border-t border-[#EEEEEE]'></div>
                    <p className='mx-4 font-montserrat text-[16px] font-[500]'>
                      OR
                    </p>
                    <div className='flex-grow border-t border-[#EEEEEE]'></div>
                  </div>
                  <Button variant='outline' className='w-full'>
                    <Image
                      src='/assets/auth/signup/google.svg'
                      alt='BusinessDeal'
                      width={15}
                      height={15}
                      className='me-3'
                    />
                    <p className='font-[700] text-black'>
                      {' '}
                      Continue With Google
                    </p>
                  </Button>
                </div>
                <div className='mt-2 flex justify-center gap-1 text-center text-sm text-[#9D9D9D]'>
                  Dont have an account?{' '}
                  <div className='text-sm text-[#03045E]'>
                    <Link
                      href='/signup'
                      className='underline-none font-montserrat font-[900]'
                    >
                      Sign up
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </form>
      </div>
    </>
  );
};

export default LoginForm;
