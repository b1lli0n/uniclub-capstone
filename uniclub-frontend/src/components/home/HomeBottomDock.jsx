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