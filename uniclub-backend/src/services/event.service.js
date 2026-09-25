const mongoose = require("mongoose");
const Event = require("../models/event.model");
const EventRegistration = require("../models/event_registration.model");
const ClubMember = require("../models/club_member.model");
const Club = require("../models/club.model");
const User = require("../models/user.model");
const { getStatusError } = require("../utils/error");
const { awardRewardPoints } = require("./pointsAward.helper");
const { sendEventTicketEmail } = require("./email.service");

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id);

const getPublicEvents = async ({ clubId } = {}) => {
  const filter = {
    is_public: true,
    progress_status: "completed",
    status: { $ne: "cancelled" },
  };

  if (clubId) {
    if (!isValidId(clubId)) {
      throw getStatusError("Invalid club ID", 400);
    }
    filter.club_id = clubId;
  }

  const events = await Event.find(filter)
    .sort({ start_time: 1 })
    .populate("club_id", "name logo_url")
    .lean();

  return events;
};

const getClubEventsForMember = async ({ clubId, userId }) => {
  if (!isValidId(clubId)) {
    throw getStatusError("Invalid club ID", 400);
  }

  const membership = await ClubMember.findOne({
    user_id: userId,
    club_id: clubId,
    status: "active",
  });

  if (!membership) {
    throw getStatusError("You are not an active member of this club", 403);
  }

  const events = await Event.find({
    club_id: clubId,
    progress_status: "completed",
    status: { $ne: "cancelled" },
  })
    .sort({ start_time: -1 })
    .lean();

  return events;
};

const getEventDetail = async ({ eventId, currentUser }) => {
  if (!isValidId(eventId)) {
    throw getStatusError("Invalid event ID", 400);
  }

  const event = await Event.findById(eventId)
    .populate("club_id", "name logo_url")
    .lean();

  if (!event) {
    throw getStatusError("Event not found", 404);
  }

  // If event is in draft mode, only club managers can view details
  const clubId = event.club_id?._id || event.club_id;

  if (event.progress_status === "draft") {
    let canViewDraft = false;
    if (currentUser?.id && clubId) {
      const membership = await ClubMember.findOne({
        user_id: currentUser.id,
        club_id: clubId,
        status: "active",
      });
      if (
        membership &&
        ["president", "event_manager", "secretary", "treasurer", "leader"].includes(
          membership.role
        )
      ) {
        canViewDraft = true;
      }
    }
    if (!canViewDraft) {
      throw getStatusError("Event is in draft mode and not published yet", 404);
    }
  }

  // Check roles/visibility if event is private
  if (!event.is_public) {
    if (!currentUser) {
      throw getStatusError("Authentication required to view private event details", 401);
    }

    const membership = clubId
      ? await ClubMember.findOne({
          user_id: currentUser.id,
          club_id: clubId,
          status: "active",
        })
      : null;

    if (!membership) {
      throw getStatusError("This is a private event. Only club members can view details.", 403);
    }
  }

  let isRegistered = false;
  let registrationStatus = null;
  let registrationId = null;

  if (currentUser?.id) {
    const reg = await EventRegistration.findOne({
      event_id: eventId,
      user_id: currentUser.id,
    }).lean();

    if (reg) {
      isRegistered = ["pending", "approved", "attended", "registered"].includes(reg.status);
      registrationStatus = reg.status;
      registrationId = reg._id;
    }
  }

  const registeredCount = await EventRegistration.countDocuments({
    event_id: eventId,
    status: { $in: ["approved", "registered", "attended"] },
  });

  const availableSlots = Math.max(0, (event.capacity || 0) - registeredCount);

  return {
    ...event,
    isRegistered,
    registrationStatus,
    registrationId,
    registeredCount,
    availableSlots,
    available_slots: availableSlots,
  };
};

