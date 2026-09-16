const multer = require("multer");

// Sử dụng memoryStorage để lưu trữ file dạng Buffer trong RAM rồi đẩy lên Cloudinary
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed!"), false);
  }
};

const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB
  },
  fileFilter,
});

module.exports = {
  upload,
  uploadSingle: (fieldName = "image") => upload.single(fieldName),
  uploadMultiple: (fieldName = "images", maxCount = 5) => upload.array(fieldName, maxCount),
};
