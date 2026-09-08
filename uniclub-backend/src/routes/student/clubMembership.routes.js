const express = require("express");
const { verifyToken, authorize } = require("../../middlewares/auth.middleware");
const {
  getClubJoinForm,
  submitJoinRequest,
  getMyJoinRequests,
  getJoinRequestDetail,
  cancelJoinRequest,
} = require("../../controllers/student/clubMembership.controller");

const router = express.Router();

router.get("/join-requests", verifyToken, authorize(["student"]), getMyJoinRequests);
router.patch(
  "/join-requests/:requestId/cancel",
  verifyToken,
  authorize(["student"]),
  cancelJoinRequest
);
router.get(
  "/join-requests/:requestId",
  verifyToken,
  authorize(["student"]),
  getJoinRequestDetail
);
router.get("/:clubId/join-form", verifyToken, authorize(["student"]), getClubJoinForm);
router.post(
  "/:clubId/join-requests",
  verifyToken,
  authorize(["student"]),
  submitJoinRequest
);

module.exports = router;
