import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !/^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(supabaseUrl) || !supabaseAnonKey) {
    throw new Error('Supabase client configuration is invalid.');
  }

  return createBrowserClient(
    supabaseUrl,
    supabaseAnonKey
  );
}
