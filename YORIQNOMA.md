# Avtomaktab platformasini o'rnatish — boshlovchilar uchun yo'riqnoma

Bu yo'riqnoma dasturlashni bilmaydigan odam uchun yozilgan. Qadamlarni tartib bilan bajaring, hech birini o'tkazib yubormang.
Hammasi bo'lib taxminan **30–40 daqiqa** ketadi (asosan yuklab olishga).

---

## Bu nima va qanday ishlaydi?

- Markazdagi **bitta kompyuter "server"** bo'ladi. Platforma shu kompyuterda ishlaydi va barcha savollar, o'quvchilar, natijalar shu kompyuterda saqlanadi.
- Qolgan kompyuterlar va telefonlar **markazdagi Wi-Fi orqali** brauzerda (Chrome) shu serverga kiradi. Ularga hech narsa o'rnatish shart emas.
- **Internet shart emas** — faqat bitta Wi-Fi (router) bo'lsa yetadi. Internet faqat o'rnatish va yangilash paytida kerak.

**Server kompyuter qanday bo'lishi kerak:** Windows 10 yoki 11, kamida 8 GB operativ xotira (RAM), markaz Wi-Fi'siga ulangan, dars paytida doim yoqilgan turadigan kompyuter.

---

## 1-qadam. Kerakli dasturlarni o'rnatish (bir marta)

Server kompyuterda 3 ta dastur o'rnatiladi. Har birida o'rnatuvchi oynada **"Next" → "Next" → "Install" → "Finish"** bosib ketaverasiz, hech narsani o'zgartirmang.

1. **Node.js** — platformani ishga tushiradigan dastur.
   - https://nodejs.org saytini oching → **"LTS"** deb yozilgan katta yashil tugmani bosing → yuklangan faylni oching → o'rnating.
2. **Git** — kodni GitHub'dan yuklab oladigan dastur.
   - https://git-scm.com/download/win saytini oching → **"Click here to download"** → yuklangan faylni oching → hamma oynada "Next" bosib o'rnating.
3. **Google Antigravity** — sun'iy intellekt yordamchisi (o'rnatishni siz uchun qiladi).
   - https://antigravity.google saytini oching → Windows uchun yuklab oling → o'rnating → Google akkauntingiz bilan kiring.

> O'rnatib bo'lgach **kompyuterni bir marta qayta yoqing (Restart)**. Bu muhim: aks holda yangi dasturlar ko'rinmasligi mumkin.

---

## 2-qadam. Platformani Antigravity yordamida yuklab olish

1. **"Hujjatlar" (Documents)** papkasida yangi papka yarating, nomi: `avtomaktab`.
2. Antigravity'ni oching → **"Open Folder"** → yaratgan `avtomaktab` papkangizni tanlang.
3. Antigravity'ning suhbat (chat) oynasiga quyidagi matnni **to'liq nusxalab qo'ying** va yuboring:

```text
Men dasturchi emasman, hamma ishni o'zing qil va menga oddiy tilda tushuntir.
1. Shu papkaga https://github.com/miuceo/avtomaktab-platform.git reponi klon qil (papkaning o'ziga, ichiga yangi papka ochmasdan).
2. README.md va YORIQNOMA.md fayllarini o'qi.
3. Node.js va Git o'rnatilganini tekshir. Agar yo'q bo'lsa, winget orqali o'rnat (Node.js LTS va Git).
4. npm install, keyin npm run build buyruqlarini ishga tushir. Xato chiqsa, o'zing tuzat.
5. Kodning o'zini o'zgartirma. data papkasini hech qachon o'chirma.
6. Oxirida menga nima qilganingni va serverni qanday ishga tushirishni qisqa tushuntir.
```

4. Antigravity buyruqlarni bajarishga ruxsat so'rasa — **"Accept" / "Allow" / "Run"** bosing.
5. U ishini tugatib, natijani yozguncha kuting (5–15 daqiqa).

> Agar Antigravity "quota", "limit" yoki "429" degan xato bersa — chat tepasidagi model tanlash joyidan boshqa modelni tanlang va "davom et" deb yozing.

---

## 3-qadam. Serverni ishga tushirish

