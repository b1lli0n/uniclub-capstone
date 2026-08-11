import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams, Navigate } from 'react-router-dom'
import {
  getEventDetail,
  registerForEvent as registerForEventApi,
  cancelEventRegistration as cancelEventRegistrationApi,
  getEventTimelines,
  createEventTimeline,
  updateEventTimeline,
  deleteEventTimeline,
} from '../../api/event.api'
import { getMyProfile } from '../../api/profile.api'
import { resolveEventUploadImage, resolveClubLogo } from '../../utils/imageUtils'
import {
  getEventFeedback,
  submitEventFeedback as submitEventFeedbackApi,
  updateEventFeedback as updateEventFeedbackApi,
  deleteEventFeedback as deleteEventFeedbackApi,
} from '../../api/feedback.api'
import { getMyClubs } from '../../api/memberClubMembership.api'
import { EVENT_TIMELINES } from '../../data/mockData'
import { useConfirm, useToast } from '../../components/common/notificationContext'
import '../../styles/clubs.css'

function parseTimeParts(timeStr = '08:00 AM') {
  if (!timeStr) return { hour: '08', minute: '00', period: 'AM' }
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i)
  if (match) {
    const h = String(Math.min(12, Math.max(1, parseInt(match[1], 10)))).padStart(2, '0')
    const m = match[2].padStart(2, '0')
    const p = match[3].toUpperCase()
    return { hour: h, minute: m, period: p }
  }
  const [hStr, mStr] = timeStr.split(':')
  let h = parseInt(hStr || '8', 10)
  const m = mStr ? mStr.substring(0, 2).padStart(2, '0') : '00'
  let p = 'AM'
  if (h >= 12) {
    p = 'PM'
    if (h > 12) h -= 12
  }
  if (h === 0) h = 12
  return { hour: String(h).padStart(2, '0'), minute: m, period: p }
}

function to24HourFormat(timeStr = '08:00 AM') {
  if (!timeStr) return '08:00'
  const { hour, minute, period } = parseTimeParts(timeStr)
  let h = parseInt(hour, 10)
  if (period === 'PM' && h < 12) h += 12
  if (period === 'AM' && h === 12) h = 0
  return `${String(h).padStart(2, '0')}:${minute}`
}

function parseEventDate(dateText) {
  if (!dateText) return new Date()
  const [day, month, year] = dateText.split('/').map(Number)
  return new Date(year, month - 1, day)
}

function parseEventStartDate(event) {
  if (!event) return new Date()
  const startDate = parseEventDate(event.date)
  const startTime = event.time?.split('-')[0]?.trim()
  const timeMatch = startTime?.match(/^(\d{1,2}):(\d{2})$/)

  if (timeMatch) {
    startDate.setHours(Number(timeMatch[1]), Number(timeMatch[2]), 0, 0)
  }

  return startDate
}

function parseEventEndDate(event) {
  if (!event) return new Date()
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
  if (!event) return false
  if (event.status === 'closed' || event.status === 'cancelled') return false
  if (event.start_time) {
    const notEnded = event.end_time ? new Date() <= new Date(event.end_time) : true
    return (event.status === 'opening' || event.status === 'coming soon' || !event.status) && notEnded
  }
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  return parseEventDate(event.date).getTime() >= today.getTime()
}

function isBeforeEventStart(event) {
  if (!event) return false
  if (event.start_time) return new Date() < new Date(event.start_time)
  return new Date() < parseEventStartDate(event)
}

function isEventFeedbackOpen(event) {
  if (!event) return false
  if (event.end_time) return new Date() > new Date(event.end_time)
  return Date.now() > parseEventEndDate(event).getTime()
}

function getRegistrationLabel(status) {
  if (status === 'registered' || status === 'approved' || status === 'accepted') return 'Waiting check-in'
  if (status === 'attended') return 'Attended'
  if (status === 'cancelled' || status === 'rejected') return 'Cancelled'
  if (status === 'pending') return 'Pending'
  return 'Not registered'
}

function getTicketStatusText(status) {
  if (!status) return 'Not registered'
  if (status === 'attended') return 'Attended'
  if (status === 'cancelled' || status === 'rejected') return 'Cancelled'
  if (status === 'pending') return 'Pending'
  if (status === 'registered' || status === 'approved') return 'Waiting check-in'
  return 'Not registered'
}

