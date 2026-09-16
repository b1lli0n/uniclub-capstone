import { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyClubs } from '../../api/memberClubMembership.api'
import { getMyRegistrations } from '../../api/event.api'
import { formatDateVN, formatTime24 } from '../../utils/dateTimeUtils'
import '../../styles/my-events.css'

// ── QR Ticket Modal ──────────────────────────────────────────────────────────
function QRModal({ registrationId, eventTitle, onClose }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=14&data=${registrationId}`

  return (
    <div className="my-events-modal" role="dialog" aria-modal="true">
      <button className="my-events-modal__backdrop" onClick={onClose} aria-label="Close modal" />
      <div className="my-events-modal__panel">
        <button
          onClick={onClose}
          aria-label="Close QR Modal"
          className="my-events-modal__close"
        >
          ✕
        </button>

        <div className="my-events-modal__icon">🎟️</div>
        <h2 className="my-events-modal__title">Check-in Entrance Ticket</h2>
        <p className="my-events-modal__subtitle">
          {eventTitle || 'Event Check-in Ticket'}
        </p>

        <div className="my-events-modal__qr-wrap">
          <img
            src={qrUrl}
            alt="Ticket QR Code"
            className="my-events-modal__qr-img"
          />
        </div>

        <p className="my-events-modal__hint">
          Present this QR code to event coordinators at the check-in desk for attendance scanning.
        </p>

        <button
          type="button"
          onClick={onClose}
          id="qr-modal-close-btn"
          className="my-events-modal__done-btn"
        >
          Done
        </button>
      </div>
    </div>
  )
}

// ── Event Card ───────────────────────────────────────────────────────────────
function EventCard({ reg, onShowQR, navigate }) {
  const event = reg.event_id || {}
  const club = event.club_id || {}

  const eventDate = event.start_time ? new Date(event.start_time) : null
  const isValidDate = eventDate && !isNaN(eventDate.getTime())
  const monthStr = isValidDate ? `Th${eventDate.getMonth() + 1}` : '📅'
  const dayStr = isValidDate ? eventDate.getDate() : '—'
  const formattedDate = isValidDate ? formatDateVN(event.start_time) : '—'
  const formattedTime = isValidDate ? formatTime24(event.start_time) : ''

  const checkInOpen = event.check_in_status === 'open'

  const STATUS_CONFIG = {
    pending: { label: 'Pending Approval', badgeClass: 'my-event-badge--pending' },
    approved: { label: 'Ready for Check-in', badgeClass: 'my-event-badge--registered' },
    registered: { label: 'Ready for Check-in', badgeClass: 'my-event-badge--registered' },
    attended: { label: '✓ Checked In', badgeClass: 'my-event-badge--attended' },
    absent: { label: 'Absent', badgeClass: 'my-event-badge--absent' },
    cancelled: { label: 'Cancelled', badgeClass: 'my-event-badge--cancelled' },
    rejected: { label: 'Rejected', badgeClass: 'my-event-badge--rejected' },
  }
  const st = STATUS_CONFIG[reg.status] || STATUS_CONFIG.registered

  return (
    <article
      className={`my-event-card ${checkInOpen ? 'my-event-card--checkin-open' : ''}`}
      id={`my-event-item-${reg._id}`}
    >
      {/* Left: Date Ribbon + Details */}
      <div className="my-event-card__left">
        <div className="my-event-card__date-box">
          <span className="my-event-card__date-month">{monthStr}</span>
          <span className="my-event-card__date-day">{dayStr}</span>
        </div>

        <div className="my-event-card__info">
          <div className="my-event-card__title-row">
            <h3 className="my-event-card__title">{event.title || 'Untitled Event'}</h3>
            {checkInOpen && (
              <span className="my-event-card__live-pill">
                <span className="my-event-card__live-dot" />
                Check-in OPEN
              </span>
            )}
          </div>

          <div className="my-event-card__meta">
            <span className="my-event-card__club-tag">🏛️ {club.name || 'UniClub'}</span>
            <span>•</span>
            <span>📅 {formattedDate} {formattedTime}</span>
            {event.location && (
              <>
                <span>•</span>
                <span className="my-event-card__location">📍 {event.location}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Right: Status badge + Actions */}
      <div className="my-event-card__right">
        <span className={`my-event-badge ${st.badgeClass}`}>
          {st.label}
        </span>

        <div className="my-event-card__actions">
          {/* QR Ticket Button */}
          {(reg.status === 'registered' || reg.status === 'approved' || reg.status === 'attended') && (
            <button
              type="button"
              className={`my-event-btn ${checkInOpen ? 'my-event-btn--ticket-open' : 'my-event-btn--ticket'}`}
              onClick={() => onShowQR(reg)}
              title={checkInOpen ? 'Open QR Check-in Ticket' : 'View Check-in Ticket'}
              id={`btn-qr-${reg._id}`}
            >
              🎟️ {checkInOpen ? 'QR Check-in' : 'View Ticket'}
            </button>
          )}

          {/* Details Navigation Button */}
          <button
            type="button"
            className="my-event-btn my-event-btn--details"
            onClick={() => navigate(`/events/${event._id}`)}
            title="View event details"
            id={`btn-details-${reg._id}`}
          >
            Details ➔
          </button>
        </div>
      </div>
    </article>
  )
}

// ── Main My Events Page ───────────────────────────────────────────────────────
export default function MyEventsPage() {
  const navigate = useNavigate()
  const [clubsCount, setClubsCount] = useState(0)
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [qrReg, setQrReg] = useState(null)

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all' | 'open' | 'upcoming' | 'attended' | 'past'
  const [selectedClub, setSelectedClub] = useState('')
  const [sortBy, setSortBy] = useState('date-asc') // 'date-asc' | 'date-desc' | 'newest'

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([
      getMyClubs().catch(() => ({ data: [] })),
      getMyRegistrations().catch(() => ({ data: [] })),
    ])
      .then(([clubsRes, regRes]) => {
        if (!active) return
        setClubsCount(clubsRes.data?.length || 0)
        const regs = regRes.data?.data || regRes.data || []
        setRegistrations(Array.isArray(regs) ? regs : [])
        setLoading(false)
      })
      .catch((err) => {
        console.error('MyEventsPage error:', err)
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  // Derive available clubs from registrations
  const availableClubs = useMemo(() => {
    const map = new Map()
    registrations.forEach((r) => {
      const c = r.event_id?.club_id
      if (c && c._id && !map.has(c._id)) {
        map.set(c._id, c.name || 'Unnamed Club')
      }
    })
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [registrations])

  // Counts for tabs & stats
  const openCount = useMemo(
    () =>
      registrations.filter(
        (r) =>
          r.event_id?.check_in_status === 'open' &&
          (r.status === 'registered' || r.status === 'approved')
      ).length,
    [registrations]
  )

  const upcomingCount = useMemo(
    () =>
      registrations.filter(
        (r) =>
          r.status === 'pending' ||
          ((r.status === 'registered' || r.status === 'approved') &&
            r.event_id?.check_in_status !== 'open')
      ).length,
    [registrations]
  )

  const attendedCount = useMemo(
    () => registrations.filter((r) => r.status === 'attended').length,
    [registrations]
  )

  const pastCount = useMemo(
    () =>
      registrations.filter((r) =>
        ['attended', 'absent', 'cancelled', 'rejected'].includes(r.status)
      ).length,
    [registrations]
  )

  // Filtered & sorted registrations
  const filteredRegistrations = useMemo(() => {
    return registrations
      .filter((r) => {
        const event = r.event_id || {}
        const club = event.club_id || {}
        const isOpen =
          event.check_in_status === 'open' &&
          (r.status === 'registered' || r.status === 'approved')

        // Status Filter
        if (statusFilter === 'open') {
          if (!isOpen) return false
        } else if (statusFilter === 'upcoming') {
          const isUpcoming =
            r.status === 'pending' ||
            ((r.status === 'registered' || r.status === 'approved') &&
              event.check_in_status !== 'open')
          if (!isUpcoming) return false
        } else if (statusFilter === 'attended') {
          if (r.status !== 'attended') return false
        } else if (statusFilter === 'past') {
          if (!['attended', 'absent', 'cancelled', 'rejected'].includes(r.status)) {
            return false
          }
        }

        // Club Filter
        if (selectedClub && club._id !== selectedClub) {
          return false
        }

        // Search Query (Event Title, Club Name, Location)
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase().trim()
          const titleMatch = (event.title || '').toLowerCase().includes(q)
          const clubMatch = (club.name || '').toLowerCase().includes(q)
          const locMatch = (event.location || '').toLowerCase().includes(q)
          if (!titleMatch && !clubMatch && !locMatch) return false
        }

        return true
      })
      .sort((a, b) => {
        const dateA = new Date(a.event_id?.start_time || 0).getTime()
        const dateB = new Date(b.event_id?.start_time || 0).getTime()
        if (sortBy === 'date-asc') return dateA - dateB
        if (sortBy === 'date-desc') return dateB - dateA
        if (sortBy === 'newest') {
          const createdA = new Date(a.createdAt || a.created_at || 0).getTime()
          const createdB = new Date(b.createdAt || b.created_at || 0).getTime()
          return createdB - createdA
        }
        return 0
      })
  }, [registrations, statusFilter, selectedClub, searchQuery, sortBy])

  const hasActiveFilters = Boolean(searchQuery || selectedClub || statusFilter !== 'all')

  const resetFilters = () => {
    setSearchQuery('')
    setStatusFilter('all')
    setSelectedClub('')
    setSortBy('date-asc')
  }

  return (
    <main className="my-events-page">
      {/* QR Modal */}
      {qrReg && (
        <QRModal
          registrationId={qrReg._id}
          eventTitle={qrReg.event_id?.title}
          onClose={() => setQrReg(null)}
        />
      )}

      {/* Hero Header */}
      <section className="my-events-hero">
        <div>
          <span className="my-events-hero__eyebrow">🎟️ Activity Pass & Tickets</span>
          <h1 className="my-events-hero__title">My Registered Events</h1>
          <p className="my-events-hero__subtitle">
            Keep track of all your event registrations, check-in schedules, and quick QR entrance passes.
          </p>
        </div>

        <div className="my-events-hero__summary">
          <span>Check-in Ready</span>
          <strong className={openCount > 0 ? 'is-live' : ''}>{openCount}</strong>
          <div className="my-events-hero__summary-sub">
            {openCount > 0 ? '🟢 Event desk open now' : 'No active check-ins right now'}
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="my-events-stats" aria-label="Event statistics">
        <div className={`my-events-stat-card ${openCount > 0 ? 'my-events-stat-card--highlight' : ''}`}>
          <div className="my-events-stat-card__icon">🟢</div>
          <div className="my-events-stat-card__info">
            <strong className="my-events-stat-card__number">{openCount}</strong>
            <span className="my-events-stat-card__label">Check-in Open</span>
            <small className="my-events-stat-card__sub">{openCount > 0 ? 'Ready for QR scan' : 'None open'}</small>
          </div>
        </div>

        <div className="my-events-stat-card">
          <div className="my-events-stat-card__icon">⏳</div>
          <div className="my-events-stat-card__info">
            <strong className="my-events-stat-card__number">{upcomingCount}</strong>
            <span className="my-events-stat-card__label">Upcoming</span>
            <small className="my-events-stat-card__sub">Scheduled events</small>
          </div>
        </div>

        <div className="my-events-stat-card">
          <div className="my-events-stat-card__icon">✓</div>
          <div className="my-events-stat-card__info">
            <strong className="my-events-stat-card__number">{attendedCount}</strong>
            <span className="my-events-stat-card__label">Attended</span>
            <small className="my-events-stat-card__sub">Points awarded</small>
          </div>
        </div>

        <div className="my-events-stat-card">
          <div className="my-events-stat-card__icon">🏛️</div>
          <div className="my-events-stat-card__info">
            <strong className="my-events-stat-card__number">{clubsCount}</strong>
            <span className="my-events-stat-card__label">My Clubs</span>
            <small className="my-events-stat-card__sub">Active memberships</small>
          </div>
        </div>
      </section>

      {/* Floating Toolbar with Tabs & Filters */}
      <div className="my-events-toolbar">
        {/* Status Tabs */}
        <div className="my-events-tabs" role="tablist" aria-label="Filter events by status">
          <button
            type="button"
            className={`my-events-tab ${statusFilter === 'all' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All Events
            <span className="my-events-tab__badge">{registrations.length}</span>
          </button>
          <button
            type="button"
            className={`my-events-tab ${statusFilter === 'open' ? 'is-active is-open-tab' : ''}`}
            onClick={() => setStatusFilter('open')}
          >
            🟢 Check-in Open
            <span className="my-events-tab__badge">{openCount}</span>
          </button>
          <button
            type="button"
            className={`my-events-tab ${statusFilter === 'upcoming' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('upcoming')}
          >
            ⏳ Upcoming
            <span className="my-events-tab__badge">{upcomingCount}</span>
          </button>
          <button
            type="button"
            className={`my-events-tab ${statusFilter === 'attended' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('attended')}
          >
            ✓ Attended
            <span className="my-events-tab__badge">{attendedCount}</span>
          </button>
          <button
            type="button"
            className={`my-events-tab ${statusFilter === 'past' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('past')}
          >
            📅 Past / Other
            <span className="my-events-tab__badge">{pastCount}</span>
          </button>
        </div>

        {/* Search & Secondary Filter Controls */}
        <div className="my-events-controls">
          {/* Search Box */}
          <div className="my-events-search">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="my-events-search__svg">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="my-events-search-input"
              type="text"
              className="my-events-search__input"
              placeholder="Search event title, club, location..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search registered events"
            />
            {searchQuery && (
              <button
                type="button"
                className="my-events-search__clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear event search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Club Dropdown Filter */}
          {availableClubs.length > 0 && (
            <div className="my-events-control-group">
              <label htmlFor="my-events-club-select" className="my-events-control-label">CLUB</label>
              <select
                id="my-events-club-select"
                className="my-events-select"
                value={selectedClub}
                onChange={(e) => setSelectedClub(e.target.value)}
              >
                <option value="">All Clubs ({availableClubs.length})</option>
                {availableClubs.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Sort Dropdown */}
          <div className="my-events-control-group">
            <label htmlFor="my-events-sort-select" className="my-events-control-label">SORT</label>
            <select
              id="my-events-sort-select"
              className="my-events-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="date-asc">Date: Soonest First</option>
              <option value="date-desc">Date: Furthest First</option>
              <option value="newest">Recently Registered</option>
            </select>
          </div>
        </div>
      </div>

      {/* Events List / Empty States */}
      {loading ? (
        <div className="my-events-empty">
          <div className="my-events-empty__icon">⏳</div>
          <h3 className="my-events-empty__title">Loading registered events...</h3>
          <p className="my-events-empty__text">Retrieving your event passes and check-in statuses.</p>
        </div>
      ) : filteredRegistrations.length === 0 ? (
        <div className="my-events-empty">
          <div className="my-events-empty__icon">
            {hasActiveFilters ? '🔍' : '🎟️'}
          </div>
          <h3 className="my-events-empty__title">
            {hasActiveFilters ? 'No matching registered events found' : 'No event registrations yet'}
          </h3>
          <p className="my-events-empty__text">
            {hasActiveFilters
              ? 'Try adjusting your search keywords, status tab, or club filter.'
              : 'You have not registered for any club events. Discover exciting events and secure your ticket!'}
          </p>
          {hasActiveFilters ? (
            <button
              type="button"
              className="my-events-empty__btn"
              onClick={resetFilters}
            >
              Reset All Filters
            </button>
          ) : (
            <button
              type="button"
              className="my-events-empty__btn"
              onClick={() => navigate('/events')}
            >
              Explore Club Events ➔
            </button>
          )}
        </div>
      ) : (
        <div className="my-events-list">
          {filteredRegistrations.map((reg) => (
            <EventCard
              key={reg._id}
              reg={reg}
              onShowQR={(target) => setQrReg(target)}
              navigate={navigate}
            />
          ))}
        </div>
      )}
    </main>
  )
}
