const express = require("express");
const { verifyToken, protect } = require("../../middlewares/auth.middleware");
const {
  getClubJoinForm,
  submitJoinRequest,
  getMyJoinRequests,
  getJoinRequestDetail,
  cancelJoinRequest,
} = require("../../controllers/student/clubMembership.controller");

const router = express.Router();

router.get("/join-requests", verifyToken, protect(["student"]), getMyJoinRequests);
router.patch(
  "/join-requests/:requestId/cancel",
  verifyToken,
  protect(["student"]),
  cancelJoinRequest
);
router.get(
  "/join-requests/:requestId",
  verifyToken,
  protect(["student"]),
  getJoinRequestDetail
);
router.get("/:clubId/join-form", verifyToken, protect(["student"]), getClubJoinForm);
router.post(
  "/:clubId/join-requests",
  verifyToken,
  protect(["student"]),
  submitJoinRequest
);

module.exports = router;
