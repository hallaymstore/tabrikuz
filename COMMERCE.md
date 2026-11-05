TabrikUZ xizmatlari

- /services: qo‘ng‘iroq + audio/video xizmatlari.
- /order/audio va /order/video: anketa.
- /orders va /orders/:id: mijoz buyurtmalari, rasm yuklash, checkout, tayyor tabrikni Telegram orqali olish.
- /celebrant: to‘langan xizmatlar navbati, buyurtma ID va tugallandi holati.
- /manage: admin narxlari, ijrochi haqi, xizmatni ochish/yopish, rasm chegaralari, mijozga xabar, shablon narxlari va tabrikchi rolini berish.

Narxlar buyurtma yaratilganda nusxalanadi; keyingi admin o‘zgarishi eski buyurtmaga ta’sir qilmaydi. Boshlang‘ich narxlar: audio 55 000 / video 85 000 (O‘zbekiston), audio 65 000 / video 100 000 (chet el). Barchasi adminda o‘zgaradi. Ijrochi haqi va marja faqat admin javobida ko‘rinadi.

Kartalar: 4 ta chizma shablon bepul. Rasmli shablonlar boshlang‘ich 10 000 so‘m. Har bir xarid aniq tabrik, shablon va oluvchiga biriktiriladi. Bir havolani qayta ochish mumkin; boshqa oluvchi uchun yangi xarid kerak. To‘lanmagan slug jamoatchilikka ochilmaydi. Xaridga biriktirilgan tabrikni tahrirlab qayta sotib olishsiz yangi kishiga aylantirish mumkin emas. Avvalgi Pro/VIP ruxsatlari yangi pullik kartalarni ochmaydi; oldingi tabriklar saqlanadi.

Video: kamida 30 ta alohida JPEG/PNG/WebP, har biri 6 MB. Bir xil fayl takrorlanmaydi. Rasmlar MongoDB GridFS’da shaxsiy saqlanadi. Checkout yaratilgach, rasmlar to‘plami qulflanadi. Tayyor audio/video saytda saqlanmaydi: mijoz buyurtma ID’si bilan Telegram orqali oladi. Buyurtma egasi, admin va to‘langan buyurtmani bajaruvchi tabrikchi ko‘radi; ommaviy fayl URL’lari yo‘q.

Tabrikchiga rol: opangiz avval oddiy foydalanuvchi sifatida ro‘yxatdan o‘tadi. Admin /manage sahifasida uning hisobiga Tabrikchi rolini beradi. Tabrikchi to‘langan buyurtmani ishga oladi, tabrikni tayyorlaydi, keyin Tugallandi belgilaydi. Mijoz ID bilan @Qoryogdiyev ga yozadi yoki +998887660800 raqamiga qo‘ng‘iroq qiladi. Aloqa sozlamalari /manage orqali o‘zgaradi. Buyurtma sanasi va vaqti Toshkent (UTC+5).

Hamyon ishga tushirish

1. MONGODB_URI va xavfsiz JWT_SECRET saqlansin. Admin bootstrap avvalgi tartibda.
2. Serverning .env.example faylidagi HAMYON_SHOP_ID, HAMYON_SHOP_KEY va HAMYON_API_URL (kirimlar ro‘yxati) sozlanadi. HAMYON_CREATE_URL yoki HTTPS HAMYON_CHECKOUT_URL ham kerak.
3. Create so‘rovi mavjud Gift Factory adapteridek {shop_id, shop_key, amount, order_id} yuboradi. Checkout HTTPS payment_url, checkout_url yoki data.payment_url orqali olinadi; aks holda HAMYON_CHECKOUT_URL shabloni ishlatiladi.
4. Kirimlar javobida tranzaksiya ID, aniq UZS summa, yo‘nalish va vaqt bo‘lishi shart. Pul birligi provayderda UZS ekanini stagingda tekshiring. Bank/merchant provayderi haqiqiy javobi bilan end-to-end tekshiruv o‘tkazilmaguncha haqiqiy to‘lovni tayyor deb hisoblamang.
5. Har bir 5 daqiqalik hisobga 1–999 so‘m ajratuvchi qism qo‘shiladi; mijozga umumiy aniq summa oldindan ko‘rsatiladi. Bu Gift Factory’dagi ajratish tartibi. Bir vaqtning o‘zida pending summalar va orderlar unikal MongoDB indekslari bilan himoyalangan; tranzaksiya ID qayta ishlatilmaydi.
6. Server har 20 soniyada tekshiradi. /api/payments/hamyon/webhook X-Hamyon-Secret orqali faqat tekshiruvni uyg‘otadi; uning body’sidagi paid belgisi hech qachon xaridni ochmaydi. Sir kamida 24 belgi.
7. Bu sozlamalar bo‘lmasa, buyurtma saqlanadi, to‘lov yopiq holatda tushunarli xabar ko‘rsatadi; soxta muvaffaqiyat berilmaydi. Kalitlar admin yoki brauzerga chiqarilmaydi.

Tekshiruv: npm test. commerce.test.mjs real pul yubormaydigan provayder adapteri bilan narx nusxasi, noto‘g‘ri summa, soxta webhook, takroriy to‘lov, yopiq fayllar, minimal rasm talabi va tabrikchi holatlarini tekshiradi. MongoDB indekslari va jonli Hamyon konfiguratsiyasi alohida staging tekshiruvini talab qiladi.
