import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

/**
 * DEBUG ENDPOINT: Check current user/profile state
 * POST /api/debug/user-state with { email: string, password: string }
 */
export async function POST(request: Request) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required to verify account' },
        { status: 400 }
      );
    }

    const supabase = await createClient();

    // Try to login with the account to get user
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError) {
      return NextResponse.json(
        { error: `Authentication failed: ${authError.message}` },
        { status: 401 }
      );
    }

    if (!authData.user) {
      return NextResponse.json({ error: 'User not found after auth' }, { status: 404 });
    }

    const user = authData.user;

    // Get profile
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .maybeSingle();

    if (profileError) {
      return NextResponse.json(
        { error: `Failed to fetch profile: ${profileError.message}` },
        { status: 500 }
      );
    }

    // Normalize function (same as in auth.ts)
    function normalizeRole(role: string | null | undefined) {
      if (!role) {
        return null;
      }
      return role
        .trim()
        .toLowerCase()
        .replace(/[\s-]+/g, '_')
        .replace(/^_+|_+$/g, '');
    }

    function isAdminRole(role: string | null | undefined): boolean {
      const normalized = normalizeRole(role);
      return (
        normalized === 'super_admin' ||
        normalized === 'regional_admin' ||
        normalized === 'superadmin' ||
        normalized === 'regionaladmin' ||
        normalized === 'admin'
      );
    }

    const rawRole = profile?.role;
    const normalizedRole = normalizeRole(rawRole);
    const isAdmin = isAdminRole(rawRole);

    // Sign out the test session
    await supabase.auth.signOut({ scope: 'local' });

    return NextResponse.json({
      found: true,
      email,
      auth: {
        userId: user.id,
        email_verified: user.email_confirmed_at !== null,
        last_sign_in: user.last_sign_in_at,
      },
      profile: {
        exists: !!profile,
        data: profile,
        rawRole,
        normalizedRole,
        isAdminRole: isAdmin,
      },
      debugInfo: {
        profileNull: profile === null,
        rawRoleType: typeof rawRole,
        rawRoleValue: `"${rawRole}"`,
        normalizedRoleValue: `"${normalizedRole}"`,
        adminCheckResult: isAdmin,
      },
    });
  } catch (error) {
    console.error('Debug endpoint error:', error);
    return NextResponse.json(
      { error: `Internal server error: ${error instanceof Error ? error.message : 'Unknown'}` },
      { status: 500 }
    );
  }
}
