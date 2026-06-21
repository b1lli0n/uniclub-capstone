import { useEffect, useMemo, useState } from 'react'
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import {
  ALL_CLUBS,
  ALL_EVENTS,
  CURRENT_USER,
  EVENT_TIMELINES,
  MY_CLUB_MEMBERSHIPS,
} from '../../data/mockData'
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

function parseEventEndDate(event) {
  const endDate = parseEventDate(event.date)
  const endTime = event.time?.split('-')[1]?.trim()
  const timeMatch = endTime?.match(/^(\d{1,2}):(\d{2})$/)

  if (timeMatch) {
    endDate.setHours(Number(timeMatch[1]), Number(timeMatch[2]), 0, 0)
    return endDate
  }

  endDate.setHours(23, 59, 59, 999)
  return endDate
}

function isEventRegistrationOpen(event) {
  const today = new Date()
  today.setHours(0, 0, 0, 0)

  return parseEventDate(event.date).getTime() >= today.getTime()
}

function isBeforeEventStart(event) {
  return Date.now() < parseEventStartDate(event).getTime()
}

function isEventFeedbackOpen(event) {
  return Date.now() > parseEventEndDate(event).getTime()
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

function createTimelineDraft(eventId) {
  return {
    id: '',
    eventId,
    time: '',
    title: '',
    description: '',
    location: '',
  }
}

function canManageEventOperations(role = '') {
  const normalizedRole = role.toLowerCase()
  return normalizedRole === 'leader' || normalizedRole === 'event management'
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

function RatingStars({ rating, onChange, readonly = false }) {
  return (
    <div className="event-detail-rating-stars">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          className={star <= rating ? 'is-active' : ''}
          onClick={() => {
            if (!readonly) onChange?.(star)
          }}
          disabled={readonly}
          aria-label={`${star} star`}
        >
          &#9733;
        </button>
      ))}
    </div>
  )
}

