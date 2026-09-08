const mongoose = require("mongoose");
const Club = require("../../models/club.model");
const Transaction = require("../../models/transaction.model");
const { getStatusError } = require("../../utils/error");

const TRANSACTION_SELECT =
  "_id club_id type title period amount description transaction_date status created_by approved_by created_at updated_at";

const TRANSACTION_POPULATE = [
  {
    path: "created_by",
    populate: { path: "user_id", select: "_id full_name email avatar_url" },
  },
  {
    path: "approved_by",
    populate: { path: "user_id", select: "_id full_name email avatar_url" },
  },
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

  const doc = transaction.toObject();

  // If income transaction, attach member payment list with status
  if (doc.type === "income" || Number(doc.type) === 0) {
    const payments = await Payment.find({ transaction_id: transactionId })
      .populate({
        path: "membership_id",
        populate: { path: "user_id", select: "full_name email avatar_url student_code" },
      })
      .sort({ status: -1, paid_at: -1 });

    doc.member_payments = payments.map((p) => ({
      payment_id: p._id,
      membership_id: p.membership_id?._id,
      user_id: p.membership_id?.user_id?._id,
      full_name: p.membership_id?.user_id?.full_name || "Thành viên",
      email: p.membership_id?.user_id?.email || "",
      student_code: p.membership_id?.user_id?.student_code || "",
      avatar_url: p.membership_id?.user_id?.avatar_url || "",
      amount: p.amount,
      status: p.status,
      paid_at: p.paid_at,
    }));
  }

  return doc;
};

const Payment = require("../../models/payment.model");
const ClubMember = require("../../models/club_member.model");
const { sendFeeNotificationEmail } = require("../email.service");
const { getCurrentSemesterCode } = require("../../utils/semester.helper");

const createTransactionRequest = async (clubId, userId, payload) => {
  await assertActiveClub(clubId);

  const creatorMember = await ClubMember.findOne({ club_id: clubId, user_id: userId, status: "active" });

  const transaction = await Transaction.create({
    club_id: clubId,
    created_by: creatorMember ? creatorMember._id : userId,
    ...payload,
    status: payload.status !== undefined ? payload.status : "pending",
    approved_by: null,
  });

  // IF TYPE IS INCOME:
  // Generate pending Payment records for ALL active members of the club & send Email Notification!
  const isIncome = payload.type === "income" || Number(payload.type) === 0;
  if (isIncome) {
    try {
      const activeMembers = await ClubMember.find({ club_id: clubId, status: "active" });
      const period = transaction.period;
      const amount = payload.amount || 0;

      const paymentDocs = activeMembers.map((m) => ({
        membership_id: m._id,
        transaction_id: transaction._id,
        period,
        amount,
        status: "pending",
        payment_method: "vnpay",
        order_info: `Thanh toán ${period}`,
      }));

      if (paymentDocs.length > 0) {
        await Payment.insertMany(paymentDocs, { ordered: false }).catch((err) =>
          console.log("[Payment Hook Note] Duplicate payments ignored:", err.message)
        );
      }

      // Background Email Notification to all active members
      ClubMember.find({ club_id: clubId, status: "active" })
        .populate("user_id")
        .populate("club_id")
        .then((members) => {
          members.forEach((m) => {
            if (m.user_id && m.user_id.email) {
              sendFeeNotificationEmail({
                toEmail: m.user_id.email,
                userName: m.user_id.full_name || "Thành viên",
                clubName: m.club_id?.name || "Câu lạc bộ",
                title: payload.description || period,
                amount,
                period,
              }).catch((e) => console.error("[Fee Email Error]", e));
            }
          });
        })
        .catch((e) => console.error("[Fee Populate Error]", e));
    } catch (err) {
      console.error("Error creating member payment items for income transaction:", err);
    }
  }

  return Transaction.findById(transaction._id)
    .populate(TRANSACTION_POPULATE)
    .select(TRANSACTION_SELECT);
};

const updateTransactionRequest = async (clubId, transactionId, userId, payload) => {
  const transaction = await Transaction.findOne({ _id: transactionId, club_id: clubId });
  if (!transaction) throw getStatusError("Transaction not found", 404);

  if (payload.status !== undefined) {
    transaction.status = payload.status;
    if (payload.status === "approved" || payload.status === 1) {
      const approverMember = await ClubMember.findOne({ club_id: clubId, user_id: userId, status: "active" });
      transaction.approved_by = approverMember ? approverMember._id : userId;
    }
  }

  if (payload.title) transaction.title = payload.title;
  if (payload.amount !== undefined) transaction.amount = payload.amount;
  if (payload.category) transaction.category = payload.category;
  if (payload.period) transaction.period = payload.period;
  if (payload.description) transaction.description = payload.description;

  await transaction.save();

  // If approved and type is income, generate payment records for active members
  const isIncome = transaction.type === "income" || Number(transaction.type) === 0;
  const isApproved = transaction.status === "approved" || transaction.status === 1;
  if (isApproved && isIncome) {
    try {
      const activeMembers = await ClubMember.find({ club_id: clubId, status: "active" });
      const period = transaction.period;
      const amount = transaction.amount || 0;

      const paymentDocs = activeMembers.map((m) => ({
        membership_id: m._id,
        transaction_id: transaction._id,
        period,
        amount,
        status: "pending",
        payment_method: "vnpay",
        order_info: `Thanh toán ${period}`,
      }));

      if (paymentDocs.length > 0) {
        await Payment.insertMany(paymentDocs, { ordered: false }).catch((err) =>
          console.log("[Payment Hook Note] Duplicate payments ignored:", err.message)
        );
      }
    } catch (err) {
      console.error("Error creating member payment items for approved income transaction:", err);
    }
  }

  return Transaction.findById(transaction._id)
    .populate(TRANSACTION_POPULATE)
    .select(TRANSACTION_SELECT);
};

const getFinancialDashboard = async (clubId) => {
  // Calculate total actual paid income from Payment collection (status === "success")
  const paidIncomeAgg = await Payment.aggregate([
    { $match: { status: "success" } },
    {
      $lookup: {
        from: "clubmembers",
        localField: "membership_id",
        foreignField: "_id",
        as: "member",
      },
    },
    { $unwind: "$member" },
    { $match: { "member.club_id": new mongoose.Types.ObjectId(clubId) } },
    { $group: { _id: null, total: { $sum: "$amount" } } },
  ]);
  const approvedIncome = paidIncomeAgg[0]?.total || 0;

  const [summary] = await Transaction.aggregate([
    { $match: { club_id: new mongoose.Types.ObjectId(clubId) } },
    {
      $group: {
        _id: null,
        approved_expense: {
          $sum: { $cond: [{ $and: [{ $eq: ["$status", 1] }, { $eq: ["$type", 1] }] }, "$amount", 0] },
        },
        pending_requests: { $sum: { $cond: [{ $eq: ["$status", 0] }, 1, 0] } },
        approved_requests: { $sum: { $cond: [{ $eq: ["$status", 1] }, 1, 0] } },
        rejected_requests: { $sum: { $cond: [{ $eq: ["$status", 2] }, 1, 0] } },
      },
    },
  ]);

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
