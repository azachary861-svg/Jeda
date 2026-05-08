# Admin Login Troubleshooting (Super Admin / Regional Admin)

Date: 2026-05-08

Dokumen ini untuk kasus ketika login di `/admin` selalu gagal dengan pesan:
`Akun ini tidak memiliki akses admin dashboard.`

---

## 1) Validasi Data di Supabase (Wajib)

Jalankan query berikut di SQL Editor project yang **sama** dengan environment web app:

```sql
-- A. Pastikan user auth ada
select id, email, raw_app_meta_data, raw_user_meta_data
from auth.users
where lower(email) in ('test@example.com', 'adminregion@example.com');

-- B. Pastikan profile ada dan role benar
select id, email, role, region_id, updated_at
from public.profiles
where lower(email) in ('test@example.com', 'adminregion@example.com');

-- C. Cek self-read policy efektif untuk akun login saat ini
select auth.uid() as uid, public.current_profile_role() as role, public.current_profile_region_id() as region_id;
```

Expected:
- `test@example.com` -> `role = super_admin`
- `adminregion@example.com` -> `role = regional_admin`

---

## 2) Validasi Environment yang Dipakai App

Masalah paling sering: app mengarah ke Supabase project berbeda dari yang Anda cek di dashboard.

Cek variable ini pada environment runtime (Vercel/local):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

Pastikan `NEXT_PUBLIC_SUPABASE_URL` mengarah ke project yang berisi dua akun di atas.

---

## 3) Endpoint Debug yang Sudah Ada

Gunakan endpoint internal berikut untuk memastikan role yang terbaca saat runtime:

### A. Cek role dari profile + metadata
`POST /api/debug/check-role`

Body:
```json
{ "email": "test@example.com" }
```

### B. Cek login-state lengkap
`POST /api/debug/user-state`

Body:
```json
{ "email": "test@example.com", "password": "<password>" }
```

Perhatikan field:
- `profile.exists`
- `profile.rawRole`
- `profile.normalizedRole`
- `profile.isAdminRole`

Jika `rawRole` benar tapi `isAdminRole = false`, ada mismatch normalisasi role.

---

## 4) File Kode yang Harus Dicek

### Auth Role Logic
- `apps/web/lib/auth/portal.ts`
  - `canonicalizeRole()`
  - `isAdminRole()`
  - `getPortalAccessError()`

### Login Server Action
- `apps/web/actions/auth.ts`
  - `signInWithEmail()`
  - `resolveEffectiveRole()`
  - Pastikan query profile memakai client/session yang sama setelah sign-in.

### OAuth Callback
- `apps/web/app/auth/callback/route.ts`
  - Role resolution harus konsisten dengan `auth.ts`.

### Middleware Redirect
- `apps/web/middleware.ts`
  - Cek perilaku redirect untuk `/admin`, `/dashboard`, `/packages`.

### RLS / Migration
- `supabase/migrations/202605020001_init_core.sql`
  - `profiles self read`
  - `profiles admin read`
- `supabase/migrations/202605080001_profiles_self_insert_policy.sql`
- `supabase/migrations/202605080002_backfill_admin_roles.sql`

---

## 5) Checklist Cepat (Runbook)

- [ ] URL Supabase app = URL Supabase yang dicek di dashboard
- [ ] `auth.users` berisi dua email target
- [ ] `public.profiles` berisi dua email target dengan role enum valid
- [ ] `isAdminRole()` mengenali nilai role aktual
- [ ] Login action tidak membaca profile lewat sesi anonim
- [ ] RLS policy profiles aktif dan benar
- [ ] Tidak ada cache/session lama di browser

---

## 6) Langkah Re-test Disarankan

1. Logout total.
2. Hapus cookie site untuk domain app.
3. Login ulang di `/admin` dengan `test@example.com`.
4. Jika gagal, panggil `POST /api/debug/user-state` untuk akun yang sama.
5. Simpan response JSON dan bandingkan dengan expected di atas.

---

## 7) Catatan Diagnostik Root Cause yang Mungkin

1. **Supabase project mismatch** (paling sering): data benar di dashboard A, app login ke project B.
2. **Session context mismatch di server action**: setelah `signInWithPassword`, query role dilakukan oleh client lain yang tidak membawa sesi login.
3. **Role metadata/profile tidak sinkron**: profile role lama `client` walau auth metadata sudah admin.
4. **Role alias tidak ter-cover**: misalnya `adminregion`, `regional admin`, dsb.
