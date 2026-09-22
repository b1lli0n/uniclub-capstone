const ClubMember = require("../../models/club_member.model");
const JoinRequest = require("../../models/join_request.model");
const Club = require("../../models/club.model");
const Transaction = require("../../models/transaction.model");
const Payment = require("../../models/payment.model");
const { getStatusError } = require("../../utils/error");
const { sendApprovedEmail, sendRejectedEmail } = require("../email.service");

const normalizeAnswers = (answers, formQuestions = []) => {
  if (!Array.isArray(answers)) return [];
  return answers.map((ans, idx) => {
    const qObj = Array.isArray(formQuestions) ? formQuestions[idx] : null;
    const qId = qObj?._id || (typeof qObj === "object" ? qObj?.id : null) || null;

    if (typeof ans === "string") {
      return { question_id: qId, value: ans };
    }
    if (ans && typeof ans === "object") {
      if (typeof ans.value === "string") {
        return {
          question_id: ans.question_id || qId,
          value: ans.value,
        };
      }
      // Reconstruct character-indexed strings { '0': 'M', '1': 'ì', ... }
      const keys = Object.keys(ans).filter((k) => !isNaN(k)).sort((a, b) => Number(a) - Number(b));
      if (keys.length > 0) {
        return {
          question_id: ans.question_id || qId,
          value: keys.map((k) => ans[k]).join(""),
        };
      }
    }
    return { question_id: qId, value: String(ans?.value ?? ans ?? "") };
  });
};

const getJoinRequestList = async (clubId, { status } = {}) => {
  const query = { club_id: clubId };

  if (status) {
    query.status = status;
  }

  const rawList = await JoinRequest.find(query)
    .sort({ created_at: -1 })
    .populate("user_id", "_id full_name email avatar_url")
    .populate("form_id", "_id title questions")
    .select("_id user_id form_id answers status review_note reviewed_at created_at updated_at")
    .lean();

  return rawList
    .filter((item) => item.user_id && item.user_id.full_name)
    .map((item) => ({
      ...item,
      answers: normalizeAnswers(item.answers, item.form_id?.questions),
    }));
};

const getJoinRequestDetail = async (clubId, requestId) => {
  const joinRequest = await JoinRequest.findOne({
    _id: requestId,
    club_id: clubId,
  })
    .populate("user_id", "_id full_name email avatar_url")
    .populate("form_id", "_id title description questions")
    .populate({
      path: "reviewed_by",
      populate: { path: "user_id", select: "_id full_name email avatar_url" },
    })
    .lean();

  if (!joinRequest) {
    throw getStatusError("Join request not found", 404);
  }

  joinRequest.answers = normalizeAnswers(joinRequest.answers, joinRequest.form_id?.questions);

  return joinRequest;
};

const getPendingJoinRequest = async (clubId, requestId) => {
  const joinRequest = await JoinRequest.findOne({
    _id: requestId,
    club_id: clubId,
  });

  if (!joinRequest) {
    throw getStatusError("Join request not found", 404);
  }

  if (joinRequest.status !== "pending") {
    throw getStatusError("Join request already handled", 400);
  }

  return joinRequest;
};

const reviewJoinRequest = async (presidentId, clubId, requestId, { status, review_note = "" }) => {
  if (!status || !["approved", "rejected"].includes(status)) {
    throw getStatusError("Invalid status. Allowed values: approved, rejected", 400);
  }

  const joinRequest = await getPendingJoinRequest(clubId, requestId);

  const reviewerMember = await ClubMember.findOne({
    user_id: presidentId,
    club_id: clubId,
  });

  const club = await Club.findById(clubId);

  if (status === "approved") {
    const activeMember = await ClubMember.findOne({
      user_id: joinRequest.user_id,
      club_id: clubId,
      status: "active",
    });

    if (activeMember) {
      throw getStatusError("User is already a member of this club", 409);
    }

    let membership = await ClubMember.findOne({
      user_id: joinRequest.user_id,
      club_id: clubId,
    });

    if (!membership) {
      membership = await ClubMember.create({
        user_id: joinRequest.user_id,
        club_id: clubId,
        role: "member",
        status: "active",
      });
    } else {
      membership.role = "member";
      membership.status = "active";
      membership.joined_at = new Date();
      membership.left_at = null;
      await membership.save();
    }

    // Auto-create pending payments for member for all active fee collection transactions
    try {
      const activeIncomeTransList = await Transaction.find({
        club_id: clubId,
        type: "income",
        status: "approved",
      });

      for (const trans of activeIncomeTransList) {
        const existingPayment = await Payment.findOne({
          membership_id: membership._id,
          transaction_id: trans._id,
        });

        if (!existingPayment) {
          await Payment.create({
            membership_id: membership._id,
            transaction_id: trans._id,
            period: trans.period,
            amount: trans.amount || 0,
            status: "pending",
            payment_method: "vnpay",
            order_info: `Payment for ${trans.period}`,
          });
        }
      }
    } catch (payErr) {
      console.error("[Join Approval Fee Hook] Error creating payment:", payErr);
    }

    joinRequest.status = "approved";
    joinRequest.reviewed_by = reviewerMember ? reviewerMember._id : presidentId;
    joinRequest.reviewed_at = new Date();
    joinRequest.review_note = (review_note || "").trim();
    await joinRequest.save();

    const populated = await joinRequest.populate([
      { path: "user_id", select: "_id full_name email avatar_url" },
      { path: "form_id", select: "_id title" },
    ]);

    sendApprovedEmail({
      toEmail: populated.user_id?.email,
      userName: populated.user_id?.full_name || "Member",
      clubName: club?.name || "Club",
    }).catch((err) => console.error("Email send error:", err));

    return populated;
  } else {
    // rejected
    joinRequest.status = "rejected";
    joinRequest.reviewed_by = reviewerMember ? reviewerMember._id : presidentId;
    joinRequest.reviewed_at = new Date();
    joinRequest.review_note = (review_note || "").trim();
    await joinRequest.save();

    const populated = await joinRequest.populate([
      { path: "user_id", select: "_id full_name email avatar_url" },
      { path: "form_id", select: "_id title" },
    ]);

    sendRejectedEmail({
      toEmail: populated.user_id?.email,
      userName: populated.user_id?.full_name || "Member",
      clubName: club?.name || "Club",
      reviewNote: (review_note || "").trim(),
    }).catch((err) => console.error("Email send error:", err));

    return populated;
  }
};

module.exports = {
  getJoinRequestList,
  getJoinRequestDetail,
  reviewJoinRequest,
};

