/**
 * ============================================================
 * UNICLUB – FULL DATABASE MASTER SEED SCRIPT (50 ACCOUNTS, 50 CLUBS, 500 EVENTS)
 * ============================================================
 * Tạo dữ liệu mẫu quy mô lớn cho tất cả các bảng (collections):
 *   users, profiles, clubs, clubMembers, joinForms,
 *   clubCreationRequests, actionTypes, pointRules, contributionLogs,
 *   events, eventRegistrations, eventTimelines, activities, rewards,
 *   rewardRedemptions, polls, invitations, transactions, payments.
 *
 * Chạy: node scripts/seed.js
 * ⚠️  Script này sẽ XOÁ SẠCH dữ liệu cũ trước khi nạp mới
 * ============================================================
 */

"use strict";

const mongoose = require("mongoose");
const path = require("path");
const jwt = require("jsonwebtoken");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

// ─── Models ──────────────────────────────────────────────────
const User = require("../src/models/user.model");
const Profile = require("../src/models/profile.model");
const Club = require("../src/models/club.model");
const ClubMember = require("../src/models/club_member.model");
const JoinForm = require("../src/models/join_form.model");
const ClubCreationRequest = require("../src/models/club_creation_requests.model");
const EventCreationRequest = require("../src/models/event_creation_request.model");
const ActionType = require("../src/models/action_type.model");
const PointRule = require("../src/models/point_rule.model");
const ContributionLog = require("../src/models/contribution_log.model");
const Event = require("../src/models/event.model");
const EventRegistration = require("../src/models/event_registration.model");
const EventTimeline = require("../src/models/event_timeline.model");
const Activity = require("../src/models/activity.model");
const Reward = require("../src/models/reward.model");
const RewardRedemption = require("../src/models/reward_redemption.model");
const RewardTransaction = require("../src/models/rewardTransaction.model");
const Feedback = require("../src/models/feedback.model");
const Poll = require("../src/models/poll.model");
const Invitation = require("../src/models/invitation.model");
const Transaction = require("../src/models/transaction.model");
const Payment = require("../src/models/payment.model");

const MUSIC_CLUB_ID = "6a3c34121f6805a34580c4b2";

// ─── Helpers ──────────────────────────────────────────────────
const daysAgo = (n) => new Date(Date.now() - n * 86_400_000);
const daysAhead = (n) => new Date(Date.now() + n * 86_400_000);
const avatarUrl = (seed) =>
  `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(seed)}&backgroundColor=ff8e0b&fontFamily=Arial&fontSize=40&fontWeight=700`;

function getMondayOfWeek(d) {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

function makeToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "supersecretkey",
    { expiresIn: "7d" }
  );
}

// ─── Datasets ─────────────────────────────────────────────────
const LAST_NAMES = ["Nguyen", "Tran", "Le", "Pham", "Hoang", "Phan", "Vu", "Vo", "Dang", "Bui", "Do", "Ho"];
const MIDDLE_NAMES = ["Van", "Thi", "Minh", "Quoc", "Thanh", "Bich", "Duc", "Lan", "Mai", "Nam", "Oanh", "Phuc"];
const FIRST_NAMES = ["An", "Binh", "Cuong", "Dung", "Em", "Giang", "Hung", "Khanh", "Linh", "Minh", "Nam", "Phong", "Quan", "Son", "Tu", "Vinh", "Vy", "Yen"];

function generateName(index) {
  if (index === 0) return "Nguyen Van Admin";
  if (index === 1) return "Nguyen Ty (K18 CT)";
  const last = LAST_NAMES[index % LAST_NAMES.length];
  const mid = MIDDLE_NAMES[(index + 3) % MIDDLE_NAMES.length];
  const first = FIRST_NAMES[(index + 7) % FIRST_NAMES.length];
  return `${last} ${mid} ${first} (Demo ${index - 1})`;
}

const CLUB_NAMES = [
  "Music Club", "Coding Club", "Basketball Club", "Dance Club", "Volunteer Club",
  "Startup Club", "Photography Club", "Debate Club", "Gaming Club", "Environmental Club",
  "Chess Club", "Film Making Club", "Football Club", "Volleyball Club", "Badminton Club",
  "Table Tennis Club", "English Club", "Japanese Club", "Chinese Club", "Korean Club",
  "German Club", "French Club", "Robotics Club", "Artificial Intelligence Club", "Cybersecurity Club",
  "Game Development Club", "Graphic Design Club", "Marketing Club", "Finance Club", "HR Club",
  "Event Organization Club", "MC & Public Speaking Club", "Guitar Club", "Violin Club", "Drummers Club",
  "Vocal & Choral Club", "Yoga Club", "Swimming Club", "Running & Athletics Club", "Cycling Club",
  "Archery Club", "Board Games Club", "Magic & Illusion Club", "Astrology Club", "Philosophy Club",
  "History Club", "Astronomy Club", "Physics Club", "Chemistry Club", "Mathematics Club"
];

