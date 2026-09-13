const eventTimelineService = require("../services/eventTimeline.service");

const getEventTimelines = async (req, res) => {
  try {
    const { eventId } = req.params;

    const data = await eventTimelineService.getEventTimelines({
      eventId,
    });

    return res.status(200).json({
      success: true,
      message: "Event timeline fetched successfully",
      data,
    });
  } catch (error) {
    console.error("Get event timelines error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server error while fetching event timeline",
    });
  }
};

const createEventTimeline = async (req, res) => {
  try {
    const { eventId } = req.params;

    const data = await eventTimelineService.createEventTimeline({
      eventId,
      userId: req.user.id,
      time: req.body.time,
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
    });

    return res.status(201).json({
      success: true,
      message: "Timeline item created successfully",
      data,
    });
  } catch (error) {
    console.error("Create event timeline error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server error while creating timeline item",
    });
  }
};

const updateEventTimeline = async (req, res) => {
  try {
    const { eventId, timelineId } = req.params;

    const data = await eventTimelineService.updateEventTimeline({
      eventId,
      timelineId,
      userId: req.user.id,
      time: req.body.time,
      title: req.body.title,
      description: req.body.description,
      location: req.body.location,
    });

    return res.status(200).json({
      success: true,
      message: "Timeline item updated successfully",
      data,
    });
  } catch (error) {
    console.error("Update event timeline error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server error while updating timeline item",
    });
  }
};

const deleteEventTimeline = async (req, res) => {
  try {
    const { eventId, timelineId } = req.params;

    const data = await eventTimelineService.deleteEventTimeline({
      eventId,
      timelineId,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Timeline item deleted successfully",
      data,
    });
  } catch (error) {
    console.error("Delete event timeline error:", error);

    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message || "Server error while deleting timeline item",
    });
  }
};

module.exports = {
  getEventTimelines,
  createEventTimeline,
  updateEventTimeline,
  deleteEventTimeline,
};