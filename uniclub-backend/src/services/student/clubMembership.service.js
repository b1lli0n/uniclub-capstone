const JoinForm = require("../../models/join_form.model");
const JoinRequest = require("../../models/join_request.model");
const ClubMember = require("../../models/club_member.model");
const Club = require("../../models/club.model");
const { getStatusError } = require("../../utils/error");
const { sendNewJoinRequestEmailToPresident } = require("../email.service");

const getClubJoinForm = async (clubId) => {
  const form = await JoinForm.findOne({
    club_id: clubId,
    status: "active",
  })
    .sort({ created_at: -1 })
    .select("_id club_id title description questions status created_at updated_at")
    .lean();

  if (!form) {
    throw getStatusError("Currently this club is not recruiting new members.", 404);
  }

  // Luôn lấy thông tin Leader hiện tại của CLB để gán vào form
  const currentPresident = await ClubMember.findOne({
    club_id: clubId,
    role: "president",
    status: "active",
  })
    .populate("user_id", "full_name email avatar_url student_code")
    .lean();

  if (currentPresident) {
    form.leader = {
      _id: currentPresident.user_id?._id,
      member_id: currentPresident._id,
      full_name: currentPresident.user_id?.full_name,
      email: currentPresident.user_id?.email,
      avatar_url: currentPresident.user_id?.avatar_url,
      student_code: currentPresident.user_id?.student_code,
    };
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
    throw getStatusError("Currently this club is not recruiting new members or the application form is closed.", 404);
  }

  if (!Array.isArray(answers) || answers.length !== form.questions.length) {
    throw getStatusError("Number of answers must match number of questions", 400);
  }

  const formattedAnswers = answers.map((answer, index) => {
    const question = form.questions[index];
    let questionId = question?._id;
    let value = "";

    if (typeof answer === "object" && answer !== null) {
      questionId = answer.question_id || questionId;
      value = typeof answer.value === "string" ? answer.value.trim() : String(answer.value || "").trim();
    } else if (typeof answer === "string") {
      value = answer.trim();
    }

    if (!value) {
      throw getStatusError(`Answer for question ${index + 1} is required`, 400);
    }

    const matched = form.questions.find((q) => String(q._id) === String(questionId));
    if (!matched) {
      throw getStatusError(`Invalid question ID: ${questionId}`, 400);
    }

    return {
      question_id: matched._id,
      value,
    };
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
  }).sort({ created_at: -1 });

  if (rejectedRequest) {
    const cooldownPeriodMs = 24 * 60 * 60 * 1000; // 24 hours cooldown
    const rejectedTime = new Date(rejectedRequest.reviewed_at || rejectedRequest.created_at).getTime();
    const now = Date.now();
    const elapsedMs = now - rejectedTime;

    if (elapsedMs < cooldownPeriodMs) {
      const remainingMs = cooldownPeriodMs - elapsedMs;
      const remainingHours = Math.floor(remainingMs / (1000 * 60 * 60));
      const remainingMinutes = Math.ceil((remainingMs % (1000 * 60 * 60)) / (1000 * 60));
      const timeStr = remainingHours > 0
        ? `${remainingHours} hour(s) ${remainingMinutes} minute(s)`
        : `${remainingMinutes} minute(s)`;
      throw getStatusError(
        `Your previous application was rejected. You can re-apply 24 hours after rejection (Time remaining: ${timeStr}).`,
        409
      );
    }
  }

  const joinRequest = await JoinRequest.create({
    user_id: userId,
    club_id: clubId,
    form_id: formId,
    answers: formattedAnswers,
    status: "pending",
  });

  const populated = await joinRequest.populate([
    { path: "club_id", select: "_id name logo_url president_id" },
    { path: "form_id", select: "_id title questions" },
    { path: "user_id", select: "_id full_name email" },
  ]);

  // Gửi email thông báo cho Chủ nhiệm CLB
  try {
    const club = await Club.findById(clubId).populate("president_id", "email full_name");
    if (club?.president_id?.email) {
      sendNewJoinRequestEmailToPresident({
        presidentEmail: club.president_id.email,
        presidentName: club.president_id.full_name,
        applicantName: populated.user_id?.full_name || "Applicant",
        applicantEmail: populated.user_id?.email || "",
        clubName: club.name,
        answers: formattedAnswers,
      }).catch((err) => console.error("Error sending join request email to president:", err));
    }
  } catch (err) {
    console.error("Failed to notify president via email:", err);
  }

  return populated;
};

const getMyJoinRequests = async (userId, { status } = {}) => {
  const query = { user_id: userId };

  if (status) {
    query.status = status;
  }

  return JoinRequest.find(query)
    .sort({ created_at: -1 })
    .populate("club_id", "_id name logo_url category")
    .populate("form_id", "_id title questions")
    .select("_id club_id form_id answers status review_note reviewed_at created_at updated_at");
};

const getJoinRequestDetail = async (userId, requestId) => {
  const joinRequest = await JoinRequest.findOne({
    _id: requestId,
    user_id: userId,
  })
    .populate("club_id", "_id name logo_url category description")
    .populate("form_id", "_id title description questions")
    .populate({
      path: "reviewed_by",
      populate: { path: "user_id", select: "_id full_name email avatar_url" },
    });

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
