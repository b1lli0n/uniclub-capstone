const ClubMember = require("../../models/club_member.model");
const Invitation = require("../../models/invitation.model");
const { getStatusError } = require("../../utils/error");

const getReceivedInvitations = async (userId, clubId, { status } = {}) => {
  const query = {
    invited_user_id: userId,
  };

  if (clubId) {
    query.club_id = clubId;
  }

  if (status) {
    query.status = status;
  }

  return Invitation.find(query)
    .sort({ created_at: -1 })
    .populate("club_id", "_id name description logo_url category status")
    .populate("invited_by", "_id full_name email avatar_url")
    .select("_id club_id invited_by role message status created_at updated_at");
};

const getInvitationDetail = async (userId, clubId, invitationId) => {
  const invitation = await Invitation.findOne({
    _id: invitationId,
    club_id: clubId,
    invited_user_id: userId,
  })
    .populate("club_id", "_id name description logo_url category status")
    .populate("invited_by", "_id full_name email avatar_url")
    .populate("invited_user_id", "_id full_name email avatar_url");

  if (!invitation) {
    throw getStatusError("Invitation not found", 404);
  }

  return invitation;
};

const getPendingInvitation = async (userId, clubId, invitationId) => {
  const invitation = await Invitation.findOne({
    _id: invitationId,
    club_id: clubId,
    invited_user_id: userId,
  });

  if (!invitation) {
    throw getStatusError("Invitation not found", 404);
  }

  if (invitation.status !== "pending") {
    throw getStatusError("Invitation already handled", 400);
  }

  return invitation;
};

const acceptInvitation = async (userId, clubId, invitationId) => {
  const query = {
    _id: invitationId,
    invited_user_id: userId,
    status: "pending",
  };
  if (clubId) query.club_id = clubId;

  const invitation = await Invitation.findOne(query);

  if (!invitation) {
    throw getStatusError("Invitation not found or already handled", 404);
  }

  // Find existing or create new active ClubMember record
  let membership = await ClubMember.findOne({
    club_id: invitation.club_id,
    user_id: userId,
  });

  if (membership) {
    membership.status = "active";
    membership.role = invitation.role || "member";
    await membership.save();
  } else {
    await ClubMember.create({
      club_id: invitation.club_id,
      user_id: userId,
      status: "active",
      role: invitation.role || "member",
      joined_at: new Date(),
    });
  }

  invitation.status = "accepted";
  await invitation.save();

  return invitation.populate([
    { path: "club_id", select: "_id name description logo_url category status" },
    { path: "invited_by", select: "_id full_name email avatar_url" },
  ]);
};

const rejectInvitation = async (userId, clubId, invitationId) => {
  const query = {
    _id: invitationId,
    invited_user_id: userId,
    status: "pending",
  };
  if (clubId) query.club_id = clubId;

  const invitation = await Invitation.findOne(query);

  if (!invitation) {
    throw getStatusError("Invitation not found or already handled", 404);
  }

  invitation.status = "rejected";
  await invitation.save();

  return invitation.populate([
    { path: "club_id", select: "_id name description logo_url category status" },
    { path: "invited_by", select: "_id full_name email avatar_url" },
  ]);
};

module.exports = {
  getReceivedInvitations,
  getInvitationDetail,
  acceptInvitation,
  rejectInvitation,
};
