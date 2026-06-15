const mongoose = require("mongoose");
const { CLUB_MEMBER_ROLE, CLUB_MEMBER_STATUS } = require("../utils/constants");

const clubMemberSchema = new mongoose.Schema(
  {
    club_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Club",
      required: true
    },
    user_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    role: {
      type: String,
      enum: Object.values(CLUB_MEMBER_ROLE),
      required: true,
      default: CLUB_MEMBER_ROLE.MEMBER
    },
    status: {
      type: String,
      enum: Object.values(CLUB_MEMBER_STATUS),
      required: true,
      default: CLUB_MEMBER_STATUS.ACTIVE
    },
    joined_at: {
      type: Date,
      required: true,
      default: Date.now
    },
    left_at: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: false
  }
);

clubMemberSchema.index({ club_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model("ClubMember", clubMemberSchema);