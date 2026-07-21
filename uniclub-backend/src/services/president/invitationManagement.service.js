const ClubMember = require("../../models/clubMember.model");
const Invitation = require("../../models/invitation.model");
const User = require("../../models/user.model");
const { getStatusError } = require("../../utils/error");

const getInvitationList = async (clubId, { status } = {}) => {
  const query = { club_id: clubId };

  if (status) {
    query.status = status;
  }

  return Invitation.find(query)
    .sort({ created_at: -1 })
    .populate("invited_user_id", "_id full_name email avatar_url")
    .populate("invited_by", "_id full_name email avatar_url")
    .select(
      "_id club_id invited_user_id invited_by role message status created_at updated_at"
    );
};

const getInvitationDetail = async (clubId, invitationId) => {
  const invitation = await Invitation.findOne({
    _id: invitationId,
    club_id: clubId,
  })
    .populate("club_id", "_id name description logo_url category status")
    .populate("invited_user_id", "_id full_name email avatar_url")
    .populate("invited_by", "_id full_name email avatar_url");

  if (!invitation) {
    throw getStatusError("Invitation not found", 404);
  }

  return invitation;
};

const sendInvitation = async (presidentId, clubId, payload) => {
  const { invited_user_id: invitedUserId, role = "member", message = "" } = payload;

  const invitedUser = await User.findById(invitedUserId);
  if (!invitedUser) {
    throw getStatusError("Invited user not found", 404);
  }

  if (String(invitedUserId) === String(presidentId)) {
    throw getStatusError("You cannot invite yourself", 400);
  }

  const activeMember = await ClubMember.findOne({
    club_id: clubId,
    user_id: invitedUserId,
    status: "active",
  });

  if (activeMember && activeMember.role === role) {
    throw getStatusError("User is already an active member with this role", 409);
  }

  const pendingInvitation = await Invitation.findOne({
    club_id: clubId,
    invited_user_id: invitedUserId,
    status: "pending",
  });

  if (pendingInvitation) {
    throw getStatusError("A pending invitation already exists for this user", 409);
  }

  const invitation = await Invitation.create({
    club_id: clubId,
    invited_user_id: invitedUserId,
    invited_by: presidentId,
    role,
    message: typeof message === "string" ? message.trim() : "",
    status: "pending",
  });

  return invitation.populate([
    { path: "invited_user_id", select: "_id full_name email avatar_url" },
    { path: "invited_by", select: "_id full_name email avatar_url" },
  ]);
};

const cancelInvitation = async (clubId, invitationId) => {
  const invitation = await Invitation.findOne({
    _id: invitationId,
    club_id: clubId,
  });

  if (!invitation) {
    throw getStatusError("Invitation not found", 404);
  }

  if (invitation.status !== "pending") {
    throw getStatusError("Only pending invitations can be cancelled", 400);
  }

  invitation.status = "cancelled";
  await invitation.save();

  return invitation.populate([
    { path: "invited_user_id", select: "_id full_name email avatar_url" },
    { path: "invited_by", select: "_id full_name email avatar_url" },
  ]);
};

const resendInvitation = async (presidentId, clubId, invitationId, payload = {}) => {
  const invitation = await Invitation.findOne({
    _id: invitationId,
    club_id: clubId,
  });

  if (!invitation) {
    throw getStatusError("Invitation not found", 404);
  }

  if (!["rejected", "cancelled"].includes(invitation.status)) {
    throw getStatusError("Only rejected or cancelled invitations can be resent", 400);
  }

  const pendingInvitation = await Invitation.findOne({
    club_id: clubId,
    invited_user_id: invitation.invited_user_id,
    status: "pending",
    _id: { $ne: invitation._id },
  });

  if (pendingInvitation) {
    throw getStatusError("A pending invitation already exists for this user", 409);
  }

  if (payload.role !== undefined) {
    invitation.role = payload.role;
  }

  if (payload.message !== undefined) {
    invitation.message = typeof payload.message === "string" ? payload.message.trim() : "";
  }

  invitation.status = "pending";
  invitation.invited_by = presidentId;
  await invitation.save();

  return invitation.populate([
    { path: "invited_user_id", select: "_id full_name email avatar_url" },
    { path: "invited_by", select: "_id full_name email avatar_url" },
  ]);
};

module.exports = {
  getInvitationList,
  getInvitationDetail,
  sendInvitation,
  cancelInvitation,
  resendInvitation,
};
