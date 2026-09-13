const mongoose = require("mongoose");
const env = require("./src/config/env");
const User = require("./src/models/user.model");

async function main() {
  console.log("Connecting to database...");
  await mongoose.connect(env.mongodbUri);
  
  const user = await User.findOne({ full_name: /Nguyen Ty/i });
  if (!user) {
    console.error("User 'Nguyen Ty' not found!");
    await mongoose.disconnect();
    return;
  }

  const oldRole = user.role;
  const newRole = oldRole === "student" ? "student_affairs" : "student";
  user.role = newRole;
  await user.save();

  console.log(`\n================================================================`);
  console.log(`Successfully toggled system role for: ${user.full_name}`);
  console.log(`Role changed: ${oldRole.toUpperCase()} ===> ${newRole.toUpperCase()}`);
  console.log(`================================================================`);
  
  if (newRole === "student_affairs") {
    console.log("👉 You can now access the Admin Dashboard at: http://localhost:5173/admin");
  } else {
    console.log("👉 You are now in Student mode at: http://localhost:5173/");
  }

  await mongoose.disconnect();
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
