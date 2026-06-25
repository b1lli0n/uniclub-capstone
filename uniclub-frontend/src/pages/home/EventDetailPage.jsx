import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  getEventDetail,
  registerForEvent as registerForEventApi,
  cancelEventRegistration as cancelEventRegistrationApi,
} from '../../api/event.api'
import { getMyProfile } from '../../api/profile.api'
import {
  getEventFeedback,
  submitEventFeedback as submitEventFeedbackApi,
  updateEventFeedback as updateEventFeedbackApi,
  deleteEventFeedback as deleteEventFeedbackApi,
} from '../../api/feedback.api'
import '../../styles/clubs.css'

function isEventRegistrationOpen(event) {
  return event.status === 'opening' && new Date() < new Date(event.start_time)
}

function isBeforeEventStart(event) {
  return new Date() < new Date(event.start_time)
}

function getRegistrationLabel(status) {
  if (status === 'registered' || status === 'approved') return 'Registered'
  if (status === 'attended') return 'Attended'
  if (status === 'cancelled' || status === 'rejected') return 'Cancelled'
  if (status === 'pending') return 'Pending'
  return 'Not registered'
}

function getEventStatus(event) {
  if (event.status === 'opening') return 'Opening'
  if (event.status === 'coming soon') return 'Coming soon'
  if (event.status === 'closed') return 'Closed'
  if (event.status === 'cancelled') return 'Cancelled'
  return event.status
}

function buildTicketCode(eventId, userId) {
  return `${eventId}-${userId}`.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 12)
}

function TicketQr({ value }) {
  const cells = Array.from({ length: 225 }, (_, index) => {
    const row = Math.floor(index / 15)
    const col = index % 15
    const finder = (row < 5 && col < 5) || (row < 5 && col > 9) || (row > 9 && col < 5)

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

function mapEventFromApi(apiEvent) {
  if (!apiEvent) return null
  const startDate = apiEvent.start_time ? new Date(apiEvent.start_time) : null
  const endDate = apiEvent.end_time ? new Date(apiEvent.end_time) : null
  
  const formattedDate = startDate ? startDate.toLocaleDateString('vi-VN') : ''
  const formattedTime = startDate && endDate 
    ? `${startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })} - ${endDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })}`
    : ''
  
  return {
    id: apiEvent._id || apiEvent.id,
    name: apiEvent.title || '',
    description: apiEvent.description || '',
    content: apiEvent.content || '',
    date: formattedDate,
    time: formattedTime,
    start_time: apiEvent.start_time,
    end_time: apiEvent.end_time,
    location: apiEvent.location || 'Campus',
    visibility: apiEvent.is_public ? 'public' : 'private',
    checkinOpen: apiEvent.check_in_status === 'open',
    status: apiEvent.status || 'coming soon',
    categoryLabel: (apiEvent.category || 'ACADEMIC').toUpperCase(),
    clubId: apiEvent.club_id?._id || apiEvent.club_id,
    organizerName: apiEvent.club_id?.name || 'UniClub',
    organizerLogo: apiEvent.club_id?.logo_url || '',
    capacity: apiEvent.capacity,
    registeredCount: apiEvent.registeredCount || 0,
    isRegistered: apiEvent.isRegistered || false,
    registrationStatus: apiEvent.registrationStatus || null,
  }
}

function RatingStars({ rating, onChange, readonly = false }) {
  return (
    <div className="event-detail-rating-stars" style={{ display: 'flex', gap: '0.3rem' }}>
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          style={{
            background: 'none',
            border: 'none',
            cursor: readonly ? 'default' : 'pointer',
            fontSize: '1.4rem',
            padding: 0,
            color: star <= rating ? '#F57C00' : '#d2c8bc',
          }}
          onClick={() => {
            if (!readonly) onChange?.(star)
          }}
          disabled={readonly}
          aria-label={`${star} star`}
        >
          ★
        </button>
      ))}
    </div>
  )
}

