import { UserDetails } from '@/lib/supabase';
import { CompanyDetails } from '@/lib/supabase/company';

export interface AppContextType {
  userDetails: UserDetails | null;
  companyDetails: CompanyDetails | null;
  setUserDetails: (userDetails: UserDetails | null) => void;
  updateCompanyState: (newState: Partial<CompanyDetails>) => void;
}
