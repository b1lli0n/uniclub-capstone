import { useState } from 'react'

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

export function parseInputDateTime(value) {
  if (!value) return null
  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function toDateTimeInputValue(date) {
  if (!date) return ''
  const d = new Date(date)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (value) => String(value).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

export function formatDateTimeLabel(value) {
  const date = parseInputDateTime(value)
  if (!date) return 'Choose date and time'

  const pad = (number) => String(number).padStart(2, '0')
  return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`
}

export function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

export function sameDate(firstDate, secondDate) {
  return (
    firstDate &&
    secondDate &&
    firstDate.getFullYear() === secondDate.getFullYear() &&
    firstDate.getMonth() === secondDate.getMonth() &&
    firstDate.getDate() === secondDate.getDate()
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

export default function DateTimePicker({
  label,
  value,
  onChange,
  required = false,
  disabled = false,
  style = {},
  popoverAlign = 'left',
  minDate = null,
}) {
  const selectedDate = parseInputDateTime(value)
  const minDateStart = minDate ? new Date(minDate.getFullYear(), minDate.getMonth(), minDate.getDate()) : null
  const [isOpen, setIsOpen] = useState(false)
  const [viewDate, setViewDate] = useState(() => selectedDate || (minDateStart && minDateStart > new Date() ? minDateStart : new Date()))
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
    if (disabled) return
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
    <label
      className={`club-event-management-field club-event-management-date-field${disabled ? ' is-disabled' : ''}`}
      style={style}
    >
      {label && <span>{label}</span>}
      <input
        className="club-event-management-date-hidden"
        value={value || ''}
        onChange={() => {}}
        required={required}
        tabIndex={-1}
        aria-hidden="true"
      />
      <button
        type="button"
        disabled={disabled}
        className={`club-event-management-date-trigger${value ? ' has-value' : ''}${disabled ? ' is-disabled' : ''}`}
        onClick={openPicker}
      >
        <span>{formatDateTimeLabel(value)}</span>
        <CalendarIcon />
      </button>

      {isOpen && !disabled ? (
        <div
          className="club-event-management-date-popover"
          style={popoverAlign === 'right' ? { left: 'auto', right: 0 } : {}}
        >
          <div className="club-event-management-date-header">
            <button type="button" onClick={() => changeMonth(-1)} aria-label="Previous month">
              &lt;
            </button>
            <strong>
              {MONTH_NAMES[viewDate.getMonth()]} {viewDate.getFullYear()}
            </strong>
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
            {calendarDays.map((day) => {
              if (!day.date) return <span key={day.id} aria-hidden="true" />
              const isPast = minDateStart && day.date < minDateStart
              return (
                <button
                  key={day.id}
                  type="button"
                  disabled={isPast}
                  style={isPast ? { opacity: 0.28, cursor: 'not-allowed', pointerEvents: 'none' } : {}}
                  className={sameDate(day.date, selectedDate) ? 'is-selected' : ''}
                  onClick={() => !isPast && chooseDate(day.date)}
                >
                  {day.date.getDate()}
                </button>
              )
            })}
          </div>

          <div className="club-event-management-time-row">
            <label>
              <span>Time</span>
              <input type="time" value={selectedTime} onChange={(event) => chooseTime(event.target.value)} />
            </label>
          </div>

          <div className="club-event-management-date-actions">
            <button type="button" onClick={chooseToday}>
              Today
            </button>
            <button type="button" onClick={() => onChange('')}>
              Clear
            </button>
            <button type="button" onClick={() => setIsOpen(false)}>
              Done
            </button>
          </div>
        </div>
      ) : null}
    </label>
  )
}
