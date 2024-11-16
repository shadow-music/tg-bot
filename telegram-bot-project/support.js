const supportHandler = (bot, ADMIN_ID) => {
  bot.onText(/\/support (.+)/, (msg, match) => {
    const chatId = msg.chat.id;
    const message = match[1];

    bot.sendMessage(ADMIN_ID, `پیام جدید از ${chatId}:\n${message}`);
    bot.sendMessage(chatId, 'پیام شما به پشتیبانی ارسال شد. ✅');
  });

  bot.onText(/\/reply (\d+) (.+)/, (msg, match) => {
    const adminId = msg.chat.id;
    if (adminId == ADMIN_ID) {
      const userId = parseInt(match[1]);
      const replyMessage = match[2];

      bot.sendMessage(userId, `پاسخ پشتیبانی:\n${replyMessage}`);
    }
  });
};

module.exports = supportHandler;
