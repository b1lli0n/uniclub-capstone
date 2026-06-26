// Central FE mock data.
// When BE APIs are ready, replace these exports with API response mapping or remove the import in each UI.

// Current user data
export const CURRENT_USER = {
  id: 'user-001',
  fullName: 'Hà Văn Sơn',
  email: 'son.ha@uniclub.edu.vn',
  phone: '',
  gender: 'other',
  birthDate: '',
  avatarUrl: '',
  avatarInitial: 'S',
  role: 'UniClub member',
}

// Home screen carousel data
// BE can return logoUrl for the card media area.
// Optional logoFit: 'cover' fills the top area, 'contain' keeps the full logo visible.
export const HOME_CLUB_ITEMS = [
  {
    id: 'club-creative',
    badge: 'Featured',
    title: 'UniClub Creative Club',
    logoText: 'UC',
    description:
      'Join workshops, meet new friends, and take part in team-building activities for active students.',
  },
  {
    id: 'club-music',
    title: 'Music Club',
    logoText: 'MC',
    description: 'Perform, join jam sessions, and learn instruments with members who love music.',
  },
  {
    id: 'club-code',
    title: 'Coding Club',
    logoText: 'CC',
    description: 'Hackathons, code mentoring, and technology projects for IT students.',
  },
  {
    id: 'club-sport',
    title: 'Sports Club',
    logoText: 'SC',
    description: 'Football, badminton, running, and monthly internal tournaments.',
  },
  {
    id: 'club-book',
    title: 'Book Club',
    logoText: 'BC',
    description: 'Read books, share reviews, and meet guest authors in friendly discussions.',
  },
  {
    id: 'club-culture',
    title: 'Culture Club',
    logoText: 'CC',
    description: 'Explore culture, art, and diverse hands-on experiences across campus.',
  },
]

export const HOME_EVENT_ITEMS = [
  {
    id: 'event-workshop',
    badge: 'Upcoming',
    title: 'Team-building Workshop',
    logoText: 'TW',
    description: 'A club bonding activity for members. Registration closes on June 15.',
  },
  {
    id: 'event-meetup',
    title: 'Student Meetup',
    logoText: 'SM',
    description: 'A networking session for students from clubs across the university.',
  },
  {
    id: 'event-sport',
    title: 'Summer Sports Tournament',
    logoText: 'ST',
    description: 'Volleyball, badminton, and team competitions for campus groups.',
  },
  {
    id: 'event-volunteer',
    title: 'Volunteer Day',
    logoText: 'VD',
    description: 'A community service program organized by UniClub.',
  },
  {
    id: 'event-hackathon',
    title: 'UniClub Hackathon',
    logoText: 'UH',
    description: '48 hours of coding and idea pitching with mentors from industry.',
  },
  {
    id: 'event-concert',
    title: 'Club Music Night',
    logoText: 'MN',
    description: 'Acoustic performances and a weekend mini concert.',
  },
]

// Club list and club detail data
export const CLUB_FILTER_CATEGORIES = [
  { id: 'all', label: 'All', icon: '*' },
  { id: 'academic', label: 'Academic', icon: 'A' },
  { id: 'sport', label: 'Sports', icon: 'S' },
  { id: 'art', label: 'Arts', icon: 'R' },
  { id: 'event', label: 'Events', icon: 'E' },
]

export const CLUB_SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'members-desc', label: 'Most members' },
  { value: 'events-desc', label: 'Most events' },
]

