const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const passport = require("passport");
const cookieParser = require("cookie-parser");

const authRoutes = require("./routes/auth.routes");
<<<<<<< HEAD
const clubDiscoveryRoutes = require("./routes/clubDiscovery.routes");
=======
const clubManagementRoutes = require("./routes/clubManagement.routes");

>>>>>>> feature/be-club-management
require("./config/passport");

const profileRoutes = require("./routes/profile.routes");

const clubMembershipRoutes = require("./routes/member/clubMembership.routes");

const studentClubMembershipRoutes = require("./routes/student/clubMembership.routes");

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

app.use(passport.initialize());

app.use("/auth", authRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/clubs", clubDiscoveryRoutes);

app.use("/api/profile", profileRoutes);

app.use("/api/member/clubs-membership", clubMembershipRoutes);

app.use("/api/student/clubs-membership", studentClubMembershipRoutes);

app.use("/api/club-management", clubManagementRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Uniclub backend API",
  });
});

app.use(notFound);
app.use(errorHandler);

module.exports = app;