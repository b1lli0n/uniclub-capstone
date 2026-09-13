const ClubMember = require("../models/club_member.model");
const Payment = require("../models/payment.model");
const Transaction = require("../models/transaction.model");
const { getStatusError } = require("../utils/error");

const withSession = (query, session) => (session ? query.session(session) : query);

// Call this immediately after a president changes a transaction to approved.
// It is idempotent: calling it again does not create duplicate payment records.
const createPaymentsForApprovedTransaction = async (transactionId, { session = null } = {}) => {
  const transaction = await withSession(Transaction.findById(transactionId), session);

  if (!transaction) throw getStatusError("Transaction not found", 404);
  if (transaction.status !== 1) throw getStatusError("Transaction has not been approved", 400);

  // Only an approved income transaction is payable by club members.
  if (transaction.type !== 0) return [];

  const memberships = await withSession(
    ClubMember.find({ club_id: transaction.club_id, status: "active" }).select("_id"),
    session
  );

  if (!memberships.length) return [];

  await Payment.bulkWrite(
    memberships.map((membership) => ({
      updateOne: {
        filter: { transaction_id: transaction._id, membership_id: membership._id },
        update: {
          $setOnInsert: {
            transaction_id: transaction._id,
            membership_id: membership._id,
            period: transaction.period,
            amount: transaction.amount,
            status: "pending",
            payment_method: "vnpay",
            order_info: transaction.description,
          },
        },
        upsert: true,
      },
    })),
    session ? { session } : {}
  );

  return Payment.find({ transaction_id: transaction._id })
    .sort({ created_at: -1 })
    .session(session || null);
};

module.exports = { createPaymentsForApprovedTransaction };
