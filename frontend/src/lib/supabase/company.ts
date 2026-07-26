import { SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';

import { toast } from '@/components/ui/use-toast';

import { createClient } from '@/utils/supabase/client';

export interface UserCompanies {
  user_id: string;
  users: {
    email: string;
    display_name: string;
    avatar: string;
    stripe_customer_id: string | null;
    user_roles: { role: string }[];
  };
}
export interface CompanyDetails {
  id: string;
  company_name: string;
  inserted_at: string;
  created_by: string;
  notification_enabled: boolean;
  profile_link: string;
  user_companies: UserCompanies[];
}

export const getCompanyDetails = cache(
  async (
    supabase: SupabaseClient,
    companyId: string,
  ): Promise<CompanyDetails> => {
    const { data, error } = await supabase
      .from('companies')
      .select(
        `
      id,
      company_name,
      notification_enabled,
      profile_link,
      inserted_at,
      created_by,
      user_companies (user_id, users (email, display_name, avatar,stripe_customer_id, user_roles (role)))
    `,
      )
      .eq('id', companyId) // Filter to get the specific company by ID
      .single();

    if (error) {
      throw new Error(error.message);
    }

    return data as unknown as CompanyDetails;
  },
);

export const getCompanyCode = async (
  companyName: string | undefined,
): Promise<string> => {
  if (!companyName) {
    return '';
  }
  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('company_codes')
      .select('*')
      .ilike('short_description', `%${companyName}%`)
      .single();

    if (error) {
      return '';
    }

    return data?.code || null;
  } catch (err) {
    toast({
      title: 'Error',
      description: (err as Error).message,
      variant: 'destructive',
    });
    return '';
  }
};
