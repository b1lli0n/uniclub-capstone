import { useEffect, useMemo, useState } from 'react'
import {
  getActivityScheduleDetail,
  getClubActivitySchedule,
} from '../../api/activitySchedule.api'
import { useToast } from '../../components/common/notificationContext'
import '../../styles/schedule.css'

const WEEK_DAYS = [
  { id: 'mon', label: 'Monday', short: 'Mon' },
  { id: 'tue', label: 'Tuesday', short: 'Tue' },
  { id: 'wed', label: 'Wednesday', short: 'Wed' },
  { id: 'thu', label: 'Thursday', short: 'Thu' },
  { id: 'fri', label: 'Friday', short: 'Fri' },
  { id: 'sat', label: 'Saturday', short: 'Sat' },
  { id: 'sun', label: 'Sunday', short: 'Sun' },
]

const STATUS_FILTERS = [
  { id: 'all', label: 'All Activities' },
  { id: 'coming_soon', label: 'Coming Soon' },
  { id: 'opening', label: 'Opening' },
  { id: 'closed', label: 'Closed' },
  { id: 'cancelled', label: 'Cancelled' },
]

const STATUS_META = {
  coming_soon: { label: 'Coming Soon', emoji: '⏳', cardType: 'meeting' },
  opening: { label: 'Opening', emoji: '🟢', cardType: 'workshop' },
  closed: { label: 'Closed', emoji: '✅', cardType: 'outing' },
  cancelled: { label: 'Cancelled', emoji: '⛔', cardType: 'outing' },
}

function startOfDay(date) {
  const d = new Date(date)
  d.setHours(0, 0, 0, 0)
  return d
}

