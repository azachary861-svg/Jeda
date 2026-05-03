import { redirect } from 'next/navigation';
import { requireDriver } from '@/lib/auth/require-driver';
import { DriverAppShell } from '@/components/driver/driver-app-shell';
import { PortalLoginForm } from '@/components/shared/portal-login-form';

export const dynamic = 'force-dynamic';

export default async function DriverAppPage() {
  const auth = await requireDriver();

  if (!auth.ok) {
    if (auth.code === 'UNAUTHORIZED') {
      return (
        <PortalLoginForm
          portal="driver"
          badgeLabel="Driver App"
          title="Masuk sebagai driver"
          description="Gunakan driver app untuk menerima jadwal trip, update GPS, dan upload dokumentasi real-time."
        />
      );
    }

    redirect('/packages');
  }

  const profile = auth.profile;

  return <DriverAppShell driverName={profile.full_name ?? 'Driver'} regionLabel={profile.region_id ?? 'Region'} />;
}
