// ============================================
// 📦 package.json - تمام dependencies
// ============================================

{
  "name": "telegram-order-bot",
  "version": "1.0.0",
  "description": "Advanced Telegram Order Management Bot",
  "main": "server.js",
  "scripts": {
    "start": "node server.js",
    "dev": "nodemon server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "dotenv": "^16.0.3",
    "mongoose": "^7.0.0",
    "node-telegram-bot-api": "^0.60.0",
    "cors": "^2.8.5",
    "multer": "^1.4.5-lts.1",
    "bcryptjs": "^2.4.3",
    "jsonwebtoken": "^9.0.0"
  },
  "devDependencies": {
    "nodemon": "^2.0.20"
  }
}


// ============================================
// 🔌 server.js - سرور اصلی
// ============================================

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const TelegramBot = require('node-telegram-bot-api');

const app = express();
const PORT = process.env.PORT || 5000;
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const MONGODB_URI = process.env.MONGODB_URI;

// Middleware
app.use(express.json());
app.use(cors());

// ✅ MongoDB Connection
mongoose.connect(MONGODB_URI)
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB error:', err));

// Import Models
const User = require('./models/User');
const Order = require('./models/Order');
const Chat = require('./models/Chat');

// ✅ Bot Setup
const bot = new TelegramBot(BOT_TOKEN, { polling: true });

// ============================================
// 📱 Bot Event Handlers
// ============================================

// دستور /start
bot.onText(/\/start/, async (msg) => {
  const chatId = msg.chat.id;
  const user = msg.from;

  // ذخیره یا بروزرسانی کاربر
  await User.findByIdAndUpdate(
    user.id,
    {
      _id: user.id,
      firstName: user.first_name,
      lastName: user.last_name || '',
      username: user.username || '',
      chatId: chatId
    },
    { upsert: true }
  );

  const keyboard = {
    inline_keyboard: [
      [{ text: '📝 ارسال درخواست', callback_data: 'submit_order' }],
      [{ text: '📦 سفارشات من', callback_data: 'my_orders' }],
      [{ text: '💬 تماس با پشتیبانی', callback_data: 'contact_support' }]
    ]
  };

  bot.sendMessage(chatId, 
    `سلام ${user.first_name}! 👋\n\nبه ربات سفارشات خوش آمدید!\n\nاز گزینه‌های زیر استفاده کنید:`,
    { reply_markup: keyboard }
  );
});

// callback handler
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;
  const userId = query.from.id;
  const data = query.data;

  if (data === 'submit_order') {
    bot.sendMessage(chatId, 
      '📝 لطفا درخواست خود را بنویسید:\n\n(می‌تونید متن، فایل یا تصویر ارسال کنید)',
      { reply_markup: { inline_keyboard: [[{ text: '❌ لغو', callback_data: 'cancel' }]]} }
    );
    
    // تنظیم وضعیت انتظار برای پیام بعدی
    await User.findByIdAndUpdate(userId, { status: 'awaiting_order_text' });
  }
  
  if (data === 'my_orders') {
    const orders = await Order.find({ userId });
    
    if (orders.length === 0) {
      bot.sendMessage(chatId, '📭 شما هنوز سفارشی ثبت نکردید.');
      return;
    }

    let message = '📦 سفارشات شما:\n\n';
    orders.forEach((order, index) => {
      message += `${index + 1}. سفارش #${order._id}\n`;
      message += `   وضعیت: ${getStatusEmoji(order.status)} ${order.status}\n`;
      message += `   تاریخ: ${new Date(order.createdAt).toLocaleDateString('fa-IR')}\n\n`;
    });

    bot.sendMessage(chatId, message);
  }

  bot.answerCallbackQuery(query.id);
});

// دریافت متن و فایل
bot.on('message', async (msg) => {
  const chatId = msg.chat.id;
  const userId = msg.from.id;

  const user = await User.findById(userId);
  
  // اگر کاربر درحال انتظار ارسال درخواست است
  if (user && user.status === 'awaiting_order_text') {
    let orderContent = '';
    let fileId = null;

    if (msg.text) {
      orderContent = msg.text;
    } else if (msg.document) {
      fileId = msg.document.file_id;
      orderContent = `فایل: ${msg.document.file_name}`;
    } else if (msg.photo) {
      fileId = msg.photo[msg.photo.length - 1].file_id;
      orderContent = 'تصویر آپلود شد';
    }

    if (!orderContent) {
      bot.sendMessage(chatId, '❌ لطفا متن یا فایل ارسال کنید.');
      return;
    }

    // ایجاد سفارش
    const order = new Order({
      userId,
      content: orderContent,
      fileId,
      status: 'pending',
      createdAt: new Date()
    });

    await order.save();
    
    // بروزرسانی وضعیت کاربر
    await User.findByIdAndUpdate(userId, { status: 'normal' });

    // پیام تایید برای کاربر
    bot.sendMessage(chatId, 
      `✅ درخواست شما با شماره #${order._id} ثبت شد!\n\n` +
      `منتظر پاسخ پشتیبانی باشید.`,
      { reply_markup: { inline_keyboard: [[{ text: '🏠 منو اصلی', callback_data: 'main_menu' }]]} }
    );

    // اطلاع ادمین
    const adminIds = process.env.ADMIN_CHAT_IDS.split(',');
    adminIds.forEach(adminId => {
      bot.sendMessage(adminId,
        `🆕 سفارش جدید!\n\n` +
        `سفارش #: ${order._id}\n` +
        `کاربر: ${msg.from.first_name}\n` +
        `محتوا: ${orderContent}\n\n` +
        `برای پاسخ دادن، دستور زیر را استفاده کنید:\n` +
        `/reply ${order._id}`
      );
    });

    // ایجاد Chat Record
    const chat = new Chat({
      orderId: order._id,
      userId,
      messages: [{
        sender: 'user',
        content: orderContent,
        timestamp: new Date()
      }]
    });

    await chat.save();
  }
});

// ============================================
// 🔐 REST API Routes
// ============================================

// Get all orders (for admin dashboard)
app.get('/api/orders', async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 });
    res.json(orders);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get order details with chat
app.get('/api/orders/:id', async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    const chat = await Chat.findOne({ orderId: req.params.id });
    res.json({ order, chat });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Reply to order
app.post('/api/orders/:id/reply', async (req, res) => {
  try {
    const { message } = req.body;
    const orderId = req.params.id;

    // ذخیره در Chat
    const chat = await Chat.findOne({ orderId });
    if (chat) {
      chat.messages.push({
        sender: 'admin',
        content: message,
        timestamp: new Date()
      });
      await chat.save();
    }

    // ارسال پیام به کاربر
    const order = await Order.findById(orderId);
    const user = await User.findById(order.userId);

    bot.sendMessage(user.chatId,
      `💬 پاسخ پشتیبانی برای سفارش #${orderId}:\n\n${message}`
    );

    // بروزرسانی وضعیت سفارش
    order.status = 'replied';
    await order.save();

    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ============================================
// 🚀 Start Server
// ============================================

app.listen(PORT, () => {
  console.log(`🚀 سرور شروع شد: http://localhost:${PORT}`);
  console.log(`🤖 ربات فعال است...`);
});

// ============================================
// 📍 Helper Functions
// ============================================

function getStatusEmoji(status) {
  const emojis = {
    'pending': '⏳',
    'replied': '✅',
    'completed': '🎉',
    'cancelled': '❌'
  };
  return emojis[status] || '❓';
}