function EventDetailPage() {
  const { clubId, eventId } = useParams()
  const navigate = useNavigate()
  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
  const [editingFeedback, setEditingFeedback] = useState(null)
  const [feedbackDraft, setFeedbackDraft] = useState('')
  const [feedbackRating, setFeedbackRating] = useState(5)
  const [ticketOpen, setTicketOpen] = useState(false)
  const [timelineModalOpen, setTimelineModalOpen] = useState(false)
  const [editingTimeline, setEditingTimeline] = useState(null)
  const [timelineDraft, setTimelineDraft] = useState(() => createTimelineDraft(eventId || ''))
  const [timelines, setTimelines] = useState(EVENT_TIMELINES)
  const [registrations, setRegistrations] = useState({})
  const [feedbacks, setFeedbacks] = useState([])
  const event = useMemo(() => ALL_EVENTS.find((item) => item.id === eventId), [eventId])

  useEffect(() => {
    document.body.classList.toggle('event-ticket-open', ticketOpen)

    return () => {
      document.body.classList.remove('event-ticket-open')
    }
  }, [ticketOpen])

  function getEventRegistration(targetEventId) {
    return registrations[targetEventId] || null
  }

  function registerForEvent(targetEventId) {
    setRegistrations((current) => ({
      ...current,
      [targetEventId]: {
        eventId: targetEventId,
        status: 'accepted',
        checkedIn: false,
        registeredAt: new Date().toLocaleString('en-GB'),
      },
    }))
  }

  function cancelEventRegistration(targetEventId) {
    setRegistrations((current) => {
      const nextRegistrations = { ...current }
      delete nextRegistrations[targetEventId]
      return nextRegistrations
    })
  }

  function checkInEvent(targetEventId) {
    setRegistrations((current) => ({
      ...current,
      [targetEventId]: {
        ...current[targetEventId],
        checkedIn: true,
      },
    }))
  }

  function getEventFeedbacks(targetEventId) {
    return feedbacks.filter((feedbackItem) => feedbackItem.eventId === targetEventId)
  }

  function getMyEventFeedback(targetEventId) {
    return feedbacks.find(
      (feedbackItem) =>
        feedbackItem.eventId === targetEventId &&
        feedbackItem.userId === CURRENT_USER.id
    )
  }

  function createEventFeedback(targetEventId, payload) {
    setFeedbacks((current) => [
      ...current,
      {
        id: `feedback-${targetEventId}-${Date.now()}`,
        eventId: targetEventId,
        userId: CURRENT_USER.id,
        authorName: CURRENT_USER.fullName,
        createdAt: new Date().toLocaleDateString('en-GB'),
        ...payload,
      },
    ])
  }

  function updateEventFeedback(feedbackId, payload) {
    setFeedbacks((current) =>
      current.map((feedbackItem) =>
        feedbackItem.id === feedbackId
          ? {
              ...feedbackItem,
              ...payload,
              updatedAt: new Date().toLocaleDateString('en-GB'),
            }
          : feedbackItem
      )
    )
  }

  function deleteEventFeedback(feedbackId) {
    setFeedbacks((current) => current.filter((feedbackItem) => feedbackItem.id !== feedbackId))
  }

  if (!event) {
    return <Navigate to="/events" replace />
  }

  const organizerMembership = MY_CLUB_MEMBERSHIPS.find((membership) => membership.clubId === event.clubId)
  const isOrganizerMember = Boolean(organizerMembership)
  const canManageTimeline = canManageEventOperations(organizerMembership?.role)

  if (event.visibility === 'private' && !isOrganizerMember) {
    return <Navigate to={`/clubs/${event.clubId}`} replace />
  }

  const registration = getEventRegistration(event.id)
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
  const eventFeedbacks = getEventFeedbacks(event.id)
  const myFeedback = getMyEventFeedback(event.id)
  const eventEnded = isEventFeedbackOpen(event)
  const eventTimelines = timelines
    .filter((timelineItem) => timelineItem.eventId === event.id)
    .sort((firstItem, secondItem) => firstItem.time.localeCompare(secondItem.time))

  function openFeedbackModal(feedbackItem = null) {
    setEditingFeedback(feedbackItem)
    setFeedbackDraft(feedbackItem?.comment || '')
    setFeedbackRating(feedbackItem?.rating || 5)
    setFeedbackModalOpen(true)
  }

  function closeFeedbackModal() {
    setFeedbackModalOpen(false)
    setEditingFeedback(null)
    setFeedbackDraft('')
    setFeedbackRating(5)
  }

  function handleFeedbackSubmit(submitEvent) {
    submitEvent.preventDefault()
    const comment = feedbackDraft.trim()

    if (!comment) return

    const payload = {
      rating: feedbackRating,
      comment,
    }

    if (editingFeedback) {
      updateEventFeedback(editingFeedback.id, payload)
    } else if (!myFeedback) {
      createEventFeedback(event.id, payload)
    }

    closeFeedbackModal()
  }

  function openTimelineModal(timelineItem = null) {
    setEditingTimeline(timelineItem)
    setTimelineDraft(timelineItem ? { ...timelineItem } : createTimelineDraft(event.id))
    setTimelineModalOpen(true)
  }

  function closeTimelineModal() {
    setTimelineModalOpen(false)
    setEditingTimeline(null)
    setTimelineDraft(createTimelineDraft(event.id))
  }

  function updateTimelineDraft(field, value) {
    setTimelineDraft((current) => ({
      ...current,
      [field]: value,
    }))
  }

  function handleTimelineSubmit(submitEvent) {
    submitEvent.preventDefault()

    const nextTimeline = {
      ...timelineDraft,
      id: timelineDraft.id || `timeline-${event.id}-${Date.now()}`,
      eventId: event.id,
      time: timelineDraft.time.trim(),
      title: timelineDraft.title.trim(),
      description: timelineDraft.description.trim(),
      location: timelineDraft.location.trim(),
    }

    if (!nextTimeline.time || !nextTimeline.title || !nextTimeline.description) return

    setTimelines((items) => {
      if (editingTimeline) {
        return items.map((item) => (item.id === editingTimeline.id ? nextTimeline : item))
      }

      return [...items, nextTimeline]
    })
    closeTimelineModal()
  }

  function deleteTimeline(timelineId) {
    setTimelines((items) => items.filter((item) => item.id !== timelineId))
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
                <li>Time: {event.date}</li>
                <li>Location: {event.location || 'Campus'}</li>
              </ul>
              <h3>3. Meaning</h3>
              <p>
                Build new connections, experience campus life, and keep memorable moments with
                UniClub.
              </p>
            </article>

            <section className="event-detail-timeline">
              <header>
                <div>
                  <h2>Event Timeline</h2>
                  <span>{eventTimelines.length} {eventTimelines.length === 1 ? 'item' : 'items'}</span>
                </div>
                {canManageTimeline ? (
                  <button type="button" onClick={() => openTimelineModal()}>
                    Add item
                  </button>
                ) : null}
              </header>

              {eventTimelines.length > 0 ? (
                <div className="event-detail-timeline-list">
                  {eventTimelines.map((timelineItem) => (
                    <article key={timelineItem.id} className="event-detail-timeline-item">
                      <div className="event-detail-timeline-time">
                        <span>{timelineItem.time}</span>
                      </div>
                      <div className="event-detail-timeline-content">
                        <div>
                          <h3>{timelineItem.title}</h3>
                          {timelineItem.location ? <small>{timelineItem.location}</small> : null}
                        </div>
                        <p>{timelineItem.description}</p>
                        {canManageTimeline ? (
                          <div className="event-detail-timeline-actions">
                            <button type="button" onClick={() => openTimelineModal(timelineItem)}>
                              Edit
                            </button>
                            <button type="button" className="is-danger" onClick={() => deleteTimeline(timelineItem.id)}>
                              Delete
                            </button>
                          </div>
                        ) : null}
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="event-detail-empty-timeline">
                  No timeline has been added for this event yet.
                </div>
              )}
            </section>

            <section className="event-detail-feedback">
              <header>
                <div>
                  <h2>Feedback</h2>
                  <span>{eventFeedbacks.length} {eventFeedbacks.length === 1 ? 'review' : 'reviews'}</span>
                </div>
                <button
                  type="button"
                  className="event-detail-feedback-open"
                  onClick={() => openFeedbackModal(myFeedback || null)}
                >
                  {myFeedback ? 'Update my feedback' : 'Write feedback'}
                </button>
              </header>

              <p className="event-detail-feedback-note">
                {eventEnded
                  ? 'Students can share feedback for this completed event.'
                  : 'You can draft feedback now; BE can decide final submission rules later.'}
              </p>

              {eventFeedbacks.length > 0 ? (
                <div className="event-detail-feedback-list">
                  {eventFeedbacks.map((feedbackItem) => {
                    const isMine = feedbackItem.userId === CURRENT_USER.id

                    return (
                      <article key={feedbackItem.id} className="event-detail-feedback-item">
                        <div className="event-detail-feedback-avatar" aria-hidden="true">
                          {feedbackItem.authorName.slice(0, 1)}
                        </div>
                        <div className="event-detail-feedback-content">
                          <div className="event-detail-feedback-topline">
                            <div>
                              <strong>{feedbackItem.authorName}</strong>
                              <span>
                                {feedbackItem.updatedAt
                                  ? `Updated ${feedbackItem.updatedAt}`
                                  : feedbackItem.createdAt}
                              </span>
                            </div>
                            <RatingStars rating={feedbackItem.rating} readonly />
                          </div>
                          <p>{feedbackItem.comment}</p>
                          {isMine ? (
                            <div className="event-detail-feedback-actions">
                              <button type="button" onClick={() => openFeedbackModal(feedbackItem)}>
                                Edit
                              </button>
                              <button
                                type="button"
                                className="is-danger"
                                onClick={() => deleteEventFeedback(feedbackItem.id)}
                              >
                                Delete
                              </button>
                            </div>
                          ) : null}
                        </div>
                      </article>
                    )
                  })}
                </div>
              ) : (
                <div className="event-detail-empty-feedback">No feedback yet.</div>
              )}
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
                <button type="button" className="event-detail-primary" onClick={() => registerForEvent(event.id)}>
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
                      onClick={() => cancelEventRegistration(event.id)}
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
                    <button type="button" className="event-detail-primary" onClick={() => checkInEvent(event.id)}>
                      Check in
                    </button>
                  ) : null}

                  {registration ? (
                    <button
                      type="button"
                      className="event-detail-primary"
                      onClick={() => setTicketOpen(true)}
                    >
                      View registration info
                    </button>
                  ) : null}
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
              <p>Show this QR code to event management at the check-in counter.</p>
            </div>
          </section>
        </div>
      ) : null}

      {feedbackModalOpen ? (
        <div className="event-feedback-modal" role="dialog" aria-modal="true" aria-labelledby="event-feedback-title">
          <button
            type="button"
            className="event-feedback-modal__backdrop"
            aria-label="Close feedback form"
            onClick={closeFeedbackModal}
          />
          <form className="event-feedback-modal__panel" onSubmit={handleFeedbackSubmit}>
            <header>
              <div>
                <span>{event.name}</span>
                <h2 id="event-feedback-title">
                  {editingFeedback ? 'Update feedback' : 'Write feedback'}
                </h2>
              </div>
              <button type="button" onClick={closeFeedbackModal} aria-label="Close feedback form">
                X
              </button>
            </header>

            <label className="event-detail-rating">
              <span>Rating:</span>
              <RatingStars rating={feedbackRating} onChange={setFeedbackRating} />
            </label>

            <label className="event-feedback-modal__field">
              <span>Feedback</span>
              <textarea
                value={feedbackDraft}
                onChange={(eventChange) => setFeedbackDraft(eventChange.target.value)}
                placeholder="Write your feedback..."
                rows={5}
                autoFocus
              />
            </label>

            <div className="event-feedback-modal__actions">
              <button type="button" className="event-feedback-modal__cancel" onClick={closeFeedbackModal}>
                Cancel
              </button>
              <button type="submit" className="event-detail-feedback-submit" disabled={!feedbackDraft.trim()}>
                {editingFeedback ? 'Save changes' : 'Send feedback'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {timelineModalOpen ? (
        <div className="event-feedback-modal" role="dialog" aria-modal="true" aria-labelledby="event-timeline-title">
          <button
            type="button"
            className="event-feedback-modal__backdrop"
            aria-label="Close timeline form"
            onClick={closeTimelineModal}
          />
          <form className="event-feedback-modal__panel event-timeline-modal__panel" onSubmit={handleTimelineSubmit}>
            <header>
              <div>
                <span>{event.name}</span>
                <h2 id="event-timeline-title">
                  {editingTimeline ? 'Update timeline item' : 'Create timeline item'}
                </h2>
              </div>
              <button type="button" onClick={closeTimelineModal} aria-label="Close timeline form">
                X
              </button>
            </header>

            <div className="event-timeline-modal__grid">
              <label className="event-feedback-modal__field">
                <span>Time *</span>
                <input
                  type="text"
                  value={timelineDraft.time}
                  onChange={(eventChange) => updateTimelineDraft('time', eventChange.target.value)}
                  placeholder="HH:mm"
                  maxLength={5}
                  required
                />
              </label>
              <label className="event-feedback-modal__field">
                <span>Location</span>
                <input
                  type="text"
                  value={timelineDraft.location}
                  onChange={(eventChange) => updateTimelineDraft('location', eventChange.target.value)}
                  placeholder="Room, hall, or checkpoint..."
                />
              </label>
            </div>

            <label className="event-feedback-modal__field">
              <span>Title *</span>
              <input
                type="text"
                value={timelineDraft.title}
                onChange={(eventChange) => updateTimelineDraft('title', eventChange.target.value)}
                placeholder="Example: Opening ceremony"
                required
              />
            </label>

            <label className="event-feedback-modal__field">
              <span>Description *</span>
              <textarea
                value={timelineDraft.description}
                onChange={(eventChange) => updateTimelineDraft('description', eventChange.target.value)}
                placeholder="Describe what happens in this timeline item..."
                rows={4}
                required
              />
            </label>

            <div className="event-feedback-modal__actions">
              <button type="button" className="event-feedback-modal__cancel" onClick={closeTimelineModal}>
                Cancel
              </button>
              <button
                type="submit"
                className="event-detail-feedback-submit"
                disabled={!timelineDraft.time.trim() || !timelineDraft.title.trim() || !timelineDraft.description.trim()}
              >
                {editingTimeline ? 'Save changes' : 'Create item'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}

export default EventDetailPage
