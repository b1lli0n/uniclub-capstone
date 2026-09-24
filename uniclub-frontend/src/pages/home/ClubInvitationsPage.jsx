import { useEffect, useMemo, useState } from 'react'
import { getClubById } from '../../api/club.api'
import { getMyClubs } from '../../api/memberClubMembership.api'
import {
  cancelClubInvitation,
  getClubInvitationDetail,
  getClubInvitations,
  resendClubInvitation,
  sendClubInvitation,
} from '../../api/secretaryInvitationManagement.api'
import { apiRequest, toQueryString } from '../../api/api'
import { mapClubFromApi, mapClubInvitationFromApi, formatRoleLabel } from '../../api/clubMappers'
import { CLUB_INVITATION_STATUS_OPTIONS } from '../../data/clubInvitationsData'
import { useToast } from '../../components/common/notificationContext'
import '../../styles/club-invitations.css'

const EMPTY_FORM = { invitedUserId: '', role: 'member', message: '' }

function statusLabel(status) {
  if (status === 'declined') return 'Declined'
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function ClubInvitationsPage({ clubId }) {
  const showToast = useToast()
  const [club, setClub] = useState(null)
  const [canManageInvitations, setCanManageInvitations] = useState(false)
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedInvitation, setSelectedInvitation] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [submitting, setSubmitting] = useState(false)

  async function loadInvitations(nextStatus = statusFilter) {
    const response = await getClubInvitations(clubId, {
      status: nextStatus !== 'all' ? nextStatus : undefined,
    })
    setInvitations((response.data || []).map((item) => mapClubInvitationFromApi(item)))
  }

  useEffect(() => {
    let cancelled = false

    async function loadPageData() {
      setLoading(true)
      try {
        const [clubResponse, myClubsResponse, invitationsResponse] = await Promise.all([
          getClubById(clubId),
          getMyClubs(),
          getClubInvitations(clubId, {
            status: statusFilter !== 'all' ? statusFilter : undefined,
          }),
        ])

        if (cancelled) return

        setClub(mapClubFromApi(clubResponse.data))

        const membership = (myClubsResponse.data || []).find((item) => {
          const id = item.club_id?._id || item.club_id
          return String(id) === String(clubId)
        })
        const role = membership?.role?.toLowerCase()
        setCanManageInvitations(role === 'secretary' || role === 'president' || role === 'leader')

        setInvitations(
          (invitationsResponse.data || []).map((item) => mapClubInvitationFromApi(item)),
        )
      } catch (error) {
        console.error(error)
        if (!cancelled) {
          setClub(null)
          setInvitations([])
          setCanManageInvitations(false)
          showToast({
            type: 'error',
            title: 'Load failed',
            message: error.message || 'Could not load invitations.',
          })
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadPageData()
    return () => {
      cancelled = true
    }
  }, [clubId, statusFilter])

  const visibleInvitations = useMemo(() => {
    const query = search.trim().toLowerCase()
    return invitations.filter((invitation) => {
      if (!query) return true
      return [invitation.recipientName, invitation.recipientEmail].some((value) =>
        value.toLowerCase().includes(query),
      )
    })
  }, [invitations, search])

  const pendingCount = invitations.filter((item) => item.status === 'pending').length

  function openCreateModal() {
    setForm(EMPTY_FORM)
    setShowCreateModal(true)
  }

  async function createInvitation(event, directTarget) {
    if (event && event.preventDefault) event.preventDefault()
    const targetUserId = directTarget || form.invitedUserId
    if (!targetUserId?.trim()) {
      showToast({
        type: 'warning',
        title: 'Missing recipient',
        message: 'Please enter student email or select a student to invite.',
      })
      return
    }
    if (submitting || !canManageInvitations) return

    setSubmitting(true)
    try {
      const defaultMessage = club?.name
        ? `We would love to invite you to join ${club.name}.`
        : ''
      await sendClubInvitation(clubId, {
        invited_user_id: targetUserId.trim(),
        role: form.role || 'member',
        message: form.message.trim() || defaultMessage,
      })
      await loadInvitations()
      setShowCreateModal(false)
      showToast({
        type: 'success',
        title: 'Invitation sent',
        message: 'Invitation sent successfully.',
      })
    } catch (error) {
      console.error(error)
      showToast({
        type: 'error',
        title: 'Send failed',
        message: error.message || 'Could not send invitation.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleCancelInvitation() {
    if (!cancelTarget || submitting || !canManageInvitations) return

    setSubmitting(true)
    try {
      await cancelClubInvitation(clubId, cancelTarget.id)
      await loadInvitations()
      setSelectedInvitation((item) =>
        item?.id === cancelTarget.id ? { ...item, status: 'cancelled', rawStatus: 'cancelled' } : item,
      )
      showToast({
        type: 'success',
        title: 'Invitation cancelled',
        message: `Invitation to ${cancelTarget.recipientName} was cancelled.`,
      })
      setCancelTarget(null)
    } catch (error) {
      console.error(error)
      showToast({
        type: 'error',
        title: 'Cancel failed',
        message: error.message || 'Could not cancel invitation.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleResendInvitation(invitation) {
    if (!invitation || submitting || !canManageInvitations) return

    setSubmitting(true)
    try {
      const response = await resendClubInvitation(clubId, invitation.id)
      const mapped = mapClubInvitationFromApi(response.data)
      await loadInvitations()
      setSelectedInvitation((item) => (item?.id === invitation.id ? mapped : item))
      showToast({
        type: 'success',
        title: 'Invitation resent',
        message: `Invitation resent to ${invitation.recipientName}.`,
      })
    } catch (error) {
      console.error(error)
      showToast({
        type: 'error',
        title: 'Resend failed',
        message: error.message || 'Could not resend invitation.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleViewDetails(invitation) {
    try {
      const response = await getClubInvitationDetail(clubId, invitation.id)
      setSelectedInvitation(mapClubInvitationFromApi(response.data))
    } catch (error) {
      console.error(error)
      setSelectedInvitation(invitation)
    }
  }

  if (!loading && !canManageInvitations) {
    return (
      <main className="club-invitations-page">
        <section className="club-invitations-empty" style={{ margin: '3rem auto', padding: '3rem', textAlign: 'center' }}>
          <h2>Access Restricted</h2>
          <p>Only the club Secretary or President can manage invitations.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="club-invitations-page">
      <section className="club-invitations-hero">
        <div>
          <span className="club-invitations-hero__eyebrow">{club?.name || 'Club'}</span>
          <h1>Invitation Management</h1>
          <p>Invite promising students and keep track of every club invitation in one place.</p>
        </div>
        <div className="club-invitations-hero__summary">
          <span>Awaiting response</span>
          <strong>{pendingCount}</strong>
          <button
            type="button"
            onClick={openCreateModal}
            disabled={!canManageInvitations || loading}
          >
            + Send invitation
          </button>
        </div>
      </section>

      <section className="club-invitations-toolbar" aria-label="Invitation controls">
        <label className="club-invitations-search">
          <svg viewBox="0 0 24 24" aria-hidden="true">
            <circle cx="11" cy="11" r="6" />
            <path d="m16 16 4 4" />
          </svg>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search recipient name or email..."
          />
        </label>
        <div className="club-invitations-filters" role="tablist" aria-label="Filter invitation status">
          {CLUB_INVITATION_STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={statusFilter === option.value}
              className={statusFilter === option.value ? 'is-active' : undefined}
              onClick={() => setStatusFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="club-invitations-list" aria-label="Club invitations">
        {loading ? (
          <div className="club-invitations-empty">
            <strong>Loading invitations...</strong>
          </div>
        ) : null}
        {!loading
          ? visibleInvitations.map((invitation) => (
              <article key={invitation.id} className="club-invitation-card">
                <div className="club-invitation-card__person">
                  <div className="club-invitation-card__avatar" aria-hidden="true">
                    {invitation.initials}
                  </div>
                  <div>
                    <h2>{invitation.recipientName}</h2>
                    <span>{invitation.recipientMeta}</span>
                  </div>
                </div>
                <div className="club-invitation-card__meta">
                  <span
                    className={`club-invitation-status club-invitation-status--${invitation.status}`}
                  >
                    {statusLabel(invitation.status)}
                  </span>
                </div>
                <div className="club-invitation-card__actions">
                  <button
                    type="button"
                    className="club-invitation-card__details"
                    onClick={() => handleViewDetails(invitation)}
                  >
                    View Details
                  </button>
                </div>
              </article>
            ))
          : null}
        {!loading && !visibleInvitations.length ? (
          <div className="club-invitations-empty">
            <strong>No invitations found</strong>
            <span>Try another search or send a new invitation.</span>
          </div>
        ) : null}
      </section>

      {selectedInvitation ? (
        <InvitationDetail
          invitation={selectedInvitation}
          canManage={canManageInvitations}
          onClose={() => setSelectedInvitation(null)}
          onCancel={() => setCancelTarget(selectedInvitation)}
          onResend={() => handleResendInvitation(selectedInvitation)}
        />
      ) : null}
      {showCreateModal ? (
        <InvitationForm
          clubName={club?.name || 'Club'}
          form={form}
          setForm={setForm}
          submitting={submitting}
          onClose={() => setShowCreateModal(false)}
          onSubmit={createInvitation}
        />
      ) : null}
      {cancelTarget ? (
        <ConfirmCancel
          recipient={cancelTarget.recipientName}
          submitting={submitting}
          onClose={() => setCancelTarget(null)}
          onConfirm={handleCancelInvitation}
        />
      ) : null}
    </main>
  )
}

function InvitationDetail({ invitation, canManage, onClose, onCancel, onResend }) {
  return (
    <div className="club-invitation-modal" role="dialog" aria-modal="true" aria-labelledby="invitation-detail-title">
      <button
        type="button"
        className="club-invitation-modal__backdrop"
        aria-label="Close invitation details"
        onClick={onClose}
      />
      <section className="club-invitation-modal__panel">
        <header>
          <div>
            <span>Invitation Details</span>
            <h2 id="invitation-detail-title">{invitation.recipientName}</h2>
          </div>
          <button type="button" className="club-invitation-modal__close" onClick={onClose}>
            ×
          </button>
        </header>
        <div className="club-invitation-detail-grid">
          <div>
            <span>Email</span>
            <strong>{invitation.recipientEmail}</strong>
          </div>
          <div>
            <span>Assigned Role</span>
            <strong>{formatRoleLabel(invitation.role)}</strong>
          </div>
          <div>
            <span>Invitation ID</span>
            <strong>{invitation.id}</strong>
          </div>
          <div>
            <span>Status</span>
            <strong className={`club-invitation-status club-invitation-status--${invitation.status}`}>
              {statusLabel(invitation.status)}
            </strong>
          </div>
          <div>
            <span>Sent by</span>
            <strong>{invitation.sentBy}</strong>
          </div>
          <div>
            <span>Sent at</span>
            <strong>{invitation.sentAt}</strong>
          </div>
          <div>
            <span>Expires at</span>
            <strong>{invitation.expiresAt}</strong>
          </div>
          {invitation.respondedAt ? (
            <div>
              <span>Response time</span>
              <strong>{invitation.respondedAt}</strong>
            </div>
          ) : null}
          <div className="club-invitation-detail-grid__message">
            <span>Personal message</span>
            <p>{invitation.message}</p>
          </div>
        </div>
        <footer>
          <button type="button" className="club-invitation-modal__dismiss" onClick={onClose}>
            Close
          </button>
          {invitation.status === 'pending' && canManage ? (
            <button type="button" className="club-invitation-modal__cancel" onClick={onCancel}>
              Cancel invitation
            </button>
          ) : null}
          {(invitation.status === 'declined' || invitation.status === 'cancelled' || invitation.status === 'expired') && canManage ? (
            <button type="button" className="club-invitation-modal__primary" onClick={onResend}>
              Resend invitation
            </button>
          ) : null}
        </footer>
      </section>
    </div>
  )
}

function InvitationForm({ clubName, form, setForm, submitting, onClose, onSubmit }) {
  const [studentSearch, setStudentSearch] = useState('')
  const [suggestions, setSuggestions] = useState([])
  const [searchLoading, setSearchLoading] = useState(false)
  const [showDropdown, setShowDropdown] = useState(false)
  const [selectedStudent, setSelectedStudent] = useState(null)

  useEffect(() => {
    let active = true
    const delay = setTimeout(async () => {
      setSearchLoading(true)
      try {
        const queryParam = studentSearch.trim() ? { q: studentSearch.trim() } : {}
        const res = await apiRequest(`/profile/search${toQueryString(queryParam)}`)
        if (active) {
          const list = (res.data || []).map((u) => ({
            value: u.value || u._id,
            name: u.name || u.full_name,
            email: u.email,
            avatarUrl: u.avatarUrl || u.avatar_url || '',
          }))
          setSuggestions(list)
        }
      } catch (err) {
        console.error('Failed to search students:', err)
        if (active) setSuggestions([])
      } finally {
        if (active) setSearchLoading(false)
      }
    }, studentSearch.trim() ? 250 : 0)

    return () => {
      active = false
      clearTimeout(delay)
    }
  }, [studentSearch])

  function handleSelectStudent(student) {
    setSelectedStudent(student)
    setForm((prev) => ({ ...prev, invitedUserId: student.value }))
    setStudentSearch('')
    setShowDropdown(false)
  }

  function handleClearStudent() {
    setSelectedStudent(null)
    setForm((prev) => ({ ...prev, invitedUserId: '' }))
    setStudentSearch('')
  }

  function handleFormSubmit(e) {
    e.preventDefault()
    let target = form.invitedUserId?.trim()
    if (!target && studentSearch.trim()) {
      target = studentSearch.trim()
      setForm((prev) => ({ ...prev, invitedUserId: target }))
    }
    if (!target) return
    onSubmit(e, target)
  }

  const isEmailInput = studentSearch.trim().includes('@')

  return (
    <div className="club-invitation-modal" role="dialog" aria-modal="true" aria-labelledby="invitation-form-title">
      <button
        type="button"
        className="club-invitation-modal__backdrop"
        aria-label="Close send invitation"
        onClick={onClose}
      />
      <form className="club-invitation-modal__panel club-invitation-form" onSubmit={handleFormSubmit}>
        <header>
          <div>
            <span>{clubName}</span>
            <h2 id="invitation-form-title">Send club invitation</h2>
          </div>
          <button type="button" className="club-invitation-modal__close" onClick={onClose}>
            ×
          </button>
        </header>

        <div style={{ textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '0.45rem', fontSize: '0.78rem', fontWeight: 900, color: '#6b5a4a', textTransform: 'uppercase' }}>
            Recipient Email / Student <span style={{ color: '#e11d48' }}>*</span>
          </label>

          {selectedStudent ? (
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.75rem 1rem',
              border: '1px solid #ffd2a9',
              borderRadius: '12px',
              background: '#fffbf5',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '50%',
                  background: 'linear-gradient(135deg, #ffbd7e, #e86b21)',
                  color: '#fff',
                  display: 'grid',
                  placeItems: 'center',
                  fontWeight: 900,
                  fontSize: '0.8rem',
                }}>
                  {selectedStudent.name?.charAt(0)?.toUpperCase() || 'S'}
                </div>
                <div>
                  <strong style={{ display: 'block', color: '#1f2430', fontSize: '0.9rem', fontWeight: 800 }}>
                    {selectedStudent.name}
                  </strong>
                  <span style={{ color: '#6b5a4a', fontSize: '0.78rem' }}>
                    {selectedStudent.email}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={handleClearStudent}
                style={{
                  border: 'none',
                  background: '#ffe4cc',
                  color: '#c65f00',
                  borderRadius: '8px',
                  padding: '0.35rem 0.65rem',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                }}
              >
                Change
              </button>
            </div>
          ) : (
            <div style={{ position: 'relative', width: '100%' }}>
              <input
                type="text"
                required={!form.invitedUserId}
                value={studentSearch}
                placeholder="Enter student email or search by name..."
                onChange={(e) => {
                  setStudentSearch(e.target.value)
                  setShowDropdown(true)
                }}
                onFocus={() => {
                  setShowDropdown(true)
                }}
                onBlur={() => setTimeout(() => setShowDropdown(false), 200)}
                autoComplete="off"
                style={{
                  width: '100%',
                  minHeight: '44px',
                  padding: '0 0.85rem',
                  border: '1px solid #eaded4',
                  borderRadius: '12px',
                  background: '#ffffff',
                  color: '#2f2a3a',
                  font: 'inherit',
                  fontSize: '0.86rem',
                  fontWeight: 650,
                  outline: 'none',
                  boxSizing: 'border-box',
                }}
              />

              {showDropdown && (suggestions.length > 0 || searchLoading || isEmailInput) && (
                <ul style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  zIndex: 200,
                  background: '#ffffff',
                  border: '1px solid #ffd2a9',
                  borderRadius: '12px',
                  margin: '0.35rem 0 0',
                  padding: '0.35rem 0',
                  listStyle: 'none',
                  boxShadow: '0 12px 30px rgba(92, 64, 51, 0.15)',
                  maxHeight: '220px',
                  overflowY: 'auto',
                }}>
                  {isEmailInput && !suggestions.some((s) => s.email?.toLowerCase() === studentSearch.trim().toLowerCase()) && (
                    <li style={{ padding: 0 }}>
                      <button
                        type="button"
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.65rem 1rem',
                          background: '#f0fdf4',
                          borderBottom: '1px solid #dcfce7',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.15rem',
                        }}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          handleSelectStudent({
                            value: studentSearch.trim(),
                            name: studentSearch.trim().split('@')[0],
                            email: studentSearch.trim(),
                          })
                        }}
                      >
                        <span style={{ fontWeight: 800, color: '#166534', fontSize: '0.88rem' }}>
                          ✉️ Invite email directly:
                        </span>
                        <span style={{ color: '#15803d', fontSize: '0.8rem', fontWeight: 600 }}>{studentSearch.trim()}</span>
                      </button>
                    </li>
                  )}
                  {searchLoading && (
                    <li style={{ padding: '0.65rem 1rem', color: '#64748b', fontSize: '0.82rem' }}>
                      Searching students...
                    </li>
                  )}
                  {!searchLoading && suggestions.map((opt) => (
                    <li key={String(opt.value)} style={{ padding: 0 }}>
                      <button
                        type="button"
                        style={{
                          width: '100%',
                          textAlign: 'left',
                          padding: '0.65rem 1rem',
                          background: 'transparent',
                          border: 'none',
                          cursor: 'pointer',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.15rem',
                          transition: 'background 0.15s ease',
                        }}
                        onMouseEnter={(e) => { e.currentTarget.style.background = '#fff4e5' }}
                        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent' }}
                        onMouseDown={(e) => {
                          e.preventDefault()
                          handleSelectStudent(opt)
                        }}
                      >
                        <span style={{ fontWeight: 800, color: '#1f2430', fontSize: '0.88rem' }}>{opt.name}</span>
                        <span style={{ color: '#6b5a4a', fontSize: '0.78rem' }}>{opt.email}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>

        <div style={{ textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '0.45rem', fontSize: '0.78rem', fontWeight: 900, color: '#6b5a4a', textTransform: 'uppercase' }}>
            Role to Assign <span style={{ color: '#e11d48' }}>*</span>
          </label>
          <select
            value={form.role || 'member'}
            onChange={(e) => setForm((prev) => ({ ...prev, role: e.target.value }))}
            style={{
              width: '100%',
              minHeight: '44px',
              padding: '0 0.85rem',
              border: '1px solid #eaded4',
              borderRadius: '12px',
              background: '#ffffff',
              color: '#2f2a3a',
              font: 'inherit',
              fontSize: '0.86rem',
              fontWeight: 650,
              outline: 'none',
              boxSizing: 'border-box',
              cursor: 'pointer',
            }}
          >
            <option value="member">Member</option>
            <option value="president">President (Chủ tịch)</option>
            <option value="secretary">Secretary (Thư ký)</option>
            <option value="treasurer">Treasurer (Thủ quỹ)</option>
            <option value="event_manager">Event Manager (Quản lý sự kiện)</option>
          </select>
        </div>

        <div style={{ textAlign: 'left' }}>
          <label style={{ display: 'block', marginBottom: '0.45rem', fontSize: '0.78rem', fontWeight: 900, color: '#6b5a4a', textTransform: 'uppercase' }}>
            Personal message <em style={{ fontStyle: 'normal', color: '#999', textTransform: 'none' }}>(optional)</em>
          </label>
          <textarea
            value={form.message}
            rows={4}
            placeholder="Write a friendly invitation message..."
            onChange={(event) =>
              setForm((value) => ({ ...value, message: event.target.value }))
            }
            style={{
              width: '100%',
              padding: '0.75rem 0.85rem',
              border: '1px solid #eaded4',
              borderRadius: '12px',
              background: '#ffffff',
              color: '#2f2a3a',
              font: 'inherit',
              fontSize: '0.86rem',
              fontWeight: 650,
              outline: 'none',
              resize: 'vertical',
              boxSizing: 'border-box',
            }}
          />
        </div>

        <footer>
          <button type="button" className="club-invitation-modal__dismiss" onClick={onClose}>
            Cancel
          </button>
          <button
            type="submit"
            className="club-invitation-modal__primary"
            disabled={submitting || (!form.invitedUserId && !studentSearch.trim())}
          >
            {submitting ? 'Sending...' : 'Send invitation'}
          </button>
        </footer>
      </form>
    </div>
  )
}

function ConfirmCancel({ recipient, submitting, onClose, onConfirm }) {
  return (
    <div className="club-invitation-modal" role="dialog" aria-modal="true" aria-labelledby="invitation-cancel-title">
      <button
        type="button"
        className="club-invitation-modal__backdrop"
        aria-label="Close cancellation"
        onClick={onClose}
      />
      <section className="club-invitation-modal__panel club-invitation-confirm">
        <span className="club-invitation-confirm__icon">!</span>
        <h2 id="invitation-cancel-title">Cancel this invitation?</h2>
        <p>{recipient} will no longer be able to accept this club invitation.</p>
        <footer>
          <button type="button" className="club-invitation-modal__dismiss" onClick={onClose}>
            Keep invitation
          </button>
          <button
            type="button"
            className="club-invitation-modal__cancel"
            onClick={onConfirm}
            disabled={submitting}
          >
            {submitting ? 'Cancelling...' : 'Yes, cancel'}
          </button>
        </footer>
      </section>
    </div>
  )
}

export default ClubInvitationsPage
