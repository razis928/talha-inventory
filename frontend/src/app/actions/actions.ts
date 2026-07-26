'use server';

import { Provider } from '@supabase/supabase-js';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';

import { getURL } from '@/utils/helpers';
import { createClient } from '@/utils/supabase/server';

// Adjust the import based on your project structure
export async function emailLogin(formData: FormData) {
  const supabase = createClient();

  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
  };

  const { error } = await supabase.auth.signInWithPassword(data);

  if (error) {
    return { error: error.message };
  }

  revalidatePath('/', 'layout');
  return redirect('/dashboard/settings/payment-details');
}

export async function getAllUsers() {
  const supabase = createClient();

  const { data: userListing, error: userListingError } = await supabase
    .from('users')
    .select('*');

  if (userListingError) {
    return { error: userListingError.message };
  }

  return userListing;
}

export async function signup(formData: FormData) {
  const supabase = createClient();

  // type-casting here for convenience
  // in practice, you should validate your inputs
  const data = {
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    name: formData.get('name') as string,
    company_name: formData.get('companyName') as string,
    role: formData.get('role') as string,
  };

  const { data: companyDetail, error: companyError } = await supabase
    .from('company') // Corrected to remove type arguments as 'company' does not exist on type 'Database'
    .insert({
      company_name: data?.company_name,
    })
    .select();

  if (!data.company_name || companyError) {
    return { error: companyError?.message };
  }

  const { error } = await supabase.auth.signUp({
    email: data.email,
    password: data.password,
    options: {
      data: {
        name: data.name,
        company_name: data.company_name,
        role: data.role,
        company_id: companyDetail && Number(companyDetail[0].id),
      },
    },
  });

  if (error || companyError) {
    return { error: error?.message };
  }

  revalidatePath('/', 'layout');
  return redirect('/login');
}

export async function signOut() {
  const supabase = createClient();
  await supabase.auth.signOut();
  return redirect('/login');
}

export async function oAuthSignIn(provider: Provider) {
  if (!provider) {
    return redirect('/login?message=No provider selected');
  }

  const supabase = createClient();
  const redirectUrl = getURL('/auth/callback');

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider,
    options: {
      redirectTo: redirectUrl,
    },
  });

  if (error) {
    return redirect('/login?message=Could not authenticate user');
  }

  return redirect(data.url);
}
