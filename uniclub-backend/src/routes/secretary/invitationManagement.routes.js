const express = require("express");
const { verifyToken, authorize } = require("../../middlewares/auth.middleware");
const { requireClubRole } = require("../../middlewares/club.middleware");
const {
  getInvitationList,
  getInvitationDetail,
  sendInvitation,
  cancelInvitation,
  resendInvitation,
} = require("../../controllers/secretary/invitationManagement.controller");

const router = express.Router();

const committeeRoles = ["president", "leader", "secretary"];

router.get(
  "/:clubId/invitations",
  verifyToken,
  authorize(["student"]),
  requireClubRole(committeeRoles, "clubId"),
  getInvitationList
);
router.get(
  "/:clubId/invitations/:invitationId",
  verifyToken,
  authorize(["student"]),
  requireClubRole(committeeRoles, "clubId"),
  getInvitationDetail
);
router.post(
  "/:clubId/invitations",
  verifyToken,
  authorize(["student"]),
  requireClubRole(committeeRoles, "clubId"),
  sendInvitation
);
router.patch(
  "/:clubId/invitations/:invitationId/cancel",
  verifyToken,
  authorize(["student"]),
  requireClubRole(committeeRoles, "clubId"),
  cancelInvitation
);
router.patch(
  "/:clubId/invitations/:invitationId/resend",
  verifyToken,
  authorize(["student"]),
  requireClubRole(committeeRoles, "clubId"),
  resendInvitation
);

module.exports = router;
