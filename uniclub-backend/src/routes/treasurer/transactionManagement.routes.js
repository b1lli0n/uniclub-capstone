const express = require("express");
const { verifyToken, protect } = require("../../middlewares/auth.middleware");
const { requireClubRole } = require("../../middlewares/clubAuth.middleware");
const transactionController = require("../../controllers/treasurer/transactionManagement.controller");

const router = express.Router();

router.get(
  "/:clubId/transactions/dashboard",
  verifyToken,
  protect(["student"]),
  requireClubRole(["president", "treasurer"], "clubId"),
  transactionController.getFinancialDashboard
);
router.get(
  "/:clubId/transactions/export",
  verifyToken,
  protect(["student"]),
  requireClubRole(["president", "treasurer"], "clubId"),
  transactionController.exportFinancialReport
);
router.get(
  "/:clubId/transactions/:transactionId",
  verifyToken,
  protect(["student"]),
  requireClubRole(["president", "treasurer"], "clubId"),
  transactionController.getTransactionDetail
);
router.get(
  "/:clubId/transactions",
  verifyToken,
  protect(["student"]),
  requireClubRole(["president", "treasurer"], "clubId"),
  transactionController.getTransactionList
);
router.post(
  "/:clubId/transactions",
  verifyToken,
  protect(["student"]),
  requireClubRole(["president", "treasurer"], "clubId"),
  transactionController.createTransactionRequest
);
router.patch(
  "/:clubId/transactions/:transactionId",
  verifyToken,
  protect(["student"]),
  requireClubRole(["president", "treasurer"], "clubId"),
  transactionController.updateTransactionRequest
);

module.exports = router;
