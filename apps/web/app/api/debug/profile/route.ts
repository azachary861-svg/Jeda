import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const supabase = await createClient();

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json(
        { error: 'Tidak ada user yang login', user: null, profile: null },
        { status: 401 }
      );
    }

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, role')
      .eq('id', user.id)
      .maybeSingle();

    return NextResponse.json(
      {
        user: {
          id: user.id,
          email: user.email,
          app_metadata: user.app_metadata,
          user_metadata: user.user_metadata,
        },
        profile: profile || null,
        profileError: profileError?.message || null,
        debug: {
          profileRoleRaw: profile?.role,
          profileRoleType: typeof profile?.role,
          profileRoleIsNull: profile?.role === null,
          profileRoleIsUndefined: profile?.role === undefined,
        },
      },
      { status: 200 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Unknown error', stack: error instanceof Error ? error.stack : null },
      { status: 500 }
    );
  }
}
