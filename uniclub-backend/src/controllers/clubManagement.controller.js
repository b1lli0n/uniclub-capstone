const clubService = require("../services/club.service");

const getClubList = async (req, res) => {
  try {
    const data = await clubService.getClubList({
      query: req.query,
      currentUser: req.user,
    });

    return res.status(200).json({
      success: true,
      message: "Club list fetched successfully",
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch club list",
    });
  }
};

const getClubDetail = async (req, res) => {
  try {
    const data = await clubService.getClubDetail({
      clubId: req.params.clubId,
      currentUser: req.user,
    });

    return res.status(200).json({
      success: true,
      message: "Club detail fetched successfully",
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch club detail",
    });
  }
};


const getClubMembers = async (req, res) => {
  try {
    const data = await clubService.getClubMembers({
      clubId: req.params.clubId,
      query: req.query,
    });

    return res.status(200).json({
      success: true,
      message: "Club members fetched successfully",
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to fetch club members",
    });
  }
};

const assignManagementRole = async (req, res) => {
  try {
    const data = await clubService.assignManagementRole({
      clubId: req.params.clubId,
      memberId: req.params.memberId,
      role: req.body.role,
    });

    return res.status(200).json({
      success: true,
      message: "Member role updated successfully",
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update member role",
    });
  }
};

const updateClubStatus = async (req, res) => {
  try {
    const data = await clubService.updateClubStatus({
      clubId: req.params.clubId,
      status: req.body.status,
    });

    return res.status(200).json({
      success: true,
      message: "Club status updated successfully",
      data,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Failed to update club status",
    });
  }
};

// UC-13
const getClubCreationRequestList = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await clubCreationRequestService.getClubCreationRequestList(
        {
          query: req.query,
        }
      );

    return res.status(200).json({
      success: true,
      data: result.requests,
      pagination: result.pagination,
    });
  } catch (error) {
    next(error);
  }
};

// UC-14
const getClubCreationRequestDetail = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await clubCreationRequestService.getClubCreationRequestDetail(
        {
          requestId: req.params.id,
        }
      );

    return res.status(200).json({
      success: true,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

// UC-15
const reviewClubCreationRequest = async (
  req,
  res,
  next
) => {
  try {
    const result =
      await clubCreationRequestService.reviewClubCreationRequest(
        {
          requestId: req.params.id,
          status: req.body.status,
          reviewNote: req.body.review_note,
          reviewerId: req.user._id,
        }
      );

    return res.status(200).json({
      success: true,
      message: `Request ${result.status} successfully`,
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getClubList,
  getClubDetail,
  getClubMembers,
  assignManagementRole,
  updateClubStatus,
  getClubCreationRequestList,
  getClubCreationRequestDetail,
  reviewClubCreationRequest,
};