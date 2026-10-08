# Ish-reja (Development Plan) — Daangn tahlili asosida

Sana: 2026-10-08. Bu hujjat `04-daangn-github-tahlili.md` (kod/texnik) va
`01-product.md`'ni **Daangn'ning real o'sish/biznes strategiyasi** bilan
boyitib, joriy kod holatiga qarab aniq sprint-reja chiqaradi.

## 1. Daangn'dan qo'shimcha saboqlar (biznes/o'sish, 2024-2026 ma'lumotlari)

| Saboq | Manba | MahallaMarket uchun xulosa |
|---|---|---|
| **Cold start**: Pangyo Market email tasdiqlash bilan tor, tekshiriladigan bozordan boshlandi — faqat "yetarli hajmda haftalik faol foydalanuvchi" (~1000) bo'lgandan keyin qo'shni hududga kengaydi | injoys.com tahlili | Pilot — **bitta tuman, bitta-ikkita MFY**. Keyingi MFY/tumanga faqat metrikaga (haftalik faol, qayta tranzaksiya) erishgandan keyin kengaytiramiz, hammasini birdan ochmaymiz |
| **Pul ishlash modeli**: tranzaksiya komissiyasi YO'Q (2-qo'l savdo bepul); daromad ~99% mahalliy reklama (do'kon/biznes hudud bo'yicha reklama)dan | namu.wiki, injoys.com | `03-next-steps`ga qo'shamiz: MVP'da pullik funksiya yo'q. Keyingi bosqich — "mahalla biznes profili + joylashgan reklama" (hudud bo'yicha targeting), komissiya emas |
| **GPS orqali mahalla tasdiqlash majburiy** — faqat fizik o'zi turgan joyda tasdiqlay oladi, vaqt o'tib muddati tugaydi, qayta tasdiqlash kerak | karrotmarket FAQ | MVP'dan keyin: `regionId`ni qo'lda tanlashdan tashqari, GPS+PostGIS orqali "mahallani tasdiqlash" funksiyasi, muddat (masalan 90 kun) bilan |
| **Heart Meter / Manner Temperature — real vaqtda, so'nggi harakatlarga asoslangan**, statik 5-yulduz emas | kfinancedecoded.com | Bizda `temperature` ustuni bor (36.5 boshlang'ich) — formula `02-product.md`da mavjud. Qo'shimcha: profilda "qo'shilgan sana, tasdiqlash soni, qayta-tranzaksiya darajasi" ko'rsatish (past haroratni tekshirish uchun kontekst) |
| **Xavfsizlik qoidalari**: muloqotni ilova ichida saqlash (chat tashqarisiga chiqmaslik), ochiq/yorug' joyda uchrashish tavsiyasi, oldindan to'lov qilmaslik ogohlantirishi | karrotmarket "Trade with confidence" | Chat modulida: avtomatik ogohlantirish xabari ("Oldindan to'lov qilmang, ochiq joyda uchrashing"), shikoyat tugmasi chatda doim ko'rinadi |
| **Ish e'lonlari (Alba)** — 700m radius bo'yicha ustunlik, ish beruvchilarning 85%+ 1 haftada yopadi | mk.co.kr | Bizning 2-faza emas, 3-faza (Mahsulot spec: "2-bosqich: mahalliy xizmatlar, vakansiyalar") — lekin radius-ustunlik g'oyasini e'lon lentasida ham ishlatish mumkin ("mening MFY'im birinchi, keyin tuman") |
| **IA/kategoriyalar**: Ikkinchi qo'l, Ko'chmas mulk, Avto, Ish/repetitor, Mahalliy biznes, Mahalla hayoti, Guruhlar, Kafe — bosqichma-bosqich qo'shilgan, bitta "savdo" ustida qurilgan | rezero.md tahlili | Roadmap'ga mos: Faza 1 — faqat 2-qo'l savdo + tekin berish. Keyingi fazalarda vertikallarni **alohida modul** qilib qo'shish (monolit emas, lekin hozircha NestJS modullari ichida ajratilgan bo'lsa kifoya — mikroservisga hali ehtiyoj yo'q, hajm kichik) |

