const mongoose = require('mongoose')
const Schema = mongoose.Schema

const paymentSchema = new Schema({
  membership_id: {
    type: Schema.Types.ObjectId,
    ref: 'ClubMember',
    required: true,
    index: true
  },
  transaction_id: {
    type: Schema.Types.ObjectId,
    ref: 'Transaction',
    required: false,
    default: null,
    index: true
  },
  period: {
    type: String,
    required: true,
    trim: true,
    maxlength: 30
  },
  amount: {
    type: Number,
    required: true,
    min: 0
  },
  // 0: PENDING, 1: SUCCESS, 2: FAILED
  status: {
    type: Number,
    enum: [0, 1, 2],
    default: 0,
    required: true,
    index: true
  },
  // 0: CASH, 1: VNPAY
  payment_method: {
    type: Number,
    enum: [0, 1],
    default: 0,
    required: true
  },
  txn_ref: {
    type: String,
    unique: true,
    sparse: true,
    trim: true,
    maxlength: 100,
    required: function requiredTxnRef() {
      return this.payment_method === 1 && this.status !== 0
    }
  },
  vnp_response_code: {
    type: String,
    trim: true,
    maxlength: 20
  },
  order_info: {
    type: String,
    trim: true,
    maxlength: 255
  },
  paid_at: {
    type: Date
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

paymentSchema.index({ membership_id: 1, created_at: -1 })
paymentSchema.index({ status: 1, payment_method: 1, created_at: -1 })

module.exports = mongoose.model('Payment', paymentSchema)
