import { useEffect, useMemo, useRef, useState } from 'react'
import {
  ALL_CLUBS,
  ALL_EVENTS,
  EVENT_ATTENDANCES,
  MY_CLUB_MEMBERSHIPS,
} from '../../data/mockData'
import '../../styles/club-attendance.css'
import { getClubById } from '../../api/club.api'
import { getMyClubs } from '../../api/memberClubMembership.api'
import { getClubEventsForMember, getEventAttendanceList, updateEventAttendanceStatus } from '../../api/event.api'
import { useConfirm, useToast } from '../../components/common/notificationContext'
import QrScannerModal from '../../components/common/QrScannerModal'

const CLUB_FALLBACK = ALL_CLUBS[0]

function getInitial(name) {
  return name.trim().slice(0, 1).toUpperCase()
}

function getNowLabel() {
  const now = new Date()
  const pad = (value) => String(value).padStart(2, '0')

  return `${pad(now.getHours())}:${pad(now.getMinutes())} ${pad(now.getDate())}/${pad(now.getMonth() + 1)}/${now.getFullYear()}`
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
  return {
    id: apiEvent._id || apiEvent.id,
    name: apiEvent.title || '',
    checkinOpen: apiEvent.check_in_status === 'open',
  }
}

function createManagedEvent(event) {
  return {
    id: event.id,
    name: event.name,
    checkinOpen: Boolean(event.checkinOpen),
  }
}

