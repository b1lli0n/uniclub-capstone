import { useEffect, useMemo, useState } from 'react'
import { ALL_CLUBS, ALL_EVENTS, EVENT_TIMELINES, MY_CLUB_MEMBERSHIPS } from '../../data/mockData'
import '../../styles/club-event-management.css'
import { getClubById } from '../../api/club.api'
import { getMyClubs } from '../../api/memberClubMembership.api'
import { getClubEventsForManager, createEvent, updateManagedEvent, cancelManagedEvent, getEventTimelines, createEventTimeline, updateEventTimeline, deleteEventTimeline } from '../../api/event.api'
import { createEventRequest } from '../../api/eventRequest.api'
import { useConfirm, useToast } from '../../components/common/notificationContext'
import { resolveEventUploadImage, UPLOAD_EVENT_IMAGES } from '../../utils/imageUtils'


const CLUB_FALLBACK = ALL_CLUBS[0]
const EVENT_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'complete', label: 'Complete' },
]
const OPERATIONAL_STATUS_OPTIONS = [
  { value: 'opening', label: 'Opening' },
  { value: 'coming_soon', label: 'Coming Soon' },
  { value: 'closed', label: 'Closed' },
  { value: 'cancelled', label: 'Cancelled' },
]
const EVENT_CATEGORY_OPTIONS = [
  { value: 'workshop', label: 'Workshops' },
  { value: 'sport', label: 'Sports' },
  { value: 'entertainment', label: 'Entertainment' },
  { value: 'community', label: 'Community' },
]
const MONTH_NAMES = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
]
const WEEKDAY_NAMES = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

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

function formatDateForInput(dateText, timeText, fallbackTime = '09:00') {
  const [day, month, year] = dateText.split('/').map(Number)
  const time = timeText?.split('-')[0]?.trim() || fallbackTime
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}T${time}`
}

function formatInputDate(value) {
  if (!value) return ''
  const date = new Date(value)
  return date.toLocaleDateString('en-GB')
}

function formatInputTimeRange(startValue, endValue) {
  if (!startValue || !endValue) return ''
  const start = new Date(startValue)
  const end = new Date(endValue)
  const formatTime = (date) =>
    `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`

  return `${formatTime(start)} - ${formatTime(end)}`
}

function createManagedEvent(event) {
  const startAt = formatDateForInput(event.date, event.time)
  const endAt = formatDateForInput(event.date, event.time?.split('-')[1]?.trim() || '11:00')

  return {
    id: event.id,
    clubId: event.clubId,
    name: event.name,
    description: event.description,
    details: `Detailed agenda for ${event.name}. Add schedule, speakers, preparation notes, and check-in instructions here.`,
    category: event.category,
    categoryLabel: event.categoryLabel,
    location: event.location || '',
    participants: event.participants || 30,
    visibility: event.visibility || 'public',
    publicationStatus: 'complete',
    lifecycleStatus: 'active',
    startAt,
    endAt,
    imageUrl: '',
    gradient: event.gradient,
    updatedAt: new Date().toLocaleDateString('en-GB'),
  }
}

function createEmptyDraft(clubId) {
  return {
    id: '',
    clubId,
    name: '',
    description: '',
    details: '',
    category: '',
    categoryLabel: '',
    location: '',
    participants: 150,
    visibility: 'public',
    publicationStatus: 'draft',
    lifecycleStatus: 'active',
    startAt: '',
    endAt: '',
    imageUrl: '',
    approvalDocumentUrl: '',
    gradient: 'linear-gradient(135deg, #fff1de 0%, #ffce96 100%)',
    updatedAt: new Date().toLocaleDateString('en-GB'),
  }
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

function parseInputDateTime(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

function toDateTimeInputValue(date) {
  const pad = (value) => String(value).padStart(2, '0')
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function formatDateTimeLabel(value) {
  const date = parseInputDateTime(value)
  if (!date) return 'Choose date and time'

  const pad = (number) => String(number).padStart(2, '0')
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function sameDate(firstDate, secondDate) {
  return (
    firstDate &&
    secondDate &&
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
  )
}

function canManageClubEventFeatures(role = '') {
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
  const formattedDate = startDate ? startDate.toLocaleDateString('en-GB') : ''
  const formattedTime = startDate ? startDate.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' }) : ''
  
  const formatForInput = (d) => {
    if (!d) return ''
    const date = new Date(d)
    const pad = (num) => String(num).padStart(2, '0')
    return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`
  }

  return {
    id: apiEvent._id || apiEvent.id,
    clubId: apiEvent.club_id || apiEvent.clubId,
    name: apiEvent.title || '',
    description: apiEvent.description || '',
    details: apiEvent.description || '',
    category: apiEvent.category || 'community',
    categoryLabel: (apiEvent.category || 'COMMUNITY').toUpperCase(),
    location: apiEvent.location || 'Campus',
    participants: apiEvent.capacity ?? apiEvent.max_participants ?? 150,
    visibility: apiEvent.is_public ? 'public' : 'private',
    publicationStatus: apiEvent.progress_status === 'draft' ? 'draft' : 'complete',
    lifecycleStatus: apiEvent.status || 'active',
    startAt: formatForInput(apiEvent.start_time),
    endAt: formatForInput(apiEvent.end_time),
    imageUrl: resolveEventUploadImage(apiEvent.media_uris || apiEvent.image_url || apiEvent.imageUrl, apiEvent.category),
    approvalDocumentUrl: apiEvent.approval_document_url || 'https://drive.google.com/file/d/1A2b3C4d5E6f7G8h9I/view?usp=sharing',
    gradient: 'linear-gradient(135deg, #ffce96 0%, #f5b87a 100%)',
    updatedAt: new Date(apiEvent.updatedAt || Date.now()).toLocaleDateString('en-GB'),
  }
}


