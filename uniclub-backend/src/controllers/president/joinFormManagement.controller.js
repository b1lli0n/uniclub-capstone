const mongoose = require("mongoose");
const JoinForm = require("../../models/join_form.model");
const Club = require("../../models/club.model");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─────────────────────────────────────────────────────────────
// UC: View Join Form của club (president xem form hiện tại)
// GET /api/president/clubs/:clubId/join-form
// ─────────────────────────────────────────────────────────────
const getJoinForm = async (req, res) => {
  try {
    const { clubId } = req.params;

    if (!isValidId(clubId)) {
      return res.status(400).json({ success: false, message: "Invalid club ID" });
    }

    // Lấy form mới nhất (active trước, nếu không có lấy inactive)
    const form = await JoinForm.findOne({ club_id: clubId })
      .sort({ created_at: -1 })
      .populate({
        path: "created_by",
        populate: { path: "user_id", select: "full_name email avatar_url" },
      })
      .lean();

    if (!form) {
      return res.status(404).json({
        success: false,
        message: "No join form found for this club",
      });
    }

    return res.status(200).json({ success: true, data: form });
  } catch (error) {
    console.error("getJoinForm error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// UC: Create Join Form (president tạo form mới)
// POST /api/president/clubs/:clubId/join-form
// Body: { title, description, questions: string[] }
// ─────────────────────────────────────────────────────────────
const createJoinForm = async (req, res) => {
  try {
    const { clubId } = req.params;
    const { title, description, questions } = req.body;
    const userId = req.user.id;

    if (!isValidId(clubId)) {
      return res.status(400).json({ success: false, message: "Invalid club ID" });
    }

    // Validate
    if (!title || !title.trim()) {
      return res.status(400).json({ success: false, message: "Title is required" });
    }
    if (!description || !description.trim()) {
      return res.status(400).json({ success: false, message: "Description is required" });
    }
    if (!Array.isArray(questions) || questions.length === 0) {
      return res.status(400).json({ success: false, message: "At least one question is required" });
    }
    const cleanQuestions = questions.map((q) => (q || "").trim()).filter(Boolean);
    if (cleanQuestions.length === 0) {
      return res.status(400).json({ success: false, message: "Questions cannot be empty strings" });
    }

    // Kiểm tra club tồn tại
    const club = await Club.findById(clubId).lean();
    if (!club) {
      return res.status(404).json({ success: false, message: "Club not found" });
    }

    // Deactivate tất cả form cũ trước khi tạo form mới
    await JoinForm.updateMany(
      { club_id: clubId, status: "active" },
      { $set: { status: "inactive" } }
    );

    const ClubMember = require("../../models/club_member.model");
    const member = req.clubMember || (await ClubMember.findOne({ club_id: clubId, user_id: userId }));

    const form = await JoinForm.create({
      club_id: clubId,
      title: title.trim(),
      description: description.trim(),
      questions: cleanQuestions,
      status: "active",
      created_by: member ? member._id : userId,
    });

    const populated = await form.populate({
      path: "created_by",
      populate: { path: "user_id", select: "full_name email avatar_url" },
    });

    return res.status(201).json({
      success: true,
      message: "Join form created successfully",
      data: populated,
    });
  } catch (error) {
    console.error("createJoinForm error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// UC: Update Join Form (president chỉnh sửa nội dung form)
// PATCH /api/president/clubs/:clubId/join-form/:formId
// Body: { title?, description?, questions? }
// ─────────────────────────────────────────────────────────────
const updateJoinForm = async (req, res) => {
  try {
    const { clubId, formId } = req.params;
    const { title, description, questions } = req.body;

    if (!isValidId(clubId) || !isValidId(formId)) {
      return res.status(400).json({ success: false, message: "Invalid club ID or form ID" });
    }

    const form = await JoinForm.findOne({ _id: formId, club_id: clubId });
    if (!form) {
      return res.status(404).json({ success: false, message: "Join form not found" });
    }

    // Áp dụng thay đổi (chỉ field nào được gửi lên)
    if (title !== undefined) {
      if (!title.trim()) {
        return res.status(400).json({ success: false, message: "Title cannot be empty" });
      }
      form.title = title.trim();
    }

    if (description !== undefined) {
      if (!description.trim()) {
        return res.status(400).json({ success: false, message: "Description cannot be empty" });
      }
      form.description = description.trim();
    }

    if (questions !== undefined) {
      if (!Array.isArray(questions) || questions.length === 0) {
        return res.status(400).json({ success: false, message: "At least one question is required" });
      }
      const cleanQuestions = questions.map((q) => (q || "").trim()).filter(Boolean);
      if (cleanQuestions.length === 0) {
        return res.status(400).json({ success: false, message: "Questions cannot be empty strings" });
      }
      form.questions = cleanQuestions;
    }

    await form.save();
    const populated = await form.populate({
      path: "created_by",
      populate: { path: "user_id", select: "full_name email avatar_url" },
    });

    return res.status(200).json({
      success: true,
      message: "Join form updated successfully",
      data: populated,
    });
  } catch (error) {
    console.error("updateJoinForm error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

// ─────────────────────────────────────────────────────────────
// UC: Toggle Activate / Deactivate Form
// PATCH /api/president/clubs/:clubId/join-form/:formId/status
// Body: { status: "active" | "inactive" }
// ─────────────────────────────────────────────────────────────
const toggleJoinFormStatus = async (req, res) => {
  try {
    const { clubId, formId } = req.params;
    const { status } = req.body;

    if (!isValidId(clubId) || !isValidId(formId)) {
      return res.status(400).json({ success: false, message: "Invalid club ID or form ID" });
    }

    if (!["active", "inactive"].includes(status)) {
      return res.status(400).json({
        success: false,
        message: 'status must be "active" or "inactive"',
      });
    }

    const form = await JoinForm.findOne({ _id: formId, club_id: clubId });
    if (!form) {
      return res.status(404).json({ success: false, message: "Join form not found" });
    }

    // Nếu muốn activate → deactivate tất cả form khác của club trước
    if (status === "active") {
      await JoinForm.updateMany(
        { club_id: clubId, _id: { $ne: formId }, status: "active" },
        { $set: { status: "inactive" } }
      );
    }

    form.status = status;
    await form.save();

    return res.status(200).json({
      success: true,
      message: `Join form ${status === "active" ? "activated" : "deactivated"} successfully`,
      data: { _id: form._id, status: form.status },
    });
  } catch (error) {
    console.error("toggleJoinFormStatus error:", error);
    return res.status(500).json({ success: false, message: "Server error", error: error.message });
  }
};

module.exports = {
  getJoinForm,
  createJoinForm,
  updateJoinForm,
  toggleJoinFormStatus,
};
