import { useEffect, useMemo, useState } from 'react'
import {
  getActivityScheduleDetail,
  getClubActivitySchedule,
} from '../../api/activitySchedule.api'
import {
  createSecretaryActivity,
  deleteSecretaryActivity,
  getSecretaryActivityScheduleDetail,
  getSecretaryClubActivitySchedule,
  updateSecretaryActivity,
} from '../../api/secretaryActivitySchedule.api'
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

const PROGRESS_OPTIONS = [
  { id: 'draft', label: 'Draft' },
  { id: 'published', label: 'Published' },
]

const EMPTY_FORM = {
  id: null,
  title: '',
  date: '',
  startTime: '',
  endTime: '',
  location: '',
  description: '',
  status: 'coming_soon',
  progressStatus: 'draft',
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

function toDateInputValue(dateValue) {
  if (!dateValue) return ''
  const d = new Date(dateValue)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
}

function toTimeInputValue(dateValue) {
  if (!dateValue) return ''
  const d = new Date(dateValue)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n) => String(n).padStart(2, '0')
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function toIsoDateTime(dateStr, timeStr) {
  if (!dateStr || !timeStr) return null
  const date = new Date(`${dateStr}T${timeStr}:00`)
  return Number.isNaN(date.getTime()) ? null : date.toISOString()
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
    progressStatus: apiActivity.progress_status || 'draft',
    type: meta.cardType,
    statusLabel: meta.label,
    statusEmoji: meta.emoji,
    mediaUrls: apiActivity.media_urls || [],
    createdBy: apiActivity.created_by || null,
    club: apiActivity.club_id || null,
  }
}