export const ALL_CLUBS = [
  {
    id: 'basketball',
    name: 'Basketball Club',
    description: 'A club for students who enjoy basketball training, friendly matches, and team play.',
    category: 'sport',
    categoryLabel: 'SPORTS',
    members: 5,
    events: 1,
    gradient: 'linear-gradient(135deg, #ffce96 0%, #f5b87a 100%)',
  },
  {
    id: 'startup',
    name: 'Startup Club',
    description: 'Explore entrepreneurship, pitch ideas, and build early-stage student projects.',
    category: 'academic',
    categoryLabel: 'ACADEMIC',
    members: 10,
    events: 4,
    gradient: 'linear-gradient(135deg, #ffe6c9 0%, #ffce96 100%)',
  },
  {
    id: 'music',
    name: 'Music Club',
    description: 'Perform, jam, and learn music with students who share the same passion.',
    category: 'art',
    categoryLabel: 'ARTS',
    members: 8,
    events: 2,
    gradient: 'linear-gradient(135deg, #fff8f2 0%, #ffce96 100%)',
  },
  {
    id: 'dance',
    name: 'Dance Club',
    description: 'Practice choreography, join showcases, and explore different dance styles.',
    category: 'art',
    categoryLabel: 'ARTS',
    members: 6,
    events: 1,
    gradient: 'linear-gradient(135deg, #ffce96 0%, #ffe6c9 100%)',
  },
  {
    id: 'volunteer',
    name: 'Volunteer Club',
    description: 'Join community service projects and make a positive impact beyond campus.',
    category: 'event',
    categoryLabel: 'EVENTS',
    members: 12,
    events: 5,
    gradient: 'linear-gradient(135deg, #f5b87a 0%, #ffce96 100%)',
  },
  {
    id: 'debate',
    name: 'Debate Club',
    description: 'Practice public speaking, critical thinking, and structured debate skills.',
    category: 'academic',
    categoryLabel: 'ACADEMIC',
    members: 7,
    events: 3,
    gradient: 'linear-gradient(135deg, #ffe6c9 0%, #f5b87a 100%)',
  },
  {
    id: 'chess',
    name: 'Chess Club',
    description: 'Play chess, study strategy, and compete in friendly internal tournaments.',
    category: 'academic',
    categoryLabel: 'ACADEMIC',
    members: 4,
    events: 1,
    gradient: 'linear-gradient(135deg, #fff8f2 0%, #ffe6c9 100%)',
  },
  {
    id: 'gaming',
    name: 'Gaming Club',
    description: 'Connect with students through esports, game nights, and gaming discussions.',
    category: 'sport',
    categoryLabel: 'SPORTS',
    members: 15,
    events: 6,
    gradient: 'linear-gradient(135deg, #ffce96 0%, #ff8e0b 100%)',
  },
  {
    id: 'photography',
    name: 'Photography Club',
    description: 'Learn photography, join campus photo walks, and share visual stories.',
    category: 'art',
    categoryLabel: 'ARTS',
    members: 9,
    events: 2,
    gradient: 'linear-gradient(135deg, #ffe6c9 0%, #fff8f2 100%)',
  },
  {
    id: 'environment',
    name: 'Environmental Club',
    description: 'Promote sustainability through green campaigns and environmental projects.',
    category: 'academic',
    categoryLabel: 'ACADEMIC',
    members: 11,
    events: 3,
    gradient: 'linear-gradient(135deg, #f5b87a 0%, #ffe6c9 100%)',
  },
  {
    id: 'coding',
    name: 'Coding Club',
    description: 'Hackathons, code mentoring, and technology projects for IT students.',
    category: 'academic',
    categoryLabel: 'ACADEMIC',
    members: 18,
    events: 7,
    gradient: 'linear-gradient(135deg, #ffce96 0%, #3d2e24 40%, #ffce96 100%)',
  },
  {
    id: 'fashion',
    name: 'Fashion Club',
    description: 'Explore styling, design, campus fashion shows, and creative self-expression.',
    category: 'art',
    categoryLabel: 'ARTS',
    members: 6,
    events: 2,
    gradient: 'linear-gradient(135deg, #fff8f2 0%, #ffce96 100%)',
  },
  {
    id: 'football',
    name: 'Football Club',
    description: 'Football training, team matches, and monthly campus sports activities.',
    category: 'sport',
    categoryLabel: 'SPORTS',
    members: 14,
    events: 4,
    gradient: 'linear-gradient(135deg, #ff8e0b 0%, #ffce96 100%)',
  },
  {
    id: 'film',
    name: 'Film Club',
    description: 'Watch, discuss, and create short films with students who love cinema.',
    category: 'art',
    categoryLabel: 'ARTS',
    members: 5,
    events: 1,
    gradient: 'linear-gradient(135deg, #ffe6c9 0%, #ffce96 100%)',
  },
  {
    id: 'community',
    name: 'Community Club',
    description: 'Build friendships through social activities, community projects, and campus events.',
    category: 'event',
    categoryLabel: 'EVENTS',
    members: 8,
    events: 3,
    gradient: 'linear-gradient(135deg, #ffce96 0%, #ffe6c9 100%)',
  },
]

