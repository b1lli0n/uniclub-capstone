const Poll = require("../../models/poll.model");
const { getStatusError } = require("../../utils/error");
const { formatPoll } = require("../pollFormatter.service");

const parsePositiveInt = (value, fallback) => {
  const parsed = parseInt(value, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback;
};

const closeExpiredPolls = async (clubId) => {
  const now = new Date();

  await Poll.updateMany(
    {
      club_id: clubId,
      status: "open",
      end_at: { $ne: null, $lt: now },
    },
    {
      $set: {
        status: "closed",
        closed_at: now,
      },
    }
  );
};

const buildPollQuery = (clubId, filters = {}) => {
  const { status, search } = filters;
  const query = { club_id: clubId };

  if (status && ["open", "closed"].includes(status)) {
    query.status = status;
  }

  if (search) {
    query.title = { $regex: search, $options: "i" };
  }

  return query;
};

const normalizeOptions = (options) => {
  const normalized = options.map((option) => {
    if (typeof option === "string") {
      return { text: option.trim() };
    }

    return { text: option.text.trim() };
  });

  const uniqueTexts = new Set(normalized.map((option) => option.text.toLowerCase()));

  if (uniqueTexts.size !== normalized.length) {
    throw getStatusError("Poll options must be unique", 400);
  }

  return normalized;
};

const validatePollDates = (startAt, endAt) => {
  if (startAt && Number.isNaN(new Date(startAt).getTime())) {
    throw getStatusError("Invalid start_at", 400);
  }

  if (endAt && Number.isNaN(new Date(endAt).getTime())) {
    throw getStatusError("Invalid end_at", 400);
  }

  if (startAt && endAt && new Date(startAt) >= new Date(endAt)) {
    throw getStatusError("end_at must be after start_at", 400);
  }
};

const getPollList = async (clubId, userId, filters = {}) => {
  await closeExpiredPolls(clubId);

  const page = parsePositiveInt(filters.page, 1);
  const limit = parsePositiveInt(filters.limit, 10);
  const query = buildPollQuery(clubId, filters);

  const [polls, total] = await Promise.all([
    Poll.find(query)
      .populate("created_by", "_id full_name avatar_url")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit),
    Poll.countDocuments(query),
  ]);

  return {
    polls: polls.map((poll) => formatPoll(poll, userId)),
    pagination: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit) || 0,
    },
  };
};

const getPollDetail = async (clubId, pollId, userId) => {
  await closeExpiredPolls(clubId);

  const poll = await Poll.findOne({ _id: pollId, club_id: clubId })
    .populate("created_by", "_id full_name email avatar_url")
    .populate("club_id", "_id name logo_url");

  if (!poll) {
    throw getStatusError("Poll not found", 404);
  }

  return formatPoll(poll, userId);
};

const createPoll = async (clubId, userId, payload) => {
  const {
    title,
    description = "",
    options,
    start_at: startAt,
    end_at: endAt,
  } = payload;

  validatePollDates(startAt, endAt);

  const poll = await Poll.create({
    club_id: clubId,
    created_by: userId,
    title: title.trim(),
    description: description.trim(),
    options: normalizeOptions(options),
    start_at: startAt ? new Date(startAt) : new Date(),
    end_at: endAt ? new Date(endAt) : null,
    status: "open",
  });

  const createdPoll = await Poll.findById(poll._id)
    .populate("created_by", "_id full_name email avatar_url")
    .populate("club_id", "_id name logo_url");

  return formatPoll(createdPoll, userId);
};

const updatePoll = async (clubId, pollId, payload, userId) => {
  await closeExpiredPolls(clubId);

  const poll = await Poll.findOne({ _id: pollId, club_id: clubId });

  if (!poll) {
    throw getStatusError("Poll not found", 404);
  }

  if (poll.status === "closed") {
    throw getStatusError("Closed poll cannot be updated", 400);
  }

  const {
    title,
    description,
    options,
    start_at: startAt,
    end_at: endAt,
  } = payload;

  const nextStartAt = startAt !== undefined ? startAt : poll.start_at;
  const nextEndAt = endAt !== undefined ? endAt : poll.end_at;
  validatePollDates(nextStartAt, nextEndAt);

  if (title !== undefined) {
    poll.title = title.trim();
  }

  if (description !== undefined) {
    poll.description = description.trim();
  }

  if (options !== undefined) {
    if (poll.votes.length > 0) {
      throw getStatusError("Cannot update options after members have voted", 400);
    }
    poll.options = normalizeOptions(options);
  }

  if (startAt !== undefined) {
    poll.start_at = startAt ? new Date(startAt) : null;
  }

  if (endAt !== undefined) {
    poll.end_at = endAt ? new Date(endAt) : null;
  }

  await poll.save();

  const updatedPoll = await Poll.findById(poll._id)
    .populate("created_by", "_id full_name email avatar_url")
    .populate("club_id", "_id name logo_url");

  return formatPoll(updatedPoll, userId);
};

const closePoll = async (clubId, pollId, userId) => {
  await closeExpiredPolls(clubId);

  const poll = await Poll.findOne({ _id: pollId, club_id: clubId });

  if (!poll) {
    throw getStatusError("Poll not found", 404);
  }

  if (poll.status !== "closed") {
    poll.status = "closed";
    poll.closed_at = new Date();
    await poll.save();
  }

  const closedPoll = await Poll.findById(poll._id)
    .populate("created_by", "_id full_name email avatar_url")
    .populate("club_id", "_id name logo_url");

  return formatPoll(closedPoll, userId);
};

module.exports = {
  getPollList,
  getPollDetail,
  createPoll,
  updatePoll,
  closePoll,
};
