const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventSchema = Schema(
  {
    club_id: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },

    created_by: {
      type: Schema.Types.ObjectId,
      ref: "ClubMember",
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
      trim: true,
    },

    category: {
      type: String,
      required: true,
      trim: true,
      enum: ["Arts", "Sports", "Academic", "Event", "Other"],
      default: "Other",
    },

    start_time: {
      type: Date,
      required: true,
    },

    end_time: {
      type: Date,
      required: true,
    },

    location: {
      type: String,
      required: true,
      trim: true,
    },

    is_public: {
      type: Boolean,
      required: true,
      default: true,
    },

    capacity: {
      type: Number,
      required: true,
    },

    status: {
      type: String,
      required: true,
      enum: ["coming soon", "opening", "closed", "cancelled"],
      default: "coming soon",
    },

    progress_status: {
      type: String,
      required: true,
      enum: ["draft", "completed"],
      default: "draft",
    },

    check_in_status: {
      type: String,
      required: true,
      enum: ["not_open", "open", "closed"],
      default: "not_open",
    },

    media_uris: {
      type: [String],
      default: [],
    },

    feedback_summary: {
      type: [String],
      default: [],
    },

    approval_document_url: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

eventSchema.index({ club_id: 1 });
eventSchema.index({ status: 1 });
eventSchema.index({ start_time: 1 });
eventSchema.index({ club_id: 1, start_time: -1 });
eventSchema.index({ club_id: 1, progress_status: 1, start_time: -1 });

module.exports = mongoose.model("Event", eventSchema);
