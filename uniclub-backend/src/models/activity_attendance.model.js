const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const activityAttendanceSchema = Schema(
  {
    activity_id: {
      type: Schema.Types.ObjectId,
      ref: "Activity",
      required: true,
    },
    club_id: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    membership_id: {
      type: Schema.Types.ObjectId,
      ref: "ClubMember",
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["attended", "absent", "pending"],
      default: "pending",
    },
    check_in_time: {
      type: Date,
      default: null,
    },
    checked_by: {
      type: Schema.Types.ObjectId,
      ref: "ClubMember",
      default: null,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

activityAttendanceSchema.index({ activity_id: 1, membership_id: 1 }, { unique: true });
activityAttendanceSchema.index({ club_id: 1, activity_id: 1 });
activityAttendanceSchema.index({ status: 1 });

module.exports = mongoose.model("ActivityAttendance", activityAttendanceSchema);
