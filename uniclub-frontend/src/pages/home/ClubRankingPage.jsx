import { useEffect, useMemo, useRef, useState } from 'react'
import ClubLogo from '../../components/home/ClubLogo'
// Mock data import: replace with API data when BE is ready.
import {
  ALL_CLUBS,
  RANKING_MEMBERS,
} from '../../data/mockData'
import '../../styles/club-ranking.css'

const CLUB_RANKING_FALLBACK = ALL_CLUBS[0]
const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN']

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

function isSameDay(left, right) {
  return (
    left.getFullYear() === right.getFullYear()
    && left.getMonth() === right.getMonth()
    && left.getDate() === right.getDate()
  )
}

function buildCalendarDays(monthDate) {
  const monthStart = startOfMonth(monthDate)
  const calendarStart = new Date(monthStart)
  const offset = (monthStart.getDay() + 6) % 7

  calendarStart.setDate(monthStart.getDate() - offset)

  return Array.from({ length: 42 }, (_, index) => {
    const date = new Date(calendarStart)
    date.setDate(calendarStart.getDate() + index)

    return {
      key: `${date.getFullYear()}-${date.getMonth()}-${date.getDate()}`,
      date,
      isCurrentMonth: date.getMonth() === monthDate.getMonth(),
    }
  })
}

function formatPeriodLabel(date) {
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date)
}

function formatCalendarHeading(date) {
  return new Intl.DateTimeFormat('vi-VN', { month: 'long', year: 'numeric' }).format(date)
}

function RankingAvatar({ member }) {
  return (
    <div className="club-ranking-avatar" style={{ '--ranking-avatar-tone': member.tone }}>
      {member.avatarUrl ? (
        <img src={member.avatarUrl} alt={`${member.name} avatar`} />
      ) : (
        <span>{member.name.slice(0, 1)}</span>
      )}
    </div>
  )
}

function ClubRankingPage({ clubId }) {
  const club = ALL_CLUBS.find((item) => item.id === clubId) || CLUB_RANKING_FALLBACK
  const today = useMemo(() => new Date(), [])
  const [selectedDate, setSelectedDate] = useState(today)
  const [calendarMonth, setCalendarMonth] = useState(startOfMonth(today))
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const periodRef = useRef(null)
  const rankedMembers = [...RANKING_MEMBERS].sort((a, b) => b.contribution - a.contribution)
  const podium = rankedMembers.slice(0, 3)
  const calendarDays = useMemo(() => buildCalendarDays(calendarMonth), [calendarMonth])

  useEffect(() => {
    function handlePointerDown(event) {
      if (!periodRef.current?.contains(event.target)) {
        setIsCalendarOpen(false)
      }
    }

    function handleEscape(event) {
      if (event.key === 'Escape') {
        setIsCalendarOpen(false)
      }
    }

    if (!isCalendarOpen) return undefined

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('keydown', handleEscape)

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('keydown', handleEscape)
    }
  }, [isCalendarOpen])

  return (
    <div className="club-ranking-page">
      <section className="club-ranking-shell">
        <header className="club-ranking-header">
          <div>
            <h1>{club.name}</h1>
            <div className="club-ranking-period-wrap" ref={periodRef}>
              <button
                type="button"
                className="club-ranking-period"
                aria-haspopup="dialog"
                aria-expanded={isCalendarOpen}
                onClick={() => setIsCalendarOpen((value) => !value)}
              >
                <span>{formatPeriodLabel(selectedDate)}</span>
                <span className="club-ranking-period__caret" aria-hidden="true">
                  <svg viewBox="0 0 12 8" fill="none">
                    <path
                      d="M1 1.5 6 6.5l5-5"
                      stroke="currentColor"
                      strokeWidth="1.7"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </span>
              </button>

              {isCalendarOpen ? (
                <div className="club-ranking-calendar" role="dialog" aria-label="Choose date">
                  <div className="club-ranking-calendar__header">
                    <strong>{formatCalendarHeading(calendarMonth)}</strong>
                    <div className="club-ranking-calendar__nav">
                      <button
                        type="button"
                        aria-label="Previous month"
                        onClick={() => setCalendarMonth((value) => addMonths(value, -1))}
                      >
                        <svg viewBox="0 0 16 16" fill="none">
                          <path
                            d="M10 3.5 5.5 8 10 12.5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        aria-label="Next month"
                        onClick={() => setCalendarMonth((value) => addMonths(value, 1))}
                      >
                        <svg viewBox="0 0 16 16" fill="none">
                          <path
                            d="M6 3.5 10.5 8 6 12.5"
                            stroke="currentColor"
                            strokeWidth="1.8"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="club-ranking-calendar__weekdays">
                    {WEEKDAY_LABELS.map((label) => (
                      <span key={label}>{label}</span>
                    ))}
                  </div>

                  <div className="club-ranking-calendar__grid">
                    {calendarDays.map((item) => {
                      const isSelected = isSameDay(item.date, selectedDate)
                      const isToday = isSameDay(item.date, today)

                      return (
                        <button
                          key={item.key}
                          type="button"
                          className={[
                            'club-ranking-calendar__day',
                            item.isCurrentMonth ? '' : 'is-outside',
                            isSelected ? 'is-selected' : '',
                            isToday ? 'is-today' : '',
                          ].filter(Boolean).join(' ')}
                          onClick={() => {
                            setSelectedDate(item.date)
                            setCalendarMonth(startOfMonth(item.date))
                            setIsCalendarOpen(false)
                          }}
                        >
                          {item.date.getDate()}
                        </button>
                      )
                    })}
                  </div>

                  <button
                    type="button"
                    className="club-ranking-calendar__today"
                    onClick={() => {
                      setSelectedDate(today)
                      setCalendarMonth(startOfMonth(today))
                      setIsCalendarOpen(false)
                    }}
                  >
                    Hom nay
                  </button>
                </div>
              ) : null}
            </div>
          </div>
          <ClubLogo club={club} className="club-ranking-header__logo" />
        </header>

        <div className="club-ranking-content">
          <section className="club-ranking-podium" aria-label="Top members">
            {podium.map((member, index) => {
              const rank = index + 1
              return (
                <article
                  key={member.id}
                  className={`club-ranking-podium__item club-ranking-podium__item--rank-${rank}`}
                >
                  <RankingAvatar member={member} />
                  <strong>{member.name}</strong>
                  <small>{member.contribution} points</small>
                </article>
              )
            })}
          </section>

          <section className="club-ranking-table-wrap">
            <div className="club-ranking-table">
              <div className="club-ranking-table__head">
                <span>Rank</span>
                <span>Member</span>
                <span>Achievements</span>
                <span>Contribution</span>
              </div>
              <div className="club-ranking-table__body">
                {rankedMembers.map((member, index) => (
                  <article key={member.id} className="club-ranking-row">
                    <span className="club-ranking-row__rank">{String(index + 1).padStart(2, '0')}</span>
                    <div className="club-ranking-row__member">
                      <RankingAvatar member={member} />
                      <strong>{member.name}</strong>
                    </div>
                    <div className="club-ranking-row__stat">
                      <strong>{member.achievements}</strong>
                      <small>items</small>
                    </div>
                    <div className="club-ranking-row__stat">
                      <strong>{member.contribution}</strong>
                      <small>points</small>
                    </div>
                  </article>
                ))}
              </div>
            </div>
          </section>
        </div>
      </section>
    </div>
  )
}

export default ClubRankingPage
