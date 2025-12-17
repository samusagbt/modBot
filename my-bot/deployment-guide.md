# 🚀 راهنمای کامل Deployment

## ✅ Step 1: آماده کردن پروژه محلی

```bash
# ۱. پوشه جدید
mkdir telegram-bot-project
cd telegram-bot-project

# ۲. Git init
git init

# ۳. نصب dependencies
npm install

# ۴. ایجاد .gitignore
echo "node_modules/
.env
.DS_Store
*.log" > .gitignore

# ۵. ایجاد .env
touch .env
```

**محتوای `.env`:**
```
TELEGRAM_BOT_TOKEN=your_bot_token_from_botfather
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/botdb?retryWrites=true&w=majority
PORT=5000
ADMIN_CHAT_IDS=your_telegram_user_id
NODE_ENV=development
```

---

## 🌐 Step 2: انتخاب میزبان (سه گزینه)

### **گزینه 1️⃣: Railway (توصیه شده ⭐)**

Railway سریع‌ترین و ساده‌ترین است!

```bash
# ۱. نصب Railway CLI
npm install -g @railway/cli

# ۲. Login
railway login

# ۳. ایجاد پروژه جدید
railway init

# ۴. اضافه کردن متغیرها
railway variables

# ۵. Deploy!
railway up
```

**متغیرهای مورد نیاز:**
- `TELEGRAM_BOT_TOKEN`
- `MONGODB_URI`
- `ADMIN_CHAT_IDS`

---

### **گزینه 2️⃣: Heroku**

```bash
# ۱. نصب Heroku CLI
# https://devcenter.heroku.com/articles/heroku-cli

# ۲. Login
heroku login

# ۳. ایجاد app
heroku create your-bot-name

# ۴. تنظیم متغیرهای محیط
heroku config:set TELEGRAM_BOT_TOKEN=your_token
heroku config:set MONGODB_URI=your_mongodb_uri
heroku config:set ADMIN_CHAT_IDS=your_id

# ۵. Deploy
git push heroku main
```

---

### **گزینه 3️⃣: Render.com**

```bash
# ۱. بروید به https://render.com
# ۲. Connect GitHub
# ۳. ایجاد Web Service جدید
# ۴. اضافه کردن متغیرهای محیط
# ۵. Deploy خودکار!
```

---

## 🗄️ Step 3: راه‌اندازی MongoDB

### **MongoDB Atlas (ابری - رایگان)**

```
۱. https://www.mongodb.com/cloud/atlas بروید
۲. اکاونت رایگان بسازید
۳. Cluster رایگان ایجاد کنید (M0)
۴. Database user ایجاد کنید
۵. IP خود را whitelist کنید (یا 0.0.0.0)
۶. Connection String کپی کنید
۷. در .env قرار دهید
```

**نمونه Connection String:**
```
mongodb+srv://myuser:mypassword@cluster0.abc123.mongodb.net/mydatabase?retryWrites=true&w=majority
```

---

## 📝 Step 4: فایل package.json نهایی

```json
{
  "name": "telegram-order-bot",
  "version": "1.0.0",
  "description": "Advanced Telegram Order Bot",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "engines": {
    "node": "16.x"
  },
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.0.3",
    "mongoose": "^7.0.0",
    "node-telegram-bot-api": "^0.60.0",
    "cors": "^2.8.5"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}
```

---

## 🧪 Step 5: تست محلی

```bash
# ۱. مطمئن شوید MongoDB running است
# ۲. .env صحیح است
# ۳. اجرا کنید:

npm run dev

# ۴. باید این پیام را ببینید:
# ✅ MongoDB connected
# 🤖 Bot is running...
```

---

## 🎯 Step 6: تست ربات

```
۱. بروید Telegram
۲. ربات خود را سرچ کنید
۳. /start را فشار دهید
۴. باید منو ظاهر شود
۵. درخواست تست کنید
```

---

## ⚠️ Troubleshooting

| مشکل | حل |
|------|-----|
| Bot not responding | Token صحیح است؟ Webhook فعال است؟ |
| MongoDB error | Connection string درست است؟ Whitelist IP؟ |
| Port conflict | PORT را تغییر دهید یا process را kill کنید |
| Deployment failed | Logs را بررسی کنید: `heroku logs --tail` |

---

## 🔒 نکات امنیتی

✅ **هرگز token را share نکنید**
✅ **`.env` را commit نکنید**
✅ `.gitignore` را بسازید
✅ **فقط خود IP را whitelist کنید** (تا deploy نشود)
✅ **Strong MongoDB password** استفاده کنید

---

## 📱 فرمان‌های ربات نهایی

### کاربر:
```
/start       → شروع ربات
/submit      → ارسال درخواست
/myorders    → دیدن سفارشات
```

### ادمین:
```
/admin              → پنل مدیریت
/reply [order_id]   → پاسخ به سفارش
```

---

## 🌍 URL نهایی

```
Server: https://your-app-name.railway.app
Bot: https://t.me/your_bot_username
Admin Panel: https://your-app-name.railway.app/admin
```

---

## 📞 پشتیبانی

اگر مشکل دارید:

1. **Console logs** را بررسی کنید
2. **Environment variables** را دوبار بررسی کنید
3. **MongoDB connectivity** را تست کنید
4. **Token** را verify کنید

---

**حالا شما آماده‌ید! 🚀**

سفارش دهید و شروع کنید!