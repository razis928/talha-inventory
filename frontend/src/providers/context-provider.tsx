'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from 'react';

import { getUserDetails, UserDetails } from '@/lib/supabase';
import { CompanyDetails, getCompanyDetails } from '@/lib/supabase/company';

import { createClient } from '@/utils/supabase/client';

import { AppContextType } from '@/types/context';
interface ContextProviderProps {
  children: React.ReactNode;
}
export const AppContext = createContext<AppContextType | undefined>(undefined);

const ContextProvider: React.FC<ContextProviderProps> = ({ children }) => {
  const [userDetails, setUserDetails] = useState<UserDetails | null>(null);
  const [companyDetails, setCompanyDetails] = useState<CompanyDetails | null>(
    null,
  );

  useEffect(() => {
    (async () => {
      const supabase = createClient();

      const userInfo = (await getUserDetails(supabase)) as UserDetails | null;

      if (userInfo && userInfo.company) {
        setUserDetails(userInfo);
        const companyInfo = await getCompanyDetails(
          supabase,
          userInfo.company.id,
        );
        setCompanyDetails(companyInfo);
      }
    })();

    return () => {
      setUserDetails(null);
    };
  }, []);
  const updateCompanyState = useCallback(
    async (newState: Partial<CompanyDetails>) => {
      setCompanyDetails((prevDetails) =>
        prevDetails ? { ...prevDetails, ...newState } : null,
      );
    },
    [],
  );

  const appContextValue = {
    userDetails,
    companyDetails,
    updateCompanyState,
    setUserDetails,
  };

  return (
    <AppContext.Provider value={appContextValue}>
      {children}
    </AppContext.Provider>
  );
};

const useAppContext = (): AppContextType => {
  const context = useContext(AppContext);

  if (context === undefined) {
    throw new Error('useAppContext must be used within a ContextProvider');
  }

  return context;
};

export { ContextProvider, useAppContext };
