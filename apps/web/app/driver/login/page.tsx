import { Suspense } from 'react';
import { PortalLoginForm } from '@/components/shared/portal-login-form';

export default function DriverLoginPage() {
  return (
    <Suspense fallback={null}>
      <PortalLoginForm
        portal="driver"
        badgeLabel="Driver App"
        title="Masuk sebagai driver"
        description="Gunakan driver app untuk menerima jadwal trip, update GPS, dan upload dokumentasi real-time."
      />
    </Suspense>
  );
}
