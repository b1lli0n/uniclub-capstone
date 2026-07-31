const mongoose = require("mongoose");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

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
const Poll = require("../src/models/poll.model");
const Invitation = require("../src/models/invitation.model");
const Transaction = require("../src/models/transaction.model");
const Payment = require("../src/models/payment.model");
const Feedback = require("../src/models/feedback.model");

async function check() {
  await mongoose.connect(process.env.MONGODB_URI);
  console.log("==================================================");
  console.log("📊 UNICLUB MASTER DATABASE RECORD COUNTS (22 MODELS)");
  console.log("==================================================");

  const models = [
    { name: "User", model: User },
    { name: "Profile", model: Profile },
    { name: "Club", model: Club },
    { name: "ClubMember", model: ClubMember },
    { name: "JoinForm", model: JoinForm },
    { name: "ClubCreationRequest", model: ClubCreationRequest },
    { name: "EventCreationRequest", model: EventCreationRequest },
    { name: "ActionType", model: ActionType },
    { name: "PointRule", model: PointRule },
    { name: "ContributionLog", model: ContributionLog },
    { name: "Event", model: Event },
    { name: "EventRegistration", model: EventRegistration },
    { name: "EventTimeline", model: EventTimeline },
    { name: "Activity", model: Activity },
    { name: "Reward", model: Reward },
    { name: "RewardRedemption", model: RewardRedemption },
    { name: "RewardTransaction", model: RewardTransaction },
    { name: "Poll", model: Poll },
    { name: "Invitation", model: Invitation },
    { name: "Transaction", model: Transaction },
    { name: "Payment", model: Payment },
    { name: "Feedback", model: Feedback }
  ];

  let totalRecords = 0;
  for (const m of models) {
    const count = await m.model.countDocuments({});
    totalRecords += count;
    console.log(` - ${m.name.padEnd(22)} : ${count} records`);
  }

  console.log("--------------------------------------------------");
  console.log(` TOTAL DATABASE RECORDS : ${totalRecords}`);
  console.log("==================================================");

  process.exit(0);
}

check().catch(e => { console.error(e); process.exit(1); });