function AttendanceSelect({ value, options, onChange, placeholder, disabled = false }) {
  const [isOpen, setIsOpen] = useState(false)
  const selectRef = useRef(null)
  const selectedOption = options.find((option) => option.value === value)
  const displayLabel = selectedOption?.label || placeholder

  useEffect(() => {
    if (!isOpen) return undefined

    function handlePointerDown(event) {
      if (!selectRef.current?.contains(event.target)) {
        setIsOpen(false)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
    }
  }, [isOpen])

  function chooseOption(nextValue) {
    onChange(nextValue)
    setIsOpen(false)
  }

  return (
    <div ref={selectRef} className={`club-attendance-select${disabled ? ' is-disabled' : ''}`}>
      <button
        type="button"
        className={`club-attendance-select__button${isOpen ? ' is-open' : ''}`}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={isOpen}
        onClick={() => setIsOpen((current) => !current)}
      >
        <span>{displayLabel}</span>
        <svg viewBox="0 0 12 8" fill="none" aria-hidden="true">
          <path
            d="M1 1.5 6 6.5l5-5"
            stroke="currentColor"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </button>

      {isOpen ? (
        <div className="club-attendance-select__menu" role="listbox">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              role="option"
              aria-selected={option.value === value}
              className="club-attendance-select__option"
              onClick={() => chooseOption(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}

function ClubAttendancePage({ clubId }) {
  const confirm = useConfirm()
  const showToast = useToast()
  const [club, setClub] = useState(null)
  const [membership, setMembership] = useState(null)
  const [loading, setLoading] = useState(true)
  const [clubEvents, setClubEvents] = useState([])

  const [selectedEventId, setSelectedEventId] = useState('')
  const [query, setQuery] = useState('')
  const [manualMemberId, setManualMemberId] = useState('')
  const [attendanceItems, setAttendanceItems] = useState([])
  const [checkinOpenByEvent, setCheckinOpenByEvent] = useState({})
  const [scannerOpen, setScannerOpen] = useState(false)

  useEffect(() => {
    let active = true
    async function loadData() {
      setLoading(true)
      try {
        const [clubRes, myClubsRes, eventsRes] = await Promise.all([
          getClubById(clubId),
          getMyClubs().catch(() => ({ data: [] })),
          getClubEventsForMember(clubId).catch(() => ({ data: [] }))
        ])
        if (!active) return

        const loadedClub = clubRes.data
        setClub(loadedClub)

        const userMembership = (myClubsRes.data || []).find((item) => {
          const id = item.club_id?._id || item.club_id
          return String(id) === String(clubId)
        })
        setMembership(userMembership || null)

        let loadedEvents = []
        if (eventsRes.data && eventsRes.data.length > 0) {
          loadedEvents = eventsRes.data.map(mapEventFromApi)
        } else {
          // Fallback to mock events filtered by club name/slug
          const slug = loadedClub?.slug || loadedClub?.id || clubId
          loadedEvents = ALL_EVENTS.filter((event) => 
            String(event.clubId) === String(slug) || 
            String(event.clubId) === String(clubId)
          ).map(createManagedEvent)
        }
        setClubEvents(loadedEvents)

        // Initialize state variables based on loaded events
        const firstEventId = loadedEvents[0]?.id || ''
        setSelectedEventId(firstEventId)
      } catch (err) {
        console.error("Failed to load attendance data:", err)
      } finally {
        if (active) setLoading(false)
      }
    }
    loadData()
    return () => { active = false }
  }, [clubId])

  // Fetch real attendance list when selectedEventId changes
  useEffect(() => {
    if (!selectedEventId) return undefined

    let active = true
    async function loadAttendance() {
      try {
        const res = await getEventAttendanceList(selectedEventId)
        if (!active) return
        
        // Map backend attendance list to UI items
        const mapped = (res.data?.attendance || []).map((item) => ({
          id: item.registration_id || item._id,
          eventId: selectedEventId,
          memberName: item.user?.full_name || 'N/A',
          email: item.user?.email || 'N/A',
          checkedIn: item.status === 'attended',
          checkedInAt: item.check_in_time 
            ? new Date(item.check_in_time).toLocaleTimeString('vi-VN') + ' ' + new Date(item.check_in_time).toLocaleDateString('vi-VN')
            : '',
          registeredAt: item.registered_at 
            ? new Date(item.registered_at).toLocaleDateString('vi-VN')
            : '',
        }))

        setAttendanceItems(mapped)

        // Update check-in status mapping
        setCheckinOpenByEvent((current) => ({
          ...current,
          [selectedEventId]: res.data?.event?.check_in_status === 'open',
        }))
      } catch (err) {
        console.error("Failed to load attendance list from API:", err)
        // Fallback to mock if API fails/empty
        const filteredMock = EVENT_ATTENDANCES.filter((item) => item.eventId === selectedEventId)
        setAttendanceItems(filteredMock)
      }
    }

    loadAttendance()
    return () => { active = false }
  }, [selectedEventId])

  const selectedEvent = clubEvents.find((event) => event.id === selectedEventId) || clubEvents[0]

  const checkinOpen = Boolean(checkinOpenByEvent[selectedEvent?.id])
  const selectedAttendance = useMemo(
    () => attendanceItems.filter((item) => item.eventId === selectedEvent?.id),
    [attendanceItems, selectedEvent?.id]
  )
  const visibleAttendance = useMemo(() => {
    const keyword = query.trim().toLowerCase()
    if (!keyword) return selectedAttendance

    return selectedAttendance.filter(
      (item) =>
        item.memberName.toLowerCase().includes(keyword) ||
        item.email.toLowerCase().includes(keyword)
    )
  }, [query, selectedAttendance])

  if (loading) {
    return (
      <main className="club-attendance-page">
        <section className="club-attendance-empty">
          <h1>Loading...</h1>
          <p>Verifying club management permissions...</p>
        </section>
      </main>
    )
  }

  const activeClub = club || CLUB_FALLBACK
  const canManageAttendance = canManageEventOperations(membership?.role)
  const uncheckedAttendance = selectedAttendance.filter((item) => !item.checkedIn)
  const checkedCount = selectedAttendance.filter((item) => item.checkedIn).length
  const eventOptions = clubEvents.map((event) => ({
    value: event.id,
    label: event.name,
  }))
  const manualOptions = uncheckedAttendance.map((item) => ({
    value: item.id,
    label: `${item.memberName} - ${item.email}`,
  }))
  const manualPlaceholder = !checkinOpen
    ? 'Check-in is closed'
    : uncheckedAttendance.length === 0
      ? 'All members checked in'
      : 'Select member to check in'

  async function updateCheckinStatus(attendanceId) {
    if (!selectedEventId) return

    try {
      const res = await updateEventAttendanceStatus(selectedEventId, {
        target: 'registration',
        registration_id: attendanceId,
        status: 'attended',
      })

      if (res.success) {
        setAttendanceItems((items) =>
          items.map((item) =>
            item.id === attendanceId
              ? {
                  ...item,
                  checkedIn: true,
                  checkedInAt: new Date().toLocaleTimeString('vi-VN') + ' ' + new Date().toLocaleDateString('vi-VN'),
                }
              : item
          )
        )
        setManualMemberId('')

        const target = attendanceItems.find((item) => item.id === attendanceId)
        showToast({
          type: 'success',
          title: 'Checked in',
          message: `${target?.memberName || 'Member'} has been checked in successfully.`,
        })
      }
    } catch (err) {
      console.error("Check-in error:", err)
      showToast({
        type: 'error',
        title: 'Check-in failed',
        message: err.message || 'An error occurred while checking in.',
      })
    }
  }

  async function toggleCheckinOpen() {
    if (!selectedEvent) return
    const nextOpen = !checkinOpen
    const accepted = await confirm({
      title: nextOpen ? 'Open check-in?' : 'Close check-in?',
      message: `${nextOpen ? 'Open' : 'Close'} check-in for ${selectedEvent.name}?`,
      confirmText: nextOpen ? 'Open check-in' : 'Close check-in',
      tone: nextOpen ? 'warning' : 'danger',
    })

    if (!accepted) return

    try {
      const checkInStatus = nextOpen ? 'open' : 'closed'
      const res = await updateEventAttendanceStatus(selectedEvent.id, {
        target: 'event',
        check_in_status: checkInStatus,
      })

      if (res.success) {
        setCheckinOpenByEvent((current) => ({
          ...current,
          [selectedEvent.id]: nextOpen,
        }));
        showToast({
          type: 'success',
          title: nextOpen ? 'Check-in opened' : 'Check-in closed',
          message: `Check-in for ${selectedEvent.name} is now ${nextOpen ? 'open' : 'closed'}.`,
        })
      }
    } catch (err) {
      console.error("Failed to toggle check-in status:", err)
      showToast({
        type: 'error',
        title: 'Action failed',
        message: err.message || 'Could not update event check-in status.',
      })
    }
  }

  function playSuccessBeep() {
    try {
      const ctx = new (window.AudioContext || window.webkitAudioContext)()
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()
      osc.connect(gain)
      gain.connect(ctx.destination)
      osc.frequency.value = 800
      gain.gain.setValueAtTime(0, ctx.currentTime)
      gain.gain.linearRampToValueAtTime(0.1, ctx.currentTime + 0.05)
      gain.gain.linearRampToValueAtTime(0, ctx.currentTime + 0.15)
      osc.start(ctx.currentTime)
      osc.stop(ctx.currentTime + 0.15)
    } catch (err) {
      console.error("Failed to play success beep:", err)
    }
  }

  const handleScanSuccess = async (registrationId) => {
    setScannerOpen(false)
    playSuccessBeep()
    await updateCheckinStatus(registrationId)
  }

  if (!canManageAttendance) {
    return (
      <main className="club-attendance-page">
        <section className="club-attendance-empty">
          <h1>Attendance</h1>
          <p>Only event management or the club leader can view and update event attendance.</p>
        </section>
      </main>
    )
  }

  if (!selectedEvent) {
    return (
      <main className="club-attendance-page">
        <section className="club-attendance-empty">
          <h1>Attendance</h1>
          <p>This club does not have any events to manage attendance yet.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="club-attendance-page">
      <section className="club-attendance-hero">
        <div>
          <span>{activeClub.name}</span>
          <h1>Attendance</h1>
          <p>View attendance list and update check-in status for club events.</p>
        </div>

        <label className="club-attendance-event-picker">
          <span>Event</span>
          <AttendanceSelect
            value={selectedEvent.id}
            options={eventOptions}
            placeholder="Select event"
            onChange={(nextEventId) => {
              setSelectedEventId(nextEventId)
              setManualMemberId('')
              setQuery('')
            }}
          />
        </label>
      </section>

      <section className={`club-attendance-checkin-card${checkinOpen ? ' is-open' : ''}`}>
        <div className={`club-attendance-checkin-light${checkinOpen ? ' is-open' : ''}`} aria-hidden="true">
          <span />
        </div>
        <div>
          <span>Check-in status</span>
          <strong>{checkinOpen ? 'Open' : 'Closed'}</strong>
          <small>{selectedEvent.name}</small>
        </div>
        <button type="button" className={checkinOpen ? 'is-danger' : ''} onClick={toggleCheckinOpen}>
          {checkinOpen ? 'Close check-in' : 'Open check-in'}
        </button>
      </section>

      <section className="club-attendance-summary" aria-label="Attendance summary">
        <article>
          <strong>{selectedAttendance.length}</strong>
          <span>Total registrations</span>
        </article>
        <article>
          <strong>{uncheckedAttendance.length}</strong>
          <span>Waiting check-in</span>
        </article>
        <article>
          <strong>{checkedCount}</strong>
          <span>Checked in</span>
        </article>
      </section>

      <section className="club-attendance-manual">
        <div>
          <h2>Manual check-in</h2>
          <p>Select a registered student who has not checked in yet.</p>
        </div>
        <div className="club-attendance-manual__controls" style={{ display: 'flex', gap: '0.8rem', alignItems: 'center' }}>
          <AttendanceSelect
            value={manualMemberId}
            options={manualOptions}
            placeholder={manualPlaceholder}
            disabled={!checkinOpen || uncheckedAttendance.length === 0}
            onChange={setManualMemberId}
          />
          <button
            type="button"
            disabled={!checkinOpen || !manualMemberId}
            onClick={() => updateCheckinStatus(manualMemberId)}
          >
            Check in
          </button>
          
          <button
            type="button"
            className="club-attendance-qr-scan-btn"
            disabled={!checkinOpen}
            onClick={() => setScannerOpen(true)}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.5rem',
              backgroundColor: '#ff8e0b',
              color: '#fff',
              border: 'none',
              padding: '0.65rem 1.25rem',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '500',
              opacity: !checkinOpen ? 0.6 : 1,
              transition: 'all 0.2s',
            }}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ width: '18px', height: '18px' }}>
              <path d="M3 7V5a2 2 0 012-2h2M17 3h2a2 2 0 012 2v2M21 17v2a2 2 0 01-2 2h-2M7 21H5a2 2 0 01-2-2v-2" strokeLinecap="round" />
              <path d="M7 7h2v2H7zM15 7h2v2h-2zM7 15h2v2H7z" />
            </svg>
            Scan QR
          </button>
        </div>
      </section>

      <section className="club-attendance-table-card">
        <header>
          <div>
            <h2>Attendance List ({selectedAttendance.length})</h2>
            <span>{selectedEvent.date} - {selectedEvent.time}</span>
          </div>
          <label className="club-attendance-search">
            <span aria-hidden="true">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="11" cy="11" r="7" />
                <path d="M20 20l-3-3" strokeLinecap="round" />
              </svg>
            </span>
            <input
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search by name or email..."
            />
          </label>
        </header>

        <div className="club-attendance-table-wrap">
          <table className="club-attendance-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Member</th>
                <th>Status</th>
                <th>Check-in time</th>
                <th>Registered at</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleAttendance.map((item, index) => (
                <tr key={item.id}>
                  <td>{index + 1}</td>
                  <td>
                    <div className="club-attendance-member">
                      <span aria-hidden="true">{getInitial(item.memberName)}</span>
                      <div>
                        <strong>{item.memberName}</strong>
                        <small>{item.email}</small>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span className={`club-attendance-status ${item.checkedIn ? 'is-checked' : checkinOpen ? 'is-notyet' : 'is-absent'}`}>
                      {item.checkedIn ? 'Checked in' : checkinOpen ? 'Not yet' : 'Absent'}
                    </span>
                  </td>
                  <td>{item.checkedInAt || '-'}</td>
                  <td>{item.registeredAt}</td>
                  <td>
                    {item.checkedIn ? (
                      <span className="club-attendance-complete">Complete</span>
                    ) : checkinOpen ? (
                      <button type="button" className="club-attendance-row-action" onClick={() => updateCheckinStatus(item.id)}>
                        Check in
                      </button>
                    ) : (
                      <span className="club-attendance-muted">Check-in closed</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {visibleAttendance.length === 0 ? (
          <div className="club-attendance-empty-row">
            No attendees match this search.
          </div>
        ) : null}
      </section>

      <QrScannerModal
        isOpen={scannerOpen}
        onClose={() => setScannerOpen(false)}
        onScanSuccess={handleScanSuccess}
      />
    </main>
  )
}

export default ClubAttendancePage
