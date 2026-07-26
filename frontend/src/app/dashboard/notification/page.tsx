'use client';
import Image from 'next/image';
import Link from 'next/link';
import React, { useEffect, useMemo, useState } from 'react';

import { getUserDetails, UserDetails } from '@/lib/supabase';

import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/components/ui/use-toast';

import { createClient } from '@/utils/supabase/client';

// Define the type for notification items
interface Notification {
  id: number;
  title: string;
  description: string;
  activity_page_url: string;
  is_read: boolean;
  is_archived: boolean;
  is_favourite: boolean;
}

const Notification = () => {
  const [notificationList, setNotificationList] = useState<Notification[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'archive' | 'favourite'>(
    'all',
  );

  // Filter notifications based on the active tab
  const filteredNotifications = useMemo(() => {
    return notificationList.filter((notification) => {
      if (activeTab === 'all') return true; // Show all notifications (including archived ones)
      if (activeTab === 'archive') return notification.is_archived; // Only show archived notifications
      if (activeTab === 'favourite') return notification.is_favourite; // Only show favourite notifications
      return false;
    });
  }, [activeTab, notificationList]);

  // Calculate the notification counts for each tab
  const tabCounts = useMemo(
    () => ({
      all: notificationList.length,
      archive: notificationList.filter((n) => n.is_archived).length,
      favourite: notificationList.filter((n) => n.is_favourite).length,
    }),
    [notificationList],
  );

  // Fetch notifications from Supabase
  useEffect(() => {
    const fetchNotifications = async () => {
      const supabase = createClient();
      const userDetails = (await getUserDetails(supabase)) as UserDetails;
      const { data, error } = await supabase
        .from('notification')
        .select()
        .eq('user_id', userDetails.id);

      if (error) {
        toast({
          title: 'Error',
          description: 'There was an error fetching the notifications.',
          variant: 'destructive',
        });
        return;
      }

      if (data) {
        setNotificationList(data);
      }
    };

    fetchNotifications();
  }, []);

  // Handle delete notification
  const handleDelete = async (id: number) => {
    const supabase = createClient();
    const { error } = await supabase.from('notification').delete().eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'There was an error deleting the notification.',
        variant: 'destructive',
      });
      return;
    }

    // Remove the deleted notification from the local state
    setNotificationList((prevList) =>
      prevList.filter((item) => item.id !== id),
    );

    // Show a success toast
    toast({
      title: 'Notification Removed Successfully',
      description: 'You have successfully removed the selected notification.',
      variant: 'default',
    });
  };

  // Function to handle toggling the favourite status
  const handleToggleFavourite = async (id: number) => {
    const updatedNotifications = notificationList.map((notification) =>
      notification.id === id
        ? { ...notification, is_favourite: !notification.is_favourite }
        : notification,
    );

    // Optimistically update the UI
    setNotificationList(updatedNotifications);

    // Update Supabase
    const supabase = createClient();
    const { error } = await supabase
      .from('notification')
      .update({
        is_favourite: !updatedNotifications.find((n) => n.id === id)
          ?.is_favourite,
      })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'There was an error updating the favourite status.',
        variant: 'destructive',
      });
      // Revert to the previous state in case of an error
      setNotificationList(notificationList);
    } else {
      // Show a success toast
      toast({
        title: 'Favourite Status Updated',
        description: 'You have successfully updated the favourite status.',
        variant: 'default',
      });
    }
  };

  // Function to handle toggling the archive status
  const handleToggleArchive = async (id: number) => {
    const updatedNotifications = notificationList.map((notification) =>
      notification.id === id
        ? { ...notification, is_archived: !notification.is_archived }
        : notification,
    );

    // Optimistically update the UI
    setNotificationList(updatedNotifications);

    // Update Supabase
    const supabase = createClient();
    const { error } = await supabase
      .from('notification')
      .update({
        is_archived: !updatedNotifications.find((n) => n.id === id)
          ?.is_archived,
      })
      .eq('id', id);

    if (error) {
      toast({
        title: 'Error',
        description: 'There was an error updating the archive status.',
        variant: 'destructive',
      });
      // Revert to the previous state in case of an error
      setNotificationList(notificationList);
    } else {
      // Show a success toast
      toast({
        title: 'Archive Status Updated',
        description: 'You have successfully updated the archive status.',
        variant: 'default',
      });
    }
  };

  // Type the onValueChange callback for Tabs to accept only specific string values
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleTabChange = (tab: any) => {
    setActiveTab(tab);
  };

  // Render notifications
  const renderNotifications = (notificationsList: Notification[]) => {
    return notificationsList.map((notification) => (
      <div
        key={notification.id}
        className={`flex items-center justify-between rounded-md pb-3 pt-3 transition-colors duration-200 ${notification.is_read ? 'bg-white' : 'bg-[#958A8A14]'} hover:bg-gray-100`}
      >
        <div className='flex items-center gap-4'>
          <Image
            src={
              notification.is_read
                ? '/assets/setting/team/offline.svg'
                : '/assets/setting/team/online.svg'
            }
            alt='Image'
            width={10}
            height={10}
          />

          {/* Favourite Icon */}
          <Image
            src={
              notification.is_favourite
                ? '/assets/notification/star2.svg'
                : '/assets/notification/star1.svg'
            }
            alt='Favourite Icon'
            width={18}
            height={18}
            onClick={() => handleToggleFavourite(notification.id)}
            className='cursor-pointer'
          />
          {/* Archive Icon */}
          <Image
            src={
              notification.is_archived
                ? '/assets/notification/notify.svg'
                : '/assets/notification/notify.svg'
            }
            alt='Archive Icon'
            width={18}
            height={18}
            onClick={() => handleToggleArchive(notification.id)}
            className='cursor-pointer'
          />
          <Link
            href={notification.activity_page_url}
            prefetch={true}
            scroll={false}
          >
            <p className='font-poppins text-[13px] text-gray-500'>
              {notification.description}
            </p>
          </Link>
        </div>
        <div className='flex items-center gap-2'>
          {/* Delete Icon */}
          <Image
            src='/assets/setting/team/delete.svg'
            alt='Delete Icon'
            width={13}
            height={13}
            onClick={() => handleDelete(notification.id)}
            className='cursor-pointer'
          />
        </div>
      </div>
    ));
  };

  return (
    <div className='mx-auto w-full max-w-4xl'>
      {/* Header Section */}
      <div className='mb-4 flex items-center gap-4 rounded-lg bg-[#E8E8F0] pb-4 pt-4'>
        <div className='pl-3'>
          <Image
            src='/assets/notification/notification.svg'
            alt='Notifications'
            width={20}
            height={20}
          />
        </div>
        <div className='font-poppins text-[18px] font-bold text-[#03045E]'>
          <h4>List Notifications</h4>
        </div>
      </div>

      {/* Notifications Count */}
      <div className='bg-white pb-4 pl-4'>
        <p className='pt-6 font-poppins'>
          {notificationList.length} notifications
        </p>
      </div>

      {/* Tabs */}
      <Tabs
        value={activeTab}
        onValueChange={handleTabChange}
        className='w-full'
      >
        <TabsList className='grid w-full grid-cols-3'>
          {['all', 'archive', 'favourite'].map((tab) => (
            <TabsTrigger
              key={tab}
              value={tab}
              className='bg-white text-[#03045E] hover:bg-gray-100 data-[state=active]:bg-white data-[state=active]:text-[#03045E]'
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
              <div className='ms-3 w-[40px] rounded-lg bg-[#F24E1E] text-center font-poppins text-[12px] text-white'>
                <p>{tabCounts[tab as keyof typeof tabCounts]}</p>
              </div>
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Tab Contents */}
        {['all', 'archive', 'favourite'].map((tab) => (
          <TabsContent key={tab} value={tab}>
            <Card>
              <CardContent className='space-y-2'>
                <div className='flex items-center gap-4 border-b border-[#E8E8F0] pb-2 pt-2'>
                  <div>
                    <p className='font-poppins text-[14px] text-gray-500'>
                      {tab.charAt(0).toUpperCase() + tab.slice(1)}
                    </p>
                  </div>
                </div>
                {renderNotifications(filteredNotifications)}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default Notification;
