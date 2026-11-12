# Avtomaktab — YHQ o'quv va imtihon platformasi

Ushbu tizim avtomaktab o'quv markazi uchun mo'ljallangan bo'lib, **internetsiz mahalliy tarmoqda (LAN)** 10+ kompyuterda ishlashga hamda bulutli serverga (**Vercel + Turso**) joylashtirishga moslashtirilgan.

---

## 1. Windows serverga o'rnatish (O'quv markazi LAN tarmog'i uchun)

### 1.1. Node.js o'rnatish
1. Bosh kompyuterga (serverga) **Node.js LTS (v20 yoki v22+)** versiyasini o'rnating (`https://nodejs.org`).
2. PowerShell yoki Command Prompt (CMD) oynasini ochib, tekshiring:
   ```powershell
   node -v
   npm -v
   ```

### 1.2. Loyihani o'rnatish va ma'lumotlar bazasini tayyorlash
Loyiha papkasiga kirib quyidagi buyruqlarni ketma-ket bajaring:

```powershell
# 1. Paketlarni o'rnatish
npm install

# 2. SQLite ma'lumotlar bazasini sozlash (idempotent migratsiya: ./data/app.db)
npm run setup

# 3. Production uchun loyihani yig'ish
npm run build

# 4. Serverni ishga tushirish (0.0.0.0:3000 orqali barcha LAN kompyuterlar uchun ochiq bo'ladi)
npm start
```

### 1.3. Boshlang'ich administratorni yaratish (/setup)
1. Server yoki o'quv xonasi kompyuterida brauzerni oching: `http://<server-LAN-IP>:3000` (yoki mahalliy serverda `http://localhost:3000`).
2. Tizimda hali administrator bo'lmagani sababli u avtomatik ravishda `/setup` sahifasiga yo'naltiradi.
3. Administratorning to'liq ismi, login va paroli (kamida 8 belgi) kiritiladi.
4. Birinchi administrator yaratilgach, `/setup` sahifasi xavfsizlik maqsadida butunlay yopiladi va `/login` ga yo'naltiriladi.

---

## 2. O'quv xonasidagi kompyuterlardan (LAN) ulanish

1. Server kompyuterda **PowerShell** yoki **CMD** oynasini oching va quyidagi buyruqni yozing:
   ```powershell
   ipconfig
   ```
2. Ro'yxatdan **IPv4 Address** qatorini toping (masalan: `192.168.1.100`).
3. Windows Firewallda `3000`-portga ruxsat bering (PowerShell Administrator sifatida):
   ```powershell
   New-NetFirewallRule -DisplayName "Avtomaktab LAN 3000" -Direction Inbound -LocalPort 3000 -Protocol TCP -Action Allow
   ```
4. O'quv xonasidagi (10+ ta) barcha o'quvchi kompyuterlarida brauzerni ochib quyidagi manzilni kiriting:
   ```text
   http://192.168.1.100:3000
   ```

---

## 3. Windows xizmati (Service) sifatida avtomatik ishga tushirish

Kompyuter yonganda platforma avtomatik ishlashi uchun **PM2** yoki **NSSM** dan foydalanish mumkin:

### Variant A: PM2 orqali
```powershell
npm install -g pm2 pm2-windows-startup
pm2-startup install
pm2 start npm --name "avtomaktab" -- start
pm2 save
```

### Variant B: NSSM (Non-Sucking Service Manager) orqali
1. `nssm.exe` dasturini yuklab oling va `C:\Windows\System32` ichiga joylang.
2. Administrator CMD oynasida:
   ```powershell
   nssm install Avtomaktab
   ```
3. Ochilgan oynada:
   - **Path:** `C:\Program Files\nodejs\npm.cmd`
   - **Startup directory:** loyiha joylashgan papka (masalan, `C:\avtomaktab`)
   - **Arguments:** `run start`
4. **Install service** tugmasini bosing va xizmatni yoqing:
   ```powershell
   nssm start Avtomaktab
   ```

---

## 4. Savollarni JSON fayldan yuklash

Savollarni ommaviy tarzda JSON fayldan yuklash uchun:
```powershell
npm run import:questions -- docs/sample-import.json
```
Format tavsifi `docs/import-format.md` faylida keltirilgan.

---

## 5. Bulutga (Vercel + Turso) joylashtirish

Aynan shu kod bazasi hech qanday o'zgarishsiz **Vercel** va **Turso (LibSQL)** bulutida ham ishlaydi:

1. **Turso** (`https://turso.tech`) da yangi ma'lumotlar bazasi yarating va `DATABASE_URL` (`libsql://...`) hamda `DATABASE_AUTH_TOKEN` qiymatlarini oling.
2. Lokal kompyuterda ushbu `.env` o'zgaruvchilar bilan migratsiyani bajaring:
   ```powershell
   $env:DATABASE_URL="libsql://your-db.turso.io"
   $env:DATABASE_AUTH_TOKEN="your-turso-token"
   npm run setup
   ```
3. Loyihani GitHub'ga yuklang va **Vercel** ga ulang.
4. Vercel Environment Variables bo'limiga quyidagilarni kiriting:
   - `DATABASE_URL` = `libsql://your-db.turso.io`
   - `DATABASE_AUTH_TOKEN` = `your-turso-token`
5. Rasmlarni bulutda saqlash kerak bo'lsa, faqatgina `src/lib/storage.ts` modulidagi `saveUploadedFile` funksiyasini `@vercel/blob` ga almashtirish kifoya.
