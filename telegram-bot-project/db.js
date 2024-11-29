const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    await mongoose.connect('mongodb://localhost:27017/telegramBot', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
  });
  
    console.log('✅ Connected to MongoDB');
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
  }
};

module.exports = connectDB;
