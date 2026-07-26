'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useCallback, useLayoutEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { UserDetails } from '@/lib/supabase';
import { CompanyDetails } from '@/lib/supabase/company';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem } from '@/components/ui/form';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';

import { BASE_URL } from '@/config/env-config';
import { addNotification } from '@/utils/notification';
import { createClient } from '@/utils/supabase/client';

const FormSchema = z.object({
  email: z.string().min(3, {
    message: 'Email is required.',
  }),
});

interface Props {
  user: UserDetails;
  companyDetails: CompanyDetails;
}
const GeneralSetting = ({ user, companyDetails }: Props) => {
  const pathname = usePathname();
  const [switchState, setSwitchState] = useState<boolean>(false);
  const [loading, setloading] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      email: user.email || '',
    },
  });

  useLayoutEffect(() => {
    if (companyDetails) {
      setSwitchState(companyDetails.notification_enabled);
    }
  }, [companyDetails]);

  const handleSwitchChange = async (checked: boolean) => {
    setSwitchState(checked);
    try {
      const supabase = createClient();
      const { error } = await supabase
        .from('companies')
        .update({ notification_enabled: checked })
        .eq('id', user.company?.id);

      if (error) {
        setSwitchState(!checked);
        return;
      }

      const notificationState = checked ? 'enabled' : 'disabled';

      // insert data into notification table
      addNotification({
        title: 'Notification Settings Updated',
        description: `You have successfully ${notificationState} notifications. You will now ${notificationState === 'enabled' ? 'receive' : 'not receive'} updates.`,
        user_id: companyDetails.user_companies[0].user_id,
        activity_page_url: pathname,
      });
      ///////////////////////////////////

      toast({
        title: 'Notification Settings Updated',
        description: `You have successfully ${notificationState} notifications. You will now ${notificationState === 'enabled' ? 'receive' : 'not receive'} updates.`,
        variant: 'default',
      });
    } catch (error) {
      setSwitchState(!checked);
    }
  };

  const onSubmit = useCallback(async (data: z.infer<typeof FormSchema>) => {
    setloading(true);
    const supabase = createClient();

    const { error } = await supabase.auth.resetPasswordForEmail(data?.email, {
      redirectTo: `${BASE_URL}/reset-password`,
    });
    if (error) {
      toast({
        title: 'Error sending password reset email',
        description: error.message,
        variant: 'destructive',
      });
      setloading(false);
      return { success: false, message: error.message };
    }
    setloading(false);
    toast({
      title: 'Password reset email sent!',
      description: 'Check your email for the password reset link.',
      variant: 'default',
    });
    return { success: true, message: 'Password reset email sent!' };
  }, []);

  const isAdmin = user?.role.includes('CEO') || user?.role.includes('CFO');

  return (
    <Card className='h-[355px] w-[700px] rounded-lg pb-24'>
      <div className='flex items-center justify-between pe-12 ps-9 pt-6'>
        <div className='flex gap-7'>
          <Image
            src='/assets/setting/general-setting/notification.svg'
            alt='Notification Icon'
            width={48}
            height={48}
            className='ms-4'
          />
          <div className='flex flex-col gap-2'>
            <h6 className='section-title font-bold'>Notification</h6>
            <div>
              <p className='para-text--extra-small font-normal opacity-50'>
                Turn on your notification to receive updates
              </p>
            </div>
          </div>
        </div>
        <div className='flex items-center space-x-2 rounded-full bg-transparent'>
          <Switch
            disabled={!isAdmin}
            id='airplane-mode'
            checked={switchState}
            onCheckedChange={handleSwitchChange}
          />
        </div>
      </div>
      <div className='mx-10 mt-11 border-b border-black opacity-5'></div>
      <div className='mt-11 flex items-center justify-between pe-12 ps-9'>
        <div className='flex gap-7'>
          <Image
            src='/assets/setting/general-setting/password.svg'
            alt='Password Icon'
            width={48}
            height={48}
            className='ms-4'
          />
          <div>
            <h6 className='section-title font-bold'>Password</h6>
            <div>
              <p className='para-text--extra-small font-normal opacity-50'>
                You can set password if you don’t want o use temporary login
                codes
              </p>
            </div>
          </div>
        </div>
      </div>
      <div className='ms-32 mt-7'>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className='flex w-full gap-3 pr-10'
          >
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='mb-7 w-full'>
                  <FormControl>
                    <Select
                      value={field.value}
                      onValueChange={field.onChange}
                      disabled={!isAdmin}
                    >
                      <SelectTrigger className='para-text--small border border-gray-300'>
                        <SelectValue placeholder='Select an email' />
                      </SelectTrigger>
                      <SelectContent className='border-none bg-white'>
                        <SelectGroup>
                          {companyDetails?.user_companies?.map((user) => (
                            <SelectItem
                              key={user.users.email}
                              value={user.users.email}
                            >
                              {user.users.email}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            <Button
              variant='outline'
              type='submit'
              className='rounded-[5px] px-10 py-2'
            >
              {loading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
              Reset Password
            </Button>
          </form>
        </Form>
      </div>
    </Card>
  );
};

export default GeneralSetting;
