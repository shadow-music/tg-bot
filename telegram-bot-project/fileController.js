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









// const mongoose = require('mongoose');

// // تعریف مدل فایل
// const fileSchema = new mongoose.Schema({
//   fileName: { type: String, required: true },
//   fileId: { type: String, required: true },
//   uniqueCode: { type: String, required: true, unique: true }, // کد یکتا
// });

// const File = mongoose.model('File', fileSchema);

// // افزودن فایل جدید
// const addFile = async (fileName, fileId, uniqueCode) => {
//   const newFile = new File({ fileName, fileId, uniqueCode });
//   await newFile.save();
//   console.log('✅ File added:', fileName);
// };

// // دریافت فایل‌ها
// const getFiles = async () => {
//   return await File.find();
// };

// // پیدا کردن فایل بر اساس کد یکتا
// const getFileByCode = async (uniqueCode) => {
//   return await File.findOne({ uniqueCode });
// };

// module.exports = { addFile, getFiles, getFileByCode };
