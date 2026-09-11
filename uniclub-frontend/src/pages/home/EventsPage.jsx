import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  EVENT_CATEGORIES,
  EVENT_SORT_OPTIONS,
  EVENTS_PER_PAGE,
} from '../../data/mockData'
import { getPublicEvents } from '../../api/event.api'
import '../../styles/clubs.css'

import { resolveEventUploadImage } from '../../utils/imageUtils'

const CATEGORY_GRADIENTS = {
  sport: 'linear-gradient(135deg, #ffce96 0%, #f5b87a 100%)',
  academic: 'linear-gradient(135deg, #a8d8ff 0%, #7eb8f0 100%)',
  art: 'linear-gradient(135deg, #f5b0d8 0%, #e88fc4 100%)',
  event: 'linear-gradient(135deg, #c4f0a8 0%, #9ed87e 100%)',
}

function mapEventFromApi(apiEvent) {
  if (!apiEvent) return null
  const startDate = apiEvent.start_time ? new Date(apiEvent.start_time) : null
  const formattedDate = startDate ? startDate.toLocaleDateString('vi-VN') : ''
  const category = (apiEvent.category || 'academic').toLowerCase()
  
  return {
    id: apiEvent._id || apiEvent.id,
    name: apiEvent.title || '',
    description: apiEvent.description || '',
    category,
    categoryLabel: category.toUpperCase(),
    date: formattedDate,
    participants: apiEvent.capacity || 0,
    gradient: CATEGORY_GRADIENTS[category] || CATEGORY_GRADIENTS.academic,
    status: apiEvent.status === 'coming soon' ? 'coming_soon' : (apiEvent.status || 'coming_soon'),
    imageUrl: resolveEventUploadImage(apiEvent.media_uris || apiEvent.image_url, category),
  }
}

function ChevronIcon({ direction }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      {direction === 'left' ? (
        <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  )
}

function ArrowIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

const CATEGORY_ICONS = {
  all: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 2c0 5.523 4.477 10 10 10-5.523 0-10 4.477-10 10 0-5.523-4.477-10-10-10 5.523 0 10-4.477 10-10z" />
    </svg>
  ),
  workshop: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M8 3h8M9 3v5l-5 9a3 3 0 0 0 2.6 4.5h10.8A3 3 0 0 0 20 17l-5-9V3" />
      <path d="M8 14h8" />
    </svg>
  ),
  sport: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2v20" />
    </svg>
  ),
  entertainment: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="7" width="18" height="12" rx="2" />
      <path d="M8 7V5h8v2M8 13h.01M12 13h.01M16 13h.01" />
    </svg>
  ),
  community: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21l7.8-7.6 1-1a5.5 5.5 0 0 0 0-7.8Z" />
    </svg>
  ),
}

