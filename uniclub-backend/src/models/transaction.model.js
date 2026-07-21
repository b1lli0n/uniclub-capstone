const mongoose = require('mongoose')
const Schema = mongoose.Schema

const transactionSchema = new Schema({
  club_id: {
    type: Schema.Types.ObjectId,
    ref: 'Club',
    required: true,
    index: true
  },
  fee_id: {
    type: Schema.Types.ObjectId,
    ref: 'Fee',
    required: false,
    default: null,
    index: true
  },
  type: {
    type: Number,
    required: true,
    default: 0
  },
  category: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
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
  description: {
    type: String,
    required: true,
    trim: true,
    maxlength: 255
  },
  transaction_date: {
    type: Date,
    required: true,
    index: true
  },
  status: {
    type: Number,
    required: true,
    default: 0,
    index: true
  },
  created_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  approved_by: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    index: true,
    default: null,
    required: function() {
      return this.status === 1 || this.status === 2
    }
  }
}, {
  timestamps: { createdAt: 'created_at', updatedAt: 'updated_at' }
})

transactionSchema.index({ club_id: 1, created_at: -1 })
transactionSchema.index({ club_id: 1, status: 1, created_at: -1 })

module.exports = mongoose.model('Transaction', transactionSchema)
