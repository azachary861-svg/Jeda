import { createClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/login?next=/profile');
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, email, role')
    .eq('id', user.id)
    .maybeSingle();

  return (
    <main className="mx-auto max-w-4xl p-6">
      <h1 className="text-2xl font-semibold">Profil Saya</h1>
      <div className="mt-4 rounded-lg border bg-white p-4 text-sm">
        <p>Nama: {profile?.full_name ?? '-'}</p>
        <p>Email: {profile?.email ?? user.email ?? '-'}</p>
        <p>Role: {profile?.role ?? 'client'}</p>
      </div>
    </main>
  );
}
