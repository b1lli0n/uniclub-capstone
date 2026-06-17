import { useMemo, useRef, useState, useEffect } from 'react'
import '../../styles/home.css'
import '../../styles/admin-dashboard.css'
// Mock data import: replace with API data when BE is ready.
import { ADMIN_NAV_ITEMS, ADMIN_REGISTRATION_REQUESTS } from '../../data/mockData'
import fptUniversityLogo from '../../assets/Logo-Dai-hoc-FPT.webp'

const ADMIN_SORT_OPTIONS = [
  { value: 'newest', label: 'Newest date' },
  { value: 'oldest', label: 'Oldest date' },
  { value: 'pending', label: 'Status: Pending' },
  { value: 'approved', label: 'Status: Approved' },
  { value: 'rejected', label: 'Status: Rejected' },
]

const ADMIN_PAGE_SIZE = 10

function formatStatusLabel(status = '') {
  if (!status) return 'Pending'
  return `${status.charAt(0).toUpperCase()}${status.slice(1)}`
}

const adminIcons = {
  dashboard: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <path d="M4 13h7V4H4v9ZM13 20h7V4h-7v16ZM4 20h7v-5H4v5Z" strokeLinejoin="round" />
      </svg>
  ),
  registrations: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <path d="M8 6h13M8 12h13M8 18h13" strokeLinecap="round" />
        <path d="M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" />
      </svg>
  ),
  clubs: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <path d="M12 3 3 7.5v2h18v-2L12 3Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M5 10.5V18M9.5 10.5V18M14.5 10.5V18M19 10.5V18" strokeLinecap="round" />
        <path d="M4 18h16M3 21h18" strokeLinecap="round" />
      </svg>
  ),
  rewards: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <path d="M20 12v8H4v-8M3 8h18v4H3V8Z" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M12 8v12M12 8H8.5A2.5 2.5 0 1 1 11 5.5V8ZM12 8h3.5A2.5 2.5 0 1 0 13 5.5V8Z" strokeLinejoin="round" />
      </svg>
  ),
  badges: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 16.9l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" strokeLinejoin="round" />
      </svg>
  ),
  notifications: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
        <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M10 21h4" strokeLinecap="round" />
      </svg>
  ),
}

function AdminSidebar({ activeItem = 'registrations', onNavigate, onLogout }) {
  return (
    <aside className="home-sidebar admin-home-sidebar" aria-label="Admin navigation">
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
          {ADMIN_NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`home-sidebar__link${item.id === activeItem ? ' is-active' : ''}`}
                title={item.label}
                onClick={() => onNavigate?.(item.id)}
              >
                <span className="home-sidebar__icon">{adminIcons[item.icon]}</span>
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
          title="Logout"
          onClick={onLogout}
        >
          <span className="home-sidebar__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" />
              <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="home-sidebar__label">Logout</span>
        </button>
      </div>
    </aside>
  )
}

function AdminTopbar() {
  return (
    <div className="home-layout-topbar-container admin-topbar-wrap">
      <header className="home-topbar">
        <button type="button" className="home-topbar__brand admin-brand">
          <img src={fptUniversityLogo} alt="FPT University" className="home-topbar__brand-logo" />
          <span>UniClub</span>
        </button>

        <div className="home-topbar__center" />

        <div className="home-topbar__actions">
          <div className="home-user-menu">
            <span className="home-user-menu__avatar" aria-hidden="true" />
            <span className="home-user-menu__name">Admin</span>
            <span className="home-user-menu__caret" aria-hidden="true">
              <svg viewBox="0 0 12 8" fill="currentColor">
                <path d="M6 8L0 0h12L6 8z" />
              </svg>
            </span>
          </div>
        </div>
      </header>
    </div>
  )
}