export const CLUBS_PER_PAGE = 12

// My Clubs data.
// BE note: replace this membership list with the clubs/roles returned for CURRENT_USER.
// The UI consumes MY_CLUB_ITEMS so joined clubs stay separate from the full public club list.
export const MY_CLUB_MEMBERSHIPS = [
  { clubId: 'basketball', role: 'Leader', joinedDate: '26/3/2026' },
  { clubId: 'startup', role: 'Member', joinedDate: '26/3/2026' },
  { clubId: 'music', role: 'Secretary', joinedDate: '26/3/2026' },
  { clubId: 'dance', role: 'Member', joinedDate: '26/3/2026' },
  { clubId: 'volunteer', role: 'Treasurer', joinedDate: '26/3/2026' },
  { clubId: 'debate', role: 'Vice leader', joinedDate: '26/3/2026' },
]

export const MY_CLUB_ITEMS = MY_CLUB_MEMBERSHIPS
  .map((membership) => {
    const club = ALL_CLUBS.find((item) => item.id === membership.clubId)
    if (!club) return null

    return {
      ...club,
      membershipRole: membership.role,
      joinedDate: membership.joinedDate,
    }
  })
  .filter(Boolean)

export const CLUB_DETAIL_COPY = {
  slogan: 'Connect passion, ideas, and student experiences.',
  descriptionSuffix:
    'The club creates a space for students to learn, share experience, and organize meaningful activities together.',
}

export const CLUB_EVENTS = [
  {
    id: 'orientation',
    title: 'Member Meetup',
    description: 'Introduce the club, activity schedule, and member groups for this semester.',
    meta: '20/06 - Room A101',
    tag: 'Open',
  },
  {
    id: 'workshop',
    title: 'Skill Workshop',
    description: 'Practice in groups with mentors, suitable for both new and core members.',
    meta: '27/06 - Creative Lab',
    tag: 'Upcoming',
  },
  {
    id: 'showcase',
    title: 'Project Showcase',
    description: 'Present activity outcomes, exchange ideas, and receive feedback from other clubs.',
    meta: '05/07 - Hall B',
    tag: 'Featured',
  },
]

export const CLUB_MEMBERS = [
  { id: 'm1', name: 'Mai Thi An', role: 'Leader', tone: '#6b8a9a' },
  { id: 'm2', name: 'Hoang Van Son', role: 'Mentor', tone: '#3d2e24' },
  { id: 'm3', name: 'Pham Thi Tam', role: 'Member', tone: '#ff8e0b' },
  { id: 'm4', name: 'Nguyen Viet Quy', role: 'Secretary', tone: '#f5b87a' },
  { id: 'm5', name: 'Cao Thi H', role: 'Vice leader', tone: '#7b8fa4' },
  { id: 'm6', name: 'Chu Thi Nhi', role: 'Treasurer', tone: '#c9714d' },
  { id: 'm7', name: 'Nong Van Son', role: 'Member', tone: '#8f6f4e' },
]

export const JOIN_FORM_QUESTIONS = [
  { id: 'question-1', label: 'Question 1', placeholder: 'Type your answer...' },
  { id: 'question-2', label: 'Question 2', placeholder: 'Type your answer...' },
]

// Event list data
export const EVENT_CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'workshop', label: 'Workshops' },
  { id: 'sport', label: 'Sports' },
  { id: 'entertainment', label: 'Entertainment' },
  { id: 'community', label: 'Community' },
]

export const EVENT_SORT_OPTIONS = [
  { value: 'default', label: 'Default' },
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'participants-desc', label: 'Most participants' },
]