function CustomSelect({ value, onChange, options }) {
  const [isOpen, setIsOpen] = useState(false)
  const activeOption = options.find((opt) => opt.value === value) || options[0]

  return (
    <div className="custom-select-container">
      <button
        type="button"
        className="custom-select-trigger"
        onClick={() => setIsOpen((current) => !current)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{activeOption.label}</span>
        <span className="custom-select-arrow" aria-hidden="true">
          <svg viewBox="0 0 12 8" fill="currentColor">
            <path d="M6 8L0 0h12L6 8z" />
          </svg>
        </span>
      </button>

      {isOpen ? (
        <>
          <div className="custom-select-backdrop" onClick={() => setIsOpen(false)} />
          <ul className="custom-select-options" role="listbox">
            {options.map((option) => (
              <li
                key={option.value}
                role="option"
                aria-selected={option.value === value}
                className={`custom-select-option${option.value === value ? ' is-selected' : ''}`}
                onClick={() => {
                  onChange(option.value)
                  setIsOpen(false)
                }}
              >
                {option.label}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  )
}

function EventCard({ event, onSelect }) {
  function handleSelect() {
    onSelect?.(event)
  }

  function handleKeyDown(keyEvent) {
    if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
      keyEvent.preventDefault()
      handleSelect()
    }
  }

  return (
    <article
      className="clubs-card clubs-card--clickable events-card"
      role="button"
      tabIndex={0}
      onClick={handleSelect}
      onKeyDown={handleKeyDown}
    >
      <div className="clubs-card__media events-card__media" style={{ '--event-gradient': event.gradient }}>
        {event.imageUrl ? (
          <img src={event.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
        ) : null}
        <span className="clubs-card__badge" style={{ position: 'absolute', top: '0.75rem', left: '0.75rem', right: 'auto', zIndex: 1 }}>{event.categoryLabel}</span>
        <span className={`event-status-badge status-${event.status}`} style={{
          position: 'absolute',
          top: '0.75rem',
          right: '0.75rem',
          padding: '0.25rem 0.6rem',
          borderRadius: '999px',
          fontSize: '0.7rem',
          fontWeight: '700',
          textTransform: 'uppercase',
          boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
          background: event.status === 'opening' ? '#e2f9e6' :
                      (event.status === 'coming_soon' || event.status === 'coming soon') ? '#e6f3ff' :
                      event.status === 'closed' ? '#fff4e6' : '#fce8e6',
          color: event.status === 'opening' ? '#1b8a36' :
                 (event.status === 'coming_soon' || event.status === 'coming soon') ? '#0284c7' :
                 event.status === 'closed' ? '#d97706' : '#dc2626'
        }}>
          {event.status === 'coming_soon' ? 'coming soon' : event.status}
        </span>
      </div>
      <div className="clubs-card__body events-card__body">
        <h3 className="clubs-card__name">{event.name}</h3>
        <p className="clubs-card__desc">{event.description}</p>
        <div className="clubs-card__footer">
          <div className="clubs-card__stats">
            <span className="clubs-card__stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              {event.participants} slots
            </span>
            <span className="clubs-card__stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
              </svg>
              {event.date}
            </span>
          </div>
          <button
            type="button"
            className="clubs-card__action"
            aria-label={`View ${event.name}`}
            onClick={(clickEvent) => {
              clickEvent.stopPropagation()
              handleSelect()
            }}
          >
            <ArrowIcon />
          </button>
        </div>
      </div>
    </article>
  )
}

const STATUS_FILTER_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'opening', label: 'Opening' },
  { value: 'coming_soon', label: 'Coming Soon' },
  { value: 'closed', label: 'Closed' },
  { value: 'cancelled', label: 'Cancelled' },
]

function EventsPage() {
  const navigate = useNavigate()
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('default')
  const [statusFilter, setStatusFilter] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    let active = true
    async function fetchEvents() {
      setLoading(true)
      try {
        const res = await getPublicEvents()
        if (active) {
          setEvents(res.data || [])
        }
      } catch (err) {
        console.error("Error loading public events:", err)
      } finally {
        if (active) setLoading(false)
      }
    }
    fetchEvents()
    return () => { active = false }
  }, [])

  const filteredEvents = useMemo(() => {
    let result = events.map(mapEventFromApi).filter(Boolean)

    if (activeCategory !== 'all') {
      result = result.filter((event) => event.category === activeCategory)
    }

    if (statusFilter !== 'all') {
      result = result.filter((event) => event.status === statusFilter || (statusFilter === 'coming_soon' && event.status === 'coming soon'))
    } else {
      result = result.filter((event) => event.status !== 'closed' && event.status !== 'cancelled')
    }

    const query = search.trim().toLowerCase()
    if (query) {
      result = result.filter(
        (event) =>
          event.name.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query),
      )
    }

    if (sort === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sort === 'participants-desc') {
      result.sort((a, b) => b.participants - a.participants)
    }

    return result
  }, [events, activeCategory, search, sort, statusFilter])

  const totalPages = Math.max(1, Math.ceil(filteredEvents.length / EVENTS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const pageEvents = filteredEvents.slice(
    (currentPage - 1) * EVENTS_PER_PAGE,
    currentPage * EVENTS_PER_PAGE,
  )

  function handleCategoryChange(id) {
    setActiveCategory(id)
    setPage(1)
  }

  function handleSearchChange(event) {
    setSearch(event.target.value)
    setPage(1)
  }

  function handleStatusFilterChange(val) {
    setStatusFilter(val)
    setPage(1)
  }

  const getPageNumbers = () => {
    const pageNumbers = [];
    if (totalPages <= 6) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        pageNumbers.push(1, 2, 3, 4, '...', totalPages - 2, totalPages - 1, totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1, 2, 3, '...', totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
      } else {
        pageNumbers.push(1, '...', currentPage - 1, currentPage, currentPage + 1, '...', totalPages);
      }
    }
    return pageNumbers;
  };

  return (
    <div className="clubs-page events-page">
      <div className="clubs-shell events-shell">
        <div className="clubs-filters">
          {EVENT_CATEGORIES.map((category) => (
            <button
              key={category.id}
              type="button"
              className={`clubs-filter${activeCategory === category.id ? ' is-active' : ''}`}
              onClick={() => handleCategoryChange(category.id)}
            >
              <span className="clubs-filter__icon" aria-hidden="true">
                {CATEGORY_ICONS[category.id]}
              </span>
              {category.label}
            </button>
          ))}
        </div>

        <header className="clubs-header">
          <div className="clubs-header__info">
            <h1 className="clubs-header__title">Events</h1>
            <p className="clubs-header__count">
              {filteredEvents.length} {filteredEvents.length === 1 ? 'event' : 'events'}
            </p>
          </div>

          <div className="clubs-header__tools">
            <div className="clubs-search">
              <span className="clubs-search__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3-3" strokeLinecap="round" />
                </svg>
              </span>
              <input
                type="search"
                placeholder="Search by name or description..."
                value={search}
                onChange={handleSearchChange}
                aria-label="Search events"
              />
            </div>

            <div className="clubs-sort" style={{ marginRight: '0.5rem' }}>
              <label htmlFor="events-status">STATUS</label>
              <CustomSelect
                id="events-status"
                value={statusFilter}
                onChange={handleStatusFilterChange}
                options={STATUS_FILTER_OPTIONS}
              />
            </div>

            <div className="clubs-sort">
              <label htmlFor="events-sort">SORT</label>
              <CustomSelect
                id="events-sort"
                value={sort}
                onChange={setSort}
                options={EVENT_SORT_OPTIONS}
              />
            </div>
          </div>
        </header>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <p>Loading events...</p>
          </div>
        ) : (
          <>
            <div className="clubs-grid events-grid">
              {pageEvents.map((event) => (
                <EventCard key={event.id} event={event} onSelect={() => navigate(`/events/${event.id}`)} />
              ))}
            </div>

            {filteredEvents.length === 0 ? (
              <p className="clubs-empty">No matching events found.</p>
            ) : null}
          </>
        )}

        {totalPages > 1 ? (
          <nav className="clubs-pagination" aria-label="Event pagination">
            <button
              type="button"
              className="clubs-pagination__btn"
              disabled={currentPage <= 1}
              onClick={() => setPage((current) => current - 1)}
              aria-label="Previous page"
            >
              <ChevronIcon direction="left" />
            </button>
            {getPageNumbers().map((number, idx) => {
              if (number === '...') {
                return (
                  <span key={`dots-${idx}`} className="clubs-pagination__dots">
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={number}
                  type="button"
                  className={`clubs-pagination__btn clubs-pagination__btn--num${number === currentPage ? ' is-active' : ''}`}
                  onClick={() => setPage(number)}
                  aria-current={number === currentPage ? 'page' : undefined}
                >
                  {number}
                </button>
              );
            })}
            <button
              type="button"
              className="clubs-pagination__btn"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((current) => current + 1)}
              aria-label="Next page"
            >
              <ChevronIcon direction="right" />
            </button>
          </nav>
        ) : null}
      </div>

    </div>
  )
}

export default EventsPage
