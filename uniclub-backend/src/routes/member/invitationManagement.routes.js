const express = require("express");
const { verifyToken, authorize } = require("../../middlewares/auth.middleware");
const { requireClubMember } = require("../../middlewares/club.middleware");
const {
  getReceivedInvitations,
  getInvitationDetail,
  acceptInvitation,
  rejectInvitation,
} = require("../../controllers/member/invitationManagement.controller");

const router = express.Router();

router.get(
  "/invitations",
  verifyToken,
  authorize(["student"]),
  getReceivedInvitations
);

router.get(
  "/:clubId/invitations",
  verifyToken,
  authorize(["student"]),
  getReceivedInvitations
);

router.get(
  "/invitations/:invitationId",
  verifyToken,
  authorize(["student"]),
  getInvitationDetail
);

router.get(
  "/:clubId/invitations/:invitationId",
  verifyToken,
  authorize(["student"]),
  getInvitationDetail
);

router.patch(
  "/invitations/:invitationId/accept",
  verifyToken,
  authorize(["student"]),
  acceptInvitation
);

router.patch(
  "/:clubId/invitations/:invitationId/accept",
  verifyToken,
  authorize(["student"]),
  acceptInvitation
);

router.patch(
  "/invitations/:invitationId/reject",
  verifyToken,
  authorize(["student"]),
  rejectInvitation
);

router.patch(
  "/:clubId/invitations/:invitationId/reject",
  verifyToken,
  authorize(["student"]),
  rejectInvitation
);

module.exports = router;
