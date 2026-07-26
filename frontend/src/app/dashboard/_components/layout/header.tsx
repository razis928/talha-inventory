'use client';
import { Bell, Loader2, LogOut, Search } from 'lucide-react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import React, { useEffect, useRef, useState } from 'react';

import { getUserDetails, UserDetails } from '@/lib/supabase';

import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';

import { signOut } from '@/app/actions/actions';
import { useAppContext } from '@/providers/context-provider';
import { createClient } from '@/utils/supabase/client';

interface Header {
  title: string;
  [key: string]: string;
}
export type HeadersDataType = {
  [key: string]: Header;
};

const Header = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { userDetails } = useAppContext();

  // Header data structure
  const headersData: HeadersDataType = {
    dashboard: {
      title: 'Welcome, ',
      name: userDetails?.display_name || '',
      desc: 'Here’s what is going on today.',
    },
    'account-receivables': {
      title: 'Accounting',
      desc: 'Check your clients financial overview',
    },
    'account-payables': {
      title: 'Accounting',
      desc: 'Check your vendor’s financial overview',
    },
    reports: {
      title: 'Accounting',
      desc: 'Check your company financial overview',
    },
    actions: {
      title: 'Search Aid Ai Task',
      desc: 'Hi i’m Aid, kindly let me know how i can be of help.',
    },
    settings: {
      title: 'Settings',
      desc: 'View and manage settings related to your company',
    },
    'cyber-security': {
      title: 'Security Operations Center',
      desc: 'Real-time security monitoring',
    },
    'sales-marketing': {
      title: 'Sales & Marketing Department',
      desc: 'Detail information on your company sales',
    },
    operations: {
      title: 'Operations Department',
      desc: 'Detail information on your company operations',
    },
    'human-resources': {
      title: 'Human Resources',
      desc: '',
    },
    payroll: {
      title: 'Employee Payroll Summary Report',
      desc: '',
    },
    insurance: {
      title: 'Insurance Coverage Report',
      desc: '',
    },
  };

  const route = pathname.split('/')[pathname.split('/').length - 1];
  const currentHeader =
    headersData[route as keyof typeof headersData] || headersData.dashboard;

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [notificationLength, setNotificationLength] = useState(0);
  const toggleDropdown = () => setIsDropdownOpen(!isDropdownOpen);

  // Define the mapping of search terms to routes
  const pageRoutes: { [key: string]: string } = {
    'account-receivables': '/dashboard/accounting/account-receivables',
    'account-payables': '/dashboard/accounting/account-payables',
    reports: '/dashboard/accounting/reports',
    actions: '/dashboard/actions',
    settings: '/dashboard/settings',
    'company-info': '/dashboard/settings/company-info',
    'payment-details': '/dashboard/settings/payment-details',
    'general-settings': '/dashboard/settings/general-settings',
    dashboard: '/dashboard',
    team: '/dashboard/settings/team',
    vendors: '/dashboard/vendors',
    clients: '/dashboard/clients',
    general_ledger: '/general-ledger',
    balance_sheet: '/balance-sheet',
    budget_report: '/budget-report',
    bank_reconciliation: '/bank-reconciliation',
    profit_loss: '/profit_loss',
    account_receivable_subsidary_ledger: '/account-receivable-subsidary-ledger',
    account_receivable_customer_list: '/account-receivable-customer-list',
    account_payable_subsidiary_ledger: '/account-payable-subsidiary-ledger',
    account_payable_vendor_list: '/account-payable-vendor-list',
    'cyber-security': '/dashboard/cyber-security',
    'sales-marketing': '/dashboard/sales-marketing',
    operations: '/dashboard/operations',
    payroll: '/dashboard/payroll',
    insurance: '/dashboard/payroll',
  };

  // Update suggestions based on search query
  useEffect(() => {
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const filteredSuggestions = Object.keys(pageRoutes).filter((route) =>
        route.toLowerCase().includes(query),
      );
      setSuggestions(filteredSuggestions);
    } else {
      setSuggestions([]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchQuery]);

  // Handle search submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const targetRoute = pageRoutes[searchQuery.toLowerCase()];
      if (targetRoute) {
        router.push(targetRoute);
      } else {
        router.push(`/search?query=${encodeURIComponent(searchQuery)}`, {
          scroll: false,
        });
      }
      // Clear search input after redirect
      setSearchQuery('');
      setIsExpanded(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    const targetRoute = pageRoutes[suggestion.toLowerCase()];

    if (targetRoute) {
      router.push(targetRoute);
    }

    // Clear search input after redirect
    setSearchQuery('');
    setIsExpanded(false);
  };

  /// get notification number on every refesh
  useEffect(() => {
    (async () => {
      const supabase = createClient();
      const userDetails = (await getUserDetails(supabase)) as UserDetails;
      const { data, error } = await supabase
        .from('notification')
        .select()
        .eq('user_id', userDetails.id);

      if (error) {
        setNotificationLength(notificationLength);
        return;
      }
      setNotificationLength(data.length);
    })();
  }, [notificationLength]);

  // Handle click outside to close dropdown and search input
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false);
      }
      if (
        searchRef.current &&
        !searchRef.current.contains(event.target as Node)
      ) {
        setIsExpanded(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = async () => {
    setLoading(true);
    await signOut();
    setLoading(false);
  };

  return (
    <div className='pb-4 pr-4 pt-4'>
      <header>
        <div className='mb-4 mt-4 flex items-center justify-between'>
          <div>
            <h1 className='font-poppins text-2xl font-semibold leading-[43.78px] text-smoke-400'>
              <span
                className={`font-martel-sans font-semibold ${currentHeader.title === 'Accounting' ? 'font-bold' : ''}`}
              >
                {currentHeader.title}
              </span>
              {currentHeader.name && (
                <span className='font-martel-sans font-bold'>
                  {currentHeader.name}
                </span>
              )}
            </h1>
            <p className='sidebar-text opacity-50'>{currentHeader.desc}</p>
          </div>
          <div className='flex items-center space-x-4'>
            <div
              className='relative flex items-center text-gray-700'
              ref={searchRef}
            >
              <Search
                className={`absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 transform cursor-pointer text-gray-700 ${isExpanded ? 'left-2' : 'left-2'}`}
                onClick={() => setIsExpanded(!isExpanded)}
              />
              <form onSubmit={handleSearchSubmit}>
                <Input
                  type='text'
                  placeholder='Ai-Search'
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className={`h-[38px] rounded-full bg-[white] pr-5 font-montserrat text-gray-700 transition-all duration-300 ease-in-out ${
                    isExpanded
                      ? 'w-[400px] pl-10 sm:w-[300px] md:w-[400px] lg:w-[438px]'
                      : 'w-[0px] pl-5'
                  }`}
                />
              </form>
              {suggestions.length > 0 && (
                <div className='absolute left-0 top-full z-10 mt-2 w-full rounded-md bg-white shadow-lg'>
                  <ul>
                    {suggestions.map((suggestion, index) => (
                      <li
                        key={index}
                        className='cursor-pointer px-4 py-2 text-gray-700 hover:bg-gray-100'
                        onClick={() => handleSuggestionClick(suggestion)}
                      >
                        {suggestion}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
            <div className='relative flex items-center gap-6'>
              {/* create a badge on bell icon start*/}
              <Link
                href='/dashboard/notification'
                prefetch={true}
                scroll={false}
              >
                <div>
                  <Bell className='absolute h-5 w-5 text-primary' />

                  <div className='relative right-[-10px] top-[-8px]'>
                    <p className='rounded-full bg-primary px-[4px] py-[2px] text-center text-[10px] font-bold text-white'>
                      {notificationLength}
                    </p>
                  </div>
                </div>
              </Link>
              {/* create a badge on bell icon end*/}

              <div className='relative cursor-pointer' ref={dropdownRef}>
                <Avatar className='bg-gray-100' onClick={toggleDropdown}>
                  <AvatarFallback>
                    {userDetails?.display_name?.charAt(0)}
                  </AvatarFallback>
                </Avatar>

                {isDropdownOpen && (
                  <div className='absolute right-0 z-50 mt-2 w-48 rounded-lg border border-gray-200 bg-white shadow-lg'>
                    <ul className='py-2'>
                      <li>
                        <button
                          onClick={handleLogout}
                          disabled={loading}
                          className='block w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-100'
                        >
                          {loading ? (
                            <Loader2 className='mr-2 inline h-4 w-4 animate-spin' />
                          ) : (
                            <LogOut className='mr-2 inline-block' />
                          )}
                          Logout
                        </button>
                      </li>
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </header>
    </div>
  );
};

export default Header;
