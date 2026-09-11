import { useEffect, useMemo, useRef, useState } from 'react'
import ClubLogo from '../../components/home/ClubLogo'
import { ALL_CLUBS } from '../../data/mockData'
import { getMyClubs } from '../../api/memberClubMembership.api'
import { getClubLeaderboard, getMyContributionLogs } from '../../api/pointRule.api'
import '../../styles/club-ranking.css'

const WEEKDAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

function startOfMonth(date) {
  return new Date(date.getFullYear(), date.getMonth(), 1)
}

function addMonths(date, amount) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1)
}

function isSameDay(left, right) {
  return (
    left.getFullYear() === right.getFullYear() &&
    left.getMonth() === right.getMonth() &&
    left.getDate() === right.getDate()
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
  return new Intl.DateTimeFormat('en-US', { month: 'long', year: 'numeric' }).format(date)
}

function formatDateLog(dateStr) {
  if (!dateStr) return ''
  const d = new Date(dateStr)
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d)
}

function RankingAvatar({ member }) {
  return (
    <div className="club-ranking-avatar" style={{ '--ranking-avatar-tone': member.tone }}>
      {member.avatarUrl ? (
        <img src={member.avatarUrl} alt={`${member.name} avatar`} />
      ) : (
        <span>{member.name ? member.name.slice(0, 1) : 'U'}</span>
      )}
    </div>
  )
}

function mapApiLeaderboardToRank(m, idx) {
  const user = m.user || {}
  const points = m.total_points ?? m.monthly_points ?? 0
  return {
    id: m.membership_id || user._id || `rank-${idx}`,
    name: user.full_name || 'Club Member',
    avatarUrl: user.avatar_url || '',
    contribution: points,
    tone: ['#ff9f2f', '#3b82f6', '#ec4899', '#8b5cf6', '#10b981'][idx % 5],
  }
}

