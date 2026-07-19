const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const clubMemberSchema = Schema(
  {
    club_id: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },

    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    role: {
      type: String,
      required: true,
      enum: ["member", "president", "secretary", "treasurer", "event_manager"],
      default: "member",
    },

    status: {
      type: String,
      required: true,
      enum: ["active", "left", "removed"],
      default: "active",
    },

    joined_at: {
      type: Date,
      required: true,
      default: Date.now,
    },

    left_at: {
      type: Date,
      default: null,
    },

    // Số điểm mà thành viên có thể dùng để đổi thưởng trong CLB này.
    reward_points: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
    },
  },
  {
    timestamps: false,
  }
);

clubMemberSchema.index({ club_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model("ClubMember", clubMemberSchema);
