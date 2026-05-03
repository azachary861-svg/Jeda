# Product Requirements Document — Jeda Wisata

## Objective
Membangun platform wisata multi-region dengan tiga domain inti yang siap produksi:
1. Admin operations (dashboard, booking ops, dispatch)
2. Marketplace booking funnel (discover, booking, checkout)
3. Realtime trip foundation (driver location + tracking visibility)

## Success Metrics
- Payment confirmation rate >= 98%
- Median dispatch assignment < 10 menit
- Realtime location freshness < 10 detik (median)
- Critical production issues: 0 saat launch window

## MVP Scope
### In Scope
- Auth + role guard + RLS per region
- Packages listing/detail
- Booking create + dynamic pricing RPC
- Midtrans webhook verification + idempotent update
- Dispatch assign endpoint
- Driver location ingest endpoint
- Admin dashboard baseline KPI cards

### Out of Scope (Iterasi berikut)
- Full AI agent WA/IG
- Full marketing automation
- Full driver app mobile flow
- B2B corporate module

## Non-Functional Requirements
- TypeScript strict mode
- Input validation dengan Zod
- Error payload konsisten: `{ error, code }`
- Security by default: RLS wajib pada tabel inti
- Semua harga IDR integer (BIGINT)

## API Contracts (MVP)
- POST /api/marketplace/booking/create
- GET /api/marketplace/booking/:id
- POST /api/webhook/midtrans
- POST /api/admin/dispatch
- POST /api/driver/location

## Database Core (MVP)
- regions
- profiles
- packages
- pricing_rules
- bookings
- driver_locations
- transactions
- notifications

## Rollout Plan
1. Foundation (schema, RLS, auth middleware)
2. Booking + payment
3. Dispatch + location realtime
4. Finance + hardening
