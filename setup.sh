#!/bin/bash

# نام پروژه
PROJECT_NAME="telegram-bot-project"

# ساخت پوشه پروژه
mkdir $PROJECT_NAME
cd $PROJECT_NAME

# ایجاد فایل‌های پروژه
touch bot.js db.js userController.js fileController.js support.js schedule.js package.json

# اضافه کردن محتوای اولیه به هر فایل
echo '{
  "name": "telegram-bot",
  "version": "1.0.0",
  "main": "bot.js",
  "dependencies": {
    "node-telegram-bot-api": "^0.61.0",
    "mongoose": "^7.5.0",
    "node-schedule": "^2.1.1"
  }
}' > package.json

cat <<EOL > db.js
const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://127.0.0.1:27017/telegramBot', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
  }
};

module.exports = connectDB;
EOL

cat <<EOL > userController.js
const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  userId: { type: Number, required: true },
  username: String,
  firstName: String,
  joinedAt: { type: Date, default: Date.now },
});

const User = mongoose.model('User', userSchema);

const saveUser = async (userId, username, firstName) => {
  const existingUser = await User.findOne({ userId });
  if (!existingUser) {
    const newUser = new User({ userId, username, firstName });
    await newUser.save();
    console.log('✅ User saved:', username);
  }
};

const getUserCount = async () => {
  return await User.countDocuments();
};

module.exports = { saveUser, getUserCount, User };
EOL

cat <<EOL > fileController.js
const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
  fileName: { type: String, required: true },
  fileId: { type: String, required: true },
});

const File = mongoose.model('File', fileSchema);

const addFile = async (fileName, fileId) => {
  const newFile = new File({ fileName, fileId });
  await newFile.save();
  console.log('✅ File added:', fileName);
};

const getFiles = async () => {
  return await File.find();
};

module.exports = { addFile, getFiles };
EOL

cat <<EOL > support.js
const supportHandler = (bot, ADMIN_ID) => {
  bot.onText(/\/support (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const message = match[1];

    bot.sendMessage(ADMIN_ID, \`پیام جدید از \${chatId}:\n\${message}\`);
    bot.sendMessage(chatId, 'پیام شما به پشتیبانی ارسال شد. ✅');
  });

  bot.onText(/\/reply (\\d+) (.+)/, (msg, match) => {
    const adminId = msg.chat.id;
    if (adminId == ADMIN_ID) {
      const userId = parseInt(match[1]);
      const replyMessage = match[2];

      bot.sendMessage(userId, \`پاسخ پشتیبانی:\n\${replyMessage}\`);
    }
  });
};

module.exports = supportHandler;
EOL

cat <<EOL > schedule.js
const schedule = require('node-schedule');

const scheduleMessage = (bot, User) => {
  schedule.scheduleJob('0 9 * * *', async () => {
    const users = await User.find();
    users.forEach(user => {
      bot.sendMessage(user.userId, 'صبح بخیر! 🌞 پیام امروز شما: ...');
    });
  });
};

module.exports = scheduleMessage;
EOL

cat <<EOL > bot.js
const TelegramBot = require('node-telegram-bot-api');
const connectDB = require('./db');
const { saveUser, getUserCount } = require('./userController');
const { addFile, getFiles } = require('./fileController');
const supportHandler = require('./support');
const scheduleMessage = require('./schedule');

const TOKEN = 'YOUR_TELEGRAM_BOT_TOKEN';
const ADMIN_ID = 123456789; // جایگزین با آیدی ادمین
const bot = new TelegramBot(TOKEN, { polling: true });

// اتصال به دیتابیس
connectDB();

// ذخیره کاربران
bot.on('message', async (msg) => {
  const { id, username, first_name } = msg.chat;
  await saveUser(id, username, first_name);
});

// نمایش منوی اصلی
bot.onText(/\/start/, (msg) => {
  bot.sendMessage(msg.chat.id, '📋 منوی اصلی:', {
    reply_markup: {
      inline_keyboard: [
        [{ text: '🎵 موزیک', callback_data: 'music' }],
        [{ text: '📁 فایل‌ها', callback_data: 'files' }],
        [{ text: '📊 مدیریت کاربران', callback_data: 'users' }],
      ],
    },
  });
});

// هندل دکمه‌های شیشه‌ای
bot.on('callback_query', async (query) => {
  const chatId = query.message.chat.id;

  if (query.data === 'music') {
    bot.sendMessage(chatId, '🎵 لیست موزیک‌ها:');
  } else if (query.data === 'files') {
    const files = await getFiles();
    files.forEach(file => {
      bot.sendMessage(chatId, \`📁 \${file.fileName}\`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📥 دانلود', url: \`https://t.me/\${file.fileId}\` }],
          ],
        },
      });
    });
  } else if (query.data === 'users') {
    const count = await getUserCount();
    bot.sendMessage(chatId, \`👥 تعداد کل کاربران: \${count}\`);
  }
});

// پشتیبانی آنلاین
supportHandler(bot, ADMIN_ID);

// ارسال خودکار پیام‌ها
scheduleMessage(bot, require('./userController').User);
EOL

# نصب وابستگی‌ها
npm install node-telegram-bot-api mongoose node-schedule

echo "✅ پروژه با موفقیت ایجاد شد!"
