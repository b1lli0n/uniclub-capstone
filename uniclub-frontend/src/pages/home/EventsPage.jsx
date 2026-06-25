import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ALL_EVENTS,
  EVENT_CATEGORIES,
  EVENT_SORT_OPTIONS,
  EVENTS_PER_PAGE,
  MY_CLUB_MEMBERSHIPS,
} from '../../data/mockData'
import '../../styles/clubs.css'

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
        <span className="clubs-card__badge">{event.categoryLabel}</span>
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
              {event.participants} participants
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

function EventsPage() {
  const navigate = useNavigate()
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('default')
  const [page, setPage] = useState(1)

  const filteredEvents = useMemo(() => {
    let result = ALL_EVENTS.filter(
      (event) =>
        event.visibility !== 'private' ||
        MY_CLUB_MEMBERSHIPS.some((membership) => membership.clubId === event.clubId)
    )

    if (activeCategory !== 'all') {
      result = result.filter((event) => event.category === activeCategory)
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
  }, [activeCategory, search, sort])

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

        <div className="clubs-grid events-grid">
          {pageEvents.map((event) => (
            <EventCard key={event.id} event={event} onSelect={() => navigate(`/events/${event.id}`)} />
          ))}
        </div>

        {filteredEvents.length === 0 ? (
          <p className="clubs-empty">No matching events found.</p>
        ) : null}

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
            {Array.from({ length: totalPages }, (_, index) => index + 1).map((number) => (
              <button
                key={number}
                type="button"
                className={`clubs-pagination__btn clubs-pagination__btn--num${number === currentPage ? ' is-active' : ''}`}
                onClick={() => setPage(number)}
                aria-current={number === currentPage ? 'page' : undefined}
              >
                {number}
              </button>
            ))}
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
