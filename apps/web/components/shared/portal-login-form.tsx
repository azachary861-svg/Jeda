'use client';

import Link from 'next/link';
import type { Route } from 'next';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useMemo, useState } from 'react';
import { signInWithEmail, signInWithOAuth } from '@/actions/auth';
import type { AuthPortal } from '@/lib/auth/portal';

type PortalLoginFormProps = {
  portal: AuthPortal;
  title: string;
  description: string;
  badgeLabel: string;
};

export function PortalLoginForm({ portal, title, description, badgeLabel }: PortalLoginFormProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get('next');
  const queryError = searchParams.get('error') ?? '';

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(queryError);
  const [loading, setLoading] = useState(false);
  const [oAuthLoading, setOAuthLoading] = useState<string | null>(null);

  useEffect(() => {
    setError(queryError);
  }, [queryError]);

  const footer = useMemo(() => {
    if (portal === 'admin') {
      return {
        prompt: 'Bukan admin?',
        href: '/login',
        label: 'Masuk ke marketplace',
        helper: 'Portal ini hanya untuk super admin dan regional admin.',
      };
    }

    if (portal === 'driver') {
      return {
        prompt: 'Bukan driver?',
        href: '/login',
        label: 'Masuk ke marketplace',
        helper: 'Portal ini khusus tim driver di lapangan.',
      };
    }

    return {
      prompt: 'Belum punya akun?',
      href: '/register',
      label: 'Daftar sebagai client',
      helper: 'Gunakan portal ini untuk booking, pembayaran, dan pelacakan trip.',
    };
  }, [portal]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');
    setLoading(true);

    try {
      const result = await signInWithEmail(email, password, portal, nextPath);
      if (result?.error) {
        setError(result.error);
      } else if (result?.redirectTo) {
        router.replace(result.redirectTo as Route);
      }
    } catch {
      setError('Terjadi kesalahan saat mencoba masuk.');
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError('');
    setOAuthLoading(provider);

    try {
      const result = await signInWithOAuth(provider, portal, nextPath);

      if (result?.error) {
        setError(result.error);
      } else if (result?.url) {
        window.location.assign(result.url);
      } else {
        setError(`Gagal masuk dengan ${provider}.`);
      }
    } catch {
      setError(`Gagal masuk dengan ${provider}.`);
    } finally {
      setOAuthLoading(null);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center p-6">
      <div className="w-full space-y-6 rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
        <div className="space-y-3">
          <Link href="/" className="inline-flex text-sm font-medium text-primary hover:underline">
            ← Kembali ke pilihan portal
          </Link>
          <span className="inline-flex rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-slate-600">
            {badgeLabel}
          </span>
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{title}</h1>
            <p className="mt-1 text-sm text-slate-600">{description}</p>
          </div>
        </div>

        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</div>
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-slate-700">
              Email
            </label>
            <input
              id="email"
              type="email"
              placeholder="nama@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={loading}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-primary focus:outline-none disabled:bg-slate-50"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700">
              Kata Sandi
            </label>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={loading}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-primary focus:outline-none disabled:bg-slate-50"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded bg-primary py-2 font-medium text-white hover:bg-primary-dark disabled:opacity-50"
          >
            {loading ? 'Sedang masuk...' : 'Masuk'}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-slate-500">Atau masuk dengan</span>
          </div>
        </div>

        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            disabled={oAuthLoading === 'google'}
            className="flex w-full items-center justify-center gap-2 rounded border border-slate-300 py-2 hover:bg-slate-50 disabled:opacity-50"
          >
            <span className="text-sm font-medium text-slate-700">
              {oAuthLoading === 'google' ? 'Menghubungkan...' : 'Google'}
            </span>
          </button>

          <button
            type="button"
            onClick={() => handleOAuth('github')}
            disabled={oAuthLoading === 'github'}
            className="flex w-full items-center justify-center gap-2 rounded border border-slate-300 py-2 hover:bg-slate-50 disabled:opacity-50"
          >
            <span className="text-sm font-medium text-slate-700">
              {oAuthLoading === 'github' ? 'Menghubungkan...' : 'GitHub'}
            </span>
          </button>
        </div>

        <div className="space-y-2 text-center">
          <p className="text-sm text-slate-600">{footer.helper}</p>
          <p className="text-sm text-slate-600">
            {footer.prompt}{' '}
            <Link href={footer.href as Route} className="font-medium text-primary hover:underline">
              {footer.label}
            </Link>
          </p>
        </div>
      </div>
    </main>
  );
}
