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

Rasmiy shartnoma: https://hamyon-api.uz/ (API Docs). Server form-urlencoded POST /payment/create yuboradi: shop_id, shop_key, amount, order_id. Hamyon payment_id, card va 5 daqiqalik muddatni qaytaradi. Mijoz Hamyon ajratgan kartaga aniq summani o‘tkazadi; qo‘lda chek tasdiqlash yo‘q.

Serverga HAMYON_SHOP_ID va HAMYON_SHOP_KEY kerak. Bazaviy URL https://hamyon-api.uz; HAMYON_BASE_URL bilan sozlanadi. Keylarni public fayl yoki brauzerga chiqarmang. Ma’lumotlar MongoDB’da saqlanadi.

Hamyon do‘koniga kiritiladigan callbacklar:
- Prepare: https://tabrikuz-invite.onrender.com/api/hamyon/prepare
- Complete: https://tabrikuz-invite.onrender.com/api/hamyon/complete

Ikkalasi POST form-urlencoded qabul qiladi. sign = MD5(shop_id + payment_id + amount + shop_key), timing-safe taqqoslanadi. Summa, order_id va payment_id bazadagi hisobga mos bo‘lishi shart. Prepare create javobidan oldin kelishi mumkin; hisob avval bazada yaratiladi va prepare uni order_id bo‘yicha bog‘laydi. Prepare xaridni ochmaydi. Complete imzosida status bo‘lmagani uchun server GET /payment/status?payment_id=... orqali aynan shu shop, order, amount va payment_id uchun haqiqiy statusni qo‘shimcha tekshiradi. paid bir marta ishlanadi, takroriy callback qayta xarid bermaydi. Soxta paid body qabul qilinmaydi.

Har bir hisobga 1–999 so‘mlik ajratuvchi qism qo‘shiladi; aniq summa mijozga ko‘rinadi. MongoDB’da bir vaqtdagi summalar va buyurtmalar unikal. Qayta to‘lov holati tekshiruvi har 20 soniyada va mijoz tugmasida mavjud; kartaga pul tushirish sinovini agent bajarmaydi. Jonli kalitlar va Hamyon do‘konidagi karta xabarnoma sessiyasi alohida tekshiriladi.

Xotiralar va yangi tabrik tajribasi

32 shablon: 12 bepul chizma va 20 rasmli premium variant. /cards/:id sahifasida xariddan oldin rasmlar qo‘shiladi. Bepul uchun 3, premium uchun 12 rasm; admin limitlarni o‘zgartiradi. Ulishishga rozilik shart. Rasmlar shaxsiy GridFS’da saqlanadi; faqat tabrik to‘langan yoki bepul ochiq bo‘lganda uning taxmin qilib bo‘lmaydigan havolasi bilan ko‘rinadi. To‘lanmagan rasm URL’lari 404 qaytaradi. Egasi esa avtorizatsiya bilan oldindan ko‘radi. Xariddan keyin rasm to‘plami o‘zgarmaydi.

Oluvchi: konvert → tilak → xotiralar albomi → yakuniy syurpriz. Har bir bosqich keyingisini ochadi. To‘liq ekran brauzer qo‘llasa faqat ochish tugmasiga bosilganda so‘raladi. Animatsiyani pauza qilish va reduced-motion mavjud.

Tekshiruv: npm test. Test provayderi haqiqiy pul yubormaydi. Egaga tegishlilik, imzo, soxta callback, provider hali pending bo‘lsa paid bermaslik, takroriy callback, narx nusxasi, shaxsiy rasm va ulashish roziligi tekshiriladi.
