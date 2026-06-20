import { useMemo, useState } from 'react'
import { Navigate, useNavigate, useParams } from 'react-router-dom'
import { ALL_CLUBS, ALL_EVENTS, MY_CLUB_MEMBERSHIPS } from '../../data/mockData'
import '../../styles/club-detail.css'

const VISIBILITY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'public', label: 'Public' },
  { id: 'private', label: 'Private' },
]

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" strokeLinecap="round" />
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

function ClubEventsPage() {
  const { clubId } = useParams()
  const navigate = useNavigate()
  const [visibility, setVisibility] = useState('all')
  const [search, setSearch] = useState('')
  const club = ALL_CLUBS.find((item) => item.id === clubId)
  const membership = MY_CLUB_MEMBERSHIPS.find((item) => item.clubId === clubId)
  const isClubMember = Boolean(membership)

  const visibleEvents = useMemo(() => {
    const query = search.trim().toLowerCase()

    return ALL_EVENTS
      .filter((event) => event.clubId === clubId)
      .filter((event) => event.visibility !== 'private' || isClubMember)
      .filter((event) => visibility === 'all' || (event.visibility || 'public') === visibility)
      .filter((event) => {
        if (!query) return true

        return (
          event.name.toLowerCase().includes(query) ||
          event.description.toLowerCase().includes(query) ||
          (event.location || '').toLowerCase().includes(query)
        )
      })
  }, [clubId, isClubMember, search, visibility])

  const hiddenPrivateCount = ALL_EVENTS.filter(
    (event) => event.clubId === clubId && event.visibility === 'private'
  ).length - ALL_EVENTS.filter(
    (event) => event.clubId === clubId && event.visibility === 'private' && isClubMember
  ).length

  if (!club) {
    return <Navigate to="/clubs" replace />
  }

  return (
    <div className="club-events-page">
      <section className="club-events-hero">
        <button type="button" className="club-events-back" onClick={() => navigate(`/clubs/${club.id}`)}>
          <span aria-hidden="true">&lt;</span>
          Back to club
        </button>
        <div>
          <span>{club.name}</span>
          <h1>Club Events</h1>
          <p>
            {isClubMember
              ? 'Public and private activities organized inside this club.'
              : 'Public activities available before joining this club.'}
          </p>
        </div>
      </section>

      <section className="club-events-toolbar" aria-label="Club event filters">
        <div className="club-events-filters">
          {VISIBILITY_FILTERS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={visibility === filter.id ? 'is-active' : ''}
              onClick={() => setVisibility(filter.id)}
              disabled={filter.id === 'private' && !isClubMember}
            >
              {filter.label}
            </button>
          ))}
        </div>

        <label className="club-events-search">
          <span>Search</span>
          <input
            type="search"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search events..."
          />
        </label>
      </section>

      <section className="club-events-list" aria-label={`${club.name} events`}>
        {visibleEvents.map((event) => (
          <article key={event.id} className="club-events-card">
            <div className="club-events-card__media" style={{ '--event-gradient': event.gradient }}>
              <CalendarIcon />
              <span>{event.categoryLabel}</span>
            </div>

            <div className="club-events-card__body">
              <div className="club-events-card__badges">
                <span className="club-event-card__tag">{event.checkinOpen ? 'Open' : 'Upcoming'}</span>
                <span className={`club-event-card__visibility club-event-card__visibility--${event.visibility || 'public'}`}>
                  {event.visibility === 'private' ? 'Private' : 'Public'}
                </span>
              </div>
              <h2>{event.name}</h2>
              <p>{event.description}</p>
              <div className="club-events-card__meta">
                <span>{event.date}</span>
                <span>{event.time}</span>
                <span>{event.location || 'Campus'}</span>
              </div>
            </div>

            <button
              type="button"
              className="club-events-card__action"
              aria-label={`View ${event.name}`}
              onClick={() => navigate(`/clubs/${club.id}/events/${event.id}`)}
            >
              <ArrowIcon />
            </button>
          </article>
        ))}
      </section>

      {visibleEvents.length === 0 ? (
        <p className="club-events-empty">No club events match this filter.</p>
      ) : null}

      {hiddenPrivateCount > 0 ? (
        <p className="club-event-private-note">
          {hiddenPrivateCount} private event{hiddenPrivateCount > 1 ? 's are' : ' is'} visible to club members only.
        </p>
      ) : null}
    </div>
  )
}

export default ClubEventsPage