1. `avtomaktab` papkasini oching (Windows Explorer'da).
2. **`1-ishga-tushirish.bat`** fayliga ikki marta bosing. Qora oyna ochiladi.
3. Oynada `Ready` yoki `started server` degan yozuv chiqguncha kuting.
4. **Windows "Brandmauer / Firewall" oynasi chiqsa** — ikkala katakchani belgilang ("Private" va "Public") va **"Allow access" (Ruxsat berish)** bosing. Shusiz boshqa kompyuterlar kira olmaydi.

> **Qora oynani YOPMANG** — u yopilsa platforma to'xtaydi. Oynani shunchaki pastga yig'ib qo'ying (minimize).

---

## 4-qadam. Birinchi administratorni yaratish (bir marta)

1. Server kompyuterning o'zida Chrome'ni oching va manzil qatoriga yozing: **`localhost:3000`**
2. "Tizimni sozlash" sahifasi chiqadi. Ismingiz, login va parol (kamida 8 belgi) kiriting.
3. **Login va parolni qog'ozga yozib, xavfsiz joyda saqlang.** Bu bosh administrator — u yo'qolsa tiklash qiyin.
4. "Administratorni yaratish" bosing — admin panel ochiladi.

---

## 5-qadam. Boshqa kompyuterlarga havola berish

1. Admin panel bosh sahifasida **"Platformaga kirish havolasi"** bo'limi bor. U yerda `http://192.168.x.x:3000` ko'rinishidagi manzil turadi.
2. **"Nusxalash"** bosing va shu manzilni ustoz va o'quvchilarga bering (Telegram orqali yoki doskaga yozib).
3. Boshqa kompyuterda Chrome'ni ochib, shu manzilni yozadi → login sahifasi chiqadi.
4. Qulaylik uchun har bir kompyuterda shu sahifani **Chrome "Bookmark" (yulduzcha)** qilib qo'ying.

> Telefon yoki kompyuter **xuddi shu Wi-Fi'ga** ulangan bo'lishi shart.

---

## 6-qadam. Platformani to'ldirish (admin)

Tartib muhim:

1. **Foydalanuvchilar** → ustozlarni qo'shing (rol: O'qituvchi). Har bir ustozga login-parol berasiz.
2. **Guruhlar** → "Yangi guruh yaratish" → nom (masalan, `101-guruh`) va ustozni tanlang.
3. Guruhda **"O'quvchilarni ommaviy qo'shish"** → o'quvchilar ism-familiyasini **har qatorga bittadan** yozing → tizim har biriga login va parol yaratadi → **"Chop etish"** bosib, qog'ozga chiqaring va o'quvchilarga tarqating. Parollar faqat bir marta ko'rsatiladi!
4. **Mavzular** → mavzular qo'shing (masalan, "Yo'l belgilari", "Chorrahalar").
5. **Savollar** → savollar qo'shing (har birida bitta to'g'ri javob). Ustozlar ham savol qo'sha oladi.
6. **Testlar** (ustoz yoki admin) → "Yangi test yaratish" → nom, vaqt (daqiqa), savollarni belgilang.

**Testni berish:**
- **Umumiy test** — ustoz guruhni tanlab "Boshlash" bosadi. Hammada bir vaqtda tugaydi. Kech kirgan o'quvchiga faqat qolgan vaqt beriladi. Kirmagan o'quvchi "Kelmadi" deb belgilanadi.
- **Ixtiyoriy test** — guruhga ochib qo'yiladi, o'quvchilar xohlagan payt, xohlagancha topshiradi. Ustoz yopguncha ochiq turadi.

Natijalar ustoz panelida: **Testlar** → test nomini bosing.

O'quvchi kirgandan **3 soat o'tgach tizimdan avtomatik chiqariladi** — qayta login qilsa bo'ldi.

---

## Har kuni qilinadigan ish

| Qachon | Nima qilish kerak |
|---|---|
| Ertalab | Server kompyuterni yoqing → `1-ishga-tushirish.bat` ni ikki marta bosing |
| Kechqurun | Qora oynani yoping → kompyuterni o'chirsangiz bo'ladi |
| Haftada bir marta | `zaxira-nusxa.bat` ni ikki marta bosing (pastga qarang) |

---

## Ma'lumotlar xavfsizligi — zaxira nusxa

