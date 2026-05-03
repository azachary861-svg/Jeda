import { DashboardLiveFeed, type FeedItem, type FeedType } from '@/components/admin/dashboard-live-feed';
import { createClient } from '@/lib/supabase/server';

type RegionCard = {
  id: string;
  name: string;
  activeTrips: number;
  monthlyRevenue: number;
  teamCount: number;
  targetProgress: number;
  status: 'good' | 'warning' | 'critical';
};

export default async function DashboardPage() {
  const supabase = await createClient();

  const now = new Date();
  const todayIso = now.toISOString().slice(0, 10);
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const staleThreshold = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

  const [
    activeTripsRes,
    monthlyTransactionsRes,
    fieldTeamRes,
    activeArmadaRes,
    reviewsRes,
    regionsRes,
    allBookingsRes,
    monthBookingsRes,
    staleBookingsRes,
    expiredDocsRes,
  ] = await Promise.all([
    supabase.from('bookings').select('id', { count: 'exact', head: true }).eq('status', 'on_trip').eq('trip_date', todayIso),
    supabase.from('transactions').select('amount,type,region_id').gte('created_at', monthStart),
    supabase.from('profiles').select('id', { count: 'exact', head: true }).in('role', ['driver', 'photographer', 'guide']).eq('is_active', true),
    supabase.from('driver_locations').select('driver_id', { count: 'exact', head: true }).in('status', ['standby', 'on_trip']),
    supabase.from('reviews').select('rating').limit(300),
    supabase.from('regions').select('id,display_name,name').eq('is_active', true),
    supabase.from('bookings').select('id,region_id,status,created_at').order('created_at', { ascending: false }).limit(2000),
    supabase.from('bookings').select('id,region_id,status').gte('created_at', monthStart).limit(3000),
    supabase
      .from('bookings')
      .select('id', { count: 'exact', head: true })
      .is('driver_id', null)
      .in('status', ['confirmed', 'assigned'])
      .lt('created_at', staleThreshold),
    supabase
      .from('driver_verifications')
      .select('id', { count: 'exact', head: true })
      .or(`sim_expiry.lt.${todayIso},stnk_expiry.lt.${todayIso},skck_expiry.lt.${todayIso},first_aid_expiry.lt.${todayIso}`),
  ]);

  const activeTripsToday = activeTripsRes.count ?? 0;
  const totalFieldTeam = fieldTeamRes.count ?? 0;
  const activeArmada = activeArmadaRes.count ?? 0;

  const transactionRows = monthlyTransactionsRes.data ?? [];
  const revenueThisMonth = transactionRows.filter((row) => row.type === 'income').reduce((sum, row) => sum + row.amount, 0);

  const ratings = (reviewsRes.data ?? []).map((row) => row.rating).filter((rating): rating is number => typeof rating === 'number');
  const clientSatisfaction = ratings.length > 0 ? Number((ratings.reduce((acc, val) => acc + val, 0) / ratings.length).toFixed(2)) : 0;

  const regions = regionsRes.data ?? [];
  const allBookings = allBookingsRes.data ?? [];
  const monthBookings = monthBookingsRes.data ?? [];

  const regionCards: RegionCard[] = regions.map((region) => {
    const activeTrips = allBookings.filter((booking) => booking.region_id === region.id && booking.status === 'on_trip').length;
    const monthlyRevenue = transactionRows
      .filter((row) => row.region_id === region.id && row.type === 'income')
      .reduce((acc, row) => acc + row.amount, 0);
    const monthlyBookings = monthBookings.filter((booking) => booking.region_id === region.id).length;
    const targetProgress = Math.min(100, Math.round((monthlyBookings / 120) * 100));
    const status: RegionCard['status'] = targetProgress >= 85 ? 'good' : targetProgress >= 60 ? 'warning' : 'critical';

    return {
      id: region.id,
      name: region.display_name ?? region.name,
      activeTrips,
      monthlyRevenue,
      teamCount: 0,
      targetProgress,
      status,
    };
  });

  const unresolvedAssignCount = staleBookingsRes.count ?? 0;
  const expiredDocsCount = expiredDocsRes.count ?? 0;

  const freshFiveStarReviews = await supabase
    .from('reviews')
    .select('id', { count: 'exact', head: true })
    .eq('rating', 5)
    .gte('created_at', new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString());

  const alerts = [
    unresolvedAssignCount > 0
      ? { tone: 'error' as const, text: `${unresolvedAssignCount} booking belum assign driver >24 jam.` }
      : null,
    expiredDocsCount > 0
      ? { tone: 'warning' as const, text: `${expiredDocsCount} driver punya dokumen/sertifikasi yang sudah expired.` }
      : null,
    (freshFiveStarReviews.count ?? 0) > 0
      ? { tone: 'info' as const, text: `${freshFiveStarReviews.count} review bintang 5 baru dalam 24 jam terakhir.` }
      : null,
  ].filter((item): item is { tone: 'error' | 'warning' | 'info'; text: string } => Boolean(item));

  const initialFeed: FeedItem[] = allBookings.slice(0, 12).map((booking) => {
    const type: FeedType =
      booking.status === 'completed' ? 'trip_completed' : booking.status === 'on_trip' ? 'trip_started' : 'booking_new';

    return {
      id: booking.id,
      type,
      message: `Booking ${booking.status.replaceAll('_', ' ')}`,
      regionId: booking.region_id,
      createdAt: booking.created_at,
    };
  });

  return (
    <main>
      <div className="mb-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-700">
        ⚠ Monitoring pusat aktif. Pastikan booking dengan status assigned langsung mendapat driver.
      </div>

      {alerts.length > 0 ? (
        <div className="mb-4 space-y-2">
          {alerts.map((alert) => (
            <div
              key={alert.text}
              className={
                alert.tone === 'error'
                  ? 'rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700'
                  : alert.tone === 'warning'
                    ? 'rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-sm text-amber-700'
                    : 'rounded-lg border border-blue-300 bg-blue-50 px-3 py-2 text-sm text-blue-700'
              }
            >
              {alert.text}
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-2 md:grid-cols-2 xl:grid-cols-5">
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-[11px] text-slate-500">Trip aktif hari ini</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{activeTripsToday}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-[11px] text-slate-500">Revenue bulan ini</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">Rp {revenueThisMonth.toLocaleString('id-ID')}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-[11px] text-slate-500">Field team aktif</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{totalFieldTeam}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-[11px] text-slate-500">Armada aktif</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{activeArmada}</p>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-3">
          <p className="text-[11px] text-slate-500">Kepuasan klien</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{clientSatisfaction}</p>
        </div>
      </div>

      <section className="mt-4 rounded-lg border border-slate-200 bg-white p-4">
        <h2 className="text-sm font-semibold text-slate-900">Performa per regional hub</h2>
        <div className="mt-3 grid gap-2 md:grid-cols-2 xl:grid-cols-3">
          {regionCards.map((region) => (
            <div key={region.id} className="rounded-lg border border-slate-200 p-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold">{region.name}</p>
                <span
                  className={
                    region.status === 'good'
                      ? 'rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] text-emerald-700'
                      : region.status === 'warning'
                        ? 'rounded-full bg-amber-100 px-2 py-0.5 text-[10px] text-amber-700'
                        : 'rounded-full bg-rose-100 px-2 py-0.5 text-[10px] text-rose-700'
                  }
                >
                  {region.status}
                </span>
              </div>
              <div className="mt-2 space-y-1 text-xs text-slate-600">
                <p>Active trips: {region.activeTrips}</p>
                <p>Revenue: Rp {region.monthlyRevenue.toLocaleString('id-ID')}</p>
                <p>Team count: {region.teamCount}</p>
                <p>Target progress: {region.targetProgress}%</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <DashboardLiveFeed initialFeed={initialFeed} />
    </main>
  );
}
