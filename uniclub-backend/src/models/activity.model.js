const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const activitySchema = new Schema(
  {
    club_id: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      required: true,
    },
    location: {
      type: String,
      required: true,
    },
    start_time: {
      type: Date,
      required: true,
    },
    end_time: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      required: true,
      enum: ["coming_soon", "opening", "closed", "cancelled"],
      default: "coming_soon",
    },
    progress_status: {
      type: String,
      required: true,
      enum: ["draft", "published"],
      default: "draft",
    },
    media_urls: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

activitySchema.index({ club_id: 1, start_time: 1 });
activitySchema.index({ status: 1 });

module.exports = mongoose.model("Activity", activitySchema);
