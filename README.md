# Jeda Wisata

Scaffold implementasi berbasis spesifikasi teknis untuk:
- Next.js 15 (App Router)
- Supabase (Auth, Postgres, Realtime, Storage)
- TypeScript strict mode

## Quick Start

1. Salin `.env.example` menjadi `.env.local` dan isi semua variabel.
2. Install dependency:
   - `pnpm install`
3. Jalankan app:
   - `pnpm dev`
4. Jalankan migration SQL pada folder `supabase/migrations` ke project Supabase.

## Struktur

- `apps/web`: aplikasi web (admin + marketplace + API)
- `supabase/migrations`: schema, enum, table, RLS policies
- `docs/EXECUTION_PLAN.md`: rencana implementasi eksekusi
- `docs/PRD.md`: PRD implementasi aktif

## Modul yang sudah jalan

- Marketplace: package list/detail, booking form, checkout payment init
- Payment: Midtrans transaction create + webhook signature verification
- Payment Intl: Stripe checkout session + webhook confirmation
- Admin: dashboard, bookings status management, dispatch assign, finance summary
- Admin: driver verification status management
- Driver: location ingest endpoint
- Realtime: halaman Real Trip Maps dengan subscription `driver_locations`
- Reviews: submit review pasca trip selesai

## Lanjutkan produksi

1. Jalankan migration di `supabase/migrations` secara berurutan.
2. Isi environment variables (`.env.local`) termasuk `SUPABASE_SERVICE_ROLE_KEY`.
3. Verifikasi webhook Midtrans menuju endpoint `/api/webhook/midtrans`.
4. Verifikasi webhook Stripe menuju endpoint `/api/webhook/stripe`.
5. Lanjut phase berikut: observability, affiliate, AI agent, hardening E2E.

## Catatan

Implementasi ini memulai baseline production untuk fase foundation + booking + webhook Midtrans.
