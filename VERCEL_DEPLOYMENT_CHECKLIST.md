# ✅ Vercel Deployment Checklist - Langkah demi Langkah

**Tujuan:** Memperbaiki environment variables di Vercel dan melakukan redeploy sehingga aplikasi hidup dengan benar.

**Timeline:** ~5-10 menit  
**Status:** Step-by-step guide untuk `jeda-two.vercel.app`

---

## 📋 Persiapan Awal

Sebelum mulai, siapkan informasi yang kamu butuhkan:

### ✅ Langkah 0: Kumpulkan Informasi Supabase

1. Buka dashboard Supabase: https://supabase.com/dashboard
2. Login dengan akun kamu
3. Pilih project: `fmoqxwqusuolkxygqrvv`
4. **Catat informasi berikut:**

   ```
   ✓ Supabase Project URL: https://fmoqxwqusuolkxygqrvv.supabase.co
   ✓ Supabase Anon Key: eyJhbGc... (lihat di Settings > API > anon public)
   ```

   **Penting:** 
   - URL harus format: `https://<ref>.supabase.co`
   - JANGAN gunakan: `https://supabase.com/dashboard/projects/...` (ini adalah dashboard URL, bukan project URL)

---

## 🌐 Langkah 1: Akses Vercel Dashboard

1. Buka browser → https://vercel.com/dashboard
2. Login dengan akun Vercel kamu (pastikan email yang sama dengan GitHub)
3. Cari project bernama **`jeda-two`** di daftar projects
4. **Klik nama project** untuk masuk ke detail project

   ![Expected: Halaman berisi "jeda-two" dengan statistics, deployments, dll]

---

## ⚙️ Langkah 2: Akses Settings

1. Di halaman project `jeda-two`, cari **tab "Settings"** di bagian atas halaman
   - Sebelum: Deployments | Logs | **Settings** | ...
2. **Klik "Settings"**
3. Kamu sekarang berada di halaman Settings project

   ![Expected: Halaman berisi General, Build & Development Settings, Git, Environment Variables, dll]

---

## 🔑 Langkah 3: Buka Environment Variables

1. Di menu Settings sebelah kiri, scroll ke bawah
2. Cari menu **"Environment Variables"** → **Klik**
3. Kamu akan melihat daftar variabel yang sudah ada:
   ```
   NEXT_PUBLIC_SUPABASE_URL          ● ●
   NEXT_PUBLIC_SUPABASE_ANON_KEY     ● ●
   NEXT_PUBLIC_APP_URL               ● ●
   SUPABASE_SERVICE_ROLE_KEY         ● ●
   STRIPE_SECRET_KEY                 ● ●
   ... dan lainnya
   ```

---

## 🔴 Langkah 4: Update NEXT_PUBLIC_SUPABASE_URL (PALING PENTING)

**Ini adalah bug utama yang menyebabkan error di `/packages` dan `/admin`!**

### Step 4a: Cari Variabel
1. Scroll hingga menemukan: `NEXT_PUBLIC_SUPABASE_URL`
2. Lihat nilai saat ini (mungkin ada "..." di akhir karena hidden)
3. **Klik pada baris variabel** atau **klik ikon edit** (pensil)

   ![Expected: Pop-up atau form untuk edit variabel]

### Step 4b: Hapus Nilai Lama
1. Klik pada field nilai dan **pilih semua teks** (`Cmd+A` di Mac atau `Ctrl+A` di Windows/Linux)
2. **Hapus semua** (tekan Delete/Backspace)

### Step 4c: Masukkan Nilai Baru
1. Ketik/paste nilai yang benar:
   ```
   https://fmoqxwqusuolkxygqrvv.supabase.co
   ```
   
   **Verifikasi:** 
   - ✅ Dimulai dengan `https://`
   - ✅ Format: `https://[REF].supabase.co` (jangan ada `/dashboard/`, `/api/`, atau text lainnya)
   - ✅ Tidak ada whitespace di awal atau akhir

2. **Klik "Save"** atau tombol checkmark (✓)

   ![Expected: Variabel berubah dan tersimpan]

---

## 🔵 Langkah 5: Update NEXT_PUBLIC_SUPABASE_ANON_KEY

### Step 5a: Cari Variabel
1. Scroll untuk menemukan: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
2. **Klik pada baris variabel** atau **klik ikon edit**

### Step 5b: Verifikasi Nilai
1. Jika field sudah kosong atau tidak sesuai, copas dari Supabase:
   - Buka: https://supabase.com/dashboard/project/fmoqxwqusuolkxygqrvv/settings/api
   - Cari section **"Project API keys"**
   - Copas key dengan label **"anon public"** (kurang lebih panjangnya 150+ karakter)

