# Admin Login Issue - Root Cause & Solutions

## 🎯 The Problem
User `test@example.com` dengan role `super_admin` tidak bisa login ke `/admin`. Error: "Akun ini tidak memiliki akses admin dashboard."

## 🔍 Root Cause
**Ada missing profile auto-sync logic di authentication flow.**

Ketika user login, aplikasi mencoba mengambil role dari tabel `profiles`:
```typescript
const profileRole = await getProfileRole(data.user.id);
```

Tapi jika profile entry tidak ada di `profiles` table, maka `profileRole = null`, dan:
- `isAdminRole(null)` → return `false`
- User ditolak dengan error message tersebut

**Mengapa profile entry hilang?**
- Saat user mendaftar via `signUpWithEmail()`, hanya entry di `auth.users` yang dibuat
- Tidak ada trigger/logic untuk auto-create entry di `profiles` table
- Akun yang dibuat manual di Supabase Console mungkin tidak punya profile entry

## ✅ Solutions Applied

### 1. **Auto-Sync Profile on Login** 
Added function `ensureProfileExists()` in [actions/auth.ts](apps/web/actions/auth.ts):
- Ketika user login, check apakah profile-nya ada
- Jika tidak ada, auto-create dengan role default `client`
- Jika ada, gunakan role yang sudah di-set

### 2. **Auto-Sync Profile on OAuth Login**
Updated [app/auth/callback/route.ts](app/auth/callback/route.ts):
- Sama seperti email login, pastikan profile ada sebelum verifikasi role

### 3. **Normalize Database Roles**
Created migration [202605060001_normalize_roles.sql](supabase/migrations/202605060001_normalize_roles.sql):
- Normalize semua role values di database (handling `"Super Admin"`, `"SUPER_ADMIN"`, spaces, etc.)
- Ensure semua roles dalam format: `super_admin`, `regional_admin`, `client`, dll.

---

## 🔧 Quick Manual Fix for test@example.com

### Step 1: Buka Supabase Console
1. Go to: https://app.supabase.com → Dashboard
2. Select project Anda
3. Go to: Table Editor → `profiles`

### Step 2: Check Profile Entry
1. Search untuk email `test@example.com`
2. Jika **tidak ada** → Skip ke Step 4
3. Jika **ada** → Go to Step 3

### Step 3: Fix Role Value (jika profile ada)
1. Click pada cell di kolom `role`
2. Jika kosong/NULL → Select `super_admin` dari dropdown
3. Jika bernilai lain (e.g., "Super Admin") → Edit ke `super_admin` (lowercase dengan underscore)
4. Click Save

### Step 4: Create Profile (jika tidak ada)
1. Click "+ Insert" button
2. Fill dalam form:
   - **id**: Ambil dari kolom `id` di tabel `auth.users` untuk email ini
   - **email**: `test@example.com`
   - **full_name**: `Test User` (atau nama apapun)
   - **role**: Select `super_admin`
   - **is_active**: Toggle ON
3. Click Save

### Step 5: Test Login
1. Go to: http://localhost:3000/admin
2. Login dengan:
   - Email: `test@example.com`
   - Password: (password Anda)
3. Expected: Should redirect to `/dashboard` ✅

---

## 📋 Deployment Steps

### Step 1: Apply Code Changes
Code changes sudah di-implement di:
- `actions/auth.ts` - ensureProfileExists()
- `app/auth/callback/route.ts` - OAuth sync
- `app/api/debug/user-state/route.ts` - Debug endpoint

### Step 2: Apply Database Migration
```bash
cd /Users/user/Documents/Perkodingan/Jeda
pnpm supabase db push
```

### Step 3: Verify test@example.com
Either manually via Supabase Table Editor (steps above) OR:
- Try login - will auto-create profile with `client` role
- Then manually update role to `super_admin` in Table Editor

### Step 4: Test Full Flow
```bash
# 1. Visit login page
http://localhost:3000/admin

# 2. Test with test@example.com
# Email: test@example.com
# Password: test123456

# 3. Should see dashboard
# If not, run debug:
curl -X POST http://localhost:3000/api/debug/user-state \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123456"}'
```

---

## 📚 Documentation Files

Lihat file-file ini untuk detail lebih lanjut:

1. **[QA_ADMIN_LOGIN_FIX.md](QA_ADMIN_LOGIN_FIX.md)** — Comprehensive QA Report
   - Bug analysis
   - Cross-feature impact
   - Deployment checklist
   - All code changes documented

2. **[ADMIN_LOGIN_FIX.md](ADMIN_LOGIN_FIX.md)** — Quick Fix Guide
   - Step-by-step manual fix
   - Debug endpoint usage
   - Testing instructions

3. **[apps/web/actions/auth.ts](apps/web/actions/auth.ts)** — Updated auth action
   - New `ensureProfileExists()` function
   - Updated `signInWithEmail()`

4. **[apps/web/app/auth/callback/route.ts](apps/web/app/auth/callback/route.ts)** — OAuth callback
   - Profile sync logic added

5. **[supabase/migrations/202605060001_normalize_roles.sql](supabase/migrations/202605060001_normalize_roles.sql)** — Database migration
   - Normalizes all existing role values

---

## ❓ Troubleshooting

### Login still fails after fix?
1. Check profile role is `super_admin` (not `"Super Admin"` or `SUPER_ADMIN`)
2. Run debug endpoint to see what's happening:
   ```bash
   curl -X POST http://localhost:3000/api/debug/user-state \
     -H "Content-Type: application/json" \
     -d '{"email":"test@example.com","password":"YOUR_PASSWORD"}'
   ```
3. Check browser console for any error messages

### Profile created but still says "invalid role"?
1. Go back to Table Editor
2. Click on the role cell
3. Ensure it shows `super_admin` (not `null` or other value)
4. If role is from dropdown, it should be correct format automatically

### OAuth login broken?
1. Check that test@example.com profile has been created
2. Verify migration was applied: `pnpm supabase db push`
3. Check Supabase logs for any errors

---

## ✨ Summary

**Problem**: Missing profile auto-sync → profile entry doesn't exist or has wrong role → login fails

**Solution**: 
1. Auto-create profile on login if doesn't exist
2. Normalize all role values in database
3. Sync profile on both email & OAuth login

**To Fix test@example.com NOW**:
1. Buka Supabase Table Editor
2. Find profile untuk test@example.com
3. Ensure role = `super_admin`
4. Try login again ✅

**Status**: 🟡 Ready to deploy (code + DB migration) after manual verification of test@example.com profile
