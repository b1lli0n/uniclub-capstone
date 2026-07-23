const mongoose = require("mongoose");
const pollService = require("../../services/member/poll.service");
const { getStatusError } = require("../../utils/error");

const validateObjectId = (value, name) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw getStatusError(`Invalid ${name}`, 400);
  }
};

const getPollList = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const { status, search, page, limit } = req.query;

    validateObjectId(clubId, "clubId");

    const data = await pollService.getPollList(clubId, req.user.id, {
      status,
      search,
      page,
      limit,
    });

    return res.status(200).json({
      success: true,
      message: "Poll list retrieved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getPollDetail = async (req, res, next) => {
  try {
    const { clubId, pollId } = req.params;

    validateObjectId(clubId, "clubId");
    validateObjectId(pollId, "pollId");

    const data = await pollService.getPollDetail(clubId, pollId, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Poll detail retrieved successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const votePoll = async (req, res, next) => {
  try {
    const { clubId, pollId } = req.params;
    const { option_id: optionId } = req.body;

    validateObjectId(clubId, "clubId");
    validateObjectId(pollId, "pollId");

    if (!optionId || !mongoose.Types.ObjectId.isValid(optionId)) {
      return next(getStatusError("Valid option_id is required", 400));
    }

    const data = await pollService.votePoll(clubId, pollId, req.user.id, optionId);

    return res.status(200).json({
      success: true,
      message: "Poll voted successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPollList,
  getPollDetail,
  votePoll,
};
