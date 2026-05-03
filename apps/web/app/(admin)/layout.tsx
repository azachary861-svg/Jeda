import { redirect } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();

  if (!data.user) {
    redirect('/auth/login');
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <h1 className="font-semibold text-primary">Jeda Wisata Admin</h1>
          <nav className="flex gap-4 text-sm">
            <Link href="/dashboard">Dashboard</Link>
            <Link href="/bookings">Bookings</Link>
            <Link href="/dispatch">Dispatch</Link>
            <Link href="/verification">Verification</Link>
            <Link href="/finance">Finance</Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
