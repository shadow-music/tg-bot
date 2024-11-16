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
