const joinFormManagementService = require("../../services/president/joinFormManagement.service");

// ─────────────────────────────────────────────────────────────
// UC: View Join Form của club (president xem form hiện tại)
// GET /api/president/clubs/:clubId/join-form
// ─────────────────────────────────────────────────────────────
const getJoinForm = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const data = await joinFormManagementService.getJoinForm(clubId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// UC: Create Join Form (president tạo form mới)
// POST /api/president/clubs/:clubId/join-form
// Body: { title, description, questions: string[] }
// ─────────────────────────────────────────────────────────────
const createJoinForm = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const { title, description, questions } = req.body;
    const userId = req.user.id;

    const data = await joinFormManagementService.createJoinForm({
      clubId,
      userId,
      clubMember: req.clubMember,
      title,
      description,
      questions,
    });

    return res.status(201).json({
      success: true,
      message: "Join form created successfully",
      data,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// UC: Update Join Form (president chỉnh sửa nội dung form)
// PATCH /api/president/clubs/:clubId/join-form/:formId
// Body: { title?, description?, questions? }
// ─────────────────────────────────────────────────────────────
const updateJoinForm = async (req, res, next) => {
  try {
    const { clubId, formId } = req.params;
    const { title, description, questions } = req.body;

    const data = await joinFormManagementService.updateJoinForm({
      clubId,
      formId,
      title,
      description,
      questions,
    });

    return res.status(200).json({
      success: true,
      message: "Join form updated successfully",
      data,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// UC: Toggle Activate / Deactivate Form
// PATCH /api/president/clubs/:clubId/join-form/:formId/status
// Body: { status: "active" | "inactive" }
// ─────────────────────────────────────────────────────────────
const toggleJoinFormStatus = async (req, res, next) => {
  try {
    const { clubId, formId } = req.params;
    const { status } = req.body;

    const data = await joinFormManagementService.toggleJoinFormStatus({
      clubId,
      formId,
      status,
    });

    return res.status(200).json({
      success: true,
      message: `Join form ${status === "active" ? "activated" : "deactivated"} successfully`,
      data,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

module.exports = {
  getJoinForm,
  createJoinForm,
  updateJoinForm,
  toggleJoinFormStatus,
};
