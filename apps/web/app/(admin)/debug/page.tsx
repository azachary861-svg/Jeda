'use client';

import { useEffect, useState } from 'react';

interface ProfileDebug {
  user: {
    id: string;
    email: string;
    app_metadata: Record<string, unknown>;
    user_metadata: Record<string, unknown>;
  } | null;
  profile: {
    id: string;
    email: string;
    full_name: string;
    role: string | null;
  } | null;
  profileError: string | null;
  debug: {
    profileRoleRaw: unknown;
    profileRoleType: string;
    profileRoleIsNull: boolean;
    profileRoleIsUndefined: boolean;
  };
  error?: string;
}

export default function DebugProfilePage() {
  const [data, setData] = useState<ProfileDebug | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/debug/profile')
      .then((res) => res.json())
      .then((data) => {
        setData(data);
        setLoading(false);
      })
      .catch((err) => {
        setData({ error: err.message } as any);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>Loading...</p>;
  }

  if (!data) {
    return <p>No data</p>;
  }

  return (
    <main className="mx-auto max-w-4xl px-6 py-8">
      <h1 className="mb-6 text-3xl font-bold">Debug Profile</h1>

      {data.error && (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-700 mb-6">
          <p className="font-semibold">Error:</p>
          <p>{data.error}</p>
        </div>
      )}

      {!data.user && !data.error && (
        <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4 text-yellow-700 mb-6">
          <p>Anda belum login. Silakan login dulu ke /admin kemudian kembali ke halaman ini.</p>
        </div>
      )}

      {data.user && (
        <>
          <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Auth User Data</h2>
            <pre className="overflow-x-auto rounded bg-slate-100 p-4 text-sm">
              {JSON.stringify(
                {
                  id: data.user.id,
                  email: data.user.email,
                  app_metadata: data.user.app_metadata,
                  user_metadata: data.user.user_metadata,
                },
                null,
                2
              )}
            </pre>
          </section>

          <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Profile Data (dari tabel profiles)</h2>
            {data.profileError && (
              <div className="mb-4 text-red-600">
                <p className="font-semibold">Error fetching profile:</p>
                <p>{data.profileError}</p>
              </div>
            )}
            {data.profile ? (
              <pre className="overflow-x-auto rounded bg-slate-100 p-4 text-sm">
                {JSON.stringify(data.profile, null, 2)}
              </pre>
            ) : (
              <p className="text-slate-600">Profile tidak ditemukan di database</p>
            )}
          </section>

          <section className="mb-6 rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Role Debug Info</h2>
            <pre className="overflow-x-auto rounded bg-slate-100 p-4 text-sm">
              {JSON.stringify(data.debug, null, 2)}
            </pre>
          </section>

          <section className="rounded-lg border border-slate-200 bg-white p-6">
            <h2 className="mb-4 text-xl font-semibold">Role Analysis</h2>
            <div className="space-y-2 text-sm">
              <p>
                <span className="font-semibold">Profile role (raw):</span>{' '}
                <code className="rounded bg-slate-100 px-2 py-1">{data.profile?.role || '(null)'}</code>
              </p>
              <p>
                <span className="font-semibold">Role is null:</span> {data.debug.profileRoleIsNull ? '✓ Ya' : '✗ Tidak'}
              </p>
              <p>
                <span className="font-semibold">Role is undefined:</span> {data.debug.profileRoleIsUndefined ? '✓ Ya' : '✗ Tidak'}
              </p>
              <p>
                <span className="font-semibold">Role type:</span>{' '}
                <code className="rounded bg-slate-100 px-2 py-1">{data.debug.profileRoleType}</code>
              </p>
              <div className="mt-4 rounded bg-blue-50 p-3 text-blue-700">
                <p className="font-semibold mb-2">Normalization test:</p>
                <p>
                  Jika role adalah <code className="bg-white px-1">{data.profile?.role}</code>, setelah normalisasi akan
                  menjadi:
                </p>
                <code className="block mt-2 bg-white px-2 py-1 rounded">
                  {data.profile?.role
                    ?.trim()
                    .toLowerCase()
                    .replace(/[\s-]+/g, '_')
                    .replace(/^_+|_+$/g, '') || '(null)'}
                </code>
              </div>
            </div>
          </section>
        </>
      )}
    </main>
  );
}
