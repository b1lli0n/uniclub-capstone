const express = require("express");
const { verifyToken } = require("../middlewares/auth.middleware");
const { uploadSingle } = require("../middlewares/upload.middleware");
const { uploadImage } = require("../controllers/upload.controller");

const router = express.Router();

// Route cho phép upload ảnh (hỗ trợ cả multipart/form-data qua field "image" và JSON body { image: base64 })
router.post("/", verifyToken, uploadSingle("image"), uploadImage);

module.exports = router;
