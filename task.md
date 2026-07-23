# Task List: Achievement Points, Point Rule Management & QR Check-in

## Nhánh 1: `feature/be-point-rule-management_club-commite` (President Point Rules)
- [x] Khởi tạo các Model Database mới:
  - [x] `ActionType` (`action_type.model.js`)
  - [x] `PointRule` (`point_rule.model.js`)
  - [x] `ContributionLog` (`contribution_log.model.js`)
- [x] Cập nhật các Model Database hiện tại:
  - [x] Thêm `reward_point` vào `ClubMember` (`club_member.model.js`)
  - [x] Thêm `action_type_id` vào `EventTimeline` (`event_timeline.model.js`)
- [x] Seed dữ liệu mẫu cho `ActionTypes` (Ví dụ: "attendance", "feedback")
- [x] Phát triển API Quản lý quy tắc tính điểm cho President:
  - [x] Service layer (`pointRuleManagement.service.js`)
  - [x] Controller layer (`pointRuleManagement.controller.js`)
  - [x] Router (`pointRuleManagement.routes.js`)
  - [x] Khai báo router trong `app.js`

## Nhánh 2: `feature/be-achievement-points_club-member` (Member Leaderboards & Logs, Student Ticket)
- [x] Phát triển API cho Thành viên CLB xem điểm/quy tắc:
  - [x] Service layer (`achievementPoints.service.js`)
  - [x] Controller layer (`achievementPoints.controller.js`)
  - [x] Router (`achievementPoints.routes.js`)
  - [x] Khai báo router trong `app.js`
- [x] Cập nhật API Backend trả về `registrationId` trong Chi tiết sự kiện (`getEventDetail` ở `event.controller.js`)
- [x] Cập nhật giao diện Sinh viên hiển thị Vé chứa QR thật:
  - [x] Thay thế QR CSS mockup bằng QR thật qua QRServer API trong `EventDetailPage.jsx`
  - [x] Tích hợp cơ chế tự động thăm dò (polling) trạng thái vé check-in trong `EventDetailPage.jsx`

## Nhánh 3: `feature/be-event-attendance` (Real Attendance APIs & QR Scanner Camera)
- [x] Tích hợp Hook tự động cộng điểm thưởng trên Backend:
  - [x] Cộng điểm khi điểm danh sự kiện chuyển sang `"attended"` (`eventAttendance.service.js`)
  - [x] Cộng điểm khi sinh viên gửi feedback sự kiện thành công (`feedbackManagement.service.js`)
  - [x] Thiết lập logic kiểm tra giới hạn điểm thưởng (`limit_per_event`, `limit_per_day`)
- [x] Chuyển đổi Frontend quản lý điểm danh sang API thực tế:
  - [x] Định nghĩa các API điểm danh thực tế trong `event.api.js`
  - [x] Thay thế mock data bằng dữ liệu thực tế từ API trong `ClubAttendancePage.jsx`
- [x] Tích hợp camera quét mã QR trên Frontend:
  - [x] Cài đặt thư viện `html5-qrcode` trong `uniclub-frontend`
  - [x] Tạo Component `QrScannerModal.jsx` điều khiển camera
  - [x] Tích hợp nút quét QR và hộp thoại quét camera vào trang `ClubAttendancePage.jsx`
