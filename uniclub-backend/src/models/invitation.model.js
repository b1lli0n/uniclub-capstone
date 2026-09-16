const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const invitationSchema = Schema(
  {
    club_id: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },

    invited_user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    invited_by: {
      type: Schema.Types.ObjectId,
      ref: "ClubMember",
      required: true,
    },

    role: {
      type: String,
      required: true,
      enum: ["member", "president", "secretary", "treasurer", "event_manager"],
      default: "member",
    },

    message: {
      type: String,
      default: "",
      trim: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["pending", "accepted", "rejected", "cancelled", "expired"],
      default: "pending",
    },

    expires_at: {
      type: Date,
      required: true,
      default: () => new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      index: true,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

invitationSchema.index({ invited_user_id: 1, status: 1 });
invitationSchema.index({ club_id: 1, invited_user_id: 1, status: 1 });
invitationSchema.index({ status: 1, expires_at: 1 });

module.exports = mongoose.model("Invitation", invitationSchema);
