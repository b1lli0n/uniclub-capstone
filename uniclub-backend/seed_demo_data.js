/**
 * Comprehensive Seed script for UniClub Capstone Demo
 * Run: node seed_demo_data.js
 */
const mongoose = require("mongoose");
const env = require("./src/config/env");

// Models
const User = require("./src/models/user.model");
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

async function seed() {
  console.log("Connecting to MongoDB:", env.mongodbUri);
  await mongoose.connect(env.mongodbUri);
  console.log("Connected successfully. Seeding comprehensive data for Demo...\n");

  // 1. CREATE USERS
  console.log("--- 1. Creating Users ---");
  const usersData = [
    {
      email: "uniclub2402@gmail.com",
      full_name: "Nguyen Van Admin",
      role: "student_affairs",
      provider: "feid",
      provider_id: "sa_admin_uniclub",
      avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    },
    {
      email: "admin@fpt.edu.vn",
      full_name: "Nguyen Van Admin",
      role: "student_affairs",
      provider: "feid",
      provider_id: "sa_admin_01",
      avatar_url: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150",
    },
    {
      email: "bangdreamer01@gmail.com",
      full_name: "Nguyen Bang (President)",
      role: "student",
      provider: "feid",
      provider_id: "bangdreamer01_feid",
      avatar_url: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150",
    },
    {
      email: "demo35@fpt.edu.vn",
      full_name: "Nguyen Quoc Khanh",
      role: "student",
      provider: "feid",
      provider_id: "demo35_feid",
      avatar_url: "https://images.unsplash.com/photo-1570295999919-56ceb5ecca61?w=150",
    },
    {
      email: "demo33@fpt.edu.vn",
      full_name: "Do Thi Giang",
      role: "student",
      provider: "feid",
      provider_id: "demo33_feid",
      avatar_url: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150",
    },
    {
      email: "demo34@fpt.edu.vn",
      full_name: "Ho Minh Hung",
      role: "student",
      provider: "feid",
      provider_id: "demo34_feid",
      avatar_url: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150",
    },
    {
      email: "demo36@fpt.edu.vn",
      full_name: "Tran Thanh Linh",
      role: "student",
      provider: "feid",
      provider_id: "demo36_feid",
      avatar_url: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150",
    },
    {
      email: "tynce181041@fpt.edu.vn",
      full_name: "Nguyen Ty",
      role: "student",
      provider: "feid",
      provider_id: "tynce181041_feid",
      avatar_url: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150",
    },
    // 5 Applicants for President Join Request Approval demo
    {
      email: "applicant1@fpt.edu.vn",
      full_name: "Tran Van An",
      role: "student",
      provider: "feid",
      provider_id: "app1_feid",
      avatar_url: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150",
    },
    {
      email: "applicant2@fpt.edu.vn",
      full_name: "Le Thi Binh",
      role: "student",
      provider: "feid",
      provider_id: "app2_feid",
      avatar_url: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150",
    },
    {
      email: "applicant3@fpt.edu.vn",
      full_name: "Pham Hoang Cuong",
      role: "student",
      provider: "feid",
      provider_id: "app3_feid",
      avatar_url: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150",
    },
    {
      email: "applicant4@fpt.edu.vn",
      full_name: "Vu Thi Duyen",
      role: "student",
      provider: "feid",
      provider_id: "app4_feid",
      avatar_url: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150",
    },
    {
      email: "applicant5@fpt.edu.vn",
      full_name: "Dang Van Hai",
      role: "student",
      provider: "feid",
      provider_id: "app5_feid",
      avatar_url: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150",
    },
  ];

  const userMap = {};
  for (const u of usersData) {
    let user = await User.findOne({ email: u.email });
    if (!user) {
      user = await User.create(u);
    } else {
      user.full_name = u.full_name;
      user.role = u.role;
      user.avatar_url = u.avatar_url;
      await user.save();
    }
    userMap[u.email] = user;
    console.log(`✓ User: ${u.full_name} (${u.email})`);
  }

  // 2. CREATE / UPDATE GUITAR CLUB
  console.log("\n--- 2. Creating Guitar Club ---");
  let club = await Club.findOne({ name: "FPT Guitar Club (FGC)" });
  if (!club) {
    club = await Club.create({
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
    club.president_id = userMap["bangdreamer01@gmail.com"]._id;
    club.status = "active";
    await club.save();
  }
  console.log(`✓ Club: ${club.name} (ID: ${club._id})`);

  // 3. ASSIGN CLUB COMMITTEE & MEMBERS
  console.log("\n--- 3. Assigning Club Committee Roles ---");
  const membersData = [
    { email: "bangdreamer01@gmail.com", role: "president", reward_point: 300, ranking_point: 350 },
    { email: "demo35@fpt.edu.vn", role: "event_manager", reward_point: 220, ranking_point: 260 },
    { email: "demo33@fpt.edu.vn", role: "secretary", reward_point: 210, ranking_point: 240 },
    { email: "demo34@fpt.edu.vn", role: "treasurer", reward_point: 200, ranking_point: 230 },
    { email: "demo36@fpt.edu.vn", role: "member", reward_point: 180, ranking_point: 180 },
  ];

  const memberMap = {};
  for (const m of membersData) {
    let cm = await ClubMember.findOne({
      club_id: club._id,
      user_id: userMap[m.email]._id,
    });
    if (!cm) {
      cm = await ClubMember.create({
        club_id: club._id,
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
    memberMap[m.email] = cm;
    console.log(`✓ ClubMember: ${userMap[m.email].full_name} -> Role: [${m.role.toUpperCase()}]`);
  }

  // Remove tynce181041 from active membership initially so they can submit join request in Step 1a
  await ClubMember.deleteOne({ club_id: club._id, user_id: userMap["tynce181041@fpt.edu.vn"]._id });
  await JoinRequest.deleteMany({ club_id: club._id, user_id: userMap["tynce181041@fpt.edu.vn"]._id });
  await EventRegistration.deleteMany({ user_id: userMap["tynce181041@fpt.edu.vn"]._id });
  await ContributionLog.deleteMany({});
  console.log(`✓ Reset tynce181041 (Nguyen Ty): Ready to submit Join Request & Event Registration in Step 1a/2a`);
  console.log(`✓ Cleared all previous Contribution Logs`);

  // 4. ACTION TYPES & POINT RULES
  console.log("\n--- 4. Action Types & Point Rules ---");
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

  for (const rc of rulesConfig) {
    let rule = await PointRule.findOne({
      club_id: club._id,
      action_type_id: actionTypeMap[rc.code]._id,
    });
    if (!rule) {
      rule = await PointRule.create({
        club_id: club._id,
        action_type_id: actionTypeMap[rc.code]._id,
        reward_point: rc.pts,
        limit_per_event: rc.limitEvent,
        limit_per_day: rc.limitDay,
        is_active: true,
        created_by: memberMap["bangdreamer01@gmail.com"]._id,
      });
    } else {
      rule.reward_point = rc.pts;
      rule.is_active = true;
      await rule.save();
    }
    console.log(`✓ Point Rule: [${rc.code}] -> +${rc.pts} điểm`);
  }

  // 5. JOIN FORMS & PENDING JOIN REQUESTS
  console.log("\n--- 5. Join Forms & Pending Join Requests ---");
  let activeJoinForm = await JoinForm.findOne({
    club_id: club._id,
    title: "Đơn Đăng Ký Gia Nhập CLB Guitar FPT - Kỳ Fall 2026",
  });
  if (!activeJoinForm) {
    activeJoinForm = await JoinForm.create({
      club_id: club._id,
      title: "Đơn Đăng Ký Gia Nhập CLB Guitar FPT - Kỳ Fall 2026",
      description:
        "Chào mừng bạn đến với FGC! Vui lòng trả lời các câu hỏi bên dưới để Ban chủ nhiệm hiểu thêm về bạn nhé.",
      questions: [
        { content: "Have you ever played guitar or any musical instrument? (Briefly describe your skill level)" },
        { content: "Why do you want to join FPT Guitar Club, and what would you like to contribute?" },
      ],
      status: "active",
      created_by: memberMap["bangdreamer01@gmail.com"]._id,
    });
  } else {
    activeJoinForm.status = "active";
    await activeJoinForm.save();
  }
  console.log(`✓ Active Join Form: "${activeJoinForm.title}"`);

  // Secondary form (inactive) for President to demo form editing/toggling
  let secondaryForm = await JoinForm.findOne({
    club_id: club._id,
    title: "Đơn Tuyển CTV Ban Truyền Thông & Sự Kiện FGC",
  });
  if (!secondaryForm) {
    secondaryForm = await JoinForm.create({
      club_id: club._id,
      title: "Đơn Tuyển CTV Ban Truyền Thông & Sự Kiện FGC",
      description: "Đơn ứng tuyển dành cho các bạn đam mê quay chụp, thiết kế và quản trị fanpage CLB.",
      questions: [
        { content: "Bạn có kinh nghiệm sử dụng Canva, Photoshop hay dựng video Premiere/CapCut không?" },
        { content: "Link portfolio hoặc sản phẩm truyền thông gần nhất của bạn (nếu có):" },
      ],
      status: "inactive",
      created_by: memberMap["bangdreamer01@gmail.com"]._id,
    });
  }
  console.log(`✓ Secondary Join Form: "${secondaryForm.title}" (Status: INACTIVE)`);

  // Seed 5 Pending Join Requests for President Flow Step 3
  const applicants = [
    { email: "applicant1@fpt.edu.vn", ans1: "Em biết chơi guitar đệm hát cơ bản 1 năm.", ans2: "Muốn giao lưu cùng mọi người và học hỏi thêm solo." },
    { email: "applicant2@fpt.edu.vn", ans1: "Em chơi piano 3 năm và muốn học thêm guitar acoustic.", ans2: "Mong muốn tham gia ban nhạc của CLB biểu diễn các đêm nhạc." },
    { email: "applicant3@fpt.edu.vn", ans1: "Em chưa biết chơi nhưng rất muốn học từ đầu.", ans2: "Em có thể hỗ trợ hậu cần và set up âm thanh cho CLB." },
    { email: "applicant4@fpt.edu.vn", ans1: "Em chơi cajon và hát bè tốt.", ans2: "Muốn tham gia cùng ban nhạc để kết hợp cajon với guitar." },
    { email: "applicant5@fpt.edu.vn", ans1: "Em biết fingerstyle cơ bản các bài Canon in D, Sunburst.", ans2: "Muốn tham gia workshop kỹ thuật nâng cao cùng các anh chị." },
  ];

  for (const app of applicants) {
    let jr = await JoinRequest.findOne({
      club_id: club._id,
      user_id: userMap[app.email]._id,
    });
    if (!jr) {
      await JoinRequest.create({
        club_id: club._id,
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

  // 6. EVENTS
  console.log("\n--- 6. Events ---");
  const now = new Date();

  // Event 1 (For Student Step 2a: coming_soon, ready to register)
  const startTimeEvent1 = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3); // 3 days later
  const endTimeEvent1 = new Date(now.getTime() + 1000 * 60 * 60 * 24 * 3 + 1000 * 60 * 120);
  let event1 = await Event.findOne({ title: "Acoustic Night: Giai Điệu Mùa Thu" });
  if (!event1) {
    event1 = await Event.create({
      club_id: club._id,
      created_by: memberMap["demo35@fpt.edu.vn"]._id,
      title: "Acoustic Night: Giai Điệu Mùa Thu",
      description:
        "Đêm nhạc acoustic ngoài trời với các bản tình ca mùa thu nhẹ nhàng, không gian ấm cúng kết nối toàn thể sinh viên.",
      category: "Arts",
      start_time: startTimeEvent1,
      end_time: endTimeEvent1,
      location: "Sân Cóc Cần Thơ",
      banner_url: "https://images.unsplash.com/photo-1465847899084-d164df4dedc6?w=600",
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
    await event1.save();
  }
  console.log(`✓ Event 1: "${event1.title}" (Coming Soon, Progress: Completed -> Ready for Student Registration)`);

  // Event 2 (For Event Manager Step 4: opening, ready for Check-in demo)
  const startTimeEvent2 = new Date(now.getTime() - 1000 * 60 * 30); // 30 mins ago
  const endTimeEvent2 = new Date(now.getTime() + 1000 * 60 * 90); // 90 mins later
  let event2 = await Event.findOne({ title: "Workshop: Fingerstyle Guitar Cơ Bản" });
  if (!event2) {
    event2 = await Event.create({
      club_id: club._id,
      created_by: memberMap["demo35@fpt.edu.vn"]._id,
      title: "Workshop: Fingerstyle Guitar Cơ Bản",
      description:
        "Buổi hướng dẫn kỹ thuật gõ thùng, tỉa nốt và fingerstyle dành cho các bạn mới bắt đầu. Có sự tham gia của khách mời đặc biệt!",
      category: "Arts",
      start_time: startTimeEvent2,
      end_time: endTimeEvent2,
      location: "Phòng Hội trường Beta - ĐH FPT Cần Thơ",
      banner_url: "https://images.unsplash.com/photo-1525201548942-d8732f6617a0?w=600",
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
    await event2.save();
  }

  // Register demo36 to event2 for Check-in demo
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
  console.log(`✓ Event 2: "${event2.title}" (Opening, Check-in Open, demo36 registered -> Ready for Check-in demo)`);

  // 6b. EVENT TIMELINES
  console.log("\n--- 6b. Event Timelines ---");
  await EventTimeline.deleteMany({ event_id: { $in: [event1._id, event2._id] } });

  const timelinesData = [
    // Event 1 (Acoustic Night) Timelines
    {
      event_id: event1._id,
      time: "18:00",
      timeline_at: new Date(startTimeEvent1.getTime()),
      title: "Check-in & Đón khách (Welcome & Check-in)",
      description: "Khán giả và sinh viên quét mã QR vé tham dự tại bàn lễ tân để điểm danh nhận điểm thưởng.",
      location: "Cổng chính Sân Cóc",
      created_by: memberMap["demo35@fpt.edu.vn"]._id,
    },
    {
      event_id: event1._id,
      time: "18:30",
      timeline_at: new Date(startTimeEvent1.getTime() + 30 * 60 * 1000),
      title: "Khai mạc & Tiết mục mở màn (Opening Performances)",
      description: "Chủ nhiệm CLB phát biểu khai mạc và ban nhạc FGC biểu diễn bài hát mở màn được bình chọn nhiều nhất.",
      location: "Sân khấu chính",
      created_by: memberMap["demo35@fpt.edu.vn"]._id,
    },
    {
      event_id: event1._id,
      time: "19:15",
      timeline_at: new Date(startTimeEvent1.getTime() + 75 * 60 * 1000),
      title: "Giao lưu Acoustic & Hát theo yêu cầu (Acoustic Jamming & Open Mic)",
      description: "Các tiết mục mashup acoustic đặc sắc từ các thành viên CLB và phần giao lưu ca hát tự do cùng khán giả.",
      location: "Sân khấu chính",
      created_by: memberMap["demo35@fpt.edu.vn"]._id,
    },
    {
      event_id: event1._id,
      time: "20:00",
      timeline_at: new Date(startTimeEvent1.getTime() + 120 * 60 * 1000),
      title: "Bế mạc & Khảo sát Feedback (Closing & Feedback Survey)",
      description: "Chụp ảnh kỷ niệm tập thể và sinh viên gửi đánh giá feedback nhận thêm 20 điểm thưởng trên UniClub.",
      location: "Sân khấu chính",
      created_by: memberMap["demo35@fpt.edu.vn"]._id,
    },

    // Event 2 (Workshop Fingerstyle) Timelines
    {
      event_id: event2._id,
      time: "14:00",
      timeline_at: new Date(startTimeEvent2.getTime()),
      title: "Điểm danh & Nhận tài liệu (Check-in & Handouts)",
      description: "Quét mã QR điểm danh check-in và nhận tài liệu giáo trình Fingerstyle cơ bản.",
      location: "Cửa Hội trường Beta",
      created_by: memberMap["demo35@fpt.edu.vn"]._id,
    },
    {
      event_id: event2._id,
      time: "14:15",
      timeline_at: new Date(startTimeEvent2.getTime() + 15 * 60 * 1000),
      title: "Hướng dẫn kỹ thuật gõ thùng Percussive (Percussive Techniques)",
      description: "Trưởng ban chuyên môn hướng dẫn kỹ thuật slap, tap và thumb slap trên thùng đàn guitar.",
      location: "Hội trường Beta",
      created_by: memberMap["demo35@fpt.edu.vn"]._id,
    },
    {
      event_id: event2._id,
      time: "15:00",
      timeline_at: new Date(startTimeEvent2.getTime() + 60 * 60 * 1000),
      title: "Thực hành theo nhóm & Giải đáp thắc mắc (Group Practice & Q&A)",
      description: "Thành viên chia nhóm 4-5 người thực hành bài tập và nhận hỗ trợ trực tiếp từ Ban chủ nhiệm.",
      location: "Hội trường Beta",
      created_by: memberMap["demo35@fpt.edu.vn"]._id,
    },
  ];

  for (const tl of timelinesData) {
    await EventTimeline.create(tl);
  }
  console.log(`✓ Seeded ${timelinesData.length} Event Timelines for Event 1 & Event 2`);

  // 7. SCHEDULE ACTIVITIES (3 sessions/week)
  console.log("\n--- 7. Weekly Activities Schedule (3 sessions/week) ---");
  // Calculate Monday of current week
  const today = new Date(now);
  today.setHours(0, 0, 0, 0);
  const dayOfWeek = today.getDay();
  const diffToMon = today.getDate() - dayOfWeek + (dayOfWeek === 0 ? -6 : 1);
  const curMon = new Date(today.setDate(diffToMon));

  const activitiesData = [
    // Current Week
    {
      title: "Luyện tập Guitar đệm hát cơ bản",
      description: "Buổi tập luyện định kỳ các hợp âm cơ bản và kỹ thuật đệm hát ballad.",
      location: "Phòng 204 - Toà Beta",
      dayOffset: 0, // Monday
      startHour: 17,
      endHour: 19,
      status: "closed",
    },
    {
      title: "Workshop kỹ thuật Solo Fingerstyle",
      description: "Thực hành tỉa nốt, gõ thùng percussive và chuyển hợp âm nhanh.",
      location: "Phòng 301 - Toà Gamma",
      dayOffset: 2, // Wednesday
      startHour: 18,
      endHour: 20,
      status: "opening",
    },
    {
      title: "Buổi sinh hoạt giao lưu âm nhạc định kỳ",
      description: "Giao lưu văn nghệ giữa các nhóm guitar và acoustic toàn CLB.",
      location: "Sân Cóc Cần Thơ",
      dayOffset: 4, // Friday
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

    let doc = await Activity.findOne({ club_id: club._id, title: act.title });
    if (!doc) {
      doc = await Activity.create({
        club_id: club._id,
        created_by: memberMap["demo33@fpt.edu.vn"]._id,
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

    // For the closed activity, create an attendance record for demo36
    if (act.status === "closed") {
      let att = await ActivityAttendance.findOne({
        activity_id: doc._id,
        membership_id: memberMap["demo36@fpt.edu.vn"]._id,
      });
      if (!att) {
        await ActivityAttendance.create({
          activity_id: doc._id,
          club_id: club._id,
          membership_id: memberMap["demo36@fpt.edu.vn"]._id,
          status: "attended",
          check_in_time: actStart,
          checked_by: memberMap["demo33@fpt.edu.vn"]._id,
        });
      }
    }
    console.log(`✓ Activity: "${act.title}" (${act.status})`);
  }

  // 8. POLLS (3 polls: 2 closed, 1 open)
  console.log("\n--- 8. Polls (3 polls: 2 closed, 1 active) ---");
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
    let pollDoc = await Poll.findOne({ club_id: club._id, title: p.title });
    if (!pollDoc) {
      await Poll.create({
        club_id: club._id,
        created_by: memberMap["demo33@fpt.edu.vn"]._id,
        title: p.title,
        description: p.description,
        options: p.options,
        status: p.status,
      });
    } else {
      pollDoc.status = p.status;
      await pollDoc.save();
    }
    console.log(`✓ Poll: "${p.title}" (Status: ${p.status.toUpperCase()})`);
  }

  // 9. REWARDS & REDEMPTION
  console.log("\n--- 9. Rewards & Redemption ---");
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
    let rew = await Reward.findOne({ club_id: club._id, name: r.name });
    if (!rew) {
      rew = await Reward.create({
        club_id: club._id,
        created_by: memberMap["bangdreamer01@gmail.com"]._id,
        ...r,
        status: "active",
      });
    }
    rewardMap[r.name] = rew;
    console.log(`✓ Reward: "${r.name}" (${r.points_required} điểm)`);
  }

  // Seed 1 pending Redemption from demo36 for President to review & approve
  let pendingRedemption = await RewardRedemption.findOne({
    club_id: club._id,
    membership_id: memberMap["demo36@fpt.edu.vn"]._id,
    status: "pending",
  });
  if (!pendingRedemption) {
    await RewardRedemption.create({
      club_id: club._id,
      membership_id: memberMap["demo36@fpt.edu.vn"]._id,
      reward_id: rewardMap["Bộ Capo & Pick Gảy Alice"]._id,
      quantity: 1,
      point_cost: 50,
      total_point: 50,
      status: "pending",
    });
  }
  console.log(`✓ Seeded Pending Redemption: Tran Thanh Linh (demo36) -> Chờ President duyệt`);

  // 10. FINANCE & TRANSACTIONS (3 terms: SP26, SU26, FA26)
  console.log("\n--- 10. Finance & 3-Term Fee Transactions ---");
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
    // 1 Pending Expense for President to approve in Treasurer demo
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
    let tr = await Transaction.findOne({ club_id: club._id, title: t.title });
    if (!tr) {
      await Transaction.create({
        club_id: club._id,
        created_by: memberMap["demo34@fpt.edu.vn"]._id,
        approved_by: t.status === "approved" ? memberMap["bangdreamer01@gmail.com"]._id : null,
        transaction_date: new Date(),
        ...t,
      });
    }
    console.log(`✓ Transaction: "${t.title}" (${t.period}, ${t.type}, status: ${t.status})`);
  }

  // Create payments for demo36 for SP26 (overdue), SU26 (overdue), and FA26 (pending to pay)
  const spTrans = await Transaction.findOne({ club_id: club._id, period: "SP26" });
  const suTrans = await Transaction.findOne({ club_id: club._id, period: "SU26" });
  const faTrans = await Transaction.findOne({ club_id: club._id, period: "FA26" });

  const paymentSetups = [
    { trans: spTrans, period: "SP26" },
    { trans: suTrans, period: "SU26" },
    { trans: faTrans, period: "FA26" },
  ];

  for (const ps of paymentSetups) {
    if (ps.trans) {
      let pay = await Payment.findOne({
        transaction_id: ps.trans._id,
        membership_id: memberMap["demo36@fpt.edu.vn"]._id,
      });
      if (!pay) {
        await Payment.create({
          membership_id: memberMap["demo36@fpt.edu.vn"]._id,
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
  console.log(`✓ 3-Term Fee Payments created for demo36 (SP26: Quá hạn, SU26: Quá hạn, FA26: Chưa đóng)`);

  console.log("\n🎉 COMPREHENSIVE SEED DATA COMPLETED SUCCESSFULLY!");
  console.log("Ready for demo recording.\n");
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error("Seed error:", err);
  process.exit(1);
});
