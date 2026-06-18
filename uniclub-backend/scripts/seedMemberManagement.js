
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const env = require("../src/config/env");

const User = require("../src/models/user.model");
const Profile = require("../src/models/profile.model");
const Club = require("../src/models/club.model");
const ClubMember = require("../src/models/club_member.model");


const seedMemberManagement = async () => {
  try {
    if (!env.mongodbUri) {
  throw new Error("Missing MONGODB_URI in .env");
}

await mongoose.connect(env.mongodbUri);

    const seedProviderIds = [
      "seed-president-001",
      "seed-member-001",
      "seed-member-002",
      "seed-member-003",
      "seed-member-004",
      "seed-member-005",
      "seed-member-left-001",
      "seed-member-removed-001",
    ];

    const oldUsers = await User.find({
      provider_id: { $in: seedProviderIds },
    });

    const oldUserIds = oldUsers.map((user) => user._id);

    const oldClubs = await Club.find({
      name: { $in: ["FPT Software Club"] },
    });

    const oldClubIds = oldClubs.map((club) => club._id);

    await ClubMember.deleteMany({
      $or: [
        { user_id: { $in: oldUserIds } },
        { club_id: { $in: oldClubIds } },
      ],
    });

    await Profile.deleteMany({
      user_id: { $in: oldUserIds },
    });

    await Club.deleteMany({
      _id: { $in: oldClubIds },
    });

    await User.deleteMany({
      _id: { $in: oldUserIds },
    });

    const users = await User.insertMany([
      {
        full_name: "Nguyen Minh Khang",
        email: "khang.president@fpt.edu.vn",
        avatar_url: "https://example.com/avatar/khang.png",
        provider: "google",
        provider_id: "seed-president-001",
        role: "student",
        status: "active",
      },
      {
        full_name: "Tran Gia Bao",
        email: "bao.member@fpt.edu.vn",
        avatar_url: "https://example.com/avatar/bao.png",
        provider: "google",
        provider_id: "seed-member-001",
        role: "student",
        status: "active",
      },
      {
        full_name: "Le Hoang Anh",
        email: "anh.member@fpt.edu.vn",
        avatar_url: "https://example.com/avatar/anh.png",
        provider: "google",
        provider_id: "seed-member-002",
        role: "student",
        status: "active",
      },
      {
        full_name: "Pham Quoc Huy",
        email: "huy.member@fpt.edu.vn",
        avatar_url: "https://example.com/avatar/huy.png",
        provider: "google",
        provider_id: "seed-member-003",
        role: "student",
        status: "active",
      },
      {
        full_name: "Vo Thanh Ngan",
        email: "ngan.member@fpt.edu.vn",
        avatar_url: "https://example.com/avatar/ngan.png",
        provider: "google",
        provider_id: "seed-member-004",
        role: "student",
        status: "active",
      },
      {
        full_name: "Dang Minh Chau",
        email: "chau.member@fpt.edu.vn",
        avatar_url: "https://example.com/avatar/chau.png",
        provider: "google",
        provider_id: "seed-member-005",
        role: "student",
        status: "active",
      },
      {
        full_name: "Bui Ngoc Linh",
        email: "linh.left@fpt.edu.vn",
        avatar_url: "https://example.com/avatar/linh.png",
        provider: "google",
        provider_id: "seed-member-left-001",
        role: "student",
        status: "active",
      },
      {
        full_name: "Hoang Tuan Dat",
        email: "dat.removed@fpt.edu.vn",
        avatar_url: "https://example.com/avatar/dat.png",
        provider: "google",
        provider_id: "seed-member-removed-001",
        role: "student",
        status: "active",
      },
    ]);

    const [
      president,
      bao,
      anh,
      huy,
      ngan,
      chau,
      linh,
      dat,
    ] = users;

    await Profile.insertMany([
      {
        user_id: president._id,
        student_code: "SE170001",
        phone: "0901000001",
        major: "Software Engineering",
        campus: "HCM",
        social_links: {
          facebook: "https://facebook.com/khang",
          github: "https://github.com/khang",
          linkedin: "",
        },
      },
      {
        user_id: bao._id,
        student_code: "SE170002",
        phone: "0901000002",
        major: "Software Engineering",
        campus: "HCM",
        social_links: {
          facebook: "",
          github: "https://github.com/bao",
          linkedin: "",
        },
      },
      {
        user_id: anh._id,
        student_code: "SE170003",
        phone: "0901000003",
        major: "Artificial Intelligence",
        campus: "HCM",
        social_links: {
          facebook: "",
          github: "",
          linkedin: "",
        },
      },
      {
        user_id: huy._id,
        student_code: "SE170004",
        phone: "0901000004",
        major: "Information Security",
        campus: "HCM",
        social_links: {
          facebook: "",
          github: "https://github.com/huy",
          linkedin: "",
        },
      },
      {
        user_id: ngan._id,
        student_code: "SE170005",
        phone: "0901000005",
        major: "Software Engineering",
        campus: "HCM",
        social_links: {
          facebook: "",
          github: "",
          linkedin: "https://linkedin.com/in/ngan",
        },
      },
      {
        user_id: chau._id,
        student_code: "SE170006",
        phone: "0901000006",
        major: "Digital Art and Design",
        campus: "HCM",
        social_links: {
          facebook: "",
          github: "",
          linkedin: "",
        },
      },
      {
        user_id: linh._id,
        student_code: "SE170007",
        phone: "0901000007",
        major: "Software Engineering",
        campus: "HCM",
        social_links: {
          facebook: "",
          github: "",
          linkedin: "",
        },
      },
      {
        user_id: dat._id,
        student_code: "SE170008",
        phone: "0901000008",
        major: "Business Administration",
        campus: "HCM",
        social_links: {
          facebook: "",
          github: "",
          linkedin: "",
        },
      },
    ]);

    const club = await Club.create({
      name: "FPT Software Club",
      description: "A club for students who love software development.",
      logo_url: "https://example.com/logos/fpt-software-club.png",
      category: "Technology",
      status: "active",
      created_by: president._id,
    });

    await ClubMember.insertMany([
      {
        club_id: club._id,
        user_id: president._id,
        role: "president",
        status: "active",
        joined_at: new Date("2026-01-10T08:00:00.000Z"),
        left_at: null,
      },
      {
        club_id: club._id,
        user_id: bao._id,
        role: "member",
        status: "active",
        joined_at: new Date("2026-01-15T08:00:00.000Z"),
        left_at: null,
      },
      {
        club_id: club._id,
        user_id: anh._id,
        role: "secretary",
        status: "active",
        joined_at: new Date("2026-02-01T08:00:00.000Z"),
        left_at: null,
      },
      {
        club_id: club._id,
        user_id: huy._id,
        role: "treasurer",
        status: "active",
        joined_at: new Date("2026-02-10T08:00:00.000Z"),
        left_at: null,
      },
      {
        club_id: club._id,
        user_id: ngan._id,
        role: "event_manager",
        status: "active",
        joined_at: new Date("2026-03-05T08:00:00.000Z"),
        left_at: null,
      },
      {
        club_id: club._id,
        user_id: chau._id,
        role: "member",
        status: "active",
        joined_at: new Date("2026-03-20T08:00:00.000Z"),
        left_at: null,
      },
      {
        club_id: club._id,
        user_id: linh._id,
        role: "member",
        status: "left",
        joined_at: new Date("2026-01-20T08:00:00.000Z"),
        left_at: new Date("2026-05-01T08:00:00.000Z"),
      },
      {
        club_id: club._id,
        user_id: dat._id,
        role: "member",
        status: "removed",
        joined_at: new Date("2026-02-25T08:00:00.000Z"),
        left_at: new Date("2026-05-15T08:00:00.000Z"),
      },
    ]);

    const presidentToken = jwt.sign(
  {
    id: president._id.toString(),
    email: president.email,
    role: president.role,
  },
  env.jwtSecret,
  {
    expiresIn: env.jwtExpire || "7d",
  }
);

console.log("Seed data created successfully");
console.log("Club ID:", club._id.toString());
console.log("President User ID:", president._id.toString());
console.log("President email:", president.email);
console.log("President student code: SE170001");
console.log("President token:", presidentToken);

    await mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Seed error:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedMemberManagement();