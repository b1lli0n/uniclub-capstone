import React from 'react'
import {
  LandmarkIcon,
  CalendarIcon,
  LogOutIcon,
  MenuIcon,
  XIcon,
} from '../common/Icons'

const NAV_ITEMS = [
  {
    id: 'clubs',
    label: 'Clubs',
    icon: <LandmarkIcon size={24} />,
  },
  {
    id: 'events',
    label: 'Events',
    icon: <CalendarIcon size={24} />,
  },
]

const logoutIcon = <LogOutIcon size={24} />

function HomeSidebar({ activeItem, onNavigate, onLogout, mobileOpen = false, onCloseMobile }) {
  return (
    <aside
      className={`home-sidebar${mobileOpen ? ' is-mobile-open' : ''}`}
      aria-label="Main navigation"
    >
      <div className="home-sidebar__top">
        <button type="button" className="home-sidebar__menu" aria-label="Menu icon">
          <span className="home-sidebar__icon">
            <MenuIcon size={24} />
          </span>
        </button>

        {onCloseMobile && (
          <button
            type="button"
            className="home-sidebar__close-btn"
            onClick={onCloseMobile}
            aria-label="Close navigation menu"
          >
            <XIcon size={24} />
          </button>
        )}
      </div>

      <nav className="home-sidebar__nav">
        <ul className="home-sidebar__list">
          {NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`home-sidebar__link${activeItem === item.id ? ' is-active' : ''}`}
                onClick={() => {
                  onNavigate?.(item.id)
                  onCloseMobile?.()
                }}
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
          onClick={() => {
            onCloseMobile?.()
            onLogout?.()
          }}
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
