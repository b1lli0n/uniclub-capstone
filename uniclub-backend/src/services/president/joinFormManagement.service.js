const mongoose = require("mongoose");
const JoinForm = require("../../models/join_form.model");
const JoinRequest = require("../../models/join_request.model");
const Club = require("../../models/club.model");
const ClubMember = require("../../models/club_member.model");
const { getStatusError } = require("../../utils/error");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const getJoinForm = async (clubId) => {
  if (!isValidId(clubId)) {
    throw getStatusError("Invalid club ID", 400);
  }

  const form = await JoinForm.findOne({ club_id: clubId })
    .sort({ created_at: -1 })
    .populate({
      path: "created_by",
      populate: { path: "user_id", select: "full_name email avatar_url" },
    })
    .lean();

  if (!form) {
    throw getStatusError("No join form found for this club", 404);
  }

  const responseCount = await JoinRequest.countDocuments({ form_id: form._id });
  form.response_count = responseCount;
  form.is_locked = responseCount > 0;

  // Luôn lấy Leader hiện tại của CLB để gán vào form
  const currentPresident = await ClubMember.findOne({
    club_id: clubId,
    role: "president",
    status: "active",
  })
    .populate("user_id", "full_name email avatar_url student_code")
    .lean();

  if (currentPresident) {
    form.leader = {
      _id: currentPresident.user_id?._id,
      member_id: currentPresident._id,
      full_name: currentPresident.user_id?.full_name,
      email: currentPresident.user_id?.email,
      avatar_url: currentPresident.user_id?.avatar_url,
      student_code: currentPresident.user_id?.student_code,
    };
  }

  return form;
};

const createJoinForm = async ({ clubId, userId, clubMember, title, description, questions }) => {
  if (!isValidId(clubId)) {
    throw getStatusError("Invalid club ID", 400);
  }

  if (!title || !title.trim()) {
    throw getStatusError("Title is required", 400);
  }
  if (!description || !description.trim()) {
    throw getStatusError("Description is required", 400);
  }
  if (!Array.isArray(questions) || questions.length === 0) {
    throw getStatusError("At least one question is required", 400);
  }
  const cleanQuestions = questions.map((q) => (q || "").trim()).filter(Boolean);
  if (cleanQuestions.length === 0) {
    throw getStatusError("Questions cannot be empty strings", 400);
  }

  const club = await Club.findById(clubId).lean();
  if (!club) {
    throw getStatusError("Club not found", 404);
  }

  // Deactivate old active forms before creating a new one
  await JoinForm.updateMany(
    { club_id: clubId, status: "active" },
    { $set: { status: "inactive" } }
  );

  const member = clubMember || (await ClubMember.findOne({ club_id: clubId, user_id: userId }));

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

  return populated;
};

const updateJoinForm = async ({ clubId, formId, title, description, questions }) => {
  if (!isValidId(clubId) || !isValidId(formId)) {
    throw getStatusError("Invalid club ID or form ID", 400);
  }

  const form = await JoinForm.findOne({ _id: formId, club_id: clubId });
  if (!form) {
    throw getStatusError("Join form not found", 404);
  }

  // BR-24: Once a form has received at least one response, structural modification
  // of existing questions is disallowed (title and description can still be updated)
  if (questions !== undefined) {
    if (!Array.isArray(questions) || questions.length === 0) {
      throw getStatusError("At least one question is required", 400);
    }
    const cleanQuestions = questions.map((q) => (q || "").trim()).filter(Boolean);
    if (cleanQuestions.length === 0) {
      throw getStatusError("Questions cannot be empty strings", 400);
    }

    const existingQuestions = (form.questions || []).map((q) =>
      (typeof q === "string" ? q : q.content || "").trim()
    );

    const isStructurallyModified =
      cleanQuestions.length !== existingQuestions.length ||
      cleanQuestions.some((q, idx) => q !== existingQuestions[idx]);

    if (isStructurallyModified) {
      const responseCount = await JoinRequest.countDocuments({ form_id: formId });
      if (responseCount > 0) {
        throw getStatusError(
          `This form has already received ${responseCount} response(s) from students. ` +
          "Structural modification of questions is no longer allowed. " +
          "You can still update the form title and description.",
          400
        );
      }
      form.questions = cleanQuestions;
    }
  }

  if (title !== undefined) {
    if (!title.trim()) {
      throw getStatusError("Title cannot be empty", 400);
    }
    form.title = title.trim();
  }

  if (description !== undefined) {
    if (!description.trim()) {
      throw getStatusError("Description cannot be empty", 400);
    }
    form.description = description.trim();
  }

  await form.save();
  const populated = await form.populate({
    path: "created_by",
    populate: { path: "user_id", select: "full_name email avatar_url" },
  });

  return populated;
};

const toggleJoinFormStatus = async ({ clubId, formId, status }) => {
  if (!isValidId(clubId) || !isValidId(formId)) {
    throw getStatusError("Invalid club ID or form ID", 400);
  }

  if (!["active", "inactive"].includes(status)) {
    throw getStatusError('status must be "active" or "inactive"', 400);
  }

  const form = await JoinForm.findOne({ _id: formId, club_id: clubId });
  if (!form) {
    throw getStatusError("Join form not found", 404);
  }

  if (status === "active") {
    await JoinForm.updateMany(
      { club_id: clubId, _id: { $ne: formId }, status: "active" },
      { $set: { status: "inactive" } }
    );
  }

  form.status = status;
  await form.save();

  return { _id: form._id, status: form.status };
};

const deleteJoinForm = async ({ clubId, formId }) => {
  if (!isValidId(clubId) || !isValidId(formId)) {
    throw getStatusError("Invalid club ID or form ID", 400);
  }

  const form = await JoinForm.findOne({ _id: formId, club_id: clubId });
  if (!form) {
    throw getStatusError("Join form not found", 404);
  }

  // BR-24: Once a form has received at least one response, disallow deletion
  const responseCount = await JoinRequest.countDocuments({ form_id: formId });
  if (responseCount > 0) {
    throw getStatusError(
      `Cannot delete form that has received ${responseCount} student response(s). ` +
      "The form is locked by business rule BR-24.",
      400
    );
  }

  await JoinForm.deleteOne({ _id: formId, club_id: clubId });
  return { message: "Join form deleted successfully", formId };
};

module.exports = {
  getJoinForm,
  createJoinForm,
  updateJoinForm,
  toggleJoinFormStatus,
  deleteJoinForm,
};
