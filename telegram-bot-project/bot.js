const TelegramBot = require('node-telegram-bot-api');
const connectDB = require('./db');
const { saveUser, getUserCount } = require('./userController');
const { addFile, getFiles } = require('./fileController');
const supportHandler = require('./support');
const scheduleMessage = require('./schedule');

const TOKEN = '6352712951:AAHtDi_d8NfcmpaYYE9uqX9jZGD-6lsyj40';
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
      bot.sendMessage(chatId, `📁 ${file.fileName}`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: '📥 دانلود', url: `https://t.me/${file.fileId}` }],
          ],
        },
      });
    });
  } else if (query.data === 'users') {
    const count = await getUserCount();
    bot.sendMessage(chatId, `👥 تعداد کل کاربران: ${count}`);
  }
});

// پشتیبانی آنلاین
supportHandler(bot, ADMIN_ID);

// ارسال خودکار پیام‌ها
scheduleMessage(bot, require('./userController').User);
