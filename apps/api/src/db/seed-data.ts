/**
 * Boshlang'ich ma'lumotlar.
 *
 * - Viloyatlar: 14 ta (SOATO kodlari bilan), markaz shahar koordinatalari taxminiy.
 * - Toshkent shahri tumanlari: 12 ta (SOATO kodsiz, rasmiy ro'yxat import qilinganda to'ldiriladi).
 * - MFY: faqat pilot uchun NAMUNAVIY yozuvlar (Yunusobod). Rasmiy MFY ro'yxati
 *   `npm run db:import-regions -- fayl.csv` bilan import qilinadi (docs/05-hududlar.md).
 */

export const VILOYATLAR = [
  { soato: "1735", name: "Qoraqalpog'iston Respublikasi", nameRu: "Республика Каракалпакстан", lat: 42.4619, lng: 59.6166 },
  { soato: "1703", name: "Andijon viloyati", nameRu: "Андижанская область", lat: 40.7821, lng: 72.3442 },
  { soato: "1706", name: "Buxoro viloyati", nameRu: "Бухарская область", lat: 39.7681, lng: 64.4556 },
  { soato: "1708", name: "Jizzax viloyati", nameRu: "Джизакская область", lat: 40.1158, lng: 67.8422 },
  { soato: "1710", name: "Qashqadaryo viloyati", nameRu: "Кашкадарьинская область", lat: 38.8606, lng: 65.7891 },
  { soato: "1712", name: "Navoiy viloyati", nameRu: "Навоийская область", lat: 40.0844, lng: 65.3792 },
  { soato: "1714", name: "Namangan viloyati", nameRu: "Наманганская область", lat: 40.9983, lng: 71.6726 },
  { soato: "1718", name: "Samarqand viloyati", nameRu: "Самаркандская область", lat: 39.6542, lng: 66.9597 },
  { soato: "1722", name: "Surxondaryo viloyati", nameRu: "Сурхандарьинская область", lat: 37.2242, lng: 67.2783 },
  { soato: "1724", name: "Sirdaryo viloyati", nameRu: "Сырдарьинская область", lat: 40.4897, lng: 68.7842 },
  { soato: "1726", name: "Toshkent shahri", nameRu: "город Ташкент", lat: 41.2995, lng: 69.2401 },
  { soato: "1727", name: "Toshkent viloyati", nameRu: "Ташкентская область", lat: 41.0, lng: 69.6 },
  { soato: "1730", name: "Farg'ona viloyati", nameRu: "Ферганская область", lat: 40.3842, lng: 71.7843 },
  { soato: "1733", name: "Xorazm viloyati", nameRu: "Хорезмская область", lat: 41.5506, lng: 60.6314 },
] as const;

export const TOSHKENT_TUMANLARI = [
  { name: "Bektemir tumani", nameRu: "Бектемирский район", lat: 41.2094, lng: 69.3347 },
  { name: "Chilonzor tumani", nameRu: "Чиланзарский район", lat: 41.2756, lng: 69.2033 },
  { name: "Mirobod tumani", nameRu: "Мирабадский район", lat: 41.2875, lng: 69.2794 },
  { name: "Mirzo Ulug'bek tumani", nameRu: "Мирзо-Улугбекский район", lat: 41.3383, lng: 69.3347 },
  { name: "Olmazor tumani", nameRu: "Алмазарский район", lat: 41.3489, lng: 69.2186 },
  { name: "Sergeli tumani", nameRu: "Сергелийский район", lat: 41.2253, lng: 69.2208 },
  { name: "Shayxontohur tumani", nameRu: "Шайхантахурский район", lat: 41.3256, lng: 69.2364 },
  { name: "Uchtepa tumani", nameRu: "Учтепинский район", lat: 41.2922, lng: 69.1672 },
  { name: "Yakkasaroy tumani", nameRu: "Яккасарайский район", lat: 41.2894, lng: 69.2511 },
  { name: "Yangihayot tumani", nameRu: "Янгихаётский район", lat: 41.2017, lng: 69.1925 },
  { name: "Yashnobod tumani", nameRu: "Яшнабадский район", lat: 41.2925, lng: 69.3364 },
  { name: "Yunusobod tumani", nameRu: "Юнусабадский район", lat: 41.3644, lng: 69.2869 },
] as const;

