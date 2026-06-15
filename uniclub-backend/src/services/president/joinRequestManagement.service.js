const ClubMember = require("../../models/clubMember.model");
const JoinRequest = require("../../models/joinRequest.model");
const {
  CLUB_MEMBER_ROLE,
  CLUB_MEMBER_STATUS,
  JOIN_REQUEST_STATUS
} = require("../../utils/constants");

const assertPresident = async (userId, clubId) => {
  const presidentMembership = await ClubMember.findOne({
    user_id: userId,
    club_id: clubId,
    role: CLUB_MEMBER_ROLE.PRESIDENT,
    status: CLUB_MEMBER_STATUS.ACTIVE
  });

  if (!presidentMembership) {
    throw Object.assign(new Error("Only club president can access this"), {
      statusCode: 403
    });
  }
};

const getJoinRequestList = async (userId, clubId, { status } = {}) => {
  await assertPresident(userId, clubId);

  const query = { club_id: clubId };

  if (status) {
    query.status = status;
  }

  return JoinRequest.find(query)
    .sort({ create_at: -1 })
    .populate("user_id", "_id full_name email avatar_url")
    .populate("form_id", "_id title")
    .select("_id user_id form_id answers status review_note reviewed_at create_at");
};

const getJoinRequestDetail = async (userId, clubId, requestId) => {
  await assertPresident(userId, clubId);

  const joinRequest = await JoinRequest.findOne({
    _id: requestId,
    club_id: clubId
  })
    .populate("user_id", "_id full_name email avatar_url")
    .populate("form_id", "_id title description questions")
    .populate("reviewed_by", "_id full_name");

  if (!joinRequest) {
    throw Object.assign(new Error("Join request not found"), { statusCode: 404 });
  }

  return joinRequest;
};

const getPendingJoinRequest = async (clubId, requestId) => {
  const joinRequest = await JoinRequest.findOne({
    _id: requestId,
    club_id: clubId
  });

  if (!joinRequest) {
    throw Object.assign(new Error("Join request not found"), { statusCode: 404 });
  }

  if (joinRequest.status !== JOIN_REQUEST_STATUS.PENDING) {
    throw Object.assign(new Error("Join request already handled"), { statusCode: 400 });
  }

  return joinRequest;
};

const approveJoinRequest = async (presidentId, clubId, requestId) => {
  await assertPresident(presidentId, clubId);

  const joinRequest = await getPendingJoinRequest(clubId, requestId);

  const activeMember = await ClubMember.findOne({
    user_id: joinRequest.user_id,
    club_id: clubId,
    status: CLUB_MEMBER_STATUS.ACTIVE
  });

  if (activeMember) {
    throw Object.assign(new Error("User is already a member of this club"), {
      statusCode: 409
    });
  }

  let membership = await ClubMember.findOne({
    user_id: joinRequest.user_id,
    club_id: clubId
  });

  if (!membership) {
    await ClubMember.create({
      user_id: joinRequest.user_id,
      club_id: clubId,
      role: CLUB_MEMBER_ROLE.MEMBER,
      status: CLUB_MEMBER_STATUS.ACTIVE
    });
  } else {
    membership.role = CLUB_MEMBER_ROLE.MEMBER;
    membership.status = CLUB_MEMBER_STATUS.ACTIVE;
    membership.joined_at = new Date();
    membership.left_at = null;
    await membership.save();
  }

  joinRequest.status = JOIN_REQUEST_STATUS.APPROVED;
  joinRequest.reviewed_by = presidentId;
  joinRequest.reviewed_at = new Date();
  joinRequest.review_note = "";
  await joinRequest.save();

  return joinRequest.populate([
    { path: "user_id", select: "_id full_name email avatar_url" },
    { path: "form_id", select: "_id title" }
  ]);
};

const rejectJoinRequest = async (presidentId, clubId, requestId, reviewNote = "") => {
  await assertPresident(presidentId, clubId);

  const joinRequest = await getPendingJoinRequest(clubId, requestId);

  joinRequest.status = JOIN_REQUEST_STATUS.REJECTED;
  joinRequest.reviewed_by = presidentId;
  joinRequest.reviewed_at = new Date();
  joinRequest.review_note = reviewNote.trim();
  await joinRequest.save();

  return joinRequest.populate([
    { path: "user_id", select: "_id full_name email avatar_url" },
    { path: "form_id", select: "_id title" }
  ]);
};

module.exports = {
  getJoinRequestList,
  getJoinRequestDetail,
  approveJoinRequest,
  rejectJoinRequest
};
