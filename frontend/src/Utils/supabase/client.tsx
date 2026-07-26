import { createBrowserClient } from '@supabase/ssr';

import { SUPABASE_SERVICE_ROLE, SUPABASE_URL } from '@/config/env-config';

export function createClient() {
  return createBrowserClient(SUPABASE_URL!, SUPABASE_SERVICE_ROLE!);
}
