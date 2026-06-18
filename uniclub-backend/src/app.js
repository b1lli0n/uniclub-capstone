const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const eventManagerRoutes = require("./routes/eventManager/eventManagement.routes");

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

app.use("/api/event-manager/event-management", eventManagerRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Uniclub backend API",
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;
