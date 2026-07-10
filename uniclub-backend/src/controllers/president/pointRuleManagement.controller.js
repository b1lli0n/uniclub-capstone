const pointRuleManagementService = require("../../services/president/pointRuleManagement.service");

const getPointRules = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const data = await pointRuleManagementService.getPointRules(clubId);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

const createPointRule = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const presidentId = req.user.id;
    const rule = await pointRuleManagementService.createPointRule(presidentId, clubId, req.body);

    return res.status(201).json({
      success: true,
      message: "Point rule created successfully",
      data: rule,
    });
  } catch (error) {
    next(error);
  }
};

const updatePointRule = async (req, res, next) => {
  try {
    const { clubId, ruleId } = req.params;
    const presidentId = req.user.id;
    const rule = await pointRuleManagementService.updatePointRule(presidentId, clubId, ruleId, req.body);

    return res.status(200).json({
      success: true,
      message: "Point rule updated successfully",
      data: rule,
    });
  } catch (error) {
    next(error);
  }
};

const togglePointRuleStatus = async (req, res, next) => {
  try {
    const { clubId, ruleId } = req.params;
    const presidentId = req.user.id;
    const { is_active } = req.body;

    if (is_active === undefined) {
      return res.status(400).json({
        success: false,
        message: "is_active field is required",
      });
    }

    const rule = await pointRuleManagementService.togglePointRuleStatus(
      presidentId,
      clubId,
      ruleId,
      is_active
    );

    return res.status(200).json({
      success: true,
      message: `Point rule ${is_active ? "activated" : "deactivated"} successfully`,
      data: rule,
    });
  } catch (error) {
    next(error);
  }
};

const awardPoints = async (req, res, next) => {
  try {
    const { clubId, memberId } = req.params;
    const presidentId = req.user.id;
    const result = await pointRuleManagementService.awardPointsManually(
      presidentId,
      clubId,
      memberId,
      req.body
    );

    return res.status(200).json({
      success: true,
      message: "Points awarded successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getPointRules,
  createPointRule,
  updatePointRule,
  togglePointRuleStatus,
  awardPoints,
};
