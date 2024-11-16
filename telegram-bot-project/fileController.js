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
