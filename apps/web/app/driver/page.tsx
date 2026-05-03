import { redirect } from 'next/navigation';
import { requireDriver } from '@/lib/auth/require-driver';
import { DriverAppShell } from '@/components/driver/driver-app-shell';

export const dynamic = 'force-dynamic';

export default async function DriverAppPage() {
  const auth = await requireDriver();

  if (!auth.ok) {
    redirect(auth.code === 'UNAUTHORIZED' ? '/driver/login' : '/packages');
  }

  const profile = auth.profile;

  return <DriverAppShell driverName={profile.full_name ?? 'Driver'} regionLabel={profile.region_id ?? 'Region'} />;
}
