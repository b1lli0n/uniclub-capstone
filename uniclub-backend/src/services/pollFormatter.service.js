const formatPoll = (poll, viewerId) => {
  const doc = typeof poll.toObject === "function" ? poll.toObject() : poll;
  const voteCounts = new Map();

  for (const option of doc.options || []) {
    voteCounts.set(String(option._id), 0);
  }

  for (const vote of doc.votes || []) {
    const optionId = String(vote.option_id);
    voteCounts.set(optionId, (voteCounts.get(optionId) || 0) + 1);
  }

  const viewerVote = viewerId
    ? (doc.votes || []).find((vote) => String(vote.user_id?._id || vote.user_id) === String(viewerId))
    : null;

  let createdBy = doc.created_by;
  if (createdBy && typeof createdBy === "object") {
    const user = createdBy.user_id && typeof createdBy.user_id === "object" ? createdBy.user_id : createdBy;
    createdBy = {
      _id: createdBy._id,
      full_name: user.full_name || createdBy.full_name || "Club Leader",
      avatar_url: user.avatar_url || createdBy.avatar_url || "",
      email: user.email || createdBy.email || "",
      role: createdBy.role || "",
    };
  }

  return {
    _id: doc._id,
    club_id: doc.club_id,
    created_by: createdBy,
    title: doc.title,
    description: doc.description,
    status: doc.status,
    start_at: doc.start_at,
    end_at: doc.end_at,
    closed_at: doc.closed_at,
    createdAt: doc.createdAt,
    updatedAt: doc.updatedAt,
    options: (doc.options || []).map((option) => ({
      _id: option._id,
      text: option.text,
      vote_count: voteCounts.get(String(option._id)) || 0,
    })),
    total_votes: (doc.votes || []).length,
    my_vote: viewerVote
      ? {
          option_id: viewerVote.option_id,
          voted_at: viewerVote.voted_at,
        }
      : null,
  };
};

module.exports = {
  formatPoll,
};
