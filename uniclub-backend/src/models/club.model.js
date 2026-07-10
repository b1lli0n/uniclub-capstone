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
    },

    status: {
      type: String,
      required: true,
      enum: ["active", "inactive"],
      default: "active",
    },

    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "update_at" },
  }
);

module.exports = mongoose.model("Club", clubSchema);
