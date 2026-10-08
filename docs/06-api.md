# API endpointlar (v0.2)

Asosiy manzil: `http://localhost:4000/api`. Swagger: `http://localhost:4000/docs`.
🔒 — `Authorization: Bearer <accessToken>` kerak.

| Metod | Yo'l | Tavsif |
|---|---|---|
| GET | `/health` | Server va baza holati |
| POST | `/auth/otp/request` | `{ phone }` — SMS kod yuborish (dev'da kod doim `123456`) |
| POST | `/auth/otp/verify` | `{ phone, code }` → `{ accessToken, user }` |
| GET 🔒 | `/auth/me` | Joriy foydalanuvchi |
| PATCH 🔒 | `/auth/me` | `{ name?, regionId? }` — ism va mahallani o'rnatish |
| GET | `/regions` | Viloyatlar; `?parentId=` — ichki hududlar; `?q=` — nom bo'yicha qidiruv |
| GET | `/regions/:id` | Hudud + ota-hududlari |
| GET | `/categories` | Kategoriyalar (tartib bilan) |
| GET | `/listings` | Lenta: `?regionId=&categoryId=&q=&page=` (20 tadan). `regionId` ichki hududlarni ham qamraydi |
| GET | `/listings/:id` | E'lon |
| POST 🔒 | `/listings` | `{ title, categoryId, description?, price?, isFree?, regionId? }` — `regionId` berilmasa foydalanuvchi mahallasi |
| PATCH 🔒 | `/listings/:id/status` | `{ status: ACTIVE \| RESERVED \| SOLD \| HIDDEN }` — faqat egasi |

## E'lon javobi (`ListingDto`)
```json
{
  "id": "uuid", "title": "…", "description": "…",
  "price": 2900000, "isFree": false, "status": "ACTIVE",
  "categoryId": 1, "regionId": 27, "mahalla": "Yunusobod-4",
  "createdAt": "2026-10-03T12:13:35.270Z",
  "imageUrl": null, "chatCount": 0, "likeCount": 0,
  "seller": { "id": "uuid", "name": "Dilshod", "mahalla": "Yunusobod-4", "temperature": 42.3, "avatarUrl": null }
}
```
Sotuvchining telefon raqami hech qachon qaytarilmaydi.
