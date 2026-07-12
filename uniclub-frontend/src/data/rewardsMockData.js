export const REWARDS = [
  { id: 'reward-coffee', title: 'Highlands Coffee Voucher', points: 200, type: 'Voucher', stock: 15, image: '☕', description: 'Discount 30.000 VND for any drink at Highlands Coffee.', club: 'IT Club', isVisible: true },
  { id: 'reward-hoodie', title: 'UniClub Exclusive Hoodie', points: 1200, type: 'Merchandise', stock: 5, image: '🧥', description: 'Limited edition hoodie embroidered with the UniClub logo.', club: 'UniClub', isVisible: true },
  { id: 'reward-cinema', title: 'Cinema Ticket (CGV)', points: 350, type: 'Ticket', stock: 8, image: '🎬', description: 'One 2D ticket valid at CGV cinemas nationwide.', club: 'Arts Club', isVisible: true },
  { id: 'reward-notebook', title: 'Club Notebook & Pen', points: 150, type: 'Stationery', stock: 30, image: '📓', description: 'A notebook and premium pen set with club branding.', club: 'Green Heart', isVisible: true },
]

export const REWARD_POINTS_BALANCE = 2450

export const INITIAL_REDEMPTION_HISTORY = [
  { id: 'redemption-1', date: '2026-06-20', member: 'Hà Văn Sơn', item: 'Highlands Coffee Voucher', points: 200, status: 'PENDING' },
  { id: 'redemption-2', date: '2026-06-12', member: 'Hà Văn Sơn', item: 'Club Notebook & Pen', points: 150, status: 'APPROVED' },
  { id: 'redemption-3', date: '2026-06-04', member: 'Hà Văn Sơn', item: 'Cinema Ticket (CGV)', points: 350, status: 'REJECTED' },
]

export const INITIAL_REDEMPTION_REQUESTS = [
  { id: 'request-1', date: '2026-06-20', member: 'Nguyễn Văn A', item: 'Highlands Coffee Voucher', points: 200 },
  { id: 'request-2', date: '2026-06-19', member: 'Lê Minh E', item: 'Cinema Ticket (CGV)', points: 350 },
  { id: 'request-3', date: '2026-06-18', member: 'Hoàng Thị F', item: 'UniClub Exclusive Hoodie', points: 1200 },
]