export const ALL_EVENTS = [
  {
    id: 'event-workshop',
    name: 'Team-building Workshop',
    description: 'A club bonding activity focused on soft skills, teamwork, and collaboration.',
    category: 'workshop',
    categoryLabel: 'WORKSHOP',
    participants: 45,
    date: '15/06/2026',
    gradient: 'linear-gradient(135deg, #ffe6c9 0%, #ffce96 100%)',
  },
  {
    id: 'event-meetup',
    name: 'Student Networking Meetup',
    description: 'A networking session where students and clubs share experiences across campus.',
    category: 'community',
    categoryLabel: 'COMMUNITY',
    participants: 80,
    date: '20/06/2026',
    gradient: 'linear-gradient(135deg, #fff8f2 0%, #ffe6c9 100%)',
  },
  {
    id: 'event-sport',
    name: 'Summer Sports Tournament',
    description: 'Volleyball, badminton, and exciting team competitions for students.',
    category: 'sport',
    categoryLabel: 'SPORTS',
    participants: 120,
    date: '25/06/2026',
    gradient: 'linear-gradient(135deg, #ffce96 0%, #ff8e0b 100%)',
  },
  {
    id: 'event-volunteer',
    name: 'Volunteer Day',
    description: 'A community service and donation program supporting a greener environment.',
    category: 'community',
    categoryLabel: 'COMMUNITY',
    participants: 150,
    date: '02/07/2026',
    gradient: 'linear-gradient(135deg, #f5b87a 0%, #ffce96 100%)',
  },
  {
    id: 'event-hackathon',
    name: 'Hackathon UniClub 2026',
    description: 'A 48-hour coding and pitching challenge with mentors and technology experts.',
    category: 'workshop',
    categoryLabel: 'WORKSHOP',
    participants: 60,
    date: '10/07/2026',
    gradient: 'linear-gradient(135deg, #ffe6c9 0%, #f5b87a 100%)',
  },
  {
    id: 'event-concert',
    name: 'Acoustic Music Night',
    description: 'An intimate student music performance and exchange with campus bands.',
    category: 'entertainment',
    categoryLabel: 'ENTERTAINMENT',
    participants: 200,
    date: '18/07/2026',
    gradient: 'linear-gradient(135deg, #fff8f2 0%, #ffce96 100%)',
  },
  {
    id: 'event-boardgame',
    name: 'Board Game Tournament',
    description: 'A strategy game day featuring Werewolf, Avalon, Catan, and more.',
    category: 'entertainment',
    categoryLabel: 'ENTERTAINMENT',
    participants: 40,
    date: '22/07/2026',
    gradient: 'linear-gradient(135deg, #ffe6c9 0%, #ffce96 100%)',
  },
  {
    id: 'event-talkshow',
    name: 'Career Orientation Talkshow',
    description: 'Meet successful alumni and learn practical career development paths.',
    category: 'workshop',
    categoryLabel: 'WORKSHOP',
    participants: 90,
    date: '28/07/2026',
    gradient: 'linear-gradient(135deg, #fff8f2 0%, #ffe6c9 100%)',
  },
]

export const EVENTS_PER_PAGE = 12

// Create club form options
export const CREATE_CLUB_CATEGORIES = [
  { value: '', label: 'Select category...' },
  { value: 'tech', label: 'Technology' },
  { value: 'sport', label: 'Sports' },
  { value: 'art', label: 'Arts' },
  { value: 'volunteer', label: 'Volunteer' },
  { value: 'academic', label: 'Academic' },
  { value: 'other', label: 'Other' },
]

export const AVAILABLE_MEMBERS = [
  { value: '', label: 'Select member...' },
  { value: '1', label: 'Nguyen Van A' },
  { value: '2', label: 'Tran Thi B' },
  { value: '3', label: 'Le Van C' },
  { value: '4', label: 'Pham Thi D' },
]

// My requests screen data
export const MY_REQUEST_TABS = [
  { id: 'sent', label: 'Sent Requests', count: 3 },
  { id: 'received', label: 'Received Invitations', count: 0 },
]

export const REQUEST_STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
]