const CLUB_CATEGORIES = [
  "art", "tech", "sport", "art", "volunteer",
  "academic", "art", "academic", "sport", "volunteer",
  "sport", "art", "sport", "sport", "sport",
  "sport", "academic", "academic", "academic", "academic",
  "academic", "academic", "tech", "tech", "tech",
  "tech", "art", "academic", "academic", "academic",
  "academic", "art", "art", "art", "art",
  "art", "sport", "sport", "sport", "sport",
  "sport", "sport", "art", "academic", "academic",
  "academic", "academic", "academic", "academic", "academic"
];

const CLUB_LOGOS = [
  "/uploads/clubs/music_club_logo.png",
  "/uploads/clubs/coding_club_logo.png",
  "/uploads/clubs/basketball_club_logo.png",
  "/uploads/clubs/dance_club_logo.png",
  "/uploads/clubs/volunteer_club_logo.png",
  "/uploads/clubs/startup_club_logo.png",
  "/uploads/clubs/photography_club_logo.png",
  "/uploads/clubs/debate_club_logo.png",
  "/uploads/clubs/gaming_club_logo.png",
  "/uploads/clubs/environmental_club_logo.png",
  "/uploads/clubs/chess_club_logo.png",
  "/uploads/clubs/film_club_logo.png"
];

const EVENT_BANNERS = [
  "/uploads/events/entertainment_event.png",
  "/uploads/events/workshop_event.png",
  "/uploads/events/community_event.png"
];

const EVENT_TITLES = [
  "Introduction & Orientation", "Weekly General Rehearsal", "Advanced Skills Workshop",
  "Inter-Club Friendly Championship", "Annual Showcase Gala", "Community CSR Outreach",
  "Interactive Member Sharing Session", "Mentorship & Training Camp", "Sprint Competition", "Special Celebration & Pizza Night"
];

const REWARD_ITEMS = [
  { name: "Highlands Coffee Voucher 30K", cost: 200, icon: "☕" },
  { name: "CGV 2D Movie Ticket", cost: 350, icon: "🎬" },
  { name: "UniClub Exclusive Hoodie", cost: 1000, icon: "🧥" },
  { name: "Combo Notebook & Pen", cost: 150, icon: "📓" }
];

