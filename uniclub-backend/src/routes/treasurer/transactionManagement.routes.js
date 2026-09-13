const express = require("express");
const { verifyToken, authorize } = require("../../middlewares/auth.middleware");
const { requireClubRole } = require("../../middlewares/club.middleware");
const transactionController = require("../../controllers/treasurer/transactionManagement.controller");

const router = express.Router();

router.get(
  "/:clubId/transactions/dashboard",
  verifyToken,
  authorize(["student"]),
  requireClubRole(["president", "treasurer"], "clubId"),
  transactionController.getFinancialDashboard
);
router.get(
  "/:clubId/transactions/export",
  verifyToken,
  authorize(["student"]),
  requireClubRole(["president", "treasurer"], "clubId"),
  transactionController.exportFinancialReport
);
router.get(
  "/:clubId/transactions/:transactionId",
  verifyToken,
  authorize(["student"]),
  requireClubRole(["president", "treasurer"], "clubId"),
  transactionController.getTransactionDetail
);
router.get(
  "/:clubId/transactions",
  verifyToken,
  authorize(["student"]),
  requireClubRole(["president", "treasurer"], "clubId"),
  transactionController.getTransactionList
);
router.post(
  "/:clubId/transactions",
  verifyToken,
  authorize(["student"]),
  requireClubRole(["president", "treasurer"], "clubId"),
  transactionController.createTransactionRequest
);
router.patch(
  "/:clubId/transactions/:transactionId",
  verifyToken,
  authorize(["student"]),
  requireClubRole(["president", "treasurer"], "clubId"),
  transactionController.updateTransactionRequest
);

module.exports = router;
