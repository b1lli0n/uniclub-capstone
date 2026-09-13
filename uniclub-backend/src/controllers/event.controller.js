const eventService = require("../services/event.service");

// ─────────────────────────────────────────────────────────────
// UC: View Public Events (học sinh xem các sự kiện được public)
// GET /api/events/public
// Query: ?clubId=xxx
// ─────────────────────────────────────────────────────────────
const getPublicEvents = async (req, res, next) => {
  try {
    const { clubId } = req.query;
    const events = await eventService.getPublicEvents({ clubId });

    return res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// UC: View Club Events (club member xem hết tất cả sự kiện của club họ tham gia)
// GET /api/member/clubs/:clubId/events
// ─────────────────────────────────────────────────────────────
const getClubEventsForMember = async (req, res, next) => {
  try {
    const { clubId } = req.params;
    const events = await eventService.getClubEventsForMember({
      clubId,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      data: events,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// UC: View Event Detail (chi tiết event, có check roles)
// GET /api/events/:eventId
// ─────────────────────────────────────────────────────────────
const getEventDetail = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const data = await eventService.getEventDetail({
      eventId,
      currentUser: req.user,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// UC: Register for Event (club member đăng ký tham gia sự kiện)
// POST /api/events/:eventId/register
// ─────────────────────────────────────────────────────────────
const registerForEvent = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const reg = await eventService.registerForEvent({
      eventId,
      userId: req.user.id,
      userEmail: req.user.email,
    });

    return res.status(201).json({
      success: true,
      message: "Registered for event successfully",
      data: reg,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// UC: Cancel Event Registration (hủy đăng kí trước khi sự kiện diễn ra)
// POST /api/events/:eventId/cancel
// ─────────────────────────────────────────────────────────────
const cancelEventRegistration = async (req, res, next) => {
  try {
    const { eventId } = req.params;
    const reg = await eventService.cancelEventRegistration({
      eventId,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Event registration cancelled successfully",
      data: reg,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// UC: View Registered Events (học sinh xem các sự kiện đã đăng ký tham gia)
// GET /api/events/my-registrations
// ─────────────────────────────────────────────────────────────
const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await eventService.getMyRegistrations(req.user.id);

    return res.status(200).json({
      success: true,
      data: registrations,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

module.exports = {
  getPublicEvents,
  getClubEventsForMember,
  getEventDetail,
  registerForEvent,
  cancelEventRegistration,
  getMyRegistrations,
};
