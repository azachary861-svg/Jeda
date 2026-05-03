'use client';

import { useState } from 'react';
import { signUpWithEmail, signInWithOAuth } from '@/actions/auth';
import Link from 'next/link';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    fullName: '',
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [oAuthLoading, setOAuthLoading] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    // Validation
    if (formData.password !== formData.confirmPassword) {
      setError('Kata sandi tidak cocok');
      setLoading(false);
      return;
    }

    if (formData.password.length < 6) {
      setError('Kata sandi minimal 6 karakter');
      setLoading(false);
      return;
    }

    try {
      const result = await signUpWithEmail(
        formData.email,
        formData.password,
        formData.fullName
      );

      if (result.error) {
        setError(result.error);
      } else {
        setSuccess(result.message || 'Akun berhasil dibuat! Cek email Anda.');
        setFormData({ email: '', password: '', confirmPassword: '', fullName: '' });
      }
    } catch (err) {
      setError('An unexpected error occurred');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleOAuth = async (provider: 'google' | 'github') => {
    setError('');
    setOAuthLoading(provider);

    try {
      await signInWithOAuth(provider, 'client');
    } catch (err) {
      setError(`Failed to sign up with ${provider}`);
      console.error(err);
    } finally {
      setOAuthLoading(null);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen max-w-md items-center p-6">
      <div className="w-full space-y-6 rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Daftar</h1>
          <p className="mt-1 text-sm text-slate-600">
            Buat akun Jeda Wisata baru
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="rounded-lg border border-green-200 bg-green-50 p-3 text-sm text-green-700">
            {success}
          </div>
        )}

        {/* Registration Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="fullName"
              className="block text-sm font-medium text-slate-700"
            >
              Nama Lengkap
            </label>
            <input
              id="fullName"
              type="text"
              name="fullName"
              placeholder="Nama Anda"
              value={formData.fullName}
              onChange={handleChange}
              required
              disabled={loading}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-primary focus:outline-none disabled:bg-slate-50"
            />
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-slate-700"
            >
              Email
            </label>
            <input
              id="email"
              type="email"
              name="email"
              placeholder="nama@example.com"
              value={formData.email}
              onChange={handleChange}
              required
              disabled={loading}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-primary focus:outline-none disabled:bg-slate-50"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-slate-700"
            >
              Kata Sandi
            </label>
            <input
              id="password"
              type="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={handleChange}
              required
              disabled={loading}
              className="mt-1 w-full rounded border border-slate-300 px-3 py-2 text-sm placeholder-slate-400 focus:border-primary focus:outline-none disabled:bg-slate-50"
            />
            <p className="mt-1 text-xs text-slate-500">Minimal 6 karakter</p>
          </div>

          <div>
            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-slate-700"
            >
              Konfirmasi Kata Sandi
            </label>
            <input
              id="confirmPassword"
              type="password"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={handleChange}
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
            {loading ? 'Sedang mendaftar...' : 'Daftar'}
          </button>
        </form>

        {/* Divider */}
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-slate-200"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="bg-white px-2 text-slate-500">Atau daftar dengan</span>
          </div>
        </div>

        {/* OAuth Buttons */}
        <div className="space-y-2">
          <button
            type="button"
            onClick={() => handleOAuth('google')}
            disabled={oAuthLoading === 'google'}
            className="flex w-full items-center justify-center gap-2 rounded border border-slate-300 py-2 hover:bg-slate-50 disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
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
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.007 12.007 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
            </svg>
            <span className="text-sm font-medium text-slate-700">
              {oAuthLoading === 'github' ? 'Menghubungkan...' : 'GitHub'}
            </span>
          </button>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-slate-600">
          Sudah punya akun?{' '}
          <Link href="/login" className="font-medium text-primary hover:underline">
            Masuk di sini
          </Link>
        </p>
      </div>
    </main>
  );
}