function ClubRankingPage({ clubId }) {
  const today = useMemo(() => new Date(), [])
  const [selectedDate, setSelectedDate] = useState(today)
  const [calendarMonth, setCalendarMonth] = useState(startOfMonth(today))
  const [isCalendarOpen, setIsCalendarOpen] = useState(false)
  const [clubObj, setClubObj] = useState(null)
  const [rankedMembers, setRankedMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const periodRef = useRef(null)

  // My Contribution Logs State
  const [logsModalOpen, setLogsModalOpen] = useState(false)
  const [myLogs, setMyLogs] = useState([])
  const [loadingLogs, setLoadingLogs] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadRankingData() {
      setLoading(true)
      try {
        const myClubsRes = await getMyClubs().catch(() => ({ data: [] }))
        const memberships = myClubsRes.data || []

        const mine = memberships.find(
          (m) =>
            String(m.club_id?._id || m.club_id) === String(clubId) ||
            (m.club_id?.name && m.club_id.name.toLowerCase().includes(String(clubId || '').toLowerCase()))
        )

        const matchedMock = ALL_CLUBS.find(
          (item) =>
            item.id === clubId ||
            item.title?.toLowerCase().includes('guitar') ||
            item.name?.toLowerCase().includes('guitar')
        )

        const clubName = mine?.club_id?.name || matchedMock?.title || matchedMock?.name || 'Guitar Club'
        const actualClubId = mine ? mine.club_id?._id || mine.club_id : clubId

        setClubObj({
          id: actualClubId,
          name: clubName,
          title: clubName,
          logoText: matchedMock?.logoText || 'GC',
          logoUrl: matchedMock?.logoUrl || mine?.club_id?.logo_url,
        })

        if (actualClubId) {
          const lbRes = await getClubLeaderboard(actualClubId).catch(() => ({ data: [] }))
          if (!cancelled && lbRes.data && lbRes.data.length > 0) {
            setRankedMembers(lbRes.data.map((m, idx) => mapApiLeaderboardToRank(m, idx)))
          }
        }
      } catch (err) {
        console.error('Failed to load club ranking:', err)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadRankingData()
    return () => {
      cancelled = true
    }
  }, [clubId])

  async function openMyLogsModal() {
    setLogsModalOpen(true)
    setLoadingLogs(true)
    try {
      const activeId = clubObj?.id || clubId
      const res = await getMyContributionLogs(activeId)
      const rawData = res.data
      const logsArray = Array.isArray(rawData)
        ? rawData
        : (rawData && Array.isArray(rawData.logs) ? rawData.logs : [])
      setMyLogs(logsArray)
    } catch (err) {
      console.error('Failed to fetch contribution logs:', err)
      setMyLogs([])
    } finally {
      setLoadingLogs(false)
    }
  }

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

  // Top 3 Podium
  const podium = useMemo(() => rankedMembers.slice(0, 3), [rankedMembers])
  // Table members starting from Rank #4 (Index 3 onwards)
  const tableMembers = useMemo(() => rankedMembers.slice(3), [rankedMembers])

  const calendarDays = useMemo(() => buildCalendarDays(calendarMonth), [calendarMonth])

  const displayClub = clubObj || {
    name: 'Guitar Club',
    title: 'Guitar Club',
    logoText: 'GC',
  }

  return (
    <div className="club-ranking-page">
      <section className="club-ranking-shell">
        <header className="club-ranking-header">
          <div>
            <h1>{displayClub.name}</h1>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '8px' }}>
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
                      Today
                    </button>
                  </div>
                ) : null}
              </div>

              <button
                type="button"
                onClick={openMyLogsModal}
                style={{
                  height: '42px',
                  padding: '0 16px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(135deg, #ea580c 0%, #c2410c 100%)',
                  color: '#ffffff',
                  fontWeight: '800',
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  boxShadow: '0 8px 18px rgba(234, 88, 12, 0.25)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                📋 My Point History
              </button>
            </div>
          </div>
          <ClubLogo club={displayClub} className="club-ranking-header__logo" />
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
                <span>Contribution</span>
              </div>
              <div className="club-ranking-table__body">
                {loading ? (
                  <p style={{ padding: '20px', textAlign: 'center', color: '#888' }}>
                    Loading leaderboard rankings...
                  </p>
                ) : tableMembers.length === 0 ? (
                  <p style={{ padding: '20px', textAlign: 'center', color: '#888', fontSize: '0.9rem' }}>
                    {rankedMembers.length > 0 ? 'All members are currently on the Top 3 Podium' : 'No members ranked yet'}
                  </p>
                ) : (
                  tableMembers.map((member, index) => (
                    <article key={member.id} className="club-ranking-row">
                      <span className="club-ranking-row__rank">{String(index + 4).padStart(2, '0')}</span>
                      <div className="club-ranking-row__member">
                        <RankingAvatar member={member} />
                        <strong>{member.name}</strong>
                      </div>
                      <div className="club-ranking-row__stat">
                        <strong>{member.contribution}</strong>
                        <small>points</small>
                      </div>
                    </article>
                  ))
                )}
              </div>
            </div>
          </section>
        </div>
      </section>

      {/* My Contribution Logs Modal */}
      {logsModalOpen ? (
        <div className="club-point-rules-modal" role="dialog" aria-modal="true">
          <button type="button" className="club-point-rules-modal__backdrop" onClick={() => setLogsModalOpen(false)} />
          <div className="club-point-rules-modal__panel" style={{ width: 'min(580px, 100%)' }}>
            <div className="club-point-rules-modal__header">
              <h2>📋 My Point History</h2>
              <button type="button" onClick={() => setLogsModalOpen(false)}>Close</button>
            </div>

            {loadingLogs ? (
              <p style={{ padding: '30px', textAlign: 'center', color: '#64748b' }}>
                Loading point history...
              </p>
            ) : myLogs.length === 0 ? (
              <div style={{ padding: '30px 15px', textAlign: 'center', color: '#64748b' }}>
                <p style={{ fontSize: '1.05rem', fontWeight: '700', marginBottom: '4px' }}>No point history records yet</p>
                <p style={{ fontSize: '0.88rem' }}>You have not participated in any point-earning activities in this club yet.</p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '420px', overflowY: 'auto' }}>
                {myLogs.map((log) => {
                  const actName = log.action_type?.name || log.event?.title || 'Club Activity & Contribution'
                  const points = log.reward_point || 0
                  return (
                    <div
                      key={log._id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justify: 'space-between',
                        padding: '14px 16px',
                        background: '#f8fafc',
                        borderRadius: '14px',
                        border: '1px solid #e2e8f0',
                      }}
                    >
                      <div>
                        <strong style={{ display: 'block', fontSize: '0.95rem', color: '#0f172a', marginBottom: '2px' }}>
                          {actName}
                        </strong>
                        <span style={{ fontSize: '0.8rem', color: '#64748b' }}>
                          {formatDateLog(log.created_at)}
                        </span>
                      </div>
                      <span
                        style={{
                          padding: '6px 14px',
                          borderRadius: '20px',
                          background: 'linear-gradient(135deg, #2e7d32 0%, #1b5e20 100%)',
                          color: '#ffffff',
                          fontWeight: '800',
                          fontSize: '0.9rem',
                          boxShadow: '0 4px 10px rgba(46, 125, 50, 0.2)',
                        }}
                      >
                        +{points} pts
                      </span>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ClubRankingPage
