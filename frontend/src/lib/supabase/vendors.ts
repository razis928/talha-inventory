import { SupabaseClient } from '@supabase/supabase-js';

import { getUserDetails, UserDetails } from '@/lib/supabase';

import { toast } from '@/components/ui/use-toast';

import { createClient } from '@/utils/supabase/client';

import { Vendor } from '@/types/vendor';

/**
 * Gets all vendors in the same company as the logged-in user.
 *
 * @param supabase - The Supabase client.
 * @returns An array of vendors in the same company as the logged-in user.
 * @throws {Error} If there is an error fetching the company or vendors.
 */
export const getCompanyVendors = async (
  supabase: SupabaseClient,
): Promise<Vendor[] | null> => {
  const user = (await getUserDetails(supabase)) as UserDetails | null;

  if (!user || !user.company) {
    await supabase.auth.signOut();
    return null;
  }

  const { data: companyVendors, error } = await supabase
    .from('vendors')
    .select('*')
    .eq('company_id', user.company.id);

  if (error) {
    return null;
  }

  if (!companyVendors) {
    return null;
  }

  return companyVendors;
};

/**
 * Creates a new client with the given payload.
 *
 * @param {SupabaseClient} supabase - The Supabase client.
 * @param {Object} payload - The payload for the new client.
 * @returns The newly created client.
 * @throws {Error} If there is an error creating the client.
 */
export const addNewVendor = async (
  payload: unknown,
): Promise<Vendor | null> => {
  const supabase = createClient();
  const { data: newClient, error } = await supabase
    .from('vendors')
    .insert([payload])
    .select('*')
    .single();

  if (error) {
    const errorMessage = error.message || 'An unknown error occurred';
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive',
    });
    return null;
  }

  return newClient;
};

/**
 * Updates an existing vendor with the given payload.
 *
 * @param {SupabaseClient} supabase - The Supabase client.
 * @param {string} vendorId - The ID of the client to update.
 * @param {Object} payload - The updated payload for the vendor.
 * @returns The updated client or null if an error occurs.
 */
export const updateVendor = async (
  vendorId: string,
  payload: unknown,
): Promise<Vendor | null> => {
  const supabase = createClient();
  const { data: updatedVendor, error } = await supabase
    .from('vendors')
    .update(payload)
    .eq('id', vendorId)
    .single();

  if (error) {
    const errorMessage = error.message || 'An unknown error occurred';
    toast({
      title: 'Error',
      description: errorMessage,
      variant: 'destructive',
    });
    return null;
  }

  return updatedVendor;
};
