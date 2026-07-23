import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getClubById } from '../../api/club.api'
import { getMyClubs } from '../../api/memberClubMembership.api'
import { getClubEventsForMember, getPublicEvents } from '../../api/event.api'
import '../../styles/club-detail.css'

const VISIBILITY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'public', label: 'Public' },
  { id: 'private', label: 'Private' },
]

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
  const formattedTime = startDate ? startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''
  const category = (apiEvent.category || 'academic').toLowerCase()

  return {
    id: apiEvent._id || apiEvent.id,
    name: apiEvent.title || '',
    description: apiEvent.description || '',
    date: formattedDate,
    time: formattedTime,
    location: apiEvent.location || 'Campus',
    visibility: apiEvent.is_public ? 'public' : 'private',
    checkinOpen: apiEvent.check_in_status === 'open',
    categoryLabel: category.toUpperCase(),
    gradient: CATEGORY_GRADIENTS[category] || CATEGORY_GRADIENTS.academic,
    imageUrl: apiEvent.media_uris?.[0] || '',
  }
}

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
  
  const [club, setClub] = useState(null)
  const [isClubMember, setIsClubMember] = useState(false)
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function loadData() {
      setLoading(true)
      try {
        const [clubRes, myClubsRes] = await Promise.all([
          getClubById(clubId),
          getMyClubs().catch(() => ({ data: [] })),
        ])

        if (!active) return

        setClub(clubRes.data)

        const membership = (myClubsRes.data || []).find((item) => {
          const id = item.club_id?._id || item.club_id
          return String(id) === String(clubId)
        })
        const memberStatus = Boolean(membership)
        setIsClubMember(memberStatus)

        let eventsRes
        if (memberStatus) {
          eventsRes = await getClubEventsForMember(clubId).catch(() => ({ data: [] }))
        } else {
          eventsRes = await getPublicEvents({ clubId }).catch(() => ({ data: [] }))
        }

        if (!active) return
        setEvents(eventsRes.data || [])
      } catch (err) {
        console.error("Error loading club events:", err)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadData()
    return () => { active = false }
  }, [clubId])

  const visibleEvents = useMemo(() => {
    const query = search.trim().toLowerCase()

    return events
      .map(mapEventFromApi)
      .filter(Boolean)
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
  }, [events, isClubMember, search, visibility])

  const hiddenPrivateCount = useMemo(() => {
    return events.filter((ev) => !ev.is_public).length - 
           events.filter((ev) => !ev.is_public && isClubMember).length
  }, [events, isClubMember])

  if (loading) {
    return (
      <div className="club-events-page" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <p>Loading club events...</p>
      </div>
    )
  }

  if (!club) {
    return (
      <div className="club-events-page" style={{ padding: '4rem 0', textAlign: 'center' }}>
        <p>Club not found.</p>
        <button type="button" onClick={() => navigate('/clubs')}>Back to clubs</button>
      </div>
    )
  }

  return (
    <div className="club-events-page">
      <section className="club-events-hero">
        <button type="button" className="club-events-back" onClick={() => navigate(`/clubs/${club._id || club.id}`)}>
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
            <div className="club-events-card__media" style={{ '--event-gradient': event.gradient, position: 'relative', overflow: 'hidden' }}>
              {event.imageUrl ? (
                <img src={event.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
              ) : (
                <CalendarIcon />
              )}
              <span style={{ position: 'relative', zIndex: 1 }}>{event.categoryLabel}</span>
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
              onClick={() => navigate(`/clubs/${club._id || club.id}/events/${event.id}`)}
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