function getEventStatus(event) {
  if (!event) return ''
  if (event.status === 'opening') return 'Opening'
  if (event.status === 'coming soon') return 'Coming soon'
  if (event.status === 'closed') return 'Closed'
  if (event.status === 'cancelled') return 'Cancelled'
  if (event.status) return event.status
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
  return (
    normalizedRole === 'leader' ||
    normalizedRole === 'event management' ||
    normalizedRole === 'president' ||
    normalizedRole === 'event_manager'
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
    organizerLogo: resolveClubLogo(apiEvent.club_id?.logo_url, apiEvent.club_id?.name),
    capacity: apiEvent.capacity,
    registeredCount: apiEvent.registeredCount || 0,
    isRegistered: apiEvent.isRegistered || false,
    registrationStatus: apiEvent.registrationStatus || null,
    registrationId: apiEvent.registrationId || null,
    imageUrl: resolveEventUploadImage(apiEvent.media_uris || apiEvent.image_url, apiEvent.category),
    approvalDocumentUrl: apiEvent.approval_document_url || 'https://drive.google.com/file/d/1A2b3C4d5E6f7G8h9I/view?usp=sharing',
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

function TicketQr({ value }) {
  const cells = Array.from({ length: 225 }, (_, index) => {
    const row = Math.floor(index / 15)
    const col = index % 15
    const inTopLeft = row < 5 && col < 5
    const inTopRight = row < 5 && col > 9
    const inBottomLeft = row > 9 && col < 5
    const finder = inTopLeft || inTopRight || inBottomLeft

    if (finder) {
      const outer =
        (row === 0 && col < 5) ||
        (row === 4 && col < 5) ||
        (col === 0 && row < 5) ||
        (col === 4 && row < 5) ||
        (row === 0 && col > 9) ||
        (row === 4 && col > 9) ||
        (col === 14 && row < 5) ||
        (col === 10 && row < 5) ||
        (row === 10 && col < 5) ||
        (row === 14 && col < 5) ||
        (col === 0 && row > 9) ||
        (col === 4 && row > 9)

      const inner =
        (row === 2 && col === 2) ||
        (row === 2 && col === 12) ||
        (row === 12 && col === 2)

      return outer || inner
    }

    const valueNum = Array.from(value).reduce((sum, char) => sum + char.charCodeAt(0), 0)
    return (index * 7 + valueNum) % 3 === 0
  })

  return (
    <div
      className="event-ticket-qr"
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(15, 1fr)',
        gap: '2px',
        width: '140px',
        height: '140px',
        margin: '0 auto',
      }}
    >
      {cells.map((active, index) => (
        <span
          key={index}
          style={{
            background: active ? '#3d2e24' : '#fff',
            borderRadius: '1px',
          }}
        />
      ))}
    </div>
  )
}

