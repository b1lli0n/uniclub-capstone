const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// status: "pending", "success", "failed"
// payment_method: "vnpay", "cash"
const paymentSchema = new Schema(
  {
    // The project uses ClubMember as the membership model.
    membership_id: {
      type: Schema.Types.ObjectId,
      ref: "ClubMember",
      required: true,
      index: true,
    },
    transaction_id: {
      type: Schema.Types.ObjectId,
      ref: "Transaction",
      required: true,
      index: true,
    },
    period: {
      type: String,
      required: true,
      trim: true,
      maxlength: 30,
      match: [/^(SP|FA|SU)\d{2,4}$/i, "Period must be in semester format like SP24, FA24, SU24"],
    },
    amount: { type: Number, required: true, min: 0 },
    status: {
      type: String,
      enum: ["pending", "success", "failed"],
      default: "pending",
      required: true,
      index: true,
    },
    payment_method: {
      type: String,
      enum: ["vnpay", "cash"],
      default: "vnpay",
      required: true,
    },
    txn_ref: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      maxlength: 100,
      required: function () {
        return this.payment_method === "vnpay";
      },
    },
    vnp_response_code: {
      type: String,
      trim: true,
      maxlength: 20,
      required: function () {
        return this.payment_method === "vnpay" && this.status !== "pending";
      },
    },
    order_info: { type: String, trim: true, maxlength: 255, default: "" },
    paid_at: { type: Date, default: null },
  },
  { timestamps: { createdAt: "created_at", updatedAt: "updated_at" } }
);

// A member receives at most one payment record for one approved transaction.
paymentSchema.index({ transaction_id: 1, membership_id: 1 }, { unique: true });
paymentSchema.index({ membership_id: 1, created_at: -1 });
paymentSchema.index({ status: 1, payment_method: 1, created_at: -1 });

module.exports = mongoose.model("Payment", paymentSchema);
