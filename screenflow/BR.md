# Business Rules (71 BRs)

| ID | Rule Definition |
| :--- | :--- |
| **BR-01** | Only login via Google OAuth using school domain emails (@fpt.edu.vn) is accepted. Personal emails (standard Gmail) are blocked by the system. Login via FEID must also use school-issued accounts. |
| **BR-02** | The system uses a standard JWT token for user authentication (7-day validity). Client logs out by clearing local authentication state. |
| **BR-03** | Fixed data fields managed by the University—such as Student Code, Official Full Name, and School Email—cannot be modified by students. |
| **BR-04** | Students are permitted to freely update: Profile Picture (Avatar), Phone Number. |
| **BR-05** | Avatars must be in .jpg, .png, or .webp format (maximum file size: 5MB). Phone numbers must follow standard Vietnamese formatting (10 digits). |
| **BR-06** | A student is not allowed to submit more than one membership application in "Pending" status to the same Club. |
| **BR-07** | Students can only cancel a membership application while it is in "Pending" status. Processed applications (Approved/Rejected) cannot be cancelled. |
| **BR-08** | A membership application can only be submitted successfully when that Club's recruitment form is in "Active" status and within the open recruitment period. |
| **BR-09** | A club establishment proposal must include: Club Name, Category, Description, Logo, at least 10 members. |
| **BR-10** | Students can only view and search for Clubs that are in "Active" status. |
| **BR-11** | Club Name must be globally unique across the system, case-insensitive, with no duplicates permitted. |
| **BR-12** | Only accounts with the Student Affairs (SA) role have the authority to view and make review decisions on club management |
| **BR-13** | Each Club can have only one active President at any given time. The system strictly prohibits multiple concurrent Presidents in the same club. When a new member is appointed as President, the existing President is automatically demoted to regular Member. |
| **BR-14** | Direct modification of club details by the Club President is restricted. To update any club information, the President must submit the requested details via email to Student Affairs (SA) for manual processing and system updates. |
| **BR-15** | Regular members have the right to request to leave the Club at any time. The Committee Member (President, Secretary, Treasurer, Event Manager) cannot leave without completing the formal handover of the role. |
| **BR-16** | The system alerts the President and Treasurer to verify whether a member requesting to leave still has outstanding club fund dues or unreturned club assets/equipment. |
| **BR-17** | Only the President can view the Full Name, Role, Phone Number, Email and Campus of their teammates. |
| **BR-18** | Only the President has the authority to remove members from the Club. Dismissal actions strictly require a reason. |
| **BR-19** | The Committee Member (Secretary, Treasurer, Event Manager) cannot be directly dismissed. Their executive roles must first be revoked to Member status prior to removal. |
| **BR-20** | Only the President is authorized to view and approve/reject club membership applications. |
| **BR-21** | Immediately upon clicking Approve, the applicant's account transitions to Active member status, and the system automatically sends a notification/congratulatory email. |
| **BR-22** | Each join request form must contain at least one question. Questions are currently supported as text-based input fields. |
| **BR-23** | At any given time, each Club can have at most one Recruitment Form in Active status. This rule is enforced simultaneously across two layers:<br>1. Service Logic Layer: When creating a new form or reactivating an old form, the system automatically transitions all other Active forms of that Club to Inactive.<br>2. Database Layer: Enforced via a MongoDB Partial Unique Index on the club_id field with the condition { status: "active" }, preventing race conditions and ensuring duplicate active forms cannot exist. |
| **BR-24** | Once a form has received at least one response from a student, the system locks it, disallowing deletion or structural modification of existing questions. |
| **BR-25** | Students can only successfully register for an event within the window [Registration_Start, Registration_End] and when available slots (Available_Slots) > 0. |
| **BR-26** | Public Events: Open for all university students to view and register.<br>Internal Events: Visible and open for registration only to active members of the organizing Club. |
| **BR-27** | Students may cancel free event registrations at least 24 hours prior to the event start time. On-time cancellations do not penalize reputation/trust scores. |
| **BR-28** | Successful registration generates a unique Ticket ID with an associated QR code (Registration_ID). The QR code contains a cryptographically signed token to prevent fraudulent check-in scans. |
| **BR-29** | Only students whose actual attendance status is "Attended" are granted access to view, write, update and delete the event feedback form. |
| **BR-30** | Feedback submission is available exclusively for concluded events. Each participant may submit one review per event and retains the right to edit or delete their own feedback. |
| **BR-31** | Star ratings range from 1 to 5. All submitted feedback and review comments are public and display the reviewer's full name; anonymous submissions are not supported. |
| **BR-32** | Event creation requests initially enter the Pending Approval state and conclude the review phase once transitioned to either Approved or Rejected. |
| **BR-33** | An event is created in Draft / Coming Soon state. Management manually transitions it to Opening to accept registrations, then Closed once registration ends. After the event concludes, it is marked Completed. At any stage, the event may be Cancelled. |
| **BR-34** | Events in "Approved" or "Ongoing" status cannot unilaterally change their primary Date/Time or Venue. Major modifications strictly require submitting a request for re-approval. |
| **BR-35** | When cancelling an event, entering a cancellation reason is mandatory. The system automatically sends an announcement email/notification to all registered attendees. |
| **BR-36** | All timeline milestones (Start_Time, End_Time) must fall completely within the overall duration of the Event. |
| **BR-37** | A timeline milestone can be linked to an ActionType (e.g., "Check-in at start", "Mid-event Check-in", "Feedback") for automated point calculation. |
| **BR-38** | QR check-in scanning is valid only within the designated check-in window (default: opens 1 hour (60 minutes) before the start time and closes 15 minutes after the event start time). |
| **BR-39** | Only the President or Event Manager has the authority to perform QR check-in scans. The scanned QR code must match a valid Registration ID for the event, and each QR code can only be confirmed for check-in once. |
| **BR-40** | Organizers (President or Event Manager) can manually update attendance status between Registered, Attended, and Absent for registered students. The system records who performed the check-in action (checked_in_by) |
| **BR-41** | As soon as check-in status transitions to "Attended", the system automatically invokes the Point Rule service to award corresponding points to the student. |
| **BR-42** | Campus-wide (Public) events or events requesting university auditoriums/grounds must be approved by Student Affairs (SA). |
| **BR-43** | When rejecting an event proposal, Student Affairs (SA) officers must provide a detailed explanatory reason to the Club. |
| **BR-44** | All point accrual/deduction transactions are recorded in the Contribution Log / Point History. This data is immutable (append-only, cannot be edited or deleted). |
| **BR-45** | The Leaderboard is calculated on a Monthly basis. Points are automatically aggregated based on the selected filtering timeframe. |
| **BR-46** | Club members are permitted to view details of all Active Point Rules of the Club to understand contribution point accumulation criteria. |
| **BR-47** | Each PointRule defines: awarded points, maximum limit per event (limit_per_event), and maximum limit per day (limit_per_day). |
| **BR-48** | Activating or Deactivating a Point Rule only takes effect on actions occurring after the time of change. |
| **BR-49** | Only the President has the authority to create, update, or activate/deactivate Point Rules. |
| **BR-50** | Students can only redeem a reward when their current reward points meet or exceed the required cost (Current_Reward_Points >= Reward_Point_Cost). |
| **BR-51** | Reward redemption is only successful if physical stock in inventory (Available_Quantity) > 0. When out of stock, the redemption button is disabled. |
| **BR-52** | Immediately upon creating a Redeem Request, redemption points are locked/temporarily deducted from the student's account to prevent duplicate redemptions. |
| **BR-53** | The President configures reward details (Name, Image, Stock, Point Cost) and has the right to hide rewards from the redemption catalog. |
| **BR-54** | The President reviews and approves redemption requests, issuing a Claim Code / QR Voucher for the student to collect the reward in person. |
| **BR-55** | If a redemption request is rejected due to actual out-of-stock conditions, the system automatically refunds 100% of the temporarily deducted points to the student's account. |
| **BR-56** | The Secretary and President have the authority to create, edit, and delete internal meetings/activities on the Activity Calendar. |
| **BR-57** | Details of internal meetings and club activities are visible only to Active Members of that Club. |
| **BR-58** | A club may only send a joint invitation to a student who is not a current active member of the club and has no pending invitation from that club. |
| **BR-59** | Joint invitations have an expiration period (default: 3 days) and automatically transition to "Expired" if the student does not respond in time. |
| **BR-60** | The President and Secretary has the authority to revoke/cancel an invitation before the student responds. |
| **BR-61** | When a student clicks "Accept", the system immediately adds them to the official Member roster and marks the invitation as "Accepted". |
| **BR-62** | Each member can vote only once per Poll. |
| **BR-63** | Members can only vote when the Poll is in "Active" status and the current time is within [Poll_Start, Poll_End]. Closed polls cannot accept further votes. |
| **BR-64** | The President and Secretary have the authority to create, edit details, or close a poll early. |
| **BR-65** | Poll results can be configured as: "Allow viewing immediately after voting". |
| **BR-66** | Fee payment status transitions to "Success" upon verification from the online payment gateway. |
| **BR-67** | When creating a transaction, the system requires the transaction amount, title, description, transaction date, and transaction type. The transaction type must be either income or expense. |
| **BR-68** | Expense transactions created by the Treasurer that exceed the established threshold strictly require approval from the President. |
| **BR-69** | Completed financial transactions cannot have their amounts edited. Any discrepancies must be handled via Adjustment Transactions. |
| **BR-70** | Only the President, Treasurer have permission to access the Financial Dashboard and export financial reports (Excel/PDF). |
| **BR-71** | A club cannot operate without a President. Therefore, direct demotion of the active President is not allowed. Appointing a new President is mandatory to replace the current one. |
