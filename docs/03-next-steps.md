# Keyingi qadamlar

## Bajarildi
- [x] Monorepo skeleti: NestJS API, Next.js, Docker, CI (2026-10-03)
- [x] Daangn GitHub tahlili
- [x] `apps/app`: Stackflow + SEED, o'z yashil temasi, 4 ekran
- [x] **Ma'lumotlar bazasi (Sprint 1.1):** Prisma → Drizzle, birinchi migratsiya, seed (14 viloyat, Toshkent tumanlari, pilot mahallalar, 8 kategoriya, demo e'lonlar), SOATO CSV importer
- [x] **API (Sprint 1.2):** hududlar, kategoriyalar, e'lonlar (ichki hududlar bo'yicha filtr, yaratish, holat), `/auth/me`
- [x] Ilova lentasi va e'lon sahifasi haqiqiy API'dan o'qiydi (API bo'lmasa demo)

## Sprint 1 (davomi)
1. **Hududlar manbasini tanlash** va pilot tuman MFY ro'yxatini import qilish (docs/05-hududlar.md).
2. Ilovada kirish oqimi: telefon → OTP (`LoginActivity`), tokenni saqlash.
3. Mahalla tanlash ekrani (lenta sarlavhasidagi "Yunusobod-4 ▾") → `PATCH /auth/me`, lenta `regionId` bilan.
4. `NewListingActivity` → `POST /api/listings`; rasm yuklash (presigned URL, MinIO), WebP siqish.
5. Eskiz.uz SMS (BullMQ), OTP rate-limit, refresh token.

## Sprint 2
6. Chat moduli (Socket.IO) → `ChatActivity`, chatlar ro'yxati, pastki tab navigatsiya.
7. Sharh va Mahalla harorati qayta hisoblash.
8. Qidiruv (pg_trgm), tanlanganlar.
9. Staging (O'zbekistonda hosting), Sentry, zaxira.