2. **Hapus nilai lama** di Vercel dan **paste nilai baru**

3. **Klik "Save"**

---

## 🟢 Langkah 6: Update NEXT_PUBLIC_APP_URL

### Step 6a: Cari Variabel
1. Scroll untuk menemukan: `NEXT_PUBLIC_APP_URL`
2. **Klik untuk edit**

### Step 6b: Update Nilai
1. **Hapus** nilai lama (jika ada `http://localhost:3000` atau URL lama)
2. **Masukkan:**
   ```
   https://jeda-two.vercel.app
   ```

3. **Klik "Save"**

---

## 🟡 Langkah 7: Verifikasi Variabel Lainnya (Optional Check)

Scroll keseluruhan daftar environment variables dan pastikan:

| Variabel | Status | Catatan |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ Updated | Format: `https://fmoqxwqusuolkxygqrvv.supabase.co` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ Updated | Dimulai dengan `eyJ...` |
| `NEXT_PUBLIC_APP_URL` | ✅ Updated | `https://jeda-two.vercel.app` |
| `SUPABASE_SERVICE_ROLE_KEY` | ⏭️ Optional | Jika ada, jangan diedit kecuali diperlukan |
| `STRIPE_SECRET_KEY` | ⏭️ Optional | Jika ada, jangan diedit kecuali diperlukan |
| `STRIPE_WEBHOOK_SECRET` | ⏭️ Optional | Jika ada, jangan diedit kecuali diperlukan |

**Tidak perlu update variabel yang tidak disebutkan di atas.**

---

## 🚀 Langkah 8: Trigger Redeploy

### Step 8a: Kembali ke Deployments
1. Di halaman project, klik **tab "Deployments"** (sebelah Settings)
2. Kamu akan melihat daftar deployment sebelumnya

   ![Expected: List dengan timestamps seperti "May 4, 2025 at 10:30 AM - Skipped"]

### Step 8b: Trigger Redeploy Manual
1. Di deployment paling atas (atau yang "Skipped"), cari menu **kebab icon** (⋮ - tiga titik) atau tombol **"Redeploy"**
2. **Klik "Redeploy"** → Pop-up akan muncul
3. Confirm: **"Redeploy"**

   ![Expected: Pop-up dengan tombol Redeploy berwarna biru]

---

## ⏳ Langkah 9: Monitor Deployment Progress

1. Kamu akan otomatis kembali ke halaman Deployments
2. Di bagian paling atas, kamu akan melihat status:
   ```
   🟡 Building...
   🟢 Ready (setelah ~2-3 menit)
   ```

### Status Detail:

| Status | Warna | Artinya | Waktu |
|---|---|---|---|
| Building | 🟡 Kuning | Sedang compile & build | 2-3 menit |
| Ready | 🟢 Hijau | Deploy selesai, siap live | ✅ |
| Failed | 🔴 Merah | Ada error, lihat log | ❌ |

### Step 9a: Lihat Log (jika diperlukan)
1. Jika status **Failed**, klik deployment untuk melihat log
2. Cari pesan error di bagian "Build Logs"
3. Jika ada error, tangkap screenshot dan share

### Step 9b: Tunggu Build Selesai
- **Biasanya:** 2-4 menit
- **Jarang:** Bisa sampai 5-6 menit untuk build pertama
- **Pantau:** Refresh halaman setiap 30 detik

---

## ✅ Langkah 10: Test Live URLs

**Setelah status berubah menjadi 🟢 Ready**, test URL berikut:

### Test 1: Packages Page (Paling Penting)
```
https://jeda-two.vercel.app/packages
```

**Harapan:**
- ✅ Halaman load dengan list paket wisata
- ✅ TIDAK ada raw HTML `<!DOCTYPE html>` di halaman
- ✅ Bisa scroll, filter, lihat detail paket
- ❌ Jika masih error: "Koneksi database belum benar" → lihat Troubleshooting

### Test 2: Real Trip Maps (Seharusnya Public Sekarang)
```
https://jeda-two.vercel.app/real-trip-maps
```

**Harapan:**
- ✅ Halaman load TANPA redirect ke login
- ✅ Bisa lihat map
- ❌ Jika masih redirect ke login → lihat Troubleshooting

### Test 3: Admin Login
```
https://jeda-two.vercel.app/admin
```

**Harapan:**
- ✅ Halaman login admin tampil (bukan JSON error "Unexpected token '<'")
- ✅ Input email & password bisa terisi
- ❌ Jika masih error JSON → lihat Troubleshooting

