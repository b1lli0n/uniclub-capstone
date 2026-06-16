const mongoose = require("mongoose");
const Schema = mongoose.Schema

const profileSchema = new Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    student_code: {
      type: String,
      required: false,
      trim: true,
    },

    phone: {
      type: Number,
      required: false,
    },

    major: {
      type: String,
      required: false,
      trim: true,
    },

    campus: {
      type: String,
      required: false,
      trim: true,
    },

    social_links: {
      type: String,
      required: false,
      trim: true,
    },
  },
  {
    timestamps: {
      createdAt: false,
      updatedAt: "updated_at",
    },
  }
);

module.exports = mongoose.model("Profile", profileSchema);