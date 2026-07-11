const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const { getHealth } = require("./controllers/health.controller");
const memberActivityScheduleRoutes = require("./routes/member/activitySchedule.routes");
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Uniclub backend API"
  });
});

app.get("/api/v1/health", getHealth);
app.use(
  "/api/member/clubs/:clubId/activity-schedule",
  memberActivityScheduleRoutes
);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
