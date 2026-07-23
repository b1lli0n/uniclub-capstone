const mongoose = require("mongoose");
const env = require("./src/config/env");
const jwt = require("jsonwebtoken");

const User = require("./src/models/user.model");
const Profile = require("./src/models/profile.model");
const Club = require("./src/models/club.model");
const ClubMember = require("./src/models/club_member.model");
const Event = require("./src/models/event.model");
const EventRegistration = require("./src/models/event_registration.model");
const EventTimeline = require("./src/models/event_timeline.model");
const Activity = require("./src/models/activity.model");
const Reward = require("./src/models/reward.model");
const RewardRedemption = require("./src/models/reward_redemption.model");
const ContributionLog = require("./src/models/contribution_log.model");

const MUSIC_CLUB_ID = "6a3c34121f6805a34580c4b2";

function makeToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    env.jwtSecret,
    { expiresIn: "7d" }
  );
}

async function ensureUser(email, fullName) {
  let u = await User.findOne({ email });
  if (!u) {
    u = await User.create({
      full_name: fullName,
      email,
      role: "student",
      provider: "google",
      provider_id: `google-${email.split("@")[0]}`,
      status: "active",
    });
  } else {
    u.full_name = fullName;
    await u.save();
  }
  const exists = await Profile.findOne({ user_id: u._id });
  if (!exists) {
    await Profile.create({
      user_id: u._id,
      student_code: `SE${Math.floor(100000 + Math.random() * 900000)}`,
      phone: "090" + Math.floor(1000000 + Math.random() * 9000000),
      major: "Software Engineering",
      campus: "Da Nang Campus",
      social_links: {}
    });
  }
  return u;
}