function endOfDay(date) {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

function getMondayOfWeek(baseDate, weekOffset = 0) {
  const d = new Date(baseDate)
  const day = d.getDay()
  const diff = d.getDate() - day + (day === 0 ? -6 : 1) + weekOffset * 7
  return startOfDay(new Date(d.setDate(diff)))
}

function formatTimeRange(startTime, endTime) {
  const options = { hour: '2-digit', minute: '2-digit', hour12: false }
  const start = startTime ? new Date(startTime).toLocaleTimeString('en-GB', options) : '--:--'
  const end = endTime ? new Date(endTime).toLocaleTimeString('en-GB', options) : '--:--'
  return `${start} - ${end}`
}

function getDayIndex(dateValue) {
  const day = new Date(dateValue).getDay()
  return day === 0 ? 6 : day - 1
}

function mapActivityFromApi(apiActivity) {
  if (!apiActivity) return null

  const status = apiActivity.status || 'coming_soon'
  const meta = STATUS_META[status] || STATUS_META.coming_soon

  return {
    id: apiActivity._id || apiActivity.id,
    title: apiActivity.title || '',
    description: apiActivity.description || '',
    location: apiActivity.location || '',
    startTime: apiActivity.start_time,
    endTime: apiActivity.end_time,
    time: formatTimeRange(apiActivity.start_time, apiActivity.end_time),
    dayIndex: apiActivity.start_time != null ? getDayIndex(apiActivity.start_time) : 0,
    status,
    type: meta.cardType,
    statusLabel: meta.label,
    statusEmoji: meta.emoji,
    mediaUrls: apiActivity.media_urls || [],
    createdBy: apiActivity.created_by || null,
    club: apiActivity.club_id || null,
  }
}

function ActivitySchedulePage({ clubId }) {
  const showToast = useToast()
  const [selectedActivity, setSelectedActivity] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0)
  const [activeFilter, setActiveFilter] = useState('all')
  const [activitiesList, setActivitiesList] = useState([])
  const [loading, setLoading] = useState(true)

  const today = useMemo(() => startOfDay(new Date()), [])
  const monday = useMemo(() => getMondayOfWeek(today, weekOffset), [today, weekOffset])
  const sunday = useMemo(() => {
    const d = new Date(monday)
    d.setDate(monday.getDate() + 6)
    return endOfDay(d)
  }, [monday])

  useEffect(() => {
    if (!clubId) return undefined

    let active = true

    async function loadSchedule() {
      setLoading(true)
      try {
        const res = await getClubActivitySchedule(clubId, {
          start_date: monday.toISOString(),
          end_date: sunday.toISOString(),
          page: 1,
          limit: 100,
        })

        if (!active) return

        const rows = res?.data?.activities || []
        setActivitiesList(rows.map(mapActivityFromApi).filter(Boolean))
      } catch (err) {
        if (!active) return
        console.error('Error loading activity schedule:', err)
        setActivitiesList([])
        showToast({
          type: 'error',
          message: err.message || 'Failed to load activity schedule',
        })
      } finally {
        if (active) setLoading(false)
      }
    }

    loadSchedule()
    return () => {
      active = false
    }
  }, [clubId, monday, sunday, showToast])

  const getWeekRangeString = () => {
    const options = { month: 'long', day: 'numeric' }
    if (monday.getMonth() === sunday.getMonth()) {
      return `${monday.toLocaleDateString('en-US', { month: 'long' })} ${monday.getDate()} - ${sunday.getDate()}, ${monday.getFullYear()}`
    }
    return `${monday.toLocaleDateString('en-US', options)} - ${sunday.toLocaleDateString('en-US', options)}, ${sunday.getFullYear()}`
  }

  const filteredActivities = activitiesList.filter(
    (act) => activeFilter === 'all' || act.status === activeFilter,
  )

  const handleOpenDetail = async (activity) => {
    setSelectedActivity(activity)
    if (!clubId || !activity?.id) return

    setDetailLoading(true)
    try {
      const res = await getActivityScheduleDetail(clubId, activity.id)
      const mapped = mapActivityFromApi(res?.data)
      if (mapped) setSelectedActivity(mapped)
    } catch (err) {
      console.error('Error loading activity detail:', err)
      showToast({
        type: 'error',
        message: err.message || 'Failed to load activity detail',
      })
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <div className="schedule-page">
      <header className="schedule-header">
        <div className="schedule-header__title">
          <h1>Weekly Activity Schedule</h1>
          <p className="schedule-header__subtitle">
            View your club activities & upcoming sessions
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div className="schedule-nav">
            <button
              className="schedule-nav__btn"
              title="Previous Week"
              onClick={() => setWeekOffset((prev) => prev - 1)}
              type="button"
            >
              <svg style={{ width: '18px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <div className="schedule-nav__current">{getWeekRangeString()}</div>
            <button
              className="schedule-nav__btn"
              title="Next Week"
              onClick={() => setWeekOffset((prev) => prev + 1)}
              type="button"
            >
              <svg style={{ width: '18px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6 6-6" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      <div className="schedule-filters" style={{ display: 'flex', gap: '10px', marginBottom: '24px', flexWrap: 'wrap' }}>
        {STATUS_FILTERS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            className={activeFilter === opt.id ? 'is-active' : ''}
            onClick={() => setActiveFilter(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div style={{ padding: '48px 0', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
          Loading schedule...
        </div>
      ) : (
        <div className="schedule-grid">
          {WEEK_DAYS.map((day, idx) => {
            const currentDate = new Date(monday)
            currentDate.setDate(monday.getDate() + idx)
            const isToday = currentDate.toDateString() === today.toDateString()
            const dayActivities = filteredActivities.filter((a) => a.dayIndex === idx)

            return (
              <div key={day.id} className={`schedule-col ${isToday ? 'schedule-col--today' : ''}`}>
                {isToday && <div className="today-badge">TODAY</div>}
                <div className="schedule-col__header">
                  <span className="schedule-col__day">{day.label}</span>
                  <span className="schedule-col__date">{currentDate.getDate()}</span>
                </div>

                <div className="schedule-col__content">
                  {dayActivities.map((activity) => (
                    <div
                      key={activity.id}
                      className={`activity-card activity-card--${activity.type}`}
                      onClick={() => handleOpenDetail(activity)}
                      style={{ position: 'relative', cursor: 'pointer' }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                        <span className="activity-card__time">{activity.time}</span>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
                          {activity.statusLabel}
                        </span>
                      </div>
                      <h3 className="activity-card__title">{activity.title}</h3>
                      <div className="activity-card__pts" style={{ opacity: 0.85 }}>
                        {activity.location || 'No location'}
                      </div>
                    </div>
                  ))}
                  {dayActivities.length === 0 && (
                    <div className="schedule-empty">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                        <path
                          d="M12 8V12M12 16H12.01M22 12C22 17.5228 17.5228 22 12 22C6.47715 22 2 17.5228 2 12C2 6.47715 6.47715 2 12 2C17.5228 2 22 6.47715 22 12Z"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                      <span>No Activity</span>
                    </div>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {selectedActivity && (
        <div className="points-modal-overlay" onClick={() => setSelectedActivity(null)} style={{ zIndex: 900 }}>
          <div className="points-modal shadow-2xl" style={{ maxWidth: '500px' }} onClick={(e) => e.stopPropagation()}>
            <div className="points-modal__header">
              <h3>Activity Detail</h3>
              <button className="points-modal__close" onClick={() => setSelectedActivity(null)} type="button">
                &times;
              </button>
            </div>
            <div className="points-modal__body">
              {detailLoading ? (
                <p style={{ color: '#64748b', fontWeight: 600 }}>Loading detail...</p>
              ) : (
                <>
                  <div className="activity-detail-hero">{selectedActivity.statusEmoji}</div>
                  <h2 style={{ fontSize: '24px', fontWeight: '900', marginBottom: '8px', color: '#0f172a' }}>
                    {selectedActivity.title}
                  </h2>
                  <div
                    className="activity-card__pts"
                    style={{ fontSize: '13px', padding: '6px 12px', borderRadius: '12px', marginBottom: '24px' }}
                  >
                    Status: {selectedActivity.statusLabel}
                  </div>
                  <div className="activity-detail-meta">
                    <div className="meta-box">
                      <div className="meta-box__icon">
                        <svg style={{ width: '20px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" />
                          <path d="M16 2v4M8 2v4M3 10h18" />
                        </svg>
                      </div>
                      <div className="meta-box__info">
                        <h5>Time</h5>
                        <p>{selectedActivity.time}</p>
                      </div>
                    </div>
                    <div className="meta-box">
                      <div className="meta-box__icon">
                        <svg style={{ width: '20px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </div>
                      <div className="meta-box__info">
                        <h5>Location</h5>
                        <p>{selectedActivity.location || '—'}</p>
                      </div>
                    </div>
                  </div>
                  {selectedActivity.createdBy?.full_name && (
                    <p style={{ color: '#64748b', fontSize: '13px', marginBottom: '16px' }}>
                      Created by {selectedActivity.createdBy.full_name}
                    </p>
                  )}
                  <div className="activity-description">
                    <h4
                      style={{
                        fontSize: '14px',
                        fontWeight: '800',
                        color: '#64748b',
                        marginBottom: '8px',
                        textTransform: 'uppercase',
                      }}
                    >
                      About this activity
                    </h4>
                    <p style={{ color: '#334155', lineHeight: '1.6', fontSize: '15px' }}>
                      {selectedActivity.description || 'No description'}
                    </p>
                  </div>
                </>
              )}
            </div>
            <div className="points-modal__footer" style={{ marginTop: '24px' }}>
              <button
                className="btn-primary"
                style={{ width: '100%', height: '52px', background: '#fd7e14', fontSize: '16px', fontWeight: '700' }}
                onClick={() => setSelectedActivity(null)}
                type="button"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ActivitySchedulePage
