import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

function isValidSupabaseProjectUrl(value: string | undefined) {
  if (!value) {
    return false;
  }

  return /^https:\/\/[a-z0-9-]+\.supabase\.co$/i.test(value.trim());
}

type CookieToSet = {
  name: string;
  value: string;
  options?: {
    domain?: string;
    expires?: Date;
    httpOnly?: boolean;
    maxAge?: number;
    path?: string;
    sameSite?: 'lax' | 'strict' | 'none';
    secure?: boolean;
  };
};

export async function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!isValidSupabaseProjectUrl(supabaseUrl) || !supabaseAnonKey) {
    throw new Error('Missing Supabase environment variables. Please configure NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.');
  }

  const validatedSupabaseUrl = supabaseUrl as string;
  const validatedSupabaseAnonKey = supabaseAnonKey as string;

  const cookieStore = await cookies();

  return createServerClient(
    validatedSupabaseUrl,
    validatedSupabaseAnonKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet: CookieToSet[]) {
          try {
            cookiesToSet.forEach(({ name, value, options }) => cookieStore.set(name, value, options));
          } catch {
            // no-op in RSC where set may be unavailable
          }
        },
      },
    }
  );
}

export function isSupabaseConfigured() {
  return Boolean(isValidSupabaseProjectUrl(process.env.NEXT_PUBLIC_SUPABASE_URL) && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}
