'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCallback, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';

import { getUserDetails } from '@/lib/supabase';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';

import { userRoles } from '@/constants/user-roles';
import { useAppContext } from '@/providers/context-provider';
import { sendNotification } from '@/utils/notification';
import { createClient } from '@/utils/supabase/client';

const FormSchema = z.object({
  name: z.string().min(3, {
    message: 'Name is required.',
  }),
  email: z.string().min(3, {
    message: 'Email is required.',
  }),
  password: z.string().min(6, {
    message: 'Password is required.',
  }),
  role: z.string().nonempty('Roles shoudl not be empty'),
});

function InviteMember() {
  const supabase = createClient();
  const { refresh } = useRouter();
  const { companyDetails } = useAppContext();
  const [inviteModal, setInviteModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: '',
      email: '',
      password: '',
      role: '',
    },
  });

  const onSubmit = useCallback(
    async (data: z.infer<typeof FormSchema>) => {
      setIsLoading(true);

      const userCompany = await getUserDetails(supabase);

      const { data: newUser, error } = await supabase.auth.admin.createUser({
        email: data.email,
        password: data.password,
        email_confirm: true,
        user_metadata: {
          display_name: data.name,
          user_role: data.role,
        },
      });

      if (error) {
        setIsLoading(false);
        toast({
          title: 'Error: ' + error.message,
          variant: 'destructive',
        });
        return;
      }

      await supabase.from('user_companies').upsert({
        user_id: newUser.user?.id,
        company_id: (userCompany as { company: { id: number } })?.company?.id,
      });
      refresh();
      toast({
        title: 'Invited successfully',
        variant: 'default',
      });
      await sendNotification(companyDetails, 'team');
      setIsLoading(false);
      setInviteModal(false);
    },
    [companyDetails, refresh, supabase],
  );

  return (
    <Dialog open={inviteModal} onOpenChange={setInviteModal}>
      <DialogTrigger asChild>
        <Button variant='outline'>Invite Member</Button>
      </DialogTrigger>
      <DialogContent className='sm:max-w-[500px]'>
        <DialogHeader>
          <DialogTitle>Invite Member</DialogTitle>
          <DialogDescription>
            Enter the email of the user you want to invite and assign a role.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form id='invite-form' onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name='name'
              render={({ field }) => (
                <FormItem className='mb-5 flex flex-row items-center gap-5'>
                  <FormLabel className='w-full text-right font-medium md:w-[20.3333%]'>
                    Name:
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='text'
                      className='mt-2 rounded-lg border border-gray-400 border-opacity-45 bg-white'
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='email'
              render={({ field }) => (
                <FormItem className='mb-5 flex flex-row items-center gap-5'>
                  <FormLabel className='w-full text-right font-medium md:w-[20.3333%]'>
                    Email:
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='email'
                      className='mt-2 rounded-lg border border-gray-400 border-opacity-45 bg-white'
                    />
                  </FormControl>
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name='password'
              render={({ field }) => (
                <FormItem className='mb-5 flex flex-row items-center gap-5'>
                  <FormLabel className='w-full text-right font-medium md:w-[20.3333%]'>
                    Password:
                  </FormLabel>
                  <FormControl>
                    <Input
                      {...field}
                      type='password'
                      className='mt-2 rounded-lg border border-gray-400 border-opacity-45 bg-white'
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name='role'
              render={({ field }) => (
                <FormItem className='mb-7 flex flex-row items-center gap-5'>
                  <FormLabel className='para-text w-full text-right font-medium md:w-[20.3333%]'>
                    Role:
                  </FormLabel>
                  <FormControl>
                    <Select onValueChange={field.onChange}>
                      <SelectTrigger className='para-text--small border border-gray-300'>
                        <SelectValue placeholder='Select a Role' />
                      </SelectTrigger>
                      <SelectContent className='border-none bg-white'>
                        <SelectGroup>
                          {userRoles.map((role) => (
                            <SelectItem key={role.value} value={role.value}>
                              {role.label}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />
            <DialogFooter>
              <Button type='submit' id='invite-form'>
                {isLoading && <Loader2 className='mr-2 h-4 w-4 animate-spin' />}
                Invite
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}

export default InviteMember;
