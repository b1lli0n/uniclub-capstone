const mongoose = require("mongoose");

const profileSchema = new mongoose.Schema(
  {
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
    },

    student_code: {
      type: String,
      trim: true,
    },

    phone: {
      type: String,
      trim: true,
    },

    major: {
      type: String,
      trim: true,
    },

    campus: {
      type: String,
      trim: true,
    },

    social_links: {
      facebook: {
        type: String,
        default: "",
      },

      github: {
        type: String,
        default: "",
      },

      linkedin: {
        type: String,
        default: "",
      },
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Profile", profileSchema);