/** Pilot uchun namunaviy mahallalar (rasmiy MFY nomlari bilan almashtiriladi) */
export const PILOT_MAHALLALAR = {
  tuman: "Yunusobod tumani",
  items: [
    { name: "Yunusobod-4", lat: 41.3547, lng: 69.2853 },
    { name: "Bodomzor", lat: 41.3383, lng: 69.2842 },
    { name: "Minor", lat: 41.3264, lng: 69.2778 },
  ],
} as const;

export const KATEGORIYALAR = [
  { slug: "elektronika", name: "Elektronika", nameRu: "Электроника" },
  { slug: "uy-rozgor", name: "Uy-ro'zg'or", nameRu: "Для дома" },
  { slug: "kiyim", name: "Kiyim-kechak", nameRu: "Одежда" },
  { slug: "bolalar", name: "Bolalar uchun", nameRu: "Детские товары" },
  { slug: "mebel", name: "Mebel", nameRu: "Мебель" },
  { slug: "sport", name: "Sport va hobbi", nameRu: "Спорт и хобби" },
  { slug: "kitob", name: "Kitoblar", nameRu: "Книги" },
  { slug: "tekin", name: "Tekin beraman", nameRu: "Отдам даром" },
] as const;

/** Faqat `--demo` bilan: ishlab chiqish uchun namunaviy foydalanuvchi va e'lonlar */
export const DEMO = {
  users: [
    { phone: "+998900000001", name: "Dilshod", mahalla: "Yunusobod-4", temperature: 42.3 },
    { phone: "+998900000002", name: "Malika opa", mahalla: "Bodomzor", temperature: 51.8 },
    { phone: "+998900000003", name: "Jasur", mahalla: "Yunusobod-4", temperature: 37.1 },
    { phone: "+998900000004", name: "Nodira", mahalla: "Minor", temperature: 36.5 },
    { phone: "+998900000005", name: "Sardor", mahalla: "Bodomzor", temperature: 39.4 },
    { phone: "+998900000006", name: "Bekzod", mahalla: "Minor", temperature: 45.0 },
  ],
  listings: [
    {
      seller: "+998900000001", category: "elektronika", minutesAgo: 3, status: "ACTIVE", price: 2_900_000, isFree: false,
      title: "Samsung Galaxy A54, 128 GB, ideal holatda",
      description: "Bir yil ishlatilgan, qutisi va zaryadlovchisi bor. Ekranida birorta ham chiziq yo'q, doim g'ilofda yurgan. Yunusobod-4 metro yonida uchrashsak bo'ladi.",
    },
    {
      seller: "+998900000002", category: "bolalar", minutesAgo: 25, status: "ACTIVE", price: 450_000, isFree: false,
      title: "Bolalar velosipedi (4–7 yosh)",
      description: "O'g'lim katta bo'lib qoldi, velosiped deyarli yangi. Yordamchi g'ildiraklari ham bor. Narxini biroz kelishamiz.",
    },
    {
      seller: "+998900000003", category: "mebel", minutesAgo: 80, status: "RESERVED", price: 1_200_000, isFree: false,
      title: "Divan-krovat, kulrang",
      description: "Ko'chib ketayotganimiz uchun sotiladi. Yig'iladigan, ichida bo'shliq bor. O'zingiz olib ketishingiz kerak (3-qavat, lift bor).",
    },
    {
      seller: "+998900000004", category: "tekin", minutesAgo: 140, status: "ACTIVE", price: null, isFree: true,
      title: "Gul tuvaklari, 6 dona — tekin",
      description: "Bo'sh tuvaklar, kimga kerak bo'lsa olib keting. Kechqurun 18:00 dan keyin uydaman.",
    },
    {
      seller: "+998900000005", category: "kitob", minutesAgo: 300, status: "ACTIVE", price: 60_000, isFree: false,
      title: "O'tkan kunlar — Abdulla Qodiriy (qattiq muqova)",
      description: "Yaxshi holatda, sahifalari toza. Boshqa kitoblar ham bor, so'rang.",
    },
    {
      seller: "+998900000006", category: "sport", minutesAgo: 1500, status: "SOLD", price: 380_000, isFree: false,
      title: "Gantellar to'plami 2×10 kg",
      description: "Yig'iladigan gantellar, disklari to'liq. Uyda shug'ullanish uchun juda qulay.",
    },
  ],
} as const;
