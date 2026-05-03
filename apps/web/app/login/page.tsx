import { Suspense } from 'react';
import { PortalLoginForm } from '@/components/shared/portal-login-form';

export default function ClientLoginPage() {
  return (
    <Suspense fallback={null}>
      <PortalLoginForm
        portal="client"
        badgeLabel="Marketplace"
        title="Masuk sebagai client"
        description="Gunakan portal marketplace untuk booking paket, melihat pembayaran, dan memantau perjalanan Anda."
      />
    </Suspense>
  );
}
