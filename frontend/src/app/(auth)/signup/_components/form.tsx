'use client';
import { ChevronUp, Loader2 } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Toaster } from '@/components/ui/toaster';
import { useToast } from '@/components/ui/use-toast';

import { createClient } from '@/utils/supabase/client';

export const description =
  "A login page with two columns. The first column has the login form with email and password. There's a Forgot your passwork link and a link to sign up if you do not have an account. The second column has a cover image.";

function SignUpForm() {
  const [loading, setLoading] = useState(false);
  const { push } = useRouter();
  const supabase = createClient();
  const { toast } = useToast();

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    const formData = new FormData(event.target as HTMLFormElement);
    const name = formData.get('name') as string;
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const companyName = formData.get('companyName') as string;
    const role = formData.get('role') as string;

    let errorMessage = '';

    // Basic validation
    if (!email || !password || !name) {
      errorMessage = 'Name, email, and password are required.';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      errorMessage = 'Please enter a valid email address.';
    } else if (password.length < 8) {
      errorMessage = 'Password must be at least 8 characters long.';
    }

    if (errorMessage) {
      toast({ title: errorMessage, variant: 'destructive' });
      return;
    }

    const { data: user, error: signUpError } = await supabase.auth.signUp({
      email: email,
      password: password,
      options: {
        data: {
          display_name: name, // Full name of the user
          user_role: role, // Role within the company
        },
      },
    });

    if (signUpError) {
      toast({
        title: 'Error',
        description: signUpError.message,
        variant: 'default',
      });
      setLoading(false);
      return;
    }

    // Introduce a short delay to ensure user data is fully available
    await new Promise((resolve) => setTimeout(resolve, 1000));
    // Check if user is authenticated
    const {
      data: { user: authUser },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !authUser) {
      toast({
        title: userError?.message || 'No user',
      });
      setLoading(false);
      return;
    }

    const companyPayload = {
      company_name: companyName,
      created_by: authUser.id,
    };

    const { data: company, error: companyError } = await supabase
      .from('companies')
      .upsert(companyPayload)
      .select('id')
      .single();

    if (companyError) {
      setLoading(false);
      return toast({
        title: 'Error',
        description: companyError.message,
      });
    }

    const { error: userCompanyError } = await supabase
      .from('user_companies')
      .insert({ user_id: user.user?.id, company_id: company?.id });

    if (userCompanyError) {
      toast({ title: userCompanyError.message, variant: 'default' });
      setLoading(false);
      return;
    }
    push('/');
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
            <div className='flex items-center justify-center py-12'>
              <div className='relative right-[20px] mx-auto grid w-[482px] gap-6'>
                <div className='grid gap-2 text-center'>
                  <h1 className='text-left font-montserrat text-[36px] font-bold leading-[17.26px] text-smoke-100'>
                    Sign Up
                  </h1>
                </div>
                <div className='grid gap-4'>
                  <div className='mt mt-5 grid gap-3'>
                    <Label htmlFor='email' className='input-label'>
                      Work email
                    </Label>
                    <Input
                      className='input'
                      type='email'
                      name='email'
                      required
                    />
                  </div>
                  <div className='grid gap-3'>
                    <div className='flex items-center'>
                      <Label htmlFor='password' className='input-label'>
                        Full Name
                      </Label>
                    </div>
                    <Input className='input' type='text' name='name' required />
                  </div>
                  <div className='grid gap-3'>
                    <div className='flex items-center'>
                      <Label htmlFor='password' className='input-label'>
                        Company Name
                      </Label>
                    </div>
                    <Input className='input' type='text' name='companyName' />
                  </div>
                  <div className='grid gap-3'>
                    <div className='flex items-center'>
                      <Label htmlFor='password' className='input-label'>
                        Your role at the company
                      </Label>
                    </div>
                    <Select name='role'>
                      <SelectTrigger className='input-label w-full border border-gray-400 text-smoke-400 focus:border-gray-400 focus:outline-none focus:ring-0 focus:ring-gray-400'>
                        <SelectValue
                          className='text-gray-400'
                          placeholder='Please Select'
                        />
                      </SelectTrigger>
                      <SelectContent className='mt-3 border-gray-400 bg-white py-2'>
                        <div className='flex w-full flex-row justify-between'>
                          <div className='w-[90%]'>
                            <SelectItem
                              className='input-label mb-2 flex cursor-not-allowed flex-row justify-between text-gray-400'
                              value='select'
                              disabled
                            >
                              Please select
                            </SelectItem>
                          </div>
                          <div className='w-[10%]'>
                            <ChevronUp className='text-gray-400' />
                          </div>
                        </div>

                        <SelectItem
                          isChecked={false}
                          className='input-label mb-2 cursor-pointer text-smoke-400 focus:bg-[#03045E] focus:text-white data-[state=checked]:bg-secondary data-[state=checked]:text-white'
                          value='CEO'
                        >
                          CEO/ Chief Executive officer
                        </SelectItem>
                        <SelectItem
                          isChecked={false}
                          className='input-label mb-2 cursor-pointer text-smoke-400 focus:bg-[#03045E] focus:text-white data-[state=checked]:bg-secondary data-[state=checked]:text-white'
                          value='CFO'
                        >
                          CFO/ Chief Financial officer
                        </SelectItem>
                        <SelectItem
                          isChecked={false}
                          className='input-label mb-2 cursor-pointer text-smoke-400 focus:bg-[#03045E] focus:text-white data-[state=checked]:bg-secondary data-[state=checked]:text-white'
                          value='Accountant'
                        >
                          Accountant
                        </SelectItem>
                        <SelectItem
                          isChecked={false}
                          className='input-label mb-2 cursor-pointer text-smoke-400 focus:bg-[#03045E] focus:text-white data-[state=checked]:bg-secondary data-[state=checked]:text-white'
                          value='Other Executive'
                        >
                          Other Executive
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className='grid gap-3'>
                    <div className='flex items-center'>
                      <Label htmlFor='password' className='input-label'>
                        Password
                      </Label>
                    </div>
                    <Input
                      className='input'
                      type='password'
                      name='password'
                      required
                    />
                  </div>
                  <Button type='submit' className='mt-2 w-full'>
                    {loading && (
                      <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                    )}
                    Get Started
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
                    <p className='font-montserrat text-sm font-[700] text-black'>
                      {' '}
                      Continue With Google
                    </p>
                  </Button>
                </div>
                <div className='mt-2 flex justify-center gap-1 text-center text-sm text-[#9D9D9D]'>
                  Already have an account?{' '}
                  <div className='text-sm text-[#03045E]'>
                    <Link
                      href='/login'
                      className='underline-none font-montserrat font-[900]'
                    >
                      Sign In
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
}

export default SignUpForm;
