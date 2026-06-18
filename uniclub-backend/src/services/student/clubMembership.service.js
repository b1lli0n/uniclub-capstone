const JoinForm = require("../../models/joinForm.model");
const JoinRequest = require("../../models/joinRequest.model");
const {
  JOIN_FORM_STATUS,
  JOIN_REQUEST_STATUS
} = require("../../utils/constants");

const getClubJoinForm = async (clubId) => {
  const form = await JoinForm.findOne({
    club_id: clubId,
    status: JOIN_FORM_STATUS.ACTIVE
  })
    .sort({ created_at: -1 })
    .select("_id club_id title description questions status created_at update_at");

  if (!form) {
    throw Object.assign(new Error("Join form is not available for this club"), {
      statusCode: 404
    });
  }

  return form;
};

const submitJoinRequest = async (userId, clubId, formId, answers) => {
  const form = await JoinForm.findOne({
    _id: formId,
    club_id: clubId,
    status: JOIN_FORM_STATUS.ACTIVE
  });

  if (!form) {
    throw Object.assign(new Error("Join form not found or inactive"), { statusCode: 404 });
  }

  if (answers.length !== form.questions.length) {
    throw Object.assign(new Error("Number of answers must match number of questions"), {
      statusCode: 400
    });
  }

  const trimmedAnswers = answers.map((answer, index) => {
    if (typeof answer !== "string" || !answer.trim()) {
      throw Object.assign(new Error(`Answer for question ${index + 1} is required`), {
        statusCode: 400
      });
    }

    return answer.trim();
  });

  const pendingRequest = await JoinRequest.findOne({
    user_id: userId,
    club_id: clubId,
    status: JOIN_REQUEST_STATUS.PENDING
  });

  if (pendingRequest) {
    throw Object.assign(new Error("You already have a pending join request for this club"), {
      statusCode: 409
    });
  }

  const rejectedRequest = await JoinRequest.findOne({
    user_id: userId,
    club_id: clubId,
    status: JOIN_REQUEST_STATUS.REJECTED
  }).sort({ create_at: -1 });

  if (rejectedRequest) {
    throw Object.assign(new Error("Your previous join request was rejected"), {
      statusCode: 409
    });
  }

  const joinRequest = await JoinRequest.create({
    user_id: userId,
    club_id: clubId,
    form_id: formId,
    answers: trimmedAnswers,
    status: JOIN_REQUEST_STATUS.PENDING
  });

  return joinRequest.populate([
    { path: "club_id", select: "_id name logo_url" },
    { path: "form_id", select: "_id title" }
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
    .select(
      "_id club_id form_id answers status review_note reviewed_at create_at"
    );
};

const getJoinRequestDetail = async (userId, requestId) => {
  const joinRequest = await JoinRequest.findOne({
    _id: requestId,
    user_id: userId
  })
    .populate("club_id", "_id name logo_url category description")
    .populate("form_id", "_id title description questions")
    .populate("reviewed_by", "_id full_name");

  if (!joinRequest) {
    throw Object.assign(new Error("Join request not found"), { statusCode: 404 });
  }

  return joinRequest;
};

const cancelJoinRequest = async (userId, requestId) => {
  const joinRequest = await JoinRequest.findOne({
    _id: requestId,
    user_id: userId
  });

  if (!joinRequest) {
    throw Object.assign(new Error("Join request not found"), { statusCode: 404 });
  }

  if (joinRequest.status !== JOIN_REQUEST_STATUS.PENDING) {
    throw Object.assign(new Error("Can only cancel pending join requests"), {
      statusCode: 400
    });
  }

  joinRequest.status = JOIN_REQUEST_STATUS.CANCELLED;
  await joinRequest.save();

  return joinRequest.populate([
    { path: "club_id", select: "_id name logo_url" },
    { path: "form_id", select: "_id title" }
  ]);
};

module.exports = {
  getClubJoinForm,
  submitJoinRequest,
  getMyJoinRequests,
  getJoinRequestDetail,
  cancelJoinRequest
};