export const MY_REQUEST_ITEMS = [
  {
    id: 'delta',
    requestId: '6a2a376134085db028785243',
    club: 'CLB Poll Test Delta',
    category: 'Events',
    sentDate: '11/6/2026',
    sentTime: '11:19:45',
    status: 'Pending',
    type: 'Join request',
    content: 'I would like to join this club.',
    sender: 'Trinh',
    responder: 'Not assigned',
    responseTime: 'No response yet',
  },
  {
    id: 'gamma',
    requestId: '6a2a376134085db028785244',
    club: 'CLB Poll Test Gamma',
    category: 'Sports',
    sentDate: '11/6/2026',
    sentTime: '10:42:12',
    status: 'Pending',
    type: 'Join request',
    content: 'I would like to join this club.',
    sender: 'Trinh',
    responder: 'Not assigned',
    responseTime: 'No response yet',
  },
  {
    id: 'beta',
    requestId: '6a2a376134085db028785245',
    club: 'CLB Poll Test Beta',
    category: 'Arts',
    sentDate: '10/6/2026',
    sentTime: '09:05:33',
    status: 'Pending',
    type: 'Join request',
    content: 'I would like to join this club.',
    sender: 'Trinh',
    responder: 'Not assigned',
    responseTime: 'No response yet',
  },
]

// Club ranking data
export const CLUB_RANKING_PERIOD_OPTIONS = [
  { value: '2026-03', label: 'March 2026' },
  { value: '2026-04', label: 'April 2026' },
  { value: '2026-05', label: 'May 2026' },
  { value: '2026-06', label: 'June 2026' },
]

export const CLUB_RANKING_PERIOD = CLUB_RANKING_PERIOD_OPTIONS[0].label

export const RANKING_MEMBERS = [
  { id: 'm1', name: 'Mac Thi Ro', achievements: 12, contribution: 860, tone: '#6b8a9a' },
  { id: 'm2', name: 'Nguyen Van A', achievements: 9, contribution: 720, tone: '#ff8e0b' },
  { id: 'm3', name: 'Nong Van Son', achievements: 8, contribution: 690, tone: '#3d2e24' },
  { id: 'm4', name: 'Phan Thi Tam', achievements: 6, contribution: 530, tone: '#f5b87a' },
  { id: 'm5', name: 'Pham Huong D', achievements: 4, contribution: 420, tone: '#7d6ad8' },
  { id: 'm6', name: 'Hoang Van Son', achievements: 3, contribution: 360, tone: '#6b8a9a' },
]

// Admin screen data
export const ADMIN_NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: 'dashboard' },
  { id: 'registrations', label: 'Registrations', icon: 'registrations' },
  { id: 'clubs', label: 'Club Management', icon: 'clubs' },
  { id: 'rewards', label: 'Rewards', icon: 'rewards' },
  { id: 'badges', label: 'Badges', icon: 'badges' },
  { id: 'notifications', label: 'Notifications', icon: 'notifications' },
]

const ADMIN_MEMBER_POOL = [
  { name: 'Pham Huong D', email: 'phamhuongd@fpt.edu.vn', role: 'Leader' },
  { name: 'Cao Thi H', email: 'caothih@fpt.edu.vn', role: 'Vice leader' },
  { name: 'Ta Van Manh', email: 'tavanmanh@fpt.edu.vn', role: 'Secretary' },
  { name: 'Chu Thi Nhi', email: 'chuthinhi@fpt.edu.vn', role: 'Treasurer' },
  { name: 'Hoang Van G', email: 'hoangvang@fpt.edu.vn', role: 'Member' },
  { name: 'Ha Van On', email: 'havanon@fpt.edu.vn', role: 'Member' },
  { name: 'Nguyen Van A', email: 'nguyenvana@fpt.edu.vn', role: 'Member' },
  { name: 'Mac Thi Ro', email: 'macthiro@fpt.edu.vn', role: 'Member' },
  { name: 'Nong Van Son', email: 'nongvanson@fpt.edu.vn', role: 'Member' },
  { name: 'Phan Thi Tam', email: 'phanthitam@fpt.edu.vn', role: 'Member' },
  { name: 'Hoang Van Son', email: 'hoangvanson@fpt.edu.vn', role: 'Member' },
  { name: 'Mai Thi An', email: 'maithian@fpt.edu.vn', role: 'Member' },
  { name: 'Do Minh Khoa', email: 'dominhkhoa@fpt.edu.vn', role: 'Member' },
  { name: 'Le Bao Tran', email: 'lebaotran@fpt.edu.vn', role: 'Member' },
  { name: 'Tran Quoc Bao', email: 'tranquocbao@fpt.edu.vn', role: 'Member' },
  { name: 'Dang Minh Anh', email: 'dangminhanh@fpt.edu.vn', role: 'Member' },
  { name: 'Bui Gia Han', email: 'buigiahan@fpt.edu.vn', role: 'Member' },
  { name: 'Vo Thanh Dat', email: 'vothanhdat@fpt.edu.vn', role: 'Member' },
]

