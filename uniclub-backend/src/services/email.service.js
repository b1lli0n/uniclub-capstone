const path = require("path");
require("dotenv").config({ path: path.resolve(__dirname, "../../.env") });
require("dotenv").config();
const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const emailUser = (process.env.EMAIL_USER || "uniclub2402@gmail.com").trim();
  const emailPass = (process.env.EMAIL_PASS || "nhnokwtindajgjcd").trim();

  if (emailUser && emailPass) {
    transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      secure: true,
      auth: {
        user: emailUser,
        pass: emailPass,
      },
    });
  } else {
    transporter = {
      sendMail: async (mailOptions) => {
        console.log("\n================ [EMAIL SERVICE MOCK / LOG] ================");
        console.log(`To:      ${mailOptions.to}`);
        console.log(`Subject: ${mailOptions.subject}`);
        console.log("------------------------------------------------------------");
        console.log(mailOptions.text || mailOptions.html);
        console.log("============================================================\n");
        return { messageId: "mock-email-id" };
      },
    };
  }
  return transporter;
}

const sendApprovedEmail = async ({ toEmail, userName, clubName }) => {
  try {
    const mailer = getTransporter();
    const subject = `[UniClub] 🎉 Congratulations! Your application to join ${clubName} has been APPROVED`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #2e7d32;">🎉 Congratulations ${userName}!</h2>
        <p>Your application to join <strong>${clubName}</strong> has been <strong>APPROVED</strong> by the Club Board!</p>
        <p>You are now an official member of the club. You can access the <strong>UniClub</strong> platform to:</p>
        <ul>
          <li>View club activity schedules and internal events.</li>
          <li>Register for QR tickets to participate in club programs.</li>
          <li>Earn achievement reward points and pay club membership fees.</li>
        </ul>
        <br/>
        <p>Best regards,</p>
        <p><strong>UniClub Administration & ${clubName} Board</strong></p>
      </div>
    `;

    await mailer.sendMail({
      from: `"UniClub System" <${process.env.EMAIL_USER || "uniclub2402@gmail.com"}>`,
      to: toEmail,
      subject,
      html,
    });
    console.log(`📧 Approved Email sent successfully to ${toEmail}`);
  } catch (error) {
    console.error("❌ Failed to send approved email:", error.message);
  }
};

const sendRejectedEmail = async ({ toEmail, userName, clubName, reviewNote }) => {
  try {
    const mailer = getTransporter();
    const subject = `[UniClub] Membership Application Result for ${clubName}`;
    const reasonText = reviewNote ? `<p><strong>Reason / Note from Club Board:</strong> ${reviewNote}</p>` : "";
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #d32f2f;">Membership Application Result</h2>
        <p>Hello <strong>${userName}</strong>,</p>
        <p>Thank you for your interest in joining <strong>${clubName}</strong>.</p>
        <p>Unfortunately, your membership application <strong>HAS NOT BEEN APPROVED</strong> at this time.</p>
        ${reasonText}
        <p><em>Note: You can update your application and re-apply 24 hours after this decision.</em></p>
        <br/>
        <p>Best regards,</p>
        <p><strong>${clubName} Board</strong></p>
      </div>
    `;

    await mailer.sendMail({
      from: `"UniClub System" <${process.env.EMAIL_USER || "uniclub2402@gmail.com"}>`,
      to: toEmail,
      subject,
      html,
    });
    console.log(`📧 Rejected Email sent successfully to ${toEmail}`);
  } catch (error) {
    console.error("❌ Failed to send rejected email:", error.message);
  }
};

