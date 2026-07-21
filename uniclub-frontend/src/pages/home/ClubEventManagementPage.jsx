import { useEffect, useMemo, useState } from 'react'
import { ALL_CLUBS, ALL_EVENTS, EVENT_TIMELINES, MY_CLUB_MEMBERSHIPS } from '../../data/mockData'
import '../../styles/club-event-management.css'
import { getClubById } from '../../api/club.api'
import { getMyClubs } from '../../api/memberClubMembership.api'
import { getClubEventsForMember } from '../../api/event.api'
import { useConfirm, useToast } from '../../components/common/notificationContext'


const CLUB_FALLBACK = ALL_CLUBS[0]
const EVENT_STATUSES = [
  { value: 'draft', label: 'Draft' },
  { value: 'complete', label: 'Complete' },
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
    participants: 30,
    visibility: 'public',
    publicationStatus: 'draft',
    lifecycleStatus: 'active',
    startAt: '',
    endAt: '',
    imageUrl: '',
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
    participants: apiEvent.max_participants || 30,
    visibility: apiEvent.is_public ? 'public' : 'private',
    publicationStatus: 'complete',
    lifecycleStatus: apiEvent.status || 'active',
    startAt: formatForInput(apiEvent.start_time),
    endAt: formatForInput(apiEvent.end_time),
    imageUrl: apiEvent.image_url || '',
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
  const [timelines, setTimelines] = useState(EVENT_TIMELINES)
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
        const eventsRes = await getClubEventsForMember(clubId).catch(() => ({ data: [] }))
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

  const filteredEvents = useMemo(
    () => events.filter((event) => event.publicationStatus === activeStatus),
    [activeStatus, events]
  )
  const completeCount = events.filter((event) => event.publicationStatus === 'complete').length
  const draftCount = events.filter((event) => event.publicationStatus === 'draft').length
  const detailEventTimelines = detailEvent
    ? timelines
        .filter((timelineItem) => timelineItem.eventId === detailEvent.id)
        .sort((firstItem, secondItem) => firstItem.time.localeCompare(secondItem.time))
    : []

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

  function submitEvent(eventSubmit) {
    eventSubmit.preventDefault()
    const nextEvent = {
      ...draft,
      id: draft.id || `club-event-${activeClub.id}-${Date.now()}`,
      clubId: activeClub.id,

      name: draft.name.trim(),
      description: draft.description.trim(),
      details: draft.details.trim(),
      category: draft.category.trim().toLowerCase() || 'community',
      categoryLabel: draft.category.trim().toUpperCase() || 'COMMUNITY',
      location: draft.location.trim(),
      participants: Number(draft.participants) || 30,
      updatedAt: new Date().toLocaleDateString('en-GB'),
    }

    setEvents((items) => {
      if (editorMode === 'update') {
        return items.map((item) => (item.id === nextEvent.id ? nextEvent : item))
      }

      return [nextEvent, ...items]
    })
    setActiveStatus(nextEvent.publicationStatus)
    setDetailEvent((current) => (current?.id === nextEvent.id ? nextEvent : current))
    closeEditor()
    // Hiển thị thông báo cho chức năng tạo hoặc cập nhật sự kiện.
    showToast({
      type: 'success',
      title: editorMode === 'update' ? 'Event updated' : 'Event created',
      message: editorMode === 'update'
        ? 'The event information has been updated.'
        : 'A new event has been created.',
    })
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

    setEvents((items) =>
      items.map((eventItem) =>
        eventItem.id === eventId
          ? { ...eventItem, lifecycleStatus: 'cancelled', updatedAt: new Date().toLocaleDateString('en-GB') }
          : eventItem
      )
    )
    setDetailEvent((current) =>
      current?.id === eventId
        ? { ...current, lifecycleStatus: 'cancelled', updatedAt: new Date().toLocaleDateString('en-GB') }
        : current
    )
    // Hiển thị thông báo cho chức năng hủy sự kiện.
    showToast({
      type: 'success',
      title: 'Event cancelled',
      message: `${eventItem?.name || 'The event'} has been marked as cancelled.`,
    })
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

  function submitTimeline(submitEvent) {
    submitEvent.preventDefault()
    if (!detailEvent) return

    const nextTimeline = {
      ...timelineDraft,
      id: timelineDraft.id || `timeline-${detailEvent.id}-${Date.now()}`,
      eventId: detailEvent.id,
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
    closeTimelineEditor()
    // Hiển thị thông báo cho chức năng tạo hoặc cập nhật timeline trong quản lý sự kiện.
    showToast({
      type: 'success',
      title: editingTimeline ? 'Timeline updated' : 'Timeline added',
      message: editingTimeline
        ? 'The timeline item has been updated.'
        : 'A new timeline item has been added.',
    })
  }

  async function deleteTimeline(timelineId) {
    const accepted = await confirm({
      title: 'Delete timeline item?',
      message: 'This timeline item will be removed from the event.',
      confirmText: 'Delete',
      tone: 'danger',
    })

    if (!accepted) return

    setTimelines((items) => items.filter((item) => item.id !== timelineId))
    // Hiển thị thông báo cho chức năng xóa timeline trong quản lý sự kiện.
    showToast({
      type: 'success',
      title: 'Timeline deleted',
      message: 'The timeline item has been removed.',
    })
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
              <CalendarIcon />
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
            <p>{detailEvent.description}</p>
            <article>{detailEvent.details}</article>
            <section className="club-event-management-timeline">
              <header>
                <div>
                  <h3>Event Timeline</h3>
                  <span>{detailEventTimelines.length} {detailEventTimelines.length === 1 ? 'item' : 'items'}</span>
                </div>
                <button type="button" onClick={() => openTimelineEditor()}>
                  Add item
                </button>
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
                        <div className="club-event-management-timeline__actions">
                          <button type="button" onClick={() => openTimelineEditor(timelineItem)}>
                            Edit
                          </button>
                          <button type="button" className="is-danger" onClick={() => deleteTimeline(timelineItem.id)}>
                            Delete
                          </button>
                        </div>
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
                <span>Short description *</span>
                <textarea
                  rows={3}
                  value={draft.description}
                  onChange={(event) => updateDraft('description', event.target.value)}
                  placeholder="Short summary displayed on event cards"
                  required
                />
              </label>

              <label className="club-event-management-field club-event-management-field--full">
                <span>Detailed content *</span>
                <textarea
                  rows={5}
                  value={draft.details}
                  onChange={(event) => updateDraft('details', event.target.value)}
                  placeholder="Detailed content, agenda, and speaker information..."
                  required
                />
              </label>

              <div className="club-event-management-editor__grid">
                <label className="club-event-management-field">
                  <span>Category *</span>
                  <input
                    type="text"
                    value={draft.category}
                    onChange={(event) => updateDraft('category', event.target.value)}
                    placeholder="Workshop, Sport, Community..."
                    required
                  />
                </label>
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
                  label="Publication status"
                  value={draft.publicationStatus}
                  options={EVENT_STATUSES}
                  onChange={(value) => updateDraft('publicationStatus', value)}
                />
              </div>

              <label className="club-event-management-field club-event-management-field--full">
                <span>Cover image URL</span>
                <input
                  type="url"
                  value={draft.imageUrl}
                  onChange={(event) => updateDraft('imageUrl', event.target.value)}
                  placeholder="Paste image link here..."
                />
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
                <input
                  type="text"
                  value={timelineDraft.time}
                  onChange={(eventChange) => updateTimelineDraft('time', eventChange.target.value)}
                  placeholder="HH:mm"
                  maxLength={5}
                  required
                />
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
