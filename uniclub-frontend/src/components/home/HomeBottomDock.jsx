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
      </svg>
    ),
  },
  {
    id: 'rewards',
    label: 'Rewards',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
        <path d="M7 11V7a5 5 0 0 1 10 0v4" />
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
]

function HomeBottomDock({
  pageId,
  onNavigate,
  canManageMembers = false,
  canManageEvents = false,
}) {
  const visibleDockItems = dockItems.filter((item) => {
    if (item.access === 'member-management') return canManageMembers
    if (item.access === 'event-management') return canManageEvents
    return true
  })

  function handleClick(itemId) {
    if (itemId === 'overview') {
      onNavigate?.('club-detail')
    } else if (itemId === 'ranking') {
      onNavigate?.('club-ranking')
    } else if (itemId === 'member-approval') {
      onNavigate?.('member-approval')
    } else if (itemId === 'join-form') {
      onNavigate?.('join-form')
    } else if (itemId === 'manage-events') {
      onNavigate?.('manage-events')
    } else if (itemId === 'attendance') {
      onNavigate?.('attendance')
    } else if (itemId === 'rewards') {
      onNavigate?.('rewards')
    }
  }

  function isActive(itemId) {
    if (itemId === 'overview') return pageId === 'club-detail'
    if (itemId === 'ranking') return pageId === 'club-ranking'
    if (itemId === 'member-approval') return pageId === 'member-approval'
    if (itemId === 'join-form') return pageId === 'join-form'
    if (itemId === 'manage-events') return pageId === 'manage-events'
    if (itemId === 'attendance') return pageId === 'attendance'
    if (itemId === 'rewards') return pageId === 'rewards'
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
