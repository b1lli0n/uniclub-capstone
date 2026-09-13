const mongoose = require("mongoose");
const pollService = require("../../services/secretary/poll.service");
const { getStatusError } = require("../../utils/error");

const validateObjectId = (value, name) => {
  if (!mongoose.Types.ObjectId.isValid(value)) {
    throw getStatusError(`Invalid ${name}`, 400);
  }
};

const validateOptions = (options) => {
  if (!Array.isArray(options) || options.length < 2) {
    throw getStatusError("options must contain at least 2 items", 400);
  }

  const hasInvalidOption = options.some((option) => {
    if (typeof option === "string") {
      return !option.trim();
    }

    return !option || typeof option.text !== "string" || !option.text.trim();
  });

  if (hasInvalidOption) {
    throw getStatusError("Each option must be a non-empty string or text object", 400);
  }
};

const validateDate = (value, name) => {
  if (value !== undefined && value !== null && value !== "" && Number.isNaN(new Date(value).getTime())) {
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

const createPoll = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const {
      title,
      description,
      options,
      start_at: startAt,
      end_at: endAt,
    } = req.body;

    validateObjectId(clubId, "clubId");

    if (!title || typeof title !== "string" || !title.trim()) {
      return next(getStatusError("title is required", 400));
    }

    if (description !== undefined && typeof description !== "string") {
      return next(getStatusError("description must be a string", 400));
    }

    validateOptions(options);
    validateDate(startAt, "start_at");
    validateDate(endAt, "end_at");

    const data = await pollService.createPoll(clubId, req.user.id, {
      title,
      description,
      options,
      start_at: startAt,
      end_at: endAt,
    });

    return res.status(201).json({
      success: true,
      message: "Poll created successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const updatePoll = async (req, res, next) => {
  try {
    const { clubId, pollId } = req.params;
    const {
      title,
      description,
      options,
      start_at: startAt,
      end_at: endAt,
    } = req.body;

    validateObjectId(clubId, "clubId");
    validateObjectId(pollId, "pollId");

    if (title !== undefined && (typeof title !== "string" || !title.trim())) {
      return next(getStatusError("title must be a non-empty string", 400));
    }

    if (description !== undefined && typeof description !== "string") {
      return next(getStatusError("description must be a string", 400));
    }

    if (options !== undefined) {
      validateOptions(options);
    }

    validateDate(startAt, "start_at");
    validateDate(endAt, "end_at");

    const data = await pollService.updatePoll(
      clubId,
      pollId,
      {
        title,
        description,
        options,
        start_at: startAt,
        end_at: endAt,
      },
      req.user.id
    );

    return res.status(200).json({
      success: true,
      message: "Poll updated successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

const closePoll = async (req, res, next) => {
  try {
    const { clubId, pollId } = req.params;

    validateObjectId(clubId, "clubId");
    validateObjectId(pollId, "pollId");

    const data = await pollService.closePoll(clubId, pollId, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Poll closed successfully",
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPollList,
  getPollDetail,
  createPoll,
  updatePoll,
  closePoll,
};
