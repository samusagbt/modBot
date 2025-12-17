# راهنمای کامل ربات تلگرامی

## 📋 نیاز‌های سیستم

```bash
Node.js v16+
npm یا yarn
MongoDB (ابری یا محلی)
```

## 🚀 شروع سریع

### 1️⃣ نصب پروژه

```bash
# کلون کنید یا فایل‌ها را دانلود کنید
mkdir telegram-bot-project
cd telegram-bot-project

# نصب dependencies
npm install
```

### 2️⃣ ایجاد فایل محیط

```bash
# فایل .env را ایجاد کنید
touch .env
```

**محتوای .env:**
```
TELEGRAM_BOT_TOKEN=your_token_here
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/dbname
PORT=5000
ADMIN_CHAT_IDS=123456789,987654321
NODE_ENV=development
```

### 3️⃣ کجا token تلگرام بگیریم؟

1. **BotFather** را در تلگرام جستجو کنید
2. `/start` سپس `/newbot` را فشار دهید
3. اسم و username ربات را انتخاب کنید
4. **Token** را کپی کنید

### 4️⃣ MongoDB رایگان

**MongoDB Atlas** (محلی رایگان):
1. https://www.mongodb.com/cloud/atlas بروید
2. اکاउنت بسازید
3. Cluster رایگان ایجاد کنید
4. Connection String کپی کنید
5. در `.env` قرار دهید

### 5️⃣ اجرای ربات

```bash
# توسعه
npm run dev

# تولید
npm start
```

---

## 📱 نحوه استفاده ربات

### برای کاربر عادی:
```
/start        → شروع ربات
/submit       → ارسال درخواست جدید
/myorders     → دیدن سفارشات من
```

### برای ادمین:
```
/admin                 → پنل مدیریت
/pending_requests      → درخواست‌های جدید
/reply <order_id>      → پاسخ به سفارش
```

---

## 🔧 مشکلات شایع

| مشکل | راهحل |
|------|--------|
| ❌ `Cannot find module` | `npm install` دوباره اجرا کنید |
| ❌ MongoDB connection error | `MONGODB_URI` را بررسی کنید |
| ❌ Bot not responding | Token صحیح است؟ |
| ❌ Port already in use | پورت را تغییر دهید در `.env` |

---

## 📚 فایل‌های پروژه

```
telegram-bot-project/
├── server.js           ← فایل اصلی
├── bot.js              ← منطق ربات
├── models/
│   ├── Order.js        ← مدل سفارش
│   ├── User.js         ← مدل کاربر
│   └── Chat.js         ← مدل چت
├── routes/
│   ├── admin.js        ← مسیرهای ادمین
│   └── webhook.js      ← webhook تلگرام
├── .env                ← متغیرهای محیط
├── package.json
└── README.md
```

---

## 🌐 Deployment (مهم!)

### روش ۱: Heroku (رایگان و آسان) ⭐

```bash
# نصب Heroku CLI
# git init
# heroku create
# heroku config:set TELEGRAM_BOT_TOKEN=...
# heroku config:set MONGODB_URI=...
# git push heroku main
```

### روش ۲: Railway (جدید و سریع)

https://railway.app/ → Connect GitHub → Deploy

### روش ۳: Render

https://render.com → Deploy Server

---

## 🔐 نکات امنیتی

✅ **هرگز token و credentials را در کد commit نکنید**
✅ **از .env file استفاده کنید**
✅ **فایل .gitignore بسازید:**
```
.env
node_modules/
.DS_Store
```

✅ **MongoDB permissions:** فقط از IP خود اجازه دهید

---

## 📞 پشتیبانی

اگر مشکل دارید:
1. فایل `.env` را بررسی کنید
2. سرویس‌ها (MongoDB، Server) را بررسی کنید
3. Console logs را دنبال کنید
4. Package versions را بروزرسانی کنید

---

**حالا به فایل‌های کد بروید!** ⬇️