function UniversityIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <path d="M12 2 3 6.5v2h18v-2L12 2Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10v8M9 10v8M15 10v8M19 10v8" strokeLinecap="round" />
      <path d="M3 22h18M4 18h16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const NAV_ITEMS = [
  {
    id: 'clubs',
    label: 'Clubs',
    icon: <UniversityIcon />,
  },
  {
    id: 'events',
    label: 'Events',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
        <rect x="3" y="4" width="18" height="18" rx="2" />
        <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
        <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" strokeLinecap="round" />
      </svg>
    ),
  },
]

const logoutIcon = (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" />
    <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
)

function HomeSidebar({ activeItem, onNavigate, onLogout }) {
  return (
    <aside className="home-sidebar" aria-label="Main navigation">
      <div className="home-sidebar__top">
        <button type="button" className="home-sidebar__menu" aria-label="Open menu">
          <span className="home-sidebar__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </span>
        </button>
      </div>

      <nav className="home-sidebar__nav">
        <ul className="home-sidebar__list">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`home-sidebar__link${activeItem === item.id ? ' is-active' : ''}`}
                onClick={() => onNavigate?.(item.id)}
                title={item.label}
              >
                <span className="home-sidebar__icon">{item.icon}</span>
                <span className="home-sidebar__label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="home-sidebar__footer">
        <button
          type="button"
          className="home-sidebar__link home-sidebar__link--logout"
          onClick={onLogout}
          title="Logout"
        >
          <span className="home-sidebar__icon">{logoutIcon}</span>
          <span className="home-sidebar__label">Logout</span>
        </button>
      </div>
    </aside>
  )
}

export default HomeSidebar
