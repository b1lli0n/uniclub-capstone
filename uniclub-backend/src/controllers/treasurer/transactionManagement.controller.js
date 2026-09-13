const mongoose = require("mongoose");
const transactionService = require("../../services/treasurer/transactionManagement.service");
const { getStatusError } = require("../../utils/error");
const { getCurrentSemesterCode } = require("../../utils/semester.helper");

const parseRequiredText = (value, fieldName, maxLength) => {
  if (typeof value !== "string" || !value.trim()) {
    throw getStatusError(`${fieldName} is required`, 400);
  }
  const text = value.trim();
  if (text.length > maxLength) throw getStatusError(`${fieldName} is too long`, 400);
  return text;
};

const parseOptionalPeriod = (value, dateRef) => {
  if (typeof value === "string" && value.trim()) {
    const text = value.trim();
    if (text.length > 30) throw getStatusError("period is too long", 400);
    return text;
  }
  return getCurrentSemesterCode(dateRef);
};

const parseAmount = (value) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount < 0) {
    throw getStatusError("amount must be a non-negative number", 400);
  }
  return amount;
};

const parseDate = (value, fieldName = "transaction_date") => {
  const date = new Date(value);
  if (!value || Number.isNaN(date.getTime())) throw getStatusError(`Invalid ${fieldName}`, 400);
  return date;
};

const parseType = (value) => {
  if (value === undefined || value === null) return "income";
  const typeStr = String(value).trim().toLowerCase();
  if (typeStr === "0" || typeStr === "income") return "income";
  if (typeStr === "1" || typeStr === "expense") return "expense";
  throw getStatusError("Invalid type. Allowed values: income, expense", 400);
};

const parseStatus = (value) => {
  if (value === undefined || value === null || value === "") return undefined;
  const statusStr = String(value).trim().toLowerCase();
  if (statusStr === "0" || statusStr === "pending") return "pending";
  if (statusStr === "1" || statusStr === "approved") return "approved";
  if (statusStr === "2" || statusStr === "rejected") return "rejected";
  throw getStatusError("Invalid status. Allowed values: pending, approved, rejected", 400);
};

const parseCreatePayload = (body) => {
  const transaction_date = parseDate(body.transaction_date);
  return {
    type: parseType(body.type),
    title: parseRequiredText(body.title || body.category, "title", 100),
    period: getCurrentSemesterCode(transaction_date), // Tự động 100% từ ngày giao dịch
    amount: parseAmount(body.amount),
    description: parseRequiredText(body.description, "description", 255),
    transaction_date,
  };
};

const parseUpdatePayload = (body) => {
  const updates = {};
  if (body.status !== undefined) updates.status = parseStatus(body.status);
  if (body.type !== undefined) updates.type = parseType(body.type);
  if (body.title !== undefined || body.category !== undefined) {
    updates.title = parseRequiredText(body.title || body.category, "title", 100);
  }
  if (body.amount !== undefined) updates.amount = parseAmount(body.amount);
  if (body.description !== undefined) updates.description = parseRequiredText(body.description, "description", 255);
  if (body.transaction_date !== undefined) {
    const transaction_date = parseDate(body.transaction_date);
    updates.transaction_date = transaction_date;
    updates.period = getCurrentSemesterCode(transaction_date); // Tự động tính lại học kỳ nếu sửa ngày giao dịch
  }
  if (!Object.keys(updates).length) throw getStatusError("At least one field is required to update", 400);
  return updates;
};

const validateIds = (clubId, transactionId = null) => {
  if (!mongoose.Types.ObjectId.isValid(clubId)) throw getStatusError("Invalid clubId", 400);
  if (transactionId && !mongoose.Types.ObjectId.isValid(transactionId)) {
    throw getStatusError("Invalid transactionId", 400);
  }
};

const parseReportDate = (value, fieldName) => {
  if (!value) return undefined;
  return parseDate(value, fieldName);
};

const getTransactionList = async (req, res, next) => {
  try {
    validateIds(req.params.clubId);
    const data = await transactionService.getTransactionList(req.params.clubId, {
      status: parseStatus(req.query.status),
      type: req.query.type === undefined ? undefined : parseType(req.query.type),
    });
    return res.status(200).json({ success: true, message: "Transaction list retrieved successfully", data });
  } catch (error) {
    next(error);
  }
};

const getTransactionDetail = async (req, res, next) => {
  try {
    validateIds(req.params.clubId, req.params.transactionId);
    const data = await transactionService.getTransactionDetail(req.params.clubId, req.params.transactionId);
    return res.status(200).json({ success: true, message: "Transaction detail retrieved successfully", data });
  } catch (error) {
    next(error);
  }
};

const createTransactionRequest = async (req, res, next) => {
  try {
    validateIds(req.params.clubId);
    const data = await transactionService.createTransactionRequest(
      req.params.clubId,
      req.user.id,
      parseCreatePayload(req.body)
    );
    return res.status(201).json({ success: true, message: "Transaction request created successfully", data });
  } catch (error) {
    next(error);
  }
};

const updateTransactionRequest = async (req, res, next) => {
  try {
    validateIds(req.params.clubId, req.params.transactionId);
    const data = await transactionService.updateTransactionRequest(
      req.params.clubId,
      req.params.transactionId,
      req.user.id,
      parseUpdatePayload(req.body)
    );
    return res.status(200).json({ success: true, message: "Transaction request updated successfully", data });
  } catch (error) {
    next(error);
  }
};

const getFinancialDashboard = async (req, res, next) => {
  try {
    validateIds(req.params.clubId);
    const data = await transactionService.getFinancialDashboard(req.params.clubId);
    return res.status(200).json({ success: true, message: "Financial dashboard retrieved successfully", data });
  } catch (error) {
    next(error);
  }
};

const escapeCsv = (value) => `"${String(value ?? "").replace(/"/g, '""')}"`;

const exportFinancialReport = async (req, res, next) => {
  try {
    validateIds(req.params.clubId);
    const from = parseReportDate(req.query.from, "from");
    const to = parseReportDate(req.query.to, "to");
    if (from && to && from > to) throw getStatusError("from must be before to", 400);

    const rows = await transactionService.getFinancialReport(req.params.clubId, {
      from,
      to,
      status: parseStatus(req.query.status),
      type: req.query.type === undefined ? undefined : parseType(req.query.type),
    });
    const header = ["Transaction ID", "Type", "Title", "Period", "Amount", "Description", "Transaction Date", "Status", "Created By", "Approved By"];
    const csvRows = rows.map((item) => [
      item._id,
      item.type,
      item.title || item.category || "",
      item.period,
      item.amount,
      item.description,
      item.transaction_date.toISOString(),
      item.status,
      item.created_by?.user_id?.full_name || item.created_by?.full_name || "",
      item.approved_by?.user_id?.full_name || item.approved_by?.full_name || "",
    ]);
    const csv = [header, ...csvRows].map((row) => row.map(escapeCsv).join(",")).join("\r\n");

    res.status(200);
    res.setHeader("Content-Type", "text/csv; charset=utf-8");
    res.setHeader("Content-Disposition", 'attachment; filename="financial-report.csv"');
    return res.send(`\uFEFF${csv}`);
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getTransactionList,
  getTransactionDetail,
  createTransactionRequest,
  updateTransactionRequest,
  getFinancialDashboard,
  exportFinancialReport,
};
