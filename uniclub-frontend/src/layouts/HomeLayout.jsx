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
  canManageEvents = false,
  canViewFees = false,
  canManageFinance = false,
}) {
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [showScrollTop, setShowScrollTop] = useState(false)
  const userMenuRef = useRef(null)
  const mainRef = useRef(null)
  const userName = currentUser?.fullName || 'User'
  const userInitial = currentUser?.avatarInitial || userName.slice(0, 1).toUpperCase()
  const avatarStyle = currentUser?.avatarUrl
    ? { backgroundImage: `url(${currentUser.avatarUrl})` }
    : undefined

  useEffect(() => {
    const handleScroll = () => {
      if (mainRef.current) {
        setShowScrollTop(mainRef.current.scrollTop > 300)
      }
    }

    const container = mainRef.current
    if (container) {
      container.addEventListener('scroll', handleScroll)
    }

    return () => {
      if (container) {
        container.removeEventListener('scroll', handleScroll)
      }
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
      <HomeSidebar activeItem={activeItem} onNavigate={onNavigate} onLogout={onLogout} />
      <div ref={mainRef} className={`home-shell__main home-shell__main--${pageId}`}>
        <div className="home-layout-topbar-container">
          <header className="home-topbar">
            <button
              type="button"
              className="home-topbar__brand"
              onClick={() => onNavigate?.('home')}
            >
              <img src={fptUniversityLogo} alt="FPT University" className="home-topbar__brand-logo" />
              <span>UniClub</span>
            </button>

            <div className="home-topbar__center">
              {activeItem !== 'clubs' && activeItem !== 'events' && pageId !== 'profile' && pageId !== 'create-club' && (
                <div className="home-search">
                  <span className="home-search__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="11" cy="11" r="7" />
                      <path d="M20 20l-3-3" strokeLinecap="round" />
                    </svg>
                  </span>
                  <input type="search" placeholder="Tìm kiếm tại đây" aria-label="Tìm kiếm" />
                </div>
              )}
            </div>

            <div className="home-topbar__actions">
              <div className="home-user-wrap">
                <div
                  ref={userMenuRef}
                  className="home-user-menu"
                  onClick={() => setUserMenuOpen((prev) => !prev)}
                >
                  <span className="home-user-menu__avatar" style={avatarStyle} aria-hidden="true">
                    {currentUser?.avatarUrl ? null : userInitial}
                  </span>
                  <span className="home-user-menu__name">{userName}</span>
                  <button
                    type="button"
                    className="home-user-menu__caret-btn"
                    aria-label="Mở menu tài khoản"
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

        {pageId === 'club-detail' ||
        pageId === 'club-ranking' ||
        pageId === 'member-approval' ||
        pageId === 'join-form' ||
        pageId === 'manage-events' ||
        pageId === 'attendance' ||
        pageId === 'fees' ||
        pageId === 'finance' ||
        pageId === 'point-rules' ||
        pageId === 'rewards' ||
        pageId === 'activity-schedule' ? (
          <>
            <div className="home-bottom-dock-spacer" aria-hidden="true" />
            <HomeBottomDock
              pageId={pageId}
              onNavigate={onNavigate}
              canManageMembers={canManageMembers}
              canManageEvents={canManageEvents}
              canViewFees={canViewFees}
              canManageFinance={canManageFinance}
            />
          </>
        ) : null}

        <HomeFooter
          onCreateClub={() => onNavigate?.('create-club')}
          onViewAll={onNavigate}
        />

        {showScrollTop && (
          <button
            type="button"
            className="scroll-to-top-btn"
            onClick={handleScrollTop}
            aria-label="Cuộn lên đầu trang"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
              <polyline points="18 15 12 9 6 15" />
            </svg>
          </button>
        )}
      </div>
    </div>
  )
}

export default HomeLayout
