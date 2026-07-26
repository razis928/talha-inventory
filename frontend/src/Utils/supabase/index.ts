import { SupabaseClient } from '@supabase/supabase-js';
import { jwtDecode } from 'jwt-decode';

export async function getUserRole(
  supabase: SupabaseClient,
): Promise<string | null> {
  try {
    return new Promise((resolve) => {
      supabase.auth.onAuthStateChange(async (_event, session) => {
        if (session) {
          const jwt = jwtDecode<{ user_role: string }>(session.access_token);
          const userRole = jwt.user_role;
          resolve(userRole);
        } else {
          resolve(null);
        }
      });
    });
  } catch (error) {
    return null;
  }
}
