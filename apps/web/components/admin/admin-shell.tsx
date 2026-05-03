'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useMemo } from 'react';
import { usePathname } from 'next/navigation';

type MenuItem = {
  href: string;
  label: string;
  icon?: string;
  badge?: string;
};

type MenuSection = {
  title: string;
  items: MenuItem[];
};

type AdminShellProps = {
  roleLabel: string;
  regionLabel: string;
  sections: MenuSection[];
  children: React.ReactNode;
};

function isActivePath(pathname: string, href: string) {
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AdminShell({ roleLabel, regionLabel, sections, children }: AdminShellProps) {
  const pathname = usePathname();

  const activeItem = useMemo(() => {
    for (const section of sections) {
      const found = section.items.find((item) => isActivePath(pathname, item.href));
      if (found) return found;
    }

    return { label: 'HQ Dashboard' } as MenuItem;
  }, [pathname, sections]);

  return (
    <div className="flex min-h-screen bg-slate-100">
      <aside className="hidden w-[190px] shrink-0 flex-col overflow-y-auto border-r border-white/10 bg-[#081f1d] text-white md:flex">
        <div className="border-b border-white/10 px-3.5 py-3">
          <p className="text-sm font-medium tracking-tight">TripNesia</p>
          <p className="mt-0.5 text-[9px] uppercase tracking-[0.08em] text-emerald-300">HQ Admin · Indonesia</p>
        </div>

        <div className="py-2">
          {sections.map((section) => (
            <div key={section.title} className="mb-1.5">
              <p className="px-3.5 pb-1 text-[9px] uppercase tracking-[0.1em] text-white/30">{section.title}</p>
              <nav className="space-y-0.5 px-2">
                {section.items.map((item) => {
                  const active = isActivePath(pathname, item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href as Route}
                      className={`flex items-center gap-2 rounded-md border-l-2 px-2.5 py-1.5 text-[11px] transition ${
                        active
                          ? 'border-l-emerald-300 bg-emerald-300/10 text-emerald-300'
                          : 'border-l-transparent text-white/60 hover:bg-white/5 hover:text-white/85'
                      }`}
                    >
                      <span className="w-3.5 text-center text-[11px]">{item.icon ?? '•'}</span>
                      <span className="truncate">{item.label}</span>
                      {item.badge ? (
                        <span className="ml-auto rounded-sm bg-rose-500/20 px-1.5 py-0.5 text-[9px] font-semibold text-rose-300">{item.badge}</span>
                      ) : null}
                    </Link>
                  );
                })}
              </nav>
            </div>
          ))}
        </div>

        <div className="mt-auto border-t border-white/10 px-3.5 py-2.5">
          <div className="flex items-center gap-2">
            <div className="flex h-6.5 w-6.5 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-semibold text-white">MS</div>
            <div>
              <p className="text-[11px] text-white/80">{roleLabel}</p>
              <p className="text-[9px] text-white/45">{regionLabel}</p>
            </div>
          </div>
        </div>
      </aside>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="flex h-[46px] items-center border-b border-slate-200 bg-white px-3.5">
          <h1 className="text-sm font-medium text-slate-900">{activeItem.label}</h1>
          <div className="ml-auto flex items-center gap-2">
            <span className="rounded-md border border-slate-200 bg-slate-50 px-2.5 py-1 text-[11px] text-slate-600">Semua Region</span>
            <span className="text-[10px] text-slate-500">{new Date().toLocaleDateString('id-ID')}</span>
            <span className="relative flex h-6.5 w-6.5 items-center justify-center rounded-md border border-slate-200 bg-slate-50 text-[11px]">◐
              <span className="absolute right-1.5 top-1.5 h-1 w-1 rounded-full bg-rose-500"></span>
            </span>
          </div>
        </header>

        <main className="min-w-0 flex-1 p-3">
          <div className="mx-auto max-w-[1400px]">{children}</div>
        </main>
      </div>
    </div>
  );
}
