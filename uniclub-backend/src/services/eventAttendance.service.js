const mongoose = require("mongoose");
const Event = require("../models/event.model");
const EventRegistration = require("../models/event_registration.model");
const ClubMember = require("../models/club_member.model");

const ATTENDANCE_MANAGE_ROLES = ["president", "leader", "secretary", "event_manager"];

const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const createError = (message, statusCode = 400) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

const validateObjectId = (id, fieldName) => {
  if (!id) {
    throw createError(`${fieldName} is required`, 400);
  }

  if (!isValidObjectId(id)) {
    throw createError(`Invalid ${fieldName}`, 400);
  }
};

const getEventById = async (eventId) => {
  validateObjectId(eventId, "event ID");

  const event = await Event.findById(eventId);

  if (!event) {
    throw createError("Event not found", 404);
  }

  return event;
};

const checkAttendanceManagePermission = async ({ event, userId }) => {
  validateObjectId(userId, "user ID");

  const isEventCreator = event.created_by.toString() === userId.toString();

  if (isEventCreator) {
    return true;
  }

  const clubMember = await ClubMember.findOne({
    club_id: event.club_id,
    user_id: userId,
    status: "active",
  });

  if (!clubMember) {
    throw createError("You are not an active member of this club", 403);
  }

  if (!ATTENDANCE_MANAGE_ROLES.includes(clubMember.role)) {
    throw createError("You do not have permission to manage attendance", 403);
  }

  return true;
};

const buildAttendanceRow = (registration) => {
  const user = registration.user_id;

  return {
    registration_id: registration._id,
    user: user
      ? {
          _id: user._id,
          full_name: user.full_name,
          email: user.email,
          avatar_url: user.avatar_url,
        }
      : null,
    status: registration.status,
    check_in_time: registration.check_in_time,
    checked_in_by: registration.checked_in_by,
    registered_at: registration.registered_at,
  };
};

const getAttendanceList = async ({ eventId, userId, search }) => {
  const event = await getEventById(eventId);

  await checkAttendanceManagePermission({
    event,
    userId,
  });

  let registrations = await EventRegistration.find({
    event_id: eventId,
    status: { $ne: "cancelled" },
  })
    .populate("user_id", "full_name email avatar_url")
    .sort({ registered_at: 1 })
    .select("-__v");

  if (search && search.trim()) {
    const keyword = search.trim().toLowerCase();

    registrations = registrations.filter((registration) => {
      const user = registration.user_id;

      return (
        user?.full_name?.toLowerCase().includes(keyword) ||
        user?.email?.toLowerCase().includes(keyword)
      );
    });
  }

  const totalRegistrations = registrations.length;

  const waitingCheckIn = registrations.filter(
    (registration) => registration.status === "registered"
  ).length;

  const checkedIn = registrations.filter(
    (registration) => registration.status === "attended"
  ).length;

  const absent = registrations.filter(
    (registration) => registration.status === "absent"
  ).length;

  return {
    event: {
      _id: event._id,
      title: event.title,
      start_time: event.start_time,
      end_time: event.end_time,
      check_in_status: event.check_in_status,
    },
    summary: {
      total_registrations: totalRegistrations,
      waiting_check_in: waitingCheckIn,
      checked_in: checkedIn,
      absent,
    },
    attendance: registrations.map(buildAttendanceRow),
  };
};

const updateAttendanceStatus = async ({
  eventId,
  userId,
  target,
  check_in_status,
  registration_id,
  status,
}) => {
  const event = await getEventById(eventId);

  await checkAttendanceManagePermission({
    event,
    userId,
  });

  const resolvedTarget =
    target || (check_in_status !== undefined ? "event" : "registration");

  if (resolvedTarget === "event") {
    const allowedCheckInStatuses = ["not_open", "open", "closed"];

    if (!allowedCheckInStatuses.includes(check_in_status)) {
      throw createError("Invalid check-in status", 400);
    }

    if (event.status === "cancelled") {
      throw createError("Cannot update check-in status of a cancelled event", 400);
    }

    event.check_in_status = check_in_status;

    await event.save();

    return {
      target: "event",
      event_id: event._id,
      check_in_status: event.check_in_status,
    };
  }

  if (resolvedTarget === "registration") {
    validateObjectId(registration_id, "registration ID");

    const allowedAttendanceStatuses = ["registered", "attended", "absent"];

    if (!allowedAttendanceStatuses.includes(status)) {
      throw createError("Invalid attendance status", 400);
    }

    if (event.check_in_status !== "open") {
      throw createError("Check-in is not open", 400);
    }

    const registration = await EventRegistration.findOne({
      _id: registration_id,
      event_id: eventId,
    });

    if (!registration) {
      throw createError("Registration not found", 404);
    }

    if (registration.status === "cancelled") {
      throw createError("Cannot update a cancelled registration", 400);
    }

    registration.status = status;

    if (status === "attended") {
      registration.check_in_time = new Date();
      registration.checked_in_by = userId;
    }

    if (status === "registered" || status === "absent") {
      registration.check_in_time = null;
      registration.checked_in_by = null;
    }

    await registration.save();

    if (status === "attended") {
      try {
        const { awardRewardPoints } = require("./pointsAward.helper");
        let awarded = await awardRewardPoints({
          clubId: event.club_id,
          userId: registration.user_id,
          actionTypeCode: "checkin",
          eventId: event._id,
          presidentId: userId,
        });

        if (!awarded) {
          await awardRewardPoints({
            clubId: event.club_id,
            userId: registration.user_id,
            actionTypeCode: "attendance",
            eventId: event._id,
            presidentId: userId,
          });
        }
      } catch (err) {
        console.error("[Points Hook] Failed to award attendance points:", err);
      }
    }

    return {
      target: "registration",
      registration,
    };
  }

  throw createError("Invalid update target", 400);
};

const autoMarkAbsentAfterEventEnd = async ({
  eventId,
  userId,
  skipPermission = false,
}) => {
  const event = await getEventById(eventId);

  if (!skipPermission) {
    await checkAttendanceManagePermission({
      event,
      userId,
    });
  }

  const now = new Date();

  if (now < event.end_time) {
    throw createError("Event has not ended yet", 400);
  }

  const result = await EventRegistration.updateMany(
    {
      event_id: eventId,
      status: "registered",
    },
    {
      $set: {
        status: "absent",
        check_in_time: null,
        checked_in_by: null,
      },
    }
  );

  if (event.check_in_status !== "closed") {
    event.check_in_status = "closed";
    await event.save();
  }

  return {
    event_id: eventId,
    marked_absent: result.modifiedCount,
    check_in_status: event.check_in_status,
  };
};

module.exports = {
  getAttendanceList,
  updateAttendanceStatus,
  autoMarkAbsentAfterEventEnd,
};