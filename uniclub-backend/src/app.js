const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const passport = require("passport");

const authRoutes = require("./routes/auth.routes");
require("./config/passport");

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

app.use(passport.initialize());

app.use("/api/auth", authRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Uniclub backend API",
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;