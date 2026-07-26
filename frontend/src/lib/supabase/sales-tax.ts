import { toast } from '@/components/ui/use-toast';

import { createClient } from '@/utils/supabase/client';

/**
 * Retrieves the sales tax rate for a specified state.
 *
 * This function queries the 'sales_tax' table in the database to get the
 * sales tax rate for the provided state. If the state is not specified or
 * an error occurs during the database operation, an empty string is returned.
 *
 * @param cite_state - The state for which the sales tax rate is being requested.
 * @returns A promise that resolves to the sales tax rate as a string, or an empty
 * string if the state is not found or an error occurs.
 */
export const getSalesTaxRate = async (
  cite_state: string | undefined,
): Promise<string> => {
  if (!cite_state) {
    return '';
  }
  // Clean up the input: Trim whitespace, remove trailing commas, etc.
  const cleanedState = cite_state.trim().replace(/,\s*$/, ''); // Remove trailing comma and any spaces after it
  if (!cleanedState) {
    return ''; // Return empty if state is invalid after cleanup
  }

  const supabase = createClient();
  try {
    const { data, error } = await supabase
      .from('sales_tax')
      .select('*')
      .ilike('location', `%${cleanedState}%`)
      .single();

    if (error) {
      toast({
        title: 'Error',
        description:
          `Sales tax not found for the location: ${cleanedState}` ||
          error.message,
        variant: 'destructive',
      });
      return '';
    }

    return data?.rate;
  } catch (err) {
    toast({
      title: 'Error',
      description: (err as Error).message,
      variant: 'destructive',
    });
    return '';
  }
};