async function seed() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("🔌 Connected to MongoDB\n");

  // ── Step 1: Clear Old Data ───────────────────────────────────
  console.log("🗑️ Clearing old data...");
  await Feedback.deleteMany({});
  await ContributionLog.deleteMany({});
  await PointRule.deleteMany({});
  await ActionType.deleteMany({});
  await Event.deleteMany({});
  await EventRegistration.deleteMany({});
  await EventTimeline.deleteMany({});
  await JoinForm.deleteMany({});
  await ClubMember.deleteMany({});
  await ClubCreationRequest.deleteMany({});
  await EventCreationRequest.deleteMany({});
  await Activity.deleteMany({});
  await Reward.deleteMany({});
  await RewardRedemption.deleteMany({});
  await RewardTransaction.deleteMany({});
  await Poll.deleteMany({});
  await Invitation.deleteMany({});
  await Transaction.deleteMany({});
  await Payment.deleteMany({});
  await Club.deleteMany({});
  await User.deleteMany({});
  await Profile.deleteMany({});
  console.log("   ✔ Database cleared successfully.\n");

  // ── Step 2: Create Action Types ──────────────────────────────
  console.log("⚡ Creating Action Types...");
  const actionTypes = await ActionType.create([
    { code: "attendance", name: "Event Attendance", description: "Cộng điểm khi tham gia sự kiện", is_Active: true },
    { code: "feedback", name: "Feedback Submission", description: "Cộng điểm khi phản hồi sự kiện", is_Active: true },
    { code: "meeting", name: "Meeting Attendance", description: "Cộng điểm khi tham gia họp CLB", is_Active: true },
  ]);
  const attendanceAct = actionTypes[0];
  const feedbackAct = actionTypes[1];
  const meetingAct = actionTypes[2];
  console.log(`   ✔ Created ${actionTypes.length} Action Types.\n`);

  // ── Step 3: Create 50 Accounts & Profiles ────────────────────
  console.log("👥 Generating 50 Accounts & Profiles...");
  const users = [];
  const profilesPayloads = [];

  // Define 50 accounts: admin, ty, demo1 -> demo48
  for (let i = 0; i < 50; i++) {
    let email, role, provider_id, fixedId;
    if (i === 0) {
      email = "admin@fpt.edu.vn";
      role = "student_affairs";
      provider_id = "sa_admin";
      fixedId = "6a6c8edd4b4228eed6d97184";
    } else if (i === 1) {
      email = "tynce181041@fpt.edu.vn";
      role = "student";
      provider_id = "st_ty";
      fixedId = "6a6c8edd4b4228eed6d97185";
    } else if (i === 2) {
      email = "demo1@fpt.edu.vn";
      role = "student";
      provider_id = "st_demo1";
      fixedId = "6a6c8edd4b4228eed6d97186";
    } else if (i === 3) {
      email = "demo2@fpt.edu.vn";
      role = "student";
      provider_id = "st_demo2";
      fixedId = "6a6c8edd4b4228eed6d97187";
    } else {
      email = `demo${i - 1}@fpt.edu.vn`;
      role = "student";
      provider_id = `st_demo${i - 1}`;
    }

    const name = generateName(i);
    const userDoc = new User({
      ...(fixedId && { _id: new mongoose.Types.ObjectId(fixedId) }),
      full_name: name,
      email,
      role,
      provider: "google",
      provider_id,
      status: "active",
      avatar_url: avatarUrl(name),
    });
    users.push(userDoc);

    const studentCodeNum = 180000 + i;
    profilesPayloads.push({
      user_id: userDoc._id,
      student_code: `SE${studentCodeNum}`,
      phone: `0901000${i.toString().padStart(3, "0")}`,
      major: i === 0 ? "Student Affairs" : (i % 2 === 0 ? "Software Engineering" : "Marketing"),
      campus: i % 3 === 0 ? "Ha Noi" : (i % 3 === 1 ? "Da Nang" : "Ho Chi Minh"),
      social_links: {
        facebook: `https://facebook.com/demo_profile_${i}`,
        github: i % 2 === 0 ? `https://github.com/demo_git_${i}` : "",
      }
    });
  }

  await User.insertMany(users);
  await Profile.insertMany(profilesPayloads);
  console.log(`   ✔ Inserted 50 Users and Profiles.\n`);

  const saAdmin = users[0];
  const tyUser = users[1];
  const students = users.slice(1); // 49 students (including Ty)

  // ── Step 3.5: Create Club Creation Requests ────────────────────
  console.log("📝 Seeding Club Creation Requests...");
  const clubRequestsPayloads = [
    {
      club_name: "AI & Data Science Club",
      description: "CLB nghiên cứu và ứng dụng Trí tuệ nhân tạo, Học máy và Khoa học dữ liệu dành cho sinh viên CNTT.",
      reason: "Nhu cầu học tập và nghiên cứu AI trong sinh viên rất lớn, cần một không gian sinh hoạt chuyên sâu.",
      logo_url: "/uploads/clubs/coding_club_logo.png",
      status: "pending",
      requested_by: students[2]._id,
      member_ids: [students[2]._id, students[3]._id, students[4]._id],
      created_at: daysAgo(3)
    },
    {
      club_name: "FPT E-Sports Community",
      description: "Cộng đồng thể thao điện tử, kết nối các game thủ và tổ chức các giải đấu cấp trường.",
      reason: "Tạo sân chơi lành mạnh, rèn luyện tư duy chiến thuật và kỹ năng làm việc nhóm.",
      logo_url: "/uploads/clubs/gaming_club_logo.png",
      status: "approved",
      requested_by: students[5]._id,
      member_ids: [students[5]._id, students[6]._id],
      reviewed_by: saAdmin._id,
      review_note: "Đề xuất hợp lý, đã duyệt cho phép hoạt động thử nghiệm.",
      reviewed_at: daysAgo(1),
      created_at: daysAgo(5)
    },
    {
      club_name: "Vovinam Martial Arts Club",
      description: "Câu lạc bộ võ thuật Vovinam rèn luyện sức khỏe và tinh thần thượng võ.",
      reason: "Phát huy truyền thống môn võ Vovinam của trường FPT.",
      logo_url: "/uploads/clubs/sports_club_logo.png",
      status: "rejected",
      requested_by: students[7]._id,
      member_ids: [students[7]._id],
      reviewed_by: saAdmin._id,
      review_note: "Danh sách thành viên sáng lập chưa đủ số lượng tối thiểu.",
      reviewed_at: daysAgo(2),
      created_at: daysAgo(7)
    }
  ];
  await ClubCreationRequest.insertMany(clubRequestsPayloads);
  console.log(`   ✔ Seeded ${clubRequestsPayloads.length} Club Creation Requests.\n`);

  // ── Step 4: Create 50 Clubs ──────────────────────────────────
  console.log("🏢 Creating 50 Clubs...");
  const clubs = [];
  for (let i = 0; i < CLUB_NAMES.length; i++) {
    const club = new Club({
      _id: i === 0 ? new mongoose.Types.ObjectId(MUSIC_CLUB_ID) : new mongoose.Types.ObjectId(),
      name: CLUB_NAMES[i],
      description: `Official campus hub for ${CLUB_NAMES[i]}. Connect with people of the same interests and discover exciting opportunities!`,
      logo_url: CLUB_LOGOS[i % CLUB_LOGOS.length],
      category: CLUB_CATEGORIES[i],
      status: "active",
      created_by: saAdmin._id,
    });
    clubs.push(club);
  }
  await Club.insertMany(clubs);
  console.log(`   ✔ Inserted 50 Clubs.\n`);

  // ── Step 5: Assign Memberships (Full roles for each club) ────
  console.log("🎭 Distributing memberships & roles (All 5 roles per club)...");
  const clubMembersPayloads = [];

  for (let c = 0; c < clubs.length; c++) {
    const club = clubs[c];

    // Assign roles from the student pool (size: 49)
    // president, secretary, treasurer, event_manager, and 6 members (total 10 members per club)
    const roles = ["president", "secretary", "treasurer", "event_manager", "member", "member", "member", "member", "member", "member"];

    for (let rIdx = 0; rIdx < roles.length; rIdx++) {
      const studentIdx = (c + rIdx) % students.length;
      const student = students[studentIdx];
      const role = roles[rIdx];

      clubMembersPayloads.push({
        club_id: club._id,
        user_id: student._id,
        role,
        status: "active",
        reward_point: 200 + (rIdx * 150),
        joined_at: daysAgo(30 + rIdx),
      });
    }
  }
  await ClubMember.insertMany(clubMembersPayloads);
  console.log(`   ✔ Assigned 500 club memberships (All 5 roles present in all 50 clubs).\n`);

  // Re-retrieve memberships to get their generated _ids
  const dbMembers = await ClubMember.find({});

  // ── Step 6: Create Point Rules for all clubs ──────────────────
  console.log("🎯 Creating Point Rules for all 50 clubs...");
  const pointRulesPayloads = [];
  for (const club of clubs) {
    pointRulesPayloads.push(
      { club_id: club._id, action_type_id: attendanceAct._id, reward_point: 50, limit_per_event: 50, limit_per_day: 100, is_active: true, created_by: saAdmin._id },
      { club_id: club._id, action_type_id: feedbackAct._id, reward_point: 20, limit_per_event: 20, limit_per_day: 40, is_active: true, created_by: saAdmin._id },
      { club_id: club._id, action_type_id: meetingAct._id, reward_point: 30, limit_per_event: 30, limit_per_day: 60, is_active: true, created_by: saAdmin._id }
    );
  }
  await PointRule.insertMany(pointRulesPayloads);
  console.log(`   ✔ Created 150 Point Rules.\n`);

  // ── Step 7: Create Contribution Logs ─────────────────────────
  console.log("📈 Seeding Contribution Logs...");
  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);

  const dummyEventId = new mongoose.Types.ObjectId();
  const dummyRuleId = new mongoose.Types.ObjectId();
  const dummyActionId = new mongoose.Types.ObjectId();

  const logsPayloads = [];
  for (const member of dbMembers) {
    logsPayloads.push({
      membership_id: member._id,
      event_id: dummyEventId,
      rule_id: dummyRuleId,
      action_type_id: dummyActionId,
      reward_point: member.reward_point,
      month_key: currentMonth,
      created_at: daysAgo(5),
    });
  }
  await ContributionLog.insertMany(logsPayloads);
  console.log(`   ✔ Seeded contribution logs for all memberships.\n`);

  // ── Step 8: Create Join Forms ───────────────────────────────
  console.log("📨 Creating Join Forms...");
  const joinFormsPayloads = [];
  for (const club of clubs) {
    joinFormsPayloads.push({
      club_id: club._id,
      title: `Form Đăng ký gia nhập ${club.name}`,
      description: `Đơn đăng ký ứng tuyển chính thức cho ${club.name}. Vui lòng hoàn thành các câu hỏi khảo sát bên dưới.`,
      questions: [
        "Lý do bạn mong muốn đồng hành cùng câu lạc bộ?",
        "Thế mạnh hay khả năng đặc biệt mà bạn tự tin nhất?",
        "Bạn có đề xuất thời gian biểu sinh hoạt chung không?"
      ],
      status: "active",
      created_by: saAdmin._id,
    });
  }
  await JoinForm.insertMany(joinFormsPayloads);
  console.log(`   ✔ Generated 50 Join Forms.\n`);

  // ── Step 9: Create Events & Timelines (10 per club = 500 events) ──
  console.log("📅 Seeding 500 Events & Timelines (10 per club)...");
  const eventsPayloads = [];
  const timelinesPayloads = [];
  const hr = 3600 * 1000;
  const day = 24 * hr;

  for (let c = 0; c < clubs.length; c++) {
    const club = clubs[c];
    
    // Find the club president to mark as creator
    const presidentMember = dbMembers.find(m => String(m.club_id) === String(club._id) && m.role === "president");
    const creatorId = presidentMember ? presidentMember.user_id : saAdmin._id;

    for (let eIdx = 0; eIdx < 10; eIdx++) {
      let status, check_in_status, progress_status, start_time, end_time;

      if (eIdx < 5) {
        // 5 Completed Events (in the past)
        status = "closed";
        check_in_status = "closed";
        progress_status = "completed";
        start_time = daysAgo(10 + eIdx);
        end_time = daysAgo(10 + eIdx);
      } else if (eIdx === 5) {
        // 1 Active Check-in Open Event (right now)
        status = "opening";
        check_in_status = "open";
        progress_status = "completed";
        start_time = new Date(Date.now() - 30 * 60 * 1000);
        end_time = new Date(Date.now() + 4 * hr);
      } else {
        // 4 Upcoming Events (in the future)
        status = "coming soon";
        check_in_status = "not_open";
        progress_status = "draft";
        start_time = daysAhead(3 + (eIdx - 6) * 5);
        end_time = daysAhead(3 + (eIdx - 6) * 5 + 3 / 24);
      }

      const event = new Event({
        club_id: club._id,
        title: `${EVENT_TITLES[eIdx]} - ${club.name}`,
        description: `Sự kiện chính thức: ${EVENT_TITLES[eIdx]}. Hứa hẹn mang tới nhiều trải nghiệm thú vị cho toàn thể thành viên.`,
        content: `Mô tả chi tiết nội dung sự kiện, phân công công việc và quyền lợi thành viên khi tham gia đầy đủ chương trình.`,
        category: c % 4 === 0 ? "academic" : (c % 4 === 1 ? "arts" : (c % 4 === 2 ? "sports" : "volunteer")),
        location: `Hội trường ${c % 3 === 0 ? "A" : (c % 3 === 1 ? "B" : "C")} - Campus FPTU`,
        status,
        check_in_status,
        start_time,
        end_time,
        created_by: creatorId,
        capacity: 80 + eIdx * 10,
        is_public: true,
        multiplier: 1,
        progress_status,
        media_uris: [EVENT_BANNERS[eIdx % EVENT_BANNERS.length]]
      });
      eventsPayloads.push(event);

      // 2 Timeline items per event
      timelinesPayloads.push(
        { event_id: event._id, time: "08:00", timeline_at: start_time, title: "Check-in", description: "Bắt đầu đón khách và quét mã check-in", location: event.location, created_by: creatorId },
        { event_id: event._id, time: "08:30", timeline_at: start_time, title: "Khai mạc", description: "Khai mạc chương trình và bắt đầu hoạt động chính", location: event.location, created_by: creatorId }
      );
    }
  }

  await Event.insertMany(eventsPayloads);
  await EventTimeline.insertMany(timelinesPayloads);
  console.log(`   ✔ Inserted 500 Events and 1000 EventTimelines.\n`);

  // ── Step 9.5: Create Event Creation Requests ──────────────
  console.log("📝 Seeding Event Creation Requests...");
  const eventRequestsPayloads = [];
  for (let c = 0; c < clubs.length; c++) {
    const club = clubs[c];
    const presidentMember = dbMembers.find(m => String(m.club_id) === String(club._id) && m.role === "president");
    const creatorId = presidentMember ? presidentMember.user_id : saAdmin._id;

    eventRequestsPayloads.push({
      club_id: club._id,
      requested_by: creatorId,
      title: `(Pending) Yêu cầu sự kiện mới - ${club.name}`,
      description: `Yêu cầu tạo sự kiện trải nghiệm.`,
      content: `Nội dung chi tiết đang chờ duyệt.`,
      category: c % 4 === 0 ? "academic" : (c % 4 === 1 ? "arts" : (c % 4 === 2 ? "sports" : "volunteer")),
      location: `Sân băng`,
      start_time: daysAhead(10),
      end_time: daysAhead(10.5),
      capacity: 100,
      is_public: true,
      multiplier: 1,
      media_uris: [],
      approval_document_url: "https://docs.google.com/document/d/dummy",
      status: "pending"
    });
  }
  await EventCreationRequest.insertMany(eventRequestsPayloads);
  console.log(`   ✔ Inserted ${eventRequestsPayloads.length} Event Creation Requests.\n`);

  // Seed Event Registrations for the opening and closed events of each club
  console.log("📝 Registering members to events...");
  const registrationsPayloads = [];
  const targetEvents = eventsPayloads.filter(e => e.status === "opening" || e.status === "closed");

  for (const event of targetEvents) {
    // Find members of this club
    const clubMems = dbMembers.filter(m => String(m.club_id) === String(event.club_id));
    for (let i = 0; i < Math.min(clubMems.length, 5); i++) {
      registrationsPayloads.push({
        event_id: event._id,
        user_id: clubMems[i].user_id,
        status: event.status === "closed" ? "attended" : "registered",
        registered_at: daysAgo(event.status === "closed" ? 12 : 1),
      });
    }
  }
  await EventRegistration.insertMany(registrationsPayloads);
  console.log(`   ✔ Registered members to ${targetEvents.length} events.\n`);

  // ── Step 9.7: Seed Event Feedbacks ────────────────────────────
  console.log("💬 Seeding Event Feedbacks...");
  const feedbackPayloads = [];
  const closedEvents = eventsPayloads.filter(e => e.status === "closed");

  for (let idx = 0; idx < Math.min(closedEvents.length, 100); idx++) {
    const ev = closedEvents[idx];
    const registeredMems = registrationsPayloads.filter(r => String(r.event_id) === String(ev._id));
    for (let fIdx = 0; fIdx < Math.min(registeredMems.length, 2); fIdx++) {
      const reg = registeredMems[fIdx];
      feedbackPayloads.push({
        event_id: ev._id,
        user_id: reg.user_id,
        rating: 4 + (fIdx % 2), // 4 or 5 stars
        comment: fIdx === 0 
          ? "Sự kiện được tổ chức rất chỉn chu và nội dung cực kỳ hấp dẫn!" 
          : "Ban tổ chức nhiệt tình, địa điểm thoải mái. Sẽ tiếp tục tham gia các hoạt động tiếp theo!",
        created_at: daysAgo(8)
      });
    }
  }
  await Feedback.insertMany(feedbackPayloads);
  console.log(`   ✔ Seeded ${feedbackPayloads.length} Event Feedbacks.\n`);

  // ── Step 10: Create Club Activities (Weekly Schedule) ────────
  console.log("📅 Seeding Weekly Activities...");
  const monday = getMondayOfWeek(new Date());
  const activitiesPayloads = [];

  for (let c = 0; c < clubs.length; c++) {
    const club = clubs[c];
    // Seed 2 activities per club
    const daysOffset = [1, 3];
    for (let i = 0; i < daysOffset.length; i++) {
      const actStart = new Date(monday.getTime() + daysOffset[i] * day);
      actStart.setHours(9 + i * 5, 0, 0, 0);

      const actEnd = new Date(monday.getTime() + daysOffset[i] * day);
      actEnd.setHours(11 + i * 5, 0, 0, 0);

      activitiesPayloads.push({
        club_id: club._id,
        created_by: club.created_by,
        title: i === 0 ? `Tập luyện định kỳ ${club.name}` : `Họp ban chủ nhiệm ${club.name}`,
        description: `Buổi sinh hoạt tập thể quy tụ các thành viên cùng chia sẻ nâng cao chuyên môn.`,
        location: `Phòng sinh hoạt chung CLB ${c % 5 + 1}`,
        start_time: actStart,
        end_time: actEnd,
        status: i === 0 ? "opening" : "coming_soon",
        progress_status: "published",
      });
    }
  }
  await Activity.insertMany(activitiesPayloads);
  console.log(`   ✔ Seeded ${activitiesPayloads.length} activities.\n`);

  // ── Step 11: Create Rewards Store ────────────────────────────
  console.log("🎁 Seeding Rewards Inventory...");
  const rewardsPayloads = [];
  for (const club of clubs) {
    const presidentMember = dbMembers.find(m => String(m.club_id) === String(club._id) && m.role === "president");
    const creatorId = presidentMember ? presidentMember.user_id : saAdmin._id;

    for (let rIdx = 0; rIdx < REWARD_ITEMS.length; rIdx++) {
      const r = REWARD_ITEMS[rIdx];
      rewardsPayloads.push({
        club_id: club._id,
        name: `${r.name} (${club.name})`,
        description: `Phần quà đổi thưởng đặc quyền của ${club.name}. Đổi điểm lấy quà cực dễ!`,
        image_url: r.icon,
        point_cost: r.cost,
        quantity: 10 + rIdx * 5,
        status: "active",
        created_by: creatorId,
      });
    }
  }
  await Reward.insertMany(rewardsPayloads);
  console.log(`   ✔ Seeded ${rewardsPayloads.length} rewards.\n`);

  // ── Step 11.5: Seed Reward Redemptions & Reward Transactions ───
  console.log("🎁 Seeding Reward Redemptions & Transactions...");
  const redemptionsPayloads = [];
  const rewardTxPayloads = [];
  const dbRewards = await Reward.find({}).lean();

  for (let c = 0; c < clubs.length; c++) {
    const club = clubs[c];
    const clubRewards = dbRewards.filter(r => String(r.club_id) === String(club._id));
    const clubMems = dbMembers.filter(m => String(m.club_id) === String(club._id));

    if (clubRewards.length > 0 && clubMems.length > 0) {
      const reward = clubRewards[0];
      const member = clubMems[0];
      const presidentMember = dbMembers.find(m => String(m.club_id) === String(club._id) && m.role === "president");
      const reviewerId = presidentMember ? presidentMember.user_id : saAdmin._id;

      // Pending Redemption
      redemptionsPayloads.push({
        club_id: club._id,
        reward_id: reward._id,
        membership_id: member._id,
        quantity: 1,
        point_cost: reward.point_cost,
        total_point: reward.point_cost,
        status: "pending",
        created_at: daysAgo(1)
      });
      rewardTxPayloads.push({
        membership_id: member._id,
        reward_id: reward._id,
        points_spent: reward.point_cost,
        status: 0 // pending
      });

      // Approved Redemption
      if (clubMems.length > 1) {
        const member2 = clubMems[1];
        redemptionsPayloads.push({
          club_id: club._id,
          reward_id: reward._id,
          membership_id: member2._id,
          quantity: 1,
          point_cost: reward.point_cost,
          total_point: reward.point_cost,
          status: "approved",
          reviewed_by: reviewerId,
          reviewed_at: daysAgo(0.5),
          created_at: daysAgo(3)
        });
        rewardTxPayloads.push({
          membership_id: member2._id,
          reward_id: reward._id,
          points_spent: reward.point_cost,
          status: 1 // approved
        });
      }
    }
  }
  await RewardRedemption.insertMany(redemptionsPayloads);
  await RewardTransaction.insertMany(rewardTxPayloads);
  console.log(`   ✔ Seeded ${redemptionsPayloads.length} Reward Redemptions and ${rewardTxPayloads.length} Reward Transactions.\n`);

  // ── Step 12: Seed Polls (2 per club = 100 polls) ──────────────
  console.log("🗳️ Seeding 100 Polls & Votes...");
  const pollsPayloads = [];

  for (let c = 0; c < clubs.length; c++) {
    const club = clubs[c];
    const secretaryMember = dbMembers.find(m => String(m.club_id) === String(club._id) && m.role === "secretary");
    const creatorId = secretaryMember ? secretaryMember.user_id : saAdmin._id;

    const poll = new Poll({
      club_id: club._id,
      created_by: creatorId,
      title: `Bình chọn áo thun đồng phục mới - ${club.name} 👕`,
      description: "Khảo sát lấy ý kiến chung của tất cả thành viên để đặt làm áo đồng phục nhóm.",
      options: [
        { text: "Mẫu thiết kế 1 (Màu trắng trẻ trung)" },
        { text: "Mẫu thiết kế 2 (Màu đen cá tính)" }
      ],
      status: "open",
      start_at: daysAgo(1)
    });
    
    // Add mock votes from club members
    const clubMems = dbMembers.filter(m => String(m.club_id) === String(club._id));
    for (let i = 0; i < Math.min(clubMems.length, 3); i++) {
      poll.votes.push({
        user_id: clubMems[i].user_id,
        option_id: poll.options[i % 2]._id,
        voted_at: daysAgo(0.5)
      });
    }
    pollsPayloads.push(poll);
  }
  await Poll.insertMany(pollsPayloads);
  console.log(`   ✔ Seeded 100 Polls.\n`);

  // ── Step 13: Seed Invitations ─────────────────────────────────
  console.log("✉️ Seeding Invitations...");
  const invitationsPayloads = [];

  for (let c = 0; c < clubs.length; c++) {
    const club = clubs[c];
    const presidentMember = dbMembers.find(m => String(m.club_id) === String(club._id) && m.role === "president");
    const creatorId = presidentMember ? presidentMember.user_id : saAdmin._id;

    // Find non-member student to invite
    const memberIds = dbMembers.filter(m => String(m.club_id) === String(club._id)).map(m => String(m.user_id));
    const nonMember = students.find(s => !memberIds.includes(String(s._id)));

    if (nonMember) {
      invitationsPayloads.push({
        club_id: club._id,
        invited_user_id: nonMember._id,
        invited_by: creatorId,
        role: "member",
        message: `Chào bạn, mình thay mặt ${club.name} mời bạn tham gia nhóm hoạt động của CLB nhé!`,
        status: "pending",
        created_at: daysAgo(2)
      });
    }
  }
  await Invitation.insertMany(invitationsPayloads);
  console.log(`   ✔ Seeded ${invitationsPayloads.length} invitations.\n`);

  // ── Step 14: Seed Transactions & Payments ──────────────────────
  console.log("💰 Seeding Financial Transactions & Payments...");
  const transactionsPayloads = [];

  for (let c = 0; c < clubs.length; c++) {
    const club = clubs[c];
    const treasurerMember = dbMembers.find(m => String(m.club_id) === String(club._id) && m.role === "treasurer");
    const creatorId = treasurerMember ? treasurerMember.user_id : saAdmin._id;

    // Seed 1 Income & 1 Expense per club
    transactionsPayloads.push(
      {
        club_id: club._id,
        type: 0, // income
        category: "Membership Fee",
        period: "Q1/2026",
        amount: 100000,
        description: `Thu quỹ câu lạc bộ Quý 1 năm 2026 - ${club.name}`,
        transaction_date: daysAgo(20),
        status: 1, // approved
        created_by: creatorId,
        approved_by: saAdmin._id
      },
      {
        club_id: club._id,
        type: 1, // expense
        category: "Equipment",
        period: "Q1/2026",
        amount: 250000,
        description: `Chi mua văn phòng phẩm và dụng cụ sinh hoạt - ${club.name}`,
        transaction_date: daysAgo(10),
        status: 1, // approved
        created_by: creatorId,
        approved_by: saAdmin._id
      }
    );
  }
  await Transaction.insertMany(transactionsPayloads);
  console.log(`   ✔ Seeded ${transactionsPayloads.length} financial transactions.\n`);

  // ── Step 14.5: Seed Payments ──────────────────────────────────
  console.log("💳 Seeding Payments for Financial Transactions...");
  const paymentsPayloads = [];
  const dbTransactions = await Transaction.find({ type: 0 }).lean(); // Income transactions

  for (let i = 0; i < dbTransactions.length; i++) {
    const tx = dbTransactions[i];
    const clubMems = dbMembers.filter(m => String(m.club_id) === String(tx.club_id));

    if (clubMems.length > 0) {
      const member = clubMems[i % clubMems.length];
      paymentsPayloads.push({
        membership_id: member._id,
        transaction_id: tx._id,
        period: tx.period || "Q1/2026",
        amount: tx.amount,
        status: 1, // Success
        payment_method: i % 2 === 0 ? 0 : 1, // 0 = Cash, 1 = VNPay
        txn_ref: i % 2 === 1 ? `VNP${Date.now()}${i}` : undefined,
        vnp_response_code: i % 2 === 1 ? "00" : undefined,
        order_info: `Thanh toan ${tx.description}`,
        paid_at: daysAgo(5 + (i % 10))
      });
    }
  }
  await Payment.insertMany(paymentsPayloads);
  console.log(`   ✔ Seeded ${paymentsPayloads.length} Payments.\n`);

  // ── Step 15: Summary & Print Tokens ───────────────────────────
  console.log("=================================================");
  console.log("🎉 MASTER DATABASE SEEDING COMPLETED SUCCESSFULLY!");
  console.log("=================================================");
  
  console.log(`
👑 TÀI KHOẢN ADMIN TRƯỜNG – SA
   Email   : admin@fpt.edu.vn
   Console : localStorage.setItem('token','${makeToken(saAdmin)}'); location.reload();

👑 TÀI KHOẢN PRESIDENT CLB – TY (President of Music Club)
   Email   : tynce181041@fpt.edu.vn
   Console : localStorage.setItem('token','${makeToken(tyUser)}'); location.reload();

✍️ TÀI KHOẢN THƯ KÝ MUSIC CLUB – BICH (Secretary of Music Club)
   Email   : demo1@fpt.edu.vn
   Console : localStorage.setItem('token','${makeToken(users[2])}'); location.reload();

💰 TÀI KHOẢN THỦ QUỸ MUSIC CLUB – CUONG (Treasurer of Music Club)
   Email   : demo2@fpt.edu.vn
   Console : localStorage.setItem('token','${makeToken(users[3])}'); location.reload();
`);
  console.log("=================================================");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
