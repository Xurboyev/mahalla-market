# MahallaMarket — Mahsulot spetsifikatsiyasi

**Maqsad:** Koreyaning Daangn (Karrot) platformasining o'zbekcha analogi — "mahalla" asosidagi hyperlocal e'lonlar va ishonchli muloqot platformasi.

## 1. Daangn'dan olinadigan asosiy g'oyalar

| Daangn | MahallaMarket analogi |
|---|---|
| Dong (mahalla) tasdiqlash — GPS bilan yashash joyini tasdiqlash | Tuman/MFY (mahalla fuqarolar yig'ini) tanlash + GPS tasdiqlash, radius bo'yicha ko'rsatish |
| Manner temperature (36.5°C) | **Mahalla harorati** — sharh va muvaffaqiyatli bitimlar asosida o'zgaradi |
| Ikkinchi qo'l savdo (e'lonlar) | E'lonlar: ishlatilgan buyumlar, tekin berish ("bepul"), narx kelishish |
| Chat orqali bitim | Ilova ichidagi chat (telefon raqami yashirin) |
| Hyperlocal xizmatlar (ish, mahalliy do'konlar, kommunal) | 2-bosqich: mahalliy xizmatlar, vakansiyalar, kichik biznes profili |
| Mahalla hamjamiyati (Community) | 3-bosqich: mahalla yangiliklari, savol-javob |

## 2. O'zbekiston konteksti
- **Til:** o'zbek (lotin, asosiy), rus (ikkinchi), kirill ixtiyoriy. i18n boshidan.
- **Kirish:** telefon raqami + SMS OTP (Eskiz.uz / Playmobile), Telegram orqali bildirishnoma va Telegram Login.
- **Hudud:** viloyat → tuman/shahar → MFY (mahalla). Rasmiy ro'yxat ochiq ma'lumotlardan import qilinadi.
- **To'lov:** MVP'da yo'q (naqd, yuzma-yuz). Keyin Payme/Click/Uzum.
- **Qurilmalar:** asosan Android, sekin tarmoq → PWA, rasm siqish, kichik bundle.
- **Moderatsiya:** taqiqlangan tovarlar ro'yxati (qurol, dori, hujjat va h.k.), shikoyat tugmasi.

## 3. MVP (Faza 1) qamrovi
1. **Auth:** telefon + OTP, profil (ism, rasm, mahalla).
2. **Mahalla:** hudud tanlash, GPS tasdiqlash (ixtiyoriy), qidiruvda radius/mahalla filtri.
3. **E'lonlar:** yaratish/tahrirlash/yopish, 10 tagacha rasm, kategoriya, narx yoki "tekin", holat (faol / band / sotildi), tanlanganlar.
4. **Qidiruv:** matn (PostgreSQL FTS, `uz`/`ru` uchun simple + trigram), kategoriya, narx, mahalla.
5. **Chat:** e'lon bo'yicha 1:1 chat (WebSocket), o'qilgan belgisi, push/Telegram bildirishnoma.
6. **Ishonch:** bitimdan keyin o'zaro baho + sharh → Mahalla harorati (boshlang'ich 36.5).
7. **Moderatsiya:** shikoyat, admin panel (keyin), bloklash.

## 4. MVP'dan tashqarida
To'lov/escrow, yetkazib berish, mahalliy biznes profillari, vakansiyalar, hamjamiyat lentasi, mobil ilova (Flutter/React Native), reklama.

## 5. Muvaffaqiyat ko'rsatkichlari (pilot: bitta tuman)
- 500 faol e'lon, 200 haftalik faol foydalanuvchi, e'lon→chat konversiyasi ≥ 15%, bitim yakunlash ≥ 30%.

## 6. Mahalla harorati formulasi (boshlang'ich)
`T = 36.5 + Σ(baho_delta)`; 5★ = +0.4, 4★ = +0.2, 3★ = 0, 2★ = −0.3, 1★ = −0.6, tasdiqlangan shikoyat = −1.0. Diapazon 0–99. Vaqt o'tishi bilan yumshatish (decay) 2-bosqichda.
