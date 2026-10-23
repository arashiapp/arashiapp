# ARASHI SPARRINGHUB ⚡⚽

Platform sparring Futsal, Mini Soccer, dan Sepak Bola Antar Kampung dengan sinkronisasi database real-time antar perangkat.

---

## 🚀 Panduan Edit di GitHub & Integrasi Supabase

### 1. Cara Upload / Push Kode ke GitHub

Jalankan perintah berikut di terminal komputer Anda:

```bash
# 1. Inisialisasi Git repository (jika belum)
git init

# 2. Tambahkan semua file proyek
git add .

# 3. Lakukan commit awal
git commit -m "feat: inisialisasi Arashi SparringHub dengan integrasi Supabase dan real-time sync"

# 4. Hubungkan ke repository GitHub Anda (ganti URL dengan repository GitHub Anda)
git remote add origin https://github.com/USERNAME/arashi-sparringhub.git

# 5. Push kode ke branch main
git branch -M main
git push -u origin main
```

---

### 2. Cara Setup & Integrasi Database Supabase

1. Buka [Supabase Dashboard](https://supabase.com/dashboard) dan klik **New Project**.
2. Beri nama proyek: `arashi-sparringhub` dan pilih region terdekat (misal: *Singapore*).
3. Setelah database selesai dibuat:
   - Buka menu **SQL Editor** di sidebar kiri.
   - Klik **New Query**.
   - Salin dan tempel seluruh isi file **`schema.sql`** yang ada di root proyek ini.
   - Klik tombol **Run** untuk membuat tabel (`users`, `teams`, `team_members`, `matches`, `match_teams`, `messages`, `notifications`, `venues`, `tournaments`) dan data awal.

4. **Aktifkan Fitur Supabase Real-time**:
   - Masuk ke menu **Database** > **Replication**.
   - Pada bagian *Source*, aktifkan tombol toggle Realtime untuk tabel:
     - `matches`
     - `messages`
     - `notifications`

5. **Dapatkan Kunci API Supabase**:
   - Masuk ke menu **Project Settings** (ikon gear) > **API**.
   - Salin:
     - **Project URL** (contoh: `https://xyzproject.supabase.co`)
     - **anon / public key** (kunci panjang di bawah Project API keys)

---

### 3. Konfigurasi Environment Variables (`.env`)

Buat file bernama `.env` di root proyek Anda (atau atur di GitHub Secrets / Vercel):

```env
# Supabase Configuration
VITE_SUPABASE_URL="https://your-project-id.supabase.co"
VITE_SUPABASE_ANON_KEY="your-anon-key-here"

# Port (opsional)
PORT=3000
```

---

### 4. Menjalankan Aplikasi di Komputer Lokal

```bash
# Install dependencies
npm install

# Jalankan server development
npm run dev
```

Buka browser di `http://localhost:3000`. Aplikasi akan otomatis terhubung ke Supabase dan melakukan sinkronisasi real-time antar tab dan perangkat!

---

### 5. Deploy Instan ke Vercel / Netlify via GitHub

1. Buka [Vercel](https://vercel.com) atau [Netlify](https://netlify.com).
2. Hubungkan repository GitHub `arashi-sparringhub`.
3. Masukkan Environment Variables:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
4. Klik **Deploy**! Aplikasi Anda kini online 24/7 dengan database Supabase PostgreSQL real-time.
