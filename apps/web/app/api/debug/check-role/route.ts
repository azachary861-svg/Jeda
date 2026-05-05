import { createClient } from '@/lib/supabase/server';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  const { email } = await request.json();

  if (!email) {
    return NextResponse.json({ error: 'Email is required' }, { status: 400 });
  }

  const supabase = await createClient();

  // Get user ID from email
  const { data: authData, error: authError } = await supabase.auth.admin.listUsers();
  const user = authData.users.find((u) => u.email === email);

  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  // Get profile role
  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).maybeSingle();

  // Normalize role
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

  // Check if admin
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

  return NextResponse.json({
    email,
    userId: user.id,
    rawRole,
    normalizedRole,
    isAdmin,
    userMetadata: {
      role: user.user_metadata?.role,
      app_metadata_role: user.app_metadata?.role,
    },
    profile,
  });
}
