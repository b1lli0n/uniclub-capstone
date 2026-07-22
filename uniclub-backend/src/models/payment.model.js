const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// status: 0 = pending, 1 = success, 2 = failed
// payment_method: 0 = cash, 1 = VNPay
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
    period: { type: String, required: true, trim: true, maxlength: 30 },
    amount: { type: Number, required: true, min: 0 },
    status: { type: Number, enum: [0, 1, 2], default: 0, required: true, index: true },
    payment_method: { type: Number, enum: [0, 1], default: 0, required: true },
    txn_ref: {
      type: String,
      unique: true,
      sparse: true,
      trim: true,
      maxlength: 100,
      required: function () {
        return this.payment_method === 1;
      },
    },
    vnp_response_code: {
      type: String,
      trim: true,
      maxlength: 20,
      required: function () {
        return this.payment_method === 1 && this.status !== 0;
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