function AdminDashboardPage({ onLogout }) {
  const [sortMenuOpen, setSortMenuOpen] = useState(false)
  const [sortMode, setSortMode] = useState('')
  const [searchQuery, setSearchQuery] = useState('')
  const [detailRequest, setDetailRequest] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const sortRef = useRef(null)
  const selectedSort = ADMIN_SORT_OPTIONS.find((option) => option.value === sortMode)
  const visibleRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    const requests = ADMIN_REGISTRATION_REQUESTS.filter((item) => {
      if (!query) return true

      return item.clubName.toLowerCase().includes(query)
    })
    const parseSentDate = (dateText) => {
      const [day, month, year] = dateText.split('/').map(Number)
      return new Date(year, month - 1, day).getTime()
    }

    if (!sortMode) {
      return requests
    }

    if (sortMode === 'oldest') {
      return requests.sort((a, b) => parseSentDate(a.sentDate) - parseSentDate(b.sentDate))
    }

    if (sortMode === 'newest') {
      return requests.sort((a, b) => parseSentDate(b.sentDate) - parseSentDate(a.sentDate))
    }

    return requests.filter((item) => item.status === sortMode)
  }, [searchQuery, sortMode])
  const pageCount = Math.max(1, Math.ceil(visibleRequests.length / ADMIN_PAGE_SIZE))
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * ADMIN_PAGE_SIZE
    return visibleRequests.slice(startIndex, startIndex + ADMIN_PAGE_SIZE)
  }, [currentPage, visibleRequests])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortMode])

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount)
    }
  }, [currentPage, pageCount])

  useEffect(() => {
    if (!sortMenuOpen) return undefined

    function handlePointerDown(event) {
      if (!sortRef.current?.contains(event.target)) {
        setSortMenuOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setSortMenuOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [sortMenuOpen])

  function handleAdminNavigate(itemId) {
    if (itemId === 'registrations') {
      setDetailRequest(null)
    }
  }

  return (
    <div className="home-shell admin-home-shell">
      <AdminSidebar activeItem="registrations" onNavigate={handleAdminNavigate} onLogout={onLogout} />
      <main className="home-shell__main admin-main">
        <AdminTopbar />

        <section className="admin-page">
          {detailRequest ? (
            <div className="admin-detail-card">
              <div className="admin-detail-header">
                <button
                  type="button"
                  className="admin-detail-back"
                  aria-label="Back to registration list"
                  onClick={() => setDetailRequest(null)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div>
                  <h2>Registration Details</h2>
                  <p>View detailed information about this club creation request.</p>
                </div>
              </div>

              <div className="admin-detail-panel">
                <h3>Request Information</h3>
                <div className="admin-detail-grid">
                  <div className="admin-detail-field">
                    <span>Club name</span>
                    <strong>{detailRequest.clubName}</strong>
                  </div>
                  <div className="admin-detail-field">
                    <span>Sender</span>
                    <strong>{detailRequest.sender}</strong>
                  </div>
                  <div className="admin-detail-field">
                    <span>Sent date</span>
                    <strong>{detailRequest.sentDate}</strong>
                  </div>
                  <div className="admin-detail-field">
                    <span>Number of members</span>
                    <strong>{detailRequest.memberCount ?? 0}</strong>
                  </div>
                  <div className="admin-detail-field">
                    <span>Status</span>
                    <strong className={`admin-detail-status admin-detail-status--${detailRequest.status}`}>
                      {formatStatusLabel(detailRequest.status)}
                    </strong>
                  </div>
                  <div className="admin-detail-field">
                    <span>Category</span>
                    <strong>{detailRequest.category || 'Not specified'}</strong>
                  </div>
                  <div className="admin-detail-field admin-detail-field--wide">
                    <span>Detailed content</span>
                    <strong>{detailRequest.description || 'No description provided.'}</strong>
                  </div>
                </div>

                <div className="admin-detail-actions">
                  <button type="button" className="admin-detail-approve">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Approve request
                  </button>
                  <button type="button" className="admin-detail-reject">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                    </svg>
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="admin-card">
            <div className="admin-card__header">
              <div>
                <h2>Registration List</h2>
                <p>Manage submitted club registration requests.</p>
              </div>
              <div className="admin-sort" ref={sortRef}>
                <button
                  type="button"
                  className="admin-sort-btn"
                  aria-haspopup="listbox"
                  aria-expanded={sortMenuOpen}
                  onClick={() => setSortMenuOpen((value) => !value)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M3 6h18M7 12h10M10 18h4" strokeLinecap="round" />
                  </svg>
                  {selectedSort?.label || 'Sort'}
                </button>

                {sortMenuOpen ? (
                  <ul className="admin-sort__menu" role="listbox">
                    {ADMIN_SORT_OPTIONS.map((option) => (
                      <li key={option.value} role="none">
                        <button
                          type="button"
                          className="admin-sort__option"
                          role="option"
                          aria-selected={option.value === sortMode}
                          onClick={() => {
                            setSortMode(option.value)
                            setSortMenuOpen(false)
                          }}
                        >
                          {option.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </div>
            </div>

            <div className="admin-card__tools">
              <label className="admin-card__search">
                <span aria-hidden="true">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="11" cy="11" r="7" />
                    <path d="M20 20l-3-3" strokeLinecap="round" />
                  </svg>
                </span>
                <input
                  type="search"
                  placeholder="Search"
                  aria-label="Search registrations"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                />
              </label>
            </div>

            <div className="admin-table" role="table" aria-label="Registration requests">
              <div className="admin-table__row admin-table__row--head" role="row">
                <span>Club name</span>
                <span>Sender</span>
                <span>Sent date</span>
                <span>Status</span>
                <span aria-label="Actions" />
              </div>

              {paginatedRequests.map((item) => (
                <div className="admin-table__row admin-table__row--body" role="row" key={item.id}>
                  <div className="admin-club-cell">
                    <strong>{item.clubName}</strong>
                  </div>
                  <span>{item.sender}</span>
                  <span>{item.sentDate}</span>
                  <span className="admin-status-actions">
                    <button type="button" className="admin-status-actions__approve" aria-label="Approve request">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                        <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button type="button" className="admin-status-actions__reject" aria-label="Reject request">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                        <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                      </svg>
                    </button>
                  </span>
                  <button
                    type="button"
                    className="admin-view-btn"
                    aria-label={`View ${item.clubName} request`}
                    onClick={() => setDetailRequest(item)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                      <circle cx="12" cy="12" r="2.6" />
                    </svg>
                  </button>
                </div>
              ))}

              {visibleRequests.length === 0 ? (
                <p className="admin-table__empty">No registrations match your search or filter.</p>
              ) : null}
            </div>

            <div className="admin-pagination" aria-label="Pagination">
              <button
                type="button"
                aria-label="Previous page"
                disabled={currentPage === 1}
                onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
              <span>{currentPage}</span>
              <button
                type="button"
                aria-label="Next page"
                disabled={currentPage === pageCount}
                onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                  <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </button>
            </div>
          </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default AdminDashboardPage
