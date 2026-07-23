const dockItems = [
  {
    id: 'overview',
    label: 'Overview',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <rect x="4" y="4" width="6" height="6" rx="1.4" />
        <rect x="14" y="4" width="6" height="6" rx="1.4" />
        <rect x="4" y="14" width="6" height="6" rx="1.4" />
        <rect x="14" y="14" width="6" height="6" rx="1.4" />
      </svg>
    ),
  },
  {
    id: 'ranking',
    label: 'Ranking',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <path d="M8 21h8M12 17v4" strokeLinecap="round" />
        <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" strokeLinejoin="round" />
        <path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 0-3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'point-rules',
    label: 'Point Rules',
    access: 'member',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <path d="M9 11l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M8 2v4M16 2v4M4 9h16" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'rewards',
    label: 'Rewards',
    access: 'member',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <path d="M20 12v8a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2v-8" strokeLinecap="round" />
        <path d="M2 8h20v4H2zM12 8v14M12 8H7a2.5 2.5 0 1 1 2.2-3.7L12 8Zm0 0h5a2.5 2.5 0 1 0-2.2-3.7L12 8Z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'activity-schedule',
    label: 'Schedule',
    access: 'member',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M8 2v4M16 2v4M3 10h18M8 14h3M8 18h6" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'manage-activity-schedule',
    label: 'Manage Schedule',
    access: 'schedule-management',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M8 2v4M16 2v4M3 10h18" strokeLinecap="round" />
        <path d="M8 14h4M8 18h6" strokeLinecap="round" />
        <path d="m16 14 1.5 1.5L21 12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'member-approval',
    label: 'Member Approval',
    access: 'member-management',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" />
        <circle cx="9" cy="7" r="4" />
        <path d="m17 11 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'invitations',
    label: 'Invitations',
    access: 'invitation-management',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <rect x="3" y="5" width="18" height="14" rx="2" />
        <path d="m4 7 8 6 8-6M16.5 3v4M14.5 5h4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'polls',
    label: 'Polls',
    access: 'poll-management',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <path d="M5 20V10M12 20V4M19 20v-7" strokeLinecap="round" />
        <path d="M3 20h18" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'join-form',
    label: 'Join Form',
    access: 'member-management',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <path d="M8 6h8M8 10h8M8 14h5" strokeLinecap="round" />
        <rect x="5" y="3" width="14" height="18" rx="2" />
        <path d="m15 18 1.5 1.5L20 16" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'manage-events',
    label: 'Manage Events',
    access: 'event-management',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <rect x="3" y="4" width="18" height="17" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
        <path d="M8 14h4M8 18h8" strokeLinecap="round" />
        <path d="m16 14 1.5 1.5L21 12" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'attendance',
    label: 'Attendance',
    access: 'event-management',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <path d="M9 11l2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="4" y="4" width="16" height="16" rx="3" />
        <path d="M8 2v4M16 2v4M4 9h16" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'fees',
    label: 'Fees',
    access: 'member',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <rect x="4" y="5" width="16" height="14" rx="2" />
        <path d="M4 9h16" strokeLinecap="round" />
        <path d="M8 14h3M15 14h1" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'finance',
    label: 'Finance',
    access: 'finance-management',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <path d="M4 19V5" strokeLinecap="round" />
        <path d="M4 19h16" strokeLinecap="round" />
        <path d="M8 15v-4M12 15V8M16 15v-6" strokeLinecap="round" />
        <path d="M7 6h10" strokeLinecap="round" />
      </svg>
    ),
  },
]

function HomeBottomDock({
  pageId,
  onNavigate,
  canManageMembers = false,
  canManageInvitations = false,
  canManageEvents = false,
  canViewFees = false,
  canManageFinance = false,
  canManageSchedule = false,
  canManagePolls = false,
}) {
  const visibleDockItems = dockItems.filter((item) => {
    if (item.access === 'member-management') return canManageMembers
    if (item.access === 'invitation-management') return canManageInvitations
    if (item.access === 'event-management') return canManageEvents
    if (item.access === 'schedule-management') return canManageSchedule
    if (item.access === 'member') return canViewFees
    if (item.access === 'finance-management') return canManageFinance
    if (item.access === 'poll-management') return canManagePolls
    return true
  })

  function handleClick(itemId) {
    if (itemId === 'overview') {
      onNavigate?.('club-detail')
    } else if (itemId === 'ranking') {
      onNavigate?.('club-ranking')
    } else if (itemId === 'point-rules') {
      onNavigate?.('point-rules')
    } else if (itemId === 'rewards') {
      onNavigate?.('rewards')
    } else if (itemId === 'activity-schedule') {
      onNavigate?.('activity-schedule')
    } else if (itemId === 'manage-activity-schedule') {
      onNavigate?.('manage-activity-schedule')
    } else if (itemId === 'member-approval') {
      onNavigate?.('member-approval')
    } else if (itemId === 'invitations') {
      onNavigate?.('invitations')
    } else if (itemId === 'polls') {
      onNavigate?.('polls')
    } else if (itemId === 'join-form') {
      onNavigate?.('join-form')
    } else if (itemId === 'manage-events') {
      onNavigate?.('manage-events')
    } else if (itemId === 'attendance') {
      onNavigate?.('attendance')
    } else if (itemId === 'fees') {
      onNavigate?.('fees')
    } else if (itemId === 'finance') {
      onNavigate?.('finance')
    }
  }

  function isActive(itemId) {
    if (itemId === 'overview') return pageId === 'club-detail'
    if (itemId === 'ranking') return pageId === 'club-ranking'
    if (itemId === 'point-rules') return pageId === 'point-rules'
    if (itemId === 'rewards') return pageId === 'rewards'
    if (itemId === 'activity-schedule') return pageId === 'activity-schedule'
    if (itemId === 'manage-activity-schedule') return pageId === 'manage-activity-schedule'
    if (itemId === 'member-approval') return pageId === 'member-approval'
    if (itemId === 'invitations') return pageId === 'invitations'
    if (itemId === 'polls') return pageId === 'polls'
    if (itemId === 'join-form') return pageId === 'join-form'
    if (itemId === 'manage-events') return pageId === 'manage-events'
    if (itemId === 'attendance') return pageId === 'attendance'
    if (itemId === 'fees') return pageId === 'fees'
    if (itemId === 'finance') return pageId === 'finance'
    return false
  }

  return (
    <nav className="home-bottom-dock" aria-label="Quick club navigation">
      {visibleDockItems.map((item) => (
        <button
          key={item.id}
          type="button"
          className={`home-bottom-dock__item${isActive(item.id) ? ' is-active' : ''}`}
          onClick={() => handleClick(item.id)}
        >
          <span className="home-bottom-dock__icon">{item.icon}</span>
          <span>{item.label}</span>
        </button>
      ))}
    </nav>
  )
}

export default HomeBottomDock
