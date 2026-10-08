# Karrot ilovasi — to'liq ekran/funksiya xaritasi (skrinshotlar asosida)

Sana: 2026-10-08. Foydalanuvchi yuborgan 7 ta skrinshot (Karrot ilovasi, "My Karrot"
va qo'shni tablar) asosida. Bu real ilovadan olingan birinchi qo'l dalil —
`04-daangn-github-tahlili.md` (kod) va `07-ish-reja.md` (strategiya) ni to'ldiradi.

## Pastki navigatsiya (5 tab)
`Home | Community | Map | Chats | My Karrot`

MahallaMarketda hozir: Lenta (Home), Chat — bor. **Map va Community yo'q** —
quyida fazalarga taqsimlangan.

## 1. Community tab — forum/jamiyat vertikali
Sub-tablar: 동네생활(Mahalla hayoti) · 모임(Guruhlar) · 카페(Kafe) · 아파트(Kvartira) ·
육아(Bolalar tarbiyasi) · 게임(O'yinlar) — har birida filtr chiplari (Tavsiya/Mashhur/
Hobbi-dam olish/Sport). Post kartasi: kategoriya belgisi, sarlavha, qisqa matn,
muddat+ko'rishlar soni, layk+izoh soni, ba'zan rasm. Pastda suzuvchi **"✍️ Post yozish"** tugmasi.

→ **MahallaMarket:** `01-product.md` §1 jadvalidagi "3-bosqich: mahalla hamjamiyati"
aynan shu. Yangi jadval `community_posts` (kategoriya, matn, rasm ixtiyoriy,
layk/izoh) + alohida sub-navigatsiya kerak bo'ladi. **MVP'dan keyin, Faza 3.**

## 2. Chats tab
Filtrlar: Hammasi / Oldi-sotdi / Tadbirlar / Yarim kunlik ish (vertikal bo'yicha
chat'larni ajratish). Tepada gamifikatsiya banneri ("yashirin imtiyozlar: ball,
missiya"). Rasmiy bot xabarlari ro'yxatda alohida ko'rinadi (tasdiqlangan belgi bilan).

→ **MahallaMarket Sprint 2.1 (chat)**ga qo'shimcha: chat ro'yxatini listing turi
bo'yicha filtrlash kerak emas MVP'da (bitta vertikal — oddiy e'lon), lekin
**rasmiy/tizim xabarlari** (masalan "xavfsizlik ogohlantirishi") alohida
ko'rinish g'oyasini olamiz.

## 3. My Karrot bosh ekrani — eng boy qism
- Profil qatori: avatar, ism, **harorat badge'i** (masalan 46.6°C) — bosilsa profilga o'tadi
- **Karrot Pay**: To'ldirish / Yuborish / markazda katta "Pay" tugmasi, pastda
  "Pul: 0 KRW" va "Ball: 0 KRW" qatorlari — **to'liq ichki hamyon/fintech**
- Gamifikatsiya banneri: "D-7 Local Runners Challenge — 0/42.195km" (jamoaviy
  masofa yig'ish kampaniyasi, mukofot bilan)
- Xizmatlar katakchalari (ikonka+nom, grid): Ishlatilgan avto, Marketplace,
  Stories, 당근메이드(Karrot Made — qo'l ishi/maxsus buyurtma?), Mahalla
  sayrlari, Kir yuvish xizmati, 당근절, "Hammasini ko'rish →"

→ **MahallaMarket:** Karrot Pay **MVP'dan tashqarida** (`01-product.md` §4 da
allaqachon "to'lov/escrow — MVP'dan tashqarida" deb belgilangan — to'g'ri qaror,
o'zgartirmaymiz, bu katta moliyaviy litsenziya talab qiladi). Gamifikatsiya
g'oyasi (masalan "oyning faol mahallasi" yoki "N ta muvaffaqiyatli bitim" belgisi)
— arzon, past-xarajat retention vositasi sifatida **Faza 2/3**ga yozib qo'yamiz.

## 4. My Karrot — to'liq menyu (pastga skroll)
| Guruh | Punktlar | MahallaMarket holati |
|---|---|---|
| Tezkor | Sevimlilar, So'nggi ko'rilganlar, Kuponlar, Imtiyozlar | Sevimlilar — sxemada bor (`favorites`), API yo'q (Sprint 1.4+ ga qo'shiladi). Kupon/Imtiyoz — kerak emas (to'lov yo'q) |
| Oldi-sotdi | E'lonlarim, Xaridlarim, **Karrot Vision** (AI rasm-qidiruv), Karrot Harvest, Avto e'lonlari | E'lonlarim — kerak (profil ichida "mening e'lonlarim" filtri, oson qo'shiladi Sprint 1.3da). Karrot Vision (AI) — **uzoq muddatli g'oya**, eslatma sifatida yozamiz, MVP emas |
| Sevimli | Sevimlilar, Qidiruv ogohlantirishi, Kuzatilayotganlar, Sevimli do'konlar | Qidiruv ogohlantirishi (yangi e'lon kelganda bildirishnoma) — foydali, Faza 2 |
| Faollik | Arizalar jurnali, O'qituvchi profili, Guruhlarim, Jamiyat postlarim | "O'qituvchi profili" — Daangn'ning repetitorlik vertikali (Koreyada juda katta), bizda yo'q, kerak emas hozircha |
| Biznes | Biznes profili, **Reklama**, Biznes Lounge | `07-ish-reja.md` §4 monetizatsiya rejasiga mos — **Reklama = asosiy daromad manbai**, Faza 3/4 |
| Sozlamalar | Mahallani boshqarish, **Joylashuvni tasdiqlash**, QR kod skanerlash, Sozlamalar | Mahalla boshqarish — Sprint 1.3. Joylashuv tasdiqlash (GPS) — `05-hududlar.md`da rejalashtirilgan. QR kod — noaniq maqsad, kerak emas |
| Aloqa | Yangiliklar, FAQ, Fikr-mulohaza, **Hisobni o'chirish**, Ilova haqida, **Shartlar** | Hisobni o'chirish — GDPR-uslub talab (`02-architecture.md`da "O'zbekiston qonuni" eslatilgan) — **majburiy, MVP'ga kiritish kerak** |

## 5. Muhim yuridik topilma
Ekran pastida doimiy matn: *"(Korxona) Daangn Market bu platforma orqali amalga
oshirilgan savdo-sotiqning tarafi emas va tegishli bitim ma'lumotlari/mazmuniga
javobgar emas."*

→ **MahallaMarket Terms of Service'ga majburiy band:** Platforma faqat vositachi
(elon joylash + muloqot vositasi), tomonlar o'rtasidagi bitim, tovar sifati,
to'lov va yetkazishga javobgar emas. Bu O'zbekiston "Elektron tijorat
to'g'risida"gi qonun nuqtai nazaridan ham muhim — yuristga ko'rsatish kerak
bo'lgan band sifatida `docs`ga belgilab qo'yildi.

## 6. Xulosa — rejaga ta'siri
`07-ish-reja.md`dagi sprintlar o'zgarmaydi, lekin quyidagilar **qo'shiladi**:
1. Sprint 1.3 ga: "E'lonlarim" filtri (profilda)
2. Sprint 3 (Pilot)ga: "Hisobni o'chirish" endpoint + UI (majburiy, qonuniy)
3. Yangi band — Terms of Service: vositachi-javobgarlik bandi (huquqshunos bilan)
4. Faza 3 backlog (yangi): Jamiyat (Community) forum vertikali, qidiruv
   ogohlantirishlari, oddiy gamifikatsiya (faollik belgilari)
5. Faza 4+ / uzoq muddat: Karrot Vision (AI qidiruv), ichki hamyon — **faqat
   qayd etildi, hozircha ishlanmaydi**