- Barcha savollar, o'quvchilar va natijalar **`data\app.db`** faylida, rasmlar **`public\uploads`** papkasida saqlanadi. Kompyuter o'chib-yonsa ham, server qayta ishga tushsa ham hech narsa yo'qolmaydi.
- **`data` papkasini hech qachon o'chirmang va ko'chirmang.**
- Haftada bir marta **`zaxira-nusxa.bat`** ni ikki marta bosing → `zaxira` papkasida sana bilan nusxa paydo bo'ladi. Shu `zaxira` papkasini vaqti-vaqti bilan **fleshkaga yoki Google Drive'ga** ko'chirib qo'ying (kompyuter buzilsa ham ma'lumot qoladi).

**Zaxiradan tiklash:** serverni to'xtating → `zaxira\<sana>\app.db` faylini nusxalab, `data` papkasiga qo'ying (eskisini almashtiring) → serverni qayta ishga tushiring.

---

## Platformani yangilash (yangi versiya chiqqanda)

1. Server qora oynasini yoping.
2. **`yangilash.bat`** ni ikki marta bosing — avval o'zi zaxira oladi, keyin yangi kodni yuklab, tayyorlaydi (internet kerak).
3. Tugagach, `1-ishga-tushirish.bat` ni oching.

Ma'lumotlaringiz (savollar, o'quvchilar) yangilashda **o'chmaydi**.

---

## Server kompyuter sozlamalari (bir marta, tavsiya)

1. **Uyquga ketmasin:** Windows Sozlamalar → Tizim → Quvvat (Power) → "Ekran o'chganda uyquga ketish" → **Hech qachon (Never)**.
2. **Manzil o'zgarmasin:** router qayta yoqilganda `192.168.x.x` manzili o'zgarib qolishi mumkin. Shunda admin paneldagi yangi havolani qaytadan tarqatish kerak. Buning oldini olish uchun Wi-Fi'ni o'rnatgan ustadan **"server kompyuterga doimiy IP (DHCP reservation) qo'yib bering"** deb so'rang.
3. **Wi-Fi tarmog'i "Private" bo'lsin:** Windows Sozlamalar → Tarmoq va Internet → Wi-Fi → ulangan tarmoq nomi → **"Shaxsiy tarmoq (Private network)"** ni tanlang.

---

## Muammo chiqsa

| Muammo | Yechim |
|---|---|
| Boshqa kompyuterdan ochilmayapti | 1) Server qora oynasi ochiqmi? 2) Ikkala kompyuter bitta Wi-Fi'dami? 3) Firewall'da ruxsat berilganmi (pastga qarang). 4) Admin paneldagi havolani qaytadan tekshiring — manzil o'zgargan bo'lishi mumkin. |
| Firewall oynasida "Allow" bosilmay qolgan | Windows qidiruviga "Брандмауэр" / "Firewall" yozing → "Allow an app through firewall" → **Node.js** ni toping → ikkala katakchani belgilang. |
| Qora oyna ochilib darrov yopiladi yoki xato yozadi | Antigravity'ni `avtomaktab` papkasida oching va yozing: *"1-ishga-tushirish.bat ishlamayapti, sababini topib tuzat. data papkasiga tegma."* |
| "Port 3000 is already in use" | Server allaqachon ochiq (boshqa qora oyna). Ortiqcha oynani yoping yoki kompyuterni qayta yoqing. |
| Admin parolini unutdim | Boshqa admin bo'lsa — u "Foydalanuvchilar" bo'limida parolni almashtiradi. Bo'lmasa — Antigravity'ga: *"data/app.db dagi admin parolini yangilashga yordam ber"* deb yozing. |
| O'quvchi parolini unutdi | Ustoz yoki admin guruh sahifasida shu o'quvchi uchun **parolni tiklaydi** — yangi parol ko'rsatiladi. |
| Boshqa har qanday muammo | Antigravity'ni `avtomaktab` papkasida oching, muammoni oddiy so'z bilan yozing va oxirida qo'shing: *"Kodni ehtiyot bo'lib o'zgartir, data papkasini o'chirma."* |

---

**Muhim eslatmalar:**
- `data` papkasi — markazning butun ma'lumoti. Uni o'chirmang, boshqalarga bermang.
- Admin login-parolini o'quvchilarga ko'rsatmang.
- Platforma kodi: https://github.com/miuceo/avtomaktab-platform
