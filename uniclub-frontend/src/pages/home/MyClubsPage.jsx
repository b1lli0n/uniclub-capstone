import { useEffect, useMemo, useState } from 'react'
import { getMyClubs } from '../../api/memberClubMembership.api'
import { mapMyClubFromApi } from '../../api/clubMappers'
import {
  CLUB_FILTER_CATEGORIES,
  CLUB_SORT_OPTIONS,
  CLUBS_PER_PAGE,
} from '../../data/mockData'
import ClubLogo from '../../components/home/ClubLogo'
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
      <path d="M4 5h16M4 12h16M4 19h16" />
    </svg>
  ),
  academic: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 21h18M6 21V9l6-4 6 4v12M9 21v-6h6v6" />
    </svg>
  ),
  sport: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2v20" />
    </svg>
  ),
  art: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12c0 2.7 1.1 5.2 2.86 7 .5.5.64 1 .64 1.5C5.5 21.33 6.17 22 7 22h5Z" />
      <circle cx="7.5" cy="10.5" r="1" />
      <circle cx="11.5" cy="7.5" r="1" />
      <circle cx="16.5" cy="9.5" r="1" />
    </svg>
  ),
  event: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
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
        onClick={() => setIsOpen((prev) => !prev)}
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
            {options.map((opt) => (
              <li
                key={opt.value}
                role="option"
                aria-selected={opt.value === value}
                className={`custom-select-option${opt.value === value ? ' is-selected' : ''}`}
                onClick={() => {
                  onChange(opt.value)
                  setIsOpen(false)
                }}
              >
                {opt.label}
              </li>
            ))}
          </ul>
        </>
      ) : null}
    </div>
  )
}

