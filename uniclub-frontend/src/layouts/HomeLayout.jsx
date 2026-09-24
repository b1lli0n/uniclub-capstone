import { useEffect, useRef, useState } from 'react'
import HomeSidebar from '../components/home/HomeSidebar'
import HomeBottomDock from '../components/home/HomeBottomDock'
import HomeFooter from '../components/home/HomeFooter'
import HomeUserMenuDropdown from '../components/home/HomeUserMenuDropdown'
import fptUniversityLogo from '../assets/Logo-Dai-hoc-FPT.webp'
import '../styles/home.css'

function HomeLayout({
  children,
  activeItem,
  pageId,
  onNavigate,
  onLogout,
  currentUser,
  canManageMembers = false,
  canManageInvitations = false,
  canManageEvents = false,
  canManageSchedule = false,
  canViewFees = false,
  canManagePolls = false,
  canManageFinance = false,
}) {
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const userMenuRef = useRef(null)
  const mainRef = useRef(null)
  const userName = currentUser?.fullName || 'User'
  const userInitial = currentUser?.avatarInitial || userName.slice(0, 1).toUpperCase()
  const avatarStyle = currentUser?.avatarUrl
    ? { backgroundImage: `url(${currentUser.avatarUrl})` }
    : undefined

  const handleNavigate = (target) => {
    setMobileSidebarOpen(false)
    onNavigate?.(target)
  }

  useEffect(() => {
    let rafId = null
    const handleScroll = () => {
      if (rafId) return
      rafId = requestAnimationFrame(() => {
        rafId = null
        if (mainRef.current) {
          setShowScrollTop(mainRef.current.scrollTop > 300)
        }
      })
    }

    const container = mainRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll, { passive: true })
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll)
      }
      if (rafId) cancelAnimationFrame(rafId)
    }
  }, [])

  const handleScrollTop = () => {
    if (mainRef.current) {
      mainRef.current.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }
  }

  return (
    <div className="home-shell">
      {mobileSidebarOpen && (
        <div
          className="home-sidebar-backdrop"
          onClick={() => setMobileSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <HomeSidebar
        activeItem={activeItem}
        onNavigate={handleNavigate}
        onLogout={onLogout}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() => setMobileSidebarOpen(false)}
      />

      <div ref={mainRef} className={`home-shell__main home-shell__main--${pageId}`}>
        <div className="home-layout-topbar-container">
          <header className="home-topbar">
            <div className="home-topbar__left">
              <button
                type="button"
                className="home-topbar__hamburger"
                aria-label="Toggle navigation menu"
                aria-expanded={mobileSidebarOpen}
                onClick={() => setMobileSidebarOpen((prev) => !prev)}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round">
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </svg>
              </button>

              <button
                type="button"
                className="home-topbar__brand"
                onClick={() => handleNavigate('home')}
              >
                <img
                  src={fptUniversityLogo}
                  alt="FPT University"
                  className="home-topbar__brand-logo"
                />
                <span>UniClub</span>
              </button>
            </div>


            <div className="home-topbar__actions">
              <div className="home-user-wrap">
                <div
                  ref={userMenuRef}
                  className="home-user-menu"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                >
                  <span
                    className="home-user-menu__avatar"
                    style={avatarStyle}
                    aria-hidden="true"
                  >
                    {currentUser?.avatarUrl ? null : userInitial}
                  </span>

                  <span className="home-user-menu__name">{userName}</span>

                  <button
                    type="button"
                    className="home-user-menu__caret-btn"
                    aria-label="Open account menu"
                    aria-expanded={userMenuOpen}
                    aria-haspopup="menu"
                    onClick={(event) => {
                      event.stopPropagation()
                      setUserMenuOpen((prev) => !prev)
                    }}
                  >
                    <span className="home-user-menu__caret" aria-hidden="true">
                      <svg viewBox="0 0 12 8" fill="currentColor">
                        <path d="M6 8L0 0h12L6 8z" />
                      </svg>
                    </span>
                  </button>
                </div>

                <HomeUserMenuDropdown
                  open={userMenuOpen}
                  onClose={() => setUserMenuOpen(false)}
                  anchorRef={userMenuRef}
                  onNavigate={onNavigate}
                />
              </div>
            </div>
          </header>
        </div>

        <div className="home-layout-content">
          {children}
        </div>

        {canViewFees && (
          pageId === 'club-detail' ||
          pageId === 'club-ranking' ||
          pageId === 'member-approval' ||
          pageId === 'invitations' ||
          pageId === 'polls' ||
          pageId === 'join-form' ||
          pageId === 'manage-events' ||
          pageId === 'attendance' ||
          pageId === 'point-rules' ||
          pageId === 'fees' ||
          pageId === 'finance' ||
          pageId === 'activity-schedule' ||
          pageId === 'manage-activity-schedule' ||
          pageId === 'rewards'
        ) ? (
          <>
            <div className="home-bottom-dock-spacer" aria-hidden="true" />

            <HomeBottomDock
              pageId={pageId}
              onNavigate={onNavigate}
              canManageMembers={canManageMembers}
              canManageInvitations={canManageInvitations}
              canManageEvents={canManageEvents}
              canManageSchedule={canManageSchedule}
              canViewFees={canViewFees}
              canManagePolls={canManagePolls}
              canManageFinance={canManageFinance}
            />
          </>
        ) : null}

        <HomeFooter
          onCreateClub={() => onNavigate?.('create-club')}
          onViewAll={onNavigate}
        />

        {showScrollTop ? (
          <button
            type="button"
            className="scroll-to-top-btn"
            onClick={handleScrollTop}
            aria-label="Scroll to top"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
        ) : null}
      </div>
    </div>
  )
}

export default HomeLayout
