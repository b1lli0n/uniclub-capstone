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

const votePoll = async (clubId, pollId, userId, optionId) => {
  const poll = await Poll.findOne({ _id: pollId, club_id: clubId });

  if (!poll) {
    throw getStatusError("Poll not found", 404);
  }

  const now = new Date();

  if (poll.status !== "open") {
    throw getStatusError("Poll is closed", 400);
  }

  if (poll.start_at && poll.start_at > now) {
    throw getStatusError("Poll has not started yet", 400);
  }

  if (poll.end_at && poll.end_at < now) {
    poll.status = "closed";
    poll.closed_at = poll.closed_at || now;
    await poll.save();
    throw getStatusError("Poll is closed", 400);
  }

  const optionExists = poll.options.some((option) => String(option._id) === String(optionId));

  if (!optionExists) {
    throw getStatusError("Invalid option_id", 400);
  }

  const existingVoteIndex = poll.votes.findIndex((vote) => String(vote.user_id) === String(userId));

  if (existingVoteIndex !== -1) {
    const existingVote = poll.votes[existingVoteIndex];
    if (String(existingVote.option_id) === String(optionId)) {
      // User clicked their currently voted option -> cancel/unvote
      poll.votes.splice(existingVoteIndex, 1);
    } else {
      // User switched their vote to another option
      existingVote.option_id = optionId;
      existingVote.voted_at = now;
    }
  } else {
    poll.votes.push({
      user_id: userId,
      option_id: optionId,
      voted_at: now,
    });
  }

  await poll.save();

  const updatedPoll = await Poll.findById(poll._id)
    .populate("created_by", "_id full_name email avatar_url")
    .populate("club_id", "_id name logo_url");

  return formatPoll(updatedPoll, userId);
};

module.exports = {
  getPollList,
  getPollDetail,
  votePoll,
};