function MyClubCard({ club, onSelect }) {
  function handleSelect() {
    onSelect?.(club.id)
  }

  function handleKeyDown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      handleSelect()
    }
  }

  return (
    <article
      className={`clubs-card my-clubs-card${onSelect ? ' clubs-card--clickable' : ''}`}
      role={onSelect ? 'button' : undefined}
      tabIndex={onSelect ? 0 : undefined}
      onClick={handleSelect}
      onKeyDown={onSelect ? handleKeyDown : undefined}
    >
      <div className="clubs-card__media">
        <span className="clubs-card__badge">{club.categoryLabel}</span>
        <ClubLogo club={club} className="clubs-card__logo" />
      </div>
      <div className="clubs-card__body">
        <div className="my-clubs-card__heading">
          <h3 className="clubs-card__name">{club.name}</h3>
          <span className={`my-clubs-role my-clubs-role--${club.membershipRole.toLowerCase().replace(/\s+/g, '-')}`}>
            {club.membershipRole}
          </span>
        </div>
        <p className="clubs-card__desc">{club.description}</p>
        <div className="clubs-card__footer">
          <div className="clubs-card__stats">
            <span className="clubs-card__stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" />
                <circle cx="9" cy="7" r="4" />
              </svg>
              {club.members} members
            </span>
            <span className="clubs-card__stat">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
                <rect x="3" y="4" width="18" height="18" rx="2" />
                <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
              </svg>
              Joined {club.joinedDate}
            </span>
          </div>
          <button
            type="button"
            className="clubs-card__action"
            aria-label={`View ${club.name}`}
            onClick={(event) => {
              event.stopPropagation()
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

function MyClubsPage({ onSelectClub }) {
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [sort, setSort] = useState('default')
  const [page, setPage] = useState(1)

  useEffect(() => {
    let cancelled = false

    async function loadMyClubs() {
      setLoading(true)
      try {
        const response = await getMyClubs()
        if (!cancelled) {
          setClubs((response.data || []).map((membership) => mapMyClubFromApi(membership)))
        }
      } catch (error) {
        console.error(error)
        if (!cancelled) setClubs([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadMyClubs()
    return () => {
      cancelled = true
    }
  }, [])

  const filteredClubs = useMemo(() => {
    let result = [...clubs]

    if (activeCategory !== 'all') {
      result = result.filter((club) => club.category === activeCategory)
    }

    const query = search.trim().toLowerCase()
    if (query) {
      result = result.filter(
        (club) =>
          club.name.toLowerCase().includes(query) ||
          club.description.toLowerCase().includes(query) ||
          club.membershipRole.toLowerCase().includes(query),
      )
    }

    if (sort === 'name-asc') {
      result.sort((a, b) => a.name.localeCompare(b.name))
    } else if (sort === 'members-desc') {
      result.sort((a, b) => b.members - a.members)
    } else if (sort === 'events-desc') {
      result.sort((a, b) => b.events - a.events)
    }

    return result
  }, [clubs, activeCategory, search, sort])

  const totalPages = Math.max(1, Math.ceil(filteredClubs.length / CLUBS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const pageClubs = filteredClubs.slice(
    (currentPage - 1) * CLUBS_PER_PAGE,
    currentPage * CLUBS_PER_PAGE,
  )

  function handleCategoryChange(id) {
    setActiveCategory(id)
    setPage(1)
  }

  function handleSearchChange(event) {
    setSearch(event.target.value)
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
    <div className="clubs-page my-clubs-page">
      <div className="clubs-shell my-clubs-shell">
        <div className="clubs-filters">
          {CLUB_FILTER_CATEGORIES.map((cat) => (
            <button
              key={cat.id}
              type="button"
              className={`clubs-filter${activeCategory === cat.id ? ' is-active' : ''}`}
              onClick={() => handleCategoryChange(cat.id)}
            >
              <span className="clubs-filter__icon" aria-hidden="true">
                {CATEGORY_ICONS[cat.id] || cat.icon}
              </span>
              {cat.label}
            </button>
          ))}
        </div>

        <header className="clubs-header my-clubs-header">
          <div className="clubs-header__info">
            <p className="my-clubs-kicker">Your joined clubs</p>
            <h1 className="clubs-header__title">My Clubs</h1>
            <p className="clubs-header__count">
              {filteredClubs.length} joined {filteredClubs.length === 1 ? 'club' : 'clubs'}
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
                placeholder="Search your clubs or role..."
                value={search}
                onChange={handleSearchChange}
                aria-label="Search my clubs"
              />
            </div>

            <div className="clubs-sort">
              <label htmlFor="my-clubs-sort">SORT</label>
              <CustomSelect
                id="my-clubs-sort"
                value={sort}
                onChange={setSort}
                options={CLUB_SORT_OPTIONS}
              />
            </div>
          </div>
        </header>

        <div className="clubs-grid">
          {loading ? <p className="clubs-empty">Loading your clubs...</p> : null}
          {!loading
            ? pageClubs.map((club) => (
                <MyClubCard key={club.id} club={club} onSelect={onSelectClub} />
              ))
            : null}
        </div>

        {filteredClubs.length === 0 && !loading ? (
          <div className="clubs-empty my-clubs-empty">
            No joined clubs match your current filters.
          </div>
        ) : null}

        {totalPages > 1 ? (
          <nav className="clubs-pagination" aria-label="My clubs pagination">
            <button
              type="button"
              className="clubs-pagination__btn"
              disabled={currentPage <= 1}
              onClick={() => setPage((p) => p - 1)}
              aria-label="Previous page"
            >
              <ChevronIcon direction="left" />
            </button>
            {getPageNumbers().map((num, idx) => {
              if (num === '...') {
                return (
                  <span key={`dots-${idx}`} className="clubs-pagination__dots">
                    ...
                  </span>
                );
              }
              return (
                <button
                  key={num}
                  type="button"
                  className={`clubs-pagination__btn clubs-pagination__btn--num${
                    num === currentPage ? ' is-active' : ''
                  }`}
                  onClick={() => setPage(num)}
                  aria-current={num === currentPage ? 'page' : undefined}
                >
                  {num}
                </button>
              );
            })}
            <button
              type="button"
              className="clubs-pagination__btn"
              disabled={currentPage >= totalPages}
              onClick={() => setPage((p) => p + 1)}
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

export default MyClubsPage
