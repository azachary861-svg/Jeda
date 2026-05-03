# JEDA WISATA — Complete Technical Specification
**Platform:** Tourism Marketplace & Operations Management  
**Version:** 1.0.0  
**Stack:** Next.js 15 + Supabase + React Native + Claude AI  
**Author:** Mas Shafly (Founder) & Abdullah Firaswan (Direktur)  
**Status:** Ready for AI-assisted development  

---

## PETUNJUK PENGGUNAAN DOKUMEN INI

Dokumen ini adalah **source of truth** untuk seluruh pengembangan platform Jeda Wisata. Berikan dokumen ini ke AI coding assistant (GitHub Copilot, Cursor, Claude) sebelum mulai coding. Setiap fitur, schema database, API route, dan komponen UI sudah didefinisikan di sini.

**Saat vibe coding, instruksikan AI:**
> "Gunakan dokumen JEDA_WISATA_TECHNICAL_SPEC.md sebagai referensi utama. Ikuti tech stack, database schema, RLS policy, dan folder structure yang sudah ditentukan. Jangan improvisasi stack baru tanpa instruksi eksplisit."

---

## DAFTAR ISI

1. [Project Overview](#1-project-overview)
2. [System Architecture](#2-system-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Folder Structure](#4-folder-structure)
5. [Environment Variables](#5-environment-variables)
6. [Database Schema](#6-database-schema)
7. [Row Level Security (RLS)](#7-row-level-security)
8. [Authentication & Roles](#8-authentication--roles)
9. [Admin Panel — Spec Lengkap](#9-admin-panel)
10. [Marketplace & Client Portal — Spec Lengkap](#10-marketplace--client-portal)
11. [Driver App (React Native) — Spec Lengkap](#11-driver-app-react-native)
12. [Real Trip Maps](#12-real-trip-maps)
13. [Dynamic Pricing Engine](#13-dynamic-pricing-engine)
14. [Driver Verification System](#14-driver-verification-system)
15. [Smart Auto-Dispatch](#15-smart-auto-dispatch)
16. [Marketing Automation](#16-marketing-automation)
17. [AI Customer Service Agent](#17-ai-customer-service-agent)
18. [Revenue & Payment System](#18-revenue--payment-system)
19. [Affiliate & Partner Program](#19-affiliate--partner-program)
20. [Crisis Management System](#20-crisis-management-system)
21. [Notification System](#21-notification-system)
22. [File & Media Storage](#22-file--media-storage)
23. [API Routes Reference](#23-api-routes-reference)
24. [Component Library](#24-component-library)
25. [Build Phases & Milestones](#25-build-phases--milestones)

---

## 1. PROJECT OVERVIEW

### 1.1 Deskripsi

**Jeda Wisata** adalah tourism marketplace platform Indonesia yang menghubungkan wisatawan dengan driver, fotografer, dan guide profesional melalui 5 regional hub. Platform beroperasi dalam 4 sistem terintegrasi:

| Sistem | Pengguna | Fungsi |
|--------|----------|--------|
| **Admin Panel** (Web) | Admin HQ, Admin Regional | Manajemen trip, tim, keuangan, dispatch |
| **Marketplace** (Web) | Klien / wisatawan | Booking paket wisata |
| **Driver App** (React Native) | Driver, fotografer, guide | Terima trip, GPS tracking, upload foto |
| **AI Agent** (WA + IG DM) | Klien / calon klien | Customer service 24/7 otomatis |

### 1.2 Regional Hubs

```
Jogja Hub      → Destinasi: Bromo, Yogyakarta, Dieng, Borobudur
Surabaya Hub   → Destinasi: Kawah Ijen, Banyuwangi
Bali Hub       → Destinasi: Ubud, Uluwatu, Kintamani, Seminyak
Lombok Hub     → Destinasi: Rinjani, Gili Islands, Senggigi
Labuan Bajo Hub → Destinasi: Komodo, Pink Beach, Padar, Manta Point
```

### 1.3 Key Differentiators

1. **Real Trip Maps** — Live GPS pin driver on public map + real-time photo/video feed dari lapangan. Fitur ini tidak ada di Klook, Airbnb Experiences, GetYourGuide.
2. **Multi-region isolated management** — Satu admin panel, 5 region, data terisolasi via PostgreSQL RLS.
3. **7 revenue streams** — Booking fee, dynamic pricing, foto digital, membership, komisi akomodasi, B2B corporate, afiliasi.
4. **AI agent 24/7** — Target 93%+ conversation resolved tanpa admin.
5. **Smart auto-dispatch** — 80% trip ter-assign driver otomatis via algoritma.

### 1.4 Brand Identity

```
Nama Platform : Jeda Wisata
Tagline       : "Wisata tanpa drama"
Primary Color : #0F6E56 (Forest Green)
Secondary     : #1D9E75 (Teal)
Accent        : #5DCAA5 (Mint)
Dark BG       : #0B2D2A (Dark Forest)
Font Header   : Inter (700)
Font Body     : Inter (400/500)
```

---

## 2. SYSTEM ARCHITECTURE

### 2.1 High-Level Architecture

```
┌─────────────────────────────────────────────────────────┐
│                    CLIENT LAYER                          │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────┐  │
│  │  Admin   │  │Marketplace│  │Driver App│  │AI Agent│  │
│  │  Panel   │  │  (Web)   │  │  (RN)   │  │WA+IGDM │  │
│  │ Next.js  │  │ Next.js  │  │React Nat.│  │Claude  │  │
│  └────┬─────┘  └────┬─────┘  └────┬─────┘  └───┬────┘  │
└───────┼─────────────┼─────────────┼─────────────┼───────┘
        │             │             │             │
┌───────▼─────────────▼─────────────▼─────────────▼───────┐
│                   API LAYER (Next.js API Routes)          │
│         /api/admin  /api/marketplace  /api/driver         │
│                /api/ai  /api/webhook                      │
└───────────────────────────┬──────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────┐
│              SUPABASE (Single Source of Truth)            │
│  ┌─────────┐ ┌──────────┐ ┌──────────┐ ┌─────────────┐  │
│  │PostgreSQL│ │Realtime  │ │ Storage  │ │    Auth     │  │
│  │ + RLS   │ │(GPS Feed)│ │(foto/vid)│ │(JWT + roles)│  │
│  └─────────┘ └──────────┘ └──────────┘ └─────────────┘  │
└───────────────────────────┬──────────────────────────────┘
                            │
┌───────────────────────────▼──────────────────────────────┐
│                EXTERNAL INTEGRATIONS                      │
│  Midtrans │ Stripe │ Meta API │ TikTok API │ YouTube API │
│  WA Business API │ Claude API │ Mapbox GL │ Resend       │
│  BullMQ │ Vercel Cron │ Twilio │ pgvector                │
└──────────────────────────────────────────────────────────┘
```

### 2.2 Deployment Architecture

```
Production:
  - Frontend/API  : Vercel (Next.js, auto-deploy dari main branch)
  - Database      : Supabase (managed PostgreSQL)
  - Media Storage : Supabase Storage
  - Queue         : BullMQ on Railway / Render
  - Driver App    : Expo EAS Build → App Store + Play Store

Environments:
  - development  : localhost:3000 + Supabase local / project dev
  - staging      : jedawisata-staging.vercel.app + Supabase staging project
  - production   : jedawisata.id + Supabase production project
```

### 2.3 Data Flow — Real Trip Maps

```
Driver buka app → GPS aktif (background) →
Supabase Realtime UPDATE driver_locations →
Marketplace subscribe channel "driver-locations" →
Mapbox GL update pin posisi < 1 detik →
Klien lihat pergerakan driver live →
Driver upload foto → Supabase Storage →
Supabase trigger → insert trip_media record →
Realtime broadcast ke channel "trip-{id}-media" →
Marketplace tampilkan foto baru di popup →
Admin panel live feed update
```

### 2.4 Data Flow — Booking

```
Klien pilih paket → Marketplace UI →
POST /api/marketplace/booking/create →
Insert bookings table (status: pending_payment) →
Midtrans/Stripe payment intent created →
Return payment URL/token →
Klien bayar →
Webhook /api/webhook/midtrans atau /api/webhook/stripe →
Update booking status: confirmed →
Insert notification (klien + admin) →
Auto-dispatch trigger → cari driver tersedia →
Assign driver → update bookings.driver_id →
WhatsApp notif ke klien (via WA Business API) →
Push notif ke driver app
```

---

## 3. TECHNOLOGY STACK

### 3.1 Frontend & Backend

```yaml
Framework      : Next.js 15 (App Router)
Language       : TypeScript (strict mode)
Styling        : Tailwind CSS v3
UI Components  : shadcn/ui (Radix UI primitives)
State Management: Zustand (client state) + TanStack Query v5 (server state)
Forms          : React Hook Form + Zod validation
Maps           : Mapbox GL JS v3
Charts         : Recharts v2
Date handling  : date-fns v3
Icons          : Lucide React
```

### 3.2 Database & Backend Services

```yaml
Database       : Supabase (PostgreSQL 15)
Auth           : Supabase Auth (JWT)
Realtime       : Supabase Realtime (WebSocket channels)
Storage        : Supabase Storage
Edge Functions : Supabase Edge Functions (Deno)
Vector DB      : pgvector extension (untuk AI RAG)
ORM            : Supabase JS Client v2 (tidak pakai Prisma)
Queue          : BullMQ + Redis (Railway)
Cron           : Vercel Cron Jobs
```

### 3.3 Mobile (Driver App)

```yaml
Framework      : React Native + Expo SDK 51
Language       : TypeScript
Navigation     : Expo Router v3
Maps           : react-native-maps + expo-location
Camera         : expo-camera + expo-image-picker
Notifications  : expo-notifications
Storage (local): expo-secure-store + AsyncStorage
HTTP Client    : axios + TanStack Query
State          : Zustand
Background GPS : expo-task-manager + expo-location (background mode)
```

### 3.4 External Services

```yaml
Payment IDR    : Midtrans (Snap UI + Core API)
Payment Intl   : Stripe (Checkout + Webhooks)
Email          : Resend (transactional email)
SMS            : Twilio (notif darurat)
WhatsApp       : WhatsApp Business API (via Meta)
IG DM          : Meta Messenger API
Social Post    : Meta Graph API + TikTok Content API + YouTube Data API v3
AI Model       : Anthropic Claude API (claude-sonnet-4-5)
AI Embedding   : Supabase pgvector + OpenAI text-embedding-3-small
Video Process  : FFmpeg (via Supabase Edge Function)
Maps           : Mapbox GL JS
```

### 3.5 Dev Tools

```yaml
Package Manager: pnpm
Linting        : ESLint + Prettier
Type Check     : TypeScript strict
Testing        : Vitest + React Testing Library + Playwright (E2E)
Git Strategy   : GitHub Flow (feature branches → main)
CI/CD          : GitHub Actions → Vercel
Error Tracking : Sentry
Analytics      : PostHog (self-hosted atau cloud)
```

---

## 4. FOLDER STRUCTURE

```
jeda-wisata/
├── apps/
│   ├── web/                          # Next.js app (Admin + Marketplace)
│   │   ├── app/
│   │   │   ├── (admin)/              # Admin panel route group
│   │   │   │   ├── layout.tsx        # Admin layout (sidebar, auth guard)
│   │   │   │   ├── dashboard/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── dispatch/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── trips/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── team/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── fleet/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── finance/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── payroll/page.tsx
│   │   │   │   │   └── tax/page.tsx
│   │   │   │   ├── packages/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── pricing/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── crm/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── analytics/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── marketing/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── queue/page.tsx
│   │   │   │   │   ├── calendar/page.tsx
│   │   │   │   │   └── analytics/page.tsx
│   │   │   │   ├── ai-agent/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   ├── knowledge-base/page.tsx
│   │   │   │   │   └── training/page.tsx
│   │   │   │   ├── verification/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx
│   │   │   ├── (marketplace)/        # Public marketplace route group
│   │   │   │   ├── layout.tsx        # Marketplace layout (navbar, footer)
│   │   │   │   ├── page.tsx          # Homepage / discover
│   │   │   │   ├── packages/
│   │   │   │   │   ├── page.tsx      # All packages listing
│   │   │   │   │   └── [slug]/
│   │   │   │   │       └── page.tsx  # Package detail + booking
│   │   │   │   ├── destinations/
│   │   │   │   │   └── [slug]/page.tsx
│   │   │   │   ├── real-trip-maps/
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── my-bookings/
│   │   │   │   │   ├── page.tsx
│   │   │   │   │   └── [id]/page.tsx
│   │   │   │   ├── profile/
│   │   │   │   │   └── page.tsx
│   │   │   │   └── checkout/
│   │   │   │       └── [bookingId]/page.tsx
│   │   │   ├── api/
│   │   │   │   ├── admin/
│   │   │   │   │   ├── trips/route.ts
│   │   │   │   │   ├── dispatch/route.ts
│   │   │   │   │   ├── team/route.ts
│   │   │   │   │   ├── fleet/route.ts
│   │   │   │   │   ├── finance/route.ts
│   │   │   │   │   ├── packages/route.ts
│   │   │   │   │   ├── pricing/route.ts
│   │   │   │   │   └── analytics/route.ts
│   │   │   │   ├── marketplace/
│   │   │   │   │   ├── packages/route.ts
│   │   │   │   │   ├── booking/
│   │   │   │   │   │   ├── create/route.ts
│   │   │   │   │   │   └── [id]/route.ts
│   │   │   │   │   └── reviews/route.ts
│   │   │   │   ├── driver/
│   │   │   │   │   ├── location/route.ts
│   │   │   │   │   ├── media/route.ts
│   │   │   │   │   └── trip/route.ts
│   │   │   │   ├── ai/
│   │   │   │   │   ├── chat/route.ts
│   │   │   │   │   └── knowledge/route.ts
│   │   │   │   ├── marketing/
│   │   │   │   │   ├── post/route.ts
│   │   │   │   │   └── queue/route.ts
│   │   │   │   └── webhook/
│   │   │   │       ├── midtrans/route.ts
│   │   │   │       ├── stripe/route.ts
│   │   │   │       ├── whatsapp/route.ts
│   │   │   │       └── instagram/route.ts
│   │   │   ├── auth/
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── register/page.tsx
│   │   │   │   └── callback/route.ts
│   │   │   └── layout.tsx            # Root layout
│   │   ├── components/
│   │   │   ├── ui/                   # shadcn/ui base components
│   │   │   ├── admin/                # Admin-specific components
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── TopBar.tsx
│   │   │   │   ├── RegionCard.tsx
│   │   │   │   ├── TripTable.tsx
│   │   │   │   ├── DispatchMap.tsx
│   │   │   │   ├── FinanceChart.tsx
│   │   │   │   └── LiveFeed.tsx
│   │   │   ├── marketplace/          # Marketplace components
│   │   │   │   ├── Navbar.tsx
│   │   │   │   ├── PackageCard.tsx
│   │   │   │   ├── BookingForm.tsx
│   │   │   │   ├── RealTripMap.tsx
│   │   │   │   ├── ReviewCard.tsx
│   │   │   │   └── TripTracker.tsx
│   │   │   └── shared/               # Shared components
│   │   │       ├── LoadingSpinner.tsx
│   │   │       ├── ErrorBoundary.tsx
│   │   │       └── ImageUploader.tsx
│   │   ├── lib/
│   │   │   ├── supabase/
│   │   │   │   ├── client.ts         # Browser client
│   │   │   │   ├── server.ts         # Server client (RSC)
│   │   │   │   └── middleware.ts     # Auth middleware
│   │   │   ├── api/
│   │   │   │   ├── midtrans.ts
│   │   │   │   ├── stripe.ts
│   │   │   │   ├── whatsapp.ts
│   │   │   │   ├── claude.ts
│   │   │   │   ├── mapbox.ts
│   │   │   │   └── social.ts
│   │   │   ├── utils/
│   │   │   │   ├── pricing.ts        # Dynamic pricing logic
│   │   │   │   ├── dispatch.ts       # Auto-dispatch algorithm
│   │   │   │   ├── formatting.ts
│   │   │   │   └── validation.ts
│   │   │   └── hooks/
│   │   │       ├── useRealtimeGPS.ts
│   │   │       ├── useBooking.ts
│   │   │       └── useRegion.ts
│   │   ├── types/
│   │   │   ├── database.types.ts     # Auto-generated dari Supabase
│   │   │   ├── booking.types.ts
│   │   │   ├── trip.types.ts
│   │   │   └── api.types.ts
│   │   ├── stores/
│   │   │   ├── useAdminStore.ts      # Zustand admin state
│   │   │   ├── useMapStore.ts        # GPS & map state
│   │   │   └── useBookingStore.ts
│   │   ├── middleware.ts             # Next.js middleware (auth guard)
│   │   ├── next.config.ts
│   │   ├── tailwind.config.ts
│   │   └── package.json
│   │
│   └── driver/                       # React Native Expo app
│       ├── app/
│       │   ├── (auth)/
│       │   │   ├── login.tsx
│       │   │   └── _layout.tsx
│       │   ├── (tabs)/
│       │   │   ├── index.tsx         # Home (trip aktif)
│       │   │   ├── trip.tsx          # Detail trip + checklist
│       │   │   ├── upload.tsx        # Upload foto/video
│       │   │   ├── earnings.tsx      # Gaji & komisi
│       │   │   ├── notifications.tsx
│       │   │   └── _layout.tsx       # Tab navigator
│       │   └── _layout.tsx           # Root layout
│       ├── components/
│       │   ├── TripCard.tsx
│       │   ├── GPSToggle.tsx
│       │   ├── MediaUploader.tsx
│       │   ├── ChatBubble.tsx
│       │   └── EarningsChart.tsx
│       ├── services/
│       │   ├── location.service.ts   # Background GPS
│       │   ├── upload.service.ts     # Media upload ke Supabase
│       │   └── notification.service.ts
│       ├── stores/
│       │   └── useDriverStore.ts
│       └── package.json
│
├── packages/
│   ├── shared-types/                 # Types shared antara web & driver
│   │   └── index.ts
│   └── ui-tokens/                    # Design tokens
│       └── colors.ts
│
├── supabase/
│   ├── migrations/                   # SQL migration files
│   │   ├── 001_initial_schema.sql
│   │   ├── 002_rls_policies.sql
│   │   ├── 003_functions.sql
│   │   └── 004_seed_data.sql
│   ├── functions/                    # Edge Functions
│   │   ├── auto-dispatch/index.ts
│   │   ├── send-notification/index.ts
│   │   └── process-media/index.ts
│   └── config.toml
│
├── scripts/
│   ├── generate-types.sh             # Regenerate database.types.ts
│   └── seed-dev.ts
│
├── docs/
│   └── JEDA_WISATA_TECHNICAL_SPEC.md      # File ini
│
├── pnpm-workspace.yaml
└── package.json
```

---

## 5. ENVIRONMENT VARIABLES

### 5.1 Web App (.env.local)

```bash
# ─── Supabase ───────────────────────────────────────────
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGc...          # Server only, never expose

# ─── App ────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL=https://jedawisata.id
NEXT_PUBLIC_APP_ENV=production                 # development | staging | production

# ─── Mapbox ─────────────────────────────────────────────
NEXT_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...

# ─── Payment ────────────────────────────────────────────
MIDTRANS_SERVER_KEY=Mid-server-xxx
MIDTRANS_CLIENT_KEY=Mid-client-xxx
NEXT_PUBLIC_MIDTRANS_CLIENT_KEY=Mid-client-xxx
MIDTRANS_IS_PRODUCTION=true

STRIPE_SECRET_KEY=sk_live_xxx
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_xxx
STRIPE_WEBHOOK_SECRET=whsec_xxx

# ─── AI & Embeddings ────────────────────────────────────
ANTHROPIC_API_KEY=sk-ant-xxx
OPENAI_API_KEY=sk-xxx                          # Untuk embedding saja

# ─── WhatsApp Business ──────────────────────────────────
WHATSAPP_ACCESS_TOKEN=EAAxxxxx
WHATSAPP_PHONE_NUMBER_ID=123456789
WHATSAPP_WEBHOOK_VERIFY_TOKEN=jedawisata_secret_token_xxx
META_APP_SECRET=xxx                            # Untuk verify signature webhook

# ─── Instagram DM ───────────────────────────────────────
META_PAGE_ACCESS_TOKEN=EAAxxxxx
META_PAGE_ID=xxxxx

# ─── Social Media Auto-Post ─────────────────────────────
META_APP_ID=xxxxx
META_IG_ACCOUNT_ID=xxxxx
TIKTOK_ACCESS_TOKEN=xxx
TIKTOK_OPEN_ID=xxx
YOUTUBE_CLIENT_ID=xxx
YOUTUBE_CLIENT_SECRET=xxx
YOUTUBE_REFRESH_TOKEN=xxx

# ─── Email ──────────────────────────────────────────────
RESEND_API_KEY=re_xxx
EMAIL_FROM=noreply@jedawisata.id

# ─── SMS Fallback ───────────────────────────────────────
TWILIO_ACCOUNT_SID=ACxxx
TWILIO_AUTH_TOKEN=xxx
TWILIO_PHONE_NUMBER=+1xxx

# ─── Queue (Redis/BullMQ) ───────────────────────────────
REDIS_URL=redis://default:xxx@xxx.railway.app:6379

# ─── Monitoring ─────────────────────────────────────────
SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
POSTHOG_KEY=phc_xxx
```

### 5.2 Driver App (.env)

```bash
EXPO_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=eyJhbGc...
EXPO_PUBLIC_APP_URL=https://jedawisata.id
EXPO_PUBLIC_MAPBOX_TOKEN=pk.eyJ1...
```

---

## 6. DATABASE SCHEMA

> Semua tabel menggunakan UUID sebagai primary key. `created_at` dan `updated_at` ada di semua tabel. Timezone: UTC (konversi ke WIB di frontend).

### 6.1 Enums

```sql
-- Status booking
CREATE TYPE booking_status AS ENUM (
  'pending_payment',
  'confirmed',
  'assigned',
  'on_trip',
  'completed',
  'cancelled',
  'refunded'
);

-- Status trip
CREATE TYPE trip_status AS ENUM (
  'scheduled',
  'driver_en_route',
  'picked_up',
  'at_destination',
  'returning',
  'completed'
);

-- Role pengguna
CREATE TYPE user_role AS ENUM (
  'super_admin',
  'regional_admin',
  'driver',
  'photographer',
  'guide',
  'client'
);

-- Status driver
CREATE TYPE driver_status AS ENUM (
  'offline',
  'standby',
  'on_trip',
  'break'
);

-- Tipe media
CREATE TYPE media_type AS ENUM (
  'photo',
  'video',
  'document'
);

-- Tipe pembayaran
CREATE TYPE payment_method AS ENUM (
  'midtrans_snap',
  'bank_transfer',
  'credit_card',
  'qris',
  'stripe',
  'stripe_usd',
  'stripe_aud',
  'stripe_eur'
);

-- Tipe konten marketing
CREATE TYPE content_type AS ENUM (
  'photo',
  'video',
  'carousel',
  'reels',
  'story'
);

-- Platform marketing
CREATE TYPE social_platform AS ENUM (
  'instagram',
  'facebook',
  'tiktok',
  'youtube'
);

-- Status post marketing
CREATE TYPE post_status AS ENUM (
  'draft',
  'scheduled',
  'published',
  'failed',
  'retrying'
);

-- Tipe transaksi keuangan
CREATE TYPE transaction_type AS ENUM (
  'income',
  'expense'
);

-- Status verifikasi driver
CREATE TYPE verification_status AS ENUM (
  'pending',
  'under_review',
  'approved',
  'rejected',
  'expired'
);

-- Tipe krisis
CREATE TYPE crisis_type AS ENUM (
  'driver_sick',
  'vehicle_breakdown',
  'extreme_weather',
  'client_accident',
  'route_blocked',
  'other'
);

-- Severity krisis
CREATE TYPE crisis_severity AS ENUM (
  'low',
  'medium',
  'high',
  'critical'
);
```

### 6.2 Core Tables

```sql
-- ─────────────────────────────────────────
-- REGIONS
-- ─────────────────────────────────────────
CREATE TABLE regions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,                    -- 'Jogja', 'Bali', etc.
  slug          TEXT NOT NULL UNIQUE,             -- 'jogja', 'bali', etc.
  display_name  TEXT NOT NULL,                    -- 'Jogja Hub'
  city          TEXT NOT NULL,
  province      TEXT NOT NULL,
  latitude      DECIMAL(10,8),
  longitude     DECIMAL(11,8),
  timezone      TEXT DEFAULT 'Asia/Jakarta',
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- USERS (extends Supabase auth.users)
-- ─────────────────────────────────────────
CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email         TEXT NOT NULL,
  full_name     TEXT NOT NULL,
  phone         TEXT,
  avatar_url    TEXT,
  role          user_role NOT NULL DEFAULT 'client',
  region_id     UUID REFERENCES regions(id),      -- NULL untuk super_admin & client
  is_active     BOOLEAN DEFAULT true,
  metadata      JSONB DEFAULT '{}',               -- Flexible extra data
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- PACKAGES (Paket Wisata)
-- ─────────────────────────────────────────
CREATE TABLE packages (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id         UUID NOT NULL REFERENCES regions(id),
  name              TEXT NOT NULL,
  slug              TEXT NOT NULL UNIQUE,
  description       TEXT,
  short_description TEXT,
  destination       TEXT NOT NULL,
  duration_days     INTEGER NOT NULL,
  duration_hours    INTEGER,
  base_price        BIGINT NOT NULL,              -- In IDR (Rupiah), no decimal
  min_pax           INTEGER NOT NULL DEFAULT 1,
  max_pax           INTEGER,
  includes          TEXT[],                       -- Array of inclusions
  excludes          TEXT[],
  itinerary         JSONB,                        -- [{time, title, description}]
  pickup_time       TIME,
  cover_image_url   TEXT,
  gallery_urls      TEXT[],
  tags              TEXT[],
  is_active         BOOLEAN DEFAULT true,
  is_featured       BOOLEAN DEFAULT false,
  seo_title         TEXT,
  seo_description   TEXT,
  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- PRICING RULES (Dynamic Pricing)
-- ─────────────────────────────────────────
CREATE TABLE pricing_rules (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name          TEXT NOT NULL,                    -- 'Lebaran 2026', 'Weekend Premium'
  rule_type     TEXT NOT NULL,                    -- 'date_range', 'day_of_week', 'season'
  multiplier    DECIMAL(4,2) NOT NULL,            -- 1.30 = 30% surcharge
  applies_to    TEXT NOT NULL DEFAULT 'all',      -- 'all' | package_id
  package_id    UUID REFERENCES packages(id),    -- NULL = applies to all
  region_id     UUID REFERENCES regions(id),     -- NULL = applies to all regions
  start_date    DATE,
  end_date      DATE,
  days_of_week  INTEGER[],                       -- [6,7] = Sabtu Minggu (1=Mon)
  priority      INTEGER DEFAULT 0,               -- Higher = takes precedence
  is_active     BOOLEAN DEFAULT true,
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- BOOKINGS
-- ─────────────────────────────────────────
CREATE TABLE bookings (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_code      TEXT NOT NULL UNIQUE,         -- 'JW-0441'
  client_id         UUID NOT NULL REFERENCES profiles(id),
  package_id        UUID NOT NULL REFERENCES packages(id),
  region_id         UUID NOT NULL REFERENCES regions(id),
  driver_id         UUID REFERENCES profiles(id),
  photographer_id   UUID REFERENCES profiles(id),
  guide_id          UUID REFERENCES profiles(id),

  trip_date         DATE NOT NULL,
  pickup_time       TIME NOT NULL,
  pickup_location   TEXT NOT NULL,
  pickup_lat        DECIMAL(10,8),
  pickup_lng        DECIMAL(11,8),
  pax_count         INTEGER NOT NULL,
  notes             TEXT,

  base_price        BIGINT NOT NULL,              -- Harga sebelum multiplier
  price_multiplier  DECIMAL(4,2) DEFAULT 1.00,    -- Dari dynamic pricing
  total_price       BIGINT NOT NULL,              -- base_price * multiplier * pax
  service_fee       BIGINT DEFAULT 0,
  photographer_fee  BIGINT DEFAULT 0,
  grand_total       BIGINT NOT NULL,

  currency          TEXT DEFAULT 'IDR',           -- IDR | USD | AUD | EUR
  payment_method    payment_method,
  payment_status    TEXT DEFAULT 'pending',       -- pending | paid | refunded
  midtrans_order_id TEXT,
  stripe_session_id TEXT,

  status            booking_status DEFAULT 'pending_payment',
  booking_source    TEXT DEFAULT 'web',           -- web | whatsapp | instagram | b2b
  affiliate_code    TEXT,                         -- Jika dari affiliate

  add_photographer  BOOLEAN DEFAULT false,
  trip_status       trip_status,

  cancelled_at      TIMESTAMPTZ,
  cancel_reason     TEXT,
  completed_at      TIMESTAMPTZ,

  metadata          JSONB DEFAULT '{}',
  created_at        TIMESTAMPTZ DEFAULT now(),
  updated_at        TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- DRIVER LOCATIONS (Realtime GPS)
-- ─────────────────────────────────────────
CREATE TABLE driver_locations (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id   UUID NOT NULL REFERENCES profiles(id) UNIQUE,
  booking_id  UUID REFERENCES bookings(id),
  latitude    DECIMAL(10,8) NOT NULL,
  longitude   DECIMAL(11,8) NOT NULL,
  accuracy    DECIMAL(6,2),
  speed       DECIMAL(6,2),
  heading     DECIMAL(5,2),
  status      driver_status DEFAULT 'offline',
  is_sharing  BOOLEAN DEFAULT false,             -- Apakah GPS aktif dishare ke publik
  last_seen   TIMESTAMPTZ DEFAULT now(),
  created_at  TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- TRIP MEDIA (Foto & Video dari Driver)
-- ─────────────────────────────────────────
CREATE TABLE trip_media (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id    UUID NOT NULL REFERENCES bookings(id),
  driver_id     UUID NOT NULL REFERENCES profiles(id),
  media_type    media_type NOT NULL,
  storage_path  TEXT NOT NULL,                   -- Supabase Storage path
  public_url    TEXT NOT NULL,
  thumbnail_url TEXT,
  caption       TEXT,
  latitude      DECIMAL(10,8),
  longitude     DECIMAL(11,8),
  is_public     BOOLEAN DEFAULT true,            -- Tampil di Real Trip Maps
  is_for_sale   BOOLEAN DEFAULT false,           -- Bisa dibeli klien
  price         BIGINT,                          -- Harga jika dijual (IDR)
  file_size     BIGINT,                          -- Bytes
  duration_sec  INTEGER,                         -- Untuk video
  created_at    TIMESTAMPTZ DEFAULT now(),
  updated_at    TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- REVIEWS
-- ─────────────────────────────────────────
CREATE TABLE reviews (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id      UUID NOT NULL REFERENCES bookings(id) UNIQUE,
  client_id       UUID NOT NULL REFERENCES profiles(id),
  driver_id       UUID REFERENCES profiles(id),
  package_id      UUID NOT NULL REFERENCES packages(id),
  rating          INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  driver_rating   INTEGER CHECK (driver_rating BETWEEN 1 AND 5),
  photo_rating    INTEGER CHECK (photo_rating BETWEEN 1 AND 5),
  comment         TEXT,
  client_photos   TEXT[],                        -- Foto dari klien
  is_published    BOOLEAN DEFAULT true,
  is_featured     BOOLEAN DEFAULT false,
  reply           TEXT,                          -- Balasan dari admin
  replied_at      TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- DRIVER VERIFICATION
-- ─────────────────────────────────────────
CREATE TABLE driver_verifications (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id             UUID NOT NULL REFERENCES profiles(id) UNIQUE,

  -- Dokumen
  ktp_url               TEXT,
  ktp_number            TEXT,
  ktp_verified          BOOLEAN DEFAULT false,

  sim_url               TEXT,
  sim_number            TEXT,
  sim_expiry            DATE,
  sim_verified          BOOLEAN DEFAULT false,

  stnk_url              TEXT,
  stnk_number           TEXT,
  stnk_expiry           DATE,
  stnk_verified         BOOLEAN DEFAULT false,

  -- Background check
  skck_url              TEXT,
  skck_expiry           DATE,
  skck_verified         BOOLEAN DEFAULT false,

  -- Sertifikasi
  first_aid_cert_url    TEXT,
  first_aid_expiry      DATE,
  first_aid_verified    BOOLEAN DEFAULT false,

  driver_training_url   TEXT,
  training_date         DATE,
  training_verified     BOOLEAN DEFAULT false,

  -- Insurance
  has_insurance         BOOLEAN DEFAULT false,
  insurance_provider    TEXT,
  insurance_number      TEXT,
  insurance_expiry      DATE,

  -- Status keseluruhan
  overall_status        verification_status DEFAULT 'pending',
  verified_by           UUID REFERENCES profiles(id),
  verified_at           TIMESTAMPTZ,
  rejection_reason      TEXT,
  notes                 TEXT,
  next_review_date      DATE,

  created_at            TIMESTAMPTZ DEFAULT now(),
  updated_at            TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- VEHICLES / FLEET
-- ─────────────────────────────────────────
CREATE TABLE vehicles (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id       UUID NOT NULL REFERENCES regions(id),
  driver_id       UUID REFERENCES profiles(id),
  plate_number    TEXT NOT NULL UNIQUE,
  brand           TEXT NOT NULL,                 -- 'Toyota'
  model           TEXT NOT NULL,                 -- 'HiAce'
  year            INTEGER,
  capacity        INTEGER NOT NULL,              -- Jumlah penumpang
  fuel_level      INTEGER DEFAULT 100,           -- Persentase 0-100
  is_active       BOOLEAN DEFAULT true,
  is_available    BOOLEAN DEFAULT true,
  last_service    DATE,
  next_service    DATE,
  service_notes   TEXT,
  photo_url       TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- FINANCIAL TRANSACTIONS
-- ─────────────────────────────────────────
CREATE TABLE transactions (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id       UUID REFERENCES regions(id),
  booking_id      UUID REFERENCES bookings(id),
  type            transaction_type NOT NULL,
  category        TEXT NOT NULL,                 -- 'revenue', 'fuel', 'payroll', 'tax', 'maintenance'
  amount          BIGINT NOT NULL,               -- IDR
  description     TEXT NOT NULL,
  reference_id    TEXT,                          -- External reference
  receipt_url     TEXT,
  recorded_by     UUID REFERENCES profiles(id),
  transaction_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- PAYROLL
-- ─────────────────────────────────────────
CREATE TABLE payroll (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  driver_id       UUID NOT NULL REFERENCES profiles(id),
  region_id       UUID NOT NULL REFERENCES regions(id),
  period_month    INTEGER NOT NULL,              -- 1-12
  period_year     INTEGER NOT NULL,
  base_salary     BIGINT NOT NULL,
  commission      BIGINT DEFAULT 0,              -- Dari jumlah trip
  bonus           BIGINT DEFAULT 0,              -- Bonus rating/performa
  deductions      BIGINT DEFAULT 0,
  total_amount    BIGINT NOT NULL,
  trip_count      INTEGER DEFAULT 0,
  status          TEXT DEFAULT 'pending',        -- pending | processing | paid
  payment_date    DATE,
  payment_proof   TEXT,
  notes           TEXT,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- MARKETING ASSETS
-- ─────────────────────────────────────────
CREATE TABLE marketing_assets (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id       UUID REFERENCES regions(id),   -- NULL = HQ/global
  title           TEXT NOT NULL,
  content_type    content_type NOT NULL,
  storage_path    TEXT NOT NULL,
  public_url      TEXT NOT NULL,
  thumbnail_url   TEXT,
  file_size       BIGINT,
  duration_sec    INTEGER,
  tags            TEXT[],
  package_id      UUID REFERENCES packages(id),  -- Terkait paket tertentu
  uploaded_by     UUID REFERENCES profiles(id),
  source          TEXT DEFAULT 'manual',         -- 'manual' | 'driver_upload' | 'auto'
  times_posted    INTEGER DEFAULT 0,
  last_posted_at  TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- SOCIAL MEDIA POSTS (Queue)
-- ─────────────────────────────────────────
CREATE TABLE social_posts (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  asset_id        UUID REFERENCES marketing_assets(id),
  platform        social_platform NOT NULL,
  caption         TEXT,
  hashtags        TEXT[],
  scheduled_at    TIMESTAMPTZ NOT NULL,
  published_at    TIMESTAMPTZ,
  status          post_status DEFAULT 'draft',
  platform_post_id TEXT,                         -- ID dari IG/TikTok/dll
  retry_count     INTEGER DEFAULT 0,
  error_message   TEXT,
  reach           INTEGER,
  likes           INTEGER,
  comments        INTEGER,
  shares          INTEGER,
  engagement_rate DECIMAL(5,2),
  created_by      UUID REFERENCES profiles(id),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- AI KNOWLEDGE BASE
-- ─────────────────────────────────────────
CREATE TABLE knowledge_base (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category    TEXT NOT NULL,                     -- 'packages', 'faq', 'policy', 'destination'
  title       TEXT NOT NULL,
  content     TEXT NOT NULL,
  language    TEXT DEFAULT 'id',                 -- 'id' | 'en'
  embedding   vector(1536),                      -- OpenAI embedding untuk RAG
  metadata    JSONB DEFAULT '{}',
  is_active   BOOLEAN DEFAULT true,
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- AI CONVERSATIONS
-- ─────────────────────────────────────────
CREATE TABLE ai_conversations (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID REFERENCES profiles(id),
  channel         TEXT NOT NULL,                 -- 'whatsapp' | 'instagram' | 'web'
  channel_user_id TEXT,                          -- WA number / IG sender ID
  booking_id      UUID REFERENCES bookings(id),
  status          TEXT DEFAULT 'active',         -- 'active' | 'escalated' | 'resolved'
  escalated_to    UUID REFERENCES profiles(id),
  escalation_reason TEXT,
  resolved_at     TIMESTAMPTZ,
  csat_score      INTEGER CHECK (csat_score BETWEEN 1 AND 5),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE ai_messages (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID NOT NULL REFERENCES ai_conversations(id),
  role            TEXT NOT NULL,                 -- 'user' | 'assistant' | 'admin'
  content         TEXT NOT NULL,
  intent          TEXT,                          -- Detected intent
  confidence      DECIMAL(4,2),
  is_ai_generated BOOLEAN DEFAULT true,
  tokens_used     INTEGER,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- NOTIFICATIONS
-- ─────────────────────────────────────────
CREATE TABLE notifications (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id         UUID NOT NULL REFERENCES profiles(id),
  title           TEXT NOT NULL,
  body            TEXT NOT NULL,
  type            TEXT NOT NULL,                 -- 'booking', 'trip', 'payment', 'system', 'marketing'
  data            JSONB DEFAULT '{}',            -- Extra data (booking_id, etc.)
  channel         TEXT DEFAULT 'push',           -- 'push' | 'email' | 'sms' | 'whatsapp'
  is_read         BOOLEAN DEFAULT false,
  sent_at         TIMESTAMPTZ,
  read_at         TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- CRISIS EVENTS
-- ─────────────────────────────────────────
CREATE TABLE crisis_events (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  region_id       UUID REFERENCES regions(id),
  booking_id      UUID REFERENCES bookings(id),
  driver_id       UUID REFERENCES profiles(id),
  crisis_type     crisis_type NOT NULL,
  severity        crisis_severity NOT NULL,
  title           TEXT NOT NULL,
  description     TEXT,
  action_taken    TEXT,
  reported_by     UUID REFERENCES profiles(id),
  resolved_by     UUID REFERENCES profiles(id),
  client_notified BOOLEAN DEFAULT false,
  status          TEXT DEFAULT 'open',           -- 'open' | 'in_progress' | 'resolved'
  resolved_at     TIMESTAMPTZ,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- AFFILIATES
-- ─────────────────────────────────────────
CREATE TABLE affiliates (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT NOT NULL,
  type            TEXT NOT NULL,                 -- 'blogger' | 'hotel' | 'wo' | 'concierge' | 'individual'
  email           TEXT NOT NULL UNIQUE,
  phone           TEXT,
  referral_code   TEXT NOT NULL UNIQUE,
  commission_rate DECIMAL(4,2) DEFAULT 0.07,     -- 7% default
  total_referrals INTEGER DEFAULT 0,
  total_earned    BIGINT DEFAULT 0,
  total_paid      BIGINT DEFAULT 0,
  is_active       BOOLEAN DEFAULT true,
  joined_at       TIMESTAMPTZ DEFAULT now(),
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- MEMBERSHIPS
-- ─────────────────────────────────────────
CREATE TABLE memberships (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID NOT NULL REFERENCES profiles(id) UNIQUE,
  plan            TEXT NOT NULL DEFAULT 'basic', -- 'basic' | 'premium'
  price_idr       BIGINT NOT NULL,
  discount_rate   DECIMAL(4,2) DEFAULT 0.10,     -- 10% diskon per booking
  started_at      DATE NOT NULL DEFAULT CURRENT_DATE,
  expires_at      DATE NOT NULL,
  stripe_sub_id   TEXT,                          -- Stripe subscription ID
  is_active       BOOLEAN DEFAULT true,
  created_at      TIMESTAMPTZ DEFAULT now(),
  updated_at      TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- MEDIA PURCHASES (Foto Digital)
-- ─────────────────────────────────────────
CREATE TABLE media_purchases (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id   UUID NOT NULL REFERENCES profiles(id),
  booking_id  UUID REFERENCES bookings(id),
  media_ids   UUID[] NOT NULL,                   -- Array of trip_media.id
  total_price BIGINT NOT NULL,
  payment_id  TEXT,
  status      TEXT DEFAULT 'pending',            -- pending | paid | delivered
  download_url TEXT,
  expires_at  TIMESTAMPTZ,                       -- Download link expiry
  created_at  TIMESTAMPTZ DEFAULT now(),
  updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ─────────────────────────────────────────
-- REWARD POINTS
-- ─────────────────────────────────────────
CREATE TABLE reward_points (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id       UUID NOT NULL REFERENCES profiles(id),
  points          INTEGER NOT NULL,
  type            TEXT NOT NULL,                 -- 'earned' | 'redeemed' | 'expired'
  source          TEXT,                          -- 'booking' | 'review' | 'referral'
  booking_id      UUID REFERENCES bookings(id),
  description     TEXT,
  created_at      TIMESTAMPTZ DEFAULT now()
);
```

### 6.3 Database Functions

```sql
-- Auto-generate booking code
CREATE OR REPLACE FUNCTION generate_booking_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  counter INTEGER;
BEGIN
  SELECT COUNT(*) + 1 INTO counter FROM bookings;
  new_code := 'JW-' || LPAD(counter::TEXT, 4, '0');
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Trigger untuk auto-set booking_code
CREATE OR REPLACE FUNCTION set_booking_code()
RETURNS TRIGGER AS $$
BEGIN
  NEW.booking_code := generate_booking_code();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER booking_code_trigger
  BEFORE INSERT ON bookings
  FOR EACH ROW
  WHEN (NEW.booking_code IS NULL)
  EXECUTE FUNCTION set_booking_code();

-- Update updated_at otomatis
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply ke semua tabel yang punya updated_at
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_packages_updated_at BEFORE UPDATE ON packages FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_bookings_updated_at BEFORE UPDATE ON bookings FOR EACH ROW EXECUTE FUNCTION update_updated_at();
CREATE TRIGGER update_vehicles_updated_at BEFORE UPDATE ON vehicles FOR EACH ROW EXECUTE FUNCTION update_updated_at();
-- (ulangi untuk semua tabel)

-- Hitung dynamic price untuk booking
CREATE OR REPLACE FUNCTION calculate_booking_price(
  p_package_id UUID,
  p_trip_date DATE,
  p_pax_count INTEGER,
  p_add_photographer BOOLEAN DEFAULT false
)
RETURNS TABLE(
  base_price BIGINT,
  multiplier DECIMAL,
  photographer_fee BIGINT,
  service_fee BIGINT,
  grand_total BIGINT,
  applied_rule TEXT
) AS $$
DECLARE
  v_package packages%ROWTYPE;
  v_rule pricing_rules%ROWTYPE;
  v_multiplier DECIMAL(4,2) := 1.00;
  v_rule_name TEXT := 'Standard';
  v_base BIGINT;
  v_photo_fee BIGINT := 0;
  v_svc_fee BIGINT;
  v_total BIGINT;
BEGIN
  -- Get package
  SELECT * INTO v_package FROM packages WHERE id = p_package_id;

  -- Find highest priority applicable pricing rule
  SELECT * INTO v_rule
  FROM pricing_rules
  WHERE is_active = true
    AND (package_id IS NULL OR package_id = p_package_id)
    AND (
      (rule_type = 'date_range' AND p_trip_date BETWEEN start_date AND end_date)
      OR
      (rule_type = 'day_of_week' AND EXTRACT(DOW FROM p_trip_date) = ANY(days_of_week))
    )
  ORDER BY priority DESC, multiplier DESC
  LIMIT 1;

  IF v_rule.id IS NOT NULL THEN
    v_multiplier := v_rule.multiplier;
    v_rule_name := v_rule.name;
  END IF;

  -- Calculate
  v_base := v_package.base_price * p_pax_count;
  IF p_add_photographer THEN
    v_photo_fee := 250000; -- Rp 250.000 flat
  END IF;
  v_svc_fee := ROUND(v_base * v_multiplier * 0.02); -- 2% service fee
  v_total := ROUND(v_base * v_multiplier) + v_photo_fee + v_svc_fee;

  RETURN QUERY SELECT
    v_package.base_price,
    v_multiplier,
    v_photo_fee,
    v_svc_fee,
    v_total,
    v_rule_name;
END;
$$ LANGUAGE plpgsql;

-- Hitung rata-rata rating package
CREATE OR REPLACE FUNCTION get_package_rating(p_package_id UUID)
RETURNS TABLE(avg_rating DECIMAL, review_count INTEGER) AS $$
BEGIN
  RETURN QUERY
  SELECT
    ROUND(AVG(rating)::DECIMAL, 1),
    COUNT(*)::INTEGER
  FROM reviews
  WHERE package_id = p_package_id
    AND is_published = true;
END;
$$ LANGUAGE plpgsql;
```

### 6.4 Indexes

```sql
-- Performance indexes
CREATE INDEX idx_bookings_client_id ON bookings(client_id);
CREATE INDEX idx_bookings_driver_id ON bookings(driver_id);
CREATE INDEX idx_bookings_package_id ON bookings(package_id);
CREATE INDEX idx_bookings_region_id ON bookings(region_id);
CREATE INDEX idx_bookings_trip_date ON bookings(trip_date);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_created_at ON bookings(created_at DESC);

CREATE INDEX idx_driver_locations_driver_id ON driver_locations(driver_id);
CREATE INDEX idx_driver_locations_is_sharing ON driver_locations(is_sharing) WHERE is_sharing = true;

CREATE INDEX idx_trip_media_booking_id ON trip_media(booking_id);
CREATE INDEX idx_trip_media_driver_id ON trip_media(driver_id);
CREATE INDEX idx_trip_media_is_public ON trip_media(is_public) WHERE is_public = true;

CREATE INDEX idx_transactions_region_id ON transactions(region_id);
CREATE INDEX idx_transactions_date ON transactions(transaction_date DESC);
CREATE INDEX idx_transactions_type ON transactions(type);

CREATE INDEX idx_social_posts_status ON social_posts(status);
CREATE INDEX idx_social_posts_scheduled ON social_posts(scheduled_at);
CREATE INDEX idx_social_posts_platform ON social_posts(platform);

CREATE INDEX idx_notifications_user_id ON notifications(user_id);
CREATE INDEX idx_notifications_unread ON notifications(user_id, is_read) WHERE is_read = false;

CREATE INDEX idx_ai_conversations_channel_user ON ai_conversations(channel_user_id);
CREATE INDEX idx_ai_conversations_status ON ai_conversations(status);

-- Vector similarity search index for RAG
CREATE INDEX idx_knowledge_base_embedding ON knowledge_base USING ivfflat (embedding vector_cosine_ops)
  WITH (lists = 100);
```

---

## 7. ROW LEVEL SECURITY

> **CRITICAL:** RLS harus dikonfigurasi sebelum satu baris data production ditulis. Jangan skip bagian ini.

### 7.1 Enable RLS

```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE trips ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_locations ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_media ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE payroll ENABLE ROW LEVEL SECURITY;
ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE marketing_assets ENABLE ROW LEVEL SECURITY;
ALTER TABLE social_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE driver_verifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE crisis_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_messages ENABLE ROW LEVEL SECURITY;
```

### 7.2 Helper Functions

```sql
-- Ambil role user yang sedang login
CREATE OR REPLACE FUNCTION auth_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Ambil region_id user yang sedang login
CREATE OR REPLACE FUNCTION auth_region_id()
RETURNS UUID AS $$
  SELECT region_id FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check apakah user adalah super_admin
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT role = 'super_admin' FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check apakah user adalah admin (super atau regional)
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
  SELECT role IN ('super_admin', 'regional_admin') FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;

-- Check apakah user adalah driver/fotografer/guide
CREATE OR REPLACE FUNCTION is_field_team()
RETURNS BOOLEAN AS $$
  SELECT role IN ('driver', 'photographer', 'guide') FROM profiles WHERE id = auth.uid();
$$ LANGUAGE sql SECURITY DEFINER STABLE;
```

### 7.3 RLS Policies

```sql
-- ─── PROFILES ───────────────────────────────────────────
-- User bisa lihat profile sendiri
CREATE POLICY "profiles_self_read" ON profiles
  FOR SELECT USING (auth.uid() = id);

-- Super admin bisa lihat semua profile
CREATE POLICY "profiles_super_admin_all" ON profiles
  FOR ALL USING (is_super_admin());

-- Regional admin bisa lihat profile di region mereka
CREATE POLICY "profiles_regional_admin_read" ON profiles
  FOR SELECT USING (
    is_admin() AND (
      region_id = auth_region_id() OR region_id IS NULL
    )
  );

-- User bisa update profile sendiri (kecuali role dan region_id)
CREATE POLICY "profiles_self_update" ON profiles
  FOR UPDATE USING (auth.uid() = id)
  WITH CHECK (
    auth.uid() = id
    AND role = (SELECT role FROM profiles WHERE id = auth.uid())
    AND region_id IS NOT DISTINCT FROM (SELECT region_id FROM profiles WHERE id = auth.uid())
  );

-- ─── BOOKINGS ───────────────────────────────────────────
-- Klien hanya lihat booking sendiri
CREATE POLICY "bookings_client_own" ON bookings
  FOR SELECT USING (
    auth.uid() = client_id
    AND auth_role() = 'client'
  );

-- Driver lihat booking yang di-assign ke mereka
CREATE POLICY "bookings_driver_assigned" ON bookings
  FOR SELECT USING (
    auth.uid() = driver_id
    AND is_field_team()
  );

-- Regional admin lihat semua booking di region mereka
CREATE POLICY "bookings_regional_admin" ON bookings
  FOR ALL USING (
    is_admin()
    AND (
      is_super_admin()
      OR region_id = auth_region_id()
    )
  );

-- Klien bisa insert booking baru
CREATE POLICY "bookings_client_insert" ON bookings
  FOR INSERT WITH CHECK (
    auth.uid() = client_id
    AND auth_role() = 'client'
  );

-- ─── PACKAGES ───────────────────────────────────────────
-- Semua orang (termasuk anonymous) bisa read packages yang aktif
CREATE POLICY "packages_public_read" ON packages
  FOR SELECT USING (is_active = true);

-- Admin bisa manage packages di region mereka
CREATE POLICY "packages_admin_manage" ON packages
  FOR ALL USING (
    is_admin()
    AND (
      is_super_admin()
      OR region_id = auth_region_id()
    )
  );

-- ─── DRIVER LOCATIONS ───────────────────────────────────
-- Driver hanya bisa update lokasi sendiri
CREATE POLICY "locations_driver_own" ON driver_locations
  FOR ALL USING (auth.uid() = driver_id);

-- Public bisa read lokasi driver yang is_sharing = true (untuk Real Trip Maps)
CREATE POLICY "locations_public_read" ON driver_locations
  FOR SELECT USING (is_sharing = true);

-- Admin bisa read semua lokasi
CREATE POLICY "locations_admin_read" ON driver_locations
  FOR SELECT USING (is_admin());

-- ─── TRIP MEDIA ─────────────────────────────────────────
-- Public bisa read media yang is_public = true
CREATE POLICY "media_public_read" ON trip_media
  FOR SELECT USING (is_public = true);

-- Driver bisa upload media untuk trip mereka
CREATE POLICY "media_driver_insert" ON trip_media
  FOR INSERT WITH CHECK (
    auth.uid() = driver_id
    AND is_field_team()
  );

-- Klien bisa lihat semua media dari booking mereka
CREATE POLICY "media_client_booking" ON trip_media
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM bookings
      WHERE bookings.id = trip_media.booking_id
      AND bookings.client_id = auth.uid()
    )
  );

-- ─── TRANSACTIONS ────────────────────────────────────────
-- Regional admin hanya lihat transaksi di region mereka
CREATE POLICY "transactions_regional_admin" ON transactions
  FOR ALL USING (
    is_admin()
    AND (
      is_super_admin()
      OR region_id = auth_region_id()
    )
  );

-- ─── NOTIFICATIONS ───────────────────────────────────────
-- User hanya lihat notifikasi sendiri
CREATE POLICY "notifications_own" ON notifications
  FOR ALL USING (auth.uid() = user_id);

-- ─── AI CONVERSATIONS ────────────────────────────────────
-- Client lihat conversation sendiri
CREATE POLICY "ai_conv_client" ON ai_conversations
  FOR SELECT USING (auth.uid() = client_id);

-- Admin lihat semua conversation
CREATE POLICY "ai_conv_admin" ON ai_conversations
  FOR ALL USING (is_admin());

-- ─── DRIVER VERIFICATIONS ────────────────────────────────
-- Driver lihat verifikasi sendiri
CREATE POLICY "verif_driver_own" ON driver_verifications
  FOR SELECT USING (auth.uid() = driver_id);

-- Admin manage semua verifikasi
CREATE POLICY "verif_admin_all" ON driver_verifications
  FOR ALL USING (is_admin());

-- ─── VEHICLES ────────────────────────────────────────────
-- Regional admin manage kendaraan di region mereka
CREATE POLICY "vehicles_regional_admin" ON vehicles
  FOR ALL USING (
    is_admin()
    AND (
      is_super_admin()
      OR region_id = auth_region_id()
    )
  );

-- Driver lihat kendaraan yang di-assign ke mereka
CREATE POLICY "vehicles_driver_own" ON vehicles
  FOR SELECT USING (auth.uid() = driver_id);
```

---

## 8. AUTHENTICATION & ROLES

### 8.1 Role Hierarchy

```
super_admin
├── Akses: Semua data, semua region
├── Hak: CRUD semua entitas, kelola role
└── Contoh: Mas Shafly, Abdullah Firaswan

regional_admin
├── Akses: Data region yang ditetapkan saja
├── Hak: CRUD trip, team, booking di region sendiri
└── Contoh: Koordinator Bali, Koordinator Jogja

driver / photographer / guide
├── Akses: Trip yang di-assign, lokasi sendiri, media sendiri
├── Hak: Update GPS, upload media, baca detail booking sendiri
└── Contoh: Pak Budi (driver), Mas Rizki (fotografer)

client
├── Akses: Booking sendiri, packages (read), media dari trip sendiri
├── Hak: Buat booking, beri review, beli foto digital
└── Contoh: Wisatawan yang booking via website

anon (tidak login)
├── Akses: Packages (read only), Real Trip Maps (read only)
└── Hak: Browse tanpa login, lihat live GPS map
```

### 8.2 Auth Flow

```typescript
// lib/supabase/middleware.ts
import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  const supabase = createServerClient(...)
  const { data: { session } } = await supabase.auth.getSession()

  // Admin routes — require login + admin role
  if (pathname.startsWith('/admin')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()

    if (!['super_admin', 'regional_admin'].includes(profile?.role)) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  // Protected marketplace routes
  if (pathname.startsWith('/my-bookings') || pathname.startsWith('/profile')) {
    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url))
    }
  }

  return NextResponse.next()
}
```

### 8.3 Profile Creation Trigger

```sql
-- Otomatis buat profile saat user register
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    COALESCE((NEW.raw_user_meta_data->>'role')::user_role, 'client')
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
```

---

## 9. ADMIN PANEL

### 9.1 Overview

Admin panel adalah aplikasi web internal yang hanya bisa diakses oleh `super_admin` dan `regional_admin`. Dibangun dengan Next.js App Router, route group `(admin)`.

**URL:** `/admin` → redirect ke `/admin/dashboard`

### 9.2 HQ Dashboard (`/admin/dashboard`)

**Komponen & Data:**

```typescript
// Data yang ditampilkan di HQ Dashboard
interface HQDashboardData {
  // Summary stats (real-time)
  active_trips_today: number
  revenue_this_month: number        // IDR
  total_field_team: number
  active_armada: number
  client_satisfaction: number       // Rata-rata rating

  // Per-region breakdown
  regions: {
    id: string
    name: string
    active_trips: number
    revenue_month: number
    team_count: number
    target_progress: number         // 0-100
    status: 'good' | 'warning' | 'critical'
  }[]

  // Live ops feed (Supabase Realtime)
  live_feed: {
    id: string
    type: 'trip_started' | 'trip_completed' | 'booking_new' | 'alert'
    message: string
    region: string
    timestamp: Date
    severity?: 'info' | 'warning' | 'error'
  }[]

  // Target vs actual (monthly)
  performance: {
    region_name: string
    target: number
    actual: number
    percentage: number
  }[]
}
```

**Realtime subscription:**
```typescript
// useEffect di HQ Dashboard
const channel = supabase
  .channel('hq-live-feed')
  .on('postgres_changes', {
    event: 'INSERT',
    schema: 'public',
    table: 'bookings'
  }, (payload) => {
    // Update live feed
  })
  .on('postgres_changes', {
    event: 'UPDATE',
    schema: 'public',
    table: 'bookings',
    filter: 'status=eq.on_trip'
  }, (payload) => {
    // Update active trips count
  })
  .subscribe()
```

**Alert System:**
- Tampilkan banner merah jika ada booking yang belum assign driver dalam 24 jam
- Tampilkan warning kuning jika ada driver dengan sertifikasi expired
- Tampilkan info biru jika ada review bintang 5 baru

### 9.3 Dispatch Center (`/admin/dispatch`)

**Fitur:**
- Peta Indonesia dengan pin per region (Mapbox GL)
- Pin warna hijau = driver on trip, abu = standby, merah = perlu assign
- Sidebar kiri: list trip yang butuh assign driver (urgent)
- Sidebar kanan: list driver standby yang bisa di-assign

**Auto-dispatch:**
```typescript
// Tombol "Assign Semua Otomatis" trigger Edge Function
const triggerAutoDispatch = async () => {
  const { data } = await supabase.functions.invoke('auto-dispatch', {
    body: { region_id: selectedRegion }
  })
  return data
}
```

**Manual assign:**
```typescript
interface AssignDriverPayload {
  booking_id: string
  driver_id: string
  vehicle_id?: string
  photographer_id?: string
}

// POST /api/admin/dispatch
const assignDriver = async (payload: AssignDriverPayload) => {
  const { data } = await supabase
    .from('bookings')
    .update({
      driver_id: payload.driver_id,
      status: 'assigned'
    })
    .eq('id', payload.booking_id)
    .select()

  // Trigger notifikasi ke driver
  await supabase.functions.invoke('send-notification', {
    body: {
      user_id: payload.driver_id,
      title: 'Trip baru di-assign!',
      body: `Kamu mendapat trip baru. Cek detail di app.`,
      data: { booking_id: payload.booking_id }
    }
  })
}
```

### 9.4 Trip Management (`/admin/trips`)

**Filter yang tersedia:**
- Region (dropdown)
- Status (pending_payment, confirmed, assigned, on_trip, completed, cancelled)
- Tanggal trip (date range picker)
- Driver (autocomplete search)
- Paket (dropdown)

**Kolom tabel:**
```
ID Booking | Paket | Region | Klien | Driver | Fotografer | Tgl Trip | Pax | Status | Total | Action
```

**Detail trip (`/admin/trips/[id]`):**
- Semua info booking
- Timeline status perjalanan
- GPS tracking live (embed map kecil)
- Media yang diupload driver
- Komunikasi chat klien
- History perubahan status

### 9.5 Team Management (`/admin/team`)

**Data per anggota:**
```typescript
interface TeamMember {
  id: string
  full_name: string
  role: 'driver' | 'photographer' | 'guide'
  region: string
  status: 'on_trip' | 'standby' | 'off' | 'break'
  current_booking_id?: string
  rating_avg: number
  trips_this_month: number
  verification_status: 'approved' | 'pending' | 'expired'
  certifications_ok: boolean
  phone: string
  joined_at: Date
}
```

**Fitur:**
- Filter by region, role, status, verification
- View profil lengkap + riwayat trip
- Tombol "Verifikasi" → buka dialog upload dokumen
- Update status manual (untuk kasus override)
- Export data ke CSV

### 9.6 Fleet Management (`/admin/fleet`)

**Data per kendaraan:**
```typescript
interface Vehicle {
  id: string
  plate_number: string
  brand: string
  model: string
  year: number
  capacity: number
  region: string
  assigned_driver?: string
  fuel_level: number           // 0-100%
  status: 'active' | 'service' | 'inactive'
  last_service: Date
  next_service: Date
  is_service_due: boolean      // true jika next_service < 30 hari
}
```

**Alert:**
- Banner merah: kendaraan yang sedang dalam servis
- Banner kuning: service jatuh tempo dalam 30 hari
- Badge BBM rendah: fuel_level < 20%

### 9.7 Finance (`/admin/finance`)

**Sub-halaman:**

*P&L per Region:*
```typescript
interface RegionPnL {
  region_name: string
  revenue: number              // IDR
  ops_cost: number
  payroll_cost: number
  fleet_cost: number
  marketing_cost: number
  net_profit: number
  margin_percentage: number
}
```

*Transaksi:*
- Tabel semua transaksi dengan filter
- Tombol "+ Tambah transaksi" → form modal
- Export ke Excel (via browser xlsx generation)

*Penggajian:*
- Tabel payroll per region per bulan
- Status: pending → processing → paid
- Tombol "Proses Semua" → batch update status + kirim notif ke driver

*Pajak:*
- Summary PPN per bulan
- Export laporan untuk Coretax
- Reminder otomatis H-7 sebelum jatuh tempo

### 9.8 Packages & Pricing (`/admin/packages`)

**Form tambah/edit paket:**
```typescript
interface PackageForm {
  name: string
  slug: string                 // Auto-generate dari nama, bisa diedit
  region_id: string
  destination: string
  description: string
  short_description: string
  duration_days: number
  duration_hours?: number
  base_price: number           // IDR
  min_pax: number
  max_pax?: number
  pickup_time: string          // "03:00"
  includes: string[]           // Array input (tag input)
  excludes: string[]
  itinerary: ItineraryItem[]   // [{time, title, description}]
  cover_image: File
  gallery: File[]
  tags: string[]
  is_active: boolean
  is_featured: boolean
  seo_title: string
  seo_description: string
}
```

**Dynamic Pricing UI (`/admin/pricing`):**
- Kalender visual dengan highlight periode harga khusus
- Form buat pricing rule:
  - Nama rule (contoh: "Lebaran 2026")
  - Tipe: date range / day of week
  - Multiplier: input angka (1.30 = +30%)
  - Berlaku untuk: semua paket / paket tertentu
  - Berlaku untuk region: semua / region tertentu
- Preview: "Harga Bromo untuk weekend = Rp 1.200.000 × 1.15 = Rp 1.380.000/pax"

### 9.9 CRM & Chat Center (`/admin/crm`)

**Tampilan split:**
- Kiri: List semua percakapan (dari AI agent + manual)
- Kanan: Chat window aktif

**Fitur:**
- Filter: all, ai_handling, escalated, resolved
- Badge unread count per conversation
- Tombol "Ambil Alih" → admin take over dari AI
- Tag conversation: booking_inquiry, complaint, general
- Search by nama klien / booking code
- Lihat riwayat booking klien di sidebar kanan atas

### 9.10 Analytics (`/admin/analytics`)

**Halaman analytics dengan 4 tab:**

*Revenue:*
- Bar chart revenue per region per bulan (Recharts)
- Line chart trend 6 bulan terakhir
- Tabel perbandingan antar region

*Booking:*
- Heatmap booking per hari dalam seminggu
- Paket terlaris per region
- Conversion rate dari visit ke booking

*Kepuasan:*
- Rating rata-rata per paket, per driver, per region
- Word cloud dari komentar (opsional)
- Trend NPS

*Marketing:*
- Post dengan engagement tertinggi
- Performa per platform
- Reach vs booking conversion

---

## 10. MARKETPLACE & CLIENT PORTAL

### 10.1 Homepage (`/`)

**Komponen utama:**

*Hero Section:*
```typescript
// Data untuk hero
const heroData = {
  headline: "Wisata tanpa drama",
  subheadline: "Driver profesional, dokumentasi real-time, dan pengalaman nyata di seluruh Indonesia",
  live_trip_count: number,      // Real-time dari Supabase
  stats: {
    trips_completed: number,
    satisfaction_rate: number,
    packages_count: number,
    hubs_count: number
  }
}
```

*Featured Packages (3 kartu):*
- Ambil dari `packages` WHERE `is_featured = true` LIMIT 3
- Package card: gambar, nama, region, durasi, rating, harga, tombol pesan

*Real Trip Maps Preview:*
- Mini map 280×150px dengan live pins (embed komponen RTM)
- CTA "Buka Real Trip Maps"
- Badge "LIVE — X driver aktif" dengan pulse animation

*Reviews Section:*
- 3 review terbaru dengan rating ≥ 4
- Star rating, quote, nama, paket yang dipesan

### 10.2 Package Listing (`/packages`)

**Filter & sort:**
```typescript
interface PackageFilters {
  region?: string              // 'all' | 'jogja' | 'bali' | ...
  duration?: '1day' | '2day' | '3day_plus'
  price_min?: number
  price_max?: number
  tags?: string[]              // ['sunrise', 'budaya', 'alam', 'petualangan']
  sort?: 'popular' | 'price_asc' | 'price_desc' | 'rating'
  page?: number
}
```

**Package Card:**
```tsx
interface PackageCardProps {
  id: string
  name: string
  slug: string
  destination: string
  region: string
  duration_days: number
  base_price: number
  rating_avg: number
  review_count: number
  cover_image_url: string
  tags: string[]
  is_featured: boolean
  has_photographer: boolean    // Ada opsi fotografer
}
```

### 10.3 Package Detail (`/packages/[slug]`)

**Layout:**
- Full-width image hero dengan nama paket dan region badge
- Dua kolom: info paket (kiri lebar) + booking sidebar (kanan sticky)

**Info paket:**
- Rating + jumlah review
- Grid stats (durasi, pickup time, min pax, termasuk apa)
- Itinerary accordion
- Yang termasuk / tidak termasuk
- Gallery foto
- Reviews (paginated, 5 per halaman)

**Booking sidebar (sticky):**
```typescript
interface BookingFormState {
  trip_date: Date | null
  pax_count: number            // Default: min_pax
  add_photographer: boolean
  pickup_location: string
  promo_code?: string

  // Calculated (real-time update saat form berubah)
  price_breakdown: {
    base_price: number
    multiplier: number
    multiplier_label: string   // "Weekend +15%"
    photographer_fee: number
    service_fee: number
    grand_total: number
  }
}
```

**Kalkulasi harga real-time:**
```typescript
// useEffect saat trip_date berubah
const calculatePrice = async () => {
  const { data } = await supabase.rpc('calculate_booking_price', {
    p_package_id: packageId,
    p_trip_date: tripDate,
    p_pax_count: paxCount,
    p_add_photographer: addPhotographer
  })
  setPriceBreakdown(data[0])
}
```

### 10.4 Checkout & Payment (`/checkout/[bookingId]`)

**Flow:**
1. Buat booking (status: `pending_payment`)
2. Hit payment API
3. Midtrans Snap (IDR) / Stripe Checkout (Intl)
4. Webhook update status → `confirmed`
5. Redirect ke `/my-bookings/[id]?success=true`

```typescript
// POST /api/marketplace/booking/create
const createBooking = async (form: BookingFormState) => {
  const { data: booking } = await supabase
    .from('bookings')
    .insert({
      client_id: userId,
      package_id: packageId,
      region_id: regionId,
      trip_date: form.trip_date,
      pickup_time: packagePickupTime,
      pickup_location: form.pickup_location,
      pax_count: form.pax_count,
      add_photographer: form.add_photographer,
      base_price: priceBreakdown.base_price,
      price_multiplier: priceBreakdown.multiplier,
      grand_total: priceBreakdown.grand_total,
      currency: userCurrency,       // IDR atau USD/AUD/EUR
      affiliate_code: affiliateCode // Dari URL param ?ref=xxx
    })
    .select()
    .single()

  // Create payment
  if (userCurrency === 'IDR') {
    const payment = await createMidtransPayment(booking.id, booking.grand_total)
    return { booking, payment_url: payment.redirect_url }
  } else {
    const session = await createStripeSession(booking.id, booking.grand_total, userCurrency)
    return { booking, payment_url: session.url }
  }
}
```

### 10.5 My Bookings (`/my-bookings`)

**Daftar booking dengan status:**
- Tab: Semua | Aktif | Selesai | Dibatalkan
- Setiap card: gambar paket, nama, tanggal, status badge, total harga, aksi

**Detail booking (`/my-bookings/[id]`):**
- Informasi lengkap trip
- **Trip tracker** (status timeline visual): Confirmed → Assigned → Driver En Route → Picked Up → At Destination → Completed
- Live GPS tracking (embed mini RTM) jika status `on_trip`
- Tombol "Chat Driver" (buka WA deeplink)
- Media gallery dari driver
- Tombol beli foto (jika is_for_sale = true)
- Tombol beri review (jika completed dan belum review)

### 10.6 Real Trip Maps (`/real-trip-maps`)

Lihat [Bagian 12](#12-real-trip-maps) untuk spec teknis lengkap.

### 10.7 User Profile (`/profile`)

```typescript
interface ProfilePage {
  user_info: {
    full_name: string
    email: string
    phone: string
    avatar_url: string
    member_since: Date
  }
  membership: {
    is_member: boolean
    plan: string
    expires_at: Date
    discount_rate: number
  }
  reward_points: {
    total_points: number
    idr_value: number          // points * 100 (1 point = Rp 100)
    history: PointTransaction[]
  }
  stats: {
    total_bookings: number
    total_spent: number
    avg_rating_given: number
  }
}
```

---

## 11. DRIVER APP (REACT NATIVE)

### 11.1 Overview

Driver App adalah aplikasi React Native (Expo) untuk driver, fotografer, dan guide. Dibutuhkan native karena:
- Background GPS tracking (tidak bisa di PWA/browser)
- Push notification saat layar off
- Kamera langsung dari OS (lebih reliable)
- Offline mode untuk area blank spot (Bromo, Rinjani)

### 11.2 Autentikasi

```typescript
// stores/useDriverStore.ts
interface DriverStore {
  driver: Profile | null
  currentTrip: Booking | null
  isGpsActive: boolean
  gpsStatus: 'idle' | 'sharing' | 'error'
  
  login: (email: string, password: string) => Promise<void>
  logout: () => void
  startGPS: () => Promise<void>
  stopGPS: () => void
  setCurrentTrip: (trip: Booking | null) => void
}
```

### 11.3 Home Screen

**Tampilan:**
- Header dengan nama driver, hub region, dan GPS toggle (ON/OFF)
- Active trip card (jika sedang on trip):
  - Nama paket, booking ID, klien
  - Progress bar (persentase trip selesai)
  - Quick action buttons: Upload Foto, Detail Trip, Chat
- Jadwal hari ini (list semua trip hari ini)
- Stats: pendapatan hari ini, trip selesai/total

### 11.4 GPS Background Tracking

```typescript
// services/location.service.ts
import * as Location from 'expo-location'
import * as TaskManager from 'expo-task-manager'

const LOCATION_TASK = 'background-location-task'

// Define background task
TaskManager.defineTask(LOCATION_TASK, async ({ data, error }) => {
  if (error) {
    console.error('GPS error:', error)
    return
  }
  const { locations } = data as { locations: Location.LocationObject[] }
  const location = locations[0]

  // Update Supabase (gunakan service role atau anon key dengan RLS)
  const { driverId, bookingId } = await getDriverContext()
  
  await supabase
    .from('driver_locations')
    .upsert({
      driver_id: driverId,
      booking_id: bookingId,
      latitude: location.coords.latitude,
      longitude: location.coords.longitude,
      accuracy: location.coords.accuracy,
      speed: location.coords.speed,
      heading: location.coords.heading,
      status: 'on_trip',
      is_sharing: true,
      last_seen: new Date().toISOString()
    }, { onConflict: 'driver_id' })
})

export const startBackgroundGPS = async () => {
  const { status } = await Location.requestBackgroundPermissionsAsync()
  if (status !== 'granted') throw new Error('GPS permission denied')

  await Location.startLocationUpdatesAsync(LOCATION_TASK, {
    accuracy: Location.Accuracy.High,
    timeInterval: 5000,          // Update setiap 5 detik
    distanceInterval: 10,        // Atau setiap 10 meter
    showsBackgroundLocationIndicator: true,
    foregroundService: {
      notificationTitle: 'Jeda Wisata GPS Aktif',
      notificationBody: 'Posisi kamu sedang dibagikan ke klien',
      notificationColor: '#0F6E56'
    }
  })
}

export const stopBackgroundGPS = async () => {
  await Location.stopLocationUpdatesAsync(LOCATION_TASK)
  
  // Update status ke offline
  await supabase
    .from('driver_locations')
    .update({ is_sharing: false, status: 'standby' })
    .eq('driver_id', driverId)
}
```

### 11.5 Upload Media

```typescript
// services/upload.service.ts
import * as ImagePicker from 'expo-image-picker'
import * as FileSystem from 'expo-file-system'

export const uploadTripMedia = async (
  bookingId: string,
  driverId: string,
  caption?: string
) => {
  // Pilih dari kamera atau galeri
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.All,
    quality: 0.8,
    allowsEditing: false,
    videoMaxDuration: 60
  })

  if (result.canceled) return null

  const asset = result.assets[0]
  const ext = asset.type === 'video' ? 'mp4' : 'jpg'
  const fileName = `${bookingId}/${Date.now()}.${ext}`
  const storagePath = `trip-media/${fileName}`

  // Upload ke Supabase Storage
  const fileBase64 = await FileSystem.readAsStringAsync(asset.uri, {
    encoding: FileSystem.EncodingType.Base64
  })

  const { data: storageData, error } = await supabase.storage
    .from('trip-media')
    .upload(storagePath, decode(fileBase64), {
      contentType: asset.type === 'video' ? 'video/mp4' : 'image/jpeg',
      cacheControl: '3600'
    })

  if (error) throw error

  // Get public URL
  const { data: { publicUrl } } = supabase.storage
    .from('trip-media')
    .getPublicUrl(storagePath)

  // Insert record ke database
  const { data: mediaRecord } = await supabase
    .from('trip_media')
    .insert({
      booking_id: bookingId,
      driver_id: driverId,
      media_type: asset.type === 'video' ? 'video' : 'photo',
      storage_path: storagePath,
      public_url: publicUrl,
      caption,
      is_public: true,
      file_size: asset.fileSize
    })
    .select()
    .single()

  return mediaRecord
}
```

### 11.6 Offline Mode

```typescript
// Gunakan AsyncStorage untuk cache data trip saat offline
import AsyncStorage from '@react-native-async-storage/async-storage'

export const cacheCurrentTrip = async (trip: Booking) => {
  await AsyncStorage.setItem('cached_trip', JSON.stringify(trip))
}

export const getCachedTrip = async (): Promise<Booking | null> => {
  const data = await AsyncStorage.getItem('cached_trip')
  return data ? JSON.parse(data) : null
}

// Queue GPS updates saat offline, flush saat online
const gpsQueue: LocationUpdate[] = []

export const queueGPSUpdate = (update: LocationUpdate) => {
  gpsQueue.push(update)
}

export const flushGPSQueue = async () => {
  if (gpsQueue.length === 0) return
  
  const updates = [...gpsQueue]
  gpsQueue.length = 0

  // Batch upsert semua update yang tertunda
  // Ambil yang terakhir saja (posisi terkini)
  const latest = updates[updates.length - 1]
  await supabase.from('driver_locations').upsert(latest, { onConflict: 'driver_id' })
}

// Monitor koneksi
import NetInfo from '@react-native-community/netinfo'
NetInfo.addEventListener(state => {
  if (state.isConnected) {
    flushGPSQueue()
  }
})
```

### 11.7 Push Notifications

```typescript
// services/notification.service.ts
import * as Notifications from 'expo-notifications'

// Setup handler
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true
  })
})

// Register dan simpan token
export const registerForPushNotifications = async (driverId: string) => {
  const { status } = await Notifications.requestPermissionsAsync()
  if (status !== 'granted') return

  const token = (await Notifications.getExpoPushTokenAsync()).data

  // Simpan token ke profile
  await supabase
    .from('profiles')
    .update({ metadata: { push_token: token } })
    .eq('id', driverId)
}

// Handle notifikasi saat ada trip baru
Notifications.addNotificationResponseReceivedListener(response => {
  const data = response.notification.request.content.data
  if (data.booking_id) {
    router.push(`/trip/${data.booking_id}`)
  }
})
```

---

## 12. REAL TRIP MAPS

### 12.1 Overview

Real Trip Maps adalah fitur peta live yang menampilkan posisi driver on duty secara real-time kepada klien di marketplace. Ini adalah diferensiasi utama platform Jeda Wisata.

**Tampilan:**
- Peta Mapbox full-width dengan tema dark (style: `mapbox://styles/mapbox/dark-v11`)
- Pin driver (animated pulse) dengan warna berbeda per region
- Klik pin → popup dengan foto terbaru dari driver
- Feed foto/video di bawah peta (3 kolom)

### 12.2 Realtime GPS Subscription

```typescript
// components/marketplace/RealTripMap.tsx
'use client'
import { useEffect, useRef, useState } from 'react'
import mapboxgl from 'mapbox-gl'
import { createBrowserClient } from '@supabase/ssr'

interface DriverPin {
  driver_id: string
  full_name: string
  booking_id: string
  package_name: string
  latitude: number
  longitude: number
  status: string
  region: string
  latest_media?: TripMedia
}

export function RealTripMap() {
  const mapRef = useRef<mapboxgl.Map | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<Record<string, mapboxgl.Marker>>({})
  const [driverPins, setDriverPins] = useState<DriverPin[]>([])
  const [selectedDriver, setSelectedDriver] = useState<DriverPin | null>(null)

  // Initial load
  useEffect(() => {
    const loadActiveDrivers = async () => {
      const { data } = await supabase
        .from('driver_locations')
        .select(`
          driver_id,
          latitude,
          longitude,
          status,
          booking_id,
          last_seen,
          profiles!driver_id (
            full_name,
            region_id,
            regions!region_id (name)
          ),
          bookings!booking_id (
            packages (name)
          )
        `)
        .eq('is_sharing', true)
        .gte('last_seen', new Date(Date.now() - 5 * 60 * 1000).toISOString()) // Active dalam 5 menit terakhir
      
      setDriverPins(transformData(data))
    }
    loadActiveDrivers()
  }, [])

  // Realtime subscription untuk update posisi
  useEffect(() => {
    const channel = supabase
      .channel('live-driver-locations')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'driver_locations',
        filter: 'is_sharing=eq.true'
      }, (payload) => {
        setDriverPins(prev => updateDriverPin(prev, payload.new))
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [])

  // Realtime untuk media baru
  useEffect(() => {
    const channel = supabase
      .channel('live-trip-media')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'trip_media',
        filter: 'is_public=eq.true'
      }, (payload) => {
        // Update popup jika driver yang bersangkutan sedang dipilih
        if (selectedDriver?.booking_id === payload.new.booking_id) {
          // Refresh media untuk driver ini
          refreshDriverMedia(payload.new.booking_id)
        }
        // Update media feed di bawah peta
        updateMediaFeed(payload.new)
      })
      .subscribe()

    return () => { supabase.removeChannel(channel) }
  }, [selectedDriver])

  // Mapbox init
  useEffect(() => {
    if (!mapContainerRef.current) return
    
    mapboxgl.accessToken = process.env.NEXT_PUBLIC_MAPBOX_TOKEN!
    
    mapRef.current = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [118.0148634, -2.548926],  // Center Indonesia
      zoom: 5
    })

    return () => mapRef.current?.remove()
  }, [])

  // Update markers saat driverPins berubah
  useEffect(() => {
    driverPins.forEach(driver => {
      if (markersRef.current[driver.driver_id]) {
        // Update posisi existing marker
        markersRef.current[driver.driver_id].setLngLat([driver.longitude, driver.latitude])
      } else {
        // Buat marker baru
        const el = createMarkerElement(driver)
        el.addEventListener('click', () => setSelectedDriver(driver))

        const marker = new mapboxgl.Marker({ element: el })
          .setLngLat([driver.longitude, driver.latitude])
          .addTo(mapRef.current!)

        markersRef.current[driver.driver_id] = marker
      }
    })
  }, [driverPins])

  return (
    <div className="relative">
      <div ref={mapContainerRef} className="h-[320px] rounded-xl" />
      {selectedDriver && <DriverPopup driver={selectedDriver} onClose={() => setSelectedDriver(null)} />}
    </div>
  )
}
```

### 12.3 GPS Fallback (Offline Driver)

```typescript
// Jika driver offline > 5 menit, tampilkan "Last seen X mnt lalu"
// Jika Supabase Realtime down, fallback ke polling REST

const REALTIME_TIMEOUT = 30000 // 30 detik

useEffect(() => {
  let lastUpdate = Date.now()
  let pollInterval: NodeJS.Timeout

  const channel = supabase.channel('driver-locations')
    .on('postgres_changes', ..., (payload) => {
      lastUpdate = Date.now()
    })
    .subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        // Monitor jika tidak ada update dalam 30 detik
        pollInterval = setInterval(() => {
          if (Date.now() - lastUpdate > REALTIME_TIMEOUT) {
            // Fallback ke REST polling
            fetchDriverLocationsREST()
          }
        }, REALTIME_TIMEOUT)
      }
    })

  return () => {
    supabase.removeChannel(channel)
    clearInterval(pollInterval)
  }
}, [])

const fetchDriverLocationsREST = async () => {
  const { data } = await supabase
    .from('driver_locations')
    .select('*')
    .eq('is_sharing', true)
  // Update state
}
```

---

## 13. DYNAMIC PRICING ENGINE

### 13.1 Logic

Harga akhir = `base_price × price_multiplier × pax_count + photographer_fee + service_fee`

**Multiplier rules (dari tabel `pricing_rules`, diambil yang prioritas tertinggi):**

```
Season            | Multiplier | Contoh Berlaku
──────────────────|────────────|──────────────────────────────
Peak (lebaran)    | 1.30–1.50  | H-7 sampai H+7 lebaran
High (libur anak) | 1.20–1.30  | Libur sekolah Juni-Juli
Weekend           | 1.15       | Sabtu & Minggu
Weekday normal    | 1.00       | Senin–Jumat non-peak
Low season promo  | 0.85–0.90  | Februari, Oktober
Last minute       | 0.95       | Sisa slot H-2
Early bird        | 0.90       | Booking > H+30
```

### 13.2 Implementation

```typescript
// lib/utils/pricing.ts
export async function calculatePrice(params: {
  packageId: string
  tripDate: Date
  paxCount: number
  addPhotographer: boolean
  promoCode?: string
}) {
  const { data, error } = await supabase.rpc('calculate_booking_price', {
    p_package_id: params.packageId,
    p_trip_date: format(params.tripDate, 'yyyy-MM-dd'),
    p_pax_count: params.paxCount,
    p_add_photographer: params.addPhotographer
  })

  if (error) throw error

  const result = data[0]

  // Apply promo code jika ada
  let promoDiscount = 0
  if (params.promoCode) {
    promoDiscount = await validatePromoCode(params.promoCode, result.grand_total)
  }

  return {
    base_price: result.base_price,
    multiplier: result.multiplier,
    multiplier_label: result.applied_rule !== 'Standard' ? result.applied_rule : null,
    photographer_fee: result.photographer_fee,
    service_fee: result.service_fee,
    grand_total: result.grand_total - promoDiscount,
    promo_discount: promoDiscount
  }
}
```

### 13.3 Admin UI

Di halaman `/admin/pricing`:
- Tabel semua pricing rules
- Form buat rule baru:
  ```
  Nama         : [input text]
  Tipe         : [date_range | day_of_week]
  Tanggal      : [date range picker] (jika date_range)
  Hari         : [multi-select checkbox] (jika day_of_week)
  Multiplier   : [number input] contoh: 1.30
  Berlaku untuk: [dropdown: Semua Paket / Pilih Paket]
  Region       : [dropdown: Semua Region / Pilih Region]
  Prioritas    : [number input] (lebih tinggi = lebih prioritas)
  Status       : [toggle aktif/nonaktif]
  ```
- Preview kalender bulan ini dengan highlight harga

---

## 14. DRIVER VERIFICATION SYSTEM

### 14.1 Alur Verifikasi

```
Driver daftar akun → Status: pending
Admin upload/review dokumen → Status: under_review
Semua dokumen approved → Status: approved → Driver bisa terima trip
Jika ada dokumen expired → Status: expired → Driver tidak bisa terima trip sampai diperbarui
```

### 14.2 Dokumen Wajib

| Dokumen | Validitas | Wajib Refresh |
|---------|-----------|---------------|
| KTP | Tidak kadaluarsa | Jika data berubah |
| SIM (A/B1) | Sesuai masa berlaku | Sebelum expired |
| STNK Kendaraan | Sesuai masa berlaku | Sebelum expired |
| SKCK | 6 bulan | Tiap 6 bulan |
| Sertifikat First Aid | 1 tahun | Tiap 1 tahun |
| Sertifikat Pelatihan Driver | 2 tahun | Tiap 2 tahun |

### 14.3 API

```typescript
// POST /api/admin/verification/upload
// Upload dokumen dari admin atau driver
const uploadVerificationDoc = async (
  driverId: string,
  docType: keyof DriverVerification,
  file: File
) => {
  const path = `verifications/${driverId}/${docType}_${Date.now()}.${getExt(file)}`
  
  await supabase.storage.from('documents').upload(path, file, {
    contentType: file.type,
    upsert: true
  })

  const { publicUrl } = supabase.storage.from('documents').getPublicUrl(path).data

  await supabase
    .from('driver_verifications')
    .upsert({
      driver_id: driverId,
      [`${docType}_url`]: publicUrl
    }, { onConflict: 'driver_id' })
}

// POST /api/admin/verification/approve
// Admin approve/reject dokumen tertentu
const reviewDocument = async (
  driverId: string,
  docType: string,
  approved: boolean,
  notes?: string
) => {
  const update = {
    [`${docType}_verified`]: approved,
    notes,
    overall_status: await recalculateStatus(driverId)
  }

  await supabase.from('driver_verifications').update(update).eq('driver_id', driverId)

  // Kirim notif ke driver
  await sendNotification({
    userId: driverId,
    title: approved ? 'Dokumen disetujui' : 'Dokumen ditolak',
    body: approved
      ? `${docType} kamu telah diverifikasi.`
      : `${docType} ditolak. Alasan: ${notes}`,
    type: 'verification'
  })
}

// Recalculate overall status berdasarkan semua dokumen
const recalculateStatus = async (driverId: string) => {
  const { data } = await supabase
    .from('driver_verifications')
    .select('*')
    .eq('driver_id', driverId)
    .single()

  const requiredDocs = [
    'ktp_verified',
    'sim_verified',
    'stnk_verified',
    'skck_verified',
    'first_aid_verified',
    'driver_training_verified'
  ]

  const allApproved = requiredDocs.every(doc => data[doc] === true)
  const someExpired = checkExpiries(data)

  if (someExpired) return 'expired'
  if (allApproved) return 'approved'
  return 'under_review'
}
```

### 14.4 Automated Expiry Check

```typescript
// Supabase Edge Function: check-verifications (jalankan via Vercel Cron tiap hari)
// Cek dokumen yang expired atau akan expired dalam 30 hari

export default async function checkVerifications() {
  const thirtyDaysFromNow = addDays(new Date(), 30)

  const { data: expiringSoon } = await supabase
    .from('driver_verifications')
    .select(`
      driver_id,
      sim_expiry,
      stnk_expiry,
      skck_expiry,
      first_aid_expiry,
      profiles!driver_id (full_name)
    `)
    .or(`sim_expiry.lt.${thirtyDaysFromNow.toISOString()},stnk_expiry.lt.${thirtyDaysFromNow.toISOString()}`)

  for (const driver of expiringSoon) {
    await sendNotification({
      userId: driver.driver_id,
      title: 'Dokumen hampir expired!',
      body: 'Salah satu dokumen kamu akan expired dalam 30 hari. Segera perbarui.',
      type: 'verification'
    })

    // Notif ke admin regional
    await notifyRegionalAdmin(driver.driver_id, 'doc_expiring_soon')
  }
}
```

---

## 15. SMART AUTO-DISPATCH

### 15.1 Algoritma

**Scoring untuk setiap driver kandidat:**

```
Score = (proximity_score × 0.40)
      + (rating_score × 0.25)
      + (trips_today_score × 0.15)
      + (vehicle_capacity_score × 0.15)
      + (availability_score × 0.05)
```

**Penjelasan:**
- `proximity_score`: Jarak dari driver ke pickup location (lebih dekat = lebih tinggi)
- `rating_score`: Rating rata-rata driver (normalized 0–1)
- `trips_today_score`: Driver yang sudah banyak trip hari ini diberi skor lebih rendah (distribusi beban)
- `vehicle_capacity_score`: Kapasitas kendaraan cocok dengan pax_count (pas, bukan terlalu besar)
- `availability_score`: Driver yang standby = 1, sedang off = 0

### 15.2 Implementation

```typescript
// supabase/functions/auto-dispatch/index.ts
import { serve } from 'https://deno.land/std@0.177.0/http/server.ts'

serve(async (req) => {
  const { booking_id, region_id } = await req.json()

  const supabase = createClient(...)

  // 1. Ambil detail booking
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, packages(*)')
    .eq('id', booking_id)
    .single()

  // 2. Ambil semua driver yang tersedia di region ini
  const { data: availableDrivers } = await supabase
    .from('profiles')
    .select(`
      id,
      full_name,
      metadata,
      vehicles!driver_id (id, capacity, is_active, is_available),
      driver_locations!driver_id (latitude, longitude, status),
      driver_verifications!driver_id (overall_status)
    `)
    .eq('region_id', region_id)
    .eq('role', 'driver')
    .eq('is_active', true)

  // 3. Filter yang eligible
  const eligible = availableDrivers.filter(driver => {
    const hasValidVehicle = driver.vehicles?.some(v => v.is_active && v.is_available && v.capacity >= booking.pax_count)
    const isVerified = driver.driver_verifications?.overall_status === 'approved'
    const isAvailable = driver.driver_locations?.status !== 'on_trip'
    return hasValidVehicle && isVerified && isAvailable
  })

  if (eligible.length === 0) {
    // Tidak ada driver tersedia, notif admin
    await notifyAdminNoDriver(booking_id, region_id)
    return new Response(JSON.stringify({ success: false, reason: 'no_eligible_driver' }))
  }

  // 4. Score setiap driver
  const scored = await Promise.all(eligible.map(async (driver) => {
    const loc = driver.driver_locations
    const pickupLat = booking.pickup_lat ?? 0
    const pickupLng = booking.pickup_lng ?? 0

    const distance = haversineDistance(
      loc.latitude, loc.longitude,
      pickupLat, pickupLng
    )
    const proximityScore = Math.max(0, 1 - (distance / 100)) // Normalize 0-100km

    const avgRating = await getDriverAvgRating(driver.id)
    const ratingScore = (avgRating - 1) / 4 // Normalize 1-5 ke 0-1

    const tripsToday = await getDriverTripsToday(driver.id)
    const tripsScore = Math.max(0, 1 - (tripsToday / 5)) // Penalize jika > 5 trip

    const vehicle = driver.vehicles.find(v => v.capacity >= booking.pax_count)
    const capacityDiff = vehicle ? vehicle.capacity - booking.pax_count : 10
    const capacityScore = Math.max(0, 1 - (capacityDiff / 10))

    const availabilityScore = loc.status === 'standby' ? 1 : 0.5

    const totalScore = (
      proximityScore * 0.40 +
      ratingScore * 0.25 +
      tripsScore * 0.15 +
      capacityScore * 0.15 +
      availabilityScore * 0.05
    )

    return { driver, vehicle, score: totalScore }
  }))

  // 5. Sort by score dan ambil yang tertinggi
  scored.sort((a, b) => b.score - a.score)
  const best = scored[0]

  // 6. Assign driver ke booking
  await supabase
    .from('bookings')
    .update({
      driver_id: best.driver.id,
      status: 'assigned',
      metadata: { ...booking.metadata, auto_assigned: true, dispatch_score: best.score }
    })
    .eq('id', booking_id)

  // 7. Notif driver via push notification
  await supabase.functions.invoke('send-notification', {
    body: {
      user_id: best.driver.id,
      title: '🚗 Trip baru!',
      body: `Kamu mendapat trip ${booking.packages.name} pada ${booking.trip_date}`,
      data: { booking_id, type: 'new_trip' }
    }
  })

  return new Response(JSON.stringify({
    success: true,
    driver_id: best.driver.id,
    score: best.score
  }))
})

function haversineDistance(lat1, lon1, lat2, lon2) {
  const R = 6371 // km
  const dLat = (lat2 - lat1) * Math.PI / 180
  const dLon = (lon2 - lon1) * Math.PI / 180
  const a = Math.sin(dLat/2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a))
}
```

---

## 16. MARKETING AUTOMATION

### 16.1 Overview

Sistem marketing automation memungkinkan admin upload aset sekali, set jadwal, dan sistem otomatis post ke Instagram, Facebook, TikTok, dan YouTube Shorts tanpa intervensi manual.

### 16.2 Post Queue dengan BullMQ

```typescript
// lib/api/social.ts — Post ke Instagram
import Queue from 'bullmq'
import { Redis } from 'ioredis'

const redis = new Redis(process.env.REDIS_URL!)

export const socialPostQueue = new Queue('social-posts', { connection: redis })

// Worker yang process queue
export const socialPostWorker = new Worker('social-posts', async (job) => {
  const { post_id, platform, asset_url, caption, hashtags } = job.data

  try {
    let platformPostId: string

    switch (platform) {
      case 'instagram':
        platformPostId = await postToInstagram(asset_url, caption, hashtags)
        break
      case 'facebook':
        platformPostId = await postToFacebook(asset_url, caption)
        break
      case 'tiktok':
        platformPostId = await postToTikTok(asset_url, caption, hashtags)
        break
      case 'youtube':
        platformPostId = await postToYouTube(asset_url, caption, hashtags)
        break
    }

    // Update status ke published
    await supabase.from('social_posts').update({
      status: 'published',
      published_at: new Date().toISOString(),
      platform_post_id: platformPostId
    }).eq('id', post_id)

    // Update asset times_posted
    await supabase.from('marketing_assets')
      .update({ times_posted: supabase.rpc('increment', { field: 'times_posted' }), last_posted_at: new Date() })
      .eq('id', job.data.asset_id)

  } catch (error) {
    // Retry logic
    if (job.attemptsMade < 3) {
      throw error // BullMQ akan retry otomatis
    }

    // Setelah 3× gagal, tandai failed dan notif admin
    await supabase.from('social_posts').update({
      status: 'failed',
      error_message: error.message
    }).eq('id', post_id)

    await notifyAdminPostFailed(post_id, platform, error.message)
  }
}, { connection: redis, concurrency: 3 })
```

### 16.3 Scheduler (Vercel Cron)

```typescript
// app/api/cron/process-post-queue/route.ts
// Dijalankan setiap 15 menit via Vercel Cron

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  // Ambil semua post yang scheduled_at <= now dan status = scheduled
  const { data: pendingPosts } = await supabase
    .from('social_posts')
    .select('*')
    .eq('status', 'scheduled')
    .lte('scheduled_at', new Date().toISOString())

  for (const post of pendingPosts) {
    await socialPostQueue.add('post', {
      post_id: post.id,
      asset_id: post.asset_id,
      platform: post.platform,
      asset_url: post.marketing_assets?.public_url,
      caption: buildCaption(post.caption, post.hashtags),
      hashtags: post.hashtags
    }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 15 * 60 * 1000 } // 15 menit antar retry
    })

    await supabase.from('social_posts').update({ status: 'retrying' }).eq('id', post.id)
  }

  return Response.json({ processed: pendingPosts.length })
}
```

### 16.4 Automation Rules

```typescript
// Automation Rule: Driver upload foto → Auto-create draft post
// Trigger via Supabase Database Webhook atau Realtime

const handleDriverMediaUpload = async (media: TripMedia) => {
  // Ambil semua media dari trip ini
  const { data: tripMedia } = await supabase
    .from('trip_media')
    .select('*')
    .eq('booking_id', media.booking_id)
    .eq('is_public', true)

  // Jika sudah ≥ 5 foto, buat draft post otomatis
  if (tripMedia.length >= 5) {
    const { data: booking } = await supabase
      .from('bookings')
      .select('*, packages(*), regions(*)')
      .eq('id', media.booking_id)
      .single()

    const caption = generateBehindScenesCaption(booking)

    // Jadwalkan post untuk jam 19:00 hari ini
    const scheduledAt = setHours(new Date(), 19)

    await supabase.from('social_posts').insert({
      asset_id: null, // Akan gunakan link foto langsung
      platform: 'instagram',
      caption,
      hashtags: generateHashtags(booking.packages.tags, booking.regions.name),
      scheduled_at: scheduledAt,
      status: 'draft',  // Admin perlu approve sebelum publish
      created_by: media.driver_id
    })

    // Notif admin untuk review
    await notifyAdmin('new_auto_draft', { booking_id: media.booking_id })
  }
}
```

### 16.5 Platform APIs

```typescript
// POST ke Instagram (Meta Graph API)
async function postToInstagram(imageUrl: string, caption: string, hashtags: string[]) {
  const fullCaption = `${caption}\n\n${hashtags.join(' ')}`

  // Step 1: Create container
  const containerRes = await fetch(
    `https://graph.facebook.com/v18.0/${process.env.META_IG_ACCOUNT_ID}/media`,
    {
      method: 'POST',
      body: new URLSearchParams({
        image_url: imageUrl,
        caption: fullCaption,
        access_token: process.env.META_PAGE_ACCESS_TOKEN!
      })
    }
  )
  const { id: containerId } = await containerRes.json()

  // Step 2: Publish
  const publishRes = await fetch(
    `https://graph.facebook.com/v18.0/${process.env.META_IG_ACCOUNT_ID}/media_publish`,
    {
      method: 'POST',
      body: new URLSearchParams({
        creation_id: containerId,
        access_token: process.env.META_PAGE_ACCESS_TOKEN!
      })
    }
  )
  const { id: postId } = await publishRes.json()
  return postId
}

// POST ke TikTok (TikTok Content Posting API)
async function postToTikTok(videoUrl: string, caption: string, hashtags: string[]) {
  const res = await fetch('https://open.tiktokapis.com/v2/post/publish/video/init/', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${process.env.TIKTOK_ACCESS_TOKEN}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      post_info: {
        title: `${caption.substring(0, 150)} ${hashtags.join(' ')}`,
        privacy_level: 'PUBLIC_TO_EVERYONE',
        disable_duet: false,
        disable_comment: false,
        disable_stitch: false
      },
      source_info: {
        source: 'PULL_FROM_URL',
        video_url: videoUrl
      }
    })
  })
  const { data } = await res.json()
  return data.publish_id
}
```

---

## 17. AI CUSTOMER SERVICE AGENT

### 17.1 Overview

AI Agent berbasis Claude API yang handle pesan masuk di WhatsApp Business dan Instagram DM secara otomatis 24/7.

**Target:** 93%+ conversation resolved tanpa intervensi admin.

### 17.2 RAG (Retrieval Augmented Generation)

```typescript
// lib/api/claude.ts
import Anthropic from '@anthropic-ai/sdk'

const claude = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

export async function getAIResponse(
  userMessage: string,
  conversationHistory: Message[],
  clientContext?: {
    booking_id?: string
    client_name?: string
    language?: 'id' | 'en'
  }
) {
  // 1. Embed pertanyaan user
  const embedding = await getEmbedding(userMessage)

  // 2. Cari knowledge base yang relevan (vector similarity)
  const { data: relevantKB } = await supabase.rpc('match_knowledge_base', {
    query_embedding: embedding,
    match_threshold: 0.78,
    match_count: 5
  })

  // 3. Ambil konteks booking jika ada
  let bookingContext = ''
  if (clientContext?.booking_id) {
    const { data: booking } = await supabase
      .from('bookings')
      .select('*, packages(*), profiles!driver_id(full_name), driver_locations!driver_id(latitude, longitude, status)')
      .eq('id', clientContext.booking_id)
      .single()

    if (booking) {
      bookingContext = `
BOOKING AKTIF KLIEN:
- Kode: ${booking.booking_code}
- Paket: ${booking.packages.name}
- Tanggal: ${booking.trip_date}
- Pickup: ${booking.pickup_time} di ${booking.pickup_location}
- Jumlah pax: ${booking.pax_count}
- Driver: ${booking.profiles?.full_name ?? 'Belum di-assign'}
- Status: ${booking.status}
- Total bayar: Rp ${booking.grand_total.toLocaleString('id-ID')}
`
    }
  }

  // 4. Build system prompt
  const systemPrompt = `
Kamu adalah asisten customer service untuk platform wisata Jeda Wisata. 
Nama kamu adalah "Jeda Wisata AI" dan kamu bertugas membantu klien dengan ramah dan profesional.

ATURAN PENTING:
1. Jawab dalam bahasa yang sama dengan klien (${clientContext?.language === 'en' ? 'English' : 'Bahasa Indonesia'})
2. JANGAN pernah share nomor HP driver atau tim internal
3. Jika klien komplain aktif, minta maaf dan escalate ke admin
4. Jika pertanyaan tentang negosiasi harga grup > 10 pax, escalate ke admin
5. Selalu sebut nama klien jika diketahui (${clientContext?.client_name ?? 'tidak diketahui'})
6. Respons singkat dan jelas, maksimal 3 paragraf
7. Jika tidak yakin dengan jawabannya, jangan mengarang — escalate ke admin

KONTEKS KLIEN:
${bookingContext}

KNOWLEDGE BASE YANG RELEVAN:
${relevantKB?.map(kb => kb.content).join('\n\n---\n\n') ?? 'Tidak ada data spesifik'}

Jika kamu perlu escalate, akhiri dengan format:
[ESCALATE: alasan singkat]
`

  // 5. Call Claude API
  const response = await claude.messages.create({
    model: 'claude-sonnet-4-5',
    max_tokens: 500,
    system: systemPrompt,
    messages: [
      ...conversationHistory.slice(-10).map(m => ({
        role: m.role as 'user' | 'assistant',
        content: m.content
      })),
      { role: 'user', content: userMessage }
    ]
  })

  const responseText = response.content[0].type === 'text'
    ? response.content[0].text
    : ''

  // 6. Cek apakah perlu escalate
  const needsEscalation = responseText.includes('[ESCALATE:')
  const escalationReason = needsEscalation
    ? responseText.match(/\[ESCALATE: (.+?)\]/)?.[1]
    : null

  return {
    text: responseText.replace(/\[ESCALATE: .+?\]/g, '').trim(),
    needs_escalation: needsEscalation,
    escalation_reason: escalationReason,
    tokens_used: response.usage.input_tokens + response.usage.output_tokens
  }
}

// Vector similarity search function di Supabase
// Jalankan SQL ini:
/*
CREATE OR REPLACE FUNCTION match_knowledge_base(
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
RETURNS TABLE (
  id uuid,
  content text,
  category text,
  similarity float
)
LANGUAGE sql STABLE AS $$
  SELECT
    id,
    content,
    category,
    1 - (embedding <=> query_embedding) AS similarity
  FROM knowledge_base
  WHERE is_active = true
    AND 1 - (embedding <=> query_embedding) > match_threshold
  ORDER BY embedding <=> query_embedding
  LIMIT match_count;
$$;
*/
```

### 17.3 WhatsApp Webhook

```typescript
// app/api/webhook/whatsapp/route.ts

export async function GET(request: Request) {
  // Verify webhook (Meta requires this)
  const { searchParams } = new URL(request.url)
  const mode = searchParams.get('hub.mode')
  const token = searchParams.get('hub.verify_token')
  const challenge = searchParams.get('hub.challenge')

  if (mode === 'subscribe' && token === process.env.WHATSAPP_WEBHOOK_VERIFY_TOKEN) {
    return new Response(challenge, { status: 200 })
  }
  return new Response('Forbidden', { status: 403 })
}

export async function POST(request: Request) {
  const body = await request.json()
  
  // Verify signature dari Meta
  const signature = request.headers.get('x-hub-signature-256')
  if (!verifyMetaSignature(JSON.stringify(body), signature)) {
    return new Response('Unauthorized', { status: 401 })
  }

  const entry = body.entry?.[0]
  const changes = entry?.changes?.[0]
  const value = changes?.value
  const message = value?.messages?.[0]

  if (!message) return Response.json({ ok: true })

  const from = message.from              // WA number klien
  const messageText = message.text?.body
  const phoneNumberId = value.metadata?.phone_number_id

  // Cari atau buat conversation
  let { data: conversation } = await supabase
    .from('ai_conversations')
    .select('*, ai_messages(*)')
    .eq('channel', 'whatsapp')
    .eq('channel_user_id', from)
    .eq('status', 'active')
    .order('created_at', { ascending: false })
    .limit(1)
    .single()

  if (!conversation) {
    const { data: newConv } = await supabase
      .from('ai_conversations')
      .insert({
        channel: 'whatsapp',
        channel_user_id: from,
        status: 'active'
      })
      .select()
      .single()
    conversation = newConv
  }

  // Insert pesan user
  await supabase.from('ai_messages').insert({
    conversation_id: conversation.id,
    role: 'user',
    content: messageText,
    is_ai_generated: false
  })

  // Cari booking aktif klien
  const clientProfile = await findClientByWANumber(from)
  const activeBooking = clientProfile
    ? await getActiveBooking(clientProfile.id)
    : null

  // Get AI response
  const history = conversation.ai_messages ?? []
  const aiResponse = await getAIResponse(
    messageText,
    history,
    {
      booking_id: activeBooking?.id,
      client_name: clientProfile?.full_name,
      language: detectLanguage(messageText)
    }
  )

  // Insert respons AI
  await supabase.from('ai_messages').insert({
    conversation_id: conversation.id,
    role: 'assistant',
    content: aiResponse.text,
    intent: detectIntent(messageText),
    is_ai_generated: true,
    tokens_used: aiResponse.tokens_used
  })

  // Handle escalation
  if (aiResponse.needs_escalation) {
    await supabase.from('ai_conversations').update({
      status: 'escalated',
      escalation_reason: aiResponse.escalation_reason
    }).eq('id', conversation.id)

    await notifyAdminEscalation(conversation.id, aiResponse.escalation_reason)
  }

  // Kirim reply ke WhatsApp
  await sendWhatsAppMessage(from, phoneNumberId, aiResponse.text)

  return Response.json({ ok: true })
}

async function sendWhatsAppMessage(to: string, phoneNumberId: string, text: string) {
  await fetch(
    `https://graph.facebook.com/v18.0/${phoneNumberId}/messages`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        recipient_type: 'individual',
        to,
        type: 'text',
        text: { body: text }
      })
    }
  )
}
```

---

## 18. REVENUE & PAYMENT SYSTEM

### 18.1 Midtrans (IDR)

```typescript
// lib/api/midtrans.ts
import midtransClient from 'midtrans-client'

const snap = new midtransClient.Snap({
  isProduction: process.env.MIDTRANS_IS_PRODUCTION === 'true',
  serverKey: process.env.MIDTRANS_SERVER_KEY,
  clientKey: process.env.MIDTRANS_CLIENT_KEY
})

export async function createMidtransPayment(booking: Booking) {
  const parameter = {
    transaction_details: {
      order_id: booking.booking_code,
      gross_amount: booking.grand_total
    },
    customer_details: {
      first_name: booking.profiles.full_name,
      email: booking.profiles.email,
      phone: booking.profiles.phone
    },
    item_details: [
      {
        id: booking.package_id,
        price: booking.grand_total,
        quantity: 1,
        name: booking.packages.name
      }
    ],
    expiry: {
      unit: 'hours',
      duration: 2             // Expire dalam 2 jam
    }
  }

  const transaction = await snap.createTransaction(parameter)
  
  // Simpan order ID ke booking
  await supabase.from('bookings').update({
    midtrans_order_id: booking.booking_code,
    payment_method: 'midtrans_snap'
  }).eq('id', booking.id)

  return {
    token: transaction.token,
    redirect_url: transaction.redirect_url
  }
}
```

### 18.2 Midtrans Webhook

```typescript
// app/api/webhook/midtrans/route.ts

export async function POST(request: Request) {
  const body = await request.json()
  
  // Verify signature
  const expectedSignature = crypto
    .createHash('sha512')
    .update(`${body.order_id}${body.status_code}${body.gross_amount}${process.env.MIDTRANS_SERVER_KEY}`)
    .digest('hex')

  if (body.signature_key !== expectedSignature) {
    return new Response('Invalid signature', { status: 401 })
  }

  const { order_id, transaction_status, fraud_status } = body

  // Mapping status
  let bookingStatus: string | null = null
  let paymentStatus: string | null = null

  if (transaction_status === 'capture' && fraud_status === 'accept') {
    bookingStatus = 'confirmed'
    paymentStatus = 'paid'
  } else if (transaction_status === 'settlement') {
    bookingStatus = 'confirmed'
    paymentStatus = 'paid'
  } else if (['cancel', 'deny', 'expire'].includes(transaction_status)) {
    bookingStatus = 'cancelled'
    paymentStatus = 'failed'
  }

  if (bookingStatus) {
    const { data: booking } = await supabase
      .from('bookings')
      .update({
        status: bookingStatus,
        payment_status: paymentStatus
      })
      .eq('booking_code', order_id)
      .select('*, profiles!client_id(*), packages(*)')
      .single()

    if (bookingStatus === 'confirmed') {
      // Record revenue transaction
      await supabase.from('transactions').insert({
        region_id: booking.region_id,
        booking_id: booking.id,
        type: 'income',
        category: 'revenue',
        amount: booking.grand_total,
        description: `Booking ${booking.booking_code} — ${booking.packages.name}`,
        reference_id: order_id,
        transaction_date: new Date().toISOString().split('T')[0]
      })

      // Trigger auto-dispatch
      await supabase.functions.invoke('auto-dispatch', {
        body: { booking_id: booking.id, region_id: booking.region_id }
      })

      // Notif klien
      await sendBookingConfirmationEmail(booking)
      await sendWhatsAppMessage(
        booking.profiles.phone,
        process.env.WHATSAPP_PHONE_NUMBER_ID,
        `Halo ${booking.profiles.full_name}! Booking kamu untuk ${booking.packages.name} pada ${booking.trip_date} sudah CONFIRMED ✅. Kode booking: ${booking.booking_code}`
      )
    }
  }

  return Response.json({ ok: true })
}
```

### 18.3 Stripe (Internasional)

```typescript
// lib/api/stripe.ts
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2023-10-16' })

export async function createStripeSession(
  booking: Booking,
  currency: 'usd' | 'aud' | 'eur'
) {
  // Convert IDR ke currency tujuan
  const exchangeRate = await getExchangeRate('IDR', currency.toUpperCase())
  const amountInCents = Math.round((booking.grand_total / exchangeRate) * 100)

  const session = await stripe.checkout.sessions.create({
    payment_method_types: ['card'],
    mode: 'payment',
    currency,
    line_items: [{
      price_data: {
        currency,
        unit_amount: amountInCents,
        product_data: {
          name: booking.packages.name,
          description: `Trip date: ${booking.trip_date} | ${booking.pax_count} pax`,
          images: [booking.packages.cover_image_url]
        }
      },
      quantity: 1
    }],
    metadata: {
      booking_id: booking.id,
      booking_code: booking.booking_code
    },
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/my-bookings/${booking.id}?success=true`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/packages/${booking.packages.slug}?cancelled=true`,
    expires_at: Math.floor(Date.now() / 1000) + 7200 // 2 jam
  })

  await supabase.from('bookings').update({
    stripe_session_id: session.id,
    currency: currency.toUpperCase()
  }).eq('id', booking.id)

  return session
}
```

---

## 19. AFFILIATE & PARTNER PROGRAM

### 19.1 Cara Kerja

1. Mitra daftar → sistem generate `referral_code` unik (contoh: `BUDI-BLOG-X7K2`)
2. Mitra share link: `https://jedawisata.id/packages?ref=BUDI-BLOG-X7K2`
3. Klien booking via link tersebut → `affiliate_code` disimpan di booking
4. Setelah trip selesai → komisi otomatis dihitung
5. Mitra lihat dashboard tracking: clicks, conversions, earnings

### 19.2 Implementation

```typescript
// Simpan affiliate code ke booking (dari URL param)
// app/(marketplace)/packages/[slug]/page.tsx
const searchParams = useSearchParams()
const affiliateCode = searchParams.get('ref')

// Saat buat booking
await createBooking({ ...formData, affiliate_code: affiliateCode })

// Hitung dan record komisi setelah trip selesai
// Trigger: booking status berubah ke 'completed'
const processAffiliateCommission = async (bookingId: string) => {
  const { data: booking } = await supabase
    .from('bookings')
    .select('*, affiliates!affiliate_code(*)')
    .eq('id', bookingId)
    .not('affiliate_code', 'is', null)
    .single()

  if (!booking?.affiliates) return

  const commission = Math.round(booking.grand_total * booking.affiliates.commission_rate)

  // Tambah ke total_earned affiliate
  await supabase.from('affiliates').update({
    total_referrals: supabase.rpc('increment'),
    total_earned: supabase.rpc('increment_by', { amount: commission })
  }).eq('referral_code', booking.affiliate_code)

  // Record transaksi
  await supabase.from('transactions').insert({
    type: 'expense',
    category: 'affiliate_commission',
    amount: commission,
    description: `Komisi afiliasi ${booking.affiliate_code} — booking ${booking.booking_code}`,
    reference_id: booking.affiliate_code,
    transaction_date: new Date().toISOString().split('T')[0]
  })
}
```

---

## 20. CRISIS MANAGEMENT SYSTEM

### 20.1 Skenario & Respons

| Skenario | Severity | Respons Otomatis |
|----------|----------|------------------|
| Driver sakit mendadak | High | Alert admin, cari driver pengganti via auto-dispatch |
| Armada mogok | High | Alert admin + klien, cari armada cadangan |
| Cuaca ekstrem (peringatan BMKG) | Medium | Alert regional admin, jadwal ulang optional |
| Klien kecelakaan/sakit | Critical | Alert super admin, hubungi emergency contact |
| Akses jalan ditutup | Medium | Update rute, notif klien |

### 20.2 Crisis API

```typescript
// POST /api/admin/crisis
const reportCrisis = async (crisis: CreateCrisisPayload) => {
  const { data: event } = await supabase.from('crisis_events').insert({
    region_id: crisis.region_id,
    booking_id: crisis.booking_id,
    driver_id: crisis.driver_id,
    crisis_type: crisis.type,
    severity: crisis.severity,
    title: crisis.title,
    description: crisis.description,
    reported_by: currentUserId,
    status: 'open'
  }).select().single()

  // Notifikasi berdasarkan severity
  if (crisis.severity === 'critical') {
    // Hubungi super admin SEMUA channel
    await Promise.all([
      notifyUser(superAdminId, 'push', event),
      sendSMS(superAdminPhone, `CRITICAL: ${crisis.title}`),
      sendEmail(superAdminEmail, 'Crisis Alert', renderCrisisEmail(event))
    ])
  } else if (crisis.severity === 'high') {
    // Notif super admin + regional admin
    await notifyAdmins(event)
  }

  // Jika ada booking yang affected, notif klien
  if (crisis.booking_id && crisis.client_notified === false) {
    const { data: booking } = await supabase
      .from('bookings')
      .select('*, profiles!client_id(*)')
      .eq('id', crisis.booking_id)
      .single()

    const clientMessage = generateClientCrisisMessage(crisis, booking)
    await sendWhatsAppMessage(booking.profiles.phone, process.env.WHATSAPP_PHONE_NUMBER_ID, clientMessage)

    await supabase.from('crisis_events').update({ client_notified: true }).eq('id', event.id)
  }

  // Jika driver sakit, cari pengganti
  if (crisis.type === 'driver_sick' && crisis.booking_id) {
    await supabase.functions.invoke('auto-dispatch', {
      body: {
        booking_id: crisis.booking_id,
        exclude_driver_id: crisis.driver_id,
        is_replacement: true
      }
    })
  }

  return event
}
```

---

## 21. NOTIFICATION SYSTEM

### 21.1 Channels

```
Push notification  → Expo push (driver app) + Web Push (PWA marketplace)
Email              → Resend (booking confirmation, reminder, receipt)
WhatsApp           → WA Business API (booking updates, trip start, payment)
SMS                → Twilio (fallback untuk kasus kritis)
In-app             → Supabase Realtime (badge count, dropdown notif)
```

### 21.2 Notification Templates

```typescript
// Booking confirmed
const TEMPLATES = {
  booking_confirmed: {
    whatsapp: (booking) => `
Halo ${booking.client_name}! 🎉

Booking kamu SUDAH DIKONFIRMASI!

📋 Detail Trip:
• Paket: ${booking.package_name}
• Tanggal: ${booking.trip_date}
• Pickup: ${booking.pickup_time} di ${booking.pickup_location}
• Jumlah pax: ${booking.pax_count}
• Kode booking: ${booking.booking_code}

Driver kamu akan diinfokan H-1 sebelum trip.

Track trip kamu live di: ${APP_URL}/my-bookings/${booking.id}

Pertanyaan? Balas pesan ini 😊
    `,
    email: (booking) => ({
      subject: `Booking dikonfirmasi — ${booking.package_name}`,
      template: 'booking-confirmed',  // Resend template ID
      data: booking
    })
  },

  trip_started: {
    whatsapp: (booking) => `
Trip kamu SUDAH DIMULAI! 🚗

Driver: ${booking.driver_name}
Sedang menuju pickup location...

Track posisi driver live:
${APP_URL}/real-trip-maps

Semoga perjalanan menyenangkan! 🌄
    `
  },

  driver_assigned: {
    push: (booking) => ({
      title: '🚗 Driver sudah di-assign!',
      body: `${booking.driver_name} akan menjemput kamu pada ${booking.pickup_time}`,
      data: { booking_id: booking.id, type: 'driver_assigned' }
    })
  }
}
```

### 21.3 Notification Service

```typescript
// lib/utils/notifications.ts
export async function sendNotification(params: {
  userId: string
  title: string
  body: string
  type: string
  data?: Record<string, any>
  channels?: ('push' | 'email' | 'whatsapp' | 'sms')[]
}) {
  // Simpan ke database
  await supabase.from('notifications').insert({
    user_id: params.userId,
    title: params.title,
    body: params.body,
    type: params.type,
    data: params.data ?? {},
    channel: (params.channels ?? ['push']).join(',')
  })

  const { data: profile } = await supabase
    .from('profiles')
    .select('metadata, phone, email')
    .eq('id', params.userId)
    .single()

  const channels = params.channels ?? ['push']

  if (channels.includes('push') && profile?.metadata?.push_token) {
    await sendExpoPushNotification(profile.metadata.push_token, params.title, params.body, params.data)
  }

  if (channels.includes('whatsapp') && profile?.phone) {
    await sendWhatsAppMessage(profile.phone, process.env.WHATSAPP_PHONE_NUMBER_ID, `${params.title}\n\n${params.body}`)
  }

  if (channels.includes('email') && profile?.email) {
    await resend.emails.send({
      from: process.env.EMAIL_FROM!,
      to: profile.email,
      subject: params.title,
      text: params.body
    })
  }

  if (channels.includes('sms') && profile?.phone) {
    await twilioClient.messages.create({
      body: `${params.title}: ${params.body}`,
      from: process.env.TWILIO_PHONE_NUMBER,
      to: profile.phone
    })
  }
}
```

---

## 22. FILE & MEDIA STORAGE

### 22.1 Supabase Storage Buckets

```sql
-- Buat buckets di Supabase
-- (Lakukan via Supabase Dashboard atau SQL)

-- Bucket untuk foto/video trip (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('trip-media', 'trip-media', true);

-- Bucket untuk aset marketing (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('marketing-assets', 'marketing-assets', true);

-- Bucket untuk dokumen verifikasi driver (private)
INSERT INTO storage.buckets (id, name, public)
VALUES ('driver-documents', 'driver-documents', false);

-- Bucket untuk foto profil (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true);

-- Bucket untuk foto paket wisata (public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('package-images', 'package-images', true);
```

### 22.2 Storage Policies

```sql
-- Trip media: driver bisa upload, semua bisa read
CREATE POLICY "trip_media_driver_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'trip-media'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );

CREATE POLICY "trip_media_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'trip-media');

-- Driver documents: hanya admin yang bisa read
CREATE POLICY "driver_docs_admin_read" ON storage.objects
  FOR SELECT USING (
    bucket_id = 'driver-documents'
    AND (
      (SELECT role FROM profiles WHERE id = auth.uid()) IN ('super_admin', 'regional_admin')
      OR (storage.foldername(name))[1] = auth.uid()::text
    )
  );

-- Driver bisa upload dokumen sendiri
CREATE POLICY "driver_docs_self_upload" ON storage.objects
  FOR INSERT WITH CHECK (
    bucket_id = 'driver-documents'
    AND (storage.foldername(name))[1] = auth.uid()::text
  );
```

### 22.3 Folder Structure di Storage

```
trip-media/
  {booking_id}/
    {timestamp}.jpg
    {timestamp}.mp4
    ...

marketing-assets/
  jogja/
    {filename}
  bali/
    {filename}
  global/
    {filename}

driver-documents/
  {driver_id}/
    ktp_latest.jpg
    sim_latest.jpg
    skck_latest.jpg
    ...

avatars/
  {user_id}/
    avatar.jpg

package-images/
  {package_id}/
    cover.jpg
    gallery_1.jpg
    gallery_2.jpg
    ...
```

---

## 23. API ROUTES REFERENCE

### 23.1 Admin Routes

```
POST   /api/admin/dispatch/assign          Assign driver ke booking
POST   /api/admin/dispatch/auto            Trigger auto-dispatch untuk region
GET    /api/admin/analytics/hq             HQ dashboard data
GET    /api/admin/analytics/region/:id     Regional analytics
GET    /api/admin/trips                    List semua trips (dengan filter)
GET    /api/admin/trips/:id                Detail trip
PUT    /api/admin/trips/:id                Update trip (status, driver, dll)
GET    /api/admin/team                     List semua tim lapangan
POST   /api/admin/team                     Tambah anggota tim baru
PUT    /api/admin/team/:id                 Update anggota tim
GET    /api/admin/fleet                    List armada
POST   /api/admin/fleet                    Tambah kendaraan
PUT    /api/admin/fleet/:id                Update kendaraan
GET    /api/admin/finance/transactions     List transaksi
POST   /api/admin/finance/transactions     Catat transaksi baru
GET    /api/admin/finance/pl               P&L report per region
GET    /api/admin/payroll                  List payroll
POST   /api/admin/payroll/process          Proses penggajian
GET    /api/admin/packages                 List paket
POST   /api/admin/packages                 Buat paket baru
PUT    /api/admin/packages/:id             Edit paket
DELETE /api/admin/packages/:id             Hapus/nonaktifkan paket
GET    /api/admin/pricing/rules            List pricing rules
POST   /api/admin/pricing/rules            Buat pricing rule
PUT    /api/admin/pricing/rules/:id        Update pricing rule
DELETE /api/admin/pricing/rules/:id        Hapus pricing rule
GET    /api/admin/verification             List driver verifications
PUT    /api/admin/verification/:driverId   Update verification status
GET    /api/admin/crisis                   List crisis events
POST   /api/admin/crisis                   Laporkan crisis
PUT    /api/admin/crisis/:id               Update/resolve crisis
GET    /api/admin/marketing/assets         List marketing assets
POST   /api/admin/marketing/assets         Upload asset baru
GET    /api/admin/marketing/posts          List scheduled posts
POST   /api/admin/marketing/posts          Buat/schedule post
PUT    /api/admin/marketing/posts/:id      Update post
DELETE /api/admin/marketing/posts/:id      Hapus post dari queue
POST   /api/admin/marketing/posts/:id/publish  Publish immediately
```

### 23.2 Marketplace Routes

```
GET    /api/marketplace/packages           List paket (public, dengan filter)
GET    /api/marketplace/packages/:slug     Detail paket
GET    /api/marketplace/packages/:id/price Kalkulasi harga dinamis
GET    /api/marketplace/destinations       List destinasi
POST   /api/marketplace/booking/create     Buat booking baru
GET    /api/marketplace/booking/:id        Detail booking (auth required)
GET    /api/marketplace/bookings           Semua booking user (auth required)
POST   /api/marketplace/payment/midtrans   Init Midtrans payment
POST   /api/marketplace/payment/stripe     Init Stripe session
GET    /api/marketplace/reviews/:packageId List reviews paket
POST   /api/marketplace/reviews            Submit review (auth required)
GET    /api/marketplace/real-trip-maps     List active drivers untuk peta
GET    /api/marketplace/media/:bookingId   Foto/video dari booking (auth required)
POST   /api/marketplace/media/purchase     Beli foto digital
GET    /api/marketplace/membership         Status membership user
POST   /api/marketplace/membership/subscribe Subscribe membership
GET    /api/marketplace/points             Reward points user
```

### 23.3 Driver Routes

```
GET    /api/driver/profile                 Profil driver
GET    /api/driver/trips                   Trip yang di-assign
GET    /api/driver/trips/today             Trip hari ini
GET    /api/driver/trips/:id               Detail trip
PUT    /api/driver/trips/:id/status        Update status trip
POST   /api/driver/location               Update lokasi GPS
DELETE /api/driver/location               Stop GPS sharing
POST   /api/driver/media                  Upload foto/video
GET    /api/driver/earnings               Pendapatan & komisi
GET    /api/driver/payroll                Riwayat payroll
GET    /api/driver/notifications          Notifikasi driver
```

### 23.4 AI Routes

```
POST   /api/ai/chat                        Chat dengan AI (web live chat)
GET    /api/ai/conversations               List conversations (admin)
GET    /api/ai/conversations/:id           Detail conversation (admin)
PUT    /api/ai/conversations/:id/escalate  Escalate ke admin
PUT    /api/ai/conversations/:id/resolve   Resolve conversation
POST   /api/ai/knowledge                   Tambah knowledge base entry
PUT    /api/ai/knowledge/:id               Update KB entry
DELETE /api/ai/knowledge/:id               Hapus KB entry
GET    /api/ai/analytics                   Performa AI agent
```

### 23.5 Webhook Routes

```
POST   /api/webhook/midtrans              Midtrans payment notification
POST   /api/webhook/stripe                Stripe payment webhook
POST   /api/webhook/whatsapp              WhatsApp incoming message
GET    /api/webhook/whatsapp              WhatsApp webhook verification
POST   /api/webhook/instagram             Instagram DM webhook
GET    /api/webhook/instagram             Instagram webhook verification
```

### 23.6 Cron Routes (Vercel Cron)

```
GET    /api/cron/process-post-queue       Process scheduled social media posts
GET    /api/cron/check-verifications      Check expired driver documents
GET    /api/cron/send-trip-reminders      Kirim reminder H-1 ke klien & driver
GET    /api/cron/process-payroll          Trigger penggajian otomatis bulanan
GET    /api/cron/expire-memberships       Nonaktifkan membership yang expired
GET    /api/cron/fetch-post-analytics     Update analytics dari platform sosmed
```

---

## 24. COMPONENT LIBRARY

### 24.1 Design Tokens

```typescript
// packages/ui-tokens/colors.ts
export const colors = {
  primary: {
    50:  '#E8F5F1',
    100: '#C5E8DC',
    200: '#9DD8C3',
    300: '#6DC5A6',
    400: '#3DAF86',
    500: '#0F6E56',  // Primary brand
    600: '#0C5A46',
    700: '#094538',
    800: '#06302A',
    900: '#0B2D2A',  // Dark BG
  },
  teal: {
    400: '#5DCAA5',  // Mint (accent)
    500: '#1D9E75',  // Teal (secondary)
  },
  semantic: {
    success: '#1D9E75',
    warning: '#BA7517',
    error:   '#A32D2D',
    info:    '#185FA5',
  }
}
```

### 24.2 Key Components

```typescript
// RegionBadge — tampilkan nama region dengan warna
<RegionBadge region="bali" />
// → <span className="bg-purple-100 text-purple-800 ...">Bali</span>

// BookingStatusBadge — status booking dengan warna
<BookingStatusBadge status="confirmed" />
// → <span className="bg-green-100 text-green-800 ...">Confirmed</span>

// PriceDisplay — tampilkan harga dengan format IDR
<PriceDisplay amount={1200000} currency="IDR" showMultiplier multiplierLabel="Weekend +15%" />
// → "Rp 1.380.000 /pax" + badge "Weekend +15%"

// LiveBadge — animated pulse untuk "LIVE"
<LiveBadge count={47} label="driver aktif" />
// → "● 47 driver aktif" dengan pulse animation

// TripTimeline — progress tracker trip
<TripTimeline steps={tripSteps} currentStep={3} />

// DriverPinMarker — custom marker untuk Mapbox
const createDriverPin = (driver: DriverPin) => {
  const el = document.createElement('div')
  el.className = 'driver-pin'
  el.innerHTML = `<div class="pin-pulse" style="background: ${regionColor(driver.region)}40"></div>
                  <div class="pin-circle" style="background: ${regionColor(driver.region)}">🚗</div>
                  <div class="pin-label">${driver.full_name}</div>`
  return el
}
```

---

## 25. BUILD PHASES & MILESTONES

### 25.1 Phase 1 — Admin System + Security (Bulan 1–3)

**Sprint 1 (2 minggu): Database & Auth Foundation**
- [ ] Setup Supabase project + semua tables
- [ ] Konfigurasi RLS policies (WAJIB sebelum lanjut)
- [ ] Auth flow (login, register, role middleware)
- [ ] Generate TypeScript types dari Supabase

**Sprint 2 (2 minggu): Admin Core**
- [ ] Admin layout (sidebar, topbar, auth guard)
- [ ] HQ Dashboard + realtime feed
- [ ] Trip management CRUD
- [ ] Booking table + filter

**Sprint 3 (2 minggu): Team, Fleet, Finance**
- [ ] Team management (CRUD + status)
- [ ] Fleet management (CRUD + BBM tracking)
- [ ] Finance transactions + P&L view
- [ ] Payroll management

**Sprint 4 (2 minggu): Package, Pricing, Security**
- [ ] Package management CRUD (termasuk itinerary builder)
- [ ] Dynamic pricing engine + admin UI
- [ ] Driver verification system
- [ ] CRM dasar (list conversations)

**Sprint 5 (1 minggu): Testing & Security Audit**
- [ ] RLS audit (pastikan tidak ada data leak antar region)
- [ ] Load testing admin panel
- [ ] Internal soft launch dengan tim lapangan 5 region

---

### 25.2 Phase 2 — Marketplace + Revenue (Bulan 3–6)

**Sprint 6–7: Marketplace Core**
- [ ] Homepage + package listing
- [ ] Package detail + booking form
- [ ] Dynamic price calculation (realtime)
- [ ] Checkout flow + Midtrans integration
- [ ] Midtrans webhook + booking confirmation

**Sprint 8: Real Trip Maps**
- [ ] Mapbox GL integration
- [ ] Realtime GPS subscription
- [ ] Driver pin markers + popup
- [ ] Media feed (foto/video dari trip)
- [ ] GPS fallback jika Realtime down

**Sprint 9: Client Portal**
- [ ] My Bookings (list + detail)
- [ ] Trip tracker (status timeline)
- [ ] Live GPS embed di detail booking
- [ ] Review & rating submission

**Sprint 10: Revenue Expansion**
- [ ] Stripe integration (USD/AUD/EUR)
- [ ] Foto digital marketplace
- [ ] Membership system
- [ ] Affiliate tracking (ref= parameter)
- [ ] UGC review aktif (post-trip flow)

---

### 25.3 Phase 3 — Automation + Growth (Bulan 6–9)

**Sprint 11–12: Marketing Automation**
- [ ] Marketing asset library
- [ ] Post composer + caption templates
- [ ] Content calendar UI
- [ ] BullMQ queue setup
- [ ] Instagram + Facebook auto-post
- [ ] TikTok auto-post
- [ ] YouTube auto-post
- [ ] Post queue + retry system

**Sprint 13: Smart Auto-Dispatch**
- [ ] Auto-dispatch algorithm (scoring)
- [ ] Supabase Edge Function deployment
- [ ] Admin override UI
- [ ] Dispatch map (Mapbox)

**Sprint 14: Growth Features**
- [ ] Affiliate dashboard
- [ ] Crisis management system
- [ ] React Native driver app — setup Expo project
- [ ] Driver app: auth, home screen, trip list
- [ ] Driver app: GPS background tracking
- [ ] Driver app: media upload

---

### 25.4 Phase 4 — AI + Resilience (Bulan 9–12+)

**Sprint 15–16: AI Agent**
- [ ] Knowledge base CRUD + embedding pipeline
- [ ] Claude API integration
- [ ] WhatsApp webhook + AI responder
- [ ] Instagram DM webhook + AI responder
- [ ] Conversation management (escalation, resolve)
- [ ] Admin takeover mode
- [ ] AI analytics dashboard

**Sprint 17: Driver App Finalisasi**
- [ ] Driver app: push notifications
- [ ] Driver app: chat dengan klien & admin
- [ ] Driver app: earnings dashboard
- [ ] Driver app: offline mode
- [ ] Expo EAS Build + App Store/Play Store submission

**Sprint 18: Resilience & Compliance**
- [ ] B2B corporate trip module
- [ ] UU PDP compliance (consent management)
- [ ] GPS realtime fallback (REST polling)
- [ ] Payment monitoring + reconciliation
- [ ] Full security audit
- [ ] Penetration testing
- [ ] Performance optimization (Core Web Vitals)

---

### 25.5 Milestone Checklist

```
□ M1 — Bln 1  : RLS & database schema final + diaudit
□ M2 — Bln 2  : Driver verifikasi + dynamic pricing aktif
□ M3 — Bln 3  : Admin panel full + internal soft launch 5 region
□ M4 — Bln 5  : Public marketplace launch + Real Trip Maps live
□ M5 — Bln 6  : Stripe internasional + foto digital + membership
□ M6 — Bln 8  : Marketing automation + auto-dispatch live
□ M7 — Bln 9  : Native driver app beta (Jogja & Bali)
□ M8 — Bln 11 : AI agent live di WA & IG DM
□ M9 — Bln 12 : Native driver app full launch semua region
□ M10 — Bln 14: Full platform + B2B + compliance audit selesai
```

---

## CATATAN PENTING UNTUK AI CODING ASSISTANT

Saat menggunakan dokumen ini untuk vibe coding, perhatikan hal-hal berikut:

**1. Jangan pernah skip RLS.**
RLS adalah fondasi keamanan. Setiap tabel baru yang dibuat harus langsung dikonfigurasi RLS-nya. Jangan tunggu nanti.

**2. Gunakan Supabase client yang benar.**
- `createBrowserClient` → untuk Client Components (`'use client'`)
- `createServerClient` → untuk Server Components, Server Actions, API Routes
- `SUPABASE_SERVICE_ROLE_KEY` → HANYA di server, jangan expose ke client

**3. TypeScript strict mode.**
Semua file harus typed dengan benar. Generate ulang `database.types.ts` setiap kali schema berubah dengan:
```bash
npx supabase gen types typescript --project-id YOUR_PROJECT_ID > apps/web/types/database.types.ts
```

**4. Semua harga dalam IDR tanpa desimal.**
Simpan harga sebagai integer (Rupiah penuh), bukan float. Konversi ke format "Rp 1.200.000" hanya di display layer.

**5. Timezone.**
Simpan semua waktu di database sebagai UTC (`TIMESTAMPTZ`). Konversi ke WIB (`Asia/Jakarta`) atau timezone region yang relevan hanya saat display.

**6. Image upload.**
Selalu kompres gambar sebelum upload ke Supabase Storage. Target < 500KB untuk foto single, < 2MB untuk galeri. Gunakan `browser-image-compression` di client atau `sharp` di server.

**7. Realtime channels.**
Selalu unsubscribe dari Supabase Realtime channel saat komponen unmount untuk mencegah memory leak.

**8. Error handling.**
Setiap API route harus return error yang konsisten:
```typescript
return Response.json({ error: 'message', code: 'ERROR_CODE' }, { status: 400 })
```

**9. Nama platform.**
Nama produk adalah **Jeda Wisata** (dengan huruf kapital di awal). Bukan JEDA WISATA, bukan jeda wisata.

**10. Unit economics.**
Sebelum menambahkan region baru, pastikan P&L per region di admin panel menunjukkan margin positif minimum 30%.

---

*Dokumen ini adalah living document. Update setiap kali ada keputusan arsitektur baru.*  
*Version control: simpan di `/docs/JEDA_WISATA_TECHNICAL_SPEC.md` dalam repository.*  
*Last updated: May 2026 by Mas Shafly*
