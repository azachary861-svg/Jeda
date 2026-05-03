# 🔐 Panduan Setup Login — Jeda Wisata

Panduan ini untuk pemula. Bacalah dari atas ke bawah.

---

## ❓ Kenapa Saya Tidak Bisa Login?

Login di Jeda Wisata menggunakan **Supabase** — layanan gratis yang menyimpan data pengguna di cloud. Saat Anda mendaftarkan email dan password, data itu disimpan di Supabase, bukan di file lokal.

Ada dua kemungkinan kenapa login gagal:

1. **Email belum terdaftar** — Anda perlu mendaftar dulu lewat halaman `/register`
2. **Email belum dikonfirmasi** — Supabase mengirim email verifikasi, harus diklik dulu

---

## 🧭 Langkah 1 — Masuk ke Supabase Dashboard

1. Buka browser, pergi ke **[https://supabase.com](https://supabase.com)**
2. Klik tombol **"Sign In"** di pojok kanan atas
3. Login dengan akun Google atau GitHub Anda
4. Setelah masuk, Anda akan melihat daftar project. Klik project **Jeda Wisata**

---

## 🧭 Langkah 2 — Cek Apakah Email Anda Sudah Ada

1. Di sidebar kiri Supabase, klik menu **"Authentication"**
2. Pilih tab **"Users"**
3. Cari email yang Anda gunakan untuk login

**Jika email tidak ada:** Lanjut ke Langkah 3 (buat akun baru)

**Jika email ada tapi status-nya `Waiting for verification` atau `Unconfirmed`:** Lanjut ke Langkah 4

**Jika email ada dan sudah confirmed:** Kemungkinan password salah, coba reset di Langkah 5

---

## 🧭 Langkah 3 — Buat Akun Admin / Driver Baru

### Cara Tercepat (langsung dari Supabase):

1. Di halaman **Authentication > Users**, klik tombol **"Add user"** atau **"Invite user"**
2. Masukkan email dan password yang Anda inginkan
3. Klik **"Create user"**
4. Sekarang akun sudah ada, tapi **role-nya belum diatur**

### Atur Role Pengguna:

Role menentukan apakah akun ini adalah admin, driver, atau client biasa.

1. Di sidebar kiri, klik **"Table Editor"**
2. Pilih tabel **`profiles`**
3. Cari baris dengan kolom `id` yang sesuai dengan user yang baru dibuat
   - Jika belum ada baris, klik **"Insert row"** dan isi kolom `id` dengan UUID user tersebut
   - UUID user bisa dilihat di **Authentication > Users**, klik user-nya, salin nilai "User UID"
4. Isi kolom `role` dengan salah satu nilai berikut:
   - `super_admin` — akses penuh ke semua fitur admin
   - `regional_admin` — akses admin terbatas ke region tertentu
   - `driver` — akses ke driver app
   - *(kosongkan atau isi `client`)* — akses marketplace biasa

---

## 🧭 Langkah 4 — Konfirmasi Email (Jika Perlu)

Jika Supabase mengharuskan konfirmasi email dan Anda tidak ingin repot, Anda bisa matikan fitur ini:

1. Di Supabase, klik **"Authentication"** di sidebar kiri
2. Pilih tab **"Email"** atau **"Providers"**
3. Cari opsi **"Confirm email"** atau **"Email confirmation"**
4. **Matikan (toggle off)** opsi tersebut
5. Klik **"Save"**

Sekarang pengguna bisa langsung login tanpa perlu mengklik link konfirmasi di email.

---

## 🧭 Langkah 5 — Reset Password (Jika Lupa)

1. Di **Authentication > Users**, klik user yang bersangkutan
2. Klik tombol **"Send password recovery"** — Supabase akan kirim email reset
3. Atau Anda bisa **langsung ubah password** dari sini tanpa kirim email

---

## 🧭 Langkah 6 — Pastikan Environment Variables Sudah Benar di Vercel

Ini adalah langkah **paling penting**. Jika variabel ini tidak ada, seluruh login dan halaman akan error.

### Cara Mengecek:

1. Buka **[https://vercel.com](https://vercel.com)** dan login
2. Klik project **Jeda** Anda
3. Klik tab **"Settings"**
4. Klik menu **"Environment Variables"** di sidebar kiri
5. Pastikan variabel berikut **sudah ada dan terisi**:

| Nama Variabel | Contoh Nilai | Cara Mendapatkan |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | `https://xxxxx.supabase.co` | Supabase > Project Settings > API > Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `eyJhbGci...` (panjang) | Supabase > Project Settings > API > anon / public key |
| `SUPABASE_SERVICE_ROLE_KEY` | `eyJhbGci...` (panjang) | Supabase > Project Settings > API > service_role key |
| `NEXT_PUBLIC_APP_URL` | `https://jeda-two.vercel.app` | URL website Vercel Anda |

### Cara Mendapatkan Nilai dari Supabase:

1. Buka Supabase, klik project Anda
2. Di sidebar kiri, klik ikon ⚙️ **"Project Settings"**
3. Pilih menu **"API"**
4. Salin nilai **Project URL** → masukkan ke `NEXT_PUBLIC_SUPABASE_URL`
5. Salin nilai **anon public** (di bawah "Project API keys") → masukkan ke `NEXT_PUBLIC_SUPABASE_ANON_KEY`
6. Salin nilai **service_role** (klik "Reveal" dulu) → masukkan ke `SUPABASE_SERVICE_ROLE_KEY`

⚠️ **PERHATIAN:** Jangan pernah share `SUPABASE_SERVICE_ROLE_KEY` ke publik. Key ini punya akses penuh ke database Anda.

### Setelah Menambah/Mengubah Variable:

1. Scroll ke bawah di halaman Settings > Environment Variables
2. Klik tombol **"Save"**
3. Pergi ke tab **"Deployments"**
4. Klik tombol **"Redeploy"** pada deployment terbaru (klik tiga titik `...` di sebelah kanan, pilih "Redeploy")

---

## 🧭 Langkah 7 — Cek Supabase Auth Email Settings

1. Di Supabase, klik **"Authentication"** > **"URL Configuration"**
2. Pada field **"Site URL"**, masukkan URL website Anda: `https://jeda-two.vercel.app`
3. Pada **"Redirect URLs"**, tambahkan: `https://jeda-two.vercel.app/auth/callback`
4. Klik **"Save"**

Ini penting agar login dengan Google/GitHub bisa redirect ke website Anda dengan benar.

---

## 🔑 Ringkasan Portal Login

| Portal | URL | Untuk Siapa |
|---|---|---|
| Marketplace | `/login` | Client (pengguna umum) |
| Admin Dashboard | `/admin` | Super Admin & Regional Admin |
| Driver App | `/driver` | Driver lapangan |

---

## 🆘 Masih Error?

Cek langkah-langkah ini:

1. ✅ Environment variables sudah ada di Vercel?
2. ✅ Sudah Redeploy setelah menambah/mengubah env vars?
3. ✅ Email user sudah confirmed di Supabase?
4. ✅ Role di tabel `profiles` sudah diisi?
5. ✅ Site URL di Supabase Auth sudah diisi dengan URL Vercel?

Jika semua sudah ✅ tapi masih error, cek **Vercel Logs**:
- Buka Vercel > project Anda > tab **"Logs"** atau **"Functions"**
- Cari pesan error merah untuk tahu detail masalahnya
