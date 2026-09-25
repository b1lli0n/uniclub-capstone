/**
 * Comprehensive Seed script for UniClub Capstone Demo & Full Ecosystem
 * Run: node seed_demo_data.js
 */
const mongoose = require("mongoose");
const env = require("./src/config/env");

// Models
const User = require("./src/models/user.model");
const Profile = require("./src/models/profile.model");
const Club = require("./src/models/club.model");
const ClubMember = require("./src/models/club_member.model");
const ActionType = require("./src/models/action_type.model");
const PointRule = require("./src/models/point_rule.model");
const JoinForm = require("./src/models/join_form.model");
const JoinRequest = require("./src/models/join_request.model");
const Event = require("./src/models/event.model");
const EventRegistration = require("./src/models/event_registration.model");
const Poll = require("./src/models/poll.model");
const Reward = require("./src/models/reward.model");
const RewardRedemption = require("./src/models/reward_redemption.model");
const Transaction = require("./src/models/transaction.model");
const Payment = require("./src/models/payment.model");
const Activity = require("./src/models/activity.model");
const ActivityAttendance = require("./src/models/activity_attendance.model");
const ClubCreationRequest = require("./src/models/club_creation_requests.model");
const EventCreationRequest = require("./src/models/event_creation_request.model");
const EventTimeline = require("./src/models/event_timeline.model");
const ContributionLog = require("./src/models/contribution_log.model");
const Feedback = require("./src/models/feedback.model");

