import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { ALL_CLUBS, ALL_EVENTS, CURRENT_USER, MY_CLUB_MEMBERSHIPS } from '../../data/mockData'
import '../../styles/clubs.css'

function parseEventDate(dateText) {
  const [day, month, year] = dateText.split('/').map(Number)
  return new Date(year, month - 1, day)
}

function parseEventStartDate(event) {
  const startDate = parseEventDate(event.date)
  const startTime = event.time?.split('-')[0]?.trim()
  const timeMatch = startTime?.match(/^(\d{1,2}):(\d{2})$/)

  if (timeMatch) {
    startDate.setHours(Number(timeMatch[1]), Number(timeMatch[2]), 0, 0)
  }

  return startDate
}

function isEventRegistrationOpen(event) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return parseEventDate(event.date).getTime() >= today.getTime()
}

function isBeforeEventStart(event) {
  return Date.now() < parseEventStartDate(event).getTime()
}

function getRegistrationLabel(status) {
  if (status === 'accepted') return 'Accepted'
  if (status === 'pending') return 'Pending approval'
  if (status === 'cancelled') return 'Cancelled'
  return 'Not registered'
}

function getEventStatus(event) {
  if (isEventRegistrationOpen(event)) return 'Opening'
  return 'Started'
}

function buildTicketCode(eventId, userId) {
  return `${eventId}-${userId}`.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)
}

function TicketQr({ value }) {
  const cells = Array.from({ length: 225 }, (_, index) => {
    const row = Math.floor(index / 15)
    const col = index % 15
    const inTopLeft = row < 5 && col < 5
    const inTopRight = row < 5 && col > 9
    const inBottomLeft = row > 9 && col < 5
    const finder = inTopLeft || inTopRight || inBottomLeft

    if (finder) {
      const localRow = row % 10
      const localCol = col % 10
      return localRow === 0 || localRow === 4 || localCol === 0 || localCol === 4 || (localRow === 2 && localCol === 2)
    }

    let hash = 0
    for (let i = 0; i < value.length; i += 1) {
      hash = (hash * 31 + value.charCodeAt(i) + index) % 997
    }

    return (hash + row * 7 + col * 11) % 3 !== 0
  })

  return (
    <div className="event-ticket-qr" aria-label={`QR check-in code ${value}`}>
      {cells.map((active, index) => (
        <span key={index} className={active ? 'is-active' : ''} />
      ))}
    </div>
  )
}

