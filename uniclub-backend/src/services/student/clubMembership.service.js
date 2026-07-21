const JoinForm = require("../../models/join_form.model");
const JoinRequest = require("../../models/joinRequest.model");
const { getStatusError } = require("../../utils/error");

const getClubJoinForm = async (clubId) => {
  const form = await JoinForm.findOne({
    club_id: clubId,
    status: "active",
  })
    .sort({ created_at: -1 })
    .select("_id club_id title description questions status created_at update_at");

  if (!form) {
    throw getStatusError("Join form is not available for this club", 404);
  }

  return form;
};

const submitJoinRequest = async (userId, clubId, formId, answers) => {
  const form = await JoinForm.findOne({
    _id: formId,
    club_id: clubId,
    status: "active",
  });

  if (!form) {
    throw getStatusError("Join form not found or inactive", 404);
  }

  if (answers.length !== form.questions.length) {
    throw getStatusError("Number of answers must match number of questions", 400);
  }

  const trimmedAnswers = answers.map((answer, index) => {
    if (typeof answer !== "string" || !answer.trim()) {
      throw getStatusError(`Answer for question ${index + 1} is required`, 400);
    }

    return answer.trim();
  });

  const pendingRequest = await JoinRequest.findOne({
    user_id: userId,
    club_id: clubId,
    status: "pending",
  });

  if (pendingRequest) {
    throw getStatusError("You already have a pending join request for this club", 409);
  }

  const rejectedRequest = await JoinRequest.findOne({
    user_id: userId,
    club_id: clubId,
    status: "rejected",
  }).sort({ create_at: -1 });

  if (rejectedRequest) {
    throw getStatusError("Your previous join request was rejected", 409);
  }

  const joinRequest = await JoinRequest.create({
    user_id: userId,
    club_id: clubId,
    form_id: formId,
    answers: trimmedAnswers,
    status: "pending",
  });

  return joinRequest.populate([
    { path: "club_id", select: "_id name logo_url" },
    { path: "form_id", select: "_id title" },
  ]);
};

const getMyJoinRequests = async (userId, { status } = {}) => {
  const query = { user_id: userId };

  if (status) {
    query.status = status;
  }

  return JoinRequest.find(query)
    .sort({ create_at: -1 })
    .populate("club_id", "_id name logo_url category")
    .populate("form_id", "_id title")
    .select("_id club_id form_id answers status review_note reviewed_at create_at");
};

const getJoinRequestDetail = async (userId, requestId) => {
  const joinRequest = await JoinRequest.findOne({
    _id: requestId,
    user_id: userId,
  })
    .populate("club_id", "_id name logo_url category description")
    .populate("form_id", "_id title description questions")
    .populate("reviewed_by", "_id full_name");

  if (!joinRequest) {
    throw getStatusError("Join request not found", 404);
  }

  return joinRequest;
};

const cancelJoinRequest = async (userId, requestId) => {
  const joinRequest = await JoinRequest.findOne({
    _id: requestId,
    user_id: userId,
  });

  if (!joinRequest) {
    throw getStatusError("Join request not found", 404);
  }

  if (joinRequest.status !== "pending") {
    throw getStatusError("Can only cancel pending join requests", 400);
  }

  joinRequest.status = "cancelled";
  await joinRequest.save();

  return joinRequest.populate([
    { path: "club_id", select: "_id name logo_url" },
    { path: "form_id", select: "_id title" },
  ]);
};

module.exports = {
  getClubJoinForm,
  submitJoinRequest,
  getMyJoinRequests,
  getJoinRequestDetail,
  cancelJoinRequest,
};
