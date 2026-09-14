import { useEffect, useMemo, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import {
  getSecretaryActivityScheduleDetail,
  getSecretaryActivityAttendance,
  saveSecretaryActivityAttendance,
} from '../../api/secretaryActivitySchedule.api'
import { useToast } from '../../components/common/notificationContext'
import '../../styles/activity-attendance.css'

function formatTimeRange(startTime, endTime) {
  const options = { hour: '2-digit', minute: '2-digit', hour12: false }
  const start = startTime ? new Date(startTime).toLocaleTimeString('en-GB', options) : '--:--'
  const end = endTime ? new Date(endTime).toLocaleTimeString('en-GB', options) : '--:--'
  return `${start} - ${end}`
}

function formatDate(dateValue) {
  if (!dateValue) return ''
  const d = new Date(dateValue)
  if (Number.isNaN(d.getTime())) return ''
  return d.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export default function ActivityAttendancePage() {
  const { clubId, activityId } = useParams()
  const navigate = useNavigate()
  const showToast = useToast()

  const [activity, setActivity] = useState(null)
  const [members, setMembers] = useState([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState('all') // 'all', 'attended', 'absent'

  useEffect(() => {
    if (!clubId || !activityId) return

    let active = true

    async function loadAttendanceData() {
      setLoading(true)
      try {
        const [activityRes, attendanceRes] = await Promise.all([
          getSecretaryActivityScheduleDetail(clubId, activityId),
          getSecretaryActivityAttendance(clubId, activityId),
        ])

        if (!active) return

        if (activityRes?.data) {
          setActivity(activityRes.data)
        }

        const memberList = attendanceRes?.data?.members || []
        setMembers(
          memberList.map((m) => ({
            id: m.id || m.userId,
            membershipId: m.membershipId,
            name: m.name || 'Member',
            email: m.email || '',
            avatarUrl: m.avatarUrl || '',
            checked: Boolean(m.checked),
            status: m.status || (m.checked ? 'attended' : 'absent'),
            checkInTime: m.checkInTime || null,
          }))
        )
      } catch (err) {
        if (!active) return
        console.error('Error loading activity attendance:', err)
        showToast({
          type: 'error',
          message: err.message || 'Failed to load activity attendance',
        })
      } finally {
        if (active) setLoading(false)
      }
    }

    loadAttendanceData()

    return () => {
      active = false
    }
  }, [clubId, activityId, showToast])

  // Toggle single member attendance
  const toggleMember = (memberId) => {
    setMembers((prev) =>
      prev.map((m) => {
        if (m.id === memberId || m.membershipId === memberId) {
          const nextChecked = !m.checked
          return {
            ...m,
            checked: nextChecked,
            status: nextChecked ? 'attended' : 'absent',
            checkInTime: nextChecked ? new Date().toISOString() : null,
          }
        }
        return m
      })
    )
  }

  // Bulk check/uncheck
  const handleBulkCheck = (checkValue) => {
    setMembers((prev) =>
      prev.map((m) => ({
        ...m,
        checked: checkValue,
        status: checkValue ? 'attended' : 'absent',
        checkInTime: checkValue ? new Date().toISOString() : null,
      }))
    )
  }

  // Save attendance to backend
  const handleSaveAttendance = async () => {
    if (!clubId || !activityId) return

    setSaving(true)
    try {
      const payload = members.map((m) => ({
        userId: m.id,
        membershipId: m.membershipId,
        checked: Boolean(m.checked),
      }))

      await saveSecretaryActivityAttendance(clubId, activityId, payload)

      const attendedCount = members.filter((m) => m.checked).length
      showToast({
        type: 'success',
        message: `Attendance saved successfully! Added +30 pts for ${attendedCount} member(s).`,
      })
    } catch (err) {
      console.error('Save attendance error:', err)
      showToast({
        type: 'error',
        message: err.message || 'Failed to save attendance',
      })
    } finally {
      setSaving(false)
    }
  }

  // Filtered members for display
  const filteredMembers = useMemo(() => {
    return members.filter((m) => {
      const matchesSearch =
        !searchQuery ||
        m.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        m.email?.toLowerCase().includes(searchQuery.toLowerCase())

      if (!matchesSearch) return false

      if (statusFilter === 'attended') return m.checked
      if (statusFilter === 'absent') return !m.checked
      return true
    })
  }, [members, searchQuery, statusFilter])

  // Metrics
  const totalCount = members.length
  const attendedCount = useMemo(() => members.filter((m) => m.checked).length, [members])
  const absentCount = totalCount - attendedCount
  const attendanceRate = totalCount > 0 ? Math.round((attendedCount / totalCount) * 100) : 0

  if (loading) {
    return (
      <div className="activity-attendance-page">
        <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b', fontWeight: 600 }}>
          <p>Loading activity attendance...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="activity-attendance-page">
      {/* Header */}
      <div className="activity-attendance__header">
        <button
          type="button"
          className="activity-attendance__back-btn"
          onClick={() => navigate(`/clubs/${clubId}/manage-activity-schedule`)}
        >
          <svg style={{ width: '16px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <path d="M19 12H5M12 19l-7-7 7-7" />
          </svg>
          Back to Activity Schedule
        </button>

        <div className="activity-attendance__title-row">
          <div className="activity-attendance__title-group">
            <h1>
              <span>📋</span> {activity?.title || 'Activity Attendance'}
            </h1>
            <div className="activity-attendance__meta-tags">
              <span className="activity-attendance__meta-tag">
                <svg style={{ width: '15px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" />
                  <path d="M16 2v4M8 2v4M3 10h18" />
                </svg>
                {formatDate(activity?.start_time)}
              </span>
              <span className="activity-attendance__meta-tag">
                <svg style={{ width: '15px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
                {formatTimeRange(activity?.start_time, activity?.end_time)}
              </span>
              <span className="activity-attendance__meta-tag">
                <svg style={{ width: '15px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                {activity?.location || 'No location'}
              </span>
              <span className={`activity-attendance__status-badge activity-attendance__status-badge--${activity?.status || 'coming_soon'}`}>
                {activity?.status?.replace('_', ' ') || 'coming soon'}
              </span>
            </div>
          </div>

          <button
            type="button"
            className="activity-attendance__save-btn"
            onClick={handleSaveAttendance}
            disabled={saving}
          >
            <svg style={{ width: '18px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
              <polyline points="17 21 17 13 7 13 7 21" />
              <polyline points="7 3 7 8 15 8" />
            </svg>
            {saving ? 'Saving...' : 'Save Attendance & Award Points (+30 pts)'}
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="activity-attendance__stats-grid">
        <div className="activity-attendance__stat-card">
          <span className="activity-attendance__stat-label">Total Members</span>
          <span className="activity-attendance__stat-value">{totalCount}</span>
        </div>

        <div className="activity-attendance__stat-card activity-attendance__stat-card--attended">
          <span className="activity-attendance__stat-label">Attended</span>
          <span className="activity-attendance__stat-value">{attendedCount}</span>
        </div>

        <div className="activity-attendance__stat-card activity-attendance__stat-card--absent">
          <span className="activity-attendance__stat-label">Absent</span>
          <span className="activity-attendance__stat-value">{absentCount}</span>
        </div>

        <div className="activity-attendance__stat-card activity-attendance__stat-card--rate">
          <span className="activity-attendance__stat-label">Attendance Rate</span>
          <span className="activity-attendance__stat-value">{attendanceRate}%</span>
          <div className="activity-attendance__progress-bar">
            <div className="activity-attendance__progress-fill" style={{ width: `${attendanceRate}%` }} />
          </div>
        </div>
      </div>

      {/* Controls Bar */}
      <div className="activity-attendance__controls">
        <div className="activity-attendance__search">
          <svg className="activity-attendance__search-icon" style={{ width: '18px' }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
          <input
            type="text"
            placeholder="Search member by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        <div className="activity-attendance__filters">
          <button
            type="button"
            className={`activity-attendance__filter-btn ${statusFilter === 'all' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('all')}
          >
            All ({totalCount})
          </button>
          <button
            type="button"
            className={`activity-attendance__filter-btn ${statusFilter === 'attended' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('attended')}
          >
            Attended ({attendedCount})
          </button>
          <button
            type="button"
            className={`activity-attendance__filter-btn ${statusFilter === 'absent' ? 'is-active' : ''}`}
            onClick={() => setStatusFilter('absent')}
          >
            Absent ({absentCount})
          </button>
        </div>

        <div className="activity-attendance__bulk-actions">
          <button
            type="button"
            className="activity-attendance__bulk-btn"
            onClick={() => handleBulkCheck(true)}
          >
            ✓ Check All
          </button>
          <button
            type="button"
            className="activity-attendance__bulk-btn"
            onClick={() => handleBulkCheck(false)}
          >
            ✕ Uncheck All
          </button>
        </div>
      </div>

      {/* Table Card */}
      <div className="activity-attendance__table-card">
        {filteredMembers.length > 0 ? (
          <table className="activity-attendance__table">
            <thead>
              <tr>
                <th>Member</th>
                <th>Status</th>
                <th>Check-in Time</th>
                <th style={{ textAlign: 'center' }}>Mark Attendance</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.map((m) => {
                const memberKey = m.id || m.membershipId
                return (
                  <tr key={memberKey} className={m.checked ? 'is-attended' : ''}>
                    <td>
                      <div className="activity-attendance__member-info">
                        <div className="activity-attendance__avatar">
                          {m.avatarUrl ? (
                            <img src={m.avatarUrl} alt={m.name} />
                          ) : (
                            m.name?.charAt(0)?.toUpperCase() || 'M'
                          )}
                        </div>
                        <div>
                          <div className="activity-attendance__name">{m.name}</div>
                          <div className="activity-attendance__email">{m.email}</div>
                        </div>
                      </div>
                    </td>

                    <td>
                      <span
                        className={`activity-attendance__row-badge ${
                          m.checked
                            ? 'activity-attendance__row-badge--attended'
                            : 'activity-attendance__row-badge--absent'
                        }`}
                      >
                        {m.checked ? '✓ Attended' : '✕ Absent'}
                      </span>
                    </td>

                    <td style={{ color: '#64748b', fontSize: '13px' }}>
                      {m.checkInTime
                        ? new Date(m.checkInTime).toLocaleTimeString('en-GB', {
                            hour: '2-digit',
                            minute: '2-digit',
                            second: '2-digit',
                          })
                        : '—'}
                    </td>

                    <td style={{ textAlign: 'center' }}>
                      <label className="activity-attendance__switch">
                        <input
                          type="checkbox"
                          checked={m.checked}
                          onChange={() => toggleMember(memberKey)}
                        />
                        <span className="activity-attendance__slider" />
                      </label>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        ) : (
          <div className="activity-attendance__empty">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <h3>No members found</h3>
            <p>
              {searchQuery
                ? `No members match "${searchQuery}"`
                : 'There are currently no active members in this club.'}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
