import { Suspense } from 'react';
import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/auth/require-admin';
import { PortalLoginForm } from '@/components/shared/portal-login-form';

export const dynamic = 'force-dynamic';

async function AdminLoginWrapper() {
  const auth = await requireAdmin();

  if (!auth.ok) {
    if (auth.code === 'UNAUTHORIZED') {
      return (
        <PortalLoginForm
          portal="admin"
          badgeLabel="Admin Dashboard"
          title="Masuk sebagai admin"
          description="Gunakan portal dashboard untuk operasional, dispatch, CRM, finance, dan analitik internal."
        />
      );
    }

    redirect('/packages');
  }

  redirect('/dashboard');
}

export default function AdminEntryPage() {
  return (
    <Suspense fallback={null}>
      <AdminLoginWrapper />
    </Suspense>
  );
}
