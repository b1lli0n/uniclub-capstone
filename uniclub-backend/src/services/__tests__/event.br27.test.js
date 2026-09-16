const mongoose = require("mongoose");
const eventService = require("../event.service");
const Event = require("../../models/event.model");
const EventRegistration = require("../../models/event_registration.model");

jest.mock("../../models/event.model");
jest.mock("../../models/event_registration.model");

describe("BR-27 Event Registration Cancellation Rule (At least 24 hours prior)", () => {
  const eventId = new mongoose.Types.ObjectId().toString();
  const userId = new mongoose.Types.ObjectId().toString();

  afterEach(() => {
    jest.clearAllMocks();
  });

  test("allows cancellation when done at least 24 hours before event start time (e.g. 48 hours prior)", async () => {
    // Event starts 48 hours from now
    const futureStartTime = new Date(Date.now() + 48 * 60 * 60 * 1000);

    Event.findById.mockResolvedValue({
      _id: eventId,
      start_time: futureStartTime,
    });

    const mockRegistration = {
      _id: new mongoose.Types.ObjectId(),
      event_id: eventId,
      user_id: userId,
      status: "registered",
      save: jest.fn().mockResolvedValue(true),
    };

    EventRegistration.findOne.mockResolvedValue(mockRegistration);

    const result = await eventService.cancelEventRegistration({ eventId, userId });

    expect(mockRegistration.save).toHaveBeenCalled();
    expect(result.status).toBe("cancelled");
  });

  test("blocks cancellation when less than 24 hours remain before event start time (e.g. 10 hours prior)", async () => {
    // Event starts 10 hours from now (< 24 hours)
    const futureStartTime = new Date(Date.now() + 10 * 60 * 60 * 1000);

    Event.findById.mockResolvedValue({
      _id: eventId,
      start_time: futureStartTime,
    });

    await expect(
      eventService.cancelEventRegistration({ eventId, userId })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Event registration can only be cancelled at least 24 hours prior to the event start time.",
    });

    expect(EventRegistration.findOne).not.toHaveBeenCalled();
  });

  test("blocks cancellation after event has already started", async () => {
    // Event started 2 hours ago
    const pastStartTime = new Date(Date.now() - 2 * 60 * 60 * 1000);

    Event.findById.mockResolvedValue({
      _id: eventId,
      start_time: pastStartTime,
    });

    await expect(
      eventService.cancelEventRegistration({ eventId, userId })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "Event registration can only be cancelled at least 24 hours prior to the event start time.",
    });

    expect(EventRegistration.findOne).not.toHaveBeenCalled();
  });

  test("blocks cancellation when no active registration is found", async () => {
    const futureStartTime = new Date(Date.now() + 72 * 60 * 60 * 1000);

    Event.findById.mockResolvedValue({
      _id: eventId,
      start_time: futureStartTime,
    });

    EventRegistration.findOne.mockResolvedValue(null);

    await expect(
      eventService.cancelEventRegistration({ eventId, userId })
    ).rejects.toMatchObject({
      statusCode: 400,
      message: "No active registration found for this event",
    });
  });
});
