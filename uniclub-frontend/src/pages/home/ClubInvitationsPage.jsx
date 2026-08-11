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
import { mapClubFromApi, mapClubInvitationFromApi } from '../../api/clubMappers'
import { CLUB_INVITATION_STATUS_OPTIONS } from '../../data/clubInvitationsData'
import { useToast } from '../../components/common/notificationContext'
import '../../styles/club-invitations.css'

const EMPTY_FORM = { invitedUserId: '', message: '' }

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

  async function createInvitation(event) {
    event.preventDefault()
    if (!form.invitedUserId.trim() || submitting || !canManageInvitations) return

    setSubmitting(true)
    try {
      const defaultMessage = club?.name
        ? `We would love to invite you to join ${club.name}.`
        : ''
      await sendClubInvitation(clubId, {
        invited_user_id: form.invitedUserId.trim(),
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
                    <p>{invitation.recipientEmail}</p>
                    <span>{invitation.recipientMeta}</span>
                  </div>
                </div>
                <div className="club-invitation-card__message">
                  <span>Invitation message</span>
                  <p>{invitation.message}</p>
                </div>
                <div className="club-invitation-card__meta">
                  <span
                    className={`club-invitation-status club-invitation-status--${invitation.status}`}
                  >
                    {statusLabel(invitation.status)}
                  </span>
                  <small>Sent {invitation.sentAt}</small>
                </div>
                <div className="club-invitation-card__actions">
                  <button
                    type="button"
                    className="club-invitation-card__details"
                    onClick={() => handleViewDetails(invitation)}
                  >
                    View details
                  </button>
                  {invitation.status === 'pending' && canManageInvitations ? (
                    <button
                      type="button"
                      className="club-invitation-card__cancel"
                      onClick={() => setCancelTarget(invitation)}
                    >
                      Cancel
                    </button>
                  ) : null}
                  {(invitation.status === 'declined' || invitation.status === 'cancelled') &&
                  canManageInvitations ? (
                    <button
                      type="button"
                      className="club-invitation-card__resend"
                      onClick={() => handleResendInvitation(invitation)}
                    >
                      Resend
                    </button>
                  ) : null}
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
        aria-label="Close invitation detail"
        onClick={onClose}
      />
      <section className="club-invitation-modal__panel">
        <header>
          <div>
            <span>Invitation details</span>
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
          {(invitation.status === 'declined' || invitation.status === 'cancelled') && canManage ? (
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
  return (
    <div className="club-invitation-modal" role="dialog" aria-modal="true" aria-labelledby="invitation-form-title">
      <button
        type="button"
        className="club-invitation-modal__backdrop"
        aria-label="Close send invitation"
        onClick={onClose}
      />
      <form className="club-invitation-modal__panel club-invitation-form" onSubmit={onSubmit}>
        <header>
          <div>
            <span>{clubName}</span>
            <h2 id="invitation-form-title">Send club invitation</h2>
          </div>
          <button type="button" className="club-invitation-modal__close" onClick={onClose}>
            ×
          </button>
        </header>
        <label>
          Recipient user ID
          <input
            required
            value={form.invitedUserId}
            placeholder="Paste student user ObjectId"
            onChange={(event) =>
              setForm((value) => ({ ...value, invitedUserId: event.target.value }))
            }
          />
        </label>
        <label>
          Personal message <em>(optional)</em>
          <textarea
            value={form.message}
            rows="5"
            placeholder="Write a friendly invitation message..."
            onChange={(event) =>
              setForm((value) => ({ ...value, message: event.target.value }))
            }
          />
        </label>
        <footer>
          <button type="button" className="club-invitation-modal__dismiss" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="club-invitation-modal__primary" disabled={submitting}>
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
