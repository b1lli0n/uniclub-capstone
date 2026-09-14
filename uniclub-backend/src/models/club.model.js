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

    slogan: {
      type: String,
      trim: true,
      default: "",
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

    president_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
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

clubSchema.index({ president_id: 1 });

module.exports = mongoose.model("Club", clubSchema);
