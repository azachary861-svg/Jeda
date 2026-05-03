import { createClient, isSupabaseConfigured } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    if (!isSupabaseConfigured()) {
      return NextResponse.json({ user: null, role: null });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    let role = null;

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .maybeSingle();

      role = profile?.role ?? null;
    }

    return NextResponse.json({
      user: user ? { id: user.id } : null,
      role,
    });
  } catch (error) {
    console.error('Auth profile API error:', error);
    return NextResponse.json({ user: null, role: null });
  }
}