### Test 4: Client Login
```
https://jeda-two.vercel.app/login
```

**Harapan:**
- ✅ Halaman login tampil dengan form
- ✅ Bisa submit (akan validation sesuai logik)

---

## 🐛 Troubleshooting

### ❌ Masalah 1: Deployments Masih "Failed" (Warna Merah)

**Tanda:** Status deployment merah, tulisan "Failed"

**Solusi:**
1. Klik deployment yang failed
2. Scroll ke bawah → cari **"Function Logs"** atau **"Build Logs"**
3. Cari pesan error (biasanya ditulis dengan warna merah)
4. **Beberapa kemungkinan:**
   
   a. **Error: `NEXT_PUBLIC_SUPABASE_URL` invalid format**
   - Fix: Pastikan URL persis `https://fmoqxwqusuolkxygqrvv.supabase.co` (tanpa `/` di akhir)
   - Go back ke Langkah 4, hapus semua, dan re-paste

   b. **Error: Build timeout or out of memory**
   - Fix: Tunggu 5 menit, lalu redeploy lagi
   - Jika tetap gagal, silahkan share error message

   c. **Error: Other TypeScript atau build error**
   - Share screenshot log error ke saya

---

### ❌ Masalah 2: `/packages` Masih Menampilkan Raw HTML atau Error

**Tanda:** Halaman `/packages` masih menunjukkan `<!DOCTYPE html>` atau text error panjang

**Penyebab Kemungkinan:**
1. Environment variables belum ter-update (verify ulang Langkah 4-6)
2. Build selesai tapi Supabase project URL-nya masih salah
3. Supabase service down (jarang terjadi)

**Solusi:**
1. Verifikasi ulang Langkah 4-6 benar-benar tersimpan
2. Klik "Redeploy" lagi
3. Tunggu ~3 menit
4. Test `/packages` lagi
5. Jika masih error, share screenshot error ke saya

---

### ❌ Masalah 3: `/real-trip-maps` Masih Require Login

**Tanda:** Masuk ke `/real-trip-maps` → redirect ke `/login`

**Penyebab:** Code update belum ter-deploy

**Solusi:**
1. Pastikan deployment status **🟢 Ready**
2. Hard refresh browser: `Cmd+Shift+R` (Mac) atau `Ctrl+Shift+R` (Windows)
3. Coba akses ulang: `https://jeda-two.vercel.app/real-trip-maps`
4. Jika masih redirect, redeploy lagi

---

### ❌ Masalah 4: Pages Load Tapi Blank/Kosong

**Tanda:** Halaman load tapi tidak ada content (blank white page)

**Kemungkinan:**
1. JavaScript error di browser (cek Console)
2. Supabase client gagal initialize karena env config

**Solusi:**
1. Buka DevTools: `F12` atau `Cmd+Option+I` (Mac)
2. Klik tab **"Console"**
3. Cari pesan error berwarna merah
4. Jika ada error tentang Supabase, share ke saya
5. Jika Console kosong, coba hard refresh lagi

---

## ✨ Langkah 11: Post-Deployment Verification

Setelah semua test berhasil ✅, jalankan checklist final:

```
[ ] /packages halaman load dengan list paket (tanpa HTML mentah)
[ ] /real-trip-maps bisa diakses tanpa login
[ ] /admin halaman login tampil (tanpa JSON error)
[ ] /login halaman login tampil dengan form
[ ] No console errors di DevTools
[ ] Responsive: test di mobile view (F12 → toggle device toolbar)
```

Jika semua ✅, **deployment BERHASIL! 🎉**

---

## 📞 Support / Stuck?

Jika ada yang tidak jelas atau stuck di langkah tertentu:

1. **Screenshot halaman yang error** (lengkap dengan URL di address bar)
2. **Copy-paste error message** dari Vercel Build Log atau Console
3. **Beritahu saya di step mana** yang troublesome
4. Saya akan help debug lebih lanjut

---

## 🎯 Quick Reference - Nilai yang Harus Ada di Vercel

```
NEXT_PUBLIC_SUPABASE_URL        = https://fmoqxwqusuolkxygqrvv.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY   = eyJ... (dari Supabase API Keys)
NEXT_PUBLIC_APP_URL             = https://jeda-two.vercel.app
```

**Ini adalah 3 variabel paling penting untuk membuat aplikasi hidup.**

---

**Status:** 📋 Siap di-execute  
**Last Updated:** May 4, 2025  
**Estimated Time:** 5-10 menit
