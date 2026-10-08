# apps/app — MahallaMarket mobil ilova qobig'i

Daangn (Karrot) ilovasidagi kabi mobil tajriba: ekranlar ustma-ust ochiladi, orqaga swipe qilinadi, URL bilan sinxron.
Keyinchalik Android/iOS native qobiq ichida WebView sifatida ham ishlatiladi.

- **Navigatsiya:** [Stackflow](https://github.com/daangn/stackflow) (MIT)
- **UI:** [SEED Design](https://github.com/daangn/seed-design) (Apache-2.0) + o'z brend temamiz (`src/styles/theme.css`)
- **Build:** Vite + React 19 + TypeScript

## Ishga tushirish
```bash
npm install
npm run dev        # http://localhost:5173  (/api -> http://localhost:4000 proksi)
npm run build
```
Backend ishlamasa, ilova `src/api/demo-data.ts` dagi namunaviy e'lonlarni ko'rsatadi.

## Ekranlar (activities)
| Activity | URL | Holat |
|---|---|---|
| FeedActivity — mahalla lentasi, kategoriya filtri, pull-to-refresh | `/` | ✅ API + demo |
| ListingActivity — e'lon, sotuvchi, Mahalla harorati, narx paneli | `/e/:listingId` | ✅ |
| ChatActivity — e'lon bo'yicha chat, tezkor javoblar | `/chat/:listingId` | 🟡 lokal (Socket.IO keyin) |
| NewListingActivity — e'lon yaratish formasi | `/yangi` | 🟡 forma (POST keyin) |

## Litsenziya va brend
`src/seed-design/ui/*` — SEED snippetlari (Apache-2.0, `src/seed-design/LICENSE` va `NOTICE`).
Karrot brend resurslari ishlatilmaydi: ikonlar `lucide-react`, Mahalla harorati emotsiyalari (Karrot CDN rasmlari)
oddiy ikonka bilan almashtirilgan, brend rangi — o'zimizning yashil.
