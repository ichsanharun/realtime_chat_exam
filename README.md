# Realtime Chat App - Monorepo 🚀

Aplikasi chat keren pake Laravel 11 (Backend) dan Vue 3 (Frontend). Udah support realtime pake Reverb, login aman pake JWT + 2FA (Google Authenticator), dan tampilannya udah cakep (Dark/Light mode).

## 🛠 Cara Install & Jalanin Proyek

Ikutin langkah ini ya biar lancar jaya!

### 1. Persiapan
Requirements:
- PHP 8.2+ & Composer
- Node.js & Bun (atau NPM)
- PostgreSQL (Neon atau Local)

---

### 2. Setup Backend (Laravel)

1. **Masuk ke folder backend**:
   ```bash
   cd backend
   ```

2. **Install semua dependensinya**:
   ```bash
   composer install
   ```

3. **Setting Environment**:
   - Copy file `.env.example` jadi `.env`:
     ```bash
     cp .env.example .env
     ```
   - Buka `.env`, terus isi bagian `DB_HOST`, `DB_DATABASE`, `DB_USERNAME`, dan `DB_PASSWORD` sesuai database kamu.

4. **Bikin App Key & JWT Secret**:
   ```bash
   php artisan key:generate
   php artisan jwt:secret
   ```

5. **Jalanin Migrasi Database**:
   ```bash
   php artisan migrate
   ```

6. **Nyalain Servernya (Buka 2 terminal ya)**:
   - Terminal 1 (API Server):
     ```bash
     php artisan serve
     ```
   - Terminal 2 (WebSocket Server):
     ```bash
     php artisan reverb:start
     ```

---

### 3. Setup Frontend (Vue 3)

1. **Masuk ke folder frontend**:
   ```bash
   cd ../frontend
   ```

2. **Install semua dependensinya**:
   ```bash
   bun install
   # kalau ga ada bun, pake npm install
   ```

3. **Setting Environment**:
   - Bikin file `.env` (atau edit yang sudah ada), isinya sesuain sama backend:
     ```bash
     VITE_API_URL=http://127.0.0.1:8000/api
     VITE_REVERB_APP_KEY=isi_pake_key_dari_backend_env
     VITE_REVERB_HOST=127.0.0.1
     VITE_REVERB_PORT=8080
     VITE_REVERB_SCHEME=http
     ```

4. **Jalanin Frontend-nya**:
   ```bash
   bun run dev
   # atau npm run dev
   ```

---

### 4. Tes API Pake Postman
Kalo mau ngetes API tanpa buka browser, pake file ini yang ada di root:
- File: `Realtime_Chat_API.postman_collection.json`
- **Tips**: Di situ udah ada _Automated Test_, jadi token JWT bakal otomatis kesimpen setelah kamu verifikasi 2FA!

## ✨ Fitur-fiturnya
- **Realtime Chat**: Pesan langsung masuk tanpa refresh (pake Laravel Reverb).
- **Double Security**: Udah pake JWT dan wajib 2FA biar aman banget.
- **Premium UI**: Pake Naive UI, ada tombol switch Dark/Light mode di pojok.
- **API Logs**: Semua request masuk dicatat otomatis buat monitoring.
- **CI/CD**: Udah ada GitHub Actions buat auto-test kalo kamu push ke repo.

Happy coding!
