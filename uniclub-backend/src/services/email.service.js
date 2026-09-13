const nodemailer = require("nodemailer");

let transporter = null;

function getTransporter() {
  if (transporter) return transporter;

  const emailUser = process.env.EMAIL_USER;
  const emailPass = process.env.EMAIL_PASS;

  if (emailUser && emailPass) {
    transporter = nodemailer.createTransport({
      service: "gmail",
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
    const subject = `[UniClub] 🎉 Chúc mừng! Đơn gia nhập CLB ${clubName} đã được DUYỆT`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #2e7d32;">🎉 Chúc mừng ${userName}!</h2>
        <p>Yêu cầu tham gia Câu lạc bộ <strong>${clubName}</strong> của bạn đã được <strong>PHÊ DUYỆT</strong> bởi Ban chủ nhiệm!</p>
        <p>Bây giờ bạn đã trở thành thành viên chính thức của câu lạc bộ. Bạn có thể truy cập hệ thống <strong>UniClub</strong> để:</p>
        <ul>
          <li>Xem lịch hoạt động và sự kiện nội bộ của CLB.</li>
          <li>Đăng ký nhận vé QR tham gia các chương trình.</li>
          <li>Tích lũy điểm thưởng thành tích và đóng quỹ CLB.</li>
        </ul>
        <br/>
        <p>Trân trọng,</p>
        <p><strong>Ban quản trị UniClub & Ban chủ nhiệm ${clubName}</strong></p>
      </div>
    `;

    await mailer.sendMail({
      from: `"UniClub System" <${process.env.EMAIL_USER || "noreply@uniclub.edu.vn"}>`,
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
    const subject = `[UniClub] Thông báo kết quả đơn gia nhập CLB ${clubName}`;
    const reasonText = reviewNote ? `<p><strong>Lý do từ chối / Ghi chú từ Ban chủ nhiệm:</strong> ${reviewNote}</p>` : "";
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #d32f2f;">Thông báo kết quả đơn đăng ký</h2>
        <p>Chào <strong>${userName}</strong>,</p>
        <p>Cảm ơn bạn đã quan tâm và gửi đơn gia nhập <strong>${clubName}</strong>.</p>
        <p>Rất tiếc, đơn đăng ký gia nhập của bạn hiện <strong>CHƯA ĐƯỢC PHÊ DUYỆT</strong> trong đợt này.</p>
        ${reasonText}
        <p><em>Lưu ý: Bạn có thể hoàn thiện lại hồ sơ và nộp lại đơn đăng ký mới sau 24 giờ kể từ thời điểm này.</em></p>
        <br/>
        <p>Trân trọng,</p>
        <p><strong>Ban chủ nhiệm ${clubName}</strong></p>
      </div>
    `;

    await mailer.sendMail({
      from: `"UniClub System" <${process.env.EMAIL_USER || "noreply@uniclub.edu.vn"}>`,
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
    const subject = `[UniClub] 🏆 Bạn vừa nhận được +${points} điểm thưởng từ ${clubName}!`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 16px;">
        <div style="background: #ffffff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <h2 style="color: #2e7d32; margin-top: 0;">🏆 Thông Báo Thưởng Điểm Rèn Luyện</h2>
          <p>Xin chào <strong>${userName}</strong>,</p>
          <p>Chúc mừng! Bạn vừa nhận được <strong style="color: #2e7d32; font-size: 1.1em;">+${points} điểm thưởng</strong> từ Ban chủ nhiệm <strong>${clubName}</strong>.</p>
          <div style="background: #f1f8e9; padding: 16px; border-radius: 8px; border-left: 4px solid #2e7d32; margin: 16px 0;">
            <p style="margin: 0 0 6px 0;"><strong>Nội dung đóng góp / Lý do:</strong> ${reason}</p>
            <p style="margin: 0;"><strong>Điểm thưởng nhận được:</strong> <span style="color: #2e7d32; font-weight: bold;">+${points} pts</span></p>
          </div>
          ${newTotal !== undefined ? `<p style="font-size: 1.05em;">📊 <strong>Tổng ví điểm CLB hiện tại của bạn:</strong> <strong style="color: #ea580c;">${newTotal} pts</strong></p>` : ''}
          <p style="color: #64748b; font-size: 0.9em; margin-top: 20px;">Lịch sử tích lũy điểm thưởng này đã được tự động lưu công khai vào <strong>Nhật ký đóng góp (Contribution Logs)</strong> trên hệ thống UniClub.</p>
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
    const subject = `[UniClub Admin] 📄 Đơn tạo sự kiện mới: "${eventTitle}" từ ${clubName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 16px;">
        <div style="background: #ffffff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <h2 style="color: #ea580c; margin-top: 0;">📄 Thông Báo Yêu Cầu Tạo Sự Kiện Mới</h2>
          <p>Kính gửi Ban Quản Trị Hệ Thống (Admin),</p>
          <p>Câu lạc bộ <strong>${clubName}</strong> vừa nộp Đơn yêu cầu phê duyệt tạo sự kiện mới trên hệ thống UniClub:</p>
          <div style="background: #fff7ed; padding: 16px; border-radius: 8px; border-left: 4px solid #ea580c; margin: 16px 0;">
            <p style="margin: 0 0 6px 0;"><strong>Tên sự kiện:</strong> ${eventTitle}</p>
            <p style="margin: 0 0 6px 0;"><strong>Câu lạc bộ đề xuất:</strong> ${clubName}</p>
            <p style="margin: 0 0 6px 0;"><strong>Người gửi yêu cầu:</strong> ${requesterName}</p>
            <p style="margin: 0;"><strong>Hợp đồng / Giấy phép:</strong> <a href="${documentUrl}" target="_blank" style="color: #2563eb; font-weight: bold;">Xem file Hợp đồng Google Drive PDF</a></p>
          </div>
          <p>Vui lòng đăng nhập vào <strong>Admin Dashboard -> Event Requests List</strong> để tiến hành kiểm tra Hợp đồng và Phê duyệt (Approve) hoặc Từ chối (Reject).</p>
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
    const statusText = isApproved ? "ĐÃ ĐƯỢC PHÊ DUYỆT" : "CHƯA ĐƯỢC PHÊ DUYỆT";
    const statusColor = isApproved ? "#2e7d32" : "#d32f2f";
    const subject = `[UniClub] Thông báo kết quả duyệt Đơn tạo sự kiện: "${eventTitle}"`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 16px;">
        <div style="background: #ffffff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <h2 style="color: ${statusColor}; margin-top: 0;">Thông Báo Kết Quả Phê Duyệt Sự Kiện</h2>
          <p>Xin chào <strong>${userName}</strong>,</p>
          <p>Ban Quản Trị Hệ Thống (Admin) vừa xem xét Hợp đồng và cập nhật kết quả Yêu cầu Tạo Sự Kiện của câu lạc bộ <strong>${clubName}</strong>:</p>
          <div style="background: #f1f5f9; padding: 16px; border-radius: 8px; border-left: 4px solid ${statusColor}; margin: 16px 0;">
            <p style="margin: 0 0 6px 0;"><strong>Tên sự kiện:</strong> ${eventTitle}</p>
            <p style="margin: 0 0 6px 0;"><strong>Trạng thái duyệt:</strong> <strong style="color: ${statusColor};">${statusText}</strong></p>
            ${reviewNote ? `<p style="margin: 0;"><strong>Ghi chú từ Admin:</strong> ${reviewNote}</p>` : ''}
          </div>
          ${isApproved ? '<p>Sự kiện đã được khởi tạo trong hệ thống ở trạng thái Nháp (Draft). Bạn có thể truy cập mục <strong>Manage Events</strong> để bổ sung Lịch trình Timeline và xuất bản sự kiện chính thức!</p>' : ''}
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
    const subject = `[UniClub] 🎟️ Vé Điện Tử QR Tham Gia Sự Kiện: "${eventTitle}"`;
    const formattedDate = eventDate ? new Date(eventDate).toLocaleString('vi-VN', { dateStyle: 'full', timeStyle: 'short' }) : 'Thời gian diễn ra sự kiện';
    
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 16px;">
        <div style="background: #ffffff; padding: 24px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0;">
          
          <div style="text-align: center; border-bottom: 2px dashed #e2e8f0; padding-bottom: 20px; margin-bottom: 20px;">
            <span style="font-size: 0.85rem; font-weight: 800; color: #ea580c; text-transform: uppercase; letter-spacing: 0.05em;">VÉ ĐIỆN TỬ THAM GIA SỰ KIỆN - UNICLUB</span>
            <h2 style="color: #0f172a; margin: 8px 0 4px 0; font-size: 1.4rem;">${eventTitle}</h2>
            <p style="color: #64748b; margin: 0; font-size: 0.95rem;">Đơn vị tổ chức: <strong>${clubName}</strong></p>
          </div>

          <div style="text-align: center; margin: 20px 0;">
            <div style="background: #ffffff; display: inline-block; padding: 12px; border: 2px solid #ea580c; border-radius: 16px; box-shadow: 0 4px 12px rgba(234, 88, 12, 0.15);">
              <img src="${qrCodeUrl}" alt="QR Ticket Code" style="width: 180px; height: 180px; display: block; border-radius: 8px;" />
            </div>
            <p style="margin: 10px 0 0 0; font-weight: 800; font-size: 1.1rem; color: #0f172a; letter-spacing: 0.08em;">
              MÃ VÉ: <span style="color: #ea580c;">${ticketCode}</span>
            </p>
          </div>

          <div style="background: #fff7ed; padding: 16px 20px; border-radius: 12px; border-left: 4px solid #ea580c; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; font-size: 0.92rem;">👤 <strong>Người sở hữu:</strong> ${userName}</p>
            <p style="margin: 0 0 8px 0; font-size: 0.92rem;">🕒 <strong>Thời gian:</strong> ${formattedDate}</p>
            <p style="margin: 0; font-size: 0.92rem;">📍 <strong>Địa điểm:</strong> ${eventLocation}</p>
          </div>

          <div style="text-align: center; color: #64748b; font-size: 0.85rem; line-height: 1.5; margin-top: 20px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
            <p style="margin: 0;">* Vui lòng xuất trình mã QR này tại cổng check-in Hội trường để điểm danh và nhận ngay <strong>Điểm Thưởng Tích Lũy CLB</strong>!</p>
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
    const subject = `[UniClub] 🌟 Cảm ơn bạn đã gửi Đánh giá Sự kiện: "${eventTitle}"`;
    const stars = "⭐".repeat(rating || 5);
    
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 16px;">
        <div style="background: #ffffff; padding: 24px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0;">
          
          <div style="text-align: center; border-bottom: 2px dashed #e2e8f0; padding-bottom: 20px; margin-bottom: 20px;">
            <span style="font-size: 0.85rem; font-weight: 800; color: #ea580c; text-transform: uppercase; letter-spacing: 0.05em;">CẢM ƠN ĐÓNG GÓP Ý KIẾN - UNICLUB</span>
            <h2 style="color: #0f172a; margin: 8px 0 4px 0; font-size: 1.4rem;">${eventTitle}</h2>
            <p style="color: #64748b; margin: 0; font-size: 0.95rem;">Đơn vị tổ chức: <strong>${clubName}</strong></p>
          </div>

          <div style="background: #fff7ed; padding: 16px 20px; border-radius: 12px; border-left: 4px solid #ea580c; margin: 20px 0;">
            <p style="margin: 0 0 8px 0; font-size: 0.95rem;">👤 <strong>Sinh viên:</strong> ${userName}</p>
            <p style="margin: 0 0 8px 0; font-size: 0.95rem;">⭐ <strong>Đánh giá:</strong> ${stars} (${rating}/5 sao)</p>
            <p style="margin: 0; font-size: 0.95rem;">💬 <strong>Ý kiến đóng góp:</strong> "${comment || 'Cảm ơn sự kiện tuyệt vời!'}"</p>
          </div>

          ${pointsAwarded ? `
          <div style="background: #f0fdf4; padding: 14px 20px; border-radius: 12px; border: 1px solid #bbf7d0; text-align: center; margin: 20px 0;">
            <p style="margin: 0; color: #166534; font-weight: 800; font-size: 1.05rem;">
              🏆 Bạn được thưởng ngay <span style="color: #22c55e; font-size: 1.2rem;">+${pointsAwarded} pts</span> Đánh giá Sự kiện!
            </p>
          </div>
          ` : ''}

          <div style="text-align: center; color: #64748b; font-size: 0.85rem; line-height: 1.5; margin-top: 20px; border-top: 1px solid #f1f5f9; padding-top: 16px;">
            <p style="margin: 0;">Ý kiến của bạn là động lực giúp Ban chủ nhiệm <strong>${clubName}</strong> nâng cao chất lượng các chương trình tiếp theo!</p>
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
    const subject = `[UniClub Leader] 🎁 Yêu cầu đổi quà mới từ ${userName}: "${rewardTitle}"`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 16px;">
        <div style="background: #ffffff; padding: 24px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0;">
          <h2 style="color: #ea580c; margin-top: 0;">🎁 Yêu Cầu Đổi Phần Thưởng Mới</h2>
          <p>Xin chào Ban Chủ Nhiệm / Leader <strong>${clubName}</strong>,</p>
          <p>Thành viên <strong>${userName}</strong> vừa gửi Yêu cầu đổi phần thưởng trên hệ thống UniClub:</p>
          <div style="background: #fff7ed; padding: 16px 20px; border-radius: 12px; border-left: 4px solid #ea580c; margin: 20px 0;">
            <p style="margin: 0 0 6px 0;"><strong>Tên quà tặng:</strong> ${rewardTitle}</p>
            <p style="margin: 0 0 6px 0;"><strong>Điểm quy đổi:</strong> <strong style="color: #ea580c;">${pointCost} pts</strong></p>
            <p style="margin: 0;"><strong>Thành viên yêu cầu:</strong> ${userName}</p>
          </div>
          <p>Vui lòng đăng nhập vào trang <strong>Rewards Management</strong> để duyệt (Approve) hoặc từ chối (Reject) yêu cầu này.</p>
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
    const subject = `[UniClub] 🎉 Chúc mừng! Yêu cầu đổi quà "${rewardTitle}" đã được PHÊ DUYỆT!`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 16px;">
        <div style="background: #ffffff; padding: 24px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0;">
          <h2 style="color: #2e7d32; margin-top: 0;">🎉 Chúc Mừng Bạn Đã Đổi Quà Thành Công!</h2>
          <p>Xin chào <strong>${userName}</strong>,</p>
          <p>Ban Chủ Nhiệm câu lạc bộ <strong>${clubName}</strong> đã <strong>PHÊ DUYỆT</strong> yêu cầu đổi phần thưởng của bạn:</p>
          <div style="background: #f0fdf4; padding: 16px 20px; border-radius: 12px; border-left: 4px solid #22c55e; margin: 20px 0;">
            <p style="margin: 0 0 6px 0;">🎁 <strong>Phần quà:</strong> ${rewardTitle}</p>
            <p style="margin: 0 0 6px 0;">💎 <strong>Điểm đã trừ:</strong> -${pointCost} pts</p>
            <p style="margin: 0;">🔑 <strong>Mã nhận quà:</strong> <strong style="color: #ea580c; font-size: 1.1rem;">${pickupCode}</strong></p>
          </div>
          <p style="color: #475569; font-size: 0.9rem;">📌 <em>Vui lòng truy cập mục <strong>Redemption History (Lịch sử đổi quà)</strong> trên web hoặc liên hệ Ban chủ nhiệm CLB để nhận quà trực tiếp!</em></p>
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
    const subject = `[UniClub] Thông báo kết quả yêu cầu đổi quà: "${rewardTitle}"`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 16px;">
        <div style="background: #ffffff; padding: 24px; border-radius: 16px; box-shadow: 0 10px 25px rgba(0,0,0,0.08); max-width: 550px; margin: 0 auto; border: 1px solid #e2e8f0;">
          <h2 style="color: #d32f2f; margin-top: 0;">Thông Báo Kết Quả Yêu Cầu Đổi Quà</h2>
          <p>Xin chào <strong>${userName}</strong>,</p>
          <p>Ban Chủ Nhiệm câu lạc bộ <strong>${clubName}</strong> đã xem xét yêu cầu đổi quà <strong>"${rewardTitle}"</strong> của bạn:</p>
          <div style="background: #fef2f2; padding: 16px 20px; border-radius: 12px; border-left: 4px solid #ef4444; margin: 20px 0;">
            <p style="margin: 0 0 6px 0;"><strong>Trạng thái:</strong> <strong style="color: #dc2626;">CHƯA ĐƯỢC PHÊ DUYỆT</strong></p>
            <p style="margin: 0;"><strong>Lý do từ Ban chủ nhiệm:</strong> "${rejectionReason || 'Hiện chưa đủ số lượng kho quà'}"</p>
          </div>
          <p style="color: #475569; font-size: 0.9rem;">💡 <em>Điểm thưởng tích lũy của bạn đã được hoàn lại đầy đủ vào ví điểm CLB.</em></p>
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

const sendFeeNotificationEmail = async ({ toEmail, userName, clubName, title, amount, period }) => {
  try {
    const mailer = getTransporter();
    const formattedAmount = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
    const subject = `[UniClub] 🧾 Thông báo đóng hội phí / tiền quỹ: ${title} - ${clubName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 24px; color: #1e293b; background-color: #f8fafc; border-radius: 16px;">
        <div style="background: #ffffff; padding: 24px; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
          <h2 style="color: #ea580c; margin-top: 0;">🧾 Thông Báo Đóng Hội Phí / Tiền Quỹ</h2>
          <p>Xin chào <strong>${userName}</strong>,</p>
          <p>Ban chủ nhiệm câu lạc bộ <strong>${clubName}</strong> vừa khởi tạo khoản thu hội phí / tiền quỹ mới trên hệ thống UniClub:</p>
          <div style="background: #fff7ed; padding: 16px; border-radius: 8px; border-left: 4px solid #ea580c; margin: 16px 0;">
            <p style="margin: 0 0 6px 0;"><strong>Nội dung khoản thu:</strong> ${title}</p>
            <p style="margin: 0 0 6px 0;"><strong>Số tiền cần nộp:</strong> <strong style="color: #ea580c; font-size: 1.15em;">${formattedAmount} (${Number(amount).toLocaleString("vi-VN")} VNĐ)</strong></p>
            <p style="margin: 0;"><strong>Kỳ hạn / Ghi chú:</strong> ${period}</p>
          </div>
          <p>Vui lòng đăng nhập vào hệ thống UniClub ➔ Truy cập mục <strong>Fees (Hội phí)</strong> để xem chi tiết và tiến hành quét mã QR thanh toán trực tuyến.</p>
          <br/>
          <p style="color: #64748b; font-size: 0.9em;">Trân trọng,<br/><strong>Ban Quản Lý Tài Chính - ${clubName}</strong></p>
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

const sendInvitationEmail = async ({ toEmail, userName, clubName, role, message }) => {
  try {
    const mailer = getTransporter();
    const subject = `[UniClub] 📩 Lời mời gia nhập CLB ${clubName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #2563eb;">📩 Chào ${userName}!</h2>
        <p>Ban Chủ Nhiệm Câu lạc bộ <strong>${clubName}</strong> trân trọng gửi lời mời bạn tham gia CLB với vai trò <strong>${role || "Thành viên"}</strong>!</p>
        ${message ? `<blockquote style="background: #f8fafc; padding: 12px; border-left: 4px solid #2563eb; margin: 15px 0;">"${message}"</blockquote>` : ""}
        <p>Hãy truy cập hệ thống <strong>UniClub</strong> ➔ Mục <strong>Lời mời (Invitations)</strong> để Đồng ý (Accept) hoặc Từ chối (Reject) lời mời này nhé.</p>
        <br/>
        <p>Trân trọng,</p>
        <p><strong>Ban chủ nhiệm ${clubName}</strong></p>
      </div>
    `;

    await mailer.sendMail({
      from: `"UniClub System" <${process.env.EMAIL_USER || "noreply@uniclub.edu.vn"}>`,
      to: toEmail,
      subject,
      html,
    });
    console.log(`📧 Invitation Email sent successfully to ${toEmail}`);
  } catch (error) {
    console.error("❌ Failed to send invitation email:", error.message);
  }
};

const STUDENT_AFFAIRS_EMAIL = "uniclub2402@gmail.com";

const sendNewClubCreationRequestEmailToSA = async ({ clubName, requesterName, requesterEmail, description, memberCount }) => {
  try {
    const mailer = getTransporter();
    const subject = `[UniClub] 📝 Yêu cầu thành lập CLB mới: ${clubName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #ea580c;">📝 Yêu cầu thành lập Câu lạc bộ mới</h2>
        <p>Sinh viên <strong>${requesterName}</strong> (${requesterEmail}) đã gửi yêu cầu thành lập câu lạc bộ mới trên hệ thống UniClub:</p>
        <div style="background: #fff7ed; padding: 15px; border-left: 4px solid #ea580c; margin: 15px 0; border-radius: 4px;">
          <p style="margin: 0 0 8px 0;"><strong>Tên CLB:</strong> ${clubName}</p>
          <p style="margin: 0 0 8px 0;"><strong>Mô tả / Lý do:</strong> ${description || "Không có"}</p>
          <p style="margin: 0;"><strong>Số lượng thành viên khởi tạo:</strong> ${memberCount || 0} sinh viên</p>
        </div>
        <p>Kính mời Phòng Công tác Sinh viên (Student Affairs) đăng nhập vào UniClub để xem chi tiết và phê duyệt.</p>
        <br/>
        <p>Trân trọng,</p>
        <p><strong>Hệ thống Quản lý CLB UniClub</strong></p>
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
    const subject = `[UniClub] 🎉 Đơn thành lập CLB ${clubName} đã được DUYỆT!`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #16a34a;">🎉 Chúc mừng ${requesterName}!</h2>
        <p>Đơn yêu cầu thành lập Câu lạc bộ <strong>${clubName}</strong> của bạn đã được <strong>Phòng Công tác Sinh viên (Student Affairs) PHÊ DUYỆT</strong>!</p>
        ${reviewNote ? `<blockquote style="background: #f0fdf4; padding: 12px; border-left: 4px solid #16a34a; margin: 15px 0;"><strong>Ghi chú từ BGH/Phòng CTSV:</strong> "${reviewNote}"</blockquote>` : ""}
        <p>Câu lạc bộ của bạn đã chính thức được kích hoạt trên hệ thống UniClub. Bạn có thể đăng nhập để truy cập trang quản lý CLB với vai trò Chủ tịch!</p>
        <br/>
        <p>Trân trọng,</p>
        <p><strong>Phòng Công tác Sinh viên & Ban Quản Trị UniClub</strong></p>
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
    const subject = `[UniClub] ❌ Thông báo kết quả Đơn thành lập CLB ${clubName}`;
    const html = `
      <div style="font-family: Arial, sans-serif; padding: 20px; color: #333; line-height: 1.6;">
        <h2 style="color: #dc2626;">❌ Chào ${requesterName},</h2>
        <p>Rất tiếc, Đơn yêu cầu thành lập Câu lạc bộ <strong>${clubName}</strong> của bạn đã bị <strong>TỪ CHỐI</strong> sau khi Phòng Công tác Sinh viên (Student Affairs) xem xét.</p>
        ${reviewNote ? `<blockquote style="background: #fef2f2; padding: 12px; border-left: 4px solid #dc2626; margin: 15px 0;"><strong>Lý do từ chối:</strong> "${reviewNote}"</blockquote>` : ""}
        <p>Bạn có thể chỉnh sửa lại hồ sơ thông tin và gửi lại đơn yêu cầu mới trên hệ thống UniClub.</p>
        <br/>
        <p>Trân trọng,</p>
        <p><strong>Phòng Công tác Sinh viên UniClub</strong></p>
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

module.exports = {
  sendApprovedEmail,
  sendRejectedEmail,
  sendPointsAwardedEmail,
  sendEventRequestSubmittedEmailToAdmin,
  sendEventRequestResultEmailToRequester,
  sendEventTicketEmail,
  sendEventFeedbackSubmittedEmail,
  sendRedemptionRequestEmailToLeader,
  sendRedemptionApprovedEmailToStudent,
  sendRedemptionRejectedEmailToStudent,
  sendFeeNotificationEmail,
  sendInvitationEmail,
  sendNewClubCreationRequestEmailToSA,
  sendClubCreationApprovedEmailToStudent,
  sendClubCreationRejectedEmailToStudent,
};
