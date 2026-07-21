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
  "/:clubId/invitations",
  verifyToken,
  protect(["student"]),
  requireClubMember("clubId"),
  getReceivedInvitations
);
router.get(
  "/:clubId/invitations/:invitationId",
  verifyToken,
  protect(["student"]),
  requireClubMember("clubId"),
  getInvitationDetail
);
router.patch(
  "/:clubId/invitations/:invitationId/accept",
  verifyToken,
  protect(["student"]),
  requireClubMember("clubId"),
  acceptInvitation
);
router.patch(
  "/:clubId/invitations/:invitationId/reject",
  verifyToken,
  protect(["student"]),
  requireClubMember("clubId"),
  rejectInvitation
);

module.exports = router;