const registerForEvent = async ({ eventId, userId, userEmail }) => {
  if (!isValidId(eventId)) {
    throw getStatusError("Invalid event ID", 400);
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw getStatusError("Event not found", 404);
  }

  // 1. Check event cancellation, draft mode, and status (BR-25)
  if (event.progress_status === "draft") {
    throw getStatusError("Event is in draft mode and not open for registration", 400);
  }

  if (event.status !== "coming_soon") {
    if (event.status === "cancelled") {
      throw getStatusError("Cannot register for a cancelled event", 400);
    }
    if (event.status === "closed") {
      throw getStatusError("Event registration is closed", 400);
    }
    throw getStatusError("Registration is only open when event status is coming soon", 400);
  }

  // 2. Check event start and end time
  const now = new Date();
  if (event.start_time && now >= new Date(event.start_time)) {
    throw getStatusError("Cannot register because the event has already started", 400);
  }

  if (event.end_time && now >= new Date(event.end_time)) {
    throw getStatusError("Cannot register because the event has ended", 400);
  }

  // 3. Check membership if private
  if (!event.is_public) {
    const membership = await ClubMember.findOne({
      user_id: userId,
      club_id: event.club_id,
      status: "active",
    });

    if (!membership) {
      throw getStatusError("Only active members of this club can register for this event", 403);
    }
  }

  // 4. Check capacity (Available_Slots > 0)
  const registeredCount = await EventRegistration.countDocuments({
    event_id: eventId,
    status: { $in: ["approved", "registered", "attended"] },
  });

  const availableSlots = (event.capacity || 0) - registeredCount;
  if (availableSlots <= 0) {
    throw getStatusError("Event capacity has been reached. No available slots left.", 400);
  }

  // 5. Upsert registration
  let reg = await EventRegistration.findOne({
    event_id: eventId,
    user_id: userId,
  });

  if (reg) {
    if (["pending", "approved", "attended", "registered"].includes(reg.status)) {
      throw getStatusError("You have already registered for this event", 400);
    }
    reg.status = "registered";
    reg.registered_at = new Date();
    await reg.save();
  } else {
    reg = await EventRegistration.create({
      event_id: eventId,
      user_id: userId,
      status: "registered",
      registered_at: new Date(),
    });
  }

  // Points award hook
  try {
    let awardRes = await awardRewardPoints({
      clubId: event.club_id,
      userId,
      actionTypeCode: "register_event",
      eventId: event._id,
    });

    if (awardRes && !awardRes.success && awardRes.reason === "rule_not_found") {
      await awardRewardPoints({
        clubId: event.club_id,
        userId,
        actionTypeCode: "attendance",
        eventId: event._id,
      });
    }
  } catch (ptsErr) {
    console.error("Points award error on registration:", ptsErr);
  }

  // Ticket QR Email
  try {
    const clubDoc = await Club.findById(event.club_id);
    const userDoc = await User.findById(userId);

    if (userDoc?.email) {
      const ticketCode = `UC-EVT-${reg._id.toString().substring(18).toUpperCase()}`;
      const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=250x250&data=${reg._id}`;

      sendEventTicketEmail({
        toEmail: userDoc.email,
        userName: userDoc.full_name || userEmail || "UniClub Student",
        clubName: clubDoc?.name || "Club",
        eventTitle: event.title,
        eventDate: event.start_time,
        eventLocation: event.location || "Hall A101",
        ticketCode,
        qrCodeUrl,
      });
    }
  } catch (ticketEmailErr) {
    console.error("Failed to send ticket email:", ticketEmailErr);
  }

  return reg;
};

const cancelEventRegistration = async ({ eventId, userId }) => {
  if (!isValidId(eventId)) {
    throw getStatusError("Invalid event ID", 400);
  }

  const event = await Event.findById(eventId);
  if (!event) {
    throw getStatusError("Event not found", 404);
  }

  if (["completed", "cancelled"].includes(event.status)) {
    throw getStatusError("Cannot cancel registration for a completed or cancelled event", 400);
  }

  // BR-27: Students may cancel free event registrations at least 24 hours prior to the event start time
  const now = new Date();
  const startTime = new Date(event.start_time);
  const cancellationDeadline = new Date(startTime.getTime() - 24 * 60 * 60 * 1000);

  if (now > cancellationDeadline) {
    throw getStatusError(
      "Event registration can only be cancelled at least 24 hours prior to the event start time.",
      400
    );
  }

  const reg = await EventRegistration.findOne({
    event_id: eventId,
    user_id: userId,
    status: { $in: ["pending", "approved", "registered"] },
  });

  if (!reg) {
    throw getStatusError("No active registration found for this event", 400);
  }

  if (reg.checked_in || reg.status === "attended") {
    throw getStatusError("Cannot cancel registration after check-in", 400);
  }

  reg.status = "cancelled";
  await reg.save();

  return reg;
};

const getMyRegistrations = async (userId) => {
  const registrations = await EventRegistration.find({ user_id: userId })
    .populate({
      path: "event_id",
      populate: {
        path: "club_id",
        select: "name logo_url",
      },
    })
    .sort({ registered_at: -1 })
    .lean();

  return registrations;
};

module.exports = {
  getPublicEvents,
  getClubEventsForMember,
  getEventDetail,
  registerForEvent,
  cancelEventRegistration,
  getMyRegistrations,
};
