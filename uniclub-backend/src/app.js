const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const path = require("path");

const passport = require("passport");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
const clubDiscoveryRoutes = require("./routes/clubDiscovery.routes");
const clubManagementRoutes = require("./routes/clubManagement.routes");
const clubMemberRoutes = require("./routes/clubMember.routes");
const profileRoutes = require("./routes/profile.routes");
const eventRoutes = require("./routes/event.routes");
const feedbackManagementRoutes = require("./routes/student/feedbackManagement.routes");
const rewardManagementRoutes = require("./routes/rewardManagement.route");

require("./config/passport");

const eventTimelineRoutes = require("./routes/eventTimeline.routes");
const eventAttendanceRoutes = require("./routes/eventAttendance.routes");
const clubMembershipRoutes = require("./routes/member/clubMembership.routes");
const memberAchievementPointsRoutes = require("./routes/member/achievementPoints.routes");
const studentClubMembershipRoutes = require("./routes/student/clubMembership.routes");
const presidentJoinRequestManagementRoutes = require("./routes/president/joinRequestManagement.routes");
const presidentJoinFormManagementRoutes = require("./routes/president/joinFormManagement.routes");
const presidentPointRuleManagementRoutes = require("./routes/president/pointRuleManagement.routes");
const eventManagerRoutes = require("./routes/eventManager/eventManagement.routes");
const memberActivityScheduleRoutes = require("./routes/member/activitySchedule.routes");
const secretaryActivityScheduleRoutes = require("./routes/secretary/activitySchedule.routes");

const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");
const env = require("./config/env");

const app = express();

app.use(
  cors({
    origin: env.frontendURL,
    credentials: true,
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));
app.use(cookieParser());
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));

app.use(passport.initialize());

app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);

app.use("/api/clubs", clubDiscoveryRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/events", eventRoutes);
app.use("/api/events", eventTimelineRoutes);
app.use("/api/events", eventAttendanceRoutes);

app.use("/api/member/clubs-membership", clubMembershipRoutes);
app.use("/api/member/clubs-membership", memberAchievementPointsRoutes);
app.use("/api/student/clubs-membership", studentClubMembershipRoutes);
app.use("/api/club-management", clubManagementRoutes);
app.use("/api/club-members", clubMemberRoutes);
app.use("/api/president/join-request-management", presidentJoinRequestManagementRoutes);
app.use("/api/president/clubs", presidentJoinFormManagementRoutes);
app.use("/api/president/clubs", presidentPointRuleManagementRoutes);
app.use("/api/student/feedback-management", feedbackManagementRoutes);
app.use("/api/event-manager/event-management", eventManagerRoutes);
app.use("/api/member/clubs/:clubId/activity-schedule",memberActivityScheduleRoutes);
app.use("/api/secretary/clubs/:clubId/activity-schedule",secretaryActivityScheduleRoutes);
app.use("/api/president/reward-management", rewardManagementRoutes);

app.get("/", (req, res) => {
  return res.status(200).json({
    success: true,
    message: "Welcome to Uniclub backend API",
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
