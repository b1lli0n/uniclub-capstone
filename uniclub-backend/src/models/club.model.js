const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Schema lưu thông tin câu lạc bộ.
const clubSchema = Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      trim: true,
    },

    logo_url: {
      type: String,
      required: true,
      default: "",
    },

    category: {
      type: String,
      required: true,
      trim: true,
      enum: ["Arts", "Sports", "Academic", "Event", "Other"],
      default: "Other",
    },

    status: {
      type: String,
      required: true,
      enum: ["active", "inactive"],
      default: "active",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

module.exports = mongoose.model("Club", clubSchema);
