const express = require("express");
const router = express.Router();

const { verifyToken, protect } = require("../middlewares/auth.middleware");
const clubManagementController = require("../controllers/clubManagement.controller");

router.get(
  "/",
  verifyToken,
  protect(["student_affairs"]),
  clubManagementController.getClubList
);


router.get(
  "/:clubId",
  verifyToken,
  protect(["student_affairs"]),
  clubManagementController.getClubDetail
);


router.get(
  "/:clubId/members",
  verifyToken,
  protect(["student_affairs"]),
  clubManagementController.getClubMembers
);


router.patch(
  "/:clubId/members/:memberId/role",
  verifyToken,
  protect(["student_affairs"]),
  clubManagementController.assignManagementRole
);


router.patch(
  "/:clubId/status",
  verifyToken,
  protect(["student_affairs"]),
  clubManagementController.updateClubStatus
);

module.exports = router;