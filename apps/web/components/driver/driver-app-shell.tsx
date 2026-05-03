'use client';

import { useMemo, useState } from 'react';

type DriverAppShellProps = {
  driverName: string;
  regionLabel: string;
};

type DriverTab = 'home' | 'trip' | 'upload' | 'earnings' | 'notif' | 'chat';

function initials(name: string) {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? '')
    .join('');
}

export function DriverAppShell({ driverName, regionLabel }: DriverAppShellProps) {
  const [activeTab, setActiveTab] = useState<DriverTab>('home');
  const [gpsOn, setGpsOn] = useState(true);

  const avatarText = useMemo(() => initials(driverName), [driverName]);

  const BottomItem = ({ tab, icon, label, badge }: { tab: DriverTab; icon: string; label: string; badge?: number }) => (
    <button
      type="button"
      onClick={() => setActiveTab(tab)}
      className={`relative flex flex-1 flex-col items-center gap-1 ${activeTab === tab ? 'text-emerald-700' : 'text-slate-400'}`}
    >
      <span className="text-lg leading-none">{icon}</span>
      <span className="text-[9px] font-medium">{label}</span>
      {badge ? (
        <span className="absolute right-2 top-0 flex h-3.5 min-w-3.5 items-center justify-center rounded-full bg-rose-500 px-1 text-[8px] font-semibold text-white">
          {badge}
        </span>
      ) : null}
    </button>
  );

  return (
    <main className="mx-auto max-w-[980px] p-4">
      <div className="flex items-start justify-center gap-5">
        <section className="w-full max-w-[340px] rounded-[20px] border border-slate-200 bg-white shadow-[0_8px_40px_rgba(0,0,0,0.12)]">
          <header className="flex items-center gap-2.5 rounded-t-[20px] bg-[#081f1d] px-4 py-3 text-white">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-500 text-sm font-bold">{avatarText || 'DR'}</div>
            <div>
              <p className="text-sm font-semibold">{driverName}</p>
              <p className="text-[10px] text-white/50">Driver · {regionLabel}</p>
            </div>

            <button
              type="button"
              onClick={() => setGpsOn((value) => !value)}
              className="ml-auto rounded-full border border-white/15 bg-white/10 px-2.5 py-1"
            >
              <div className="flex items-center gap-1.5">
                <span className={`h-1.5 w-1.5 rounded-full ${gpsOn ? 'animate-pulse bg-emerald-400' : 'bg-slate-400'}`}></span>
                <span className={`text-[10px] font-semibold ${gpsOn ? 'text-emerald-300' : 'text-slate-300'}`}>{gpsOn ? 'GPS ON' : 'GPS OFF'}</span>
              </div>
            </button>
          </header>

          <div className="h-[480px] overflow-y-auto bg-slate-100">
            {activeTab === 'home' ? (
              <div className="space-y-2.5 p-2.5">
                <article className="rounded-2xl bg-[#081f1d] p-3.5 text-white">
                  <p className="mb-2 flex items-center gap-1.5 text-[9px] uppercase tracking-[0.08em] text-white/40">
                    <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-400"></span>
                    Trip aktif sekarang
                  </p>
                  <h1 className="text-base font-bold">Bromo Sunrise Experience</h1>
                  <p className="mt-1 text-[11px] text-white/55">#TN-0441 · 3 pax · Sari Dewi & keluarga</p>

                  <div className="mt-3 grid grid-cols-2 gap-1.5">
                    <div className="rounded-lg bg-white/10 px-2.5 py-2">
                      <p className="text-[9px] text-white/40">Pickup pukul</p>
                      <p className="text-xs font-semibold">03:00 WIB</p>
                    </div>
                    <div className="rounded-lg bg-white/10 px-2.5 py-2">
                      <p className="text-[9px] text-white/40">Lokasi sekarang</p>
                      <p className="text-xs font-semibold">Penanjakan</p>
                    </div>
                    <div className="rounded-lg bg-white/10 px-2.5 py-2">
                      <p className="text-[9px] text-white/40">Progress trip</p>
                      <p className="text-xs font-semibold">Di lokasi ✓</p>
                    </div>
                    <div className="rounded-lg bg-white/10 px-2.5 py-2">
                      <p className="text-[9px] text-white/40">Estimasi selesai</p>
                      <p className="text-xs font-semibold">15:00 WIB</p>
                    </div>
                  </div>

                  <div className="mt-2 h-1.5 rounded-full bg-white/20">
                    <div className="h-1.5 w-3/5 rounded-full bg-emerald-400"></div>
                  </div>
                  <p className="mt-1 text-[9px] text-white/45">60% selesai · Tahap 3 dari 5</p>
                </article>

                <div className="grid grid-cols-2 gap-2">
                  <button type="button" onClick={() => setActiveTab('upload')} className="rounded-xl bg-emerald-700 px-3 py-2.5 text-xs font-semibold text-white">
                    📸 Upload Foto/Video
                  </button>
                  <button type="button" onClick={() => setActiveTab('trip')} className="rounded-xl bg-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700">
                    📋 Detail Trip
                  </button>
                </div>
                <button type="button" onClick={() => setActiveTab('chat')} className="w-full rounded-xl bg-slate-200 px-3 py-2.5 text-xs font-semibold text-slate-700">
                  💬 Chat dengan Klien & HQ
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <article className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-lg font-bold text-slate-900">Rp 185rb</p>
                    <p className="text-[10px] text-slate-500">Pendapatan hari ini</p>
                    <p className="mt-1 text-[9px] text-emerald-700">+komisi trip</p>
                  </article>
                  <article className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="text-lg font-bold text-slate-900">1/2</p>
                    <p className="text-[10px] text-slate-500">Trip hari ini selesai</p>
                    <p className="mt-1 text-[9px] text-emerald-700">1 lagi jam 19:00</p>
                  </article>
                </div>

                <article className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold text-slate-900">Jadwal hari ini</p>
                    <span className="text-[10px] text-emerald-700">Lihat semua</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center gap-2 border-b border-slate-100 pb-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-100 text-sm">🌄</div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold">#TN-0441 · Bromo</p>
                        <p className="text-[10px] text-slate-500">03:00 · 3 pax · Rp 185.000</p>
                      </div>
                      <span className="rounded bg-emerald-100 px-2 py-0.5 text-[9px] font-semibold text-emerald-700">On trip</span>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-amber-100 text-sm">🏛️</div>
                      <div className="flex-1">
                        <p className="text-xs font-semibold">#TN-0455 · Jogja Heritage</p>
                        <p className="text-[10px] text-slate-500">19:00 · 2 pax · Rp 120.000</p>
                      </div>
                      <span className="rounded bg-amber-100 px-2 py-0.5 text-[9px] font-semibold text-amber-700">Upcoming</span>
                    </div>
                  </div>
                </article>
              </div>
            ) : null}

            {activeTab === 'upload' ? (
              <div className="space-y-2.5 p-2.5">
                <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-[11px] text-emerald-800">
                  📍 Foto & video kamu akan tampil di Real Trip Maps dan bisa dilihat klien secara real-time.
                </article>

                <article className="rounded-xl border border-slate-200 bg-white p-3">
                  <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                    <p className="text-3xl">📷</p>
                    <p className="mt-1 text-xs font-semibold text-slate-800">Tap untuk foto / video</p>
                    <p className="text-[10px] text-slate-500">Maks 50MB per file</p>
                  </div>

                  <label className="mt-3 block text-[11px] font-semibold text-slate-700">Caption</label>
                  <textarea
                    defaultValue="Sunrise-nya luar biasa pagi ini! Klien senang banget 🙏"
                    className="mt-1 h-16 w-full resize-none rounded-lg border border-slate-200 px-2.5 py-2 text-xs outline-none"
                  />

                  <p className="mt-3 text-[11px] font-semibold text-slate-700">Sudah diupload (15 foto)</p>
                  <div className="mt-2 grid grid-cols-3 gap-1.5">
                    {['🌄', '🌿', '⛰️', '🚙', '🌅', '+'].map((item, idx) => (
                      <div key={`${item}-${idx}`} className="aspect-square rounded-lg bg-slate-100 text-center text-xl leading-[70px]">
                        {item}
                      </div>
                    ))}
                  </div>

                  <button type="button" className="mt-3 w-full rounded-xl bg-emerald-700 py-2.5 text-xs font-semibold text-white">
                    📤 Upload ke Real Trip Maps
                  </button>
                </article>
              </div>
            ) : null}

            {activeTab === 'trip' ? (
              <div className="space-y-2.5 p-2.5">
                <article className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs font-semibold text-slate-900">Info Klien</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-800">SD</div>
                    <div>
                      <p className="text-xs font-semibold">Sari Dewi</p>
                      <p className="text-[10px] text-slate-500">3 pax · Booking pertama</p>
                    </div>
                    <button type="button" className="ml-auto rounded-lg bg-emerald-100 px-2.5 py-1 text-[10px] font-semibold text-emerald-800">
                      💬 Chat
                    </button>
                  </div>
                  <div className="mt-2 rounded-lg bg-slate-100 p-2.5 text-[10px] text-slate-600">
                    <p>Pickup: Hotel Amaris Malang</p>
                    <p>HP klien: 0812-3456-7890</p>
                    <p>Catatan: Ada lansia, jalan pelan-pelan</p>
                  </div>
                </article>

                <article className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs font-semibold text-slate-900">Checklist Driver</p>
                  <ul className="mt-2 space-y-1.5 text-xs text-slate-600">
                    <li>✓ Jemput klien di titik pickup</li>
                    <li>✓ Perjalanan ke Penanjakan</li>
                    <li>✓ Foto sunrise di Penanjakan</li>
                    <li>○ Naik jeep ke kawah Bromo</li>
                    <li>○ Antar klien kembali ke hotel</li>
                  </ul>
                </article>
              </div>
            ) : null}

            {activeTab === 'earnings' ? (
              <div className="space-y-2.5 p-2.5">
                <article className="rounded-2xl bg-[#081f1d] p-4 text-center text-white">
                  <p className="text-[10px] uppercase tracking-[0.08em] text-white/40">Total bulan ini</p>
                  <p className="mt-1 text-3xl font-bold">Rp 3.460.000</p>
                  <p className="mt-1 text-[11px] text-white/55">Gaji pokok Rp 2.500.000 + Komisi Rp 960.000</p>
                </article>

                <article className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs font-semibold text-slate-900">Pendapatan 6 bulan terakhir</p>
                  <div className="mt-3 flex h-20 items-end gap-1">
                    {[45, 55, 65, 70, 80, 100].map((height, index) => (
                      <div key={`${height}-${index}`} className="flex-1">
                        <div className={`w-full rounded-t ${index >= 4 ? 'bg-emerald-600' : 'bg-slate-300'}`} style={{ height: `${height}%` }}></div>
                      </div>
                    ))}
                  </div>
                </article>
              </div>
            ) : null}

            {activeTab === 'notif' ? (
              <div className="space-y-2.5 p-2.5">
                <article className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs font-semibold text-slate-900">Notifikasi</p>
                  <ul className="mt-2 space-y-2 text-xs text-slate-600">
                    <li>• Trip baru ditambahkan ke jadwalmu #TN-0455</li>
                    <li>• Pesan baru dari klien: “Foto sunrise-nya keren banget!”</li>
                    <li>• Pembayaran gaji diproses Rp 3.460.000</li>
                    <li>• Rating baru masuk ★★★★★</li>
                  </ul>
                </article>
              </div>
            ) : null}

            {activeTab === 'chat' ? (
              <div className="space-y-2.5 p-2.5">
                <article className="rounded-xl border border-slate-200 bg-white p-3">
                  <p className="text-xs font-semibold text-slate-900">Chat Center</p>
                  <div className="mt-3 space-y-2 text-xs">
                    <div className="max-w-[80%] rounded-xl rounded-bl-sm border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
                      Selamat pagi Pak! Sudah di jalan ya? 😊
                    </div>
                    <div className="ml-auto max-w-[80%] rounded-xl rounded-br-sm bg-emerald-700 px-3 py-2 text-white">
                      Sudah Bu Sari, OTW ke hotel. Estimasi 10 menit lagi 🙏
                    </div>
                    <div className="max-w-[80%] rounded-xl rounded-bl-sm border border-slate-200 bg-slate-50 px-3 py-2 text-slate-700">
                      Siap Pak! Ada 3 orang ya termasuk ibu mertua saya yang sudah sepuh
                    </div>
                  </div>
                  <div className="mt-3 flex items-center gap-2 border-t border-slate-100 pt-2">
                    <input className="h-8 flex-1 rounded-full border border-slate-200 px-3 text-xs outline-none" placeholder="Ketik pesan..." />
                    <button type="button" className="flex h-8 w-8 items-center justify-center rounded-full bg-emerald-700 text-white">→</button>
                  </div>
                </article>
              </div>
            ) : null}
          </div>

          <footer className="border-t border-slate-200 bg-white px-2 py-2">
            <div className="flex items-center">
              <BottomItem tab="home" icon="🏠" label="Home" />
              <BottomItem tab="trip" icon="📋" label="Trip" />
              <BottomItem tab="upload" icon="📸" label="Upload" />
              <BottomItem tab="earnings" icon="💰" label="Gaji" />
              <BottomItem tab="notif" icon="🔔" label="Notif" badge={3} />
            </div>
          </footer>
        </section>

        <aside className="hidden w-[220px] space-y-2.5 lg:block">
          <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Koneksi antar sistem</p>

          <article className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[11px] font-semibold text-slate-900">Flow data real-time</p>
            <ul className="mt-2 space-y-1.5 text-[11px] text-slate-600">
              <li>📱 Driver upload foto</li>
              <li>↓ Supabase Storage + Realtime</li>
              <li>🗺️ Real Trip Maps update</li>
              <li>↓ &lt; 1 detik</li>
              <li>👤 Klien lihat di web</li>
              <li>↓ Otomatis</li>
              <li>🖥️ Admin pantau HQ</li>
            </ul>
          </article>

          <article className="rounded-xl border border-slate-200 bg-white p-3">
            <p className="text-[11px] font-semibold text-slate-900">Driver bisa akses</p>
            <ul className="mt-2 space-y-1 text-[11px] text-slate-600">
              <li>📅 Jadwal trip harian</li>
              <li>📍 GPS tracking ON/OFF</li>
              <li>📸 Upload foto/video live</li>
              <li>💬 Chat klien & admin</li>
              <li>📋 Detail & checklist trip</li>
              <li>💰 Rincian gaji & komisi</li>
              <li>🔔 Notif dari HQ</li>
            </ul>
          </article>

          <article className="rounded-xl border border-emerald-200 bg-emerald-50 p-3">
            <p className="text-[11px] font-semibold text-emerald-900">Tech yang dipakai</p>
            <ul className="mt-2 space-y-1 text-[10px] text-emerald-800">
              <li>PWA (Progressive Web App)</li>
              <li>Supabase Realtime GPS</li>
              <li>Supabase Storage (media)</li>
              <li>Push Notifications API</li>
              <li>Geolocation API (browser)</li>
            </ul>
          </article>
        </aside>
      </div>
    </main>
  );
}
