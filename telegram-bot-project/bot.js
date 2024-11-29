const TelegramBot = require('node-telegram-bot-api');
const connectDB = require('./db');
const { saveUser, getUserCount } = require('./userController');
const { addFile, getFiles } = require('./fileController');
const supportHandler = require('./support');
const scheduleMessage = require('./schedule');

const TOKEN = '7835327718:AAG0aK8WyexgLccGwniQm-SCcp2pFQYhyEI';
const ADMIN_ID = 6087657605; // جایگزین با آیدی ادمین
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








// const TelegramBot = require('node-telegram-bot-api');
// const connectDB = require('./db');
// const { addFile, getFiles, getFileByCode } = require('./fileController');
// const crypto = require('crypto');

// // تنظیمات
// const TOKEN = '7835327718:AAHcPn1qw60RIdv-ai5xFHde6c-EjHaGBjM';
// const ADMIN_ID = 6087657605; // آیدی عددی مدیر
// const BOT_USERNAME = 'SoundCloudmusic_bot'; // نام کاربری ربات
// const bot = new TelegramBot(TOKEN, { polling: true });

// // اتصال به دیتابیس
// connectDB();

// // متغیر برای پیگیری وضعیت مدیر
// let waitingForFile = false;

// // هندلر برای دستور /addfile
// bot.onText(/\/addfile/, (msg) => {
//   const chatId = msg.chat.id;

//   // بررسی اینکه آیا کاربر مدیر است
//   if (chatId === ADMIN_ID) {
//     waitingForFile = true; // ربات منتظر فایل خواهد بود
//     bot.sendMessage(chatId, '✅ لطفاً فایل خود را ارسال کنید.');
//   }
// });

// // هندلر برای دریافت فایل
// bot.on('document', async (msg) => {
//   const chatId = msg.chat.id;

//   // بررسی اینکه فایل از طرف مدیر ارسال شده است
//   if (chatId === ADMIN_ID && waitingForFile) {
//     const fileId = msg.document.file_id; // گرفتن file_id
//     const fileName = msg.document.file_name; // گرفتن نام فایل

//     // تولید یک کد یکتا برای فایل
//     const uniqueCode = crypto.randomBytes(10).toString('hex');

//     // ذخیره فایل در دیتابیس
//     await addFile(fileName, fileId, uniqueCode);

//     // ایجاد لینک استارت برای فایل
//     const fileLink = `https://t.me/${BOT_USERNAME}?start=${uniqueCode}`;

//     // ارسال لینک به مدیر
//     bot.sendMessage(chatId, `✅ فایل با موفقیت ذخیره شد. لینک زیر را می‌توانید برای دسترسی به فایل به اشتراک بگذارید:\n${fileLink}`);

//     waitingForFile = false; // حالت انتظار فایل را غیرفعال کنید
//   }
// });

// // هندلر برای دستور /start با کد یکتا
// bot.onText(/\/start (.+)/, async (msg, match) => {
//   const chatId = msg.chat.id;
//   const uniqueCode = match[1]; // گرفتن کد یکتا

//   // پیدا کردن فایل مربوط به کد یکتا
//   const file = await getFileByCode(uniqueCode);

//   if (file) {
//     // ارسال فایل به کاربر
//     bot.sendDocument(chatId, file.fileId, { caption: `📁 ${file.fileName}` });
//   } else {
//     // اگر کد معتبر نبود
//     bot.sendMessage(chatId, '❌ فایل مورد نظر یافت نشد.');
//   }
// });
