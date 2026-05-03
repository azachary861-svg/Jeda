import Link from 'next/link';
import { redirect } from 'next/navigation';
import { createClient } from '@/lib/supabase/server';

export default async function MyBookingsPage() {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) redirect('/auth/login');

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id,booking_code,trip_date,status,grand_total')
    .eq('client_id', data.user.id)
    .order('created_at', { ascending: false });

  return (
    <main className="mx-auto max-w-4xl p-8">
      <h1 className="text-2xl font-semibold">Booking Saya</h1>
      <div className="mt-6 space-y-3">
        {(bookings ?? []).map((item) => (
          <Link key={item.id} href={`/my-bookings/${item.id}`} className="block rounded-lg border p-4">
            <p className="font-medium">{item.booking_code}</p>
            <p className="text-sm text-slate-600">{item.trip_date} • {item.status}</p>
            <p className="text-sm font-semibold">Rp {item.grand_total.toLocaleString('id-ID')}</p>
          </Link>
        ))}
      </div>
    </main>
  );
}
