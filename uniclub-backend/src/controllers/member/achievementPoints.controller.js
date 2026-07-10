const achievementPointsService = require("../../services/member/achievementPoints.service");

const getLeaderboard = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const data = await achievementPointsService.getLeaderboard(clubId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getActivePointRules = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const data = await achievementPointsService.getActivePointRules(clubId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const getMyContributionLogs = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const userId = req.user.id;
    const { page, limit } = req.query;

    const data = await achievementPointsService.getMyContributionLogs(userId, clubId, {
      page: page ? parseInt(page) : 1,
      limit: limit ? parseInt(limit) : 10,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getLeaderboard,
  getActivePointRules,
  getMyContributionLogs,
};
