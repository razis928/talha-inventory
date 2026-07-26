'use client';
import { format, isValid } from 'date-fns';
import Image from 'next/image';
import React, { FC } from 'react';

import { CompanyUsers, UserDetails } from '@/lib/supabase';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';

import InviteMember from '@/app/dashboard/settings/team/_components/invite-user-model';

interface Props {
  companyUsers: CompanyUsers[];
  user: UserDetails;
}
const Team: FC<Props> = ({ companyUsers, user }) => {
  const userRole =
    companyUsers?.find((companyUser) => companyUser.id === user.id)?.role || '';

  return (
    <div className='w-full px-4'>
      <div className='flex flex-col items-start justify-between sm:flex-row sm:items-center'>
        <div className='flex flex-col gap-2'>
          <h1 className='font-poppins text-base font-semibold text-black'>
            Team
          </h1>
          <p className='para-text--small text-gray-600 opacity-65'>
            Manage team members
          </p>
        </div>
        {userRole && ['CEO', 'CFO'].includes(userRole) && (
          <div className='mt-4 sm:mt-0'>
            <InviteMember />
          </div>
        )}
      </div>
      <div className='mt-11 overflow-x-auto'>
        <Table className='bg-white'>
          <TableHeader className='bg-opacBlue'>
            <TableRow className='border-transparent'>
              <TableHead></TableHead>
              <TableHead className='para-text text-black'>Name</TableHead>
              <TableHead className='para-text text-black'>Access</TableHead>
              <TableHead className='para-text text-black'>Status</TableHead>
              <TableHead className='para-text text-black'>Joined</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody className='bg-white'>
            {companyUsers?.map((member) => (
              <TableRow key={member.id} className='relative border-none'>
                <TableCell className='whitespace-nowrap text-right'>
                  <input type='checkbox' className='mt-8 h-5 w-5' />
                </TableCell>
                <TableCell className='whitespace-nowrap px-6 py-4 pl-0'>
                  <div className='flex items-center gap-5 pt-6'>
                    <Avatar className='bg-gray-100'>
                      <AvatarFallback>
                        {member?.display_name?.charAt(0)}
                      </AvatarFallback>
                    </Avatar>
                    {/* <Image
                      src='/assets/setting/team/team.svg'
                      alt='Team Icon'
                      width={37} 
                      height={37}
                    /> */}
                    <div className='flex flex-col gap-1'>
                      <div className='para-text--small font-semibold text-black'>
                        {member?.display_name}
                      </div>
                      <p className='font-poppins text-[10px] font-normal leading-[15px] text-black'>
                        {member?.role}
                      </p>
                    </div>
                  </div>
                </TableCell>
                <TableCell
                  className={`whitespace-nowrap px-6 py-4 pl-[15px] font-poppins text-sm ${
                    member.role === 'Owner' ? 'text-gray-500' : 'text-black'
                  }`}
                >
                  <div className='flex items-center gap-3'>
                    <div
                      className={`font-poppins text-sm font-semibold ${
                        member.role === 'Owner' ? 'text-gray-500' : 'text-black'
                      }`}
                    >
                      {member.role}
                    </div>
                    {/* {member.access !== 'Owner' && ( */}
                    <Image
                      src='/assets/setting/team/access.svg'
                      alt='Access Icon'
                      width={10}
                      height={10}
                    />
                    {/* )} */}
                  </div>
                </TableCell>
                <TableCell className='whitespace-nowrap px-6 py-4 pl-[10px] text-sm text-gray-500'>
                  <div className='flex items-center gap-3'>
                    <Image
                      src={`/assets/setting/team/${
                        member.role === 'CFO' ? 'online' : 'offline'
                      }.svg`}
                      alt={`${member?.status} Icon`}
                      width={16}
                      height={16}
                    />
                    <div
                      className={`para-text--small ms-1 ${
                        member?.status === 'Online'
                          ? 'text-green-600'
                          : 'text-gray-300'
                      }`}
                    >
                      {member?.status}
                    </div>
                  </div>
                </TableCell>
                <TableCell className='whitespace-nowrap px-6 py-4 pl-0 text-sm text-gray-500'>
                  <div className='flex items-center gap-20'>
                    <div className='para-text--small'>
                      {member?.created_at &&
                      isValid(new Date(member.created_at))
                        ? format(new Date(member.created_at), 'MMM dd, yyyy')
                        : ''}
                    </div>
                    {/* {member?.created_at && (
                      <Image
                        src='/assets/setting/team/delete.svg'
                        alt='Delete Icon'
                        width={11.38}
                        height={12.25}
                      />
                    )} */}
                  </div>
                </TableCell>
                <span className='absolute bottom-0 left-[25px] w-[calc(100%-60px)] border-b border-gray-900 opacity-20' />
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default Team;
