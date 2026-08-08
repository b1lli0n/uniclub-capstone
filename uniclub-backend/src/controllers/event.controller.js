const mongoose = require("mongoose");
const Event = require("../models/event.model");
const EventRegistration = require("../models/event_registration.model");
const ClubMember = require("../models/club_member.model");
const { getStatusError } = require("../utils/error");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

// ─────────────────────────────────────────────────────────────
// UC: View Public Events (học sinh xem các sự kiện được public)
// GET /api/events/public
// Query: ?clubId=xxx
// ─────────────────────────────────────────────────────────────
const getPublicEvents = async (req, res, next) => {
  try {
    const { clubId } = req.query;
    const filter = {
      is_public: true,
      progress_status: "completed",
    };

    if (clubId) {
      if (!isValidId(clubId)) {
        return res.status(400).json({ success: false, message: "Invalid club ID" });
      }
      filter.club_id = clubId;
    }

    const events = await Event.find(filter)
      .sort({ start_time: 1 })
      .populate("club_id", "name logo_url")
      .lean();

    return res.status(200).json({ success: true, data: events });
  } catch (error) {
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

    if (!isValidId(clubId)) {
      return res.status(400).json({ success: false, message: "Invalid club ID" });
    }

    // Check membership
    const membership = await ClubMember.findOne({
      user_id: req.user.id,
      club_id: clubId,
      status: "active",
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "You are not an active member of this club",
      });
    }

    // Lấy tất cả event đã xuất bản (progress_status: completed) của club
    const events = await Event.find({
      club_id: clubId,
      progress_status: "completed",
    })
      .sort({ start_time: 1 })
      .lean();

    return res.status(200).json({ success: true, data: events });
  } catch (error) {
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

    if (!isValidId(eventId)) {
      return res.status(400).json({ success: false, message: "Invalid event ID" });
    }

    const event = await Event.findById(eventId)
      .populate("club_id", "name logo_url")
      .lean();

    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // Check roles/visibility nếu event là private
    if (!event.is_public) {
      if (!req.user) {
        return res.status(401).json({
          success: false,
          message: "Authentication required to view private event details",
        });
      }

      const membership = await ClubMember.findOne({
        user_id: req.user.id,
        club_id: event.club_id._id || event.club_id,
        status: "active",
      });

      if (!membership) {
        return res.status(403).json({
          success: false,
          message: "This is a private event. Only club members can view details.",
        });
      }
    }

    // Lấy thông tin đăng ký của user hiện tại (nếu đã đăng nhập)
    let isRegistered = false;
    let registrationStatus = null;
    let registrationId = null;

    if (req.user?.id) {
      const reg = await EventRegistration.findOne({
        event_id: eventId,
        user_id: req.user.id,
      }).lean();

      if (reg) {
        // user is registered if registration is approved, attended or pending approval
        isRegistered = ["pending", "approved", "attended", "registered"].includes(reg.status);
        registrationStatus = reg.status;
        registrationId = reg._id;
      }
    }

    // Đếm số lượng slot đã đăng ký thực tế
    const registeredCount = await EventRegistration.countDocuments({
      event_id: eventId,
      status: { $in: ["approved", "registered", "attended"] },
    });

    return res.status(200).json({
      success: true,
      data: {
        ...event,
        isRegistered,
        registrationStatus,
        registrationId,
        registeredCount,
      },
    });
  } catch (error) {
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

    if (!isValidId(eventId)) {
      return res.status(400).json({ success: false, message: "Invalid event ID" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // 1. Kiểm tra trạng thái đăng ký của event
    if (event.status !== "opening") {
      return res.status(400).json({
        success: false,
        message: `Event registration is not open (status: ${event.status})`,
      });
    }

    // 2. Kiểm tra thời gian sự kiện diễn ra
    if (new Date() > new Date(event.start_time)) {
      return res.status(400).json({
        success: false,
        message: "Cannot register because the event has already started",
      });
    }

    // 3. Kiểm tra membership (phải là member của club host)
    const membership = await ClubMember.findOne({
      user_id: req.user.id,
      club_id: event.club_id,
      status: "active",
    });

    if (!membership) {
      return res.status(403).json({
        success: false,
        message: "Only active members of this club can register for this event",
      });
    }

    // 4. Kiểm tra giới hạn số lượng (capacity)
    const registeredCount = await EventRegistration.countDocuments({
      event_id: eventId,
      status: { $in: ["approved", "registered", "attended"] },
    });

    if (registeredCount >= event.capacity) {
      return res.status(400).json({
        success: false,
        message: "Event capacity has been reached",
      });
    }

    // 5. Tiến hành lưu đăng ký (upsert)
    let reg = await EventRegistration.findOne({
      event_id: eventId,
      user_id: req.user.id,
    });

    if (reg) {
      if (["pending", "approved", "attended", "registered"].includes(reg.status)) {
        return res.status(400).json({
          success: false,
          message: "You have already registered for this event",
        });
      }
      reg.status = "registered";
      reg.registered_at = new Date();
      await reg.save();
    } else {
      reg = await EventRegistration.create({
        event_id: eventId,
        user_id: req.user.id,
        status: "registered",
        registered_at: new Date(),
      });
    }

    return res.status(201).json({
      success: true,
      message: "Registered for event successfully",
      data: reg,
    });
  } catch (error) {
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

    if (!isValidId(eventId)) {
      return res.status(400).json({ success: false, message: "Invalid event ID" });
    }

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: "Event not found" });
    }

    // 1. Kiểm tra thời gian (chỉ được huỷ trước khi bắt đầu)
    if (new Date() > new Date(event.start_time)) {
      return res.status(400).json({
        success: false,
        message: "Cannot cancel registration after the event has started",
      });
    }

    // 2. Tìm bản ghi đăng ký hiện tại
    const reg = await EventRegistration.findOne({
      event_id: eventId,
      user_id: req.user.id,
      status: { $in: ["pending", "approved", "registered"] },
    });

    if (!reg) {
      return res.status(400).json({
        success: false,
        message: "No active registration found for this event",
      });
    }

    reg.status = "cancelled";
    await reg.save();

    return res.status(200).json({
      success: true,
      message: "Event registration cancelled successfully",
      data: reg,
    });
  } catch (error) {
    next(error);
  }
};

// ─────────────────────────────────────────────────────────────
// UC: View Registered Events (học sinh xem các sự kiện đã đăng ký tham gia)
// GET /api/events/my-registrations
// ─────────────────────────────────────────────────────────────
const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await EventRegistration.find({ user_id: req.user.id })
      .populate({
        path: "event_id",
        populate: {
          path: "club_id",
          select: "name logo_url"
        }
      })
      .sort({ registered_at: -1 })
      .lean();

    return res.status(200).json({ success: true, data: registrations });
  } catch (error) {
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
