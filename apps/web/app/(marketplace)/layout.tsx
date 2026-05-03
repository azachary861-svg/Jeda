import Link from 'next/link';

export default function MarketplaceLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen">
      <header className="border-b bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between p-4">
          <Link href="/" className="font-semibold text-primary">
            Jeda Wisata
          </Link>
          <nav className="flex gap-4 text-sm">
            <Link href="/packages">Paket</Link>
            <Link href="/real-trip-maps">Real Trip Maps</Link>
            <Link href="/my-bookings">Booking Saya</Link>
          </nav>
        </div>
      </header>
      {children}
    </div>
  );
}
