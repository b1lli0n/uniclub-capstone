const express = require("express");
const router = express.Router();

const { verifyToken, authorize } = require("../middlewares/auth.middleware");
const clubManagementController = require("../controllers/clubManagement.controller");

router.get(
  "/",
  verifyToken,
  authorize(["student_affairs"]),
  clubManagementController.getClubList
);

// UC-13 View Club Creation Request List
router.get(
  "/club-creation-requests",
  verifyToken,
  authorize(["student_affairs"]),
  clubManagementController.getClubCreationRequestList
);

// UC-14 View Club Creation Request Detail
router.get(
  "/club-creation-requests/:id",
  verifyToken,
  authorize(["student_affairs"]),
  clubManagementController.getClubCreationRequestDetail
);

// UC-15 Approve/Reject Club Creation Request
router.patch(
  "/club-creation-requests/:id/review",
  verifyToken,
  authorize(["student_affairs"]),
  clubManagementController.reviewClubCreationRequest
);

router.get(
  "/:clubId",
  verifyToken,
  authorize(["student_affairs"]),
  clubManagementController.getClubDetail
);

router.get(
  "/:clubId/members",
  verifyToken,
  authorize(["student_affairs"]),
  clubManagementController.getClubMembers
);

router.patch(
  "/:clubId/members/:memberId/role",
  verifyToken,
  authorize(["student_affairs"]),
  clubManagementController.assignManagementRole
);

router.patch(
  "/:clubId/status",
  verifyToken,
  authorize(["student_affairs"]),
  clubManagementController.updateClubStatus
);

module.exports = router;
