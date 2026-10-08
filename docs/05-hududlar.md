# Hududlar: viloyat → tuman → MFY

MahallaMarket'ning asosi "mahalla". Daangn'dagi 동네 (dong) kabi har bir foydalanuvchi va e'lon bitta MFY'ga (mahalla fuqarolar yig'ini) bog'lanadi. Lenta esa mahalla, tuman yoki viloyat bo'yicha ko'rsatiladi (`GET /api/listings?regionId=` ichki hududlarni ham qamraydi).

## Hozir bazada nima bor (`npm run db:seed`)
| Daraja | Soni | Manba |
|---|---|---|
| VILOYAT | 14 | SOATO kodlari bilan (1703 Andijon … 1735 Qoraqalpog'iston) |
| TUMAN | 12 | Faqat Toshkent shahri tumanlari, SOATO kodsiz |
| MFY | 3 | **Namunaviy** (Yunusobod-4, Bodomzor, Minor) — pilot va demo uchun |

Koordinatalar taxminiy markaz nuqtalari.

## To'liq ro'yxatni import qilish
Kerakli ma'lumot: barcha tuman/shaharlar va ~9 000 MFY, SOATO kodlari va (iloji bo'lsa) koordinatalari bilan.

```
cd apps/api
npm run db:import-regions -- hududlar.csv
```

CSV formati (sarlavha majburiy, `,` yoki `;`):
```
soato,parent_soato,level,name,name_ru,lat,lng
1726,,VILOYAT,Toshkent shahri,город Ташкент,41.2995,69.2401
1726xxx,1726,TUMAN,Yunusobod tumani,Юнусабадский район,,
...
```
SOATO bo'yicha upsert qiladi, qayta ishga tushirish xavfsiz. Ota-yozuv fayldan oldin kelishi yoki bazada bo'lishi kerak.

## Manba variantlari (qaror kerak)
| Manba | Qamrov | Litsenziya / izoh |
|---|---|---|
| Statistika agentligi SOATO klassifikatori (stat.uz), data.egov.uz | Viloyat, tuman, shahar | Rasmiy, eng ishonchli. MFY yo'q bo'lishi mumkin |
| Mahalla va oila vazirligi / "Mahalla" axborot tizimi | MFY ro'yxati | Rasmiy so'rov yoki hamkorlik kerak bo'lishi mumkin |
| github.com/MIMAXUZ/uzbekistan-regions-data | 14 viloyat, ~210 tuman/shahar, ~2 600 aholi punkti, SOATO (beta) | **GPL-3.0** — ma'lumotdan foydalanish shartlarini yurist bilan tekshirish kerak |
| github.com/ganiyevuz/uzbekistan (PyPI `uzbekistan`) | Viloyat, tuman, qishloqlar | MIT, 2022 yil holati |

Tavsiya: tuman/shaharlarni rasmiy SOATO klassifikatoridan, MFY'larni esa pilot tumani uchun qo'lda yoki rasmiy manbadan yig'ib import qilish. Pilot bitta tuman bo'lgani uchun boshida ~50–100 MFY yetarli.

## Keyingi qadamlar
- MFY chegaralari (polygon) bo'lsa — PostGIS bilan GPS orqali mahallani avtomatik aniqlash ("mahallani tasdiqlash", Daangn'dagi 동네 인증 analogi).
- Qo'shni mahallalar radiusi: foydalanuvchi lentani "faqat mening mahallam / atrofdagi 3 km / butun tuman" deb tanlaydi.
