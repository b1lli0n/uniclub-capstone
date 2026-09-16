const cloudinary = require("../config/cloudinary");

/**
 * Kiểm tra xem chuỗi có phải là Data URI Base64 hay không
 * @param {string} str 
 * @returns {boolean}
 */
const isBase64Image = (str) => {
  if (!str || typeof str !== "string") return false;
  return str.startsWith("data:image/") || str.startsWith("data:application/octet-stream;base64,");
};

/**
 * Upload ảnh Base64 lên Cloudinary
 * @param {string} base64Str - Chuỗi base64 Data URI
 * @param {string} folder - Thư mục trên Cloudinary (ví dụ: 'uniclub/avatars')
 * @returns {Promise<string>} secure_url của Cloudinary
 */
const uploadBase64 = async (base64Str, folder = "uniclub") => {
  if (!base64Str || typeof base64Str !== "string") return "";

  // Nếu không phải chuỗi base64 (ví dụ đã là URL cdn hoặc url tĩnh), trả về nguyên trạng
  if (!isBase64Image(base64Str)) {
    return base64Str;
  }

  try {
    const result = await cloudinary.uploader.upload(base64Str, {
      folder,
      resource_type: "image",
    });
    return result.secure_url;
  } catch (error) {
    console.error(`[Cloudinary] Upload base64 failed for folder ${folder}:`, error);
    throw new Error(`Failed to upload image to Cloudinary: ${error.message}`);
  }
};

/**
 * Upload file buffer từ Multer lên Cloudinary
 * @param {Buffer} buffer - File buffer từ req.file.buffer
 * @param {string} folder - Thư mục trên Cloudinary
 * @returns {Promise<string>} secure_url của Cloudinary
 */
const uploadBuffer = (buffer, folder = "uniclub") => {
  return new Promise((resolve, reject) => {
    if (!buffer) return resolve("");

    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        resource_type: "image",
      },
      (error, result) => {
        if (error) {
          console.error(`[Cloudinary] Upload stream failed for folder ${folder}:`, error);
          return reject(new Error(`Failed to upload image to Cloudinary: ${error.message}`));
        }
        resolve(result.secure_url);
      }
    );

    uploadStream.end(buffer);
  });
};

/**
 * Hàm upload đa năng: nhận Base64, Multer file object, hoặc Buffer
 * @param {string|object|Buffer} source 
 * @param {string} folder 
 * @returns {Promise<string>}
 */
const uploadImage = async (source, folder = "uniclub") => {
  if (!source) return "";

  // 1. Trường hợp source là multer file object
  if (typeof source === "object" && source.buffer) {
    return uploadBuffer(source.buffer, folder);
  }

  // 2. Trường hợp source là Buffer trực tiếp
  if (Buffer.isBuffer(source)) {
    return uploadBuffer(source, folder);
  }

  // 3. Trường hợp source là chuỗi Base64
  if (typeof source === "string") {
    if (isBase64Image(source)) {
      return uploadBase64(source, folder);
    }
    return source; // URL thông thường
  }

  return "";
};

// Các hàm tiện ích chuyên biệt theo từng thực thể
const uploadAvatar = (fileOrBase64) => uploadImage(fileOrBase64, "uniclub/avatars");
const uploadClubLogo = (fileOrBase64) => uploadImage(fileOrBase64, "uniclub/clubs");
const uploadEventMedia = (fileOrBase64) => uploadImage(fileOrBase64, "uniclub/events");
const uploadRewardImage = (fileOrBase64) => uploadImage(fileOrBase64, "uniclub/rewards");
const uploadCustom = (fileOrBase64, folder = "uniclub/general") => uploadImage(fileOrBase64, folder);

module.exports = {
  isBase64Image,
  uploadBase64,
  uploadBuffer,
  uploadImage,
  uploadAvatar,
  uploadClubLogo,
  uploadEventMedia,
  uploadRewardImage,
  uploadCustom,
};