function getMondayOfWeek(d) {
  const day = d.getDay();
  const diff = d.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(d.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
}

async function main() {
  console.log("🔌 Connecting...");
  await mongoose.connect(env.mongodbUri);
  console.log("✅ Connected!\n");

  const clubId = new mongoose.Types.ObjectId(MUSIC_CLUB_ID);

  // ── 1. Users ─────────────────────────────────
  console.log("👥 Users...");
  const tyUser = await ensureUser("tynce181041@fpt.edu.vn", "Nguyen Ty (K18 CT)");
  const demo1  = await ensureUser("demo1@fpt.edu.vn", "Tran Thi Bich");
  const demo2  = await ensureUser("demo2@fpt.edu.vn", "Le Van Cuong");
  const demo3  = await ensureUser("demo3@fpt.edu.vn", "Pham Thi Dung");
  const demo4  = await ensureUser("demo4@fpt.edu.vn", "Hoang Minh Duc");
  const demo5  = await ensureUser("demo5@fpt.edu.vn", "Vo Thanh Long");
  const demos  = [demo1, demo2, demo3, demo4, demo5];
  console.log(`  ✔ Ty: ${tyUser._id}`);
  demos.forEach(d => console.log(`  ✔ ${d.full_name}: ${d._id}`));

  // ── 2. Club ──────────────────────────────────
  console.log("\n🏢 Music Club...");
  await Club.findOneAndUpdate(
    { _id: clubId },
    {
      _id: clubId,
      name: "Music Club",
      category: "arts",
      description: "Official Music Club of FPT University Da Nang.",
      logo_url: "https://localhost:5000/uploads/clubs/music_club_logo.png",
      created_by: tyUser._id,
      status: "active",
    },
    { upsert: true, new: true }
  );
  console.log(`  ✅ Music Club (${clubId})`);

  // ── 3. Memberships ────────────────────────────
  console.log("\n🎭 Memberships (Music Club only)...");
  await ClubMember.deleteMany({ club_id: clubId });

  const memberDefs = [
    { user: tyUser, role: "event_manager", points: 1500 },
    { user: demo1,  role: "member", points: 800 },
    { user: demo2,  role: "member", points: 650 },
    { user: demo3,  role: "member", points: 900 },
    { user: demo4,  role: "member", points: 550 },
    { user: demo5,  role: "member", points: 700 },
  ];
  
  const membershipsMap = {};

  for (const d of memberDefs) {
    const memberDoc = await ClubMember.create({
      club_id: clubId,
      user_id: d.user._id,
      role: d.role,
      status: "active",
      reward_point: d.points,
      joined_at: new Date(),
    });
    membershipsMap[d.user.email] = memberDoc;
    console.log(`  ✔ ${d.user.full_name} → ${d.role} (${d.points} cached points)`);
  }

  // ── 4. Contribution Logs (Synchronizing dynamic points check) ─────
  console.log("\n📈 Point Contribution Logs...");
  await ContributionLog.deleteMany({ membership_id: { $in: Object.values(membershipsMap).map(m => m._id) } });
  
  const dummyEventId = new mongoose.Types.ObjectId();
  const dummyRuleId = new mongoose.Types.ObjectId();
  const dummyActionId = new mongoose.Types.ObjectId();
  const currentMonth = new Date();
  currentMonth.setDate(1);
  currentMonth.setHours(0, 0, 0, 0);

  for (const email of Object.keys(membershipsMap)) {
    const mem = membershipsMap[email];
    const def = memberDefs.find(d => d.user.email === email);
    
    // We seed contribution logs equal to the user's initial point balance + a buffer (since total = logs - approved)
    // For simplicity, we just award them logs equal to their cached points
    await ContributionLog.create({
      membership_id: mem._id,
      event_id: dummyEventId,
      rule_id: dummyRuleId,
      action_type_id: dummyActionId,
      reward_point: def.points,
      month_key: currentMonth,
      created_at: new Date(),
    });
    console.log(`  ✔ Seeded contribution logs of ${def.points} pts for ${email}`);
  }

  // ── 5. Events & Timelines ──────────────────────
  console.log("\n📅 Events (Music Club)...");
  await Event.deleteMany({ club_id: clubId });
  await EventRegistration.deleteMany({});
  await EventTimeline.deleteMany({});

  const now = Date.now();
  const hr  = 3600 * 1000;
  const day = 86400 * 1000;
  const todayDate = new Date();

  // Event demo chính để test camera check-in
  const demoEvent = await Event.create({
    club_id:         clubId,
    title:           "🎤 Camera Check-in DEMO Concert 2026",
    description:     "Sự kiện demo tính năng quét mã vé bằng camera. Check-in đang MỞ!",
    content:         "Sự kiện demo tính năng quét mã vé bằng camera của UniClub.",
    category:        "arts",
    location:        "FPT University Da Nang – Hội trường A",
    status:          "opening",
    check_in_status: "open",
    start_time:      new Date(now - 30 * 60 * 1000),
    end_time:        new Date(now + 4 * hr),
    created_by:      tyUser._id,
    capacity:        80,
    is_public:       true,
    multiplier:      1,
    progress_status: "completed",
  });

  // Timeline
  await EventTimeline.insertMany([
    { event_id: demoEvent._id, time: "08:00", timeline_at: new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 8,  0), title: "Check-in & Gặp gỡ",   description: "Tập hợp, nhận thẻ tên.",             location: "Sảnh tầng 1",  created_by: tyUser._id },
    { event_id: demoEvent._id, time: "08:30", timeline_at: new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 8, 30), title: "Khai mạc",             description: "Phát biểu khai mạc chương trình.", location: "Hội trường A", created_by: tyUser._id },
    { event_id: demoEvent._id, time: "10:00", timeline_at: new Date(todayDate.getFullYear(), todayDate.getMonth(), todayDate.getDate(), 10, 0), title: "Tea break & Minigame", description: "Nghỉ giải lao và minigame.",        location: "Sân thượng",   created_by: tyUser._id },
  ]);
  console.log(`  ✅ DEMO event: ${demoEvent.title} (check_in: OPEN)`);

  const evt2 = await Event.create({
    club_id: clubId, title: "Vocal Training Workshop", description: "Lớp học luyện giọng.",
    content: "Lớp học luyện giọng.", category: "arts",
    location: "FPT University Da Nang – Phòng âm nhạc B", status: "opening",
    check_in_status: "not_open", start_time: new Date(now + 2*hr), end_time: new Date(now + 4*hr),
    created_by: tyUser._id, capacity: 40, is_public: true, multiplier: 1, progress_status: "completed",
  });
  const evt3 = await Event.create({
    club_id: clubId, title: "UniClub's Got Talent Auditions", description: "Vòng thử giọng tài năng.",
    content: "Vòng thử giọng tài năng campus.", category: "arts",
    location: "FPT University Da Nang – Hội trường A", status: "coming soon",
    check_in_status: "not_open", start_time: new Date(now + 7*day), end_time: new Date(now + 7*day + 3*hr),
    created_by: tyUser._id, capacity: 100, is_public: true, multiplier: 1, progress_status: "completed",
  });

  // ── 6. Event Registrations ──────────────────────
  const registrations = [];
  for (const demo of demos) {
    const reg = await EventRegistration.create({
      event_id:      demoEvent._id,
      user_id:       demo._id,
      status:        "registered",
      registered_at: new Date(now - 3*day),
      check_in_time: null,
      checked_in_by: null,
    });
    registrations.push({ user: demo, reg });
  }

  // ── 7. Club Activities (Current week) ───────────
  console.log("\n📅 Seeding Club Activities for current week...");
  await Activity.deleteMany({ club_id: clubId });

  const monday = getMondayOfWeek(new Date());
  
  const activitiesData = [
    { offsetDays: 0, startHr: 9,  endHr: 11, title: "🎸 Guitar & Chord Practice", desc: "Buổi luyện tập nhạc cụ dây cơ bản cho người mới.", loc: "Phòng Âm nhạc 1", status: "closed" },
    { offsetDays: 0, startHr: 14, endHr: 16, title: "🎼 Nhạc lý căn bản", desc: "Chia sẻ lý thuyết cơ bản về âm giai và điệu thức.", loc: "Hội trường B", status: "closed" },
    { offsetDays: 1, startHr: 10, endHr: 12, title: "🎤 Vocal Warm-up Workout", desc: "Bài tập luyện giọng và khởi động dây thanh quản.", loc: "Phòng tập A", status: "opening" },
    { offsetDays: 1, startHr: 15, endHr: 17, title: "🎹 Lớp học Piano Cơ bản", desc: "Học cách chạy ngón và hợp âm đơn giản.", loc: "Phòng Âm nhạc 2", status: "opening" },
    { offsetDays: 2, startHr: 9,  endHr: 12, title: "✍️ Songwriting & Lyrist Studio", desc: "Góc thảo luận và sáng tác các tác phẩm âm nhạc mới.", loc: "Căng tin tầng 3", status: "opening" },
    { offsetDays: 2, startHr: 14, endHr: 17, title: "🥁 Drumming Rhythm Clinic", desc: "Tập giữ nhịp và các tiết điệu trống Cajon/Jazz.", loc: "Phòng tập Âm nhạc", status: "opening" },
    { offsetDays: 3, startHr: 10, endHr: 12, title: "🎻 Violin Masterclass Session", desc: "Kỹ thuật kéo vĩ cơ bản và tư thế đứng chuẩn.", loc: "Phòng Âm nhạc 1", status: "coming_soon" },
    { offsetDays: 3, startHr: 15, endHr: 18, title: "🎵 Band Rehearsal - Rock Ballad", desc: "Ráp nhạc ban nhạc chuẩn bị cho sự kiện tới.", loc: "Hội trường chính", status: "coming_soon" },
    { offsetDays: 4, startHr: 18, endHr: 21, title: "☕ Acoustic Cafe Night", desc: "Giao lưu ca hát mộc mạc cuối tuần.", loc: "Sân thượng tòa nhà Alpha", status: "coming_soon" },
    { offsetDays: 4, startHr: 14, endHr: 16, title: "🎛️ Sound Mixing & EQ Basics", desc: "Tìm hiểu bàn mixer và điều chỉnh âm thanh biểu diễn.", loc: "Phòng Kỹ thuật", status: "coming_soon" },
    { offsetDays: 5, startHr: 9,  endHr: 12, title: "🌟 Stage Presence Training", desc: "Kỹ năng trình diễn sân khấu và tương tác khán giả.", loc: "Hội trường A", status: "coming_soon" },
    { offsetDays: 6, startHr: 15, endHr: 18, title: "🍕 Weekend Jam Session & Pizza", desc: "Buổi jam ngẫu hứng tự do của các thành viên.", loc: "Phòng tập B", status: "coming_soon" }
  ];

  for (const act of activitiesData) {
    const actStart = new Date(monday.getTime() + act.offsetDays * day);
    actStart.setHours(act.startHr, 0, 0, 0);

    const actEnd = new Date(monday.getTime() + act.offsetDays * day);
    actEnd.setHours(act.endHr, 0, 0, 0);

    await Activity.create({
      club_id: clubId,
      created_by: tyUser._id,
      title: act.title,
      description: act.desc,
      location: act.loc,
      start_time: actStart,
      end_time: actEnd,
      status: act.status,
      progress_status: "published",
    });
  }
  console.log(`  ✅ Seeded ${activitiesData.length} activities spread across the current week.`);

  // ── 8. Rewards Store ───────────────────────────
  console.log("\n🎁 Seeding Rewards...");
  await Reward.deleteMany({ club_id: clubId });

  const r1 = await Reward.create({
    club_id: clubId,
    name: "Highlands Coffee Voucher 30K",
    description: "Voucher giảm giá 30,000 VND khi mua đồ uống tại mọi cửa hàng Highlands Coffee.",
    image_url: "☕",
    point_cost: 200,
    quantity: 15,
    status: "active",
    created_by: tyUser._id,
  });

  const r2 = await Reward.create({
    club_id: clubId,
    name: "UniClub Exclusive Hoodie",
    description: "Áo khoác hoodie nỉ ngoại cỡ thêu nổi logo UniClub FPT cực cool ngầu.",
    image_url: "🧥",
    point_cost: 1000,
    quantity: 3,
    status: "active",
    created_by: tyUser._id,
  });

  const r3 = await Reward.create({
    club_id: clubId,
    name: "Vé xem phim CGV 2D",
    description: "Một vé xem phim 2D áp dụng tại tất cả các cụm rạp CGV toàn quốc.",
    image_url: "🎬",
    point_cost: 350,
    quantity: 8,
    status: "active",
    created_by: tyUser._id,
  });

  const r4 = await Reward.create({
    club_id: clubId,
    name: "Sổ tay & Bút viết Music Club",
    description: "Sổ tay bìa da kèm bút mực xanh in chìm thương hiệu câu lạc bộ âm nhạc.",
    image_url: "📓",
    point_cost: 150,
    quantity: 30,
    status: "active",
    created_by: tyUser._id,
  });

  console.log("  ✅ Seeded 4 rewards: Highlands Voucher, Hoodie, CGV Ticket, Notebook.");

  // ── 9. Seeding Redemption Requests ──────────────────
  console.log("\n🎟️ Seeding Redemption Requests...");
  await RewardRedemption.deleteMany({ club_id: clubId });

  // Pending 1: Bich (demo1) wants Coffee Voucher (200 pts)
  await RewardRedemption.create({
    club_id: clubId,
    reward_id: r1._id,
    membership_id: membershipsMap["demo1@fpt.edu.vn"]._id,
    quantity: 1,
    point_cost: 200,
    total_point: 200,
    status: "pending",
  });

  // Pending 2: Cuong (demo2) wants CGV Ticket (350 pts)
  await RewardRedemption.create({
    club_id: clubId,
    reward_id: r3._id,
    membership_id: membershipsMap["demo2@fpt.edu.vn"]._id,
    quantity: 1,
    point_cost: 350,
    total_point: 350,
    status: "pending",
  });

  // Approved 1: Dung (demo3) has received Notebook (150 pts)
  await RewardRedemption.create({
    club_id: clubId,
    reward_id: r4._id,
    membership_id: membershipsMap["demo3@fpt.edu.vn"]._id,
    quantity: 1,
    point_cost: 150,
    total_point: 150,
    status: "approved",
    reviewed_by: tyUser._id,
    reviewed_at: new Date(now - 1*day),
  });

  console.log("  ✅ Seeded redemptions: 2 pending requests, 1 approved history entry.");

  // ── 10. Output Tokens & Summary ─────────────────
  console.log("\n" + "═".repeat(70));
  console.log("🎫  TOKENS & INFO");
  console.log("═".repeat(70));

  const tyToken = makeToken(tyUser);
  console.log(`
👑 TÀI KHOẢN QUẢN LÝ – TY (Event Manager & President, Music Club)
   Email : tynce181041@fpt.edu.vn
   Console login:
   localStorage.setItem('token','${tyToken}'); location.reload();
`);

  console.log("─".repeat(70));
  console.log("🙋 TÀI KHOẢN THÀNH VIÊN DEMO – Để test đổi thưởng và quét QR\n");

  for (const { user, reg } of registrations) {
    const token = makeToken(user);
    console.log(`  👤 ${user.full_name} (${user.email})`);
    console.log(`     Points  : ${membershipsMap[user.email].reward_point} pts`);
    console.log(`     Console : localStorage.setItem('token','${token}'); location.reload();`);
    console.log();
  }

  console.log("═".repeat(70));
  console.log(`📌 Hướng dẫn kiểm tra:
    1. Đăng nhập với Ty để: Duyệt yêu cầu đổi quà, Quản lý kho quà.
    2. Đăng nhập với Demo1/2 để: Mua quà mới, kiểm tra lịch sử đổi quà.
    3. Vào mục Activity Schedule để kiểm tra tuần hiện tại hiển thị đầy ắp 12 hoạt động!
`);

  await mongoose.disconnect();
  console.log("✅ Done!\n");
}

main().catch(err => { console.error(err); process.exit(1); });
