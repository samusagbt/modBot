// ============================================
// 👤 models/User.js - مدل کاربر
// ============================================

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  _id: {
    type: Number,
    required: true
  },
  firstName: String,
  lastName: String,
  username: String,
  chatId: Number,
  status: {
    type: String,
    enum: ['normal', 'awaiting_order_text', 'blocked'],
    default: 'normal'
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);


// ============================================
// 📦 models/Order.js - مدل سفارش
// ============================================

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Schema.Types.ObjectId,
    auto: true
  },
  userId: {
    type: Number,
    required: true,
    ref: 'User'
  },
  content: {
    type: String,
    required: true
  },
  fileId: {
    type: String,
    default: null
  },
  status: {
    type: String,
    enum: ['pending', 'replied', 'completed', 'cancelled'],
    default: 'pending'
  },
  notes: String,
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);


// ============================================
// 💬 models/Chat.js - مدل چت/مکالمه
// ============================================

const mongoose = require('mongoose');

const chatSchema = new mongoose.Schema({
  orderId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'Order'
  },
  userId: {
    type: Number,
    required: true,
    ref: 'User'
  },
  messages: [
    {
      sender: {
        type: String,
        enum: ['user', 'admin'],
        required: true
      },
      content: {
        type: String,
        required: true
      },
      fileId: String,
      timestamp: {
        type: Date,
        default: Date.now
      }
    }
  ],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Chat', chatSchema);


// ============================================
// 🔐 نکات امنیتی
// ============================================

/*
✅ مدل‌های بالا شامل:

1. User:
   - ذخیره اطلاعات کاربر تلگرام
   - وضعیت کاربر (آیا منتظر ورودی است؟)
   - chatId برای ارسال پیام مستقیم

2. Order:
   - شناسه منحصر برای هر سفارش
   - userId برای پیوند با کاربر
   - محتوا و فایل‌های آپلود شده
   - وضعیت سفارش (pending, replied, completed)
   - تاریخ ایجاد و آپدیت

3. Chat:
   - ذخیره تمام پیام‌های مکالمه
   - sender (کاربر یا ادمین)
   - timestamp برای ترتیب پیام‌ها
   - fileId برای فایل‌ها

✅ ایندکس‌ها برای بهتری کارایی:
*/

// اضافه کنید به انتهای هر فایل:

// userSchema.index({ chatId: 1 });
// userSchema.index({ username: 1 });

// orderSchema.index({ userId: 1 });
// orderSchema.index({ status: 1 });
// orderSchema.index({ createdAt: -1 });

// chatSchema.index({ orderId: 1 });
// chatSchema.index({ userId: 1 });