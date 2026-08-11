const express = require("express");
const { verifyToken, protect } = require("../../middlewares/auth.middleware");
const { requireClubMember } = require("../../middlewares/clubAuth.middleware");
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
  protect(["student"]),
  getReceivedInvitations
);

router.get(
  "/:clubId/invitations",
  verifyToken,
  protect(["student"]),
  getReceivedInvitations
);

router.get(
  "/invitations/:invitationId",
  verifyToken,
  protect(["student"]),
  getInvitationDetail
);

router.get(
  "/:clubId/invitations/:invitationId",
  verifyToken,
  protect(["student"]),
  getInvitationDetail
);

router.patch(
  "/invitations/:invitationId/accept",
  verifyToken,
  protect(["student"]),
  acceptInvitation
);

router.patch(
  "/:clubId/invitations/:invitationId/accept",
  verifyToken,
  protect(["student"]),
  acceptInvitation
);

router.patch(
  "/invitations/:invitationId/reject",
  verifyToken,
  protect(["student"]),
  rejectInvitation
);

router.patch(
  "/:clubId/invitations/:invitationId/reject",
  verifyToken,
  protect(["student"]),
  rejectInvitation
);

module.exports = router;
