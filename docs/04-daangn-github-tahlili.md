# Daangn GitHub (github.com/daangn) tahlili va MahallaMarket'ga qo'llash

Sana: 2026-10-03. Daangn'ning ochiq kodi faqat **frontend va infra vositalari**. Bozor platformasining backend kodi (e'lonlar, chat, harorat) ochiq emas, shuning uchun biznes logikani o'zimiz yozamiz.

## Asosiy repozitoriylar

| Repo | Nima | Litsenziya | MahallaMarket uchun qaror |
|---|---|---|---|
| **stackflow** (~1k ⭐) | Mobil ilovadagidek stack navigatsiya (ekranlar ustma-ust, scroll holati saqlanadi, iOS swipe-back). Core / React / plaginlar ajratilgan, SSR qo'llab-quvvatlanadi | MIT | ✅ **Qabul qilamiz.** Web/PWA ilova qobig'i Stackflow'da: bosh lenta → e'lon → chat ekranlari. Daangn ilovasidagi tajribaning asosi shu |
| **seed-design** (~1k ⭐) | Daangn dizayn tizimi: tokenlar, `@seed-design/react`, headless komponentlar, Tailwind plagini, `@seed-design/stackflow` | Apache-2.0 | ⚠️ **Ehtiyot bilan.** Kod ishlatsa bo'ladi (NOTICE saqlanadi), lekin Karrot brendi (to'q sariq rang, logo, ikonlar) ishlatilmaydi. Avval spike: o'z rang/tokenlarimiz bilan qayta temalash mumkinmi? Bo'lmasa, SEED tuzilmasi asosida o'z tokenlarimizni Tailwind'da yaratamiz |
| **websites** | about/ir/careers saytlari monoreposi: Yarn workspaces, Biome lint/format | Apache-2.0 | ✅ Konvensiyalarni olamiz: workspaces monorepo, **Biome** (ESLint+Prettier o'rniga) |
| **metabridge** | Native ilova ↔ WebView o'rtasida JSON Schema asosidagi aloqa | MIT | 🔜 Native (Android) qobiq qilganda: kamera, push, geolokatsiya ko'prigi |
| **graplix** | ReBAC (munosabatga asoslangan ruxsatlar) — `.graplix` sxema, `engine.check()` | MIT | 🔜 Faza 2: biznes profillari, mahalla moderatorlari. MVP'da oddiy RBAC (user/admin) yetarli |
| **ventyd** | TypeScript event sourcing kutubxonasi | — | 🔜 E'lon holati tarixi va harorat o'zgarishlari auditi uchun ko'rib chiqiladi |
| **juso-edge** | Koreya manzil API'si uchun kesh-proksi (Cloudflare Workers) | — | 📌 Saboq: tashqi davlat API'lari bulut IP'larini bloklashi mumkin → hudud/manzil ma'lumotlarini (SOATO kodlari) **o'z bazamizga import** qilamiz va statik IP'li serverdan xizmat qilamiz |
| **plantae** | HTTP klientlar uchun middleware generator | — | Ixtiyoriy: web'dagi API klientida auth/refresh middleware |
| **cjk-slug**, **permalink** | URL slug va doimiy havola spetsifikatsiyasi | — | 📌 G'oya: SEO uchun `/e/{slug}-{id}` ko'rinishidagi doimiy havolalar (lotin/kirill transliteratsiya bilan) |
| **KarrotListKit, KarrotFlex, ScreenShieldKit** | iOS (Swift) UI kutubxonalari | — | Hozircha kerak emas (iOS native keyinroq) |
| **autopprof, kinesumer, minimemcached** | Go infra vositalari | — | Daangn backendi asosan Go/Kotlin ekanini ko'rsatadi. Biz NestJS bilan boshlaymiz; yuklama oshganda og'ir servislar (qidiruv, feed) Go'ga ko'chirilishi mumkin |
| **digital-garden** | Ochiq bilim bazasi (2026-03 da arxivlangan) | MIT | Jamoa madaniyati uchun ma'lumot sifatida |

## Arxitekturaga kiritiladigan o'zgarishlar
1. **apps/web:** Next.js qoladi (SEO: ochiq e'lon sahifalari, mahalla sahifalari server tomonda render qilinadi). Ilova ichidagi ekranlar (lenta, e'lon, chat, profil) — **Stackflow** client qobig'i (`@stackflow/core`, `@stackflow/react`, basic-ui va history-sync plaginlari).
2. **Dizayn:** SEED'ni qayta temalash spike'i (1–2 kun). Natijaga qarab SEED (o'z temamiz bilan) yoki Tailwind + o'z tokenlarimiz.
3. **Tooling:** npm workspaces + Biome.
4. **Hududlar:** SOATO bo'yicha viloyat/tuman/MFY ro'yxatini bir martalik import qilish; tashqi API'ga real vaqtda bog'lanmaslik.
5. **Ruxsatlar:** MVP — RBAC; Faza 2 — graplix (ReBAC).

## Huquqiy eslatma
"당근", "Karrot", "Daangn" nomlari, logotipi, sabzi belgisi va to'q sariq brend rangi ishlatilmaydi. Apache-2.0 kodlardan foydalanilsa, LICENSE va NOTICE fayllari saqlanadi.