function EventDetailPage() {
  const { clubId, eventId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [event, setEvent] = useState(null)
  const [profile, setProfile] = useState(null)
  const [ticketOpen, setTicketOpen] = useState(false)
  const [registration, setRegistration] = useState(null)
  const [feedbacks, setFeedbacks] = useState([])
  const [myFeedback, setMyFeedback] = useState(null)

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
  const [editingFeedback, setEditingFeedback] = useState(null)
  const [feedbackDraft, setFeedbackDraft] = useState('')
  const [feedbackRating, setFeedbackRating] = useState(5)

  async function loadEventData() {
    setLoading(true)
    try {
      const [eventRes, profileRes, feedbackRes] = await Promise.all([
        getEventDetail(eventId),
        getMyProfile().catch(() => ({ data: { user: null } })),
        getEventFeedback(eventId).catch(() => ({ data: { feedbacks: [], myFeedback: null } }))
      ])
      
      const mapped = mapEventFromApi(eventRes.data)
      setEvent(mapped)
      setProfile(profileRes.data?.user)
      setFeedbacks(feedbackRes.data?.feedbacks || [])
      setMyFeedback(feedbackRes.data?.myFeedback || null)
      
      if (mapped.isRegistered) {
        setRegistration({
          status: mapped.registrationStatus || 'registered',
          registeredAt: '',
          checkedIn: mapped.registrationStatus === 'attended',
        })
      } else {
        setRegistration(null)
      }
      setErrorMsg('')
    } catch (err) {
      console.error(err)
      setErrorMsg(err.message || 'Failed to load event details')
      setEvent(null)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadEventData()
    setTicketOpen(false)
    setFeedbackModalOpen(false)
  }, [eventId])

  useEffect(() => {
    document.body.classList.toggle('event-ticket-open', ticketOpen)

    return () => {
      document.body.classList.remove('event-ticket-open')
    }
  }, [ticketOpen])

  const isRegistered = event?.isRegistered
  const canCancel = isRegistered && (registration?.status === 'registered' || registration?.status === 'approved' || registration?.status === 'pending') && isBeforeEventStart(event)
  const canRegister = !isRegistered && isEventRegistrationOpen(event)
  const canCheckIn = (registration?.status === 'registered' || registration?.status === 'approved') && event?.checkinOpen && !registration?.checkedIn
  const statusText = event ? getEventStatus(event) : ''
  const organizerName = event?.organizerName || 'UniClub'
  const organizerInitial = organizerName.slice(0, 1).toUpperCase()
  const ticketCode = event?.id && profile ? buildTicketCode(event.id, profile._id) : ''
  const studentPhone = profile?.phone || 'Not updated'
  const studentEmail = profile?.email || 'Not updated'

  async function registerForEvent() {
    try {
      const res = await registerForEventApi(eventId)
      alert(res.message || 'Registered successfully!')
      loadEventData()
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to register')
    }
  }

  async function cancelEventRegistration() {
    try {
      const res = await cancelEventRegistrationApi(eventId)
      alert(res.message || 'Registration cancelled successfully!')
      loadEventData()
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to cancel registration')
    }
  }

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

  async function handleFeedbackSubmit(submitEvent) {
    submitEvent.preventDefault()

    const comment = feedbackDraft.trim()
    if (!comment) return

    try {
      if (editingFeedback) {
        const res = await updateEventFeedbackApi(eventId, { rating: feedbackRating, comment })
        alert(res.message || 'Feedback updated successfully!')
      } else {
        const res = await submitEventFeedbackApi(eventId, { rating: feedbackRating, comment })
        alert(res.message || 'Feedback submitted successfully!')
      }
      loadEventData()
      closeFeedbackModal()
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to save feedback')
    }
  }

  async function deleteEventFeedback(feedbackId) {
    if (!confirm('Are you sure you want to delete your feedback?')) return
    try {
      const res = await deleteEventFeedbackApi(eventId)
      alert(res.message || 'Feedback deleted successfully!')
      loadEventData()
    } catch (err) {
      console.error(err)
      alert(err.message || 'Failed to delete feedback')
    }
  }

  if (loading) {
    return (
      <div className="event-detail-page">
        <p>Loading event details...</p>
      </div>
    )
  }

  if (errorMsg || !event) {
    return (
      <div className="event-detail-page">
        <div style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <h1 style={{ fontSize: '1.8rem', color: '#3d2e24' }}>Access Denied / Not Found</h1>
          <p style={{ marginTop: '0.5rem', color: '#6f6676' }}>
            {errorMsg || 'Event not found or you do not have permission to view it.'}
          </p>
          <button 
            onClick={() => navigate(-1)} 
            style={{ 
              marginTop: '1.5rem', 
              padding: '0.6rem 1.2rem',
              background: '#3d2e24',
              color: '#fff',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer'
            }}
          >
            Go Back
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="event-detail-page">
      <div className="event-detail-shell">
        <Link className="event-detail-back" to={clubId ? `/clubs/${clubId}` : '/'}>
          <span aria-hidden="true">&lt;</span>
          {clubId ? 'Back to club' : 'Back to home'}
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
                    if (event.clubId) navigate(`/clubs/${event.clubId}`)
                  }}
                >
                  View Club
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
              <p>Build new connections, experience campus life, and keep memorable moments with UniClub.</p>
            </article>

            <section className="event-detail-feedback">
              <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                <div>
                  <h2 style={{ margin: 0 }}>Feedback</h2>
                  <span style={{ fontSize: '0.85rem', color: '#6f6676' }}>
                    {feedbacks.length} {feedbacks.length === 1 ? 'review' : 'reviews'}
                  </span>
                </div>
                {registration?.status === 'attended' && (
                  <button
                    type="button"
                    className="event-detail-feedback-open"
                    style={{
                      padding: '0.45rem 1rem',
                      background: '#F57C00',
                      color: '#fff',
                      border: 'none',
                      borderRadius: '8px',
                      cursor: 'pointer',
                      fontWeight: '600',
                      fontSize: '0.8rem'
                    }}
                    onClick={() => openFeedbackModal(myFeedback || null)}
                  >
                    {myFeedback ? 'Update my feedback' : 'Write feedback'}
                  </button>
                )}
              </header>

              <p className="event-detail-feedback-note" style={{ fontSize: '0.85rem', color: '#6f6676', marginBottom: '1rem' }}>
                Students who attended this event can share their feedback.
              </p>

              {feedbacks.length > 0 ? (
                <div className="event-detail-feedback-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {feedbacks.map((fb) => {
                    const reviewerName = fb.user_id?.full_name || 'Anonymous'
                    const reviewerInitial = reviewerName.slice(0, 1).toUpperCase()
                    const isMine = fb.user_id?._id === profile?._id || fb.user_id === profile?._id

                    return (
                      <article key={fb._id} className="event-detail-feedback-item" style={{
                        display: 'flex',
                        gap: '1rem',
                        padding: '1rem',
                        background: '#fcfaf7',
                        border: '1px solid #f0e4d8',
                        borderRadius: '12px'
                      }}>
                        <div className="event-detail-feedback-avatar" aria-hidden="true" style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          background: '#e8ddcf',
                          color: '#3d2e24',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: '600',
                          fontSize: '0.9rem',
                          flexShrink: 0
                        }}>
                          {reviewerInitial}
                        </div>

                        <div className="event-detail-feedback-content" style={{ flex: 1 }}>
                          <div className="event-detail-feedback-topline" style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            alignItems: 'flex-start',
                            marginBottom: '0.3rem'
                          }}>
                            <div>
                              <strong style={{ fontSize: '0.9rem', color: '#3d2e24', display: 'block' }}>{reviewerName}</strong>
                              <span style={{ fontSize: '0.75rem', color: '#8c7e95' }}>
                                {fb.updated_at ? `Updated ${new Date(fb.updated_at).toLocaleDateString('vi-VN')}` : new Date(fb.created_at || Date.now()).toLocaleDateString('vi-VN')}
                              </span>
                            </div>
                            <RatingStars rating={fb.rating} readonly />
                          </div>

                          <p style={{ margin: '0.4rem 0 0.6rem', fontSize: '0.88rem', color: '#3d2e24', lineHeight: 1.4 }}>
                            {fb.comment}
                          </p>

                          {isMine ? (
                            <div className="event-detail-feedback-actions" style={{ display: 'flex', gap: '0.8rem', marginTop: '0.5rem' }}>
                              <button 
                                type="button" 
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#F57C00',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  padding: 0
                                }}
                                onClick={() => openFeedbackModal(fb)}
                              >
                                Edit
                              </button>
                              <button
                                type="button"
                                className="is-danger"
                                style={{
                                  background: 'none',
                                  border: 'none',
                                  color: '#dc2626',
                                  cursor: 'pointer',
                                  fontSize: '0.8rem',
                                  fontWeight: '600',
                                  padding: 0
                                }}
                                onClick={() => deleteEventFeedback(fb._id)}
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
                <div className="event-detail-empty-feedback" style={{ textAlign: 'center', padding: '2rem 0', color: '#8c7e95', fontSize: '0.9rem' }}>
                  No feedback yet.
                </div>
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
                <strong>{event.registeredCount} / {event.capacity}</strong>
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
                    <button type="button" className="event-detail-secondary" onClick={cancelEventRegistration}>
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

                  {(registration.status === 'registered' || registration.status === 'approved') && !event.checkinOpen ? (
                    <p>Check-in is not open yet.</p>
                  ) : null}

                  {canCheckIn ? (
                    <p>Please check in at the coordinator counter using your ticket code.</p>
                  ) : null}

                  <button type="button" className="event-detail-primary" onClick={() => setTicketOpen(true)}>
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
                  <strong>{profile?.full_name}</strong>
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

            <label className="event-detail-rating" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: '1rem 0' }}>
              <span>Rating:</span>
              <RatingStars rating={feedbackRating} onChange={setFeedbackRating} />
            </label>

            <label className="event-feedback-modal__field" style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', marginBottom: '1.2rem' }}>
              <span style={{ fontSize: '0.8rem', fontWeight: '700', color: '#6b5a4a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Feedback</span>
              <textarea
                value={feedbackDraft}
                onChange={(eventChange) => setFeedbackDraft(eventChange.target.value)}
                placeholder="Write your feedback..."
                rows={5}
                autoFocus
                style={{
                  width: '100%',
                  padding: '0.75rem 0.95rem',
                  borderRadius: '10px',
                  border: '1px solid rgba(240, 228, 216, 0.8)',
                  fontSize: '0.92rem',
                  fontFamily: 'inherit',
                  boxSizing: 'border-box',
                  resize: 'vertical',
                  outline: 'none'
                }}
              />
            </label>

            <div className="event-feedback-modal__actions" style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.8rem' }}>
              <button 
                type="button" 
                className="event-feedback-modal__cancel" 
                onClick={closeFeedbackModal}
                style={{
                  padding: '0.55rem 1.1rem',
                  background: '#fff',
                  border: '1px solid #d2c8bc',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600'
                }}
              >
                Cancel
              </button>
              <button 
                type="submit" 
                className="event-detail-feedback-submit" 
                disabled={!feedbackDraft.trim()}
                style={{
                  padding: '0.55rem 1.1rem',
                  background: '#F57C00',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: '600',
                  boxShadow: '0 2px 6px rgba(245, 124, 0, 0.15)'
                }}
              >
                {editingFeedback ? 'Save changes' : 'Send feedback'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  )
}

export default EventDetailPage