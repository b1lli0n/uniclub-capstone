const mongoose = require("mongoose");
const clubService = require("../services/club.services");

const validateClubId = (id) => {
  if (!id) return { message: "Missing club ID" };
  if (!mongoose.isValidObjectId(id)) return { message: "Invalid club ID" };
  return null;
};

const getAllClubs = async (req, res) => {
  try {
    const { category, sortBy, search } = req.query;

    const data = await clubService.getAllClubs({
      category,
      sortBy,
      search,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get all clubs error:", error);

    return res.status(500).json({
      success: false,
      message: "Server error while fetching clubs",
    });
  }
};

const getClubById = async (req, res) => {
  try {
    const err = validateClubId(req.params.id);

    if (err) {
      return res.status(400).json({
        success: false,
        message: err.message,
      });
    }

    const data = await clubService.getClubById(req.params.id);

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get club by id error:", error);

    if (error.statusCode === 404) {
      return res.status(404).json({
        success: false,
        message: error.message || "Club not found",
      });
    }

    if (error.name === "CastError") {
      return res.status(400).json({
        success: false,
        message: "Invalid club ID",
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while fetching club details",
    });
  }
};

const requestCreateClub = async (req, res) => {
  try {
    const requestedBy = req.user.id || req.user._id;

    const { club_name, slogan, category, description, reason, logo_url, member_ids } = req.body;

    const trimmedClubName = (club_name || "").trim();
    const trimmedLogoUrl = (logo_url || "").trim();
    const trimmedSlogan = (slogan || "").trim();
    const effectiveReason = (reason || description || "").trim();
    const effectiveDescription = (description || reason || "").trim();

    if (!trimmedClubName) {
      return res.status(400).json({
        success: false,
        message: "Club name cannot be empty or only spaces",
      });
    }

    if (!trimmedLogoUrl) {
      return res.status(400).json({
        success: false,
        message: "Club logo cannot be empty",
      });
    }

    if (!effectiveReason) {
      return res.status(400).json({
        success: false,
        message: "Club description cannot be empty or only spaces",
      });
    }

    if (!Array.isArray(member_ids)) {
      return res.status(400).json({
        success: false,
        message: "Member List is invalid",
      });
    }

    const data = await clubService.requestCreateClub({
      club_name: trimmedClubName,
      slogan: trimmedSlogan,
      category,
      description: effectiveDescription,
      reason: effectiveReason,
      logo_url: trimmedLogoUrl,
      requested_by: requestedBy,
      member_ids,
    });

    return res.status(201).json({
      success: true,
      message: "Club creation request submitted successfully",
      data,
    });
  } catch (error) {
    console.error("Request create club error:", error);

    if (error.name === "ValidationError") {
      const messages = Object.values(error.errors || {}).map((e) => e.message);
      return res.status(400).json({
        success: false,
        message: messages.join(", ") || "Validation error",
      });
    }

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: error.message || "Server error while submitting club creation request",
    });
  }
};

const getMyClubCreationRequests = async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const data = await clubService.getMyClubCreationRequests(userId);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    console.error("Get my club creation requests error:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching my club creation requests",
    });
  }
};

module.exports = {
  getAllClubs,
  getClubById,
  requestCreateClub,
  getMyClubCreationRequests,
};