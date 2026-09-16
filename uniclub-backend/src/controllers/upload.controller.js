const { uploadCustom } = require("../utils/cloudinary.util");

/**
 * Controller xử lý endpoint upload ảnh trực tiếp
 */
const uploadImage = async (req, res) => {
  try {
    const folder = req.body.folder || req.query.folder || "uniclub/general";
    let imageUrl = "";

    // 1. Nếu upload qua multipart (Multer)
    if (req.file) {
      imageUrl = await uploadCustom(req.file, folder);
    } 
    // 2. Nếu upload qua Base64 body
    else if (req.body.image) {
      imageUrl = await uploadCustom(req.body.image, folder);
    } else {
      return res.status(400).json({
        success: false,
        message: "No image file or base64 data provided",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Image uploaded successfully",
      data: {
        url: imageUrl,
      },
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to upload image",
      error: error.message,
    });
  }
};

module.exports = {
  uploadImage,
};
