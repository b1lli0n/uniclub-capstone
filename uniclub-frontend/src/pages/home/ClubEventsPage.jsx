import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { getClubById } from '../../api/club.api'
import { getMyClubs } from '../../api/memberClubMembership.api'
import { getClubEventsForMember, getPublicEvents } from '../../api/event.api'
import '../../styles/club-detail.css'
import Pagination from '../../components/common/Pagination'

import { resolveEventUploadImage } from '../../utils/imageUtils'
import { formatDateVN, formatTimeRange24 } from '../../utils/dateTimeUtils'

const EVENTS_PER_PAGE = 6

const VISIBILITY_FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'public', label: 'Public' },
  { id: 'private', label: 'Private' },
]

const CATEGORY_GRADIENTS = {
  academic: 'linear-gradient(135deg, #ffd7a8 0%, #ffb36b 100%)',
  culture: 'linear-gradient(135deg, #ffd1dc 0%, #ff9ebb 100%)',
  sports: 'linear-gradient(135deg, #c2e9fb 0%, #81d4fa 100%)',
  community: 'linear-gradient(135deg, #d1f2d9 0%, #a3e9b5 100%)',
  event: 'linear-gradient(135deg, #c4f0a8 0%, #9ed87e 100%)',
}

function mapEventFromApi(apiEvent) {
  if (!apiEvent) return null
  const startDate = apiEvent.start_time ? new Date(apiEvent.start_time) : null
  const endDate = apiEvent.end_time ? new Date(apiEvent.end_time) : startDate
  const now = new Date()

  // Kiểm tra xem sự kiện đã qua ngày / kết thúc hay chưa
  const isPast = endDate ? endDate < now : false
  const isOngoing = startDate && endDate ? (startDate <= now && now <= endDate) : false
  const isUpcoming = startDate ? startDate > now : false

  const formattedDate = formatDateVN(apiEvent.start_time)
  const formattedTime = formatTimeRange24(apiEvent.start_time, apiEvent.end_time)
  const category = (apiEvent.category || 'academic').toLowerCase()

  let statusLabel = 'Upcoming'
  let statusTone = 'upcoming'

  if (apiEvent.check_in_status === 'open') {
    statusLabel = 'Check-in Open'
    statusTone = 'open'
  } else if (isOngoing) {
    statusLabel = 'Ongoing'
    statusTone = 'ongoing'
  } else if (isPast) {
    statusLabel = 'Ended'
    statusTone = 'ended'
  } else {
    statusLabel = 'Upcoming'
    statusTone = 'upcoming'
  }

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
    imageUrl: resolveEventUploadImage(apiEvent.media_uris || apiEvent.image_url, category),
    isPast,
    isOngoing,
    isUpcoming,
    statusLabel,
    statusTone,
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
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [visibility, search])
  
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

  const totalPages = Math.max(1, Math.ceil(visibleEvents.length / EVENTS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * EVENTS_PER_PAGE
    return visibleEvents.slice(startIndex, startIndex + EVENTS_PER_PAGE)
  }, [visibleEvents, currentPage])

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
        {paginatedEvents.map((event) => (
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
                <span className={`club-event-card__tag club-event-card__tag--${event.statusTone}`}>
                  {event.statusLabel}
                </span>
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        ariaLabel="Club events pagination"
      />

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
