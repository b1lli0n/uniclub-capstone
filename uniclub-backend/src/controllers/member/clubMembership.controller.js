const clubMembershipService = require("../../services/member/clubMembership.service");

const getUserId = (req) => {
  const userId = req.user?._id;

  if (!userId) {
    throw Object.assign(new Error("User ID is required. "), {
      statusCode: 401
    });
  }

  return userId;
};

const getMyClubs = async (req, res, next) => {
  try {
    const memberships = await clubMembershipService.getMyClubs(getUserId(req));

    return res.status(200).json({
      success: true,
      message: "My clubs retrieved successfully",
      data: memberships
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMyClubs
};
