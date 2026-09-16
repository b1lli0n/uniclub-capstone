const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// type: "income", "expense"
// status: "pending", "approved", "rejected"
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
      default: null,
      index: true,
    },
    type: {
      type: String,
      required: true,
      enum: ["income", "expense"],
      default: "income",
    },
    category: {
      type: String,
      trim: true,
      default: "",
    },
    title: {
      type: String,
      trim: true,
      maxlength: 100,
      default: "",
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
      type: String,
      required: true,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
      index: true,
    },
    created_by: {
      type: Schema.Types.ObjectId,
      ref: "ClubMember",
      required: true,
      index: true,
    },
    approved_by: {
      type: Schema.Types.ObjectId,
      ref: "ClubMember",
      default: null,
      index: true,
      required: function () {
        return this.status === "approved" || this.status === "rejected";
      },
    },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

transactionSchema.index({ club_id: 1, created_at: -1 });
transactionSchema.index({ club_id: 1, status: 1, created_at: -1 });

module.exports = mongoose.model("Transaction", transactionSchema);
