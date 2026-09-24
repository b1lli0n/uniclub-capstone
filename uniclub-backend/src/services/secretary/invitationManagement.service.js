const Club = require("../../models/club.model");
const ClubMember = require("../../models/club_member.model");
const Invitation = require("../../models/invitation.model");
const User = require("../../models/user.model");
const { sendInvitationEmail } = require("../email.service");
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

const autoExpireInvitations = async () => {
  try {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000);
    await Invitation.updateMany(
      {
        status: "pending",
        $or: [
          { expires_at: { $lte: new Date() } },
          { expires_at: { $exists: false }, created_at: { $lte: threeDaysAgo } },
        ],
      },
      {
        $set: { status: "expired" },
      }
    );
  } catch (err) {
    console.error("Failed to auto-expire invitations:", err.message);
  }
};

const getInvitationList = async (clubId, { status } = {}) => {
  await autoExpireInvitations();

  const query = { club_id: clubId };

  if (status) {
    query.status = status;
  }

  return populateInvitation(
    Invitation.find(query)
      .sort({ created_at: -1 })
      .select("_id club_id invited_user_id invited_by role message status expires_at created_at updated_at")
  );
};

const getInvitationDetail = async (clubId, invitationId) => {
  await autoExpireInvitations();

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

const isMockEmail = (email) => {
  if (!email || typeof email !== "string") return false;
  const e = email.toLowerCase().trim();
  return e.endsWith("@uniclub.local") || e.endsWith("@example.com") || e.endsWith("@test.local");
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
    if (typeof invited_user_id === "string" && invited_user_id.includes("@")) {
      const emailLower = invited_user_id.trim().toLowerCase();
      invitedUser = await User.create({
        email: emailLower,
        full_name: invited_user_id.trim().split("@")[0],
        provider: "feid",
        provider_id: "invited_" + Date.now(),
        role: "student",
      });
    } else {
      throw getStatusError("User not found with email: " + invited_user_id, 404);
    }
  }

  const resolvedUserId = invitedUser._id;

  if (invitedUser.status && invitedUser.status !== "active") {
    throw getStatusError("This user account is currently inactive", 400);
  }

  if (String(resolvedUserId) === String(secretaryId)) {
    throw getStatusError("You cannot send an invitation to yourself", 400);
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

  const roleNameDisplay = {
    president: "President",
    secretary: "Secretary",
    treasurer: "Treasurer",
    event_manager: "Event Manager",
    member: "Member",
  }[invitationRole] || "Member";

  const defaultInvitationMessage = `The Club Board invites you to join the club as a ${roleNameDisplay}.`;

  const expirationDays = 3;
  const expiresAt = new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000);

  const isMock = isMockEmail(invitedUser.email);
  const invitationStatus = isMock ? "accepted" : "pending";

  const invitation = await Invitation.create({
    club_id: clubId,
    invited_user_id: resolvedUserId,
    invited_by: secretaryMember ? secretaryMember._id : secretaryId,
    role: invitationRole,
    message: typeof message === "string" && message.trim() ? message.trim() : defaultInvitationMessage,
    status: invitationStatus,
    expires_at: expiresAt,
  });

  if (isMock) {
    // Auto-accept into ClubMember for dummy mock users
    let cm = await ClubMember.findOne({
      club_id: clubId,
      user_id: resolvedUserId,
    });
    if (!cm) {
      await ClubMember.create({
        club_id: clubId,
        user_id: resolvedUserId,
        role: invitationRole,
        status: "active",
        joined_at: new Date(),
      });
    } else {
      cm.role = invitationRole;
      cm.status = "active";
      await cm.save();
    }
  } else {
    // Send Email Notification to real student
    try {
      const club = await Club.findById(clubId);
      if (invitedUser?.email && club) {
        console.log(`[INVITATION] Sending invitation email to ${invitedUser.email} for club ${club.name}...`);
        await sendInvitationEmail({
          toEmail: invitedUser.email,
          userName: invitedUser.full_name || "Student",
          clubName: club.name || "Club",
          role: invitationRole,
          message: typeof message === "string" ? message.trim() : "",
          expiresAt,
          isResend: false,
        });
        console.log(`[INVITATION] Invitation email sent to ${invitedUser.email}`);
      }
    } catch (err) {
      console.error("Failed to trigger invitation email:", err.message);
    }
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
  await autoExpireInvitations();

  const invitation = await Invitation.findOne({
    _id: invitationId,
    club_id: clubId,
  });

  if (!invitation) {
    throw getStatusError("Invitation not found", 404);
  }

  if (!["cancelled", "rejected", "expired"].includes(invitation.status)) {
    throw getStatusError("Only cancelled, rejected, or expired invitations can be resent", 400);
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

  const secretaryMember = await ClubMember.findOne({
    club_id: clubId,
    user_id: secretaryId,
    status: "active",
  });

  const expiresAt = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
  invitation.status = "pending";
  invitation.expires_at = expiresAt;
  invitation.invited_by = secretaryMember ? secretaryMember._id : secretaryId;
  await invitation.save();

  // Send Email Notification to invited student on resend
  try {
    const [club, invitedUser] = await Promise.all([
      Club.findById(clubId),
      User.findById(invitation.invited_user_id),
    ]);
    if (invitedUser?.email && club && !isMockEmail(invitedUser.email)) {
      console.log(`[INVITATION RESEND] Sending resend invitation email to ${invitedUser.email} for club ${club.name}...`);
      await sendInvitationEmail({
        toEmail: invitedUser.email,
        userName: invitedUser.full_name || "Student",
        clubName: club.name || "Club",
        role: invitation.role,
        message: invitation.message || "",
        expiresAt,
        isResend: true,
      });
      console.log(`[INVITATION RESEND] Resend invitation email sent to ${invitedUser.email}`);
    }
  } catch (err) {
    console.error("Failed to trigger resend invitation email:", err.message);
  }

  return populateInvitation(Invitation.findById(invitation._id));
};

module.exports = {
  autoExpireInvitations,
  getInvitationList,
  getInvitationDetail,
  sendInvitation,
  cancelInvitation,
  resendInvitation,
};
