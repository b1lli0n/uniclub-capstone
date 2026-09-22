const mongoose = require("mongoose");
const eventService = require("../event.service");
const Event = require("../../models/event.model");
const EventRegistration = require("../../models/event_registration.model");
const Club = require("../../models/club.model");
const User = require("../../models/user.model");

jest.mock("../../models/event.model");
jest.mock("../../models/event_registration.model");
jest.mock("../../models/club_member.model");
jest.mock("../../models/club.model");
jest.mock("../../models/user.model");
jest.mock("../pointsAward.helper", () => ({
  awardRewardPoints: jest.fn().mockResolvedValue({ success: true }),
}));
jest.mock("../email.service", () => ({
  sendEventTicketEmail: jest.fn().mockResolvedValue(true),
}));

describe("BR-25 Event Registration Window and Available Slots Rule", () => {
  const eventId = new mongoose.Types.ObjectId().toString();
  const userId = new mongoose.Types.ObjectId().toString();
  const clubId = new mongoose.Types.ObjectId().toString();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("blocks registration when status is not coming_soon (e.g. opening)", async () => {
    Event.findById.mockResolvedValue({
      _id: eventId,
      status: "opening",
      progress_status: "completed",
      is_public: true,
      capacity: 50,
      start_time: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    });

    await expect(
      eventService.registerForEvent({ eventId, userId, userEmail: "test@fpt.edu.vn" })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining("Registration is only open when event status is coming soon"),
    });

    expect(EventRegistration.create).not.toHaveBeenCalled();
  });

  test("blocks registration when event has already started (now >= start_time)", async () => {
    const pastStart = new Date(Date.now() - 1 * 60 * 60 * 1000); // 1 hour ago
    const futureEnd = new Date(Date.now() + 2 * 60 * 60 * 1000);

    Event.findById.mockResolvedValue({
      _id: eventId,
      status: "coming_soon",
      progress_status: "completed",
      start_time: pastStart,
      end_time: futureEnd,
      is_public: true,
      capacity: 50,
    });

    await expect(
      eventService.registerForEvent({ eventId, userId, userEmail: "test@fpt.edu.vn" })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining("Cannot register because the event has already started"),
    });

    expect(EventRegistration.create).not.toHaveBeenCalled();
  });

  test("blocks registration when available slots <= 0 (Capacity reached)", async () => {
    const futureStart = new Date(Date.now() + 2 * 24 * 60 * 60 * 1000); // 2 days in future
    const futureEnd = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);

    Event.findById.mockResolvedValue({
      _id: eventId,
      status: "coming_soon",
      progress_status: "completed",
      start_time: futureStart,
      end_time: futureEnd,
      is_public: true,
      capacity: 30,
    });

    // 30 participants registered already
    EventRegistration.countDocuments.mockResolvedValue(30);

    await expect(
      eventService.registerForEvent({ eventId, userId, userEmail: "test@fpt.edu.vn" })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: expect.stringContaining("Event capacity has been reached. No available slots left."),
    });

    expect(EventRegistration.create).not.toHaveBeenCalled();
  });

  test("blocks registration when event is cancelled", async () => {
    Event.findById.mockResolvedValue({
      _id: eventId,
      status: "cancelled",
      progress_status: "completed",
    });

    await expect(
      eventService.registerForEvent({ eventId, userId, userEmail: "test@fpt.edu.vn" })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Cannot register for a cancelled event",
    });
  });

  test("blocks registration when event is in draft mode", async () => {
    Event.findById.mockResolvedValue({
      _id: eventId,
      status: "coming_soon",
      progress_status: "draft",
    });

    await expect(
      eventService.registerForEvent({ eventId, userId, userEmail: "test@fpt.edu.vn" })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Event is in draft mode and not open for registration",
    });
  });

  test("successfully registers student when status is coming_soon, progress_status is completed, now < start_time, and availableSlots > 0", async () => {
    const eventStart = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
    const eventEnd = new Date(Date.now() + 4 * 24 * 60 * 60 * 1000);

    Event.findById.mockResolvedValue({
      _id: eventId,
      club_id: clubId,
      title: "Orientation Music Fest",
      status: "coming_soon",
      progress_status: "completed",
      start_time: eventStart,
      end_time: eventEnd,
      is_public: true,
      capacity: 50,
      location: "Hall A",
    });

    // Currently 20 registered, 30 slots available > 0
    EventRegistration.countDocuments.mockResolvedValue(20);
    EventRegistration.findOne.mockResolvedValue(null);

    const mockRegDoc = {
      _id: new mongoose.Types.ObjectId(),
      event_id: eventId,
      user_id: userId,
      status: "registered",
      registered_at: new Date(),
    };
    EventRegistration.create.mockResolvedValue(mockRegDoc);

    Club.findById.mockResolvedValue({ name: "Music Club" });
    User.findById.mockResolvedValue({ full_name: "Nguyen Van A", email: "anv@fpt.edu.vn" });

    const result = await eventService.registerForEvent({
      eventId,
      userId,
      userEmail: "anv@fpt.edu.vn",
    });

    expect(result).toBeDefined();
    expect(result.status).toBe("registered");
    expect(EventRegistration.create).toHaveBeenCalledWith(
      expect.objectContaining({
        event_id: eventId,
        user_id: userId,
        status: "registered",
      })
    );
  });
});