function EventDetailPage() {
  const { clubId, eventId } = useParams()
  const navigate = useNavigate()
  const confirm = useConfirm()
  const showToast = useToast()
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState('')
  const [event, setEvent] = useState(null)
  const [profile, setProfile] = useState(null)
  const [ticketOpen, setTicketOpen] = useState(false)
  const [registration, setRegistration] = useState(null)
  const [feedbacks, setFeedbacks] = useState([])
  const [myFeedback, setMyFeedback] = useState(null)
  const [myClubs, setMyClubs] = useState([])

  const [feedbackModalOpen, setFeedbackModalOpen] = useState(false)
  const [editingFeedback, setEditingFeedback] = useState(null)
  const [feedbackDraft, setFeedbackDraft] = useState('')
  const [feedbackRating, setFeedbackRating] = useState(5)

  // Timeline states from feature/fe-event-timeline
  const [timelineModalOpen, setTimelineModalOpen] = useState(false)
  const [editingTimeline, setEditingTimeline] = useState(null)
  const [timelineDraft, setTimelineDraft] = useState(() => createTimelineDraft(eventId || ''))
  const [eventTimelines, setEventTimelines] = useState([])

  async function loadEventData() {
    setLoading(true)
    try {
      const [eventRes, profileRes, feedbackRes, myClubsRes, timelinesRes] = await Promise.all([
        getEventDetail(eventId),
        getMyProfile().catch(() => ({ data: { user: null } })),
        getEventFeedback(eventId).catch(() => ({ data: { feedbacks: [], myFeedback: null } })),
        getMyClubs().catch(() => ({ data: [] })),
        getEventTimelines(eventId).catch(() => ({ data: [] }))
      ])
      
      const mapped = mapEventFromApi(eventRes.data)
      setEvent(mapped)
      setProfile(profileRes.data?.user)
      setFeedbacks(feedbackRes.data?.feedbacks || [])
      setMyFeedback(feedbackRes.data?.myFeedback || null)
      setMyClubs(myClubsRes.data || [])
      
      const mappedTimelines = (timelinesRes.data || []).map((item) => ({
        id: item._id || item.id,
        eventId: eventId,
        time: item.time,
        title: item.title,
        description: item.description,
        location: item.location || '',
      })).sort((a, b) => a.time.localeCompare(b.time))
      setEventTimelines(mappedTimelines)
      
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

  useEffect(() => {
    if (!ticketOpen || !event || event.registrationStatus === 'attended') {
      return undefined
    }

    let active = true
    const interval = setInterval(async () => {
      try {
        const res = await getEventDetail(eventId)
        if (!active) return
        const mapped = mapEventFromApi(res.data)
        if (mapped.registrationStatus === 'attended') {
          setEvent(mapped)
          setRegistration({
            status: 'attended',
            registeredAt: '',
            checkedIn: true,
          })
          showToast({
            type: 'success',
            title: 'Check-in thành công',
            message: 'Chúc mừng! Bạn đã check-in thành công và được cộng điểm thưởng.',
          })
          clearInterval(interval)
        }
      } catch (err) {
        console.error("Polling check-in status error:", err)
      }
    }, 3000)

    return () => {
      active = false
      clearInterval(interval)
    }
  }, [ticketOpen, eventId, event?.registrationStatus])

  const isRegistered = event?.isRegistered
  const canCancel = isRegistered && (registration?.status === 'registered' || registration?.status === 'approved' || registration?.status === 'pending') && isBeforeEventStart(event)
  const canRegister = !isRegistered && isEventRegistrationOpen(event)
  const canCheckIn = (registration?.status === 'registered' || registration?.status === 'approved') && event?.checkinOpen && !registration?.checkedIn
  const statusText = event ? getEventStatus(event) : ''

  // Organizer details
  const organizerClubId = event?.clubId
  const organizerMembership = myClubs.find((membership) => {
    const id = membership.club_id?._id || membership.club_id
    return String(id) === String(organizerClubId)
  })
  const isOrganizerMember = Boolean(organizerMembership)
  const isDraftEvent = event?.publicationStatus === 'draft' || event?.progress_status === 'draft'
  const canManageTimeline = isDraftEvent && organizerMembership ? canManageEventOperations(organizerMembership.role) : false

  const organizerName = event?.organizerName || 'UniClub'
  const organizerInitial = organizerName.slice(0, 1).toUpperCase()
  const ticketCode = event?.id && profile ? buildTicketCode(event.id, profile._id) : ''
  const studentPhone = profile?.phone || 'Not updated'
  const studentEmail = profile?.email || 'Not updated'
  const eventEnded = isEventFeedbackOpen(event)
  // eventTimelines is now loaded dynamically as a state

  async function registerForEvent() {
    const accepted = await confirm({
      title: 'Register for event?',
      message: `Register for ${event?.name || 'this event'}?`,
      confirmText: 'Register',
    })

    if (!accepted) return

    try {
      const res = await registerForEventApi(eventId)
      showToast({
        type: 'success',
        title: 'Registration successful!',
        message: 'Đăng ký thành công! Vé điện tử QR đã được khởi tạo và bạn nhận ngay điểm thưởng thành tích.',
      })
      await loadEventData()
      setTicketOpen(true)
    } catch (err) {
      console.error(err)
      showToast({
        type: 'error',
        title: 'Registration failed',
        message: err.message || 'Failed to register for this event.',
      })
    }
  }

  async function cancelEventRegistration() {
    const accepted = await confirm({
      title: 'Cancel registration?',
      message: `Cancel your registration for ${event?.name || 'this event'}?`,
      confirmText: 'Cancel registration',
      tone: 'danger',
    })

    if (!accepted) return

    try {
      const res = await cancelEventRegistrationApi(eventId)
      // Hiển thị thông báo cho chức năng hủy đăng ký sự kiện.
      showToast({
        type: 'success',
        title: 'Registration cancelled',
        message: res.message || 'Your event registration has been cancelled.',
      })
      loadEventData()
    } catch (err) {
      console.error(err)
      showToast({
        type: 'error',
        title: 'Cancel failed',
        message: err.message || 'Failed to cancel registration.',
      })
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
        // Hiển thị thông báo cho chức năng cập nhật feedback sự kiện.
        showToast({
          type: 'success',
          title: 'Feedback updated',
          message: res.message || 'Your feedback has been updated successfully.',
        })
      } else {
        const res = await submitEventFeedbackApi(eventId, { rating: feedbackRating, comment })
        // Hiển thị thông báo cho chức năng gửi feedback sự kiện.
        showToast({
          type: 'success',
          title: 'Feedback submitted',
          message: res.message || 'Your feedback has been submitted successfully.',
        })
      }
      loadEventData()
      closeFeedbackModal()
    } catch (err) {
      console.error(err)
      showToast({
        type: 'error',
        title: 'Feedback failed',
        message: err.message || 'Failed to save feedback.',
      })
    }
  }

  async function deleteEventFeedback(feedbackId) {
    const accepted = await confirm({
      title: 'Delete feedback?',
      message: 'This feedback will be removed permanently.',
      confirmText: 'Delete',
      tone: 'danger',
    })

    if (!accepted) return

    try {
      const res = await deleteEventFeedbackApi(eventId)
      // Hiển thị thông báo cho chức năng xóa feedback sự kiện.
      showToast({
        type: 'success',
        title: 'Feedback deleted',
        message: res.message || 'Your feedback has been deleted successfully.',
      })
      loadEventData()
    } catch (err) {
      console.error(err)
      showToast({
        type: 'error',
        title: 'Delete failed',
        message: err.message || 'Failed to delete feedback.',
      })
    }
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

  async function handleTimelineSubmit(submitEvent) {
    submitEvent.preventDefault()

    const payload = {
      time: to24HourFormat(timelineDraft.time),
      title: timelineDraft.title.trim(),
      description: timelineDraft.description.trim(),
      location: timelineDraft.location.trim() || '',
    }

    if (!payload.time || !payload.title || !payload.description) return

    try {
      if (editingTimeline) {
        const res = await updateEventTimeline(event.id, editingTimeline.id, payload)
        const updatedItem = {
          id: res.data._id || res.data.id,
          eventId: event.id,
          time: res.data.time,
          title: res.data.title,
          description: res.data.description,
          location: res.data.location || '',
        }
        setEventTimelines((items) =>
          items.map((item) => (item.id === editingTimeline.id ? updatedItem : item))
        )
      } else {
        const res = await createEventTimeline(event.id, payload)
        const newItem = {
          id: res.data._id || res.data.id,
          eventId: event.id,
          time: res.data.time,
          title: res.data.title,
          description: res.data.description,
          location: res.data.location || '',
        }
        setEventTimelines((items) =>
          [...items, newItem].sort((a, b) => a.time.localeCompare(b.time))
        )
      }
      closeTimelineModal()
      showToast({
        type: 'success',
        title: editingTimeline ? 'Timeline updated' : 'Timeline added',
        message: editingTimeline
          ? 'The timeline item has been updated.'
          : 'A new timeline item has been added.',
      })
    } catch (err) {
      console.error("Failed to save timeline item:", err)
      showToast({
        type: 'error',
        title: 'Error',
        message: err.message || 'Failed to save timeline item',
      })
    }
  }

  async function deleteTimeline(timelineId) {
    const accepted = await confirm({
      title: 'Delete timeline item?',
      message: 'This timeline item will be removed from the event.',
      confirmText: 'Delete',
      tone: 'danger',
    })

    if (!accepted) return

    try {
      await deleteEventTimeline(event.id, timelineId)
      setEventTimelines((items) => items.filter((item) => item.id !== timelineId))
      showToast({
        type: 'success',
        title: 'Timeline deleted',
        message: 'The timeline item has been removed.',
      })
    } catch (err) {
      console.error("Failed to delete timeline item:", err)
      showToast({
        type: 'error',
        title: 'Error',
        message: err.message || 'Failed to delete timeline item',
      })
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
                {eventEnded
                  ? 'Students who attended this event can share their feedback.'
                  : 'You can draft feedback now; BE can decide final submission rules later.'}
              </p>

              {feedbacks.length > 0 ? (
                <div className="event-detail-feedback-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {feedbacks.map((fb) => {
                    const reviewerName = fb.user_id?.full_name || fb.authorName || 'Anonymous'
                    const reviewerInitial = reviewerName.slice(0, 1).toUpperCase()
                    const isMine = fb.user_id?._id === profile?._id || fb.user_id === profile?._id || fb.userId === profile?._id

                    return (
                      <article key={fb._id || fb.id} className="event-detail-feedback-item" style={{
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
                                {fb.updated_at || fb.updatedAt ? `Updated ${new Date(fb.updated_at || fb.updatedAt).toLocaleDateString('vi-VN')}` : new Date(fb.created_at || fb.createdAt || Date.now()).toLocaleDateString('vi-VN')}
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
                                onClick={() => deleteEventFeedback(fb._id || fb.id)}
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
            <div className="event-detail-visual" style={{ '--event-gradient': event.gradient || 'linear-gradient(135deg, #ffce96 0%, #f5b87a 100%)', position: 'relative', overflow: 'hidden' }}>
              {event.imageUrl ? (
                <img src={event.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
              ) : null}
              <span style={{ position: 'relative', zIndex: 1 }}>{event.categoryLabel}</span>
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

                  {(registration.status === 'registered' || registration.status === 'approved') && !event.checkinOpen ? (
                    <p>Check-in is not open yet.</p>
                  ) : null}

                  {canCheckIn ? (
                    <p>Please check in at the coordinator counter using your ticket code.</p>
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
              <div className="event-ticket__poster" style={{ '--event-gradient': event.gradient || 'linear-gradient(135deg, #ffce96 0%, #f5b87a 100%)', position: 'relative', overflow: 'hidden' }}>
                {event.imageUrl ? (
                  <img src={event.imageUrl} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', position: 'absolute', top: 0, left: 0 }} />
                ) : null}
                <span style={{ position: 'relative', zIndex: 1 }}>{event.categoryLabel}</span>
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

            {registration?.checkedIn || registration?.status === 'attended' ? (
              <div className="event-ticket__checkin" style={{ backgroundColor: '#e8f5e9', borderRadius: '8px', padding: '1.2rem', border: '1px solid #c8e6c9', margin: '1rem auto', maxWidth: '320px' }}>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '2.5rem', color: '#2e7d32', marginBottom: '0.3rem' }}>✓</div>
                  <strong style={{ color: '#2e7d32', display: 'block', fontSize: '1.1rem', marginBottom: '0.2rem' }}>Đã check-in thành công!</strong>
                  <span style={{ fontSize: '0.85rem', color: '#558b2f' }}>Chúc bạn có một buổi trải nghiệm vui vẻ!</span>
                </div>
              </div>
            ) : (
              <div className="event-ticket__checkin">
                <div>
                  {event.registrationId ? (
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${event.registrationId}`}
                      alt="Ticket QR Code"
                      style={{ display: 'block', width: '140px', height: '140px', margin: '0.8rem auto', border: '4px solid #fff', borderRadius: '4px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)' }}
                    />
                  ) : (
                    <TicketQr value={ticketCode} />
                  )}
                </div>
                <p>Show this QR code to event management at the check-in counter.</p>
              </div>
            )}
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
                <div style={{ display: 'inline-flex', gap: '6px', alignItems: 'center' }}>
                  {/* 1. Hour Select */}
                  <select
                    value={parseTimeParts(timelineDraft.time || '08:00 AM').hour}
                    onChange={(e) => {
                      const { minute, period } = parseTimeParts(timelineDraft.time || '08:00 AM')
                      updateTimelineDraft('time', `${e.target.value}:${minute} ${period}`)
                    }}
                    style={{
                      width: '64px',
                      height: '40px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      padding: '0 4px 0 8px',
                      fontSize: '0.88rem',
                      fontWeight: '800',
                      background: '#ffffff',
                      color: '#0f172a',
                      cursor: 'pointer',
                    }}
                  >
                    {Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0')).map((h) => (
                      <option key={h} value={h}>{h}</option>
                    ))}
                  </select>

                  <span style={{ fontWeight: '900', color: '#64748b' }}>:</span>

                  {/* 2. Minute Select */}
                  <select
                    value={parseTimeParts(timelineDraft.time || '08:00 AM').minute}
                    onChange={(e) => {
                      const { hour, period } = parseTimeParts(timelineDraft.time || '08:00 AM')
                      updateTimelineDraft('time', `${hour}:${e.target.value} ${period}`)
                    }}
                    style={{
                      width: '64px',
                      height: '40px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      padding: '0 4px 0 8px',
                      fontSize: '0.88rem',
                      fontWeight: '800',
                      background: '#ffffff',
                      color: '#0f172a',
                      cursor: 'pointer',
                    }}
                  >
                    {Array.from({ length: 60 }, (_, i) => String(i).padStart(2, '0')).map((m) => (
                      <option key={m} value={m}>{m}</option>
                    ))}
                  </select>

                  {/* 3. AM / PM Select */}
                  <select
                    value={parseTimeParts(timelineDraft.time || '08:00 AM').period}
                    onChange={(e) => {
                      const { hour, minute } = parseTimeParts(timelineDraft.time || '08:00 AM')
                      updateTimelineDraft('time', `${hour}:${minute} ${e.target.value}`)
                    }}
                    style={{
                      width: '74px',
                      height: '40px',
                      borderRadius: '10px',
                      border: '1px solid #cbd5e1',
                      padding: '0 4px 0 8px',
                      fontSize: '0.88rem',
                      fontWeight: '900',
                      background: '#ffffff',
                      color: '#ea580c',
                      cursor: 'pointer',
                    }}
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
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
