'use client';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import React, { useState } from 'react';

import { triggerStripeCron } from '@/lib/stripe/cron';

import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';

import { useAppContext } from '@/providers/context-provider';
import { sendNotification } from '@/utils/notification';
import { createClient } from '@/utils/supabase/client';

/**
 * Renders a button component that handles the addition of a new payment method and the upload of accounts to S3.
 *
 * @return {JSX.Element} The rendered button component.
 */
const AddNewPaymentMethodButton = (): JSX.Element => {
  const [loadingState, setLoadingState] = useState<
    null | 'add-account' | 'upload-accounts'
  >(null);
  const { replace } = useRouter();
  const supabase = createClient();
  const { companyDetails } = useAppContext();

  /**
   * Handles the addition of a new payment method.
   *
   * @return {Promise<void>} A promise that resolves when the payment method is added successfully, or rejects with an error.
   */
  const addPaymentHandler = async (): Promise<void> => {
    setLoadingState('add-account');
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      toast({
        title: 'Error: ' + userError.message,
        variant: 'destructive',
      });
      setLoadingState(null);

      await supabase.auth.signOut();
      return;
    }
    const { data } = await supabase
      .from('users')
      .select('stripe_customer_id')
      .eq('id', user?.id)
      .single();

    try {
      const res = await fetch(`/api/stripe`, {
        method: 'POST',
        body: JSON.stringify({
          email: user?.email,
          ...(data?.stripe_customer_id && {
            customerId: data?.stripe_customer_id,
          }),
        }),
      });
      const { url } = await res.json();

      triggerStripeCron();
      await sendNotification(companyDetails, 'paymentDetails');

      setTimeout(() => {
        replace(url);
      }, 1000);
    } catch (error) {
      setLoadingState(null);
      toast({
        title: 'Error',
        description: 'Something went wrong',
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <Button
        disabled={loadingState === 'add-account'}
        onClick={addPaymentHandler}
        className='bg-primary font-poppins text-xs font-semibold leading-[18px]'
      >
        {loadingState === 'add-account' && (
          <Loader2 className='mr-2 h-4 w-4 animate-spin' />
        )}
        Add new payment method
      </Button>
    </>
  );
};

export default AddNewPaymentMethodButton;
