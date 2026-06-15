const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
<<<<<<< Updated upstream
const routes = require("./routes");
=======
const { getHealth } = require("./controllers/health.controller");
const studentClubMembershipRoutes = require("./routes/student/clubMembership.routes");
const memberClubMembershipRoutes = require("./routes/member/clubMembership.routes");
>>>>>>> Stashed changes
const notFound = require("./middlewares/notFound");
const errorHandler = require("./middlewares/errorHandler");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("dev"));

app.use("/api/v1", routes);

app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Welcome to Uniclub backend API"
  });
});

<<<<<<< Updated upstream
=======
app.get("/api/v1/health", getHealth);
app.use("/api/student/clubs-membership", studentClubMembershipRoutes);
app.use("/api/member/clubs-membership", memberClubMembershipRoutes);

>>>>>>> Stashed changes
app.use(notFound);
app.use(errorHandler);

module.exports = app;
