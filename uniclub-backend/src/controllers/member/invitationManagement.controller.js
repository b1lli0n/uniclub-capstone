const mongoose = require("mongoose");
const invitationManagementService = require("../../services/member/invitationManagement.service");
const { getStatusError } = require("../../utils/error");

const ALLOWED_INVITATION_STATUS = ["pending", "accepted", "rejected", "cancelled"];

const getReceivedInvitations = async (req, res, next) => {
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

    const data = await invitationManagementService.getReceivedInvitations(
      req.user.id,
      clubId,
      { status }
    );

    return res.status(200).json({
      success: true,
      message: "Received invitations retrieved successfully",
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

    const data = await invitationManagementService.getInvitationDetail(
      req.user.id,
      clubId,
      invitationId
    );

    return res.status(200).json({
      success: true,
      message: "Invitation detail retrieved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const acceptInvitation = async (req, res, next) => {
  try {
    const { clubId, invitationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return next(getStatusError("Invalid clubId", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(invitationId)) {
      return next(getStatusError("Invalid invitationId", 400));
    }

    const data = await invitationManagementService.acceptInvitation(
      req.user.id,
      clubId,
      invitationId,
      req.clubMembership
    );

    return res.status(200).json({
      success: true,
      message: "Invitation accepted successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const rejectInvitation = async (req, res, next) => {
  try {
    const { clubId, invitationId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(clubId)) {
      return next(getStatusError("Invalid clubId", 400));
    }

    if (!mongoose.Types.ObjectId.isValid(invitationId)) {
      return next(getStatusError("Invalid invitationId", 400));
    }

    const data = await invitationManagementService.rejectInvitation(
      req.user.id,
      clubId,
      invitationId
    );

    return res.status(200).json({
      success: true,
      message: "Invitation rejected successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getReceivedInvitations,
  getInvitationDetail,
  acceptInvitation,
  rejectInvitation,
};
