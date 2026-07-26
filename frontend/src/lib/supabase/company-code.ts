import { toast } from '@/components/ui/use-toast';

import { createClient } from '@/utils/supabase/client';

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

export const addNewCompanyCode = async (payload: {
  code: string;
  short_description: string;
  long_description: string;
}): Promise<void> => {
  if (!payload || !payload.code || !payload.short_description) {
    toast({
      title: 'Error',
      description: 'Invalid payload provided',
      variant: 'destructive',
    });
    return;
  }

  const supabase = createClient();
  try {
    const { error } = await supabase.from('company_codes').insert(payload);
    if (error) {
      throw new Error(error.message);
    }
  } catch (err) {
    toast({
      title: 'Error',
      description: (err as Error).message || 'An unknown error occurred',
      variant: 'destructive',
    });
  }
};