## 2. Joriy kod holati (tekshirildi, 2026-10-08)

**Tayyor va ishlaydi:**
- `apps/api`: NestJS + Drizzle, docker-compose (postgres/redis/minio), migratsiya+seed
- Modullar: `auth` (OTP so'rov/tasdiqlash — dev kodi `123456`, JWT, `/auth/me` GET/PATCH), `regions`, `categories`, `listings` (CRUD, filtr, holat)
- DB sxema: `users, regions, categories, listings, listingImages, favorites, chatRooms, messages, reviews, reports` — **hammasi sxemada bor**, lekin faqat `users/regions/categories/listings` uchun API modul yozilgan
- `apps/app` (Stackflow+SEED): Feed, Listing, NewListing, Chat, NotFound activity'lari bor, hozircha demo/statik ma'lumot bilan (`demo-data.ts`) + real API fallback
- `apps/web` (Next.js): bosh sahifa API'dan `listings` o'qiydi
- GitHub (private repo) va Netlify (`apps/web`) ga joylandi

**Yo'q / stub holatida (sxema bor, API/UI yo'q):**
- Rasm yuklash (MinIO presigned URL) — hali yo'q
- Chat (WebSocket/Socket.IO) backend moduli — yo'q
- Reviews (baho/sharh) va harorat qayta hisoblash — yo'q
- Favorites (tanlanganlar) endpoint — yo'q
- Reports (shikoyat) endpoint — yo'q
- Haqiqiy SMS (Eskiz.uz) — hozir faqat log, real yuborilmaydi
- Ilovada: real login oqimi (`LoginActivity` — telefon+OTP kirish ekrani) — yo'q, ilova hali auth qilmaydi
- Mahalla tanlash ekrani (`PATCH /auth/me` bilan) — yo'q

## 3. Sprint-reja (aniq vazifalar)