function EventDetailPage() {
  const { clubId, eventId } = useParams()
  const navigate = useNavigate()
  const [ticketOpen, setTicketOpen] = useState(false)
  const [registration, setRegistration] = useState(null)

  const event = useMemo(() => ALL_EVENTS.find((item) => item.id === eventId), [eventId])

  useEffect(() => {
    setRegistration(null)
    setTicketOpen(false)
  }, [eventId])

  useEffect(() => {
    document.body.classList.toggle('event-ticket-open', ticketOpen)

    return () => {
      document.body.classList.remove('event-ticket-open')
    }
  }, [ticketOpen])

  if (!event) {
    return <Navigate to={clubId ? `/clubs/${clubId}/events` : '/events'} replace />
  }

  const isOrganizerMember = MY_CLUB_MEMBERSHIPS.some((membership) => membership.clubId === event.clubId)

  if (event.visibility === 'private' && !isOrganizerMember) {
    return <Navigate to={`/clubs/${event.clubId}`} replace />
  }

  const canCancel = Boolean(registration) && !registration.checkedIn && isBeforeEventStart(event)
  const canRegister = !registration && isEventRegistrationOpen(event)
  const canCheckIn = registration?.status === 'accepted' && event.checkinOpen && !registration.checkedIn
  const statusText = getEventStatus(event)
  const organizerClub = ALL_CLUBS.find((club) => club.id === event.clubId)
  const organizerName = organizerClub?.name || 'UniClub'
  const organizerInitial = organizerName.slice(0, 1).toUpperCase()
  const ticketCode = buildTicketCode(event.id, CURRENT_USER.id)
  const studentPhone = CURRENT_USER.phone || 'Not updated'
  const studentEmail = CURRENT_USER.email || 'Not updated'

  function registerForEvent() {
    setRegistration({
      status: 'pending',
      registeredAt: new Date().toLocaleDateString('en-GB'),
      checkedIn: false,
    })
  }

  function cancelEventRegistration() {
    setRegistration(null)
    setTicketOpen(false)
  }

  function checkInEvent() {
    setRegistration((current) =>
      current
        ? {
            ...current,
            checkedIn: true,
          }
        : current
    )
  }

  return (
    <div className="event-detail-page">
      <div className="event-detail-shell">
        <Link className="event-detail-back" to={clubId ? `/clubs/${clubId}/events` : '/events'}>
          <span aria-hidden="true">&lt;</span>
          {clubId ? 'Back to club events' : 'Back to events'}
        </Link>

        <div className="event-detail-layout">
          <main className="event-detail-main">
            <section className="event-detail-hero">
              <span className="event-detail-status">{statusText}</span>
              <div className="event-detail-title-row">
                <h1>{event.name}</h1>
                <span>{event.categoryLabel}</span>
              </div>

              <div className="event-detail-host">
                <span className="event-detail-host__avatar" aria-hidden="true">{organizerInitial}</span>
                <div>
                  <strong>{organizerName}</strong>
                  <small>Organizing club</small>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    if (organizerClub) {
                      navigate(`/clubs/${organizerClub.id}`)
                    }
                  }}
                  disabled={!organizerClub}
                >
                  Contact
                </button>
              </div>
            </section>

            <article className="event-detail-section">
              <h2>Event details</h2>
              <h3>1. Introduction</h3>
              <p>{event.description}</p>

              <h3>2. Main activities</h3>
              <ul>
                <li>Connect with students who share the same interests.</li>
                <li>Join activities prepared by the club organizer.</li>
                <li>Time: {event.date} {event.time ? `- ${event.time}` : ''}</li>
                <li>Location: {event.location || 'Campus'}</li>
              </ul>

              <h3>3. Meaning</h3>
              <p>
                Build new connections, experience campus life, and keep memorable moments with
                UniClub.
              </p>
            </article>

            <section className="event-detail-feedback">
              <header>
                <h2>Feedback</h2>
                <span>Feedback section can be connected later.</span>
              </header>
              <div className="event-detail-empty-feedback">No feedback yet.</div>
            </section>
          </main>

          <aside className="event-detail-register-card">
            <div className="event-detail-visual" style={{ '--event-gradient': event.gradient }}>
              <span>{event.categoryLabel}</span>
            </div>

            <div className="event-detail-register-grid">
              <div>
                <span>Start date</span>
                <strong>{event.date}</strong>
              </div>
              <div>
                <span>Check-in</span>
                <strong>{event.checkinOpen ? 'Open' : 'Not open'}</strong>
              </div>
              <div>
                <span>Location</span>
                <strong>{event.location || 'Campus'}</strong>
              </div>
              <div>
                <span>Participants</span>
                <strong>{event.participants}</strong>
              </div>
            </div>

            <div className="event-detail-register-state">
              <span>Registration status</span>
              <strong>{getRegistrationLabel(registration?.status)}</strong>
              {registration?.registeredAt ? (
                <small>Registered at {registration.registeredAt}</small>
              ) : null}
            </div>

            <div className="event-detail-actions">
              {canRegister ? (
                <button type="button" className="event-detail-primary" onClick={registerForEvent}>
                  Register for event
                </button>
              ) : null}

              {!registration && !isEventRegistrationOpen(event) ? (
                <p>Registration is closed because this event has already started.</p>
              ) : null}

              {registration ? (
                <>
                  {canCancel ? (
                    <button
                      type="button"
                      className="event-detail-secondary"
                      onClick={cancelEventRegistration}
                    >
                      Cancel registration
                    </button>
                  ) : registration.checkedIn ? (
                    <p>Cancellation is unavailable after check-in.</p>
                  ) : (
                    <p>Cancellation is unavailable after the event starts.</p>
                  )}

                  {registration.status === 'pending' ? (
                    <p>Your registration is waiting for approval.</p>
                  ) : null}

                  {registration.status === 'accepted' && !event.checkinOpen ? (
                    <p>Check-in is not open yet.</p>
                  ) : null}

                  {canCheckIn ? (
                    <button type="button" className="event-detail-primary" onClick={checkInEvent}>
                      Check in
                    </button>
                  ) : null}

                  <button
                    type="button"
                    className="event-detail-primary"
                    onClick={() => setTicketOpen(true)}
                  >
                    View registration info
                  </button>
                </>
              ) : null}
            </div>
          </aside>
        </div>
      </div>

      {ticketOpen && registration ? (
        <div className="event-ticket-modal" role="dialog" aria-modal="true" aria-labelledby="event-ticket-title">
          <button
            type="button"
            className="event-ticket-modal__backdrop"
            aria-label="Close registration info"
            onClick={() => setTicketOpen(false)}
          />
          <section className="event-ticket">
            <div className="event-ticket__notches" aria-hidden="true" />
            <header className="event-ticket__header">
              <div>
                <span>Event ticket</span>
                <h2 id="event-ticket-title">{event.name}</h2>
              </div>
              <button type="button" onClick={() => setTicketOpen(false)}>Close</button>
            </header>

            <div className="event-ticket__body">
              <div className="event-ticket__poster" style={{ '--event-gradient': event.gradient }}>
                <span>{event.categoryLabel}</span>
              </div>

              <div className="event-ticket__info">
                <div>
                  <span>Name</span>
                  <strong>{CURRENT_USER.fullName}</strong>
                </div>
                <div>
                  <span>Phone</span>
                  <strong>{studentPhone}</strong>
                </div>
                <div>
                  <span>FPT email</span>
                  <strong>{studentEmail}</strong>
                </div>
                <div>
                  <span>Event</span>
                  <strong>{event.name}</strong>
                </div>
                <div>
                  <span>Location</span>
                  <strong>{event.location || 'Campus'}</strong>
                </div>
                <div>
                  <span>Event time</span>
                  <strong>{event.time || event.date}</strong>
                </div>
              </div>
            </div>

            <div className="event-ticket__divider" aria-hidden="true" />

            <div className="event-ticket__checkin">
              <div>
                <TicketQr value={ticketCode} />
                <strong>{ticketCode}</strong>
              </div>
              <p>Show this QR code to the event leader at the check-in counter.</p>
            </div>
          </section>
        </div>
      ) : null}
    </div>
  )
}

export default EventDetailPage