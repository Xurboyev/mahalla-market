# Arxitektura

## Stek
- **Ilova (apps/app):** Vite + React 19 + **Stackflow** (Daangn, MIT) + **SEED Design** (Daangn, Apache-2.0) o'z yashil brend temamiz bilan. Daangn'ning o'zi kabi: ilova ichidagi ekranlar SPA/WebView, PWA. *Qaror 2026-10-03.*
- **Web (apps/web):** Next.js — faqat SEO uchun ochiq sahifalar (e'lon, mahalla, landing), i18n (`uz`, `ru`).
- **API:** NestJS 10 (TypeScript), REST + WebSocket (Socket.IO) chat uchun, Swagger/OpenAPI.
- **DB:** PostgreSQL 16 + PostGIS (geolokatsiya) + `pg_trgm` (qidiruv). ORM: **Drizzle** (drizzle-orm + drizzle-kit). *Qaror 2026-10-03:* Prisma o'rniga — native binar yuklamaydi (cheklangan tarmoq/Docker'da muammosiz), SQL'ga yaqin, PostGIS turlarini qo'llaydi.
- **Kesh/navbat:** Redis (OTP, rate-limit, sessiya, BullMQ navbatlari).
- **Fayl:** S3-mos saqlash (MinIO lokal, prod: Selectel/AWS S3), rasm → WebP, thumbnaillar.
- **Bildirishnoma:** SMS (Eskiz.uz), Telegram Bot, Web Push.
- **Kuzatuv:** Sentry, Prometheus + Grafana, JSON loglar (pino).

## Komponentlar
```
Browser/PWA ──► Nginx/Caddy ──► Next.js (SSR)
                         └────► NestJS API ──► PostgreSQL(+PostGIS)
                                   │  ├──────► Redis (cache, queue)
                                   │  └──────► S3 / MinIO (rasmlar)
                                   └ WebSocket (chat)
Worker (BullMQ): SMS, rasm qayta ishlash, push, haroratni qayta hisoblash
```

## Monorepo tuzilishi
```
apps/api      NestJS (modullar: auth, users, regions, listings, chat, reviews, reports)
apps/app      Vite + Stackflow + SEED (mobil ilova qobig'i)
apps/web      Next.js (SEO sahifalar)
packages/     (keyin) shared types, ui
infra/        docker, nginx, k8s/terraform (keyin)
docs/         hujjatlar
```

## Ma'lumotlar modeli (asosiy)
`User` (phone, name, avatar, mahallaId, temperature) · `Region` (viloyat→tuman→MFY, daraxt, PostGIS nuqta) · `Category` · `Listing` (sellerId, regionId, title, description, price, isFree, status, geo, createdAt) · `ListingImage` · `Favorite` · `ChatRoom`/`Message` · `Review` (listingId, reviewerId, targetId, rating, text) · `Report` · `OtpCode` (Redis).
To'liq sxema: `apps/api/src/db/schema.ts`, migratsiyalar: `apps/api/drizzle/`.

## Xavfsizlik
OTP rate-limit (Redis), JWT access (15 daq) + refresh (30 kun, rotatsiya), telefon raqami boshqa foydalanuvchilarga ko'rsatilmaydi, rasm MIME/hajm tekshiruvi, Helmet, CORS ro'yxati, GDPR-ga o'xshash o'chirish (O'zbekiston "Shaxsga doir ma'lumotlar to'g'risida"gi qonun: ma'lumotlar mahalliy serverlarda saqlanishi talabi hisobga olinadi — **prod hosting O'zbekistonda bo'lishi kerak**).

## DevOps
- **Branch:** `main` (prod), `develop` (staging), feature branchlar → PR.
- **CI (GitHub Actions):** lint → typecheck → test → build → Docker image (GHCR).
- **CD:** staging avtomatik, prod qo'lda tasdiq bilan. Boshlanishida Docker Compose + bitta VPS; o'sganda Kubernetes.
- **Muhitlar:** local (docker compose), staging, production. `.env` sirlari — GitHub Secrets / Vault.
- **Zaxira:** PostgreSQL kunlik `pg_dump` + WAL arxiv, S3 versiyalash.
- **Migratsiyalar:** dev — `npm run db:generate` / `db:migrate`; prod konteyner ishga tushganda `node dist/db/migrate.js`.

## Roadmap
| Bosqich | Muddat | Natija |
|---|---|---|
| 0. Poydevor | 1–2 hafta | Repo, CI, docker, auth (OTP), hududlar importi |
| 1. E'lonlar | 3–4 hafta | CRUD, rasm, qidiruv, tanlanganlar |
| 2. Chat + ishonch | 3 hafta | WebSocket chat, baho, harorat, bildirishnoma |
| 3. Pilot | 2 hafta | Bitta tuman, moderatsiya, analitika, yopiq beta |
| 4. O'sish | davomiy | Mobil ilova, biznes profillari, to'lov |
