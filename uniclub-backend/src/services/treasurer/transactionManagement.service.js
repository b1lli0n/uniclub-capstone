const mongoose = require("mongoose");
const Club = require("../../models/club.model");
const Transaction = require("../../models/transaction.model");
const { getStatusError } = require("../../utils/error");

const TRANSACTION_SELECT =
  "_id club_id fee_id type category period amount description transaction_date status created_by approved_by created_at updated_at";

const TRANSACTION_POPULATE = [
  { path: "created_by", select: "_id full_name email avatar_url" },
  { path: "approved_by", select: "_id full_name email avatar_url" },
];

const assertActiveClub = async (clubId) => {
  const club = await Club.findOne({ _id: clubId, status: "active" }).select("_id status");
  if (!club) throw getStatusError("Club not found or inactive", 404);
};

const getTransactionList = async (clubId, { status, type } = {}) => {
  const filter = { club_id: clubId };
  if (status !== undefined) filter.status = status;
  if (type !== undefined) filter.type = type;

  return Transaction.find(filter)
    .sort({ created_at: -1 })
    .populate(TRANSACTION_POPULATE)
    .select(TRANSACTION_SELECT);
};

const getTransactionDetail = async (clubId, transactionId) => {
  const transaction = await Transaction.findOne({ _id: transactionId, club_id: clubId })
    .populate(TRANSACTION_POPULATE)
    .select(TRANSACTION_SELECT);
  if (!transaction) throw getStatusError("Transaction not found", 404);
  return transaction;
};

const createTransactionRequest = async (clubId, userId, payload) => {
  await assertActiveClub(clubId);

  const transaction = await Transaction.create({
    club_id: clubId,
    created_by: userId,
    ...payload,
    status: 0,
    fee_id: null,
    approved_by: null,
  });

  return Transaction.findById(transaction._id)
    .populate(TRANSACTION_POPULATE)
    .select(TRANSACTION_SELECT);
};

const updateTransactionRequest = async (clubId, transactionId, userId, payload) => {
  const transaction = await Transaction.findOne({ _id: transactionId, club_id: clubId });
  if (!transaction) throw getStatusError("Transaction not found", 404);
  if (String(transaction.created_by) !== String(userId)) {
    throw getStatusError("You can update only your own transaction request", 403);
  }
  if (transaction.status !== 0) {
    throw getStatusError("Only pending transaction requests can be updated", 400);
  }

  Object.assign(transaction, payload);
  await transaction.save();

  return Transaction.findById(transaction._id)
    .populate(TRANSACTION_POPULATE)
    .select(TRANSACTION_SELECT);
};

const getFinancialDashboard = async (clubId) => {
  const [summary] = await Transaction.aggregate([
    { $match: { club_id: new mongoose.Types.ObjectId(clubId) } },
    {
      $group: {
        _id: null,
        approved_income: {
          $sum: { $cond: [{ $and: [{ $eq: ["$status", 1] }, { $eq: ["$type", 0] }] }, "$amount", 0] },
        },
        approved_expense: {
          $sum: { $cond: [{ $and: [{ $eq: ["$status", 1] }, { $eq: ["$type", 1] }] }, "$amount", 0] },
        },
        pending_requests: { $sum: { $cond: [{ $eq: ["$status", 0] }, 1, 0] } },
        approved_requests: { $sum: { $cond: [{ $eq: ["$status", 1] }, 1, 0] } },
        rejected_requests: { $sum: { $cond: [{ $eq: ["$status", 2] }, 1, 0] } },
      },
    },
  ]);

  const approvedIncome = summary?.approved_income || 0;
  const approvedExpense = summary?.approved_expense || 0;
  return {
    approved_income: approvedIncome,
    approved_expense: approvedExpense,
    balance: approvedIncome - approvedExpense,
    pending_requests: summary?.pending_requests || 0,
    approved_requests: summary?.approved_requests || 0,
    rejected_requests: summary?.rejected_requests || 0,
  };
};

const getFinancialReport = async (clubId, { from, to, status, type } = {}) => {
  const filter = { club_id: clubId };
  if (status !== undefined) filter.status = status;
  if (type !== undefined) filter.type = type;
  if (from || to) {
    filter.transaction_date = {};
    if (from) filter.transaction_date.$gte = from;
    if (to) filter.transaction_date.$lte = to;
  }

  return Transaction.find(filter)
    .sort({ transaction_date: -1, created_at: -1 })
    .populate("created_by", "full_name email")
    .populate("approved_by", "full_name email")
    .select(TRANSACTION_SELECT);
};

module.exports = {
  getTransactionList,
  getTransactionDetail,
  createTransactionRequest,
  updateTransactionRequest,
  getFinancialDashboard,
  getFinancialReport,
};
