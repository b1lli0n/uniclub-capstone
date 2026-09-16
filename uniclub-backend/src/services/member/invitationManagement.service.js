const mongoose = require("mongoose");
const ClubMember = require("../../models/club_member.model");
const Invitation = require("../../models/invitation.model");
const ClubCreationRequest = require("../../models/club_creation_requests.model");
const { getStatusError } = require("../../utils/error");
const { autoExpireInvitations } = require("../secretary/invitationManagement.service");

const getReceivedInvitations = async (userId, clubId, { status } = {}) => {
  await autoExpireInvitations();

  const query = {
    invited_user_id: userId,
  };

  if (clubId) {
    query.club_id = clubId;
  }

  if (status) {
    query.status = status;
  }

  const regularInvitations = await Invitation.find(query)
    .sort({ created_at: -1 })
    .populate("club_id", "_id name description logo_url category status")
    .populate({
      path: "invited_by",
      populate: { path: "user_id", select: "_id full_name email avatar_url" },
    })
    .select("_id club_id invited_by role message status expires_at created_at updated_at")
    .lean();

  const formattedRegular = regularInvitations.map((inv) => {
    const clubName = inv.club_id?.name || "Club";
    const inviterName = inv.invited_by?.user_id?.full_name || "Club Board";
    return {
      ...inv,
      message: inv.message || `You received an invitation to join ${clubName} from ${inviterName}.`,
      expires_at: inv.expires_at || new Date(new Date(inv.created_at).getTime() + 3 * 24 * 60 * 60 * 1000),
    };
  });

  let creationInvitations = [];
  if (!clubId) {
    const creationFilter = {
      "members.user_id": userId,
    };

    const creationRequests = await ClubCreationRequest.find(creationFilter)
      .populate("requested_by", "_id full_name email avatar_url")
      .sort({ created_at: -1 })
      .lean();

    creationInvitations = creationRequests.map((req) => {
      const memberEntry = (req.members || []).find(
        (m) => String(m.user_id) === String(userId)
      ) || {};

      return {
        _id: req._id,
        is_creation_invite: true,
        club_id: {
          _id: req._id,
          name: req.club_name,
          description: req.description || req.reason,
          logo_url: req.logo_url,
          category: req.category || "Academic",
        },
        invited_by: {
          user_id: req.requested_by,
          full_name: req.requested_by?.full_name || "Club Creator",
          email: req.requested_by?.email || "",
          avatar_url: req.requested_by?.avatar_url || "",
        },
        role: "member",
        message: `You received an invitation to join as a founding member of ${req.club_name} from ${req.requested_by?.full_name || "Leader"}`,
        status: memberEntry.status || "pending",
        created_at: req.created_at,
        expires_at: req.expires_at || new Date(new Date(req.created_at).getTime() + 3 * 24 * 60 * 60 * 1000),
        updated_at: memberEntry.responded_at || req.created_at,
      };
    });

    if (status && status !== "all") {
      creationInvitations = creationInvitations.filter(
        (inv) => inv.status === status
      );
    }
  }

  const combined = [...formattedRegular, ...creationInvitations].sort(
    (a, b) => new Date(b.created_at || 0) - new Date(a.created_at || 0)
  );

  return combined;
};