export const ADMIN_ACTIVE_CLUBS = ALL_CLUBS.slice(0, 10).map((club, index) => ({
  id: club.id,
  clubName: club.name,
  leader: [
    'Pham Huong D',
    'Cao Thi H',
    'Ta Van Manh',
    'Chu Thi Nhi',
    'Hoang Van G',
    'Nguyen Van A',
    'Mac Thi Ro',
    'Nong Van Son',
    'Phan Thi Tam',
    'Hoang Van Son',
  ][index] || 'Unknown',
  members: club.members,
  events: club.events,
  status: 'active',
  category: club.categoryLabel,
  createdAt: Date.UTC(2026, 2, 26 - index),
  createdDate: `${26 - index}/3/2026`,
  description: club.description,
  memberList: ADMIN_MEMBER_POOL.slice(0, club.members).map((member, memberIndex) => ({
    id: `${club.id}-member-${memberIndex + 1}`,
    ...member,
    joinDate: `${26 - index}/3/2026`,
  })),
  logoText: club.logoText || club.name.split(' ').map((word) => word[0]).join('').slice(0, 2),
}))

export const ADMIN_REGISTRATION_REQUESTS = [
  {
    id: 'REQ-ENV-260326',
    clubName: 'Environmental Club',
    sender: 'Unknown',
    leader: 'Nguyen Van A',
    sentDate: '26/3/2026',
    status: 'pending',
    category: 'Events',
    memberCount: 0,
    description: 'Create a green community for environmental activities and student awareness campaigns.',
    logoText: 'EC',
    logoUrl: '',
  },
  {
    id: 'REQ-GAM-260326',
    clubName: 'Gaming Club',
    sender: 'Unknown',
    leader: 'Mac Thi Ro',
    sentDate: '26/3/2026',
    status: 'pending',
    category: 'Sports',
    memberCount: 0,
    description: 'Create a club for campus gaming activities, esports practice, and friendly tournaments.',
    logoText: 'GC',
    logoUrl: '',
  },
  {
    id: 'REQ-SCI-260326',
    clubName: 'Science Club',
    sender: 'Unknown',
    leader: 'Pham Huong D',
    sentDate: '24/3/2026',
    status: 'approved',
    category: 'Academic',
    memberCount: 0,
    description: 'Create a science club for research sharing, experiments, and academic discussion.',
    logoText: 'SC',
    logoUrl: '',
  },
  {
    id: 'REQ-DAN-260326',
    clubName: 'Dance Club',
    sender: 'Unknown',
    leader: 'Cao Thi H',
    sentDate: '23/3/2026',
    status: 'rejected',
    category: 'Arts',
    memberCount: 0,
    description: 'Create a dance club for choreography practice, showcases, and campus performances.',
    logoText: 'DC',
    logoUrl: '',
  },
  {
    id: 'REQ-ENG-260326',
    clubName: 'English Club',
    sender: 'Unknown',
    leader: 'Ta Van Manh',
    sentDate: '22/3/2026',
    status: 'pending',
    category: 'Academic',
    memberCount: 0,
    description: 'Create an English club for communication practice, language exchange, and speaking workshops.',
    logoText: 'EC',
    logoUrl: '',
  },
]
