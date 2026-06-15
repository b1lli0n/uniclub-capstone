const mongoose = require("mongoose");
const { CLUB_STATUS } = require("../utils/constants");

const clubSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      trim: true
    },
    logo_url: {
      type: String,
      required: true,
      default: ""
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: Object.values(CLUB_STATUS),
      required: true,
      default: CLUB_STATUS.ACTIVE
    },
    created_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "update_at" }
  }
);

module.exports = mongoose.model("Club", clubSchema);