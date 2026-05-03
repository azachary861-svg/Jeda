'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { usePathname } from 'next/navigation';

type MarketplaceHeaderProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  isDriver: boolean;
  userInitial: string;
};

function navActive(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function MarketplaceHeader({ isLoggedIn, isAdmin, isDriver, userInitial }: MarketplaceHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
      <div className="mx-auto flex h-[52px] max-w-7xl items-center gap-4 px-4">
        <Link href="/packages" className="shrink-0 text-base font-bold tracking-tight text-emerald-700">
          Trip<span className="text-emerald-500">Nesia</span>
        </Link>

        <nav className="mx-auto hidden items-center gap-1 text-xs md:flex">
          <Link
            href="/packages"
            className={`rounded-md px-3 py-1.5 ${navActive(pathname, '/packages') ? 'bg-emerald-50 font-medium text-emerald-800' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Discover
          </Link>
          <Link
            href="/real-trip-maps"
            className={`rounded-md px-3 py-1.5 ${navActive(pathname, '/real-trip-maps') ? 'bg-emerald-50 font-medium text-emerald-800' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Real Trip Maps 🔴
          </Link>
          <Link
            href="/my-bookings"
            className={`rounded-md px-3 py-1.5 ${navActive(pathname, '/my-bookings') ? 'bg-emerald-50 font-medium text-emerald-800' : 'text-slate-600 hover:bg-slate-100'}`}
          >
            Booking Saya
          </Link>
        </nav>

        <div className="ml-auto flex items-center gap-2">
          {!isLoggedIn ? (
            <>
              <Link href="/login" className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700">
                Masuk
              </Link>
              <Link href="/register" className="rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-medium text-white">
                Daftar
              </Link>
            </>
          ) : (
            <>
              {isAdmin ? (
                <Link href="/dashboard" className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700">
                  Dashboard
                </Link>
              ) : null}
              {isDriver ? (
                <Link href={'/driver/app' as Route} className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700">
                  Driver App
                </Link>
              ) : null}
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-500 text-[11px] font-semibold text-white">
                {userInitial}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
