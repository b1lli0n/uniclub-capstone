const ClubMember = require("../../models/clubMember.model");
const JoinRequest = require("../../models/joinRequest.model");
const {
  CLUB_MEMBER_ROLE,
  CLUB_MEMBER_STATUS
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

module.exports = {
  getJoinRequestList,
  getJoinRequestDetail
};