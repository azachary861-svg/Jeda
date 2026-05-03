import { Suspense } from 'react';
import { PortalLoginForm } from '@/components/shared/portal-login-form';

export const dynamic = 'force-dynamic';

export default function AdminEntryPage() {
  return (
    <Suspense fallback={null}>
      <PortalLoginForm
        portal="admin"
        badgeLabel="Admin Dashboard"
        title="Masuk sebagai admin"
        description="Gunakan portal dashboard untuk operasional, dispatch, CRM, finance, dan analitik internal."
      />
    </Suspense>
  );
}
