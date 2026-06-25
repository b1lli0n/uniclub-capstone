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


require("./config/passport");

const profileRoutes = require("./routes/profile.routes");
const eventRoutes = require("./routes/event.routes");

const clubMembershipRoutes = require("./routes/member/clubMembership.routes");

const studentClubMembershipRoutes = require("./routes/student/clubMembership.routes");

const presidentJoinRequestManagementRoutes = require("./routes/president/joinRequestManagement.routes");
const presidentJoinFormManagementRoutes = require("./routes/president/joinFormManagement.routes");

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


app.use("/api/member/clubs-membership", clubMembershipRoutes);

app.use("/api/student/clubs-membership", studentClubMembershipRoutes);

app.use("/api/club-management", clubManagementRoutes);

app.use("/api/club-members", clubMemberRoutes);

app.use("/api/president/join-request-management", presidentJoinRequestManagementRoutes);
app.use("/api/president/clubs", presidentJoinFormManagementRoutes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Uniclub backend API",
  });
});



app.use(notFound);
app.use(errorHandler);

module.exports = app;