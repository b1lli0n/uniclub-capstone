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
        <path d="M7 6H4v2a3 3 0 0 0 3 3M17 6h3v2a3 3 0 0 1-3 3" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    id: 'points',
    label: 'Point Fund',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <rect x="5" y="4" width="14" height="16" rx="2" />
        <path d="M8 8h8M8 12h8M8 16h5" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    id: 'rewards',
    label: 'Rewards',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <path d="M20 12v8H4v-8" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M2 7h20v5H2z" strokeLinejoin="round" />
        <path d="M12 22V7" strokeLinecap="round" />
        <path d="M12 7H8.5A2.5 2.5 0 1 1 11 4.5L12 7Z" strokeLinejoin="round" />
        <path d="M12 7h3.5A2.5 2.5 0 1 0 13 4.5L12 7Z" strokeLinejoin="round" />
      </svg>
    ),
  },
]

function HomeBottomDock({ pageId, onNavigate }) {
  function handleClick(itemId) {
    if (itemId === 'overview') {
      onNavigate?.('club-detail')
    } else if (itemId === 'ranking') {
      onNavigate?.('club-ranking')
    }
  }

  function isActive(itemId) {
    if (itemId === 'overview') return pageId === 'club-detail'
    if (itemId === 'ranking') return pageId === 'club-ranking'
    return false
  }

  return (
    <nav className="home-bottom-dock" aria-label="Quick club navigation">
      {dockItems.map((item) => (
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