async function seed() {
  console.log("Connecting to MongoDB:", env.mongodbUri);
  await mongoose.connect(env.mongodbUri);
  console.log("Connected successfully. Seeding comprehensive data for Demo & Full Ecosystem...\n");

  // =========================================================================
  // 1. CREATE CORE DEMO USERS + PROFILES
  // =========================================================================
  console.log("--- 1. Creating Users & Profiles ---");
  const usersData = [
    // Staff & Admin
    {
      email: "uniclub2402@gmail.com",
      full_name: "Nguyen Van Admin",
      role: "student_affairs",
      provider: "feid",
      provider_id: "sa_admin_uniclub",
      avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      student_code: "SA001",
      phone: "0909000001",
    },
    {
      email: "admin@fpt.edu.vn",
      full_name: "Tran Thi CTSV",
      role: "student_affairs",
      provider: "feid",
      provider_id: "sa_admin_01",
      avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      student_code: "SA002",
      phone: "0909000002",
    },
    // FGC Core Demo Members
    {
      email: "bangdreamer01@gmail.com",
      full_name: "Nguyen Bang (President)",
      role: "student",
      provider: "feid",
      provider_id: "bangdreamer01_feid",
      avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
      student_code: "CE160001",
      phone: "0901234501",
    },
    {
      email: "demo35@fpt.edu.vn",
      full_name: "Nguyen Quoc Khanh",
      role: "student",
      provider: "feid",
      provider_id: "demo35_feid",
      avatar_url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
      student_code: "CE160035",
      phone: "0901234535",
    },
    {
      email: "demo33@fpt.edu.vn",
      full_name: "Do Thi Giang",
      role: "student",
      provider: "feid",
      provider_id: "demo33_feid",
      avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      student_code: "CE160033",
      phone: "0901234533",
    },
    {
      email: "demo34@fpt.edu.vn",
      full_name: "Ho Minh Hung",
      role: "student",
      provider: "feid",
      provider_id: "demo34_feid",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      student_code: "CE160034",
      phone: "0901234534",
    },
    {
      email: "demo36@fpt.edu.vn",
      full_name: "Tran Thanh Linh",
      role: "student",
      provider: "feid",
      provider_id: "demo36_feid",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      student_code: "CE160036",
      phone: "0901234536",
    },
    {
      email: "tynce181041@fpt.edu.vn",
      full_name: "Nguyen Ty",
      role: "student",
      provider: "feid",
      provider_id: "tynce181041_feid",
      avatar_url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150",
      student_code: "CE181041",
      phone: "0901234041",
    },
    // 5 Applicants for President Join Request Approval demo
    {
      email: "applicant1@fpt.edu.vn",
      full_name: "Tran Van An",
      role: "student",
      provider: "feid",
      provider_id: "app1_feid",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      student_code: "CE170011",
      phone: "0902000011",
    },
    {
      email: "applicant2@fpt.edu.vn",
      full_name: "Le Thi Binh",
      role: "student",
      provider: "feid",
      provider_id: "app2_feid",
      avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      student_code: "CE170012",
      phone: "0902000012",
    },
    {
      email: "applicant3@fpt.edu.vn",
      full_name: "Pham Hoang Cuong",
      role: "student",
      provider: "feid",
      provider_id: "app3_feid",
      avatar_url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150",
      student_code: "CE170013",
      phone: "0902000013",
    },
    {
      email: "applicant4@fpt.edu.vn",
      full_name: "Vu Thi Duyen",
      role: "student",
      provider: "feid",
      provider_id: "app4_feid",
      avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
      student_code: "CE170014",
      phone: "0902000014",
    },
    {
      email: "applicant5@fpt.edu.vn",
      full_name: "Dang Van Hai",
      role: "student",
      provider: "feid",
      provider_id: "app5_feid",
      avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
      student_code: "CE170015",
      phone: "0902000015",
    },

    // Additional 30 Students across campus for ecosystem richness
    {
      email: "student1@fpt.edu.vn",
      full_name: "Le Bao Anh",
      role: "student",
      provider: "feid",
      provider_id: "student1_feid",
      avatar_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
      student_code: "SE170101",
      phone: "0903000101",
    },
    {
      email: "student2@fpt.edu.vn",
      full_name: "Hoang Minh Tri",
      role: "student",
      provider: "feid",
      provider_id: "student2_feid",
      avatar_url: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150",
      student_code: "SE170102",
      phone: "0903000102",
    },
    {
      email: "student3@fpt.edu.vn",
      full_name: "Pham Gia Phuc",
      role: "student",
      provider: "feid",
      provider_id: "student3_feid",
      avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
      student_code: "SE170103",
      phone: "0903000103",
    },
    {
      email: "student4@fpt.edu.vn",
      full_name: "Tran Dinh Trong",
      role: "student",
      provider: "feid",
      provider_id: "student4_feid",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      student_code: "SE170104",
      phone: "0903000104",
    },
    {
      email: "student5@fpt.edu.vn",
      full_name: "Nguyen Hoang Minh",
      role: "student",
      provider: "feid",
      provider_id: "student5_feid",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      student_code: "GD170201",
      phone: "0903000201",
    },
    {
      email: "student6@fpt.edu.vn",
      full_name: "Tran Kim Ngan",
      role: "student",
      provider: "feid",
      provider_id: "student6_feid",
      avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
      student_code: "GD170202",
      phone: "0903000202",
    },
    {
      email: "student7@fpt.edu.vn",
      full_name: "Luong Tuan Anh",
      role: "student",
      provider: "feid",
      provider_id: "student7_feid",
      avatar_url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150",
      student_code: "GD170203",
      phone: "0903000203",
    },
    {
      email: "student8@fpt.edu.vn",
      full_name: "Mai Phuong Linh",
      role: "student",
      provider: "feid",
      provider_id: "student8_feid",
      avatar_url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150",
      student_code: "GD170204",
      phone: "0903000204",
    },
    {
      email: "student9@fpt.edu.vn",
      full_name: "Pham Dang Khoa",
      role: "student",
      provider: "feid",
      provider_id: "student9_feid",
      avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
      student_code: "IA170301",
      phone: "0903000301",
    },
    {
      email: "student10@fpt.edu.vn",
      full_name: "Vo Quoc Toan",
      role: "student",
      provider: "feid",
      provider_id: "student10_feid",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      student_code: "IA170302",
      phone: "0903000302",
    },
    {
      email: "student11@fpt.edu.vn",
      full_name: "Dang Huu Thang",
      role: "student",
      provider: "feid",
      provider_id: "student11_feid",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      student_code: "IA170303",
      phone: "0903000303",
    },
    {
      email: "student12@fpt.edu.vn",
      full_name: "Le Tan Phat",
      role: "student",
      provider: "feid",
      provider_id: "student12_feid",
      avatar_url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150",
      student_code: "IA170304",
      phone: "0903000304",
    },
    {
      email: "student13@fpt.edu.vn",
      full_name: "Vo Ngoc Bich",
      role: "student",
      provider: "feid",
      provider_id: "student13_feid",
      avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
      student_code: "MC170401",
      phone: "0903000401",
    },
    {
      email: "student14@fpt.edu.vn",
      full_name: "Nguyen Thanh Truc",
      role: "student",
      provider: "feid",
      provider_id: "student14_feid",
      avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
      student_code: "MC170402",
      phone: "0903000402",
    },
    {
      email: "student15@fpt.edu.vn",
      full_name: "Dinh Tien Dung",
      role: "student",
      provider: "feid",
      provider_id: "student15_feid",
      avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
      student_code: "MC170403",
      phone: "0903000403",
    },
    {
      email: "student16@fpt.edu.vn",
      full_name: "Ngo Thien An",
      role: "student",
      provider: "feid",
      provider_id: "student16_feid",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
      student_code: "MC170404",
      phone: "0903000404",
    },
    {
      email: "student17@fpt.edu.vn",
      full_name: "Do Tuan Kiet",
      role: "student",
      provider: "feid",
      provider_id: "student17_feid",
      avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
      student_code: "IB170501",
      phone: "0903000501",
    },
    {
      email: "student18@fpt.edu.vn",
      full_name: "Chu Bao Ngoc",
      role: "student",
      provider: "feid",
      provider_id: "student18_feid",
      avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
      student_code: "IB170502",
      phone: "0903000502",
    },
    {
      email: "student19@fpt.edu.vn",
      full_name: "Lam Gia Han",
      role: "student",
      provider: "feid",
      provider_id: "student19_feid",
      avatar_url: "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150",
      student_code: "IB170503",
      phone: "0903000503",
    },
    {
      email: "student20@fpt.edu.vn",
      full_name: "Ha Quang Vinh",
      role: "student",
      provider: "feid",
      provider_id: "student20_feid",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      student_code: "IB170504",
      phone: "0903000504",
    },
    {
      email: "student21@fpt.edu.vn",
      full_name: "Bui Phuong Thao",
      role: "student",
      provider: "feid",
      provider_id: "student21_feid",
      avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
      student_code: "EN170601",
      phone: "0903000601",
    },
    {
      email: "student22@fpt.edu.vn",
      full_name: "Tran Dang Khoa",
      role: "student",
      provider: "feid",
      provider_id: "student22_feid",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
      student_code: "EN170602",
      phone: "0903000602",
    },
    {
      email: "student23@fpt.edu.vn",
      full_name: "Phan Thu Huong",
      role: "student",
      provider: "feid",
      provider_id: "student23_feid",
      avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
      student_code: "EN170603",
      phone: "0903000603",
    },
    {
      email: "student24@fpt.edu.vn",
      full_name: "Le Hoang Nam",
      role: "student",
      provider: "feid",
      provider_id: "student24_feid",
      avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
      student_code: "EN170604",
      phone: "0903000604",
    },
    {
      email: "student25@fpt.edu.vn",
      full_name: "Phan Gia Huy",
      role: "student",
      provider: "feid",
      provider_id: "student25_feid",
      avatar_url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150",
      student_code: "SE180701",
      phone: "0903000701",
    },
    {
      email: "student26@fpt.edu.vn",
      full_name: "Nguyen Tan Dat",
      role: "student",
      provider: "feid",
      provider_id: "student26_feid",
      avatar_url: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150",
      student_code: "SE180702",
      phone: "0903000702",
    },
    {
      email: "student27@fpt.edu.vn",
      full_name: "Duong Minh Nhat",
      role: "student",
      provider: "feid",
      provider_id: "student27_feid",
      avatar_url: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150",
      student_code: "SE180703",
      phone: "0903000703",
    },
    {
      email: "student28@fpt.edu.vn",
      full_name: "Trinh Duc Anh",
      role: "student",
      provider: "feid",
      provider_id: "student28_feid",
      avatar_url: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150",
      student_code: "SE180704",
      phone: "0903000704",
    },
    {
      email: "student29@fpt.edu.vn",
      full_name: "Vu Thuy Trang",
      role: "student",
      provider: "feid",
      provider_id: "student29_feid",
      avatar_url: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150",
      student_code: "AI180801",
      phone: "0903000801",
    },
    {
      email: "student30@fpt.edu.vn",
      full_name: "Ly Cong Uan",
      role: "student",
      provider: "feid",
      provider_id: "student30_feid",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
      student_code: "AI180802",
      phone: "0903000802",
    },
  ];

  const userMap = {};
  for (const u of usersData) {
    let user = await User.findOne({ email: u.email });
    if (!user) {
      user = await User.create({
        email: u.email,
        full_name: u.full_name,
        role: u.role,
        provider: u.provider,
        provider_id: u.provider_id,
        avatar_url: u.avatar_url,
      });
    } else {
      user.full_name = u.full_name;
      user.role = u.role;
      user.avatar_url = u.avatar_url;
      await user.save();
    }
    userMap[u.email] = user;

    // Create / Update Profile with student_code
    if (u.student_code) {
      let prof = await Profile.findOne({ user_id: user._id });
      if (!prof) {
        await Profile.create({
          user_id: user._id,
          avatar: u.avatar_url,
          student_code: u.student_code,
          phone: u.phone,
          campus: "Cần Thơ",
        });
      } else {
        prof.avatar = u.avatar_url;
        prof.student_code = u.student_code;
        prof.phone = u.phone;
        await prof.save();
      }
    }
  }
  console.log(`✓ Created/Updated ${usersData.length} Users & Profiles`);

  // =========================================================================
  // 2. CREATE CORE DEMO CLUB: FPT GUITAR CLUB (FGC)
  // =========================================================================
  console.log("\n--- 2. Creating Guitar Club ---");
  let guitarClub = await Club.findOne({ name: "FPT Guitar Club (FGC)" });
  if (!guitarClub) {
    guitarClub = await Club.create({
      name: "FPT Guitar Club (FGC)",
      slogan: "Giai điệu kết nối đam mê",
      description:
        "Nơi hội tụ những bạn trẻ yêu thích âm nhạc acoustic, guitar và ca hát tại Đại học FPT Cần Thơ. CLB thường xuyên tổ chức các buổi workshop kỹ năng và các đêm nhạc acoustic sôi động.",
      category: "Arts",
      logo_url: "https://images.unsplash.com/photo-1510915361894-db8b60106cb1?w=300",
      president_id: userMap["bangdreamer01@gmail.com"]._id,
      status: "active",
    });
  } else {
    guitarClub.president_id = userMap["bangdreamer01@gmail.com"]._id;
    guitarClub.status = "active";
    await guitarClub.save();
  }
  console.log(`✓ Club: ${guitarClub.name} (ID: ${guitarClub._id})`);

  // Committee & Members for Guitar Club
  const fgcMembersData = [
    { email: "bangdreamer01@gmail.com", role: "president", reward_point: 300, ranking_point: 350 },
    { email: "demo35@fpt.edu.vn", role: "event_manager", reward_point: 220, ranking_point: 260 },
    { email: "demo33@fpt.edu.vn", role: "secretary", reward_point: 210, ranking_point: 240 },
    { email: "demo34@fpt.edu.vn", role: "treasurer", reward_point: 200, ranking_point: 230 },
    { email: "demo36@fpt.edu.vn", role: "member", reward_point: 180, ranking_point: 180 },
    { email: "student4@fpt.edu.vn", role: "member", reward_point: 95, ranking_point: 110 },
    { email: "student8@fpt.edu.vn", role: "member", reward_point: 70, ranking_point: 85 },
  ];

  const fgcMemberMap = {};
  for (const m of fgcMembersData) {
    let cm = await ClubMember.findOne({
      club_id: guitarClub._id,
      user_id: userMap[m.email]._id,
    });
    if (!cm) {
      cm = await ClubMember.create({
        club_id: guitarClub._id,
        user_id: userMap[m.email]._id,
        role: m.role,
        status: "active",
        reward_point: m.reward_point,
        ranking_point: m.ranking_point,
      });
    } else {
      cm.role = m.role;
      cm.status = "active";
      cm.reward_point = m.reward_point;
      cm.ranking_point = m.ranking_point;
      await cm.save();
    }
    fgcMemberMap[m.email] = cm;
    console.log(`✓ ClubMember (FGC): ${userMap[m.email].full_name} -> Role: [${m.role.toUpperCase()}]`);
  }

  // Remove tynce181041 from active membership initially so they can submit join request in Step 1a
  await ClubMember.deleteOne({ club_id: guitarClub._id, user_id: userMap["tynce181041@fpt.edu.vn"]._id });
  await JoinRequest.deleteMany({ club_id: guitarClub._id, user_id: userMap["tynce181041@fpt.edu.vn"]._id });
  await EventRegistration.deleteMany({ user_id: userMap["tynce181041@fpt.edu.vn"]._id });
  await ContributionLog.deleteMany({});
  console.log(`✓ Reset tynce181041 (Nguyen Ty): Ready to submit Join Request & Event Registration in Step 1a/2a`);
  console.log(`✓ Cleared previous Contribution Logs for clean demo`);

  // =========================================================================
  // 3. ACTION TYPES & POINT RULES (Global & Club-specific)
  // =========================================================================
  console.log("\n--- 3. Action Types & Point Rules ---");
  const actionTypesConfig = [
    { code: "checkin", name: "Check-in Sự kiện", description: "Quét mã QR hoặc check-in tham gia sự kiện" },
    { code: "attendance", name: "Tham gia Sự kiện", description: "Điểm danh tham gia đầy đủ sự kiện" },
    { code: "feedback", name: "Đánh giá Sự kiện", description: "Gửi biểu mẫu đánh giá sau khi sự kiện kết thúc" },
  ];

  const actionTypeMap = {};
  for (const at of actionTypesConfig) {
    let doc = await ActionType.findOne({ code: at.code });
    if (!doc) {
      doc = await ActionType.create({ ...at, is_Active: true });
    }
    actionTypeMap[at.code] = doc;
  }

  // Point rules for Guitar Club
  const rulesConfig = [
    { code: "checkin", pts: 50, limitEvent: 1, limitDay: 2 },
    { code: "attendance", pts: 50, limitEvent: 1, limitDay: 2 },
    { code: "feedback", pts: 20, limitEvent: 1, limitDay: 2 },
  ];

  const pointRuleMap = {};
  for (const rc of rulesConfig) {
    let rule = await PointRule.findOne({
      club_id: guitarClub._id,
      action_type_id: actionTypeMap[rc.code]._id,
    });
    if (!rule) {
      rule = await PointRule.create({
        club_id: guitarClub._id,
        action_type_id: actionTypeMap[rc.code]._id,
        reward_point: rc.pts,
        limit_per_event: rc.limitEvent,
        limit_per_day: rc.limitDay,
        is_active: true,
        created_by: fgcMemberMap["bangdreamer01@gmail.com"]._id,
      });
    } else {
      rule.reward_point = rc.pts;
      rule.is_active = true;
      await rule.save();
    }
    pointRuleMap[rc.code] = rule;
    console.log(`✓ Point Rule (FGC): [${rc.code}] -> +${rc.pts} điểm`);
  }

  // =========================================================================
  // 4. JOIN FORMS & PENDING JOIN REQUESTS (Guitar Club)
  // =========================================================================
  console.log("\n--- 4. Join Forms & Pending Join Requests ---");
  let activeJoinForm = await JoinForm.findOne({
    club_id: guitarClub._id,
    title: "Đơn Đăng Ký Gia Nhập CLB Guitar FPT - Kỳ Fall 2026",
  });
  if (!activeJoinForm) {
    activeJoinForm = await JoinForm.create({
      club_id: guitarClub._id,
      title: "Đơn Đăng Ký Gia Nhập CLB Guitar FPT - Kỳ Fall 2026",
      description:
        "Chào mừng bạn đến với FGC! Vui lòng trả lời các câu hỏi bên dưới để Ban chủ nhiệm hiểu thêm về bạn nhé.",
      questions: [
        { content: "Have you ever played guitar or any musical instrument? (Briefly describe your skill level)" },
        { content: "Why do you want to join FPT Guitar Club, and what would you like to contribute?" },
      ],
      status: "active",
      created_by: fgcMemberMap["bangdreamer01@gmail.com"]._id,
    });
  } else {
    activeJoinForm.status = "active";
    await activeJoinForm.save();
  }
  console.log(`✓ Active Join Form: "${activeJoinForm.title}"`);

  // Secondary form (inactive)
  let secondaryForm = await JoinForm.findOne({
    club_id: guitarClub._id,
    title: "Đơn Tuyển CTV Ban Truyền Thông & Sự Kiện FGC",
  });
  if (!secondaryForm) {
    secondaryForm = await JoinForm.create({
      club_id: guitarClub._id,
      title: "Đơn Tuyển CTV Ban Truyền Thông & Sự Kiện FGC",
      description: "Đơn ứng tuyển dành cho các bạn đam mê quay chụp, thiết kế và quản trị fanpage CLB.",
      questions: [
        { content: "Bạn có kinh nghiệm sử dụng Canva, Photoshop hay dựng video Premiere/CapCut không?" },
        { content: "Link portfolio hoặc sản phẩm truyền thông gần nhất của bạn (nếu có):" },
      ],
      status: "inactive",
      created_by: fgcMemberMap["bangdreamer01@gmail.com"]._id,
    });
  }
  console.log(`✓ Secondary Join Form: "${secondaryForm.title}" (Status: INACTIVE)`);

  // Seed 5 Pending Join Requests for President Member Approval demo
  const applicants = [
    { email: "applicant1@fpt.edu.vn", ans1: "Em biết chơi guitar đệm hát cơ bản 1 năm.", ans2: "Muốn giao lưu cùng mọi người và học hỏi thêm solo." },
    { email: "applicant2@fpt.edu.vn", ans1: "Em chơi piano 3 năm và muốn học thêm guitar acoustic.", ans2: "Mong muốn tham gia ban nhạc của CLB biểu diễn các đêm nhạc." },
    { email: "applicant3@fpt.edu.vn", ans1: "Em chưa biết chơi nhưng rất muốn học từ đầu.", ans2: "Em có thể hỗ trợ hậu cần và set up âm thanh cho CLB." },
    { email: "applicant4@fpt.edu.vn", ans1: "Em chơi cajon và hát bè tốt.", ans2: "Muốn tham gia cùng ban nhạc để kết hợp cajon với guitar." },
    { email: "applicant5@fpt.edu.vn", ans1: "Em biết fingerstyle cơ bản các bài Canon in D, Sunburst.", ans2: "Muốn tham gia workshop kỹ thuật nâng cao cùng các anh chị." },
  ];

  for (const app of applicants) {
    let jr = await JoinRequest.findOne({
      club_id: guitarClub._id,
      user_id: userMap[app.email]._id,
    });
    if (!jr) {
      await JoinRequest.create({
        club_id: guitarClub._id,
        user_id: userMap[app.email]._id,
        form_id: activeJoinForm._id,
        answers: [
          { question_id: activeJoinForm.questions[0]._id, value: app.ans1 },
          { question_id: activeJoinForm.questions[1]._id, value: app.ans2 },
        ],
        status: "pending",
      });
    } else {
      jr.status = "pending";
      await jr.save();
    }
  }
  console.log(`✓ Seeded 5 Pending Join Requests for President Member Approval demo`);

  // =========================================================================
  // 5. GUITAR CLUB EVENTS & TIMELINES
  // =========================================================================
  console.log("\n--- 5. Guitar Club Events ---");
  const now = new Date();

  // Event 1 (coming_soon, ready to register)
  const startTimeEvent1 = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3);
  const endTimeEvent1 = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 120);
  let event1 = await Event.findOne({ title: "Acoustic Night: Giai Điệu Mùa Thu" });
  if (!event1) {
    event1 = await Event.create({
      club_id: guitarClub._id,
      created_by: fgcMemberMap["demo35@fpt.edu.vn"]._id,
      title: "Acoustic Night: Giai Điệu Mùa Thu",
      description:
        "Đêm nhạc acoustic ngoài trời với các bản tình ca mùa thu nhẹ nhàng, không gian ấm cúng kết nối toàn thể sinh viên.",
      category: "Arts",
      start_time: startTimeEvent1,
      end_time: endTimeEvent1,
      location: "Sân Cóc Cần Thơ",
      media_uris: ["https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600"],
      capacity: 100,
      is_public: true,
      status: "coming_soon",
      progress_status: "completed",
      check_in_status: "not_open",
    });
  } else {
    event1.status = "coming_soon";
    event1.progress_status = "completed";
    event1.start_time = startTimeEvent1;
    event1.end_time = endTimeEvent1;
    event1.media_uris = ["https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600"];
    await event1.save();
  }
  console.log(`✓ Event 1: "${event1.title}" (Coming Soon)`);

  // Event 2 (opening, check-in open)
  const startTimeEvent2 = new Date(now.getTime() - 1000 * 60 * 30);
  const endTimeEvent2 = new Date(now.getTime() + 1000 * 60 * 90);
  let event2 = await Event.findOne({ title: "Workshop: Fingerstyle Guitar Cơ Bản" });
  if (!event2) {
    event2 = await Event.create({
      club_id: guitarClub._id,
      created_by: fgcMemberMap["demo35@fpt.edu.vn"]._id,
      title: "Workshop: Fingerstyle Guitar Cơ Bản",
      description:
        "Buổi hướng dẫn kỹ thuật gõ thùng, tỉa nốt và fingerstyle dành cho các bạn mới bắt đầu. Có sự tham gia của khách mời đặc biệt!",
      category: "Arts",
      start_time: startTimeEvent2,
      end_time: endTimeEvent2,
      location: "Phòng Hội trường Beta - ĐH FPT Cần Thơ",
      media_uris: ["https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=600"],
      capacity: 50,
      is_public: true,
      status: "opening",
      progress_status: "completed",
      check_in_status: "open",
    });
  } else {
    event2.status = "opening";
    event2.check_in_status = "open";
    event2.progress_status = "completed";
    event2.media_uris = ["https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=600"];
    await event2.save();
  }

  // Register demo36 to event2
  let reg2 = await EventRegistration.findOne({
    event_id: event2._id,
    user_id: userMap["demo36@fpt.edu.vn"]._id,
  });
  if (!reg2) {
    reg2 = await EventRegistration.create({
      event_id: event2._id,
      user_id: userMap["demo36@fpt.edu.vn"]._id,
      status: "registered",
      registered_at: new Date(),
    });
  } else {
    reg2.status = "registered";
    await reg2.save();
  }
  console.log(`✓ Event 2: "${event2.title}" (Opening, Check-in Open, demo36 registered)`);

  // Event Timelines
  await EventTimeline.deleteMany({ event_id: { $in: [event1._id, event2._id] } });
  const timelinesData = [
    {
      event_id: event1._id,
      time: "18:00",
      timeline_at: new Date(startTimeEvent1.getTime()),
      title: "Check-in & Đón khách (Welcome & Check-in)",
      description: "Khán giả và sinh viên quét mã QR vé tham dự tại bàn lễ tân để điểm danh nhận điểm thưởng.",
      location: "Cổng chính Sân Cóc",
      created_by: fgcMemberMap["demo35@fpt.edu.vn"]._id,
    },
    {
      event_id: event1._id,
      time: "18:30",
      timeline_at: new Date(startTimeEvent1.getTime() + 30 * 60 * 1000),
      title: "Khai mạc & Tiết mục mở màn (Opening Performances)",
      description: "Chủ nhiệm CLB phát biểu khai mạc và ban nhạc FGC biểu diễn bài hát mở màn được bình chọn nhiều nhất.",
      location: "Sân khấu chính",
      created_by: fgcMemberMap["demo35@fpt.edu.vn"]._id,
    },
    {
      event_id: event1._id,
      time: "19:15",
      timeline_at: new Date(startTimeEvent1.getTime() + 75 * 60 * 1000),
      title: "Giao lưu Acoustic & Hát theo yêu cầu (Acoustic Jamming & Open Mic)",
      description: "Các tiết mục mashup acoustic đặc sắc từ các thành viên CLB và phần giao lưu ca hát tự do cùng khán giả.",
      location: "Sân khấu chính",
      created_by: fgcMemberMap["demo35@fpt.edu.vn"]._id,
    },
    {
      event_id: event1._id,
      time: "20:00",
      timeline_at: new Date(startTimeEvent1.getTime() + 120 * 60 * 1000),
      title: "Bế mạc & Khảo sát Feedback (Closing & Feedback Survey)",
      description: "Chụp ảnh kỷ niệm tập thể và sinh viên gửi đánh giá feedback nhận thêm 20 điểm thưởng trên UniClub.",
      location: "Sân khấu chính",
      created_by: fgcMemberMap["demo35@fpt.edu.vn"]._id,
    },
    {
      event_id: event2._id,
      time: "14:00",
      timeline_at: new Date(startTimeEvent2.getTime()),
      title: "Điểm danh & Nhận tài liệu (Check-in & Handouts)",
      description: "Quét mã QR điểm danh check-in và nhận tài liệu giáo trình Fingerstyle cơ bản.",
      location: "Cửa Hội trường Beta",
      created_by: fgcMemberMap["demo35@fpt.edu.vn"]._id,
    },
    {
      event_id: event2._id,
      time: "14:15",
      timeline_at: new Date(startTimeEvent2.getTime() + 15 * 60 * 1000),
      title: "Hướng dẫn kỹ thuật gõ thùng Percussive (Percussive Techniques)",
      description: "Trưởng ban chuyên môn hướng dẫn kỹ thuật slap, tap và thumb slap trên thùng đàn guitar.",
      location: "Hội trường Beta",
      created_by: fgcMemberMap["demo35@fpt.edu.vn"]._id,
    },
    {
      event_id: event2._id,
      time: "15:00",
      timeline_at: new Date(startTimeEvent2.getTime() + 60 * 60 * 1000),
      title: "Thực hành theo nhóm & Giải đáp thắc mắc (Group Practice & Q&A)",
      description: "Thành viên chia nhóm 4-5 người thực hành bài tập và nhận hỗ trợ trực tiếp từ Ban chủ nhiệm.",
      location: "Hội trường Beta",
      created_by: fgcMemberMap["demo35@fpt.edu.vn"]._id,
    },
  ];

  for (const tl of timelinesData) {
    await EventTimeline.create(tl);
  }
  console.log(`✓ Seeded ${timelinesData.length} Event Timelines for Event 1 & Event 2`);

  // =========================================================================
  // 6. ACTIVITIES & SCHEDULE (Guitar Club)
  // =========================================================================
  console.log("\n--- 6. Weekly Activities Schedule ---");
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay();
  const diffToMon = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const curMon = new Date(today.setDate(diffToMon));

  const activitiesData = [
    {
      title: "Luyện tập Guitar đệm hát cơ bản",
      description: "Buổi tập luyện định kỳ các hợp âm cơ bản và kỹ thuật đệm hát ballad.",
      location: "Phòng 204 - Toà Beta",
      dayOffset: 0,
      startHour: 17,
      endHour: 19,
      status: "closed",
    },
    {
      title: "Workshop kỹ thuật Solo Fingerstyle",
      description: "Thực hành tỉa nốt, gõ thùng percussive và chuyển hợp âm nhanh.",
      location: "Phòng 301 - Toà Gamma",
      dayOffset: 2,
      startHour: 18,
      endHour: 20,
      status: "opening",
    },
    {
      title: "Buổi sinh hoạt giao lưu âm nhạc định kỳ",
      description: "Giao lưu văn nghệ giữa các nhóm guitar và acoustic toàn CLB.",
      location: "Sân Cóc Cần Thơ",
      dayOffset: 4,
      startHour: 18,
      endHour: 21,
      status: "coming_soon",
    },
  ];

  for (const act of activitiesData) {
    const actStart = new Date(curMon);
    actStart.setDate(curMon.getDate() + act.dayOffset);
    actStart.setHours(act.startHour, 0, 0, 0);

    const actEnd = new Date(curMon);
    actEnd.setDate(curMon.getDate() + act.dayOffset);
    actEnd.setHours(act.endHour, 0, 0, 0);

    let doc = await Activity.findOne({ club_id: guitarClub._id, title: act.title });
    if (!doc) {
      doc = await Activity.create({
        club_id: guitarClub._id,
        created_by: fgcMemberMap["demo33@fpt.edu.vn"]._id,
        title: act.title,
        description: act.description,
        location: act.location,
        start_time: actStart,
        end_time: actEnd,
        status: act.status,
      });
    } else {
      doc.start_time = actStart;
      doc.end_time = actEnd;
      doc.status = act.status;
      await doc.save();
    }

    if (act.status === "closed") {
      let att = await ActivityAttendance.findOne({
        activity_id: doc._id,
        membership_id: fgcMemberMap["demo36@fpt.edu.vn"]._id,
      });
      if (!att) {
        await ActivityAttendance.create({
          activity_id: doc._id,
          club_id: guitarClub._id,
          membership_id: fgcMemberMap["demo36@fpt.edu.vn"]._id,
          status: "attended",
          check_in_time: actStart,
          checked_by: fgcMemberMap["demo33@fpt.edu.vn"]._id,
        });
      }
    }
  }
  console.log(`✓ Seeded ${activitiesData.length} Activities for Guitar Club`);

  // =========================================================================
  // 7. POLLS (Guitar Club)
  // =========================================================================
  console.log("\n--- 7. Polls ---");
  const pollsData = [
    {
      title: "Khảo sát địa điểm tổ chức Dã ngoại Hè 2026",
      description: "Ý kiến của thành viên về địa điểm đi dã ngoại gắn kết CLB hè này.",
      options: [{ text: "Khu du lịch Mỹ Khánh" }, { text: "Cồn Sơn" }, { text: "Lung Cột Cầu" }],
      status: "closed",
    },
    {
      title: "Bình chọn trang phục biểu diễn FGC Gen 5",
      description: "Lựa chọn mẫu áo đồng phục cho các đợt biểu diễn sự kiện của CLB.",
      options: [{ text: "Áo polo trắng cổ cam" }, { text: "Áo thun đen in logo phản quang" }, { text: "Sơ mi oversize phong cách acoustic" }],
      status: "closed",
    },
    {
      title: "Bình chọn bài hát mở màn cho Acoustic Night",
      description: "Hãy chọn bài hát bạn muốn được lắng nghe đầu tiên trong đêm nhạc nhé!",
      options: [
        { text: "1. Thu Cuối (Mr.T x Yanbi)" },
        { text: "2. Cơn Mưa Ngang Qua (Sơn Tùng M-TP)" },
        { text: "3. Nàng Thơ (Hoàng Dũng)" },
        { text: "4. Mặt Trời Của Em (Phương Ly)" },
      ],
      status: "open",
    },
  ];

  for (const p of pollsData) {
    let pollDoc = await Poll.findOne({ club_id: guitarClub._id, title: p.title });
    if (!pollDoc) {
      await Poll.create({
        club_id: guitarClub._id,
        created_by: fgcMemberMap["demo33@fpt.edu.vn"]._id,
        title: p.title,
        description: p.description,
        options: p.options,
        status: p.status,
      });
    } else {
      pollDoc.status = p.status;
      await pollDoc.save();
    }
  }
  console.log(`✓ Seeded ${pollsData.length} Polls`);

  // =========================================================================
  // 8. REWARDS & REDEMPTION (Guitar Club)
  // =========================================================================
  console.log("\n--- 8. Rewards & Redemption ---");
  const rewardsData = [
    {
      name: "Áo Thun Kỷ Niệm FGC Gen 5",
      description: "Áo thun cotton cao cấp in logo CLB Guitar FPT thiết kế độc quyền.",
      points_required: 100,
      quantity: 15,
      image_url: "https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=300",
    },
    {
      name: "Bộ Capo & Pick Gảy Alice",
      description: "Phụ kiện không thể thiếu cho các tay đàn guitar acoustic.",
      points_required: 50,
      quantity: 30,
      image_url: "https://images.unsplash.com/photo-1541689592655-f5f52825a3b8?w=300",
    },
    {
      name: "Bộ Dây Đàn Elixir Acoustic Cao Cấp",
      description: "Dây đàn phủ Nanoweb siêu bền và âm thanh cực sáng.",
      points_required: 150,
      quantity: 5,
      image_url: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=300",
    },
  ];

  const rewardMap = {};
  for (const r of rewardsData) {
    let rew = await Reward.findOne({ club_id: guitarClub._id, name: r.name });
    if (!rew) {
      rew = await Reward.create({
        club_id: guitarClub._id,
        created_by: fgcMemberMap["bangdreamer01@gmail.com"]._id,
        ...r,
        status: "active",
      });
    }
    rewardMap[r.name] = rew;
  }

  let pendingRedemption = await RewardRedemption.findOne({
    club_id: guitarClub._id,
    membership_id: fgcMemberMap["demo36@fpt.edu.vn"]._id,
    status: "pending",
  });
  if (!pendingRedemption) {
    await RewardRedemption.create({
      club_id: guitarClub._id,
      membership_id: fgcMemberMap["demo36@fpt.edu.vn"]._id,
      reward_id: rewardMap["Bộ Capo & Pick Gảy Alice"]._id,
      quantity: 1,
      point_cost: 50,
      total_point: 50,
      status: "pending",
    });
  }
  console.log(`✓ Seeded Rewards & Pending Redemption for demo36`);

  // =========================================================================
  // 9. FINANCE & TRANSACTIONS (Guitar Club)
  // =========================================================================
  console.log("\n--- 9. Finance & 3-Term Fee Transactions ---");
  const transactionsData = [
    {
      title: "Thu quỹ thành viên Kỳ Spring 2026",
      category: "Quỹ thành viên",
      period: "SP26",
      amount: 50000,
      description: "Thu quỹ sinh hoạt CLB Kỳ Spring 2026 (50.000đ/thành viên)",
      type: "income",
      status: "approved",
    },
    {
      title: "Thu quỹ thành viên Kỳ Summer 2026",
      category: "Quỹ thành viên",
      period: "SU26",
      amount: 50000,
      description: "Thu quỹ sinh hoạt CLB Kỳ Summer 2026 (50.000đ/thành viên)",
      type: "income",
      status: "approved",
    },
    {
      title: "Thu quỹ hoạt động CLB Kỳ Fall 2026",
      category: "Quỹ thành viên",
      period: "FA26",
      amount: 50000,
      description: "Đóng tiền quỹ định kỳ Fall 2026 phục vụ sinh hoạt CLB (50.000đ/thành viên)",
      type: "income",
      status: "approved",
    },
    {
      title: "Thuê dàn âm thanh mini cho Acoustic Night",
      category: "Thuê thiết bị",
      period: "FA26",
      amount: 800000,
      description: "Thuê 2 loa kéo công suất lớn và 2 micro không dây phục vụ đêm nhạc",
      type: "expense",
      status: "pending",
    },
  ];

  for (const t of transactionsData) {
    let tr = await Transaction.findOne({ club_id: guitarClub._id, title: t.title });
    if (!tr) {
      await Transaction.create({
        club_id: guitarClub._id,
        created_by: fgcMemberMap["demo34@fpt.edu.vn"]._id,
        approved_by: t.status === "approved" ? fgcMemberMap["bangdreamer01@gmail.com"]._id : null,
        transaction_date: new Date(),
        ...t,
      });
    }
  }

  const spTrans = await Transaction.findOne({ club_id: guitarClub._id, period: "SP26" });
  const suTrans = await Transaction.findOne({ club_id: guitarClub._id, period: "SU26" });
  const faTrans = await Transaction.findOne({ club_id: guitarClub._id, period: "FA26" });

  const paymentSetups = [
    { trans: spTrans, period: "SP26" },
    { trans: suTrans, period: "SU26" },
    { trans: faTrans, period: "FA26" },
  ];

  for (const ps of paymentSetups) {
    if (ps.trans) {
      let pay = await Payment.findOne({
        transaction_id: ps.trans._id,
        membership_id: fgcMemberMap["demo36@fpt.edu.vn"]._id,
      });
      if (!pay) {
        await Payment.create({
          membership_id: fgcMemberMap["demo36@fpt.edu.vn"]._id,
          transaction_id: ps.trans._id,
          period: ps.period,
          amount: ps.trans.amount || 50000,
          status: "pending",
          payment_method: "vnpay",
          order_info: `Payment for ${ps.period}`,
        });
      }
    }
  }
  console.log(`✓ 3-Term Fee Payments created for demo36`);

  // =========================================================================
  // 10. CREATE MULTIPLE DIVERSE CLUBS (Full Ecosystem)
  // =========================================================================
  console.log("\n--- 10. Creating Diverse Clubs Across Categories ---");
  const clubsConfig = [
    {
      name: "CLB Lập trình F-Code (F-Code Club)",
      slogan: "Code Your Future, Build The World",
      description:
        "Câu lạc bộ học thuật quy tụ sinh viên đam mê lập trình, thuật toán, Web/Mobile App và AI. F-Code thường xuyên tổ chức Hackathon, Workshop công nghệ và hỗ trợ học tập chuyên ngành CNTT.",
      category: "Academic",
      logo_url: "https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=300",
      president_email: "student1@fpt.edu.vn",
      members: [
        { email: "student1@fpt.edu.vn", role: "president", reward_point: 480, ranking_point: 520 },
        { email: "student2@fpt.edu.vn", role: "event_manager", reward_point: 390, ranking_point: 430 },
        { email: "student3@fpt.edu.vn", role: "secretary", reward_point: 320, ranking_point: 360 },
        { email: "student4@fpt.edu.vn", role: "member", reward_point: 210, ranking_point: 250 },
        { email: "student25@fpt.edu.vn", role: "member", reward_point: 150, ranking_point: 180 },
        { email: "student26@fpt.edu.vn", role: "member", reward_point: 110, ranking_point: 130 },
      ],
    },
    {
      name: "CLB Vũ đạo FU-DA (FPT University Dance Association)",
      slogan: "Bùng cháy đam mê, khẳng định chất riêng",
      description:
        "Ngôi nhà chung của những bạn trẻ yêu thích vũ đạo, Street Dance, Choreo và K-Pop Dance Cover. FU-DA luôn là tâm điểm khuấy động sân khấu tại mọi sự kiện lớn nhỏ của trường.",
      category: "Arts",
      logo_url: "https://images.unsplash.com/photo-1547153760-18fc86324498?w=300",
      president_email: "student5@fpt.edu.vn",
      members: [
        { email: "student5@fpt.edu.vn", role: "president", reward_point: 420, ranking_point: 460 },
        { email: "student6@fpt.edu.vn", role: "event_manager", reward_point: 350, ranking_point: 390 },
        { email: "student7@fpt.edu.vn", role: "secretary", reward_point: 280, ranking_point: 310 },
        { email: "student8@fpt.edu.vn", role: "member", reward_point: 190, ranking_point: 220 },
        { email: "student14@fpt.edu.vn", role: "member", reward_point: 140, ranking_point: 160 },
      ],
    },
    {
      name: "CLB Võ thuật Vovinam (FPT Vovinam Club)",
      slogan: "Việt Võ Đạo - Tinh hoa võ Việt, rèn luyện thân tâm",
      description:
        "Rèn luyện thể lực, tính kỷ luật, tự vệ và các thế đòn chân tấn công đặc trưng của bộ môn võ cổ truyền Vovinam. Nơi giao lưu và tham gia các giải hội thao thể chất sinh viên.",
      category: "Sports",
      logo_url: "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=300",
      president_email: "student9@fpt.edu.vn",
      members: [
        { email: "student9@fpt.edu.vn", role: "president", reward_point: 380, ranking_point: 410 },
        { email: "student10@fpt.edu.vn", role: "event_manager", reward_point: 290, ranking_point: 320 },
        { email: "student11@fpt.edu.vn", role: "treasurer", reward_point: 250, ranking_point: 270 },
        { email: "student12@fpt.edu.vn", role: "member", reward_point: 160, ranking_point: 190 },
        { email: "student28@fpt.edu.vn", role: "member", reward_point: 80, ranking_point: 95 },
      ],
    },
    {
      name: "CLB Sự kiện Sinh viên FPT (FPT Event Club - FEC)",
      slogan: "Thổi bùng cảm xúc trong từng khoảnh khắc",
      description:
        "Đội ngũ tổ chức sự kiện chuyên nghiệp đứng sau các chương trình Gala, Prom, Halloween, Welcome Freshmen và Orientation Week của Đại học FPT Cần Thơ.",
      category: "Event",
      logo_url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=300",
      president_email: "student13@fpt.edu.vn",
      members: [
        { email: "student13@fpt.edu.vn", role: "president", reward_point: 460, ranking_point: 500 },
        { email: "student14@fpt.edu.vn", role: "event_manager", reward_point: 380, ranking_point: 420 },
        { email: "student15@fpt.edu.vn", role: "treasurer", reward_point: 310, ranking_point: 340 },
        { email: "student16@fpt.edu.vn", role: "member", reward_point: 220, ranking_point: 250 },
        { email: "student20@fpt.edu.vn", role: "member", reward_point: 130, ranking_point: 150 },
      ],
    },
    {
      name: "CLB Truyền thông & Báo chí (F-Media Club)",
      slogan: "Góc nhìn chân thực, lan tỏa cảm hứng",
      description:
        "Sân chơi cho các bạn trẻ đam mê nhiếp ảnh, quay dựng video recap, livestream và sáng tạo nội dung mạng xã hội cho các hoạt động phong trào toàn trường.",
      category: "Other",
      logo_url: "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?w=300",
      president_email: "student17@fpt.edu.vn",
      members: [
        { email: "student17@fpt.edu.vn", role: "president", reward_point: 360, ranking_point: 400 },
        { email: "student18@fpt.edu.vn", role: "event_manager", reward_point: 270, ranking_point: 300 },
        { email: "student19@fpt.edu.vn", role: "secretary", reward_point: 230, ranking_point: 260 },
        { email: "student20@fpt.edu.vn", role: "member", reward_point: 150, ranking_point: 175 },
      ],
    },
    {
      name: "CLB Tiếng Anh Trải nghiệm (English Experience Club - EEC)",
      slogan: "Speak Out, Stand Out",
      description:
        "Không gian giao lưu tiếng Anh năng động với các hoạt động English Debate, Board Games, Mock Interview và giao lưu sinh viên quốc tế nhằm nâng cao sự tự tin trong giao tiếp.",
      category: "Academic",
      logo_url: "https://images.unsplash.com/photo-1523240795612-9a054b0db644?w=300",
      president_email: "student21@fpt.edu.vn",
      members: [
        { email: "student21@fpt.edu.vn", role: "president", reward_point: 390, ranking_point: 420 },
        { email: "student22@fpt.edu.vn", role: "event_manager", reward_point: 300, ranking_point: 330 },
        { email: "student23@fpt.edu.vn", role: "treasurer", reward_point: 240, ranking_point: 270 },
        { email: "student24@fpt.edu.vn", role: "member", reward_point: 160, ranking_point: 180 },
      ],
    },
    {
      name: "CLB Bóng Rổ FPT (FPT Basketball Club - FBC)",
      slogan: "Dunk It Hard, Play With Heart",
      description:
        "Nơi quy tụ các tay ném bóng rổ sinh viên FPT Cần Thơ. CLB thường xuyên tổ chức giải đấu nội bộ 3x3, 5x5 và giao hữu với các trường bạn trên địa bàn TP. Cần Thơ.",
      category: "Sports",
      logo_url: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=300",
      president_email: "student25@fpt.edu.vn",
      members: [
        { email: "student25@fpt.edu.vn", role: "president", reward_point: 370, ranking_point: 400 },
        { email: "student26@fpt.edu.vn", role: "event_manager", reward_point: 290, ranking_point: 310 },
        { email: "student27@fpt.edu.vn", role: "member", reward_point: 210, ranking_point: 230 },
        { email: "student28@fpt.edu.vn", role: "member", reward_point: 140, ranking_point: 160 },
      ],
    },
    {
      name: "CLB Trí tuệ Nhân tạo & Robotics (FPT AI & Robotics Club)",
      slogan: "Innovate Today, Lead Tomorrow",
      description:
        "Nghiên cứu và phát triển các đề tài AI, Machine Learning, Computer Vision, IoT và Robot điều khiển. CLB đào tạo nòng cốt sinh viên tham gia các kỳ thi Hackathon công nghệ quy mô lớn.",
      category: "Academic",
      logo_url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300",
      president_email: "student29@fpt.edu.vn",
      members: [
        { email: "student29@fpt.edu.vn", role: "president", reward_point: 440, ranking_point: 470 },
        { email: "student30@fpt.edu.vn", role: "event_manager", reward_point: 330, ranking_point: 360 },
        { email: "student2@fpt.edu.vn", role: "member", reward_point: 260, ranking_point: 290 },
        { email: "student3@fpt.edu.vn", role: "member", reward_point: 180, ranking_point: 200 },
      ],
    },
  ];

  const clubMap = { "FPT Guitar Club (FGC)": guitarClub };
  const allClubMembersMap = {}; // key: clubName_email

  for (const cc of clubsConfig) {
    let c = await Club.findOne({ name: cc.name });
    if (!c) {
      c = await Club.create({
        name: cc.name,
        slogan: cc.slogan,
        description: cc.description,
        category: cc.category,
        logo_url: cc.logo_url,
        president_id: userMap[cc.president_email]._id,
        status: "active",
      });
    } else {
      c.president_id = userMap[cc.president_email]._id;
      c.category = cc.category;
      c.slogan = cc.slogan;
      c.description = cc.description;
      c.logo_url = cc.logo_url;
      c.status = "active";
      await c.save();
    }
    clubMap[cc.name] = c;
    console.log(`✓ Club: ${c.name} (${c.category})`);

    // Assign members
    for (const m of cc.members) {
      let cm = await ClubMember.findOne({
        club_id: c._id,
        user_id: userMap[m.email]._id,
      });
      if (!cm) {
        cm = await ClubMember.create({
          club_id: c._id,
          user_id: userMap[m.email]._id,
          role: m.role,
          status: "active",
          reward_point: m.reward_point,
          ranking_point: m.ranking_point,
        });
      } else {
        cm.role = m.role;
        cm.status = "active";
        cm.reward_point = m.reward_point;
        cm.ranking_point = m.ranking_point;
        await cm.save();
      }
      allClubMembersMap[`${cc.name}_${m.email}`] = cm;
    }

    // Create point rules for each club
    for (const rc of rulesConfig) {
      let pr = await PointRule.findOne({
        club_id: c._id,
        action_type_id: actionTypeMap[rc.code]._id,
      });
      if (!pr) {
        await PointRule.create({
          club_id: c._id,
          action_type_id: actionTypeMap[rc.code]._id,
          reward_point: rc.pts,
          limit_per_event: rc.limitEvent,
          limit_per_day: rc.limitDay,
          is_active: true,
          created_by: allClubMembersMap[`${cc.name}_${cc.president_email}`]._id,
        });
      }
    }
  }

  // =========================================================================
  // 11. EXPANDED EVENTS ACROSS CLUBS (All categories & statuses)
  // =========================================================================
  console.log("\n--- 11. Creating Events Across Clubs ---");
  const expandedEventsData = [
    // F-Code: Hackathon UniCode 2026 (Academic - Coming soon)
    {
      clubName: "CLB Lập trình F-Code (F-Code Club)",
      creatorEmail: "student2@fpt.edu.vn",
      title: "Hackathon UniCode 2026: AI & Smart Campus",
      description:
        "Cuộc thi lập trình 24 giờ liên tục dành cho sinh viên phát triển giải pháp công nghệ thông minh ứng dụng trong khuôn viên đại học.",
      category: "Academic",
      start_time: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 7),
      end_time: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 8),
      location: "Hội trường Gamma - Toà nhà Alpha",
      media_uris: ["https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=600"],
      capacity: 150,
      is_public: true,
      status: "coming_soon",
      progress_status: "completed",
      check_in_status: "not_open",
      timelines: [
        { time: "08:00", title: "Khai mạc & Công bố đề tài", desc: "Giới thiệu ban giám khảo và công bố chủ đề cuộc thi", offsetMin: 0 },
        { time: "09:00", title: "Bắt đầu 24h Hacking", desc: "Các đội thi tập trung brainstorm và triển khai prototype", offsetMin: 60 },
        { time: "16:00", title: "Mentoring Session", desc: "Các chuyên gia cố vấn hỗ trợ giải đáp kỹ thuật", offsetMin: 480 },
      ],
    },
    // F-Code: Workshop Git (Academic - Closed)
    {
      clubName: "CLB Lập trình F-Code (F-Code Club)",
      creatorEmail: "student2@fpt.edu.vn",
      title: "Workshop: Git Advanced & Team Collaboration",
      description:
        "Hướng dẫn phân nhánh Git Flow, xử lý Merge Conflicts và các quy chuẩn Clean Code khi làm việc nhóm trong đồ án tốt nghiệp.",
      category: "Academic",
      start_time: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5),
      end_time: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 180),
      location: "Phòng Lab 302 - Toà Beta",
      media_uris: ["https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=600"],
      capacity: 60,
      is_public: true,
      status: "closed",
      progress_status: "completed",
      check_in_status: "closed",
      feedbacks: [
        { email: "student4@fpt.edu.vn", rating: 5, comment: "Workshop rất thực tế, diễn giả chia sẻ chi tiết về rebase và cherry-pick!" },
        { email: "student25@fpt.edu.vn", rating: 5, comment: "Học được rất nhiều mẹo xử lý conflict trong đồ án capstone." },
        { email: "student26@fpt.edu.vn", rating: 4, comment: "Nội dung bổ ích, mong CLB tổ chức thêm buổi về CI/CD." },
      ],
    },

    // FU-DA: Dance Battle Step Up (Arts - Coming soon)
    {
      clubName: "CLB Vũ đạo FU-DA (FPT University Dance Association)",
      creatorEmail: "student6@fpt.edu.vn",
      title: "Dance Battle: Step Up FPT 2026 - All Styles",
      description:
        "Đấu trường vũ đạo nảy lửa quy tụ các dancer tài năng tranh tài ở thể loại Hiphop 1vs1, Freestyle và Choreo showcase.",
      category: "Arts",
      start_time: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 5),
      end_time: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 5 + 1000 * 60 * 240),
      location: "Quảng trường Hoà Bình - ĐH FPT",
      media_uris: ["https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?w=600"],
      capacity: 300,
      is_public: true,
      status: "coming_soon",
      progress_status: "completed",
      check_in_status: "not_open",
      timelines: [
        { time: "17:30", title: "Check-in khán giả & Bốc thăm đấu bảng", desc: "Điểm danh vé và xác định thứ tự thi đấu", offsetMin: 0 },
        { time: "18:00", title: "Vòng loại Cypher Battle", desc: "Các dancer phô diễn kỹ thuật để chọn Top 16", offsetMin: 30 },
        { time: "20:00", title: "Chung kết & Trao giải", desc: "Vòng đấu tranh cúp vô địch và trao quà lưu niệm", offsetMin: 150 },
      ],
    },
    // FU-DA: K-Pop Random Dance (Arts - Closed)
    {
      clubName: "CLB Vũ đạo FU-DA (FPT University Dance Association)",
      creatorEmail: "student6@fpt.edu.vn",
      title: "K-Pop Random Dance in Campus - Fall Edition",
      description:
        "Sân chơi ngẫu hứng cho toàn thể sinh viên yêu thích làn sóng âm nhạc K-Pop với hơn 100 bản hit đình đám nhất.",
      category: "Arts",
      start_time: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10),
      end_time: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 10 + 1000 * 60 * 120),
      location: "Sân Cóc Cần Thơ",
      media_uris: ["https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?w=600"],
      capacity: 150,
      is_public: true,
      status: "closed",
      progress_status: "completed",
      check_in_status: "closed",
      feedbacks: [
        { email: "student8@fpt.edu.vn", rating: 5, comment: "Nhạc hay và quẩy cực kỳ nhiệt tình, không khí bùng nổ!" },
        { email: "student14@fpt.edu.vn", rating: 5, comment: "Rất vui và gắn kết, hy vọng có thêm nhiều số tiếp theo!" },
      ],
    },

    // Vovinam: Hội thao (Sports - Opening, check-in open)
    {
      clubName: "CLB Võ thuật Vovinam (FPT Vovinam Club)",
      creatorEmail: "student10@fpt.edu.vn",
      title: "Hội Thao Vovinam: Tinh Hoa Võ Việt & Đòn Chân Tấn Công",
      description:
        "Biểu diễn các bài quyền tinh hoa, đối kháng thể thao và trình diễn kỹ thuật đòn chân kẹp cổ đặc trưng của Vovinam FPT.",
      category: "Sports",
      start_time: new Date(now.getTime() - 1000 * 60 * 45),
      end_time: new Date(now.getTime() + 1000 * 60 * 120),
      location: "Nhà Thi Đấu Đa Năng - Khu Thể Thao",
      media_uris: ["https://images.unsplash.com/photo-1555597673-b21d5c935865?w=600"],
      capacity: 200,
      is_public: true,
      status: "opening",
      progress_status: "completed",
      check_in_status: "open",
    },

    // FEC: Freshmen Fest (Event - Coming soon)
    {
      clubName: "CLB Sự kiện Sinh viên FPT (FPT Event Club - FEC)",
      creatorEmail: "student14@fpt.edu.vn",
      title: "FPT Freshmen Welcome Fest: Ignite Your Youth",
      description:
        "Lễ hội chào đón tân sinh viên khoá mới với các gian hàng trò chơi dân gian, ẩm thực và đêm nhạc acoustic chào đón K22.",
      category: "Event",
      start_time: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 12),
      end_time: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 12 + 1000 * 60 * 300),
      location: "Khuôn viên Sân Cóc & Hội trường Lớn",
      media_uris: ["https://images.unsplash.com/photo-1470225620780-dba8ba36b745?w=600"],
      capacity: 500,
      is_public: true,
      status: "coming_soon",
      progress_status: "completed",
      check_in_status: "not_open",
    },

    // F-Media: Photography Workshop (Other - Coming soon)
    {
      clubName: "CLB Truyền thông & Báo chí (F-Media Club)",
      creatorEmail: "student18@fpt.edu.vn",
      title: "Workshop: Nhiếp Ảnh Chân Dung & Kỹ Xảo Lightroom",
      description:
        "Hướng dẫn bố cục khung hình, kỹ thuật ánh sáng tự nhiên và hậu kỳ màu ảnh nghệ thuật phong cách thanh xuân vườn trường.",
      category: "Other",
      start_time: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 4),
      end_time: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 4 + 1000 * 60 * 150),
      location: "Studio Media - Toà nhà Gamma",
      media_uris: ["https://images.unsplash.com/photo-1452587925148-ce544e77e70d?w=600"],
      capacity: 80,
      is_public: true,
      status: "coming_soon",
      progress_status: "completed",
      check_in_status: "not_open",
    },

    // EEC: English Debate Tournament (Academic - Opening, check-in open)
    {
      clubName: "CLB Tiếng Anh Trải nghiệm (English Experience Club - EEC)",
      creatorEmail: "student22@fpt.edu.vn",
      title: "English Debate Tournament: Speak To Lead 2026",
      description:
        "Vòng chung kết cuộc thi tranh biện tiếng Anh theo luật Nghị viện Anh (BP) về chủ đề trí tuệ nhân tạo và tương lai việc làm.",
      category: "Academic",
      start_time: new Date(now.getTime() - 1000 * 60 * 15),
      end_time: new Date(now.getTime() + 1000 * 60 * 105),
      location: "Phòng Hội Thảo Alpha - Tầng 2",
      media_uris: ["https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=600"],
      capacity: 100,
      is_public: true,
      status: "opening",
      progress_status: "completed",
      check_in_status: "open",
    },

    // FBC: 3x3 Basketball (Sports - Closed)
    {
      clubName: "CLB Bóng Rổ FPT (FPT Basketball Club - FBC)",
      creatorEmail: "student26@fpt.edu.vn",
      title: "Giải Bóng Rổ Sinh Viên 3x3 FPT Championship",
      description:
        "Giải bóng rổ 3x3 thường niên giữa các khoa CNTT, Kinh tế, Thiết kế đồ hoạ với những pha tranh bóng và ném 3 điểm kịch tính.",
      category: "Sports",
      start_time: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7),
      end_time: new Date(now.getTime() - 1000 * 60 * 60 * 24 * 7 + 1000 * 60 * 240),
      location: "Sân Bóng Rổ Thể Thao Ngoài Trời",
      media_uris: ["https://images.unsplash.com/photo-1574629810360-7efbbe195018?w=600"],
      capacity: 120,
      is_public: true,
      status: "closed",
      progress_status: "completed",
      check_in_status: "closed",
      feedbacks: [
        { email: "student27@fpt.edu.vn", rating: 5, comment: "Giải đấu tổ chức bài bản, trọng tài công tâm và rất hấp dẫn!" },
        { email: "student28@fpt.edu.vn", rating: 5, comment: "Các trận bán kết và chung kết căng thẳng đến giây cuối cùng." },
      ],
    },

    // AI & Robotics: Summit (Academic - Coming soon)
    {
      clubName: "CLB Trí tuệ Nhân tạo & Robotics (FPT AI & Robotics Club)",
      creatorEmail: "student30@fpt.edu.vn",
      title: "AI Summit 2026: Trí Tuệ Nhân Tạo & Kỹ Sư Tương Lai",
      description:
        "Hội thảo công nghệ với sự tham gia của các chuyên gia đầu ngành chia sẻ về Large Language Models, Generative AI và lộ trình nghề nghiệp.",
      category: "Academic",
      start_time: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 9),
      end_time: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 9 + 1000 * 60 * 180),
      location: "Hội trường Lớn Trụ sở Chính",
      media_uris: ["https://images.unsplash.com/photo-1531482615713-2afd69097998?w=600"],
      capacity: 250,
      is_public: true,
      status: "coming_soon",
      progress_status: "completed",
      check_in_status: "not_open",
    },
  ];

  for (const ed of expandedEventsData) {
    const parentClub = clubMap[ed.clubName];
    if (!parentClub) continue;
    const creatorMem = allClubMembersMap[`${ed.clubName}_${ed.creatorEmail}`];
    if (!creatorMem) continue;

    let ev = await Event.findOne({ title: ed.title });
    if (!ev) {
      ev = await Event.create({
        club_id: parentClub._id,
        created_by: creatorMem._id,
        title: ed.title,
        description: ed.description,
        category: ed.category,
        start_time: ed.start_time,
        end_time: ed.end_time,
        location: ed.location,
        media_uris: ed.media_uris,
        capacity: ed.capacity,
        is_public: ed.is_public,
        status: ed.status,
        progress_status: ed.progress_status,
        check_in_status: ed.check_in_status,
      });
    } else {
      ev.status = ed.status;
      ev.progress_status = ed.progress_status;
      ev.check_in_status = ed.check_in_status;
      ev.start_time = ed.start_time;
      ev.end_time = ed.end_time;
      ev.media_uris = ed.media_uris;
      await ev.save();
    }

    // Seed registrations for users to reflect attendance numbers
    const sampleRegistrants = [
      "student1@fpt.edu.vn",
      "student4@fpt.edu.vn",
      "student8@fpt.edu.vn",
      "student12@fpt.edu.vn",
      "student16@fpt.edu.vn",
      "student20@fpt.edu.vn",
      "student24@fpt.edu.vn",
    ];
    for (const regEmail of sampleRegistrants) {
      if (userMap[regEmail]) {
        let reg = await EventRegistration.findOne({ event_id: ev._id, user_id: userMap[regEmail]._id });
        if (!reg) {
          await EventRegistration.create({
            event_id: ev._id,
            user_id: userMap[regEmail]._id,
            status: ev.status === "closed" ? "attended" : "registered",
            registered_at: new Date(ed.start_time.getTime() - 1000 * 60 * 60 * 24),
          });
        }
      }
    }

    // Seed Feedbacks if present
    if (ed.feedbacks && ed.feedbacks.length > 0) {
      for (const fb of ed.feedbacks) {
        if (userMap[fb.email]) {
          let fbDoc = await Feedback.findOne({ event_id: ev._id, user_id: userMap[fb.email]._id });
          if (!fbDoc) {
            await Feedback.create({
              event_id: ev._id,
              user_id: userMap[fb.email]._id,
              rating: fb.rating,
              comment: fb.comment,
            });
          }
        }
      }
    }

    // Seed timelines if defined
    if (ed.timelines && ed.timelines.length > 0) {
      await EventTimeline.deleteMany({ event_id: ev._id });
      for (const t of ed.timelines) {
        await EventTimeline.create({
          event_id: ev._id,
          time: t.time,
          timeline_at: new Date(ed.start_time.getTime() + t.offsetMin * 60 * 1000),
          title: t.title,
          description: t.desc,
          location: ed.location,
          created_by: creatorMem._id,
        });
      }
    }
    console.log(`✓ Event: "${ev.title}" (${ev.status})`);
  }

  // =========================================================================
  // 12. CLUB & EVENT CREATION REQUESTS (Student Affairs Demo)
  // =========================================================================
  console.log("\n--- 12. Student Affairs Requests (Club & Event Proposals) ---");

  // Club Creation Request 1: Pending approval
  let pendingClubReq = await ClubCreationRequest.findOne({ club_name: "CLB Cờ Vua & Board Game FPT" });
  if (!pendingClubReq) {
    await ClubCreationRequest.create({
      club_name: "CLB Cờ Vua & Board Game FPT",
      slogan: "Chiến thuật đỉnh cao, gắn kết trí tuệ",
      description: "Sân chơi rèn luyện tư duy logic, thi đấu cờ vua, cờ tướng và các trò chơi board game chiến thuật lành mạnh.",
      category: "Academic",
      reason: "Sinh viên có niềm đam mê cờ vua và mong muốn thành lập CLB để đại diện trường thi đấu Hội thao sinh viên toàn quốc.",
      logo_url: "https://images.unsplash.com/photo-1529699211952-734e80c4d42b?w=300",
      status: "pending",
      requested_by: userMap["student21@fpt.edu.vn"]._id,
      member_ids: [userMap["student21@fpt.edu.vn"]._id, userMap["student22@fpt.edu.vn"]._id, userMap["student23@fpt.edu.vn"]._id],
      members: [
        { user_id: userMap["student21@fpt.edu.vn"]._id, status: "accepted", responded_at: new Date() },
        { user_id: userMap["student22@fpt.edu.vn"]._id, status: "accepted", responded_at: new Date() },
        { user_id: userMap["student23@fpt.edu.vn"]._id, status: "accepted", responded_at: new Date() },
      ],
      created_at: new Date(),
    });
    console.log(`✓ Pending Club Creation Request: "CLB Cờ Vua & Board Game FPT"`);
  }

  // Club Creation Request 2: Approved
  let approvedClubReq = await ClubCreationRequest.findOne({ club_name: "CLB Trí tuệ Nhân tạo & Robotics (FPT AI & Robotics Club)" });
  if (!approvedClubReq) {
    await ClubCreationRequest.create({
      club_name: "CLB Trí tuệ Nhân tạo & Robotics (FPT AI & Robotics Club)",
      slogan: "Innovate Today, Lead Tomorrow",
      description: "CLB nghiên cứu công nghệ AI và Robotics.",
      category: "Academic",
      reason: "Đẩy mạnh phong trào nghiên cứu khoa học kỹ thuật trong sinh viên khối ngành CNTT.",
      logo_url: "https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=300",
      status: "approved",
      requested_by: userMap["student29@fpt.edu.vn"]._id,
      member_ids: [userMap["student29@fpt.edu.vn"]._id],
      members: [{ user_id: userMap["student29@fpt.edu.vn"]._id, status: "accepted", responded_at: new Date() }],
      reviewed_by: userMap["admin@fpt.edu.vn"]._id,
      review_note: "Đề án thành lập khả thi, kế hoạch hoạt động rõ ràng và định hướng học thuật tốt.",
      reviewed_at: new Date(),
    });
  }

  // Event Creation Request: Pending approval for Student Affairs
  const fecClub = clubMap["CLB Sự kiện Sinh viên FPT (FPT Event Club - FEC)"];
  const fecEventManager = allClubMembersMap["CLB Sự kiện Sinh viên FPT (FPT Event Club - FEC)_student14@fpt.edu.vn"];
  if (fecClub && fecEventManager) {
    let pendingEventReq = await EventCreationRequest.findOne({ title: "Gala Tôn Vinh Thủ Lĩnh Sinh Viên UniClub Awards 2026" });
    if (!pendingEventReq) {
      await EventCreationRequest.create({
        club_id: fecClub._id,
        requested_by: fecEventManager._id,
        title: "Gala Tôn Vinh Thủ Lĩnh Sinh Viên UniClub Awards 2026",
        description:
          "Đêm vinh danh các cá nhân, chủ nhiệm câu lạc bộ và các dự án sinh viên xuất sắc nhất năm học 2025 - 2026 tại Đại học FPT Cần Thơ.",
        category: "Event",
        start_time: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 20),
        end_time: new Date(now.getTime() + 1000 * 60 * 60 * 24 * 20 + 1000 * 60 * 240),
        location: "Đại Giảng Đường A - Khuôn viên Toà Alpha",
        is_public: true,
        capacity: 450,
        media_uris: ["https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600"],
        status: "pending",
        review_note: "",
      });
      console.log(`✓ Pending Event Proposal Request: "Gala Tôn Vinh Thủ Lĩnh Sinh Viên UniClub Awards 2026"`);
    }
  }

  // =========================================================================
  // 13. ADDITIONAL REWARDS & ACTIVITIES FOR ECOSYSTEM
  // =========================================================================
  console.log("\n--- 13. Additional Rewards for F-Code & FU-DA ---");
  const fcodeClub = clubMap["CLB Lập trình F-Code (F-Code Club)"];
  if (fcodeClub) {
    const fcodeRewards = [
      {
        name: "Áo Hoodie Dev F-Code Limited Edition",
        description: "Áo hoodie nỉ dày cao cấp in typography lập trình phiên bản giới hạn Gen 6.",
        points_required: 200,
        quantity: 10,
        image_url: "https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=300",
      },
      {
        name: "Bình Giữ Nhiệt Metallic Tech UniClub",
        description: "Bình giữ nhiệt 500ml giữ lạnh 24h, khắc logo laser UniClub.",
        points_required: 80,
        quantity: 25,
        image_url: "https://images.unsplash.com/photo-1602143407151-7111542de6e8?w=300",
      },
      {
        name: "Bộ Sticker Lập Trình & Git Cheat Sheet",
        description: "Sticker chống nước dành cho laptop các ngôn ngữ React, Node, Python, Docker.",
        points_required: 30,
        quantity: 50,
        image_url: "https://images.unsplash.com/photo-1572375992501-4b0892d50c69?w=300",
      },
    ];

    for (const r of fcodeRewards) {
      let doc = await Reward.findOne({ club_id: fcodeClub._id, name: r.name });
      if (!doc) {
        await Reward.create({
          club_id: fcodeClub._id,
          created_by: userMap["student1@fpt.edu.vn"]._id,
          ...r,
          status: "active",
        });
      }
    }
    console.log(`✓ Seeded Rewards for F-Code Club`);
  }

  console.log("\n🎉 FULL ECOSYSTEM & DEMO SEED DATA COMPLETED SUCCESSFULLY!");
  console.log("Ready for demo, testing & presentation.\n");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