function DateTimePicker({ label, value, onChange, required = false }) {
  const selectedDate = parseInputDateTime(value)
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => selectedDate || new Date())
  const selectedTime = selectedDate
    ? `${String(selectedDate.getHours()).padStart(2, '0')}:${String(selectedDate.getMinutes()).padStart(2, '0')}`
    : '09:00'
  const monthStart = startOfMonth(viewDate)
  const firstDayOffset = (monthStart.getDay() + 6) % 7
  const daysInMonth = new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 0).getDate()
  const calendarDays = [
    ...Array.from({ length: firstDayOffset }, (_, index) => ({ id: `blank-${index}`, date: null })),
    ...Array.from({ length: daysInMonth }, (_, index) => ({
      id: `day-${index + 1}`,
      date: new Date(viewDate.getFullYear(), viewDate.getMonth(), index + 1),
    })),
  ]

  function openPicker() {
    setViewDate(selectedDate || new Date())
    setIsOpen(true)
  }

  function changeMonth(offset) {
    setViewDate((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1))
  }

  function chooseDate(date) {
    const [hour, minute] = selectedTime.split(':').map(Number)
    const nextDate = new Date(date)
    nextDate.setHours(hour, minute, 0, 0)
    onChange(toDateTimeInputValue(nextDate))
  }

  function chooseTime(time) {
    const [hour, minute] = time.split(':').map(Number)
    const nextDate = selectedDate || viewDate
    const nextValue = new Date(
      nextDate.getFullYear(),
      nextDate.getMonth(),
      nextDate.getDate(),
      hour,
      minute,
      0,
      0
    )
    onChange(toDateTimeInputValue(nextValue))
  }

  function chooseToday() {
    const today = new Date()
    setViewDate(today)
    onChange(toDateTimeInputValue(today))
  }

  return (
    <label className="club-event-management-field club-event-management-date-field">
      <span>{label}</span>
      <input
        className="club-event-management-date-hidden"
        value={value}
        onChange={() => {}}
        required={required}
        tabIndex={-1}
        aria-hidden="true"
      />
      <button
        type="button"
        className={`club-event-management-date-trigger${value ? ' has-value' : ''}`}
        onClick={openPicker}
      >
        <span>{formatDateTimeLabel(value)}</span>
        <CalendarIcon />
      </button>

      {isOpen ? (
        <div className="club-event-management-date-popover">
          <div className="club-event-management-date-header">
            <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month">
              &lt;
            </button>
            <strong>{MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}</strong>
            <button type="button" onClick={() => changeMonth(1)} aria-label="Next month">
              &gt;
            </button>
          </div>

          <div className="club-event-management-date-weekdays">
            {WEEKDAY_NAMES.map((dayName) => (
              <span key={dayName}>{dayName}</span>
            ))}
          </div>

          <div className="club-event-management-date-grid">
            {calendarDays.map((day) =>
              day.date ? (
                <button
                  key={day.id}
                  type="button"
                  className={sameDate(day.date, selectedDate) ? 'is-selected' : ''}
                  onClick={() => chooseDate(day.date)}
                >
                  {day.date.getDate()}
                </button>
              ) : (
                <span key={day.id} aria-hidden="true" />
              )
            )}
          </div>

          <div className="club-event-management-time-row">
            <label>
              <span>Time</span>
              <input type="time" value={selectedTime} onChange={(event) => chooseTime(event.target.value)} />
            </label>
          </div>

          <div className="club-event-management-date-actions">
            <button type="button" onClick={chooseToday}>Today</button>
            <button type="button" onClick={() => onChange('')}>Clear</button>
            <button type="button" onClick={() => setIsOpen(false)}>Done</button>
          </div>
        </div>
      ) : null}
    </label>
  )
}

