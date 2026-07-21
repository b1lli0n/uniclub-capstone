const eventAttendanceService = require("../services/eventAttendance.service");

const getAttendanceList = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { search } = req.query;

    const data = await eventAttendanceService.getAttendanceList({
      eventId,
      userId: req.user.id,
      search,
    });

    return res.status(200).json({
      success: true,
      message: "Attendance list fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Get attendance list error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server error while fetching attendance list",
    });
  }
};

const updateAttendanceStatus = async (req, res) => {
  try {
    const { eventId } = req.params;

    const data = await eventAttendanceService.updateAttendanceStatus({
      eventId,
      userId: req.user.id,
      target: req.body.target,
      check_in_status: req.body.check_in_status,
      registration_id: req.body.registration_id,
      status: req.body.status,
    });

    return res.status(200).json({
      success: true,
      message: "Attendance status updated successfully",
      data,
    });
  } catch (error) {
    console.error("Update attendance status error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server error while updating attendance status",
    });
  }
};

const autoMarkAbsentAfterEventEnd = async (req, res) => {
  try {
    const { eventId } = req.params;

    const data = await eventAttendanceService.autoMarkAbsentAfterEventEnd({
      eventId,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Absent participants marked successfully",
      data,
    });
  } catch (error) {
    console.error("Auto mark absent error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server error while marking absent participants",
    });
  }
};

module.exports = {
  getAttendanceList,
  updateAttendanceStatus,
  autoMarkAbsentAfterEventEnd,
};