const mongoose = require("mongoose");
const env = require("./env");

const connectDatabase = async () => {
  try {
    mongoose.set("strictQuery", true);
    await mongoose.connect(env.mongodbUri);
    console.log("MongoDB connected successfully");
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
};

module.exports = connectDatabase;
