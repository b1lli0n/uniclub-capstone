import { useEffect, useMemo, useState } from 'react'
import { getClubs } from '../../api/club.api'
import { mapClubFromApi } from '../../api/clubMappers'
import {
  CLUB_FILTER_CATEGORIES,
  CLUB_SORT_OPTIONS,
  CLUBS_PER_PAGE,
} from '../../data/mockData'
import ClubLogo from '../../components/home/ClubLogo'
import { SearchIcon } from '../../components/common/Icons'
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

function ClubCard({ club, onSelect }) {
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
      className={`clubs-card${onSelect ? ' clubs-card--clickable' : ''}`}
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
        <h3 className="clubs-card__name">{club.name}</h3>
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
              {club.events} events
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

const CATEGORY_ICONS = {
  all: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  academic: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
      <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
    </svg>
  ),
  sport: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="10" />
      <path d="M4.93 4.93a10 10 0 0 1 14.14 14.14M4.93 19.07A10 10 0 0 1 19.07 4.93" />
    </svg>
  ),
  art: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="13.5" cy="6.5" r="1" fill="currentColor" />
      <circle cx="17.5" cy="10.5" r="1" fill="currentColor" />
      <circle cx="8.5" cy="7.5" r="1" fill="currentColor" />
      <circle cx="6.5" cy="12.5" r="1" fill="currentColor" />
      <path d="M12 2C6.5 2 2 6.5 2 12c0 5.52 4.48 10 10 10 .83 0 1.5-.67 1.5-1.5 0-.39-.15-.74-.39-1.01-.23-.26-.38-.61-.38-.99 0-.83.67-1.5 1.5-1.5H16c2.76 0 5-2.24 5-5 0-4.42-4.03-8-9-8z" />
    </svg>
  ),
  event: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" />
    </svg>
  ),
  other: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="1" fill="currentColor" />
      <circle cx="19" cy="12" r="1" fill="currentColor" />
      <circle cx="5" cy="12" r="1" fill="currentColor" />
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
        onClick={() => setIsOpen(!isOpen)}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        <span>{activeOption.label}</span>
        <span className="custom-select-arrow">
          <svg viewBox="0 0 12 8" fill="currentColor" style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
            <path d="M6 8L0 0h12L6 8z" />
          </svg>
        </span>
      </button>
      {isOpen && (
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
      )}
    </div>
  )
}

function ClubsPage({ onSelectClub }) {
  const [clubs, setClubs] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('all')
  const [search, setSearch] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [sort, setSort] = useState('default')
  const [page, setPage] = useState(1)

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search)
    }, 350)
    return () => clearTimeout(timer)
  }, [search])

  useEffect(() => {
    let cancelled = false

    async function loadClubs() {
      if (clubs.length === 0) {
        setLoading(true)
      }
      try {
        const response = await getClubs({
          category: activeCategory !== 'all' ? activeCategory : undefined,
          search: debouncedSearch.trim() || undefined,
          sortBy: sort === 'name-asc' ? 'name' : undefined,
        })
        if (!cancelled) {
          setClubs((response.data || []).map((club) => mapClubFromApi(club)))
        }
      } catch (error) {
        console.error(error)
        if (!cancelled) setClubs([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadClubs()
    return () => {
      cancelled = true
    }
  }, [activeCategory, debouncedSearch, sort])

  const filteredClubs = useMemo(() => {
    let result = [...clubs]

    if (activeCategory !== 'all') {
      const knownCategories = ['academic', 'sport', 'art', 'event']
      result = result.filter((club) => {
        const clubCat = (club.category || '').toLowerCase().replace(/s$/, '')
        if (activeCategory === 'other') {
          // "Other" shows clubs that don't match any of the known categories
          return !knownCategories.includes(clubCat)
        }
        const activeCat = activeCategory.toLowerCase().replace(/s$/, '')
        return clubCat === activeCat
      })
    }

    const query = search.trim().toLowerCase()
    if (query) {
      result = result.filter((club) =>
        club.name.toLowerCase().includes(query)
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
    <div className="clubs-page">
      <div className="clubs-shell">
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

        <header className="clubs-header">
          <div className="clubs-header__info">
            <h1 className="clubs-header__title">Clubs</h1>
            <p className="clubs-header__count">{filteredClubs.length} clubs</p>
          </div>

          <div className="clubs-header__tools">
            <div className="clubs-search">
              <span className="clubs-search__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="M20 20l-3-3" />
                </svg>
              </span>
              <input
                type="search"
                placeholder="Search here ..."
                value={search}
                onChange={handleSearchChange}
                aria-label="Search clubs"
              />
            </div>

            <div className="clubs-sort">
              <label htmlFor="clubs-sort">SORT</label>
              <CustomSelect
                id="clubs-sort"
                value={sort}
                onChange={setSort}
                options={CLUB_SORT_OPTIONS}
              />
            </div>
          </div>
        </header>

        <div className="clubs-grid">
          {loading ? (
            <div className="clubs-empty-state">
              <p>Loading clubs...</p>
            </div>
          ) : filteredClubs.length === 0 ? (
            <div className="clubs-empty-state">
              <div className="clubs-empty-state__icon" aria-hidden="true" style={{ display: 'flex', justifyContent: 'center' }}>
                <SearchIcon size={40} />
              </div>
              <h3>No matching clubs found</h3>
              <p>Try adjusting your search query or category filter to find what you are looking for.</p>
            </div>
          ) : (
            pageClubs.map((club) => (
              <ClubCard key={club.id} club={club} onSelect={onSelectClub} />
            ))
          )}
        </div>

        {totalPages > 1 ? (
          <nav className="clubs-pagination" aria-label="Pagination">
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

export default ClubsPage
