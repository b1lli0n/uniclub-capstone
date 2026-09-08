const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventCreationRequestSchema = Schema(
  {
    club_id: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
    },
    requested_by: {
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
    approval_document_url: {
      type: String,
      required: false,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      required: true,
      default: "pending",
    },
    review_note: {
      type: String,
      required: false,
      trim: true,
    },
    reviewed_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
    reviewed_at: {
      type: Date,
      required: false,
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

eventCreationRequestSchema.index({ club_id: 1 });
eventCreationRequestSchema.index({ status: 1 });

module.exports = mongoose.model("EventCreationRequest", eventCreationRequestSchema);
