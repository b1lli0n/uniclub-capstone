const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// type: 0 = income (can become a member fee), 1 = expense
// status: 0 = pending, 1 = approved, 2 = rejected
const transactionSchema = new Schema(
  {
    club_id: {
      type: Schema.Types.ObjectId,
      ref: "Club",
      required: true,
      index: true,
    },
    fee_id: {
      type: Schema.Types.ObjectId,
      ref: "Fee",
      default: null,
      index: true,
    },
    type: {
      type: Number,
      required: true,
      enum: [0, 1],
      default: 0,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    period: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
    },
    amount: {
      type: Number,
      required: true,
      min: 0,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      maxlength: 255,
    },
    transaction_date: {
      type: Date,
      required: true,
      index: true,
    },
    status: {
      type: Number,
      required: true,
      enum: [0, 1, 2],
      default: 0,
      index: true,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    approved_by: {
      type: Schema.Types.ObjectId,
      ref: "User",
      default: null,
      index: true,
      required: function () {
        return this.status === 1 || this.status === 2;
      },
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

transactionSchema.index({ club_id: 1, created_at: -1 });
transactionSchema.index({ club_id: 1, status: 1, created_at: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
