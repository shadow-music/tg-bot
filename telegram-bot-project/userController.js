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
