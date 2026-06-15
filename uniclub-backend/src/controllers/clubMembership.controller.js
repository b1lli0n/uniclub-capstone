const mongoose = require("mongoose");
const clubMembershipService = require("../services/clubMembership.service");

const throwBadRequest = (message) => {
  throw Object.assign(new Error(message), { statusCode: 400 });
};

const assertValidObjectId = (id, label) => {
  if (!mongoose.Types.ObjectId.isValid(id)) {
    throwBadRequest(`Invalid ${label}`);
  }
};

const getUserId = (req) => {
  const userId = req.user?._id ;

  if (!userId) {
    throw Object.assign(new Error("User ID is required. "), {
      statusCode: 401
    });
  }

  return userId;
};

const getClubJoinForm = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    assertValidObjectId(clubId, "clubId");

    const form = await clubMembershipService.getClubJoinForm(clubId);

    return res.status(200).json({
      success: true,
      message: "Join form retrieved successfully",
      data: form
    });
  } catch (error) {
    next(error);
  }
};

const submitJoinRequest = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const { form_id: formId, answers } = req.body;

    assertValidObjectId(clubId, "clubId");

    if (!formId) {
      throwBadRequest("form_id is required");
    }

    assertValidObjectId(formId, "form_id");

    if (!Array.isArray(answers)) {
      throwBadRequest("Answers must be an array");
    }

    const joinRequest = await clubMembershipService.submitJoinRequest(
      getUserId(req),
      clubId,
      formId,
      answers
    );

    return res.status(201).json({
      success: true,
      message: "Join request submitted successfully",
      data: joinRequest
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClubJoinForm,
  submitJoinRequest
};
