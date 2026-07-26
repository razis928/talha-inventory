import { PostgrestError, SupabaseClient } from '@supabase/supabase-js';
import { cache } from 'react';

export interface UserDetails {
  id: string;
  email: string;
  phone: string;
  display_name: string;
  created_at: string;
  avatar: string;
  role: string;
  stripe_customer_id: string;
  company: {
    id: string;
    company_name: string;
  };
}

/**
 * Gets the user and their associated company from the database.
 * @param supabase - The Supabase client.
 * @returns An object containing the user and the associated company.
 * @throws {Error} If the user is not found in the database, or if there is an error fetching the company.
 */
export const getUserDetails = async (
  supabase: SupabaseClient,
): Promise<unknown> => {
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return await supabase.auth.signOut();
  }

  const { data } = (await supabase
    .from('user_companies')
    .select('company_id,companies(*), users(*, user_roles!user_id(*))')
    .eq('user_id', user.id)
    .maybeSingle()) as {
    data: {
      company_id: number;
      companies: {
        id: number;
        company_name: string;
      };
      users: UserDetails & {
        user_roles: {
          role: string;
        }[];
      };
    };
    error: PostgrestError | null;
  };

  const userDetails = {
    id: user.id,
    email: user.email,
    phone: user.phone,
    display_name: data?.users?.display_name,
    created_at: user.created_at,
    avatar: data?.users?.avatar,
    role: data?.users?.user_roles[0]?.role,
    stripe_customer_id: data?.users?.stripe_customer_id,
    company: {
      id: data?.companies?.id,
      company_name: data?.companies?.company_name,
    },
  } as unknown as UserDetails;

  return userDetails;
};

export interface CompanyUsers {
  id: string;
  email: string;
  display_name: string;
  inserted_at: string;
  avatar: string;
  role: string;
  created_at: string;
  status: string;
}
/**
 * Gets all users in the same company as the logged-in user.
 *
 * @returns An array of users in the same company as the logged-in user.
 * @throws {Error} If there is an error fetching the company or users.
 */
export const getCompanyUsers = cache(
  async (supabase: SupabaseClient, company_id: string) => {
    const { data, error } = (await supabase
      .from('user_companies') // Start from user_companies table
      .select(
        `users (
	    id, email, display_name, avatar,inserted_at, user_roles!user_id (role))`,
      )
      .eq('company_id', company_id)) as unknown as {
      data: {
        users: {
          id: string;
          email: string;
          display_name: string;
          inserted_at: string;
          avatar: string;
          user_roles: {
            role: string;
          }[];
        };
      }[];
      error: PostgrestError | null;
    };
    if (error) {
      return error;
    }
    const users = data?.map((user) => {
      return {
        id: user.users.id,
        email: user.users.email,
        display_name: user.users.display_name,
        avatar: user.users.avatar,
        role: user.users.user_roles[0].role,
        created_at: user.users.inserted_at,
        status: 'online',
      };
    });

    return users as CompanyUsers[];
  },
);
