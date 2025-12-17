// ============================================
// 🚀 server.js - نسخه کامل با پنل شیشه‌ای
// ============================================

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const TelegramBot = require('node-telegram-bot-api');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5000;

// 🔐 Config
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MONGODB_URI = process.env.MONGODB_URI;
const ADMIN_CHAT_IDS = (process.env.ADMIN_CHAT_IDS || '').split(',');

// Middleware
app.use(express.json());
app.use(cors());
app.use(express.static(path.join(__dirname, 'public')));

// ============================================
// 📊 MongoDB Models
// ============================================

const userSchema = new mongoose.Schema({
  _id: Number,
  firstName: String,
  lastName: String,
  username: String,
  chatId: Number,
  status: { type: String, default: 'normal' },
  createdAt: { type: Date, default: Date.now }
});

const orderSchema = new mongoose.Schema({
  _id: mongoose.Schema.Types.ObjectId,
  userId: Number,
  content: String,
  fileId: String,
  status: { type: String, enum: ['pending', 'replied', 'completed', 'cancelled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

const chatSchema = new mongoose.Schema({
  orderId: mongoose.Schema.Types.ObjectId,
  userId: Number,
  messages: [{
    sender: String,
    content: String,
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

const User = mongoose.model('User', userSchema);
const Order = mongoose.model('Order', orderSchema);
const Chat = mongoose.model('Chat', chatSchema);

// ============================================
// 🔌 MongoDB Connection
// ============================================

mongoose.connect(MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('✅ MongoDB متصل شد');
}).catch(err => {
  console.error('❌ MongoDB خطا:', err);
  process.exit(1);
});

// ============================================
// 🤖 Telegram Bot Setup
// ============================================

const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// دستور /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  // ذخیره کاربر
  await User.findByIdAndUpdate(userId, {
    _id: userId,
    firstName: msg.from.first_name,
    lastName: msg.from.last_name || '',
    username: msg.from.username || '',
    chatId: chatId
  }, { upsert: true });

  const keyboard = {
    inline_keyboard: [
      [{ text: '📝 ارسال درخواست', callback_data: 'submit' }],
      [{ text: '📦 سفارشات من', callback_data: 'my_orders' }],
      [{ text: '👨‍💼 اطلاعات', callback_data: 'info' }]
    ]
  };

  bot.sendMessage(chatId,
    `سلام ${msg.from.first_name}! 👋\n\nبه سیستم مدیریت سفارشات خوش آمدید!\n\nاز گزینه‌های زیر استفاده کنید:`,
    { reply_markup: keyboard }
  );
});

// Callback handler
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const data = query.data;

  if (data === 'submit') {
    await User.findByIdAndUpdate(userId, { status: 'awaiting_order' });
    bot.sendMessage(chatId,
      '📝 لطفا درخواست خود را بنویسید یا فایل ارسال کنید:\n\n' +
      '(متن، تصویر، یا سند می‌تونید ارسال کنید)'
    );
  }

  if (data === 'my_orders') {
    const orders = await Order.find({ userId });
    if (orders.length === 0) {
      bot.sendMessage(chatId, '📭 شما هنوز سفارشی ندارید.');
    } else {
      let text = '📦 سفارشات شما:\n\n';
      orders.forEach((o, i) => {
        text += `${i + 1}. سفارش #${o._id}\nوضعیت: ${o.status}\nتاریخ: ${new Date(o.createdAt).toLocaleDateString('fa-IR')}\n\n`;
      });
      bot.sendMessage(chatId, text);
    }
  }

  if (data === 'info') {
    bot.sendMessage(chatId,
      'ℹ️ درباره ما\n\n' +
      'سیستم مدیریت سفارشات پیشرفته\n\n' +
      '✨ ویژگی‌ها:\n' +
      '• ارسال درخواست با متن و فایل\n' +
      '• دیدن وضعیت سفارشات\n' +
      '• چت مستقیم با پشتیبانی\n'
    );
  }

  bot.answerCallbackQuery(query.id);
});

// دریافت پیام‌ها و فایل‌ها
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  const user = await User.findById(userId);

  if (user && user.status === 'awaiting_order') {
    let content = '';
    let fileId = null;

    if (msg.text) {
      content = msg.text;
    } else if (msg.document) {
      fileId = msg.document.file_id;
      content = `📎 فایل: ${msg.document.file_name}`;
    } else if (msg.photo) {
      fileId = msg.photo[msg.photo.length - 1].file_id;
      content = '🖼️ تصویر آپلود شد';
    }

    if (!content) return;

    // ایجاد سفارش
    const order = new Order({
      userId,
      content,
      fileId
    });
    await order.save();

    // ایجاد Chat
    const chat = new Chat({
      orderId: order._id,
      userId,
      messages: [{ sender: 'user', content }]
    });
    await chat.save();

    // بروزرسانی وضعیت
    await User.findByIdAndUpdate(userId, { status: 'normal' });

    // پاسخ کاربر
    bot.sendMessage(chatId,
      `✅ سفارش شما با شماره #${order._id} ثبت شد!\n\n` +
      `منتظر پاسخ باشید.`
    );

    // اطلاع ادمین
    ADMIN_CHAT_IDS.forEach(adminId => {
      if (adminId.trim()) {
        bot.sendMessage(adminId.trim(),
          `🆕 سفارش جدید!\n\n` +
          `سفارش: #${order._id}\n` +
          `کاربر: ${msg.from.first_name}\n` +
          `متن: ${content}\n\n` +
          `🔗 پنل مدیریت: ${process.env.BASE_URL || 'http://localhost:5000'}`
        );
      }
    });
  }
});

// ============================================
// 🌐 REST API Routes
// ============================================

// دریافت تمام سفارشات
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// دریافت جزئیات سفارش
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    const chat = await Chat.findOne({ orderId: req.params.id });
    res.json({ order, chat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ارسال پاسخ
app.post('/api/orders/:id/reply', async (req, res) => {
  try {
    const { message } = req.body;
    const orderId = req.params.id;

    // ذخیره در چت
    let chat = await Chat.findOne({ orderId });
    if (chat) {
      chat.messages.push({ sender: 'admin', content: message });
      await chat.save();
    }

    // ارسال پیام به کاربر
    const order = await Order.findById(orderId);
    const user = await User.findById(order.userId);

    if (user) {
      bot.sendMessage(user.chatId,
        `💬 پاسخ پشتیبانی:\n\n${message}`
      );
    }

    // بروزرسانی وضعیت
    order.status = 'replied';
    await order.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// 🎨 Serve Glassmorphism Panel
// ============================================

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Fallback for any other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// ============================================
// 🚀 Start Server
// ============================================

app.listen(PORT, () => {
  console.log(`\n${'='.repeat(50)}`);
  console.log(`🚀 سرور شروع شد`);
  console.log(`${'='.repeat(50)}`);
  console.log(`📱 پنل مدیریت: http://localhost:${PORT}`);
  console.log(`🤖 ربات: فعال است`);
  console.log(`📊 MongoDB: متصل شد`);
  console.log(`${'='.repeat(50)}\n`);
});

// Graceful shutdown
process.on('SIGINT', () => {
  console.log('\n🛑 سرور بند شد');
  process.exit(0);
});