const express = require("express");
const cors = require("cors");
const morgan = require("morgan");
const routes = require("./routes");

const { getHealth } = require("./controllers/health.controller");
const presidentJoinRequestManagementRoutes = require("./routes/president/joinRequestManagement.routes");
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

app.get("/api/v1/health", getHealth);
app.use("/api/president/join-request-management", presidentJoinRequestManagementRoutes);

app.use(notFound);
app.use(errorHandler);

module.exports = app;
