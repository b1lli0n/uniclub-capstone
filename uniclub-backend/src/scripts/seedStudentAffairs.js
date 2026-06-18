const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const User = require("../models/user.model");
const env = require("../config/env");

const MONGO_URI = env.mongoUri || env.mongodbUri || process.env.MONGO_URI;
const JWT_SECRET = env.jwtSecret || process.env.JWT_SECRET;


/**
 * Script này dùng để tạo user role "student_affairs" và in ra token JWT
 * để dùng test API ở local.
 *
 * Chạy bằng lệnh:
 *   node src/scripts/seedStudentAffairs.js
 * 
 * Sau đó dùng token ở output trên log dán vào header Authorization của Postman để test API.
 */
async function seedStudentAffairs() {
  try {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");

    const email = "studentaffairs@fpt.edu.vn";

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        full_name: "Student Affairs Test",
        email,
        avatar_url: null,
        provider: "google",
        provider_id: "seed-student-affairs-001",
        role: "student_affairs",
        status: "active",
      });

      console.log("Created student_affairs user");
    } else {
      console.log("User already exists, reuse existing user");
    }

    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        role: user.role,
      },
      JWT_SECRET,
      { expiresIn: "7d" }
    );

    console.log("\n=== STUDENT AFFAIRS USER ===");
    console.log({
      id: user._id.toString(),
      full_name: user.full_name,
      email: user.email,
      role: user.role,
      status: user.status,
    });

    console.log("\n=== JWT TOKEN ===");
    console.log(token);

    console.log("\n=== AUTH HEADER ===");
    console.log(`Bearer ${token}`);
  } catch (error) {
    console.error("Seed failed:", error);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
}

seedStudentAffairs();