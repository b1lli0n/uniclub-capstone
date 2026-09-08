const ClubMember = require("../../models/club_member.model");
const Invitation = require("../../models/invitation.model");
const User = require("../../models/user.model");
const { getStatusError } = require("../../utils/error");

const ALLOWED_ROLES = ["member", "president", "secretary", "treasurer", "event_manager"];

const populateInvitation = (query) =>
  query
    .populate("club_id", "_id name description logo_url category status")
    .populate("invited_user_id", "_id full_name email avatar_url")
    .populate({
      path: "invited_by",
      populate: { path: "user_id", select: "_id full_name email avatar_url" },
    });

const getInvitationList = async (clubId, { status } = {}) => {
  const query = { club_id: clubId };

  if (status) {
    query.status = status;
  }

  return populateInvitation(
    Invitation.find(query)
      .sort({ created_at: -1 })
      .select("_id club_id invited_user_id invited_by role message status created_at updated_at")
  );
};

const getInvitationDetail = async (clubId, invitationId) => {
  const invitation = await populateInvitation(
    Invitation.findOne({
      _id: invitationId,
      club_id: clubId,
    })
  );

  if (!invitation) {
    throw getStatusError("Invitation not found", 404);
  }

  return invitation;
};

const sendInvitation = async (secretaryId, clubId, { invited_user_id, role, message }) => {
  const mongoose = require("mongoose");
  let invitedUser = null;

  if (mongoose.isValidObjectId(invited_user_id)) {
    invitedUser = await User.findById(invited_user_id);
  } else if (typeof invited_user_id === "string") {
    invitedUser = await User.findOne({
      $or: [
        { email: invited_user_id.trim() },
        { email: invited_user_id.trim().toLowerCase() },
        { student_code: invited_user_id.trim() },
      ],
    });
  }

  if (!invitedUser) {
    throw getStatusError("User not found with email or ID: " + invited_user_id, 404);
  }

  const resolvedUserId = invitedUser._id;

  if (invitedUser.status && invitedUser.status !== "active") {
    throw getStatusError("Invited user is not active", 400);
  }

  if (String(resolvedUserId) === String(secretaryId)) {
    throw getStatusError("You cannot invite yourself", 400);
  }

  const invitationRole = role || "member";

  if (!ALLOWED_ROLES.includes(invitationRole)) {
    throw getStatusError(
      "Invalid role. Allowed values: member, president, secretary, treasurer, event_manager",
      400
    );
  }

  const activeMember = await ClubMember.findOne({
    club_id: clubId,
    user_id: resolvedUserId,
    status: "active",
  });

  if (activeMember) {
    throw getStatusError("User is already an active member of this club", 409);
  }

  const pendingInvitation = await Invitation.findOne({
    club_id: clubId,
    invited_user_id: resolvedUserId,
    status: "pending",
  });

  if (pendingInvitation) {
    throw getStatusError("A pending invitation already exists for this user", 409);
  }

  const secretaryMember = await ClubMember.findOne({
    club_id: clubId,
    user_id: secretaryId,
    status: "active",
  });

  const invitation = await Invitation.create({
    club_id: clubId,
    invited_user_id: resolvedUserId,
    invited_by: secretaryMember ? secretaryMember._id : secretaryId,
    role: invitationRole,
    message: typeof message === "string" ? message.trim() : "",
    status: "pending",
  });

  // Send Email Notification to invited student
  try {
    const Club = require("../../models/club.model");
    const { sendInvitationEmail } = require("../email.service");
    const club = await Club.findById(clubId);
    if (invitedUser?.email && club) {
      sendInvitationEmail({
        toEmail: invitedUser.email,
        userName: invitedUser.full_name || "Sinh viên",
        clubName: club.name || "Câu lạc bộ",
        role: invitationRole,
        message: typeof message === "string" ? message.trim() : "",
      }).catch((err) => console.error("Invitation email error:", err.message));
    }
  } catch (err) {
    console.error("Failed to trigger invitation email:", err.message);
  }

  return populateInvitation(Invitation.findById(invitation._id));
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

  return populateInvitation(Invitation.findById(invitation._id));
};

const resendInvitation = async (secretaryId, clubId, invitationId, { role, message } = {}) => {
  const invitation = await Invitation.findOne({
    _id: invitationId,
    club_id: clubId,
  });

  if (!invitation) {
    throw getStatusError("Invitation not found", 404);
  }

  if (!["cancelled", "rejected"].includes(invitation.status)) {
    throw getStatusError("Only cancelled or rejected invitations can be resent", 400);
  }

  const activeMember = await ClubMember.findOne({
    club_id: clubId,
    user_id: invitation.invited_user_id,
    status: "active",
  });

  if (activeMember) {
    throw getStatusError("User is already an active member of this club", 409);
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

  if (role !== undefined) {
    if (!ALLOWED_ROLES.includes(role)) {
      throw getStatusError(
        "Invalid role. Allowed values: member, president, secretary, treasurer, event_manager",
        400
      );
    }
    invitation.role = role;
  }

  if (message !== undefined) {
    if (typeof message !== "string") {
      throw getStatusError("message must be a string", 400);
    }
    invitation.message = message.trim();
  }

  invitation.status = "pending";
  invitation.invited_by = secretaryId;
  await invitation.save();

  return populateInvitation(Invitation.findById(invitation._id));
};

module.exports = {
  getInvitationList,
  getInvitationDetail,
  sendInvitation,
  cancelInvitation,
  resendInvitation,
};