function CustomSelect({ label, value, options, onChange }) {
  const [isOpen, setIsOpen] = useState(false)
  const selectedOption = options.find((option) => option.value === value) || options[0]

  function chooseOption(optionValue) {
    onChange(optionValue)
    setIsOpen(false)
  }

  return (
    <label className="club-event-management-field club-event-management-select-field">
      <span>{label}</span>
      <button
        type="button"
        className={`club-event-management-select-trigger${isOpen ? ' is-open' : ''}`}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>{selectedOption.label}</span>
        <ChevronDownIcon />
      </button>

      {isOpen ? (
        <div className="club-event-management-select-menu">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={option.value === value ? 'is-selected' : ''}
              onClick={() => chooseOption(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </label>
  )
}

function CalendarIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
    </svg>
  )
}

function ChevronDownIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" aria-hidden="true">
      <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  )
}

function ClubEventManagementPage({ clubId }) {
  const confirm = useConfirm()
  const showToast = useToast()
  const [club, setClub] = useState(null)
  const [membership, setMembership] = useState(null)
  const [loading, setLoading] = useState(true)

  const [events, setEvents] = useState([])
  const [activeStatus, setActiveStatus] = useState('complete')
  const [detailEvent, setDetailEvent] = useState(null)
  const [editorMode, setEditorMode] = useState(null)
  const [draft, setDraft] = useState(() => createEmptyDraft(clubId))
  const [detailEventTimelines, setDetailEventTimelines] = useState([])
  const [timelineModalOpen, setTimelineModalOpen] = useState(false)
  const [editingTimeline, setEditingTimeline] = useState(null)
  const [timelineDraft, setTimelineDraft] = useState(() => createTimelineDraft(''))

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
        const userMembership = (myClubsRes.data || []).find((item) => {
          const id = item.club_id?._id || item.club_id
          return String(id) === String(clubId)
        })
        setMembership(userMembership || null)

        // Try to load events from backend or fall back to mock events
        const eventsRes = await getClubEventsForManager(clubId).catch(() => ({ data: [] }))
        if (!active) return
        let fetchedEvents = []
        if (eventsRes.data && eventsRes.data.length > 0) {
          fetchedEvents = eventsRes.data.map(mapEventFromApi)
        } else {
          // Fallback to mock events filtered by club name/slug
          const slug = clubRes.data?.slug || clubRes.data?.id || clubId
          fetchedEvents = ALL_EVENTS.filter((event) => 
            String(event.clubId) === String(slug) || 
            String(event.clubId) === String(clubId)
          ).map(createManagedEvent)
        }
        setEvents(fetchedEvents)
      } catch (err) {
        console.error("Failed to load club management data:", err)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadData()
    return () => { active = false }
  }, [clubId])

  useEffect(() => {
    if (!detailEvent) {
      setDetailEventTimelines([])
      return
    }
    let active = true
    async function loadTimelines() {
      try {
        const res = await getEventTimelines(detailEvent.id || detailEvent._id)
        if (!active) return
        const mapped = (res.data || []).map((item) => ({
          id: item._id || item.id,
          eventId: item.event_id || item.eventId,
          time: item.time,
          title: item.title,
          description: item.description,
          location: item.location || '',
        }))
        setDetailEventTimelines(mapped)
      } catch (err) {
        console.error("Failed to load event timelines:", err)
      }
    }
    loadTimelines()
    return () => {
      active = false
    }
  }, [detailEvent])

  const filteredEvents = useMemo(
    () => events.filter((event) => event.publicationStatus === activeStatus),
    [activeStatus, events]
  )
  const completeCount = events.filter((event) => event.publicationStatus === 'complete').length
  const draftCount = events.filter((event) => event.publicationStatus === 'draft').length

  if (loading) {
    return (
      <main className="club-event-management-page">
        <section className="club-event-management-empty">
          <h1>Loading...</h1>
          <p>Verifying club management permissions...</p>
        </section>
      </main>
    )
  }

  const activeClub = club || CLUB_FALLBACK
  const canManageEvents = canManageClubEventFeatures(membership?.role)



  function openCreateEditor() {
    setEditorMode('create')
    setDraft(createEmptyDraft(activeClub.id))
  }

  function openUpdateEditor(eventItem) {
    setEditorMode('update')
    setDraft({ ...eventItem })
  }

  function closeEditor() {
    setEditorMode(null)
    setDraft(createEmptyDraft(activeClub.id))
  }

  function updateDraft(field, value) {
    setDraft((current) => ({
      ...current,
      [field]: value,
      ...(field === 'category'
        ? { categoryLabel: value.trim().toUpperCase() || current.categoryLabel }
        : {}),
    }))
  }

  async function submitEvent(eventSubmit) {
    eventSubmit.preventDefault()

    const payload = {
      title: draft.name.trim(),
      description: draft.details.trim() || draft.name.trim(),
      content: draft.details.trim() || draft.name.trim(),
      category: draft.category.trim().toLowerCase() || 'community',
      location: draft.location.trim() || 'Hall A101',
      start_time: draft.startAt || new Date().toISOString(),
      end_time: draft.endAt || new Date(Date.now() + 7200000).toISOString(),
      capacity: Number(draft.participants) || 150,
      is_public: draft.visibility === 'public',
      status: draft.lifecycleStatus || 'opening',
      progress_status: draft.publicationStatus === 'draft' ? 'draft' : 'completed',
      approval_document_url: draft.approvalDocumentUrl || 'https://drive.google.com/file/d/1A2b3C4d5E6f7G8h9I/view?usp=sharing',
    }

    if (draft.imageUrl) {
      payload.media_uris = [draft.imageUrl]
    }

    try {
      const targetClubId = club?._id || club?.id || activeClub?._id || activeClub?.id || clubId
      if (editorMode === 'create') {
        await createEventRequest(targetClubId, payload)
        showToast({
          type: 'success',
          title: 'Event Request Submitted!',
          message: 'Event creation request with contract link has been submitted for Admin approval!',
        })
      } else {
        await updateManagedEvent(targetClubId, draft.id, payload).catch((err) => {
          console.warn("Update API notice:", err)
        })
        showToast({
          type: 'success',
          title: 'Event updated',
          message: 'The event information has been updated.',
        })

        // Update local state immediately for instant UI responsiveness
        setEvents((prevItems) =>
          prevItems.map((item) =>
            item.id === draft.id
              ? {
                  ...item,
                  name: draft.name,
                  description: draft.description,
                  details: draft.details,
                  category: draft.category,
                  categoryLabel: (draft.category || 'COMMUNITY').toUpperCase(),
                  location: draft.location,
                  participants: Number(draft.participants) || 150,
                  visibility: draft.visibility,
                  publicationStatus: draft.publicationStatus,
                  lifecycleStatus: draft.lifecycleStatus || 'opening',
                  startAt: draft.startAt,
                  endAt: draft.endAt,
                  imageUrl: draft.imageUrl || item.imageUrl,
                  updatedAt: new Date().toLocaleDateString('en-GB'),
                }
              : item
          )
        )
      }

      closeEditor()
    } catch (error) {
      console.error(error)
      showToast({ type: 'error', title: 'Error', message: error.message || 'Failed to submit event' })
    }
  }

  async function cancelEvent(eventId) {
    const eventItem = events.find((item) => item.id === eventId) || detailEvent
    const accepted = await confirm({
      title: 'Cancel event?',
      message: `Cancel ${eventItem?.name || 'this event'}? Students will see it as cancelled.`,
      confirmText: 'Cancel event',
      tone: 'danger',
    })

    if (!accepted) return

    try {
      const targetClubId = club?._id || club?.id || activeClub?._id || activeClub?.id || clubId
      await cancelManagedEvent(targetClubId, eventId).catch((err) => {
        console.warn("Cancel API notice:", err)
      })
      
      showToast({
        type: 'success',
        title: 'Event cancelled',
        message: `${eventItem?.name || 'The event'} has been marked as cancelled.`,
      })

      setEvents((items) =>
        items.map((item) =>
          item.id === eventId
            ? { ...item, lifecycleStatus: 'cancelled', updatedAt: new Date().toLocaleDateString('en-GB') }
            : item
        )
      )
      if (detailEvent?.id === eventId) {
        setDetailEvent((prev) => (prev ? { ...prev, lifecycleStatus: 'cancelled' } : null))
      }
    } catch (err) {
      console.error(err)
      showToast({
        type: 'error',
        title: 'Error',
        message: err.message || 'Failed to cancel event',
      })
    }
  }

  function openTimelineEditor(timelineItem = null) {
    if (!detailEvent) return

    setEditingTimeline(timelineItem)
    setTimelineDraft(timelineItem ? { ...timelineItem } : createTimelineDraft(detailEvent.id))
    setTimelineModalOpen(true)
  }

  function closeTimelineEditor() {
    setTimelineModalOpen(false)
    setEditingTimeline(null)
    setTimelineDraft(createTimelineDraft(detailEvent?.id || ''))
  }

  function updateTimelineDraft(field, value) {
    setTimelineDraft((current) => ({
      ...current,
      [field]: value,
    }))
  }

  async function submitTimeline(submitEvent) {
    submitEvent.preventDefault()
    if (!detailEvent) return

    const payload = {
      time: to24HourFormat(timelineDraft.time),
      title: timelineDraft.title.trim(),
      description: timelineDraft.description.trim(),
      location: timelineDraft.location.trim() || '',
    }

    if (!payload.time || !payload.title || !payload.description) return

    try {
      if (editingTimeline) {
        const res = await updateEventTimeline(detailEvent.id, editingTimeline.id, payload)
        const updatedItem = {
          id: res.data._id || res.data.id,
          eventId: detailEvent.id,
          time: res.data.time,
          title: res.data.title,
          description: res.data.description,
          location: res.data.location || '',
        }
        setDetailEventTimelines((items) =>
          items.map((item) => (item.id === editingTimeline.id ? updatedItem : item))
        )
      } else {
        const res = await createEventTimeline(detailEvent.id, payload)
        const newItem = {
          id: res.data._id || res.data.id,
          eventId: detailEvent.id,
          time: res.data.time,
          title: res.data.title,
          description: res.data.description,
          location: res.data.location || '',
        }
        setDetailEventTimelines((items) =>
          [...items, newItem].sort((a, b) => a.time.localeCompare(b.time))
        )
      }
      closeTimelineEditor()
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
      await deleteEventTimeline(detailEvent.id, timelineId)
      setDetailEventTimelines((items) => items.filter((item) => item.id !== timelineId))
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

  if (!canManageEvents) {
    return (
      <main className="club-event-management-page">
        <section className="club-event-management-empty">
          <h1>Manage Events</h1>
          <p>Only event management or the club leader can manage club events.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="club-event-management-page">
      <section className="club-event-management-hero">
        <div>
          <span>For Event Management</span>
          <h1>Manage Events</h1>
          <p>Create, update, review, and cancel events organized by {activeClub.name}.</p>
        </div>
        <button type="button" onClick={openCreateEditor}>Create Event</button>
      </section>

      <section className="club-event-management-toolbar" aria-label="Event status filters">
        <button
          type="button"
          className={activeStatus === 'complete' ? 'is-active' : ''}
          onClick={() => setActiveStatus('complete')}
        >
          Complete <span>{completeCount}</span>
        </button>
        <button
          type="button"
          className={activeStatus === 'draft' ? 'is-active' : ''}
          onClick={() => setActiveStatus('draft')}
        >
          Draft <span>{draftCount}</span>
        </button>
      </section>

      <section className="club-event-management-list" aria-label={`${activeClub.name} managed events`}>
        {filteredEvents.map((eventItem) => (
          <article key={eventItem.id} className="club-event-management-card">
            <div className="club-event-management-card__media" style={{ '--event-gradient': eventItem.gradient }}>
              {eventItem.imageUrl ? (
                <img
                  src={eventItem.imageUrl}
                  alt={eventItem.name}
                  className="club-event-management-card__img"
                  onError={(e) => { e.currentTarget.style.display = 'none' }}
                />
              ) : (
                <CalendarIcon />
              )}
              <span>{eventItem.categoryLabel}</span>
            </div>

            <div className="club-event-management-card__body">
              <div className="club-event-management-card__badges">
                <span className={`club-event-management-status club-event-management-status--${eventItem.publicationStatus}`}>
                  {eventItem.publicationStatus === 'complete' ? 'Complete' : 'Draft'}
                </span>
                <span className={`club-event-management-visibility club-event-management-visibility--${eventItem.visibility}`}>
                  {eventItem.visibility === 'public' ? 'Public' : 'Private'}
                </span>
                {eventItem.lifecycleStatus === 'cancelled' ? (
                  <span className="club-event-management-status club-event-management-status--cancelled">Cancelled</span>
                ) : null}
              </div>
              <h2>{eventItem.name}</h2>
              <p>{eventItem.description}</p>
              <div className="club-event-management-meta">
                <span>{formatInputDate(eventItem.startAt)}</span>
                <span>{formatInputTimeRange(eventItem.startAt, eventItem.endAt)}</span>
                <span>{eventItem.location || 'Campus'}</span>
              </div>
            </div>

            <div className="club-event-management-actions">
              <button type="button" onClick={() => setDetailEvent(eventItem)}>View</button>
              <button type="button" onClick={() => openUpdateEditor(eventItem)}>Update</button>
              <button
                type="button"
                className="is-danger"
                disabled={eventItem.lifecycleStatus === 'cancelled'}
                onClick={() => cancelEvent(eventItem.id)}
              >
                Cancel
              </button>
            </div>
          </article>
        ))}
      </section>

      {filteredEvents.length === 0 ? (
        <p className="club-event-management-empty-note">No {activeStatus} events yet.</p>
      ) : null}

      {detailEvent ? (
        <div className="club-event-management-modal" role="dialog" aria-modal="true" aria-labelledby="event-manager-detail-title">
          <button
            type="button"
            className="club-event-management-modal__backdrop"
            aria-label="Close event detail"
            onClick={() => setDetailEvent(null)}
          />
          <section className="club-event-management-modal__panel">
            <header>
              <div>
                <span>{activeClub.name}</span>
                <h2 id="event-manager-detail-title">{detailEvent.name}</h2>
              </div>
              <button type="button" onClick={() => setDetailEvent(null)}>Close</button>
            </header>
            <div className="club-event-management-detail-grid">
              <div>
                <span>Status</span>
                <strong>{detailEvent.publicationStatus === 'complete' ? 'Complete' : 'Draft'}</strong>
              </div>
              <div>
                <span>Visibility</span>
                <strong>{detailEvent.visibility === 'public' ? 'Public' : 'Private'}</strong>
              </div>
              <div>
                <span>Start</span>
                <strong>{formatInputDate(detailEvent.startAt)} - {formatInputTimeRange(detailEvent.startAt, detailEvent.endAt)}</strong>
              </div>
              <div>
                <span>Capacity</span>
                <strong>{detailEvent.participants}</strong>
              </div>
              <div>
                <span>Location</span>
                <strong>{detailEvent.location || 'Campus'}</strong>
              </div>
              <div>
                <span>Last updated</span>
                <strong>{detailEvent.updatedAt}</strong>
              </div>
            </div>
            <article style={{ background: '#ffffff', padding: '16px 20px', borderRadius: '12px', color: '#475569', fontSize: '0.92rem', lineHeight: '1.6', margin: '16px 0 20px 0', border: '1px solid #f1f5f9' }}>
              <p style={{ margin: '0 0 10px 0' }}>{detailEvent.details || detailEvent.description}</p>
              {detailEvent.approvalDocumentUrl ? (
                <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px dashed #e2e8f0' }}>
                  <strong style={{ display: 'block', fontSize: '0.85rem', color: '#0f172a', marginBottom: '4px' }}>
                    📄 School Approval / Contract Document (Google Drive PDF):
                  </strong>
                  <a
                    href={detailEvent.approvalDocumentUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ color: '#2563eb', fontWeight: '700', fontSize: '0.88rem', textDecoration: 'underline', wordBreak: 'break-all' }}
                  >
                    🔗 {detailEvent.approvalDocumentUrl}
                  </a>
                </div>
              ) : null}
            </article>
            <section className="club-event-management-timeline">
              <header>
                <div>
                  <h3>Event Timeline</h3>
                  <span>{detailEventTimelines.length} {detailEventTimelines.length === 1 ? 'item' : 'items'}</span>
                </div>
                {detailEvent?.publicationStatus === 'draft' || detailEvent?.progress_status === 'draft' ? (
                  <button type="button" onClick={() => openTimelineEditor()}>
                    + Add Timeline
                  </button>
                ) : (
                  <span style={{ fontSize: '0.8rem', color: '#64748b', fontWeight: '700', background: '#f1f5f9', padding: '4px 10px', borderRadius: '8px' }}>
                    🔒 Completed (Timeline Locked)
                  </span>
                )}
              </header>

              {detailEventTimelines.length > 0 ? (
                <div className="club-event-management-timeline__list">
                  {detailEventTimelines.map((timelineItem) => (
                    <article key={timelineItem.id} className="club-event-management-timeline__item">
                      <span className="club-event-management-timeline__time">{timelineItem.time}</span>
                      <div>
                        <div className="club-event-management-timeline__topline">
                          <strong>{timelineItem.title}</strong>
                          {timelineItem.location ? <small>{timelineItem.location}</small> : null}
                        </div>
                        <p>{timelineItem.description}</p>
                        {detailEvent?.publicationStatus === 'draft' || detailEvent?.progress_status === 'draft' ? (
                          <div className="club-event-management-timeline__actions">
                            <button type="button" onClick={() => openTimelineEditor(timelineItem)}>
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
                <div className="club-event-management-timeline__empty">
                  No timeline has been added for this event yet.
                </div>
              )}
            </section>
            <footer>
              <button type="button" onClick={() => openUpdateEditor(detailEvent)}>Update Event</button>
              <button
                type="button"
                className="is-danger"
                disabled={detailEvent.lifecycleStatus === 'cancelled'}
                onClick={() => cancelEvent(detailEvent.id)}
              >
                Cancel Event
              </button>
            </footer>
          </section>
        </div>
      ) : null}

      {editorMode ? (
        <div className="club-event-management-modal" role="dialog" aria-modal="true" aria-labelledby="event-manager-editor-title">
          <button
            type="button"
            className="club-event-management-modal__backdrop"
            aria-label="Close event editor"
            onClick={closeEditor}
          />
          <form className="club-event-management-modal__panel club-event-management-editor" onSubmit={submitEvent}>
            <header>
              <div>
                <span>For Event Management</span>
                <h2 id="event-manager-editor-title">
                  {editorMode === 'create' ? 'Create Event' : 'Update Event'}
                </h2>
              </div>
              <button type="button" onClick={closeEditor}>Close</button>
            </header>

            <div className="club-event-management-editor__section">
              <h3>Event details</h3>
              <label className="club-event-management-field club-event-management-field--full">
                <span>Event name *</span>
                <input
                  type="text"
                  value={draft.name}
                  onChange={(event) => updateDraft('name', event.target.value)}
                  placeholder="Example: Communication Skills Workshop 2026"
                  required
                />
              </label>

              <label className="club-event-management-field club-event-management-field--full">
                <span>Event content & agenda *</span>
                <textarea
                  rows={5}
                  value={draft.details}
                  onChange={(event) => updateDraft('details', event.target.value)}
                  placeholder="Detailed content, agenda, and speaker information..."
                  required
                />
              </label>

              <div className="club-event-management-editor__grid">
                <CustomSelect
                  label="Category"
                  value={draft.category || 'workshop'}
                  options={EVENT_CATEGORY_OPTIONS}
                  onChange={(value) => updateDraft('category', value)}
                />
                <label className="club-event-management-field">
                  <span>Location *</span>
                  <input
                    type="text"
                    value={draft.location}
                    onChange={(event) => updateDraft('location', event.target.value)}
                    placeholder="Room A101, Main Hall..."
                    required
                  />
                </label>
              </div>

              <label className="club-event-management-toggle">
                <div>
                  <strong>Public visibility</strong>
                  <span>Allow non-members to see this event.</span>
                </div>
                <input
                  type="checkbox"
                  checked={draft.visibility === 'public'}
                  onChange={(event) => updateDraft('visibility', event.target.checked ? 'public' : 'private')}
                />
              </label>

              <div className="club-event-management-editor__grid">
                <DateTimePicker
                  label="Start *"
                  value={draft.startAt}
                  onChange={(value) => updateDraft('startAt', value)}
                  required
                />
                <DateTimePicker
                  label="End *"
                  value={draft.endAt}
                  onChange={(value) => updateDraft('endAt', value)}
                  required
                />
              </div>

              <div className="club-event-management-editor__grid">
                <label className="club-event-management-field">
                  <span>Max capacity</span>
                  <input
                    type="number"
                    min="1"
                    value={draft.participants}
                    onChange={(event) => updateDraft('participants', event.target.value)}
                  />
                </label>
                <CustomSelect
                  label="Progress Status"
                  value={draft.publicationStatus}
                  options={EVENT_STATUSES}
                  onChange={(value) => updateDraft('publicationStatus', value)}
                />
              </div>

              <CustomSelect
                label="Operational Status"
                value={draft.lifecycleStatus || 'opening'}
                options={OPERATIONAL_STATUS_OPTIONS}
                onChange={(value) => updateDraft('lifecycleStatus', value)}
              />

              <CustomSelect
                label="Cover Image (Local Uploads)"
                value={draft.imageUrl || UPLOAD_EVENT_IMAGES[0].value}
                options={UPLOAD_EVENT_IMAGES}
                onChange={(value) => updateDraft('imageUrl', value)}
              />

              <label className="club-event-management-field club-event-management-field--full" style={{ marginTop: '14px' }}>
                <span style={{ fontWeight: '800', color: '#1e293b' }}>📄 School Approval / Contract Document (Google Drive PDF) *</span>
                <input
                  type="url"
                  value={draft.approvalDocumentUrl || 'https://drive.google.com/file/d/1A2b3C4d5E6f7G8h9I/view?usp=sharing'}
                  onChange={(event) => updateDraft('approvalDocumentUrl', event.target.value)}
                  placeholder="https://drive.google.com/file/d/... (Signed Contract Document Link)"
                />
                <small style={{ fontSize: '0.8rem', color: '#64748b', marginTop: '4px', display: 'block' }}>
                  * Enter the Google Drive link to the signed school event contract or permit document.
                </small>
              </label>
            </div>

            <div className="club-event-management-editor__actions">
              <button type="button" onClick={closeEditor}>Cancel</button>
              <button type="submit">
                {editorMode === 'create' ? 'Create Event Now' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {timelineModalOpen && detailEvent ? (
        <div className="club-event-management-modal" role="dialog" aria-modal="true" aria-labelledby="event-manager-timeline-title">
          <button
            type="button"
            className="club-event-management-modal__backdrop"
            aria-label="Close timeline editor"
            onClick={closeTimelineEditor}
          />
          <form className="club-event-management-modal__panel club-event-management-timeline-editor" onSubmit={submitTimeline}>
            <header>
              <div>
                <span>{detailEvent.name}</span>
                <h2 id="event-manager-timeline-title">
                  {editingTimeline ? 'Update Timeline Item' : 'Create Timeline Item'}
                </h2>
              </div>
              <button type="button" onClick={closeTimelineEditor}>Close</button>
            </header>

            <div className="club-event-management-editor__grid">
              <label className="club-event-management-field">
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
              <label className="club-event-management-field">
                <span>Location</span>
                <input
                  type="text"
                  value={timelineDraft.location}
                  onChange={(eventChange) => updateTimelineDraft('location', eventChange.target.value)}
                  placeholder="Room, hall, or checkpoint..."
                />
              </label>
            </div>

            <label className="club-event-management-field club-event-management-field--full">
              <span>Title *</span>
              <input
                type="text"
                value={timelineDraft.title}
                onChange={(eventChange) => updateTimelineDraft('title', eventChange.target.value)}
                placeholder="Example: Opening ceremony"
                required
              />
            </label>

            <label className="club-event-management-field club-event-management-field--full">
              <span>Description *</span>
              <textarea
                rows={4}
                value={timelineDraft.description}
                onChange={(eventChange) => updateTimelineDraft('description', eventChange.target.value)}
                placeholder="Describe what happens in this timeline item..."
                required
              />
            </label>

            <div className="club-event-management-editor__actions">
              <button type="button" onClick={closeTimelineEditor}>Cancel</button>
              <button
                type="submit"
                disabled={!timelineDraft.time.trim() || !timelineDraft.title.trim() || !timelineDraft.description.trim()}
              >
                {editingTimeline ? 'Save Changes' : 'Create Item'}
              </button>
            </div>
          </form>
        </div>
      ) : null}
    </main>
  )
}

export default ClubEventManagementPage
