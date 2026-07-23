const mongoose = require("mongoose");
const invitationManagementService = require("../../services/secretary/invitationManagement.service");
const { getStatusError } = require("../../utils/error");

const ALLOWED_INVITATION_STATUS = ["pending", "accepted", "rejected", "cancelled"];
const ALLOWED_ROLES = ["member", "president", "secretary", "treasurer", "event_manager"];

const getInvitationList = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const { status } = req.query;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return next(getStatusError("Invalid clubId", 400));
    }

    if (status && !ALLOWED_INVITATION_STATUS.includes(status)) {
      return next(
        getStatusError(
          "Invalid status. Allowed values: pending, accepted, rejected, cancelled",
          400
        )
      );
    }

    const data = await invitationManagementService.getInvitationList(clubId, { status });

    return res.status(200).json({
      success: true,
      message: "Invitation list retrieved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getInvitationDetail = async (req, res, next) => {
  try {
    const { clubId, invitationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return next(getStatusError("Invalid clubId", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(invitationId)) {
      return next(getStatusError("Invalid invitationId", 400));
    }

    const data = await invitationManagementService.getInvitationDetail(clubId, invitationId);

    return res.status(200).json({
      success: true,
      message: "Invitation detail retrieved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const sendInvitation = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const { invited_user_id: invitedUserId, role, message } = req.body;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return next(getStatusError("Invalid clubId", 400));
    }

    if (!invitedUserId || !mongoose.Types.ObjectId.isValid(invitedUserId)) {
      return next(getStatusError("Invalid invited_user_id", 400));
    }

    if (role !== undefined && !ALLOWED_ROLES.includes(role)) {
      return next(
        getStatusError(
          "Invalid role. Allowed values: member, president, secretary, treasurer, event_manager",
          400
        )
      );
    }

    if (message !== undefined && typeof message !== "string") {
      return next(getStatusError("message must be a string", 400));
    }

    const data = await invitationManagementService.sendInvitation(req.user.id, clubId, {
      invited_user_id: invitedUserId,
      role,
      message,
    });

    return res.status(201).json({
      success: true,
      message: "Invitation sent successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const cancelInvitation = async (req, res, next) => {
  try {
    const { clubId, invitationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return next(getStatusError("Invalid clubId", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(invitationId)) {
      return next(getStatusError("Invalid invitationId", 400));
    }

    const data = await invitationManagementService.cancelInvitation(clubId, invitationId);

    return res.status(200).json({
      success: true,
      message: "Invitation cancelled successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const resendInvitation = async (req, res, next) => {
  try {
    const { clubId, invitationId } = req.params;
    const { role, message } = req.body;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return next(getStatusError("Invalid clubId", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(invitationId)) {
      return next(getStatusError("Invalid invitationId", 400));
    }

    if (role !== undefined && !ALLOWED_ROLES.includes(role)) {
      return next(
        getStatusError(
          "Invalid role. Allowed values: member, president, secretary, treasurer, event_manager",
          400
        )
      );
    }

    if (message !== undefined && typeof message !== "string") {
      return next(getStatusError("message must be a string", 400));
    }

    const data = await invitationManagementService.resendInvitation(
      req.user.id,
      clubId,
      invitationId,
      { role, message }
    );

    return res.status(200).json({
      success: true,
      message: "Invitation resent successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInvitationList,
  getInvitationDetail,
  sendInvitation,
  cancelInvitation,
  resendInvitation,
};
