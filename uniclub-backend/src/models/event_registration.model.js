const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const eventRegistrationSchema = Schema(
  {
    event_id: {
      type: Schema.Types.ObjectId,
      ref: "Event",
      required: true,
    },

    user_id: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    registered_at: {
      type: Date,
      required: true,
      default: Date.now,
    },

    check_in_time: {
      type: Date,
      default: null,
    },

    status: {
      type: String,
      required: true,
      enum: ["pending", "approved", "rejected", "attended", "cancelled"],
      default: "pending",
    },
  },
  {
    timestamps: { createdAt: "created_at", updatedAt: "updated_at" },
  }
);

// Tránh việc user đăng ký trùng lặp nhiều lần cho cùng 1 event
eventRegistrationSchema.index({ event_id: 1, user_id: 1 }, { unique: true });

module.exports = mongoose.model("EventRegistration", eventRegistrationSchema);