### Sprint 1.3 — Auth + mahalla tanlash (ilova tomoni) — ✅ Bajarildi (2026-10-08)
1. ✅ `apps/app`: `LoginActivity` — telefon raqam kiritish → `POST /auth/otp/request` → kod kiritish ekrani (60s cooldown) → `POST /auth/otp/verify` → `accessToken`'ni `localStorage`da saqlash
2. ✅ Stackflow stack konfiguratsiyasiga `LoginActivity`/`RegionSelectActivity` qo'shildi (`/kirish`, `/mahalla`), `AuthProvider` (`src/auth/AuthContext.tsx`) butun ilovani o'raydi
3. ✅ `api/client.ts`ga `Authorization: Bearer` header (auth so'rovlarida), token eskirsa `getMe()` null qaytarib avtomatik tozalanadi
4. ✅ Mahalla tanlash ekrani: `GET /regions` bilan 3 bosqichli drill-down (viloyat→tuman→MFY, breadcrumb bilan) → `PATCH /auth/me { regionId }`
5. ✅ Lenta sarlavhasida tanlangan mahalla nomi (`GET /regions/:id`), bosilganda tanlash ekraniga o'tadi; auth bo'lmasa avval Login'ga yo'naltiradi
6. ✅ `NewListingActivity` haqiqiy `POST /listings`ga ulandi (auth token + foydalanuvchi mahallasi bilan); lenta qaytganda `activity.isActive` orqali avtomatik yangilanadi

**Brauzerda to'liq sinovdan o'tkazildi:** OTP login → mahalla tanlash → e'lon yaratish → lentada ko'rinishi — barchasi haqiqiy API orqali ishlayapti (demo ma'lumotlarsiz).

### Sprint 1.4 — Rasm yuklash — ~3-4 kun
6. API: `POST /uploads/presign` (MinIO/S3 presigned PUT URL qaytaradi), limit: 10 rasm, JPEG/PNG/WebP, 5MB
7. Rasm yuklangandan keyin WebP'ga siqish (worker yoki to'g'ridan-to'g'ri, MVP uchun oddiy sharp bilan sinxron ham bo'ladi)
8. `listings.images` jadvaliga yozish, `POST /listings`ga `imageIds`/`imageUrls` qo'shish
9. `NewListingActivity`: kamera/galereya tanlash, oldindan ko'rish, yuklash progressi

### Sprint 2.1 — Chat moduli — ~1 hafta
10. API: `chat` modul — `ChatRoom`/`Message` uchun REST (`POST /chat/rooms` e'lon bo'yicha ochish, `GET /chat/rooms`, `GET /chat/rooms/:id/messages`) + Socket.IO gateway (`message:send`, `message:new`, `room:read`)
11. Xavfsizlik: xabar yuborishda avtomatik "Oldindan to'lov qilmang" ogohlantirish birinchi xabarda
12. `ChatActivity`: ro'yxat + real vaqt xabarlar, o'qilgan belgisi
13. Bildirishnoma: yangi xabar kelganda Telegram bot orqali (agar ulangan bo'lsa) yoki keyinroq Web Push

### Sprint 2.2 — Ishonch: baho + harorat — ~3-4 kun
14. API: `POST /listings/:id/reviews` (faqat SOLD holatidagi e'lon, bitimda qatnashgan ikki tomon), `GET /users/:id/reviews`
15. Harorat qayta hisoblash: review yaratilganda `02-product.md`dagi formula bo'yicha `users.temperature` yangilanadi (BullMQ job yoki to'g'ridan-to'g'ri, hajm kichik bo'lgani uchun sinxron yetarli)
16. Profilda harorat + "qo'shilgan sana" ko'rsatish (past haroratni tekshirish konteksti — Daangn saboqi)

### Sprint 2.3 — Moderatsiya — ~2-3 kun
17. API: `POST /reports` (LISTING/USER/MESSAGE), admin uchun oddiy `GET /reports?status=OPEN`
18. Taqiqlangan so'zlar/kategoriya filtri e'lon yaratishda (oddiy ro'yxat asosida, ML keyinroq)
19. Chatda "Shikoyat qilish" tugmasi doim ko'rinadi

### Sprint 3 — Pilot tayyorligi — ~2 hafta
20. Eskiz.uz haqiqiy SMS integratsiyasi (BullMQ navbati, retry)
21. Pilot tuman uchun to'liq MFY ro'yxati import (`05-hududlar.md` — manba tanlanadi)
22. Staging muhit (O'zbekiston hostingi), Sentry, kunlik backup
23. Analitika: haftalik faol foydalanuvchi, e'lon→chat konversiyasi, bitim yakunlash % (muvaffaqiyat ko'rsatkichlari, `01-product.md` §5)
24. Yopiq beta: 20-30 real foydalanuvchi, bitta MFY/tuman — **Daangn cold-start saboqi**: avval hajmni tekshirib, keyin kengaytirish

## 4. Monetizatsiya (keyinroq, MVP'dan tashqarida — Daangn modeliga mos)
- Tranzaksiya komissiyasi **yo'q** (ishonchni buzmaslik uchun)
- Kelajakda: mahalliy biznes profili + hudud bo'yicha reklama joylashtirish (pullik), Daangn'ning asosiy daromad manbai (~99%) shu
- To'lov integratsiyasi (Payme/Click) — faqat agar "xavfsiz to'lov" funksiyasi qo'shilsa, ixtiyoriy, komissiyasiz emas

## 5. Keyingi harakat
Ushbu reja tasdiqlansa, **Sprint 1.3 (Auth + mahalla tanlash)** dan boshlanadi — bu `apps/app`da eng katta yetishmayotgan foydalanuvchi oqimi va keyingi barcha funksiyalar (e'lon yaratish egasi, chat, baho) shunga bog'liq.
