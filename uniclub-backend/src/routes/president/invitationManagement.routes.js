const express = require("express");
const { verifyToken, protect } = require("../../middlewares/auth.middleware");
const { requireClubRole } = require("../../middlewares/clubAuth.middleware");
const {
  getInvitationList,
  getInvitationDetail,
  sendInvitation,
  cancelInvitation,
  resendInvitation,
} = require("../../controllers/president/invitationManagement.controller");

const router = express.Router();

router.get(
  "/:clubId/invitations",
  verifyToken,
  protect(["student"]),
  requireClubRole(["president"], "clubId"),
  getInvitationList
);
router.get(
  "/:clubId/invitations/:invitationId",
  verifyToken,
  protect(["student"]),
  requireClubRole(["president"], "clubId"),
  getInvitationDetail
);
router.post(
  "/:clubId/invitations",
  verifyToken,
  protect(["student"]),
  requireClubRole(["president"], "clubId"),
  sendInvitation
);
router.patch(
  "/:clubId/invitations/:invitationId/cancel",
  verifyToken,
  protect(["student"]),
  requireClubRole(["president"], "clubId"),
  cancelInvitation
);
router.patch(
  "/:clubId/invitations/:invitationId/resend",
  verifyToken,
  protect(["student"]),
  requireClubRole(["president"], "clubId"),
  resendInvitation
);

module.exports = router;
