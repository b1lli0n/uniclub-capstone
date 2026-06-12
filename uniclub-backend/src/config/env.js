const dotenv = require("dotenv");

dotenv.config();

module.exports = {
  port: process.env.PORT || 5000,
  mongodbUri: process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/uniclub",
  nodeEnv: process.env.NODE_ENV || "development"
};