const sendPointsAwardedEmail = async ({ toEmail, userName, clubName, points, reason, newTotal }) => {
  try {
    const mailer = getTransporter();
    const subject = `[UniClub] 🏆 You received +${points} reward points from ${clubName}!`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 16px;">
        <div style="background: #ffffff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <h2 style="color: #2e7d32; margin-top: 0;">🏆 Reward Points Awarded</h2>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>Congratulations! You have received <strong style="color: #2e7d32; font-size: 1.1em;">+${points} reward points</strong> from the Board of <strong>${clubName}</strong>.</p>
          <div style="background: #f1f8e9; padding: 16px; border-radius: 8px; border-left: 4px solid #2e7d32; margin: 16px 0;">
            <p style="margin: 0 0 6px 0;"><strong>Contribution / Reason:</strong> ${reason}</p>
            <p style="margin: 0;"><strong>Points Earned:</strong> <span style="color: #2e7d32; font-weight: bold;">+${points} pts</span></p>
          </div>
          ${newTotal !== undefined ? `<p style="font-size: 1.05em;">📊 <strong>Your current club points balance:</strong> <strong style="color: #ea580c;">${newTotal} pts</strong></p>` : ''}
          <p style="color: #64748b; font-size: 0.9em; margin-top: 20px;">This point accumulation has been recorded in the <strong>Contribution Logs</strong> on UniClub.</p>
        </div>
      </div>
    `;

    await mailer.sendMail({
      from: `"UniClub System" <${process.env.EMAIL_USER || "uniclub2402@gmail.com"}>`,
      to: toEmail,
      subject,
      html,
    });
    console.log(`📧 Points Awarded Email sent successfully to ${toEmail}`);
  } catch (error) {
    console.error("❌ Failed to send points awarded email:", error.message);
  }
};

const sendEventRequestSubmittedEmailToAdmin = async ({ adminEmail = process.env.EMAIL_USER || "uniclub2402@gmail.com", clubName, requesterName, eventTitle, documentUrl }) => {
  try {
    const mailer = getTransporter();
    const subject = `[UniClub Admin] 📄 New Event Request: "${eventTitle}" from ${clubName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 16px;">
        <div style="background: #ffffff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <h2 style="color: #ea580c; margin-top: 0;">📄 New Event Request Notification</h2>
          <p>Dear System Administration,</p>
          <p>The club <strong>${clubName}</strong> has submitted a request to create a new event on UniClub:</p>
          <div style="background: #fff7ed; padding: 16px; border-radius: 8px; border-left: 4px solid #ea580c; margin: 16px 0;">
            <p style="margin: 0 0 6px 0;"><strong>Event Title:</strong> ${eventTitle}</p>
            <p style="margin: 0 0 6px 0;"><strong>Proposing Club:</strong> ${clubName}</p>
            <p style="margin: 0 0 6px 0;"><strong>Requester:</strong> ${requesterName}</p>
            <p style="margin: 0;"><strong>Document / Contract:</strong> <a href="${documentUrl}" target="_blank" style="color: #2563eb; font-weight: bold;">View Contract PDF on Google Drive</a></p>
          </div>
          <p>Please log in to <strong>Admin Dashboard -> Event Requests List</strong> to review the document and Approve or Reject.</p>
        </div>
      </div>
    `;

    await mailer.sendMail({
      from: `"UniClub System" <${process.env.EMAIL_USER || "uniclub2402@gmail.com"}>`,
      to: adminEmail,
      subject,
      html,
    });
    console.log(`📧 Event Request Admin Email sent successfully to ${adminEmail}`);
  } catch (error) {
    console.error("❌ Failed to send event request admin email:", error.message);
  }
};

const sendEventRequestResultEmailToRequester = async ({ toEmail, userName, clubName, eventTitle, isApproved, reviewNote }) => {
  try {
    const mailer = getTransporter();
    const statusText = isApproved ? "APPROVED" : "NOT APPROVED";
    const statusColor = isApproved ? "#2e7d32" : "#d32f2f";
    const subject = `[UniClub] Review Result for Event Proposal: "${eventTitle}"`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 16px;">
        <div style="background: #ffffff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <h2 style="color: ${statusColor}; margin-top: 0;">Event Proposal Review Result</h2>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>The System Administration has reviewed your event proposal for <strong>${clubName}</strong>:</p>
          <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; border-left: 4px solid ${statusColor}; margin: 16px 0;">
            <p style="margin: 0 0 6px 0;"><strong>Event Title:</strong> ${eventTitle}</p>
            <p style="margin: 0 0 6px 0;"><strong>Approval Status:</strong> <strong style="color: ${statusColor};">${statusText}</strong></p>
            ${reviewNote ? `<p style="margin: 0;"><strong>Admin Note:</strong> ${reviewNote}</p>` : ''}
          </div>
          ${isApproved ? '<p>The event has been initialized in the system in Draft status. You can visit <strong>Manage Events</strong> to add the event timeline and officially publish it!</p>' : ''}
        </div>
      </div>
    `;

    await mailer.sendMail({
      from: `"UniClub System" <${process.env.EMAIL_USER || "uniclub2402@gmail.com"}>`,
      to: toEmail,
      subject,
      html,
    });
    console.log(`📧 Event Request Result Email sent successfully to ${toEmail}`);
  } catch (error) {
    console.error("❌ Failed to send event request result email:", error.message);
  }
};

const sendEventTicketEmail = async ({ toEmail, userName, clubName, eventTitle, eventDate, eventLocation, ticketCode, qrCodeUrl }) => {
  try {
    const mailer = getTransporter();
    const subject = `[UniClub] 🎟️ Event QR Ticket: "${eventTitle}"`;
    const formattedDate = eventDate ? new Date(eventDate).toLocaleString('en-US', { dateStyle: 'full', timeStyle: 'short' }) : 'Event scheduled time';
    
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 16px;">
        <div style="background: #ffffff; padding: 24px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0;">
          
          <div style="text-align: center; border-bottom: 2px dashed #e2e8f0; padding-bottom: 20px; margin-bottom: 20px;">
            <span style="font-size: 0.85rem; font-weight: 800; color: #ea580c; text-transform: uppercase; letter-spacing: 0.05em;">EVENT E-TICKET - UNICLUB</span>
            <h2 style="color: #0f172a; margin: 8px 0 4px 0; font-size: 1.4rem;">${eventTitle}</h2>
            <p style="color: #64748b; margin: 0; font-size: 0.95rem;">Organized by: <strong>${clubName}</strong></p>
          </div>

          <div style="text-align: center; margin: 20px 0;">
            <div style="background: #ffffff; display: inline-block; padding: 12px; border: 2px solid #ea580c; border-radius: 16px; box-shadow: 0 4px 12px rgba(234, 88, 12, 0.15);">
              <img src="${qrCodeUrl}" alt="QR Ticket Code" style="width: 180px; height: 180px; display: block; border-radius: 8px;" />
            </div>
            <p style="margin: 10px 0 0 0; font-weight: 800; font-size: 1.1rem; color: #0f172a; letter-spacing: 0.08em;">
              TICKET CODE: <span style="color: #ea580c;">${ticketCode}</span>
            </p>
          </div>

          <div style="background: #fff7ed; padding: 16px 20px; border-radius: 12px; border-left: 4px solid #ea580c; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; font-size: 0.92rem;">👤 <strong>Ticket Holder:</strong> ${userName}</p>
            <p style="margin: 0 0 8px 0; font-size: 0.92rem;">🕒 <strong>Time:</strong> ${formattedDate}</p>
            <p style="margin: 0; font-size: 0.92rem;">📍 <strong>Location:</strong> ${eventLocation}</p>
          </div>

          <div style="text-align: center; color: #64748b; font-size: 0.85rem; line-height: 1.5; margin-top: 20px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
            <p style="margin: 0;">* Please present this QR code at the check-in gate to verify attendance and receive your <strong>Club Reward Points</strong>!</p>
          </div>

        </div>
      </div>
    `;

    await mailer.sendMail({
      from: `"UniClub System" <${process.env.EMAIL_USER || "uniclub2402@gmail.com"}>`,
      to: toEmail,
      subject,
      html,
    });
    console.log(`📧 Event Ticket Email sent successfully to ${toEmail}`);
  } catch (error) {
    console.error("❌ Failed to send event ticket email:", error.message);
  }
};

const sendEventFeedbackSubmittedEmail = async ({ toEmail, userName, clubName, eventTitle, rating, comment, pointsAwarded }) => {
  try {
    const mailer = getTransporter();
    const subject = `[UniClub] 🌟 Thank you for reviewing the event: "${eventTitle}"`;
    const stars = "⭐".repeat(rating || 5);
    
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 16px;">
        <div style="background: #ffffff; padding: 24px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0;">
          
          <div style="text-align: center; border-bottom: 2px dashed #e2e8f0; padding-bottom: 20px; margin-bottom: 20px;">
            <span style="font-size: 0.85rem; font-weight: 800; color: #ea580c; text-transform: uppercase; letter-spacing: 0.05em;">THANK YOU FOR YOUR FEEDBACK - UNICLUB</span>
            <h2 style="color: #0f172a; margin: 8px 0 4px 0; font-size: 1.4rem;">${eventTitle}</h2>
            <p style="color: #64748b; margin: 0; font-size: 0.95rem;">Organized by: <strong>${clubName}</strong></p>
          </div>

          <div style="background: #fff7ed; padding: 16px 20px; border-radius: 12px; border-left: 4px solid #ea580c; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; font-size: 0.95rem;">👤 <strong>Student:</strong> ${userName}</p>
            <p style="margin: 0 0 8px 0; font-size: 0.95rem;">⭐ <strong>Rating:</strong> ${stars} (${rating}/5 stars)</p>
            <p style="margin: 0; font-size: 0.95rem;">💬 <strong>Feedback:</strong> "${comment || 'Thank you for an amazing event!'}"</p>
          </div>

          ${pointsAwarded ? `
          <div style="background: #f0fdf4; padding: 14px 20px; border-radius: 12px; border: 1px solid #bbf7d0; text-align: center; margin: 20px 0;">
            <p style="margin: 0; color: #166534; font-weight: 800; font-size: 1.05rem;">
              🏆 You earned <span style="color: #22c55e; font-size: 1.2rem;">+${pointsAwarded} pts</span> for your event review!
            </p>
          </div>
          ` : ''}

          <div style="text-align: center; color: #64748b; font-size: 0.85rem; line-height: 1.5; margin-top: 20px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
            <p style="margin: 0;">Your feedback helps the <strong>${clubName}</strong> Board improve upcoming programs!</p>
          </div>

        </div>
      </div>
    `;

    await mailer.sendMail({
      from: `"UniClub System" <${process.env.EMAIL_USER || "uniclub2402@gmail.com"}>`,
      to: toEmail,
      subject,
      html,
    });
    console.log(`📧 Event Feedback Email sent successfully to ${toEmail}`);
  } catch (error) {
    console.error("❌ Failed to send event feedback email:", error.message);
  }
};

const sendRedemptionRequestEmailToLeader = async ({ leaderEmail = process.env.EMAIL_USER || "uniclub2402@gmail.com", userName, clubName, rewardTitle, pointCost }) => {
  try {
    const mailer = getTransporter();
    const subject = `[UniClub President] 🎁 New Reward Redemption Request from ${userName}: "${rewardTitle}"`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 16px;">
        <div style="background: #ffffff; padding: 24px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0;">
          <h2 style="color: #ea580c; margin-top: 0;">🎁 New Reward Redemption Request</h2>
          <p>Hello <strong>${clubName}</strong> Board / President,</p>
          <p>Member <strong>${userName}</strong> has submitted a reward redemption request on UniClub:</p>
          <div style="background: #fff7ed; padding: 16px 20px; border-radius: 12px; border-left: 4px solid #ea580c; margin: 20px 0;">
            <p style="margin: 0 0 6px 0;"><strong>Reward Title:</strong> ${rewardTitle}</p>
            <p style="margin: 0 0 6px 0;"><strong>Points Cost:</strong> <strong style="color: #ea580c;">${pointCost} pts</strong></p>
            <p style="margin: 0;"><strong>Requesting Member:</strong> ${userName}</p>
          </div>
          <p>Please log in to the <strong>Rewards Management</strong> page to Approve or Reject this request.</p>
        </div>
      </div>
    `;

    await mailer.sendMail({
      from: `"UniClub System" <${process.env.EMAIL_USER || "uniclub2402@gmail.com"}>`,
      to: leaderEmail,
      subject,
      html,
    });
    console.log(`📧 Redemption Request Email sent to Leader: ${leaderEmail}`);
  } catch (error) {
    console.error("❌ Failed to send redemption request email to leader:", error.message);
  }
};

const sendRedemptionApprovedEmailToStudent = async ({ toEmail, userName, clubName, rewardTitle, pointCost, pickupCode }) => {
  try {
    const mailer = getTransporter();
    const subject = `[UniClub] 🎉 Congratulations! Your reward redemption for "${rewardTitle}" has been APPROVED!`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 16px;">
        <div style="background: #ffffff; padding: 24px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0;">
          <h2 style="color: #2e7d32; margin-top: 0;">🎉 Reward Redemption Approved!</h2>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>The Board of <strong>${clubName}</strong> has <strong>APPROVED</strong> your reward redemption request:</p>
          <div style="background: #f0fdf4; padding: 16px 20px; border-radius: 12px; border-left: 4px solid #22c55e; margin: 20px 0;">
            <p style="margin: 0 0 6px 0;">🎁 <strong>Reward:</strong> ${rewardTitle}</p>
            <p style="margin: 0 0 6px 0;">💎 <strong>Points Deducted:</strong> -${pointCost} pts</p>
            <p style="margin: 0;">🔑 <strong>Pickup Code:</strong> <strong style="color: #ea580c; font-size: 1.1rem;">${pickupCode}</strong></p>
          </div>
          <p style="color: #475569; font-size: 0.9rem;">📌 <em>Please visit the <strong>Redemption History</strong> tab on the website or contact your Club Board to pick up your reward!</em></p>
        </div>
      </div>
    `;

    await mailer.sendMail({
      from: `"UniClub System" <${process.env.EMAIL_USER || "uniclub2402@gmail.com"}>`,
      to: toEmail,
      subject,
      html,
    });
    console.log(`📧 Redemption Approved Email sent to Student: ${toEmail}`);
  } catch (error) {
    console.error("❌ Failed to send redemption approved email to student:", error.message);
  }
};

const sendRedemptionRejectedEmailToStudent = async ({ toEmail, userName, clubName, rewardTitle, rejectionReason }) => {
  try {
    const mailer = getTransporter();
    const subject = `[UniClub] Reward Redemption Result: "${rewardTitle}"`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 16px;">
        <div style="background: #ffffff; padding: 24px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0;">
          <h2 style="color: #d32f2f; margin-top: 0;">Reward Redemption Result</h2>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>The Board of <strong>${clubName}</strong> has reviewed your reward redemption request for <strong>"${rewardTitle}"</strong>:</p>
          <div style="background: #fef2f2; padding: 16px 20px; border-radius: 12px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <p style="margin: 0 0 6px 0;"><strong>Status:</strong> <strong style="color: #dc2626;">NOT APPROVED</strong></p>
            <p style="margin: 0;"><strong>Reason from Club Board:</strong> "${rejectionReason || 'Item is currently out of stock'}"</p>
          </div>
          <p style="color: #475569; font-size: 0.9rem;">💡 <em>Your redeemed reward points have been fully refunded to your club points balance.</em></p>
        </div>
      </div>
    `;

    await mailer.sendMail({
      from: `"UniClub System" <${process.env.EMAIL_USER || "uniclub2402@gmail.com"}>`,
      to: toEmail,
      subject,
      html,
    });
    console.log(`📧 Redemption Rejected Email sent to Student: ${toEmail}`);
  } catch (error) {
    console.error("❌ Failed to send redemption rejected email to student:", error.message);
  }
};

const sendRedemptionSubmittedEmailToStudent = async ({ toEmail, userName, clubName, rewardTitle, pointCost }) => {
  try {
    const mailer = getTransporter();
    const subject = `[UniClub] 🎁 Reward Redemption Request Received: "${rewardTitle}"`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 16px;">
        <div style="background: #ffffff; padding: 24px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0;">
          <h2 style="color: #2563eb; margin-top: 0;">🎁 Reward Redemption Request Received</h2>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>You have successfully submitted a reward redemption request for <strong>${clubName}</strong>:</p>
          <div style="background: #eff6ff; padding: 16px 20px; border-radius: 12px; border-left: 4px solid #3b82f6; margin: 20px 0;">
            <p style="margin: 0 0 6px 0;">🎁 <strong>Reward:</strong> ${rewardTitle}</p>
            <p style="margin: 0 0 6px 0;">💎 <strong>Point Cost:</strong> <strong style="color: #2563eb;">${pointCost} pts</strong></p>
            <p style="margin: 0;">⏳ <strong>Status:</strong> Pending Approval from Club Board</p>
          </div>
          <p style="color: #475569; font-size: 0.9rem;">📌 <em>You will receive an email notification as soon as the Club Board approves or reviews your request. You can also track the status in the <strong>Redemption History</strong> tab.</em></p>
        </div>
      </div>
    `;

    await mailer.sendMail({
      from: `"UniClub System" <${process.env.EMAIL_USER || "uniclub2402@gmail.com"}>`,
      to: toEmail,
      subject,
      html,
    });
    console.log(`📧 Redemption Submitted Email sent to Student: ${toEmail}`);
  } catch (error) {
    console.error("❌ Failed to send redemption submitted email to student:", error.message);
  }
};

const sendFeeNotificationEmail = async ({ toEmail, userName, clubName, title, amount, period }) => {
  try {
    const mailer = getTransporter();
    const formattedAmount = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
    const subject = `[UniClub] 🧾 Club Fee Payment Notice: ${title} - ${clubName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 16px;">
        <div style="background: #ffffff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <h2 style="color: #ea580c; margin-top: 0;">🧾 Club Fee Payment Notice</h2>
          <p>Hello <strong>${userName}</strong>,</p>
          <p>The Board of <strong>${clubName}</strong> has created a new fee payment notice on UniClub:</p>
          <div style="background: #fff7ed; padding: 16px; border-radius: 8px; border-left: 4px solid #ea580c; margin: 16px 0;">
            <p style="margin: 0 0 6px 0;"><strong>Fee Title:</strong> ${title}</p>
            <p style="margin: 0 0 6px 0;"><strong>Amount Due:</strong> <strong style="color: #ea580c; font-size: 1.15em;">${formattedAmount} (${Number(amount).toLocaleString("en-US")} VND)</strong></p>
            <p style="margin: 0;"><strong>Period / Note:</strong> ${period}</p>
          </div>
          <p>Please log in to UniClub ➔ Go to <strong>Fees</strong> to view details and scan the QR code to pay online.</p>
          <br/>
          <p style="color: #64748b; font-size: 0.9em;">Best regards,<br/><strong>Financial Management Team - ${clubName}</strong></p>
        </div>
      </div>
    `;

    await mailer.sendMail({
      from: `"UniClub System" <${process.env.EMAIL_USER || "uniclub2402@gmail.com"}>`,
      to: toEmail,
      subject,
      html,
    });
    console.log(`📧 Fee Notification Email sent successfully to ${toEmail}`);
  } catch (error) {
    console.error("❌ Failed to send fee notification email:", error.message);
  }
};

const ROLE_NAMES_EN = {
  president: "President",
  leader: "President",
  secretary: "Secretary",
  treasurer: "Treasurer",
  event_manager: "Event Manager",
  member: "Member",
};

const sendInvitationEmail = async ({ toEmail, userName, clubName, role, message, expiresAt, isResend = false }) => {
  try {
    const mailer = getTransporter();
    const subject = isResend
      ? `[UniClub] 📩 [Resent] Invitation to join ${clubName}`
      : `[UniClub] 📩 Invitation to join ${clubName}`;
    const roleDisplay = ROLE_NAMES_EN[role] || role || "Member";
    const formattedExpires = expiresAt ? new Date(expiresAt).toLocaleDateString("en-GB") : "3 days";
    const frontendUrl = (process.env.FRONTEND_URL || "http://localhost:5173").replace(/\/$/, "");
    const requestsUrl = `${frontendUrl}/my-requests?tab=received`;

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #333; line-height: 1.6; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 8px;">
        <h2 style="color: #2563eb; margin-top: 0;">📩 Hello ${userName}!</h2>
        <p>The Board of <strong>${clubName}</strong> ${isResend ? "has re-sent an invitation for you" : "cordially invites you"} to join the club as a <strong>${roleDisplay}</strong>!</p>
        ${message ? `<blockquote style="background: #f8fafc; padding: 12px; border-left: 4px solid #2563eb; margin: 15px 0; font-style: italic;">"${message}"</blockquote>` : ""}
        <div style="background: #fffbeb; padding: 10px 14px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 15px 0; font-size: 0.95em;">
          <p style="margin: 0; color: #b45309;">⏳ <strong>Expiration Period:</strong> Default 3 days (Deadline: <strong>${formattedExpires}</strong>). The invitation will automatically transition to <strong>Expired</strong> if not responded to in time.</p>
        </div>
        <p>Please click below to Accept or Decline this invitation in your UniClub account:</p>
        <div style="margin: 25px 0; text-align: center;">
          <a href="${requestsUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">View Invitation in My Requests</a>
        </div>
        <p style="font-size: 0.85em; color: #64748b;">Or visit UniClub &gt; My Requests (Received tab) to respond.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
        <p style="margin-bottom: 0;">Best regards,</p>
        <p style="margin-top: 4px;"><strong>${clubName} Board</strong></p>
      </div>
    `;

    await mailer.sendMail({
      from: `"UniClub System" <${process.env.EMAIL_USER || "uniclub2402@gmail.com"}>`,
      to: toEmail,
      subject,
      html,
    });
    console.log(`📧 ${isResend ? "Resend " : ""}Invitation Email sent successfully to ${toEmail}`);
  } catch (error) {
    console.error(`❌ Failed to send ${isResend ? "resend " : ""}invitation email:`, error.message);
  }
};

const STUDENT_AFFAIRS_EMAIL = "uniclub2402@gmail.com";

const sendNewClubCreationRequestEmailToSA = async ({ clubName, requesterName, requesterEmail, description, memberCount }) => {
  try {
    const mailer = getTransporter();
    const subject = `[UniClub] 📝 New Club Creation Request: ${clubName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #ea580c;">📝 New Club Creation Request</h2>
        <p>Student <strong>${requesterName}</strong> (${requesterEmail}) has submitted a request to establish a new club on UniClub:</p>
        <div style="background: #fff7ed; padding: 15px; border-left: 4px solid #ea580c; margin: 15px 0; border-radius: 4px;">
          <p style="margin: 0 0 8px 0;"><strong>Club Name:</strong> ${clubName}</p>
          <p style="margin: 0 0 8px 0;"><strong>Description / Purpose:</strong> ${description || "None"}</p>
          <p style="margin: 0;"><strong>Initial Founding Members:</strong> ${memberCount || 0} students</p>
        </div>
        <p>The Student Affairs Department is requested to log in to UniClub to review and approve.</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>UniClub Management System</strong></p>
      </div>
    `;

    await mailer.sendMail({
      from: `"UniClub System" <${process.env.EMAIL_USER || "uniclub2402@gmail.com"}>`,
      to: STUDENT_AFFAIRS_EMAIL,
      subject,
      html,
    });
    console.log(`📧 New Club Creation Request Email sent to Student Affairs (${STUDENT_AFFAIRS_EMAIL})`);
  } catch (error) {
    console.error("❌ Failed to send club creation request email to SA:", error.message);
  }
};

const sendClubCreationApprovedEmailToStudent = async ({ toEmail, requesterName, clubName, reviewNote }) => {
  try {
    const mailer = getTransporter();
    const subject = `[UniClub] 🎉 Club Creation Request for ${clubName} has been APPROVED!`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #16a34a;">🎉 Congratulations ${requesterName}!</h2>
        <p>Your request to establish <strong>${clubName}</strong> has been <strong>APPROVED by Student Affairs</strong>!</p>
        ${reviewNote ? `<blockquote style="background: #f0fdf4; padding: 12px; border-left: 4px solid #16a34a; margin: 15px 0;"><strong>Note from Student Affairs:</strong> "${reviewNote}"</blockquote>` : ""}
        <p>Your club has officially been activated on UniClub. You can now log in to access your club dashboard as President!</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>Student Affairs & UniClub Administration</strong></p>
      </div>
    `;

    await mailer.sendMail({
      from: `"UniClub System" <${process.env.EMAIL_USER || "uniclub2402@gmail.com"}>`,
      to: toEmail,
      subject,
      html,
    });
    console.log(`📧 Club Creation Approved Email sent to ${toEmail}`);
  } catch (error) {
    console.error("❌ Failed to send club creation approved email:", error.message);
  }
};

const sendClubCreationRejectedEmailToStudent = async ({ toEmail, requesterName, clubName, reviewNote }) => {
  try {
    const mailer = getTransporter();
    const subject = `[UniClub] ❌ Result for Club Creation Request: ${clubName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #dc2626;">❌ Hello ${requesterName},</h2>
        <p>Unfortunately, your request to establish <strong>${clubName}</strong> was <strong>REJECTED</strong> after review by Student Affairs.</p>
        ${reviewNote ? `<blockquote style="background: #fef2f2; padding: 12px; border-left: 4px solid #dc2626; margin: 15px 0;"><strong>Reason for rejection:</strong> "${reviewNote}"</blockquote>` : ""}
        <p>You can update your proposal details and submit a new request on UniClub.</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>UniClub Student Affairs</strong></p>
      </div>
    `;

    await mailer.sendMail({
      from: `"UniClub System" <${process.env.EMAIL_USER || "uniclub2402@gmail.com"}>`,
      to: toEmail,
      subject,
      html,
    });
    console.log(`📧 Club Creation Rejected Email sent to ${toEmail}`);
  } catch (error) {
    console.error("❌ Failed to send club creation rejected email:", error.message);
  }
};

const sendClubCreationMemberInviteEmail = async ({ toEmail, memberName, requesterName, clubName, description }) => {
  try {
    const mailer = getTransporter();
    const subject = `[UniClub] 💌 Invitation to join as Founding Member of: ${clubName}`;
    const directUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/my-requests?tab=received`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #2563eb;">💌 Invitation to Join Club Founding Members</h2>
        <p>Hello <strong>${memberName || "Student"}</strong>,</p>
        <p>Student <strong>${requesterName}</strong> has added you as a <strong>Founding Member</strong> in a proposal to establish a new club on UniClub:</p>
        <div style="background: #eff6ff; padding: 15px; border-left: 4px solid #2563eb; margin: 15px 0; border-radius: 4px;">
          <p style="margin: 0 0 8px 0;"><strong>Club Name:</strong> ${clubName}</p>
          <p style="margin: 0 0 8px 0;"><strong>Purpose / Description:</strong> ${description || "None"}</p>
          <p style="margin: 0;"><strong>Proposed Role:</strong> Founding Member</p>
        </div>
        <div style="background: #fffbeb; padding: 12px 16px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 15px 0; font-size: 0.95em;">
          <p style="margin: 0 0 6px 0; color: #b45309; font-weight: bold;">⏳ Confirmation Deadline: Within 3 days</p>
          <p style="margin: 0; color: #78350f;">The proposal will only be forwarded to the Student Affairs Department for review when <strong>all founding members</strong> on the list have accepted.</p>
        </div>
        <p>Please log in to UniClub to accept or decline the invitation:</p>
        <div style="margin: 25px 0;">
          <a href="${directUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            👉 View & Respond to Invitation on UniClub
          </a>
        </div>
        <p style="color: #64748b; font-size: 0.9em;">If you do not wish to participate, you can decline on the system.</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>UniClub Student Activity Management System</strong></p>
      </div>
    `;

    await mailer.sendMail({
      from: `"UniClub System" <${process.env.EMAIL_USER || "uniclub2402@gmail.com"}>`,
      to: toEmail,
      subject,
      html,
    });
    console.log(`📧 Club Creation Member Invite Email sent to ${toEmail}`);
  } catch (error) {
    console.error("❌ Failed to send club creation member invite email:", error.message);
  }
};

const sendClubCreationSubmittedEmailToRequester = async ({ toEmail, requesterName, clubName, memberCount, expiresAt }) => {
  try {
    const mailer = getTransporter();
    const subject = `[UniClub] 📝 Club Creation Proposal Submitted: ${clubName}`;
    const myRequestsUrl = `${process.env.FRONTEND_URL || "http://localhost:5173"}/my-requests`;
    const formattedDeadline = expiresAt ? new Date(expiresAt).toLocaleString("en-US") : "3 days from submission";
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #2563eb;">📝 Club Creation Proposal Confirmation</h2>
        <p>Hello <strong>${requesterName || "Student"}</strong>,</p>
        <p>You have successfully submitted a proposal to establish club <strong>${clubName}</strong> on the UniClub system.</p>
        <div style="background: #f8fafc; padding: 15px; border-left: 4px solid #2563eb; margin: 15px 0; border-radius: 4px;">
          <p style="margin: 0 0 8px 0;"><strong>Proposed Club Name:</strong> ${clubName}</p>
          <p style="margin: 0 0 8px 0;"><strong>Number of Founding Members:</strong> ${memberCount} students</p>
          <p style="margin: 0;"><strong>Confirmation Deadline (3 days):</strong> ${formattedDeadline}</p>
        </div>
        <div style="background: #fffbeb; padding: 12px 16px; border-radius: 6px; border-left: 4px solid #f59e0b; margin: 15px 0; font-size: 0.95em;">
          <p style="margin: 0 0 6px 0; color: #b45309; font-weight: bold;">⚠️ Important Note:</p>
          <p style="margin: 0; color: #78350f;">The system has sent email invitations to all founding members. Your proposal will only be forwarded to the Student Affairs Department after <strong>all ${memberCount} members</strong> confirm their agreement (Accept). Please remind your peers to check their inbox or log in to UniClub to respond in time!</p>
        </div>
        <div style="margin: 25px 0;">
          <a href="${myRequestsUrl}" style="background-color: #2563eb; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; display: inline-block;">
            👉 Track Confirmation Progress in My Requests
          </a>
        </div>
        <br/>
        <p>Best regards,</p>
        <p><strong>UniClub Management System</strong></p>
      </div>
    `;

    await mailer.sendMail({
      from: `"UniClub System" <${process.env.EMAIL_USER || "uniclub2402@gmail.com"}>`,
      to: toEmail,
      subject,
      html,
    });
    console.log(`📧 Club Creation Submitted Email sent to requester: ${toEmail}`);
  } catch (error) {
    console.error("❌ Failed to send club creation submitted email to requester:", error.message);
  }
};

const sendClubDeactivatedEmailToLeader = async ({ toEmail, leaderName, clubName, reason }) => {
  try {
    const mailer = getTransporter();
    const subject = `[UniClub] ⚠️ Club Deactivation Notice: ${clubName}`;
    const reasonSection = reason
      ? `<div style="background: #fff5f5; padding: 14px 16px; border-left: 4px solid #e53e3e; margin: 15px 0; border-radius: 6px;">
           <p style="margin: 0 0 6px 0; color: #c53030; font-weight: bold;">Deactivation Reason:</p>
           <p style="margin: 0; color: #2d3748; white-space: pre-wrap;">${reason}</p>
         </div>`
      : "";

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #e53e3e;">⚠️ Club Deactivation Notice</h2>
        <p>Hello <strong>${leaderName || "Club President"}</strong>,</p>
        <p>The Student Affairs Department announces that club <strong>${clubName}</strong> has been set to <strong>Inactive</strong> status on UniClub.</p>
        ${reasonSection}
        <p>During the inactivity period, members cannot interact or create new activities in the club. If you have any inquiries or would like to submit an appeal/explanation, please contact the Student Affairs Department directly.</p>
        <br/>
        <p>Best regards,</p>
        <p><strong>Student Affairs Department - UniClub</strong></p>
      </div>
    `;

    await mailer.sendMail({
      from: `"UniClub System" <${process.env.EMAIL_USER || "uniclub2402@gmail.com"}>`,
      to: toEmail,
      subject,
      html,
    });
    console.log(`📧 Club Deactivated Email sent to leader: ${toEmail}`);
  } catch (error) {
    console.error("❌ Failed to send club deactivated email to leader:", error.message);
  }
};

const sendNewJoinRequestEmailToPresident = async ({ presidentEmail, presidentName, applicantName, applicantEmail, clubName, answers }) => {
  try {
    const mailer = getTransporter();
    const subject = `[UniClub] 📬 New Membership Application: ${applicantName} has applied to ${clubName}`;
    const answersHtml = (answers || []).map((ans, idx) => `
      <p style="margin: 4px 0;"><strong>Question ${idx + 1}:</strong> ${ans.value}</p>
    `).join("");

    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 16px;">
        <div style="background: #ffffff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <h2 style="color: #ea580c; margin-top: 0;">📬 New Membership Application</h2>
          <p>Hello <strong>${presidentName || "Club President"}</strong>,</p>
          <p>Student <strong>${applicantName}</strong> (${applicantEmail}) has just submitted an application to join <strong>${clubName}</strong> on UniClub!</p>
          <div style="background: #fff7ed; padding: 16px; border-radius: 8px; border-left: 4px solid #ea580c; margin: 16px 0;">
            <h4 style="margin-top: 0; color: #c2410c;">Applicant's Answers:</h4>
            ${answersHtml || "<p>None</p>"}
          </div>
          <p>Please log in to <strong>UniClub ➔ Member Approval</strong> to review and approve or reject this application.</p>
          <br/>
          <p style="color: #64748b; font-size: 0.9em;">Best regards,<br/><strong>UniClub Management System</strong></p>
        </div>
      </div>
    `;

    await mailer.sendMail({
      from: `"UniClub System" <${process.env.EMAIL_USER || "uniclub2402@gmail.com"}>`,
      to: presidentEmail,
      subject,
      html,
    });
    console.log(`📧 New Join Request Email sent to President: ${presidentEmail}`);
  } catch (error) {
    console.error("❌ Failed to send new join request email to president:", error.message);
  }
};

module.exports = {
  sendApprovedEmail,
  sendRejectedEmail,
  sendPointsAwardedEmail,
  sendEventRequestSubmittedEmailToAdmin,
  sendEventRequestResultEmailToRequester,
  sendEventTicketEmail,
  sendEventFeedbackSubmittedEmail,
  sendRedemptionRequestEmailToLeader,
  sendRedemptionSubmittedEmailToStudent,
  sendRedemptionApprovedEmailToStudent,
  sendRedemptionRejectedEmailToStudent,
  sendFeeNotificationEmail,
  sendInvitationEmail,
  sendNewClubCreationRequestEmailToSA,
  sendClubCreationApprovedEmailToStudent,
  sendClubCreationRejectedEmailToStudent,
  sendClubCreationMemberInviteEmail,
  sendClubCreationSubmittedEmailToRequester,
  sendClubDeactivatedEmailToLeader,
  sendNewJoinRequestEmailToPresident,
};
