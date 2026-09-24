KỊCH BẢN QUAY VIDEO DEMO HỆ THỐNG UNICLUB
UNICLUB SYSTEM DEMO VIDEO SCRIPT (BILINGUAL / SONG NGỮ)
Capstone Project – Hệ thống Quản trị & Hoạt động Câu lạc bộ Sinh viên ĐH FPT
📌 THÔNG TIN QUAN TRỌNG VỀ PHẠM VI DEMO / KEY DEMO INFORMATION:
• Câu lạc bộ áp dụng xuyên suốt / Single Demo Club: FPT Guitar Club (FGC) (Tất cả 5 luồng diễn ra tại 1 CLB duy nhất để đảm bảo tính liên kết dữ liệu / All 5 flows take place within 1 club for seamless data continuity).
• Cổng thanh toán trực tuyến VNPay Sandbox: Ngân hàng NCB | Số thẻ: 9704198526191432198 | Tên chủ thẻ: NGUYEN VAN A | Ngày phát hành: 07/15 | OTP: 123456
• Phương thức đăng nhập Google / Google OAuth Login: Sinh viên đăng nhập trực tiếp bằng Google với tài khoản tynce181041@fpt.edu.vn và Chủ nhiệm đăng nhập bằng bangdreamer01@gmail.com để nhận và kiểm tra email thực tế (vé QR, thông báo kết nạp). Đối với các vai trò ban chủ nhiệm khác (Event Manager, Secretary, Treasurer), có thể dùng Quick Mock Login để chuyển đổi nhanh vai trò / Sign in directly with Google using tynce181041@fpt.edu.vn (Student) and bangdreamer01@gmail.com (President) to receive real-time notification emails.
• Đăng nhập nhanh tiện lợi / Quick Dev Login: Tại trang /login, sử dụng tính năng [DEV ONLY] Quick Mock Login chọn tài khoản tương ứng để chuyển đổi vai trò ngay lập tức mà không cần gõ mật khẩu / Use Quick Mock Login on /login page to switch roles instantly without typing passwords.
1. BẢNG TÀI KHOẢN VÀ VAI TRÒ DEMO / DEMO ACCOUNTS & ROLES
Vai trò / Role	Email đăng nhập	Họ và Tên	Nhiệm vụ chính trong video demo / Key Demo Tasks
Student (Sinh viên)	tynce181041@fpt.edu.vn	Nguyen Thanh Ty	Nộp đơn gia nhập CLB, nhận email phê duyệt, đăng ký sự kiện, nhận email chứa vé QR Code, mở email show mã QR check-in, đánh giá sự kiện, đổi quà, thanh toán quỹ VNPay. (Applies to club, receives acceptance email, registers event, receives QR ticket email, presents email QR for check-in, submits feedback, redeems reward, pays semester fee).
President (Chủ nhiệm)	bangdreamer01@gmail.com	Nguyen Bang	Duyệt đơn gia nhập (hệ thống gửi email thông báo tới sinh viên), duyệt đổi quà, quản lý Point Rules, kho Rewards, quản lý Join Form tuyển thành viên. (Approves join requests triggering acceptance emails, approves reward redemptions, manages Point Rules, Rewards, Join Forms).
Event Manager (TB Sự kiện)	demo35@fpt.edu.vn	Nguyen Quoc Khanh	Tạo sự kiện, gắn minh chứng trường, hoàn tất Draft sang Complete, mở phiên điểm danh & quét mã QR. (Creates events, attaches school approval, sets draft to complete, manages attendance & scans QR).
Student Affairs (Phòng CTSV)	uniclub2402@gmail.com	Nguyen Van Admin	Phê duyệt đề xuất tổ chức sự kiện của CLB từ góc độ Nhà trường. (Reviews and approves club event creation requests on behalf of the university).
Secretary (Thư ký)	demo33@fpt.edu.vn	Do Thi Giang	Quản lý thời khóa biểu tuần (Schedule), gửi lời mời qua email (Invitations), tạo và đóng biểu quyết (Polls). (Manages weekly activity schedule, sends club invitations via email, creates & closes polls).
Treasurer (Thủ quỹ)	demo34@fpt.edu.vn	Ho Minh Hung	Tạo phiếu thu/chi tài chính, theo dõi thanh toán quỹ thành viên, xác nhận thu tiền mặt (Collect Cash). (Manages club finances, creates income/expense requests, tracks member fee dues & cash collection).
🎙️ LỜI MỞ ĐẦU & GIỚI THIỆU BẢN THÂN / OPENING INTRODUCTION
🇻🇳 Lời chào mở đầu Tiếng Việt (Khoảng 25-30 giây):
"Kính chào quý thầy cô trong Hội đồng và toàn thể các bạn! Em tên là Nguyễn Thành Tý, đại diện cho nhóm phát triển đồ án tốt nghiệp UniClub – Hệ thống Quản trị và Kết nối Câu lạc bộ Sinh viên Toàn diện. Trong buổi báo cáo hôm nay, em xin phép được demo trực tiếp các luồng nghiệp vụ cốt lõi của hệ thống từ góc độ sinh viên, ban chủ nhiệm các vai trò cho đến cấp trường trong khoảng 15 phút. Sau đây, em xin phép được bắt đầu với bước đầu tiên!"
🇬🇧 English Opening Script (~25-30 seconds):
"Hello professors! My name is Nguyen Ty, representing our capstone team for UniClub – a Club Management Platform. In this video, i will demonstrate the core end-to-end workflows of our system. Let us begin with the first step!"
2. LUỒNG 1: TRẢI NGHIỆM SINH VIÊN (STUDENT TRỞ THÀNH CLUB MEMBER) / FLOW 1: STUDENT BECOMING A CLUB MEMBER
Step 0: Sinh viên đăng nhập hệ thống UniClub bằng tài khoản Google trường FPT / Student Logs in to UniClub via Official FPT Google Account
Tài khoản / Account	Student: tynce181041@fpt.edu.vn (Nguyen Thanh Ty)
Mục đích / Objective	🇻🇳 Sinh viên truy cập trang đăng nhập UniClub, thực hiện xác thực an toàn một chạm qua Google OAuth bằng tài khoản trường FPT (tynce181041@fpt.edu.vn) và khám phá giao diện trang chủ sinh viên. 🇬🇧 Student accesses the UniClub login page, completes one-touch secure Google OAuth authentication using FPT email (tynce181041@fpt.edu.vn), and lands on the student dashboard.
Dữ liệu mẫu / Sample Data	Email đăng nhập: tynce181041@fpt.edu.vn | Phương thức: Google OAuth 2.0 Single Sign-On
▶ Thao tác chi tiết trên màn hình / On-Screen Actions:
●	🇻🇳 Truy cập vào trang đăng nhập hệ thống /login.
🇬🇧 Navigate to the UniClub login page at /login.
●	🇻🇳 Bấm vào nút 'Đăng nhập bằng Google' (Sign in with Google).
🇬🇧 Click the 'Sign in with Google' button.
●	🇻🇳 Chọn tài khoản Google sinh viên FPT cá nhân: 'tynce181041@fpt.edu.vn'.
🇬🇧 Select personal official FPT student Google account: 'tynce181041@fpt.edu.vn'.
●	🇻🇳 Hệ thống tự động xác thực danh tính qua Google OAuth và chuyển hướng thành công về trang chủ (Home / Dashboard).
🇬🇧 System verifies identity via Google OAuth and seamlessly redirects to the Home / Dashboard page.
●	🇻🇳 Quan sát giao diện trang chủ hiển thị thông tin cá nhân của sinh viên 'Nguyen Thanh Ty', cùng danh mục câu lạc bộ và các sự kiện nổi bật.
🇬🇧 Observe the student dashboard displaying profile 'Nguyen Thanh Ty', featured university events, and club directory.
🎙️ Lời thoại thuyết minh khi quay video / Spoken Scripts for Video Demo:
🇻🇳 Lời thoại Tiếng Việt (Vietnamese Narration):
"Tại trang đăng nhập, em bấm 'Đăng nhập bằng Google' và chọn tài khoản sinh viên FPT: tynce181041@fpt.edu.vn. Hệ thống xác thực một chạm tức thì và chuyển hướng vào trang chủ UniClub với đầy đủ thông tin cá nhân và danh mục CLB."
🇬🇧 English Spoken Script (Lời thoại Tiếng Anh):
"On the login page, I click 'Login with Google' and select my student account: tynce181041@fpt.edu.vn. The system authenticates and redirects to thehome page displaying list club and list public event."
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —
Step 1a: Sinh viên tìm kiếm CLB & Nộp đơn đăng ký gia nhập (Join Request) / Student Explores Club & Submits Join Application
Tài khoản / Account	Student: tynce181041@fpt.edu.vn (Nguyen Thanh Ty)
Mục đích / Objective	🇻🇳 Sinh viên tìm kiếm CLB FPT Guitar Club (FGC) trên hệ thống, xem thông tin giới thiệu và nộp đơn ứng tuyển gia nhập. 🇬🇧 Student searches for FPT Guitar Club (FGC), reviews club details, and submits membership application.
Dữ liệu mẫu / Sample Data	Question 1: Have you ever played guitar or any musical instrument? (Briefly describe your skill level) -> Answer: I have been playing acoustic guitar for 6 months and know basic chords. (Em đã tự học đệm hát guitar 6 tháng, biết các hợp âm cơ bản).  Question 2: Why do you want to join FPT Guitar Club, and what would you like to contribute? -> Answer: I want to connect with music lovers, improve my skills, and support event logistics. (Em muốn tìm môi trường giao lưu, nâng cao kỹ năng và hỗ trợ ban hậu cần các đêm nhạc).
▶ Thao tác chi tiết trên màn hình / On-Screen Actions:
●	🇻🇳 Tại thanh menu điều hướng bên trái, bấm chọn mục 'Clubs'.
🇬🇧 On the left navigation menu, click 'Clubs'.
●	🇻🇳 Tìm kiếm và nhấp chọn câu lạc bộ 'FPT Guitar Club (FGC)'.
🇬🇧 Search for and select 'FPT Guitar Club (FGC)'.
●	🇻🇳 Tại trang chi tiết CLB, xem thông tin giới thiệu, cơ cấu ban chủ nhiệm và bấm nút 'Join Club'.
🇬🇧 On the club detail page, inspect club information, management board, and click 'Join Club'.
●	🇻🇳 Hệ thống hiển thị popup Biểu mẫu tuyển thành viên kỳ Fall 2026 với 2 câu hỏi do CLB ban hành.
🇬🇧 The system displays the Fall 2026 recruitment form modal containing 2 club questions.
●	🇻🇳 Điền câu trả lời cho 2 câu hỏi ứng tuyển và bấm nút 'Submit Request'.
🇬🇧 Enter responses for the 2 questions and click 'Submit Request'.
●	🇻🇳 Quan sát thông báo gửi đơn thành công và trạng thái nút chuyển sang 'Pending' (Đang chờ duyệt).
🇬🇧 Observe the success notification and the button state transitioning to 'Pending'.
🎙️ Lời thoại thuyết minh khi quay video / Spoken Scripts for Video Demo:
🇻🇳 Lời thoại Tiếng Việt (Vietnamese Narration):
"Em vào mục 'Clubs', chọn 'FPT Guitar Club' và bấm 'Join Club'. Biểu mẫu ứng tuyển kỳ Fall 2026 xuất hiện, em điền câu trả lời bằng tiếng Anh rồi bấm 'Submit Request'. Đơn ứng tuyển chuyển sang trạng thái chờ xét duyệt."
🇬🇧 English Spoken Script (Lời thoại Tiếng Anh):
"I navigate to 'Clubs', select 'FPT Guitar Club', and click 'Join Club'. In the Fall 2026 application modal, I fill in the answers in English and click 'Submit'. The application is now submitted and pending review."
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —
Step 1b: Chủ nhiệm duyệt đơn & Hệ thống tự động gửi email chúc mừng + gắn phí thành viên / President Approves Application & System Auto-Sends Welcome Email + Assigns Semester Fee
Tài khoản / Account	President: bangdreamer01@gmail.com (Nguyen Bang)
Mục đích / Objective	🇻🇳 Chủ nhiệm phê duyệt đơn. Hệ thống tự động kết nạp thành viên, gán khoản thu quỹ kỳ hiện tại và gửi email thông báo kết nạp tới sinh viên. 🇬🇧 President reviews and approves. System activates membership, auto-assigns current term fee, and dispatches acceptance email to student.
Dữ liệu mẫu / Sample Data	Review Note: Chào mừng em đến với đại gia đình FGC! Hãy cùng cháy hết mình nhé.
▶ Thao tác chi tiết trên màn hình / On-Screen Actions:
●	🇻🇳 Đăng xuất khỏi tài khoản sinh viên, tại trang /login đăng nhập tài khoản President 'bangdreamer01@gmail.com' (bấm 'Đăng nhập bằng Google' hoặc sử dụng Quick Login).
🇬🇧 Log out of the student account, on /login sign in as President 'bangdreamer01@gmail.com' (click 'Sign in with Google' or use Quick Login).
●	🇻🇳 Truy cập vào CLB FPT Guitar Club, tại thanh điều hướng dưới (dock) chọn tab 'Member Approval'.
🇬🇧 Navigate to FPT Guitar Club, and on the bottom dock select the 'Member Approval' tab.
●	🇻🇳 Tìm hồ sơ của sinh viên 'Nguyen Thanh Ty' (tynce181041@fpt.edu.vn), bấm xem chi tiết câu trả lời ứng tuyển.
🇬🇧 Locate the application from 'Nguyen Thanh Ty' (tynce181041@fpt.edu.vn) and click to inspect his answers.
●	🇻🇳 Nhập lời nhắn phê duyệt: 'Chào mừng em đến với đại gia đình FGC!' và bấm nút 'Approve'.
🇬🇧 Enter a review note: 'Welcome to the FGC family!' and click 'Approve'.
●	🇻🇳 Hệ thống tạo bản ghi thành viên chính thức, tự động rà soát khoản thu quỹ kỳ FA26 để sinh phiếu thu pending, và tự động gửi email thông báo chúc mừng kết nạp.
🇬🇧 The system activates official membership, auto-scans FA26 fee transaction to generate a pending payment, and automatically dispatches an acceptance email.
●	🇻🇳 📧 Mở tab trình duyệt hộp thư đến (inbox) của 'tynce181041@fpt.edu.vn' để kiểm tra và show email thông báo kết nạp thành viên chính thức vừa nhận được từ hệ thống UniClub.
🇬🇧 📧 Open the email inbox tab for 'tynce181041@fpt.edu.vn' to inspect and showcase the official club admission email received from UniClub.
🎙️ Lời thoại thuyết minh khi quay video / Spoken Scripts for Video Demo:
🇻🇳 Lời thoại Tiếng Việt (Vietnamese Narration):
"Em chuyển sang tài khoản Chủ nhiệm bangdreamer01@gmail.com, vào tab 'Member Approval' và bấm 'Approve' duyệt đơn cho bạn Nguyen Thanh Ty. Hệ thống tự động kết nạp và gửi email chúc mừng. Mở hòm thư tynce181041@fpt.edu.vn, em thấy email chúc mừng kết nạp đã nhận được theo thời gian thực."
🇬🇧 English Spoken Script (Lời thoại Tiếng Anh):
"I switch to President account bangdreamer01@gmail.com, open 'Member Approval', and click 'Approve' for Nguyen Ty. The system activates membership and sends a welcome email. The acceptance email has arrived."
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —
Step 2a: Thành viên đăng ký sự kiện & Nhận vé mã QR qua Email / Member Registers for Event & Receives QR Ticket via Email
Tài khoản / Account	Student: tynce181041@fpt.edu.vn (Nguyen Thanh Ty)
Mục đích / Objective	🇻🇳 Thành viên đăng ký sự kiện Coming Soon và mở hộp thư email để show vé điện tử chứa mã QR Code check-in. 🇬🇧 Member registers for an upcoming event and opens email inbox to display the digital QR ticket.
Dữ liệu mẫu / Sample Data	Sự kiện: Acoustic Night: Giai Điệu Mùa Thu | Sức chứa: 100 slots | Email nhận vé: tynce181041@fpt.edu.vn
▶ Thao tác chi tiết trên màn hình / On-Screen Actions:
●	🇻🇳 Đăng nhập lại tài khoản Student 'tynce181041@fpt.edu.vn' bằng Google Login.
🇬🇧 Log back into student account 'tynce181041@fpt.edu.vn' via Sign in with Google.
●	🇻🇳 Vào menu 'Events' trên thanh điều hướng bên trái.
🇬🇧 Navigate to the 'Events' section on the left sidebar.
●	🇻🇳 Chọn sự kiện 'Acoustic Night: Giai Điệu Mùa Thu' (đang ở trạng thái Coming Soon và Progress Completed).
🇬🇧 Select 'Acoustic Night: Giai Điệu Mùa Thu' (currently in Coming Soon and Progress Completed status).
●	🇻🇳 Bấm nút 'Register Now' để đăng ký tham gia sự kiện.
🇬🇧 Click 'Register Now' to reserve a ticket.
●	🇻🇳 Hệ thống thông báo đăng ký thành công, trừ 1 slot sức chứa và gửi vé điện tử có mã QR về email 'tynce181041@fpt.edu.vn'.
🇬🇧 The system confirms registration, decrements 1 slot from capacity, and dispatches a QR e-ticket to 'tynce181041@fpt.edu.vn'.
●	🇻🇳 📧 Chuyển sang tab hòm thư 'tynce181041@fpt.edu.vn', mở email vé sự kiện (E-Ticket) có chứa mã QR Code độc nhất và mã vé cá nhân để chuẩn bị check-in.
🇬🇧 📧 Switch to the 'tynce181041@fpt.edu.vn' inbox tab, open the event E-Ticket email containing the personalized QR Code and ticket ID ready for check-in.
🎙️ Lời thoại thuyết minh khi quay video / Spoken Scripts for Video Demo:
🇻🇳 Lời thoại Tiếng Việt (Vietnamese Narration):
"Đăng nhập lại tài khoản sinh viên, em vào mục 'Events', chọn sự kiện 'Acoustic Night' và bấm 'Register Now'. Đăng ký thành công, hệ thống gửi vé điện tử kèm mã QR về email. Em mở hòm thư tynce181041@fpt.edu.vn để show chiếc vé E-Ticket có mã QR sẵn sàng check-in."
🇬🇧 English Spoken Script (Lời thoại Tiếng Anh):
"Back on the student account, I visit 'Events', select 'Acoustic Night', and click 'Register Now'. Registration succeeds, and the system emails an e-ticket with a QR code. I open tynce181041@fpt.edu.vn to showcase the QR ticket ready for check-in with event manager of the club."
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —
Step 2b: Trưởng ban sự kiện quét mã QR điểm danh từ Email & Nhận điểm thưởng / Event Manager Scans QR Code from Email & Member Earns Points via Point Rule
Tài khoản / Account	Event Manager: demo35@fpt.edu.vn (Nguyen Quoc Khanh)
Mục đích / Objective	🇻🇳 Trưởng ban sự kiện mở phiên điểm danh, quét mã QR trực tiếp từ email của sinh viên và hệ thống tự động cộng điểm thưởng. 🇬🇧 Event Manager opens check-in session, scans QR code directly from student's email, and system auto-awards points via Point Rule.
Dữ liệu mẫu / Sample Data	Quy tắc cộng điểm: Rule 'checkin' -> +50 Reward Points, +50 Ranking Points cho Nguyen Thanh Ty.
▶ Thao tác chi tiết trên màn hình / On-Screen Actions:
●	🇻🇳 Đăng nhập tài khoản Event Manager 'demo35@fpt.edu.vn'.
🇬🇧 Log in as Event Manager 'demo35@fpt.edu.vn'.
●	🇻🇳 Truy cập vào CLB FGC, chọn tab 'Attendance'.
🇬🇧 Open FPT Guitar Club and navigate to the 'Attendance' tab.
●	🇻🇳 Chọn sự kiện đang diễn ra và mở phiên điểm danh.
🇬🇧 Select the ongoing event and open the check-in session.
●	🇻🇳 Thực hiện quét mã QR hiển thị trên màn hình email của 'tynce181041@fpt.edu.vn' (hoặc bấm nút Check-in trực tiếp trên danh sách sinh viên).
🇬🇧 Scan the QR code displayed directly from 'tynce181041@fpt.edu.vn' email (or click Check-in directly on the attendee list).
●	🇻🇳 Hệ thống cập nhật trạng thái 'Attended' cho sinh viên Nguyen Thanh Ty và tự động kích hoạt Point Rule 'Check-in Sự kiện' cộng +50 điểm.
🇬🇧 The system marks student Nguyen Thanh Ty as 'Attended' and automatically triggers the 'Check-in' Point Rule awarding +50 points.
🎙️ Lời thoại thuyết minh khi quay video / Spoken Scripts for Video Demo:
🇻🇳 Lời thoại Tiếng Việt (Vietnamese Narration):
"Em chuyển sang tài khoản Event Manager demo35@fpt.edu.vn, vào tab 'Attendance' và mở phiên điểm danh. Em quét mã QR trực tiếp từ màn hình email của sinh viên (hoặc bấm check-in trên danh sách). Hệ thống lập tức xác nhận 'Attended' và tự động cộng ngay 50 điểm thưởng."
🇬🇧 English Spoken Script (Lời thoại Tiếng Anh):
"Switching to Event Manager account demo35@fpt.edu.vn, I open the 'Attendance' tab and start check-in. I scan the QR code directly from the student's email. The system marks 'Attended' and automatically awards +50 reward points."
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —
Step 3: Kết thúc sự kiện & Gửi đánh giá (Feedback) nhận thêm điểm / Event Ends & Member Submits Feedback for Bonus Points
Tài khoản / Account	Student: tynce181041@fpt.edu.vn (Nguyen Thanh Ty)
Mục đích / Objective	🇻🇳 Sự kiện kết thúc, thành viên gửi biểu mẫu feedback đánh giá chất lượng và được cộng thêm điểm thưởng. 🇬🇧 Event completes, member submits feedback evaluation, and system awards feedback bonus points.
Dữ liệu mẫu / Sample Data	Rating: 5 Stars | Comment: Đêm nhạc acoustic rất tuyệt vời và chỉn chu, ban nhạc chơi rất hay!
▶ Thao tác chi tiết trên màn hình / On-Screen Actions:
●	🇻🇳 Mở MongoDB (Compass / Shell), cập nhật sự kiện: status = 'closed', progress_status = 'completed'.
🇬🇧 In MongoDB (Compass / Shell), update the event: status = 'closed', progress_status = 'completed'.
●	🇻🇳 Sinh viên Nguyen Thanh Ty (tynce181041@fpt.edu.vn) vào lại trang chi tiết sự kiện 'Acoustic Night'.
🇬🇧 Student Nguyen Thanh Ty (tynce181041@fpt.edu.vn) revisits the 'Acoustic Night' event detail page.
●	🇻🇳 Quan sát thấy sự kiện đã kết thúc và xuất hiện nút 'Leave Feedback'.
🇬🇧 Notice the event is closed and the 'Leave Feedback' button is now visible.
●	🇻🇳 Bấm nút, chấm 5 sao kèm nhận xét chi tiết và bấm 'Submit Feedback'.
🇬🇧 Click the button, select 5 stars with a review, and click 'Submit Feedback'.
●	🇻🇳 Hệ thống tính lại điểm trung bình của sự kiện và kích hoạt Point Rule 'Đánh giá Sự kiện' cộng +20 điểm.
🇬🇧 The system recalculates the event average rating and triggers the 'Feedback' Point Rule to award +20 points.
●	🇻🇳 📧 Mở hòm thư email 'tynce181041@fpt.edu.vn' để kiểm tra và show email cảm ơn đánh giá sự kiện kèm xác nhận cộng điểm thưởng từ hệ thống.
🇬🇧 📧 Open the 'tynce181041@fpt.edu.vn' email inbox tab to inspect and display the thank-you feedback email confirming bonus points awarded.
🎙️ Lời thoại thuyết minh khi quay video / Spoken Scripts for Video Demo:
🇻🇳 Lời thoại Tiếng Việt (Vietnamese Narration):
"Sau khi sự kiện kết thúc, sinh viên quay lại trang sự kiện và bấm 'Leave Feedback'. Em chấm 5 sao, gửi nhận xét và hệ thống tự động cộng thêm 20 điểm. Mở email tynce181041@fpt.edu.vn, em thấy ngay email cảm ơn kèm xác nhận cộng điểm thưởng."
🇬🇧 English Spoken Script (Lời thoại Tiếng Anh):
"After the event concludes, the student returns to the event page and clicks 'Leave Feedback'. I rate 5 stars, submit comments, and the system awards +20 points. Checking tynce181041@fpt.edu.vn, a thank-you email confirming the bonus points is received."
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —
Step 4: Xem Bảng xếp hạng (Ranking) và Lịch sử cộng điểm / View Leaderboard (Ranking) & Point History
Tài khoản / Account	Student: tynce181041@fpt.edu.vn (Nguyen Thanh Ty)
Mục đích / Objective	🇻🇳 Khám phá bảng xếp hạng nội bộ CLB và theo dõi minh bạch lịch sử nhận điểm đóng góp. 🇬🇧 Explore the club leaderboard and transparently review personal point contribution history.
Dữ liệu mẫu / Sample Data	Điểm tích lũy cá nhân: 70 điểm | Lịch sử: 1 dòng Check-in (+50 pts), 1 dòng Feedback (+20 pts).
▶ Thao tác chi tiết trên màn hình / On-Screen Actions:
●	🇻🇳 Tại trang CLB FGC, chọn tab 'Ranking' trên thanh điều hướng dưới.
🇬🇧 On the FGC club page, click the 'Ranking' tab on the bottom dock.
●	🇻🇳 Xem vị trí của mình trên bảng xếp hạng (Leaderboard) theo Ranking Points.
🇬🇧 View personal rank on the Leaderboard based on Ranking Points.
●	🇻🇳 Xem tổng số điểm thưởng hiện có (Reward Points) sẵn sàng để đổi quà.
🇬🇧 Check the current balance of Reward Points available for redemption.
●	🇻🇳 Mở mục 'Point History' để xem chi tiết các dòng cộng điểm: +50 điểm (Check-in) và +20 điểm (Feedback).
🇬🇧 Open 'Point History' to inspect transaction entries: +50 points (Check-in) and +20 points (Feedback).
🎙️ Lời thoại thuyết minh khi quay video / Spoken Scripts for Video Demo:
🇻🇳 Lời thoại Tiếng Việt (Vietnamese Narration):
"Tại tab 'Ranking', em theo dõi vị trí của mình trên Leaderboard theo điểm xếp hạng, xem 70 điểm thưởng tích lũy và mở 'Point History' để kiểm tra 2 dòng cộng điểm minh bạch: 50 điểm check-in và 20 điểm feedback."
🇬🇧 English Spoken Script (Lời thoại Tiếng Anh):
"In the 'Ranking' tab, I check my leaderboard standing, view my 70 accumulated reward points, and inspect 'Point History' showing records: +50 from check-in"
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —
Step 5: Xem tab Point Rules để nắm rõ các hoạt động kiếm điểm / Explore Point Rules Tab for Earning Opportunities
Tài khoản / Account	Student: tynce181041@fpt.edu.vn (Nguyen Thanh Ty)
Mục đích / Objective	🇻🇳 Tìm hiểu quy chế thưởng điểm công khai của CLB để chủ động tham gia hoạt động. 🇬🇧 Review public club point rules to plan active participation and point accumulation.
Dữ liệu mẫu / Sample Data	Danh sách Rule: Check-in (+50 pts/lần), Attendance (+50 pts/lần), Feedback (+20 pts/lần).
▶ Thao tác chi tiết trên màn hình / On-Screen Actions:
●	🇻🇳 Tại trang CLB FGC, chọn tab 'Point Rules'.
🇬🇧 On the FGC club page, navigate to the 'Point Rules' tab.
●	🇻🇳 Quan sát danh sách các quy định cộng điểm: Check-in (+50 pts), Tham gia (+50 pts), Feedback (+20 pts).
🇬🇧 Review the active point rules: Check-in (+50 pts), Attendance (+50 pts), Feedback (+20 pts).
●	🇻🇳 Quan sát các thông số giới hạn: Giới hạn số lần nhận trong sự kiện và giới hạn trong ngày.
🇬🇧 Examine the rule limits: Max occurrences per event and max occurrences per day.
🎙️ Lời thoại thuyết minh khi quay video / Spoken Scripts for Video Demo:
🇻🇳 Lời thoại Tiếng Việt (Vietnamese Narration):
"Em vào tab 'Point Rules' để xem các quy chế thưởng điểm công khai của CLB. Mỗi quy định đều nêu rõ số điểm và giới hạn số lần nhận trong ngày để đảm bảo tính công bằng và chống gian lận."
🇬🇧 English Spoken Script (Lời thoại Tiếng Anh):
"I open the 'Point Rules' tab to review transparent club earning policies. Each rule clearly defines points and daily limits to guarantee fairness and prevent abuse."
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —
Step 6: Đổi quà (Rewards Store) & Chủ nhiệm duyệt yêu cầu đổi thưởng / Redeem Rewards & President Approves Redemption Request
Tài khoản / Account	Student: tynce181041 & President: bangdreamer01
Mục đích / Objective	🇻🇳 Thành viên dùng điểm đổi quà; Chủ nhiệm kiểm tra và phê duyệt trao quà. 🇬🇧 Member redeems item using points; President reviews and approves the redemption request.
Dữ liệu mẫu / Sample Data	Vật phẩm: Bộ Capo & Pick Gảy Alice | Điểm tiêu tốn: 50 pts | Tồn kho giảm từ 30 xuống 29.
▶ Thao tác chi tiết trên màn hình / On-Screen Actions:
●	🇻🇳 Sinh viên tynce181041 vào tab 'Rewards' -> Xem các phần quà trong 'Reward Store'.
🇬🇧 Student tynce181041 goes to 'Rewards' tab -> Browse catalog in 'Reward Store'.
●	🇻🇳 Chọn món quà 'Bộ Capo & Pick Gảy Alice' (50 điểm) -> Xem chi tiết -> Bấm 'Redeem Reward'.
🇬🇧 Select 'Bộ Capo & Pick Gảy Alice' (50 points) -> View details -> Click 'Redeem Reward'.
●	🇻🇳 Điểm của thành viên bị trừ và yêu cầu chuyển sang tab 'Redemption Requests' ở trạng thái Pending.
🇬🇧 Points are deducted and the request is placed in 'Redemption Requests' as Pending.
●	🇻🇳 Đăng nhập tài khoản President 'bangdreamer01@gmail.com' -> Vào tab Rewards -> Tab Redemption Requests.
🇬🇧 Sign in as President 'bangdreamer01@gmail.com' -> Go to Rewards -> Redemption Requests tab.
●	🇻🇳 Bấm nút 'Approve' để phê duyệt yêu cầu đổi quà của thành viên.
🇬🇧 Click 'Approve' to authorize the member's redemption request.
●	🇻🇳 📧 Mở tab hòm thư email 'tynce181041@fpt.edu.vn' để kiểm tra và show email thông báo duyệt đổi quà kèm mã nhận quà (Pickup Code) từ hệ thống.
🇬🇧 📧 Open 'tynce181041@fpt.edu.vn' email inbox tab to inspect and display the redemption approval email containing the Pickup Code.
🎙️ Lời thoại thuyết minh khi quay video / Spoken Scripts for Video Demo:
🇻🇳 Lời thoại Tiếng Việt (Vietnamese Narration):
"Tại tab 'Rewards', em dùng 50 điểm đổi 'Bộ Capo & Pick Gảy Alice'. Chuyển sang tài khoản Chủ nhiệm, Chủ nhiệm vào 'Redemption Requests' bấm 'Approve'. Mở mail tynce181041@fpt.edu.vn, em thấy email duyệt đổi quà kèm mã nhận quà đã được gửi đến tức thì."
🇬🇧 English Spoken Script (Lời thoại Tiếng Anh):
"In the 'Rewards' tab, I redeem any reward. Switching to the President account, the President clicks 'Approve' under 'Redemption Requests'. In the club member  tynce181041@fpt.edu.vn inbox, the approval email with pickup code is received instantly."
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —
Step 7: Xem Lịch sinh hoạt tuần (Schedule) & Trạng thái Đã tham gia (✓ Attended) / Weekly Schedule & Attended Status (✓ Attended)
Tài khoản / Account	Student: tynce181041@fpt.edu.vn (Nguyen Thanh Ty)
Mục đích / Objective	🇻🇳 Xem thời khóa biểu 3 buổi/tuần và quan sát nhãn xác nhận chuyên cần '✓ Attended'. 🇬🇧 Review the 3-session/week routine and observe the '✓ Attended' attendance confirmation badge.
Dữ liệu mẫu / Sample Data	Lịch tuần mẫu: Thứ Hai 17h-19h (Closed, ✓ Attended) | Thứ Tư 18h-20h (Opening) | Thứ Sáu 18h-21h (Coming soon).
▶ Thao tác chi tiết trên màn hình / On-Screen Actions:
●	🇻🇳 Đăng nhập lại tài khoản Student 'tynce181041@fpt.edu.vn' -> Vào CLB FGC -> Tab 'Activity Schedule'.
🇬🇧 Sign back into student account 'tynce181041@fpt.edu.vn' -> Open FGC -> 'Activity Schedule' tab.
●	🇻🇳 Xem lịch tuần: Mỗi tuần có 3 buổi sinh hoạt cố định (Luyện đệm hát cơ bản, Workshop solo, Giao lưu).
🇬🇧 Review the weekly calendar: 3 weekly sessions (Accompaniment, Solo Workshop, Open Jam).
●	🇻🇳 Tại buổi sinh hoạt đã kết thúc (Closed), quan sát thấy nhãn màu xanh '✓ Attended' hiển thị ngay dưới chữ Closed.
🇬🇧 On the concluded activity (Closed), observe the green '✓ Attended' badge directly under 'Closed'.
●	🇻🇳 Bấm vào xem popup chi tiết hoạt động: Quan sát thấy nhãn '✓ Attended' hiển thị trang trọng bên phải tiêu đề.
🇬🇧 Click to view activity details: Observe the '✓ Attended' badge clearly placed to the right of the title.
🎙️ Lời thoại thuyết minh khi quay video / Spoken Scripts for Video Demo:
🇻🇳 Lời thoại Tiếng Việt (Vietnamese Narration):
"Tại tab 'Activity Schedule', em xem thời khóa biểu 3 buổi sinh hoạt định kỳ trong tuần của CLB. Ở các buổi đã kết thúc, hệ thống hiển thị nhãn màu xanh '✓ Attended' giúp sinh viên dễ dàng theo dõi mức độ chuyên cần của mình."
🇬🇧 English Spoken Script (Lời thoại Tiếng Anh):
"In the 'Activity Schedule' tab, I view the activities of the club. Concluded sessions display a green '✓ Attended' badge, allowing members to effortlessly track their attendance."
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —
Step 8: Tham gia Biểu quyết & Khảo sát ý kiến (Polls) / Participate in Club Polls & Democratic Voting
Tài khoản / Account	Student: tynce181041@fpt.edu.vn (Nguyen Thanh Ty)
Mục đích / Objective	🇻🇳 Thành viên thực hiện quyền dân chủ, xem các khảo sát cũ và tham gia biểu quyết cuộc bình chọn đang mở. 🇬🇧 Member exercises democratic rights, reviews past survey results, and casts a vote in an open poll.
Dữ liệu mẫu / Sample Data	Poll mở: Bình chọn bài hát mở màn cho Acoustic Night | Lựa chọn: 3. Nàng Thơ (Hoàng Dũng).
▶ Thao tác chi tiết trên màn hình / On-Screen Actions:
●	🇻🇳 Tại trang CLB FGC, chọn tab 'Polls' trên thanh điều hướng dưới.
🇬🇧 On the FGC club page, select the 'Polls' tab from the bottom dock.
●	🇻🇳 Xem 2 cuộc khảo sát cũ đã đóng (Dã ngoại hè, Áo đồng phục) hiển thị kết quả trực quan.
🇬🇧 Review 2 closed polls (Summer Outing, Club Uniform) displaying percentage distribution.
●	🇻🇳 Tại cuộc bình chọn đang mở: 'Bình chọn bài hát mở màn cho Acoustic Night', chọn phương án 'Nàng Thơ'.
🇬🇧 On the active poll 'Vote for Opening Song at Acoustic Night', select 'Nàng Thơ'.
●	🇻🇳 Bấm nút 'Vote' và quan sát tỷ lệ bình chọn được cập nhật tức thì.
🇬🇧 Click 'Vote' and observe the real-time vote percentage update.
🎙️ Lời thoại thuyết minh khi quay video / Spoken Scripts for Video Demo:
🇻🇳 Lời thoại Tiếng Việt (Vietnamese Narration):
"Tại tab 'Polls', em xem kết quả các khảo sát cũ và tham gia cuộc bình chọn đang mở: 'Bình chọn bài hát mở màn cho Acoustic Night'. Em chọn bài 'Nàng Thơ' và bấm 'Vote', lá phiếu được cập nhật ngay lập tức vào biểu đồ kết quả."
🇬🇧 English Spoken Script (Lời thoại Tiếng Anh):
"In the 'Polls' tab, I review closed surveys and participate in the active poll: 'Vote for Opening Song at Acoustic Night'. I select 'Nàng Thơ' and click 'Vote', updating the live tally instantly."
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —
Step 9: Đóng phí thành viên (Fees), Thanh toán VNPay Sandbox & Xem biên lai / Pay Membership Fees via VNPay & View Digital Receipt
Tài khoản / Account	Student: tynce181041@fpt.edu.vn (Nguyen Thanh Ty)
Mục đích / Objective	🇻🇳 Theo dõi nghĩa vụ tài chính theo từng học kỳ, thanh toán trực tuyến qua VNPay và nhận biên lai điện tử. 🇬🇧 Track semester fee obligations, pay online via VNPay Sandbox, and receive an e-receipt.
Dữ liệu mẫu / Sample Data	Khoản thu kỳ FA26 (50.000 đ) | VNPay Sandbox (Ngân hàng NCB) | Mã giao dịch điện tử đầy đủ.
▶ Thao tác chi tiết trên màn hình / On-Screen Actions:
●	🇻🇳 Tại trang CLB FGC, chọn tab 'Fees' trên thanh điều hướng dưới.
🇬🇧 On the FGC club page, select the 'Fees' tab from the bottom dock.
●	🇻🇳 Quan sát 3 khoản phí: Kỳ SP26 và SU26 hiển thị nhãn '⚠️ Quá hạn'; Kỳ FA26 hiển thị nhãn '⏱️ Chưa đóng'.
🇬🇧 Observe 3 fee items: SP26 and SU26 show '⚠️ Overdue'; FA26 shows '⏱️ Unpaid'.
●	🇻🇳 Bấm 'Pay Now' tại khoản thu kỳ FA26 -> Chọn phương thức 'VNPay' -> Bấm xác nhận thanh toán.
🇬🇧 Click 'Pay Now' on the FA26 fee -> Select 'VNPay' -> Confirm payment.
●	🇻🇳 Hệ thống chuyển sang cổng VNPay Sandbox: Nhập thông tin thẻ NCB, tên NGUYEN VAN A, OTP 123456.
🇬🇧 System redirects to VNPay Sandbox: Input NCB card info, NGUYEN VAN A, OTP 123456.
●	🇻🇳 Thanh toán thành công -> Chuyển về màn hình xác nhận -> Bấm 'View Receipt' xem biên lai chi tiết.
🇬🇧 Payment succeeds -> Return to confirmation screen -> Click 'View Receipt' for full transaction details.
Thanh toán khoản vay 
Ngân hàng	NCB
Số thẻ	9704198526191432198
Tên chủ thẻ	NGUYEN VAN A
Ngày phát hành	07/15
Mật khẩu OTP	123456
🎙️ Lời thoại thuyết minh khi quay video / Spoken Scripts for Video Demo:
🇻🇳 Lời thoại Tiếng Việt (Vietnamese Narration):
"Tại tab 'Fees', em thấy khoản thu quỹ kỳ Fall 2026 được tự động gắn từ Bước 1b. Em bấm 'Pay Now', chọn thanh toán qua VNPay Sandbox với thẻ NCB. Thanh toán thành công, em bấm 'View Receipt' để xem biên lai điện tử chi tiết, hoàn thành trọn vẹn luồng sinh viên."
🇬🇧 English Spoken Script (Lời thoại Tiếng Anh):
"In the 'Fees' tab, I locate the Fall 2026 semester fee auto-assigned from Step 1b. I click 'Pay Now' and complete VNPay Sandbox payment with test NCB card. Once paid, I click 'View Receipt' to inspect the digital receipt, completing the student flow."
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —
3. LUỒNG 2: VAI TRÒ CHỦ NHIỆM CLB (PRESIDENT) / FLOW 2: CLUB PRESIDENT ROLE
Step 1 (President): Quản trị Quy chế tính điểm (Point Rules) & Thưởng điểm thủ công / Point Rules Management & Manual Points Award
Tài khoản / Account	President: bangdreamer01@gmail.com (Nguyen Bang)
Mục đích / Objective	🇻🇳 Chủ nhiệm tạo mới, chỉnh sửa, bật/tắt các quy tắc thưởng điểm và ghi nhận điểm thủ công. 🇬🇧 President creates, edits, toggles point rules, and awards manual recognition points.
Dữ liệu mẫu / Sample Data	Rule mới: Thưởng tham gia Workshop | Điểm: 30 pts | Giới hạn: 1 lần/ngày | Thưởng thủ công: +20 pts.
▶ Thao tác chi tiết trên màn hình / On-Screen Actions:
●	🇻🇳 Đăng nhập tài khoản President 'bangdreamer01@gmail.com' -> Vào CLB FGC -> Tab 'Point Rules'.
🇬🇧 Sign in as President 'bangdreamer01@gmail.com' -> Open FGC -> 'Point Rules' tab.
●	🇻🇳 Bấm 'Create Point Rule' -> Nhập: Thưởng tham gia Workshop, 30 điểm, giới hạn 1 lần/ngày -> Bấm Lưu.
🇬🇧 Click 'Create Point Rule' -> Input: Workshop Attendance, 30 points, limit 1/day -> Click Save.
●	🇻🇳 Bấm 'Edit' một quy tắc có sẵn để điều chỉnh số điểm thưởng.
🇬🇧 Click 'Edit' on an existing rule to adjust points.
●	🇻🇳 Bấm công tắc gạt 'Active / Deactive' để kích hoạt hoặc tạm dừng một quy tắc.
🇬🇧 Toggle the 'Active / Deactive' switch to activate or pause a rule.
●	🇻🇳 Mở danh sách thành viên, bấm nút 'Add Points' thủ công để cộng 20 điểm khen thưởng cho một thành viên xuất sắc.
🇬🇧 Open member list and click 'Add Points' to manually grant 20 bonus points to an outstanding contributor.
🎙️ Lời thoại thuyết minh khi quay video / Spoken Scripts for Video Demo:
🇻🇳 Lời thoại Tiếng Việt (Vietnamese Narration):
"Chủ nhiệm quản lý quy chế thưởng điểm tại tab 'Point Rules': tạo quy tắc mới, chỉnh sửa điểm, gạt bật/tắt rule, hoặc bấm 'Add Points' để thưởng điểm thủ công cho thành viên xuất sắc."
🇬🇧 English Spoken Script (Lời thoại Tiếng Anh):
"President manages earning policies in 'Point Rules': creating rules, editing points, toggling active status, or using 'Add Points' to manually reward outstanding contributors."
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —
Step 2 (President): Quản trị Kho quà thưởng (Rewards Store) / Rewards Store Management
Tài khoản / Account	President: bangdreamer01@gmail.com (Nguyen Bang)
Mục đích / Objective	🇻🇳 Chủ nhiệm thêm mới phần thưởng, chỉnh sửa tồn kho và bật/tắt hiển thị trên Store. 🇬🇧 President creates rewards, modifies stock quantities, and toggles item visibility on the store.
Dữ liệu mẫu / Sample Data	Tên quà: Bình Giữ Nhiệt FGC Gen 5 | Điểm: 120 pts | Số lượng: 10 | Trạng thái: Hiển thị.
▶ Thao tác chi tiết trên màn hình / On-Screen Actions:
●	🇻🇳 Tại trang CLB FGC, chọn tab 'Rewards' trên thanh điều hướng dưới.
🇬🇧 On the FGC club page, select the 'Rewards' tab from the bottom dock.
●	🇻🇳 Bấm nút 'Create New Reward' -> Điền: Tên 'Bình Giữ Nhiệt FGC Gen 5', Điểm 120 pts, Tồn kho 10, đính kèm mô tả -> Bấm Lưu.
🇬🇧 Click 'Create New Reward' -> Input: 'Bình Giữ Nhiệt FGC Gen 5', 120 pts, Stock: 10, description -> Save.
●	🇻🇳 Bấm công tắc gạt 'Hiển thị / Đang ẩn' của một phần thưởng để ẩn tạm thời khỏi Store.
🇬🇧 Toggle the 'Visible / Hidden' switch on an item to temporarily hide it from the catalog.
●	🇻🇳 Bấm 'Edit Reward' để cập nhật lại số lượng tồn kho của phần thưởng.
🇬🇧 Click 'Edit Reward' to update available inventory stock.
🎙️ Lời thoại thuyết minh khi quay video / Spoken Scripts for Video Demo:
🇻🇳 Lời thoại Tiếng Việt (Vietnamese Narration):
"Tại tab 'Rewards', Chủ nhiệm quản lý kho quà: tạo phần thưởng mới như Bình giữ nhiệt 120 điểm, cập nhật số lượng tồn kho và bật/tắt hiển thị quà trên Store."
🇬🇧 English Spoken Script (Lời thoại Tiếng Anh):
"In the 'Rewards' tab, President manages the gift catalog: adding new items like Thermos Flask for 120 points, updating stock, and toggling catalog visibility."
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —
Step 3 (President): Xét duyệt hồ sơ ứng viên gia nhập CLB (Member Approval) / Review & Process Member Applications
Tài khoản / Account	President: bangdreamer01@gmail.com (Nguyen Bang)
Mục đích / Objective	🇻🇳 Chủ nhiệm đánh giá danh sách ứng viên chờ duyệt, thực hiện Approve và Reject kèm lý do. 🇬🇧 President evaluates pending applications, approving qualified candidates and rejecting with notes.
Dữ liệu mẫu / Sample Data	Approve: Tran Van An (Biết đệm hát 1 năm) | Reject: Pham Hoang Cuong (Lý do: Đợt này số lượng đã đủ).
▶ Thao tác chi tiết trên màn hình / On-Screen Actions:
●	🇻🇳 Tại trang CLB FGC, chọn tab 'Member Approval'.
🇬🇧 On the FGC club page, click the 'Member Approval' tab.
●	🇻🇳 Quan sát danh sách 5 ứng viên đang chờ duyệt (Tran Van An, Le Thi Binh, Pham Hoang Cuong, Vu Thi Duyen, Dang Van Hai).
🇬🇧 Inspect the list of 5 pending candidates (Tran Van An, Le Thi Binh, Pham Hoang Cuong, Vu Thi Duyen, Dang Van Hai).
●	🇻🇳 Bấm vào xem chi tiết câu trả lời của ứng viên 'Tran Van An' -> Bấm 'Approve'.
🇬🇧 View the detailed responses of applicant 'Tran Van An' -> Click 'Approve'.
●	🇻🇳 Bấm vào xem hồ sơ của ứng viên 'Pham Hoang Cuong' -> Bấm 'Reject' kèm lý do: 'Chưa phù hợp với đợt tuyển này'.
🇬🇧 View applicant 'Pham Hoang Cuong' -> Click 'Reject' with feedback: 'Capacity reached for this round'.
●	🇻🇳 📧 Mở tab hòm thư để kiểm tra và show email thông báo kết quả xét duyệt (chúc mừng trúng tuyển hoặc thư từ chối chuyên nghiệp) gửi tự động đến ứng viên.
🇬🇧 📧 Open email tab to inspect and display the automated admission result email (congratulations or professional rejection) sent to the applicant.
🎙️ Lời thoại thuyết minh khi quay video / Spoken Scripts for Video Demo:
🇻🇳 Lời thoại Tiếng Việt (Vietnamese Narration):
"Tại tab 'Member Approval', Chủ nhiệm duyệt ứng viên: bấm 'Approve' cho bạn Tran Van An, và 'Reject' kèm lý do cho bạn Pham Hoang Cuong. Hệ thống gửi email thông báo kết quả chuyên nghiệp tới ứng viên."
🇬🇧 English Spoken Script (Lời thoại Tiếng Anh):
"In 'Member Approval', President reviews applicants: clicking 'Approve' for Tran Van An, and 'Reject' with feedback for Pham Hoang Cuong. The system dispatches professional outcome emails."
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —
Step 4 (President): Quản lý Biểu mẫu tuyển thành viên (Join Form) / Recruitment Form Management & Data Integrity Rules
Tài khoản / Account	President: bangdreamer01@gmail.com (Nguyen Bang)
Mục đích / Objective	🇻🇳 Quản trị mẫu đơn đăng ký và giải thích nguyên tắc 1 form active và khóa sửa khi có dữ liệu. 🇬🇧 Manage application forms and demonstrate the 1-active-form rule and edit-locking mechanism.
Dữ liệu mẫu / Sample Data	Form 1 (Active, Đã có đơn -> Khóa sửa) | Form 2 (Inactive, có thể chỉnh sửa tự do).
▶ Thao tác chi tiết trên màn hình / On-Screen Actions:
●	🇻🇳 Tại trang CLB FGC, chọn tab 'Join Form'.
🇬🇧 On the FGC club page, open the 'Join Form' tab.
●	🇻🇳 Quan sát biểu mẫu đang hoạt động: 'Đơn Đăng Ký Gia Nhập CLB Guitar FPT - Kỳ Fall 2026'.
🇬🇧 Examine the currently active form: 'Đơn Đăng Ký Gia Nhập CLB Guitar FPT - Kỳ Fall 2026'.
●	🇻🇳 Thử chỉnh sửa form và giải thích: Khi form đã có sinh viên nộp hồ sơ, hệ thống khóa chỉnh sửa câu hỏi để đảm bảo tính công bằng.
🇬🇧 Attempt to edit and explain: Once a form has received submissions, questions are locked to maintain data integrity.
●	🇻🇳 Thử kích hoạt form phụ 'Đơn Tuyển CTV Ban Truyền Thông' và giải thích: Mỗi thời điểm chỉ duy nhất 1 form được Active.
🇬🇧 Activate the secondary form and explain: Only one form may be active at any given time to avoid application conflicts.
🎙️ Lời thoại thuyết minh khi quay video / Spoken Scripts for Video Demo:
🇻🇳 Lời thoại Tiếng Việt (Vietnamese Narration):
"Tại tab 'Join Form', Chủ nhiệm quản lý biểu mẫu tuyển quân. Hệ thống áp dụng 2 nguyên tắc: chỉ 1 form active tại một thời điểm, và tự động khóa sửa câu hỏi khi đã có sinh viên nộp đơn để bảo đảm công bằng."
🇬🇧 English Spoken Script (Lời thoại Tiếng Anh):
"In the 'Join Form' tab, President oversees recruitment forms. UniClub enforces two principles: only 1 active form at a time, and automatic question locking once submissions exist to preserve fairness."
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —
4. LUỒNG 3: VAI TRÒ TRƯỞNG BAN SỰ KIỆN (EVENT MANAGER) / FLOW 3: EVENT MANAGER ROLE
Step 1 (Event Manager): Khởi tạo sự kiện & Đính kèm văn bản phê duyệt của Nhà trường / Create Event Proposal & Attach School Approval
Tài khoản / Account	Event Manager: demo35@fpt.edu.vn (Nguyen Quoc Khanh)
Mục đích / Objective	🇻🇳 Trưởng ban sự kiện lập kế hoạch tổ chức, nhập đầy đủ thông số và gửi Nhà trường phê duyệt. 🇬🇧 Event Manager drafts event proposal with parameters and submits for University approval.
Dữ liệu mẫu / Sample Data	Tên SK: Acoustic Workshop: Khởi Nguồn Đam Mê | Địa điểm: Hội trường Beta | Quy mô: 60 | School Approval: https://fpt.edu.vn/approval/fgc-ws-2026.pdf
▶ Thao tác chi tiết trên màn hình / On-Screen Actions:
●	🇻🇳 Đăng nhập tài khoản Event Manager 'demo35@fpt.edu.vn' -> Vào CLB FGC -> Tab 'Manage Events'.
🇬🇧 Sign in as Event Manager 'demo35@fpt.edu.vn' -> Open FGC -> 'Manage Events' tab.
●	🇻🇳 Bấm nút 'Create Event' và nhập dữ liệu sự kiện mới.
🇬🇧 Click 'Create Event' and fill in the event information.
●	🇻🇳 Tại trường 'School Approval', nhập link văn bản phê duyệt: https://fpt.edu.vn/approval/fgc-ws-2026.pdf.
🇬🇧 In the 'School Approval' field, input the official approval document URL: https://fpt.edu.vn/approval/fgc-ws-2026.pdf.
●	🇻🇳 Bấm 'Submit Event'. Sự kiện được tạo ở trạng thái chờ Phòng CTSV (Student Affairs) phê duyệt.
🇬🇧 Click 'Submit Event'. The event is created in pending status awaiting Student Affairs approval.
🎙️ Lời thoại thuyết minh khi quay video / Spoken Scripts for Video Demo:
🇻🇳 Lời thoại Tiếng Việt (Vietnamese Narration):
"Trưởng ban Sự kiện vào 'Manage Events' bấm 'Create Event', điền thông tin sự kiện và đính kèm đường link văn bản phê duyệt của Nhà trường, rồi gửi lên Phòng CTSV thẩm định."
🇬🇧 English Spoken Script (Lời thoại Tiếng Anh):
"Event Manager clicks 'Create Event' in 'Manage Events', inputs event details, attaches the university approval link, and submits for Student Affairs review."
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —
Step 1b (Event Manager): Cán bộ Phòng CTSV (Student Affairs) phê duyệt sự kiện / Student Affairs Officer Approves Event Proposal
Tài khoản / Account	Student Affairs: uniclub2402@gmail.com (Nguyen Van Admin)
Mục đích / Objective	🇻🇳 Phòng CTSV kiểm tra tính pháp lý và phê duyệt đề xuất tổ chức sự kiện của CLB. 🇬🇧 Student Affairs officer reviews compliance and approves the club's event request.
Dữ liệu mẫu / Sample Data	Hành động: Approve đề xuất sự kiện FGC | Trạng thái: Approved.
▶ Thao tác chi tiết trên màn hình / On-Screen Actions:
●	🇻🇳 Đăng nhập tài khoản Cán bộ CTSV 'uniclub2402@gmail.com'.
🇬🇧 Sign in with Student Affairs account 'uniclub2402@gmail.com'.
●	🇻🇳 Truy cập vào trang 'Admin Dashboard' -> Chọn mục 'Event Requests'.
🇬🇧 Open the 'Admin Dashboard' -> Select 'Event Requests'.
●	🇻🇳 Tìm sự kiện 'Acoustic Workshop: Khởi Nguồn Đam Mê' vừa gửi lên, xem xét nội dung và link phê duyệt.
🇬🇧 Find 'Acoustic Workshop: Khởi Nguồn Đam Mê', inspect content and approval link.
●	🇻🇳 Bấm nút 'Approve' để chính thức cấp phép tổ chức sự kiện.
🇬🇧 Click 'Approve' to grant official institutional permission.
●	🇻🇳 📧 Mở tab hòm thư để kiểm tra và show email thông báo phê duyệt sự kiện gửi tự động về cho người đề xuất từ hệ thống UniClub.
🇬🇧 📧 Open email tab to inspect and display the event proposal approval notification email automatically dispatched to the requester.
🎙️ Lời thoại thuyết minh khi quay video / Spoken Scripts for Video Demo:
🇻🇳 Lời thoại Tiếng Việt (Vietnamese Narration):
"Cán bộ Phòng CTSV vào 'Admin Dashboard -> Event Requests', kiểm tra văn bản đính kèm và bấm 'Approve'. Hệ thống tự động gửi email thông báo kết quả phê duyệt về cho CLB."
🇬🇧 English Spoken Script (Lời thoại Tiếng Anh):
"Student Affairs officer reviews the proposal under 'Event Requests' and clicks 'Approve'. The system automatically emails the approval notification back to the club."
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —
Step 2 (Event Manager): Hoàn thiện thông tin sự kiện & Chuyển trạng thái Draft sang Completed / Finalize Event Details: Progress Draft to Completed & Publish
Tài khoản / Account	Event Manager: demo35@fpt.edu.vn (Nguyen Quoc Khanh)
Mục đích / Objective	🇻🇳 Chỉnh sửa chi tiết sự kiện khi là Draft, sau đó hoàn tất để công khai cho toàn trường đăng ký. 🇬🇧 Refine event details in Draft mode, then transition to Completed to publish for campus registration.
Dữ liệu mẫu / Sample Data	Progress Status: Draft -> Completed | Operational Status: Coming Soon -> Opening.
▶ Thao tác chi tiết trên màn hình / On-Screen Actions:
●	🇻🇳 Đăng nhập lại Event Manager 'demo35@fpt.edu.vn' -> Vào FGC -> Tab 'Manage Events'.
🇬🇧 Log back in as Event Manager 'demo35@fpt.edu.vn' -> Open FGC -> 'Manage Events' tab.
●	🇻🇳 Tìm sự kiện vừa được duyệt, bấm 'Edit' để cập nhật mô tả chi tiết, hình ảnh banner.
🇬🇧 Locate the approved event, click 'Edit' to update descriptions and banner imagery.
●	🇻🇳 Sau khi hoàn thiện, chuyển 'Progress Status' từ 'draft' sang 'completed'.
🇬🇧 Once finalized, change 'Progress Status' from 'draft' to 'completed'.
●	🇻🇳 Sau khi đã completed, chuyển 'Operational Status' từ 'coming_soon' sang 'opening' (hoặc giữ coming_soon).
🇬🇧 Once completed, transition 'Operational Status' from 'coming_soon' to 'opening' (or keep coming_soon).
●	🇻🇳 Bấm 'Save Changes' để lưu lại.
🇬🇧 Click 'Save Changes' to persist.
🎙️ Lời thoại thuyết minh khi quay video / Spoken Scripts for Video Demo:
🇻🇳 Lời thoại Tiếng Việt (Vietnamese Narration):
"Sự kiện sau khi duyệt ở trạng thái 'Draft'. Ban tổ chức hoàn thiện banner, mô tả, rồi chuyển Progress sang 'Completed'. Lúc này hệ thống mở khóa cho phép đổi trạng thái hoạt động sang 'Coming Soon' hoặc 'Opening' để mở đăng ký toàn trường."
🇬🇧 English Spoken Script (Lời thoại Tiếng Anh):
"The approved event starts in 'Draft'. The team finalizes details, switches Progress to 'Completed', unlocking transitions to 'Coming Soon' or 'Opening' for campus registration."
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —
Step 3 (Event Manager): Thiết lập Lịch trình chi tiết (Event Timeline) / Establish Detailed Event Timeline
Tài khoản / Account	Event Manager: demo35@fpt.edu.vn (Nguyen Quoc Khanh)
Mục đích / Objective	🇻🇳 Lên khung giờ chi tiết từng hoạt động, giải thích quy tắc chỉ sửa khi sự kiện là Draft. 🇬🇧 Define hourly schedule of activities and demonstrate that timeline editing is restricted to Draft phase.
Dữ liệu mẫu / Sample Data	18:00-18:30 (Check-in & Đón khách) | 18:30-20:00 (Workshop & Thực hành) | 20:00-20:30 (Q&A & Bế mạc).
▶ Thao tác chi tiết trên màn hình / On-Screen Actions:
●	🇻🇳 Trong trang 'Manage Events', mở popup xem chi tiết sự kiện (View Details).
🇬🇧 On the 'Manage Events' page, open the event detail modal (View Details).
●	🇻🇳 Tại phần 'Event Timeline', bấm 'Add Timeline Item' để thêm các mốc: Check-in, Workshop, Q&A.
🇬🇧 In the 'Event Timeline' section, click 'Add Timeline Item' to add agenda blocks: Check-in, Workshop, Q&A.
●	🇻🇳 Giải thích: Khi sự kiện còn là Draft thì Timeline mới được thêm/sửa, khi đã Completed thì Timeline sẽ tự động khóa để bảo đảm an toàn kịch bản.
🇬🇧 Explain: Timeline items can only be added or edited while the event is in Draft mode; once Completed, the timeline is locked to protect the agenda.
🎙️ Lời thoại thuyết minh khi quay video / Spoken Scripts for Video Demo:
🇻🇳 Lời thoại Tiếng Việt (Vietnamese Narration):
"Tại mục 'Event Timeline', Trưởng ban Sự kiện lên kịch bản chi tiết theo từng khung giờ: đón khách, khai mạc, workshop và bế mạc. Khung timeline chỉ được chỉnh sửa trong giai đoạn Draft để bảo đảm an toàn chương trình."
🇬🇧 English Spoken Script (Lời thoại Tiếng Anh):
"In 'Event Timeline', Event Manager structures the hourly agenda: reception, opening, workshop, and closing. The timeline is editable exclusively during Draft mode to protect the program agenda."
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —
Step 4 (Event Manager): Vận hành Điểm danh & Quét mã QR tại sự kiện / Live Attendance Management & QR Code Scanning
Tài khoản / Account	Event Manager: demo35@fpt.edu.vn (Nguyen Quoc Khanh)
Mục đích / Objective	🇻🇳 Mở cổng check-in trong giờ diễn ra sự kiện, quét mã QR hoặc check-in thủ công cho sinh viên. 🇬🇧 Open check-in portal during the event, scan attendee QR codes, or check in manually.
Dữ liệu mẫu / Sample Data	Hành động: Open Check-in -> Quét QR / Check-in thủ công -> Xác nhận Attended.
▶ Thao tác chi tiết trên màn hình / On-Screen Actions:
●	🇻🇳 Truy cập vào tab 'Attendance' của sự kiện đang mở.
🇬🇧 Access the 'Attendance' tab for the active event.
●	🇻🇳 Bấm nút 'Open Check-in' để mở cổng điểm danh.
🇬🇧 Click 'Open Check-in' to launch the attendance session.
●	🇻🇳 Sử dụng camera quét mã QR của sinh viên hoặc tìm tên sinh viên trên danh sách để bấm nút check-in.
🇬🇧 Scan attendee QR codes via camera or locate member names on the list to mark attendance manually.
●	🇻🇳 Quan sát thông báo điểm danh thành công và hệ thống tự động ghi nhận thời gian tham gia thực tế.
🇬🇧 Observe the success confirmation and automated check-in timestamp recording.
🎙️ Lời thoại thuyết minh khi quay video / Spoken Scripts for Video Demo:
🇻🇳 Lời thoại Tiếng Việt (Vietnamese Narration):
"Khi sự kiện diễn ra, Event Manager vào tab 'Attendance' bấm 'Open Check-in', quét mã QR từ email của người tham gia hoặc bấm check-in trực tiếp trên danh sách để tự động cấp điểm thưởng."
🇬🇧 English Spoken Script (Lời thoại Tiếng Anh):
"During the event, Event Manager opens 'Attendance', clicks 'Open Check-in', and scans attendee QR codes from email or marks attendance manually to award points."
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —
5. LUỒNG 4: VAI TRÒ THƯ KÝ CLB (SECRETARY) / FLOW 4: CLUB SECRETARY ROLE
Step 1 (Secretary): Quản lý Lịch sinh hoạt định kỳ (Manage Schedule) / Manage Weekly Activity Schedule
Tài khoản / Account	Secretary: demo33@fpt.edu.vn (Do Thi Giang)
Mục đích / Objective	🇻🇳 Thư ký ban hành lịch sinh hoạt tuần, chỉnh sửa hoạt động chưa diễn ra và bảo lưu lịch sử cũ. 🇬🇧 Secretary publishes weekly schedule, updates upcoming activities, and preserves historical records.
Dữ liệu mẫu / Sample Data	Tên: Buổi luyện thanh & Hát bè Acoustic | Giờ: 18:00 - 20:00 | Phòng: 102 Beta.
▶ Thao tác chi tiết trên màn hình / On-Screen Actions:
●	🇻🇳 Đăng nhập tài khoản Secretary 'demo33@fpt.edu.vn' -> Vào CLB FGC -> Tab 'Manage Schedule'.
🇬🇧 Sign in as Secretary 'demo33@fpt.edu.vn' -> Open FGC -> 'Manage Schedule' tab.
●	🇻🇳 Bấm nút 'Create Activity' để lên lịch buổi sinh hoạt mới trong tuần.
🇬🇧 Click 'Create Activity' to schedule a new weekly session.
●	🇻🇳 Nhập: Tiêu đề 'Buổi luyện thanh & Hát bè Acoustic', Thời gian: Ngày mai 18h-20h, Địa điểm: Phòng 102 Beta.
🇬🇧 Input: Title 'Buổi luyện thanh & Hát bè Acoustic', Time: Tomorrow 18:00-20:00, Location: Room 102 Beta.
●	🇻🇳 Bấm 'Save Activity'.
🇬🇧 Click 'Save Activity'.
●	🇻🇳 Giải thích: Thư ký có thể chỉnh sửa các hoạt động chưa diễn ra. Tuy nhiên, các hoạt động đã kết thúc trong quá khứ sẽ bị khóa không được xóa để lưu trữ lịch sử hoạt động của CLB.
🇬🇧 Explain: The Secretary can modify upcoming sessions. However, past completed sessions cannot be deleted to safeguard club attendance and activity history.
🎙️ Lời thoại thuyết minh khi quay video / Spoken Scripts for Video Demo:
🇻🇳 Lời thoại Tiếng Việt (Vietnamese Narration):
"Thư ký quản trị thời khóa biểu tại tab 'Manage Schedule': bấm 'Create Activity' để lên lịch buổi sinh hoạt mới trong tuần. Các buổi đã kết thúc trong quá khứ sẽ bị khóa xóa nhằm bảo lưu lịch sử hoạt động."
🇬🇧 English Spoken Script (Lời thoại Tiếng Anh):
"Secretary administers schedules in 'Manage Schedule': clicking 'Create Activity' to plan new weekly sessions. Concluded past sessions cannot be deleted to preserve club history."
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —
Step 2 (Secretary): Gửi Lời mời gia nhập CLB (Invitations) / Dispatch Club Invitations via Email
Tài khoản / Account	Secretary: demo33@fpt.edu.vn (Do Thi Giang)
Mục đích / Objective	🇻🇳 Thư ký chủ động gửi lời mời qua email, theo dõi trạng thái Pending, Cancel, Resend. 🇬🇧 Secretary proactively invites students by email and manages Pending, Cancel, and Resend states.
Dữ liệu mẫu / Sample Data	Email mời: applicant1@fpt.edu.vn | Hành động: Gửi lời mời -> Theo dõi Pending / Cancel / Resend.
▶ Thao tác chi tiết trên màn hình / On-Screen Actions:
●	🇻🇳 Tại trang CLB FGC, chọn tab 'Invitations'.
🇬🇧 On the FGC club page, open the 'Invitations' tab.
●	🇻🇳 Bấm nút 'Send Invitation' -> Nhập email sinh viên (ví dụ: applicant1@fpt.edu.vn hoặc email test).
🇬🇧 Click 'Send Invitation' -> Input student email (e.g. applicant1@fpt.edu.vn or test email).
●	🇻🇳 Hệ thống gửi email thông báo lời mời chính thức đến sinh viên.
🇬🇧 The system dispatches an official invitation notification to the student.
●	🇻🇳 Quan sát trạng thái 'Pending': Thư ký có thể bấm 'Cancel' để thu hồi lời mời nếu gửi nhầm.
🇬🇧 Observe the 'Pending' status: The Secretary can click 'Cancel' to revoke the invitation if sent in error.
●	🇻🇳 Nếu lời mời bị sinh viên từ chối ('Rejected'), thư ký có thể bấm nút 'Resend' để gửi lại.
🇬🇧 If the invitation is rejected, the Secretary can click 'Resend' to re-dispatch.
●	🇻🇳 📧 Mở hòm thư email của sinh viên nhận thư mời để kiểm tra và show email lời mời tham gia CLB chính thức có chứa thông tin vai trò và nút phản hồi.
🇬🇧 📧 Open recipient's email inbox tab to inspect and display the official club invitation email with role details and response button.
🎙️ Lời thoại thuyết minh khi quay video / Spoken Scripts for Video Demo:
🇻🇳 Lời thoại Tiếng Việt (Vietnamese Narration):
"Tại tab 'Invitations', Thư ký nhập email sinh viên để gửi lời mời tham gia CLB. Hệ thống gửi email thông báo chính thức. Mở email của sinh viên, ta thấy ngay thư mời gia nhập CLB được gửi đến theo thời gian thực."
🇬🇧 English Spoken Script (Lời thoại Tiếng Anh):
"In the 'Invitations' tab, Secretary enters student emails to invite candidates. The system sends an official invitation email. In the recipient's inbox, the invite appears in real-time."
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —
Step 3 (Secretary): Tổ chức và Quản lý Cuộc bình chọn (Polls) / Create & Close Club Polls
Tài khoản / Account	Secretary: demo33@fpt.edu.vn (Do Thi Giang)
Mục đích / Objective	🇻🇳 Thư ký tạo cuộc khảo sát ý kiến mới và đóng cuộc bình chọn khi hết hạn để chốt kết quả. 🇬🇧 Secretary initiates new surveys and closes active polls to finalize voting results.
Dữ liệu mẫu / Sample Data	Poll mới: Bình chọn ban nhạc khách mời cho Gala cuối năm | Các lựa chọn: F-Band, Acoustic Gen 3, Khách mời ngoài.
▶ Thao tác chi tiết trên màn hình / On-Screen Actions:
●	🇻🇳 Tại trang CLB FGC, chọn tab 'Polls'.
🇬🇧 On the FGC club page, open the 'Polls' tab.
●	🇻🇳 Quan sát danh sách gồm các poll đã đóng và poll đang mở.
🇬🇧 Observe the list containing both closed and active polls.
●	🇻🇳 Bấm 'Create Poll' -> Nhập: Tiêu đề 'Bình chọn ban nhạc khách mời cho Gala cuối năm', thêm các phương án lựa chọn -> Bấm Lưu.
🇬🇧 Click 'Create Poll' -> Input: Title 'Bình chọn ban nhạc khách mời cho Gala cuối năm', add options -> Save.
●	🇻🇳 Tại cuộc bình chọn đang mở, bấm nút 'Close Poll' để chính thức đóng cuộc bình chọn và chốt kết quả.
🇬🇧 On an active poll, click 'Close Poll' to conclude voting and finalize results.
🎙️ Lời thoại thuyết minh khi quay video / Spoken Scripts for Video Demo:
🇻🇳 Lời thoại Tiếng Việt (Vietnamese Narration):
"Tại tab 'Polls', Thư ký bấm 'Create Poll' để tạo cuộc biểu quyết mới lấy ý kiến thành viên. Khi hết thời hạn bình chọn, Thư ký bấm 'Close Poll' để đóng biểu quyết và công bố kết quả chung cuộc."
🇬🇧 English Spoken Script (Lời thoại Tiếng Anh):
"In 'Polls', Secretary clicks 'Create Poll' to gather member opinions. When voting ends, Secretary clicks 'Close Poll' to finalize and publish the results."
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —
6. LUỒNG 5: VAI TRÒ THỦ QUỸ CLB (TREASURER) / FLOW 5: CLUB TREASURER ROLE
Step 1 (Treasurer): Quản trị Tài chính, Thu - Chi & Đối soát thanh toán tiền mặt / online / Financial Management, Income/Expense & Cash Collection Verification
Tài khoản / Account	Treasurer: demo34@fpt.edu.vn (Ho Minh Hung)
Mục đích / Objective	🇻🇳 Thủ quỹ tạo phiếu chi cho Chủ nhiệm duyệt; giải thích cơ chế phân bổ phiếu thu và tính năng Xác nhận thu tiền mặt. 🇬🇧 Treasurer creates expense requests for President approval, explains fee distribution, and cash collection.
Dữ liệu mẫu / Sample Data	Phiếu chi: Thuê dàn âm thanh mini cho Acoustic Night | Số tiền: 800.000 đ | Trạng thái: Pending -> Approved bởi President.
▶ Thao tác chi tiết trên màn hình / On-Screen Actions:
●	🇻🇳 Đăng nhập tài khoản Treasurer 'demo34@fpt.edu.vn' -> Vào CLB FGC -> Tab 'Finance'.
🇬🇧 Sign in as Treasurer 'demo34@fpt.edu.vn' -> Open FGC -> 'Finance' tab.
●	🇻🇳 Xem tổng quan ngân sách: Thẻ Tổng thu, Thẻ Tổng chi, Thẻ Số dư hiện tại.
🇬🇧 Review budget summary: Total Income, Total Expense, and Net Balance cards.
●	🇻🇳 Bấm 'Create Transaction' -> Chọn loại 'Expense (Chi)' -> Nhập: Tiêu đề 'Thuê dàn âm thanh mini cho Acoustic Night', Kỳ 'FA26', Số tiền '800.000 đ' -> Bấm Submit.
🇬🇧 Click 'Create Transaction' -> Select 'Expense' -> Input: Title 'Thuê dàn âm thanh mini cho Acoustic Night', Period 'FA26', Amount '800,000 VND' -> Submit.
●	🇻🇳 Phiếu chi được tạo ở trạng thái 'Pending'.
🇬🇧 The expense is queued in 'Pending' status.
●	🇻🇳 Đăng nhập tài khoản President 'bangdreamer01@gmail.com' -> Vào tab Finance -> Bấm 'Approve' cho phiếu chi này.
🇬🇧 Sign in as President 'bangdreamer01@gmail.com' -> Open Finance -> Click 'Approve' on this expense.
●	🇻🇳 Giải thích phiếu Thu (Income): Khi thủ quỹ tạo phiếu thu quỹ kỳ và được President duyệt, hệ thống sẽ tự động phân bổ phiếu đóng tiền cho toàn thể thành viên CLB. Thành viên có thể lựa chọn thanh toán qua VNPay hoặc nộp Tiền mặt. Khi nhận tiền mặt, thủ quỹ sẽ bấm nút 'Xác nhận thu tiền mặt (Collect Cash)' ngay trên danh sách.
🇬🇧 Explain Income transactions: When the Treasurer creates a semester fee collection and the President approves it, the system automatically distributes fee dues to all active members. Members can pay online via VNPay or in cash. Upon receiving cash, the Treasurer clicks 'Collect Cash' directly on the list to issue a receipt.
🎙️ Lời thoại thuyết minh khi quay video / Spoken Scripts for Video Demo:
🇻🇳 Lời thoại Tiếng Việt (Vietnamese Narration):
"Tại tab 'Finance', Thủ quỹ theo dõi ngân sách qua các thẻ Tổng thu, Tổng chi và Số dư. Thủ quỹ tạo phiếu chi 800.000đ thuê âm thanh để Chủ nhiệm duyệt. Đối với phiếu thu quỹ kỳ, hệ thống tự động phân bổ phiếu đóng cho toàn thể thành viên và Thủ quỹ có thể bấm 'Collect Cash' để xác nhận thu tiền mặt."
🇬🇧 English Spoken Script (Lời thoại Tiếng Anh):
"In 'Finance', Treasurer tracks budget KPIs: Income, Expense, and Net Balance. Treasurer creates an 800,000 VND expense for President approval. For income dues, the system auto-distributes fees to all members and Treasurer can click 'Collect Cash' for cash payments."
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —
6. LUỒNG 6: TỰ TẠO CÂU LẠC BỘ & PHÊ DUYỆT PHÂN QUYỀN CẤP TRƯỜNG / FLOW 6: CLUB CREATION & INSTITUTIONAL ROLE ASSIGNMENT
Step 1 (Create Club): Khởi tạo đề xuất thành lập CLB mới / Student Submits Club Creation Proposal
Tài khoản / Account	Student: tynce181041@fpt.edu.vn (Nguyen Thanh Ty)
Mục đích / Objective	🇻🇳 Sinh viên tự tạo CLB mới, nêu rõ mục đích hoạt động và cơ cấu phân quyền ban chủ nhiệm trong phần mô tả. 🇬🇧 Student proposes a new club, outlining operational charter and proposed leadership structure in description.
Dữ liệu mẫu / Sample Data	Tên: CLB Trí Tuệ Nhân Tạo FPT - FPT AI Club (FAIC) | Category: Academic | Slogan: Khám phá công nghệ - Kiến tạo tương lai | Mô tả nhân sự: Nguyen Thanh Ty (President), Tran Thanh Linh (Secretary), Ho Minh Hung (Treasurer).
▶ Thao tác chi tiết trên màn hình / On-Screen Actions:
●	🇻🇳 Tại giao diện trang chủ hoặc menu điều hướng bên trái, bấm vào nút 'Create Club' (/create-club).
🇬🇧 On the Home screen or left sidebar, click 'Create Club' (/create-club).
●	🇻🇳 Điền thông tin CLB mới: Tên 'CLB Trí Tuệ Nhân Tạo FPT - FPT AI Club (FAIC)', Danh mục 'Academic', Slogan 'Khám phá công nghệ - Kiến tạo tương lai'.
🇬🇧 Fill in club details: Name 'FPT AI Club (FAIC)', Category 'Academic', Slogan 'Exploring Tech, Shaping the Future'.
●	🇻🇳 Tại ô Description: Nêu rõ mục đích hoạt động và ghi rõ đề xuất cơ cấu ban chủ nhiệm (tynce181041 làm President, demo36 làm Secretary, demo34 làm Treasurer).
🇬🇧 In Description: Clearly outline operational objectives and specify proposed committee roles (tynce181041 as President, demo36 as Secretary, demo34 as Treasurer).
●	🇻🇳 Tại ô 'Founding Members': Tìm kiếm và thêm các thành viên đồng sáng lập: Tran Thanh Linh (demo36) và Ho Minh Hung (demo34).
🇬🇧 In 'Founding Members': Search and add co-founding members: Tran Thanh Linh (demo36) and Ho Minh Hung (demo34).
●	🇻🇳 Bấm 'Submit Request'. Quan sát thông báo gửi đề xuất thành công.
🇬🇧 Click 'Submit Request'. Observe the success notification.
●	🇻🇳 Giải thích: Khi mới tạo, CLB ở trạng thái Pending và CHƯA xuất hiện trên danh sách CLB công khai của trường, mà được gửi lên Phòng CTSV thẩm định.
🇬🇧 Explain: Newly created clubs enter 'Pending' status and are NOT yet listed on the public club directory, awaiting Student Affairs compliance review.
🎙️ Lời thoại thuyết minh khi quay video / Spoken Scripts for Video Demo:
🇻🇳 Lời thoại Tiếng Việt (Vietnamese Narration):
"Bất kỳ sinh viên nào cũng có thể tự tạo CLB bằng nút 'Create Club'. Em điền thông tin FPT AI Club, nêu rõ mục đích hoạt động và cơ cấu ban chủ nhiệm (Nguyen Thanh Ty làm Chủ nhiệm, Tran Thanh Linh làm Thư ký, Ho Minh Hung làm Thủ quỹ), rồi bấm 'Submit Request'."
🇬🇧 English Spoken Script (Lời thoại Tiếng Anh):
"Any student can create a club via 'Create Club'. I input FPT AI Club details, charter, and committee structure (Nguyen Thanh Ty as President, Tran Thanh Linh as Secretary, Ho Minh Hung as Treasurer), then click 'Submit Request'."
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —
Step 2 (Student Affairs): Phòng CTSV phê duyệt thành lập CLB & Phân quyền Ban chủ nhiệm / Student Affairs Approves Club & Configures Management Roles
Tài khoản / Account	Student Affairs: uniclub2402@gmail.com (Nguyen Van Admin)
Mục đích / Objective	🇻🇳 Cán bộ CTSV duyệt đơn thành lập CLB và dựa vào mô tả để phân bổ vai trò chính thức cho từng thành viên sáng lập. 🇬🇧 Student Affairs officer approves club charter and configures executive leadership roles based on proposal description.
Dữ liệu mẫu / Sample Data	Phê duyệt: FPT AI Club | Phân quyền Manage Members: Nguyen Thanh Ty -> President, Tran Thanh Linh -> Secretary, Ho Minh Hung -> Treasurer.
▶ Thao tác chi tiết trên màn hình / On-Screen Actions:
●	🇻🇳 Đăng nhập tài khoản Student Affairs 'uniclub2402@gmail.com' -> Truy cập vào 'Admin Dashboard'.
🇬🇧 Sign in as Student Affairs officer 'uniclub2402@gmail.com' -> Navigate to 'Admin Dashboard'.
●	🇻🇳 Tại tab 'Club Requests' (Registration Requests): Xem đề xuất của 'FPT AI Club', đọc phần mô tả định biên nhân sự -> Bấm 'Approve'.
🇬🇧 In 'Club Requests' (Registration Requests) tab: Review the 'FPT AI Club' proposal and leadership charter -> Click 'Approve'.
●	🇻🇳 📧 Mở tab hòm thư để kiểm tra và show email chúc mừng thành lập CLB gửi tự động từ hệ thống đến người đại diện sáng lập.
🇬🇧 📧 Open mailbox tab to verify and showcase real-time club establishment congratulation email automatically sent to founder.
●	🇻🇳 Chuyển sang tab 'Active Clubs': Thấy CLB 'FPT AI Club' đã chính thức xuất hiện trên danh mục trường.
🇬🇧 Switch to 'Active Clubs' tab: Confirm 'FPT AI Club' is now officially listed in the university club directory.
●	🇻🇳 Bấm vào CLB 'FPT AI Club' -> Mở popup chi tiết -> Bấm nút 'Manage Members'.
🇬🇧 Click 'FPT AI Club' -> Open detail modal -> Click 'Manage Members'.
●	🇻🇳 Tại danh sách thành viên, dựa trên mô tả trong đề xuất: Đổi role của 'Tran Thanh Linh' thành 'Secretary'; Đổi role của 'Ho Minh Hung' thành 'Treasurer'; Xác nhận 'Nguyen Thanh Ty' là 'President'.
🇬🇧 On the member roster, adhering to the proposal description: Change 'Tran Thanh Linh' role to 'Secretary'; Change 'Ho Minh Hung' role to 'Treasurer'; Confirm 'Nguyen Thanh Ty' as 'President'.
●	🇻🇳 Bấm lưu. Quan sát các thành viên sáng lập đã được cấp quyền quản trị tương ứng.
🇬🇧 Save changes. Observe that all co-founders have been granted their respective administrative privileges.
🎙️ Lời thoại thuyết minh khi quay video / Spoken Scripts for Video Demo:
🇻🇳 Lời thoại Tiếng Việt (Vietnamese Narration):
"Cán bộ CTSV vào 'Admin Dashboard -> Club Requests', xem xét đề xuất FPT AI Club và bấm 'Approve'. Hệ thống gửi email chúc mừng thành lập CLB. Sau đó, cán bộ vào 'Manage Members' phân quyền Thư ký và Thủ quỹ đúng theo mô tả đề xuất của sinh viên."
🇬🇧 English Spoken Script (Lời thoại Tiếng Anh):
"Student Affairs officer reviews the FPT AI Club request under 'Club Requests' and clicks 'Approve'. An approval email is dispatched. The officer then opens 'Manage Members' and configures Secretary and Treasurer roles adhering to the proposal."
— — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — — —
7. KẾT LUẬN & TỔNG KẾT BUỔI QUAY DEMO / CONCLUSION
🇻🇳 Lời thoại kết thúc Tiếng Việt: "Kính thưa thầy cô và các bạn, vừa rồi nhóm đã trình bày trọn vẹn các luồng chức năng của hệ thống UniClub: từ hành trình sinh viên, ban chủ nhiệm các vai trò, đến phê duyệt cấp trường và kiểm tra email thực tế. Em xin chân thành cảm ơn!"
🇬🇧 English Closing Script: "Distinguished professors and audience, our team has presented the complete workflows of UniClub: from student journey, club board roles, to institutional approvals and real-time email notifications. Thank you very much!"

