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

    const { club_name, description, reason, logo_url, member_ids } = req.body;

    if (!club_name || !reason || !logo_url) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields: name, reason, logo",
      });
    }

    if (!Array.isArray(member_ids)) {
      return res.status(400).json({
        success: false,
        message: "Member List is invalid",
      });
    }

    const data = await clubService.requestCreateClub({
      club_name,
      description,
      reason,
      logo_url,
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

    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Server error while submitting club creation request",
    });
  }
};

module.exports = {
  getAllClubs,
  getClubById,
  requestCreateClub,
};