function ActivitySchedulePage({ clubId, isSecretary = false }) {
  const showToast = useToast()

  const [selectedActivity, setSelectedActivity] = useState(null)
  const [detailLoading, setDetailLoading] = useState(false)
  const [weekOffset, setWeekOffset] = useState(0)
  const [activeFilter, setActiveFilter] = useState('all')
  const [activitiesList, setActivitiesList] = useState([])
  const [loading, setLoading] = useState(true)
  const [reloadKey, setReloadKey] = useState(0)

  const [showFormModal, setShowFormModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState(EMPTY_FORM)
  const [activityToDelete, setActivityToDelete] = useState(null)
  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)

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
        const params = {
          start_date: monday.toISOString(),
          end_date: sunday.toISOString(),
          page: 1,
          limit: 100,
        }

        const res = isSecretary
          ? await getSecretaryClubActivitySchedule(clubId, params)
          : await getClubActivitySchedule(clubId, params)

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
  }, [clubId, monday, sunday, isSecretary, showToast, reloadKey])

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
      const res = isSecretary
        ? await getSecretaryActivityScheduleDetail(clubId, activity.id)
        : await getActivityScheduleDetail(clubId, activity.id)
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

  const handleOpenCreate = () => {
    setIsEditing(false)
    setFormData({
      ...EMPTY_FORM,
      date: toDateInputValue(monday),
    })
    setShowFormModal(true)
  }

  const handleOpenEdit = (e, activity) => {
    e.stopPropagation()
    setIsEditing(true)
    setFormData({
      id: activity.id,
      title: activity.title || '',
      date: toDateInputValue(activity.startTime),
      startTime: toTimeInputValue(activity.startTime),
      endTime: toTimeInputValue(activity.endTime),
      location: activity.location || '',
      description: activity.description || '',
      status: activity.status || 'coming_soon',
      progressStatus: activity.progressStatus || 'draft',
    })
    setShowFormModal(true)
  }

  const handleOpenDelete = (e, activity) => {
    e.stopPropagation()
    setActivityToDelete(activity)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = async () => {
    if (!clubId || !activityToDelete?.id) return

    setDeleting(true)
    try {
      await deleteSecretaryActivity(clubId, activityToDelete.id)
      showToast({ type: 'success', message: 'Activity deleted successfully' })
      setShowDeleteModal(false)
      if (selectedActivity?.id === activityToDelete.id) setSelectedActivity(null)
      setActivityToDelete(null)
      setReloadKey((k) => k + 1)
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Failed to delete activity',
      })
    } finally {
      setDeleting(false)
    }
  }

  const handleSaveActivity = async () => {
    if (!clubId) return

    const title = formData.title.trim()
    const description = formData.description.trim()
    const location = formData.location.trim()
    const startTime = toIsoDateTime(formData.date, formData.startTime)
    const endTime = toIsoDateTime(formData.date, formData.endTime)

    if (!title || !description || !location || !startTime || !endTime) {
      showToast({
        type: 'error',
        message: 'Please fill in all required fields',
      })
      return
    }

    if (new Date(startTime) >= new Date(endTime)) {
      showToast({
        type: 'error',
        message: 'End time must be after start time',
      })
      return
    }

    const payload = {
      title,
      description,
      location,
      start_time: startTime,
      end_time: endTime,
      status: formData.status,
      progress_status: formData.progressStatus,
    }

    setSaving(true)
    try {
      if (isEditing && formData.id) {
        await updateSecretaryActivity(clubId, formData.id, payload)
        showToast({ type: 'success', message: 'Activity updated successfully' })
      } else {
        await createSecretaryActivity(clubId, payload)
        showToast({ type: 'success', message: 'Activity created successfully' })
      }
      setShowFormModal(false)
      setReloadKey((k) => k + 1)
    } catch (err) {
      showToast({
        type: 'error',
        message: err.message || 'Failed to save activity',
      })
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="schedule-page">
      <header className="schedule-header">
        <div className="schedule-header__title">
          <h1>Weekly Activity Schedule</h1>
          <p className="schedule-header__subtitle">
            {isSecretary
              ? 'Manage club activities & publish the weekly schedule'
              : 'View your club activities & upcoming sessions'}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          {isSecretary && (
            <button className="btn-create-activity" onClick={handleOpenCreate} type="button">
              <svg style={{ width: '18px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create Activity
            </button>
          )}

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
                <path d="M9 18l6-6-6-6" />
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
                        {isSecretary ? (
                          <div style={{ display: 'flex', gap: '6px' }} onClick={(e) => e.stopPropagation()}>
                            <button
                              type="button"
                              onClick={(e) => handleOpenEdit(e, activity)}
                              style={{
                                background: 'rgba(253, 126, 20, 0.1)',
                                border: 'none',
                                padding: '4px',
                                borderRadius: '6px',
                                color: '#fd7e14',
                                cursor: 'pointer',
                              }}
                            >
                              <svg style={{ width: '14px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button
                              type="button"
                              onClick={(e) => handleOpenDelete(e, activity)}
                              style={{
                                background: 'rgba(239, 68, 68, 0.1)',
                                border: 'none',
                                padding: '4px',
                                borderRadius: '6px',
                                color: '#ef4444',
                                cursor: 'pointer',
                              }}
                            >
                              <svg style={{ width: '14px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                              </svg>
                            </button>
                          </div>
                        ) : (
                          <span style={{ fontSize: '11px', fontWeight: 700, color: '#64748b' }}>
                            {activity.statusLabel}
                          </span>
                        )}
                      </div>
                      <h3 className="activity-card__title">{activity.title}</h3>
                      <div className="activity-card__pts" style={{ opacity: 0.85 }}>
                        {isSecretary
                          ? `${activity.statusLabel} · ${activity.progressStatus}`
                          : activity.location || 'No location'}
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
                    {isSecretary ? ` · ${selectedActivity.progressStatus}` : ''}
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

      {showFormModal && isSecretary && (
        <div
          className="points-modal-overlay"
          style={{
            backdropFilter: 'blur(8px)',
            background: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000,
          }}
          onClick={() => !saving && setShowFormModal(false)}
        >
          <div
            className="points-modal shadow-2xl"
            style={{
              maxWidth: '520px',
              width: '100%',
              maxHeight: '90vh',
              padding: '0',
              borderRadius: '32px',
              border: 'none',
              background: 'white',
              position: 'relative',
              display: 'flex',
              flexDirection: 'column',
              overflow: 'hidden',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div
              style={{
                padding: '32px 40px 20px',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                flexShrink: 0,
              }}
            >
              <h2 style={{ fontSize: '28px', fontWeight: '800', color: '#1e293b', margin: 0 }}>
                {isEditing ? 'Update Activity' : 'Create New Activity'}
              </h2>
              <button
                type="button"
                onClick={() => !saving && setShowFormModal(false)}
                style={{
                  background: '#f1f5f9',
                  border: 'none',
                  width: '36px',
                  height: '36px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#64748b',
                  cursor: 'pointer',
                  fontSize: '20px',
                }}
              >
                &times;
              </button>
            </div>

            <div style={{ padding: '0 40px 20px', overflowY: 'auto', flex: 1 }}>
              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Weekly Meeting"
                  style={inputStyle}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div>
                  <label style={labelStyle}>Date *</label>
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    style={{ ...inputStyle, background: 'white' }}
                  >
                    {STATUS_FILTERS.filter((s) => s.id !== 'all').map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '24px' }}>
                <div>
                  <label style={labelStyle}>Start Time *</label>
                  <input
                    type="time"
                    value={formData.startTime}
                    onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>End Time *</label>
                  <input
                    type="time"
                    value={formData.endTime}
                    onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                    style={inputStyle}
                  />
                </div>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Progress</label>
                <select
                  value={formData.progressStatus}
                  onChange={(e) => setFormData({ ...formData, progressStatus: e.target.value })}
                  style={{ ...inputStyle, background: 'white' }}
                >
                  {PROGRESS_OPTIONS.map((opt) => (
                    <option key={opt.id} value={opt.id}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>

              <div style={{ marginBottom: '24px' }}>
                <label style={labelStyle}>Location *</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. Room A1, Main Hall"
                  style={inputStyle}
                />
              </div>

              <div style={{ marginBottom: '10px' }}>
                <label style={labelStyle}>Description *</label>
                <textarea
                  rows="3"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the activity..."
                  style={{ ...inputStyle, resize: 'none' }}
                />
              </div>
            </div>

            <div style={{ padding: '0 40px 40px', display: 'flex', gap: '16px', justifyContent: 'center', flexShrink: 0 }}>
              <button
                type="button"
                style={secondaryBtnStyle}
                onClick={() => setShowFormModal(false)}
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="button"
                style={primaryBtnStyle}
                onClick={handleSaveActivity}
                disabled={saving}
              >
                {saving ? 'Saving...' : isEditing ? 'Save Changes' : 'Create New'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showDeleteModal && isSecretary && (
        <div
          className="points-modal-overlay"
          style={{
            backdropFilter: 'blur(8px)',
            background: 'rgba(0, 0, 0, 0.4)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1100,
          }}
          onClick={() => !deleting && setShowDeleteModal(false)}
        >
          <div
            className="points-modal shadow-2xl"
            style={{
              maxWidth: '450px',
              width: '100%',
              padding: '40px',
              borderRadius: '32px',
              border: 'none',
              background: 'white',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ textAlign: 'center', marginBottom: '32px' }}>
              <div
                style={{
                  background: '#fef2f2',
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 20px',
                  color: '#ef4444',
                }}
              >
                <svg style={{ width: '32px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M10 11v6M14 11v6" />
                </svg>
              </div>
              <h2 style={{ fontSize: '24px', fontWeight: '800', color: '#1e293b', margin: '0 0 12px' }}>
                Delete Activity?
              </h2>
              <p style={{ color: '#64748b', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
                Are you sure you want to delete <strong>&quot;{activityToDelete?.title}&quot;</strong>? This action
                cannot be undone.
              </p>
            </div>
            <div style={{ display: 'flex', gap: '16px' }}>
              <button
                type="button"
                style={secondaryBtnStyle}
                onClick={() => setShowDeleteModal(false)}
                disabled={deleting}
              >
                No, Keep it
              </button>
              <button
                type="button"
                style={{ ...primaryBtnStyle, background: '#ef4444', boxShadow: '0 8px 20px rgba(239, 68, 68, 0.2)' }}
                onClick={handleDeleteConfirm}
                disabled={deleting}
              >
                {deleting ? 'Deleting...' : 'Yes, Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

const labelStyle = {
  display: 'block',
  fontSize: '13px',
  fontWeight: '800',
  color: '#334155',
  textTransform: 'uppercase',
  marginBottom: '10px',
  letterSpacing: '0.5px',
}

const inputStyle = {
  width: '100%',
  padding: '16px 20px',
  borderRadius: '16px',
  border: '1px solid #e2e8f0',
  fontSize: '16px',
  color: '#1e293b',
  outline: 'none',
}

const secondaryBtnStyle = {
  flex: 1,
  padding: '18px',
  borderRadius: '16px',
  border: 'none',
  background: '#f1f5f9',
  color: '#334155',
  fontWeight: '800',
  fontSize: '16px',
  cursor: 'pointer',
}

const primaryBtnStyle = {
  flex: 1,
  padding: '18px',
  borderRadius: '16px',
  border: 'none',
  background: '#fd7e14',
  color: 'white',
  fontWeight: '800',
  fontSize: '16px',
  cursor: 'pointer',
  boxShadow: '0 8px 20px rgba(253, 126, 20, 0.2)',
}

export default ActivitySchedulePage
