import { SupabaseClient } from '@supabase/supabase-js';

import { getUserDetails, UserDetails } from '@/lib/supabase';

import { toast } from '@/components/ui/use-toast';

import { createClient } from '@/utils/supabase/client';

import { Client } from '@/types/client';

/**
 * Gets all clients in the same company as the logged-in user.
 *
 * @returns An array of clients in the same company as the logged-in user.
 * @throws {Error} If there is an error fetching the company or clients.
 */
export const getCompanyClients = async (
  supabase: SupabaseClient,
): Promise<Client[] | null> => {
  const user = (await getUserDetails(supabase)) as UserDetails | null;

  if (!user || !user.company) {
    return null;
  }

  const { data: companyClients, error } = await supabase
    .from('clients')
    .select('*')
    .eq('company_id', user.company.id);

  if (error) {
    return null;
  }

  if (!companyClients) {
    return null;
  }

  return companyClients;
};

/**
 * Creates a new client with the given payload.
 *
 * @param {SupabaseClient} supabase - The Supabase client.
 * @param {Object} payload - The payload for the new client.
 * @returns The newly created client.
 * @throws {Error} If there is an error creating the client.
 */
export const addNewClient = async (
  payload: unknown,
): Promise<Client | null> => {
  const supabase = createClient();
  const { data: newClient, error } = await supabase
    .from('clients')
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
 * Updates an existing client with the given payload.
 *
 * @param {SupabaseClient} supabase - The Supabase client.
 * @param {string} clientId - The ID of the client to update.
 * @param {Object} payload - The updated payload for the client.
 * @returns The updated client or null if an error occurs.
 */
export const updateClient = async (
  clientId: string,
  payload: unknown,
): Promise<Client | null> => {
  const supabase = createClient();
  const { data: updatedClient, error } = await supabase
    .from('clients')
    .update(payload)
    .eq('id', clientId)
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

  return updatedClient;
};