const getInvitationDetail = async (userId, clubId, invitationId) => {
  await autoExpireInvitations();

  let invitation = null;
  if (mongoose.isValidObjectId(invitationId)) {
    invitation = await Invitation.findOne({
      _id: invitationId,
      invited_user_id: userId,
      ...(clubId ? { club_id: clubId } : {}),
    })
      .populate("club_id", "_id name description logo_url category status")
      .populate({
        path: "invited_by",
        populate: { path: "user_id", select: "_id full_name email avatar_url" },
      })
      .populate("invited_user_id", "_id full_name email avatar_url")
      .lean();
  }

  if (!invitation && mongoose.isValidObjectId(invitationId)) {
    const creationReq = await ClubCreationRequest.findOne({
      _id: invitationId,
      "members.user_id": userId,
    })
      .populate("requested_by", "_id full_name email avatar_url")
      .lean();

    if (creationReq) {
      const memberEntry = (creationReq.members || []).find(
        (m) => String(m.user_id) === String(userId)
      ) || {};

      return {
        _id: creationReq._id,
        is_creation_invite: true,
        club_id: {
          _id: creationReq._id,
          name: creationReq.club_name,
          description: creationReq.description || creationReq.reason,
          logo_url: creationReq.logo_url,
          category: creationReq.category || "General",
        },
        invited_by: {
          user_id: creationReq.requested_by,
          full_name: creationReq.requested_by?.full_name || "Club Creator",
          email: creationReq.requested_by?.email || "",
          avatar_url: creationReq.requested_by?.avatar_url || "",
        },
        role: "member",
        message: `You received an invitation to join as a founding member of ${creationReq.club_name} from ${creationReq.requested_by?.full_name || "Leader"}`,
        status: memberEntry.status || "pending",
        created_at: creationReq.created_at,
        updated_at: memberEntry.responded_at || creationReq.created_at,
      };
    }
  }

  if (!invitation) {
    throw getStatusError("Invitation not found", 404);
  }

  if (!invitation.message) {
    const clubName = invitation.club_id?.name || "Club";
    const inviterName = invitation.invited_by?.user_id?.full_name || "Club Board";
    invitation.message = `You received an invitation to join ${clubName} from ${inviterName}.`;
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
  await autoExpireInvitations();

  const query = {
    _id: invitationId,
    invited_user_id: userId,
  };
  if (clubId) query.club_id = clubId;

  const invitation = await Invitation.findOne(query);

  if (invitation) {
    if (invitation.status === "expired" || (invitation.expires_at && new Date() > new Date(invitation.expires_at))) {
      invitation.status = "expired";
      await invitation.save();
      throw getStatusError("Lời mời đã hết hạn (quá giới hạn 3 ngày xác nhận)", 400);
    }

    if (invitation.status !== "pending") {
      throw getStatusError("Invitation already handled", 400);
    }

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
  }

  // Check ClubCreationRequest
  const creationReq = await ClubCreationRequest.findOne({
    _id: invitationId,
    "members.user_id": userId,
  }).populate("requested_by", "_id full_name email avatar_url");

  if (!creationReq) {
    throw getStatusError("Invitation not found or already handled", 404);
  }

  // Check 3-day expiration
  const isExpired = creationReq.expires_at
    ? new Date() > new Date(creationReq.expires_at)
    : (Date.now() - new Date(creationReq.created_at).getTime()) > 3 * 24 * 60 * 60 * 1000;

  if (isExpired) {
    if (creationReq.status === "waiting_member_approval") {
      creationReq.status = "expired";
      await creationReq.save();
    }
    throw getStatusError("Lời mời đã hết hạn (quá giới hạn 3 ngày xác nhận)", 400);
  }

  if (creationReq.status !== "waiting_member_approval") {
    throw getStatusError("Yêu cầu tạo câu lạc bộ hiện không thể tiếp nhận xác nhận thành viên", 400);
  }

  const memberEntry = (creationReq.members || []).find(
    (m) => String(m.user_id) === String(userId)
  );

  if (!memberEntry || memberEntry.status !== "pending") {
    throw getStatusError("Invitation already handled", 400);
  }

  memberEntry.status = "accepted";
  memberEntry.responded_at = new Date();

  // Check if 100% of founding members have accepted (and meets minimum of 10 members)
  const allAccepted =
    creationReq.members.length >= 10 &&
    creationReq.members.every((m) => m.status === "accepted");

  if (allAccepted && creationReq.status === "waiting_member_approval") {
    creationReq.status = "pending";
    try {
      const { sendNewClubCreationRequestEmailToSA } = require("../email.service");
      sendNewClubCreationRequestEmailToSA({
        clubName: creationReq.club_name,
        requesterName: creationReq.requested_by?.full_name || "Student",
        requesterEmail: creationReq.requested_by?.email || "",
        description: creationReq.reason || creationReq.description || "",
        memberCount: creationReq.members.length,
      }).catch((err) => console.error("Club creation SA email error:", err.message));
    } catch (err) {
      console.error("Failed to trigger SA email for creation request:", err.message);
    }
  }

  await creationReq.save();

  return {
    _id: creationReq._id,
    is_creation_invite: true,
    club_id: {
      _id: creationReq._id,
      name: creationReq.club_name,
      description: creationReq.description || creationReq.reason,
      logo_url: creationReq.logo_url,
      category: creationReq.category || "Academic",
    },
    invited_by: {
      user_id: creationReq.requested_by,
      full_name: creationReq.requested_by?.full_name || "Club Creator",
      email: creationReq.requested_by?.email || "",
    },
    role: "member",
    message: `You received an invitation to join as a founding member of ${creationReq.club_name} from ${creationReq.requested_by?.full_name || "Leader"}`,
    status: "accepted",
    created_at: creationReq.created_at,
    updated_at: memberEntry.responded_at,
  };
};

const rejectInvitation = async (userId, clubId, invitationId) => {
  await autoExpireInvitations();

  const query = {
    _id: invitationId,
    invited_user_id: userId,
  };
  if (clubId) query.club_id = clubId;

  const invitation = await Invitation.findOne(query);

  if (invitation) {
    if (invitation.status === "expired" || (invitation.expires_at && new Date() > new Date(invitation.expires_at))) {
      invitation.status = "expired";
      await invitation.save();
      throw getStatusError("Lời mời đã hết hạn", 400);
    }

    if (invitation.status !== "pending") {
      throw getStatusError("Invitation already handled", 400);
    }

    invitation.status = "rejected";
    await invitation.save();

    return invitation.populate([
      { path: "club_id", select: "_id name description logo_url category status" },
      { path: "invited_by", select: "_id full_name email avatar_url" },
    ]);
  }

  // Check ClubCreationRequest
  const creationReq = await ClubCreationRequest.findOne({
    _id: invitationId,
    "members.user_id": userId,
  }).populate("requested_by", "_id full_name email avatar_url");

  if (!creationReq) {
    throw getStatusError("Invitation not found or already handled", 404);
  }

  // Check 3-day expiration
  const isExpired = creationReq.expires_at
    ? new Date() > new Date(creationReq.expires_at)
    : (Date.now() - new Date(creationReq.created_at).getTime()) > 3 * 24 * 60 * 60 * 1000;

  if (isExpired) {
    if (creationReq.status === "waiting_member_approval") {
      creationReq.status = "expired";
      await creationReq.save();
    }
    throw getStatusError("Lời mời đã hết hạn (quá giới hạn 3 ngày xác nhận)", 400);
  }

  const memberEntry = (creationReq.members || []).find(
    (m) => String(m.user_id) === String(userId)
  );

  if (!memberEntry || memberEntry.status !== "pending") {
    throw getStatusError("Invitation already handled", 400);
  }

  memberEntry.status = "rejected";
  memberEntry.responded_at = new Date();

  // If any founding member rejects, 100% acceptance cannot be achieved.
  if (creationReq.status === "waiting_member_approval") {
    creationReq.status = "rejected";
    creationReq.review_note = `Thành viên sáng lập (${memberEntry.user_id}) đã từ chối lời mời tham gia vào ngày ${new Date().toLocaleDateString("vi-VN")}.`;
  }

  await creationReq.save();

  return {
    _id: creationReq._id,
    is_creation_invite: true,
    club_id: {
      _id: creationReq._id,
      name: creationReq.club_name,
      description: creationReq.description || creationReq.reason,
      logo_url: creationReq.logo_url,
      category: creationReq.category || "Academic",
    },
    invited_by: {
      user_id: creationReq.requested_by,
      full_name: creationReq.requested_by?.full_name || "Club Creator",
      email: creationReq.requested_by?.email || "",
    },
    role: "member",
    message: `You received an invitation to join as a founding member of ${creationReq.club_name} from ${creationReq.requested_by?.full_name || "Leader"}`,
    status: "rejected",
    created_at: creationReq.created_at,
    updated_at: memberEntry.responded_at,
  };
};

module.exports = {
  getReceivedInvitations,
  getInvitationDetail,
  acceptInvitation,
  rejectInvitation,
};
