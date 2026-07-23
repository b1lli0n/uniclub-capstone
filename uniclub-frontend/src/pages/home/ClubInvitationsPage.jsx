import { useMemo, useState } from 'react'
import { ALL_CLUBS } from '../../data/mockData'
import {
  CLUB_INVITATION_CANDIDATES,
  CLUB_INVITATIONS,
  CLUB_INVITATION_STATUS_OPTIONS,
} from '../../data/clubInvitationsMockData'
import '../../styles/club-invitations.css'

const FALLBACK_CLUB = ALL_CLUBS[0]
const EMPTY_FORM = { recipientId: '', message: '' }

function statusLabel(status) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function ClubInvitationsPage({ clubId }) {
  const club = ALL_CLUBS.find((item) => item.id === clubId) || FALLBACK_CLUB
  const [invitations, setInvitations] = useState(() =>
    CLUB_INVITATIONS.filter((invitation) => invitation.clubId === club.id)
  )
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedInvitation, setSelectedInvitation] = useState(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [toast, setToast] = useState(null)

  const visibleInvitations = useMemo(() => {
    const query = search.trim().toLowerCase()
    return invitations.filter((invitation) => {
      const matchesStatus = statusFilter === 'all' || invitation.status === statusFilter
      const matchesSearch = !query || [invitation.recipientName, invitation.recipientEmail]
        .some((value) => value.toLowerCase().includes(query))
      return matchesStatus && matchesSearch
    })
  }, [invitations, search, statusFilter])

  const pendingCount = invitations.filter((item) => item.status === 'pending').length

  function notify(message) {
    setToast(message)
    window.setTimeout(() => setToast(null), 3000)
  }

  function openCreateModal() {
    setForm(EMPTY_FORM)
    setShowCreateModal(true)
  }

  function createInvitation(event) {
    event.preventDefault()
    const candidate = CLUB_INVITATION_CANDIDATES.find((item) => item.id === form.recipientId)
    if (!candidate) return

    const invitation = {
      id: `inv-${Date.now()}`,
      clubId: club.id,
      recipientId: candidate.id,
      recipientName: candidate.name,
      recipientEmail: candidate.email,
      recipientMeta: `${candidate.major} · ${candidate.year}`,
      initials: candidate.initials,
      status: 'pending',
      message: form.message.trim() || `We would love to invite you to join ${club.name}.`,
      sentAt: 'Just now',
      expiresAt: '7 days from now',
      sentBy: 'Pham Huong D',
    }
    setInvitations((items) => [invitation, ...items])
    setShowCreateModal(false)
    notify(`Invitation sent to ${candidate.name}.`)
  }

  function cancelInvitation() {
    if (!cancelTarget) return
    setInvitations((items) => items.map((item) =>
      item.id === cancelTarget.id ? { ...item, status: 'cancelled' } : item
    ))
    setSelectedInvitation((item) => item?.id === cancelTarget.id ? { ...item, status: 'cancelled' } : item)
    setCancelTarget(null)
    notify(`Invitation to ${cancelTarget.recipientName} was cancelled.`)
  }

  function resendInvitation(invitation) {
    setInvitations((items) => items.map((item) =>
      item.id === invitation.id
        ? { ...item, status: 'pending', sentAt: 'Just now', expiresAt: '7 days from now', respondedAt: undefined }
        : item
    ))
    setSelectedInvitation((item) => item?.id === invitation.id
      ? { ...item, status: 'pending', sentAt: 'Just now', expiresAt: '7 days from now', respondedAt: undefined }
      : item)
    notify(`Invitation resent to ${invitation.recipientName}.`)
  }

  return (
    <main className="club-invitations-page">
      <section className="club-invitations-hero">
        <div>
          <span className="club-invitations-hero__eyebrow">{club.name}</span>
          <h1>Invitation Management</h1>
          <p>Invite promising students and keep track of every club invitation in one place.</p>
        </div>
        <div className="club-invitations-hero__summary">
          <span>Awaiting response</span>
          <strong>{pendingCount}</strong>
          <button type="button" onClick={openCreateModal}>+ Send invitation</button>
        </div>
      </section>

      <section className="club-invitations-toolbar" aria-label="Invitation controls">
        <label className="club-invitations-search">
          <svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="11" cy="11" r="6" /><path d="m16 16 4 4" /></svg>
          <input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search recipient name or email..." />
        </label>
        <div className="club-invitations-filters" role="tablist" aria-label="Filter invitation status">
          {CLUB_INVITATION_STATUS_OPTIONS.map((option) => (
            <button key={option.value} type="button" role="tab" aria-selected={statusFilter === option.value}
              className={statusFilter === option.value ? 'is-active' : undefined} onClick={() => setStatusFilter(option.value)}>
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="club-invitations-list" aria-label="Club invitations">
        {visibleInvitations.map((invitation) => (
          <article key={invitation.id} className="club-invitation-card">
            <div className="club-invitation-card__person">
              <div className="club-invitation-card__avatar" aria-hidden="true">{invitation.initials}</div>
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
              <span className={`club-invitation-status club-invitation-status--${invitation.status}`}>{statusLabel(invitation.status)}</span>
              <small>Sent {invitation.sentAt}</small>
            </div>
            <div className="club-invitation-card__actions">
              <button type="button" className="club-invitation-card__details" onClick={() => setSelectedInvitation(invitation)}>View details</button>
              {invitation.status === 'pending' ? <button type="button" className="club-invitation-card__cancel" onClick={() => setCancelTarget(invitation)}>Cancel</button> : null}
              {invitation.status === 'declined' || invitation.status === 'cancelled' ? <button type="button" className="club-invitation-card__resend" onClick={() => resendInvitation(invitation)}>Resend</button> : null}
            </div>
          </article>
        ))}
        {!visibleInvitations.length ? <div className="club-invitations-empty"><strong>No invitations found</strong><span>Try another search or send a new invitation.</span></div> : null}
      </section>

      {selectedInvitation ? <InvitationDetail invitation={selectedInvitation} onClose={() => setSelectedInvitation(null)} onCancel={() => setCancelTarget(selectedInvitation)} onResend={() => resendInvitation(selectedInvitation)} /> : null}
      {showCreateModal ? <InvitationForm clubName={club.name} form={form} setForm={setForm} onClose={() => setShowCreateModal(false)} onSubmit={createInvitation} /> : null}
      {cancelTarget ? <ConfirmCancel recipient={cancelTarget.recipientName} onClose={() => setCancelTarget(null)} onConfirm={cancelInvitation} /> : null}
      {toast ? <div className="club-invitations-toast" role="status">{toast}</div> : null}
    </main>
  )
}

function InvitationDetail({ invitation, onClose, onCancel, onResend }) {
  return <div className="club-invitation-modal" role="dialog" aria-modal="true" aria-labelledby="invitation-detail-title">
    <button type="button" className="club-invitation-modal__backdrop" aria-label="Close invitation detail" onClick={onClose} />
    <section className="club-invitation-modal__panel">
      <header><div><span>Invitation details</span><h2 id="invitation-detail-title">{invitation.recipientName}</h2></div><button type="button" className="club-invitation-modal__close" onClick={onClose}>×</button></header>
      <div className="club-invitation-detail-grid">
        <div><span>Email</span><strong>{invitation.recipientEmail}</strong></div><div><span>Invitation ID</span><strong>{invitation.id}</strong></div>
        <div><span>Status</span><strong className={`club-invitation-status club-invitation-status--${invitation.status}`}>{statusLabel(invitation.status)}</strong></div><div><span>Sent by</span><strong>{invitation.sentBy}</strong></div>
        <div><span>Sent at</span><strong>{invitation.sentAt}</strong></div><div><span>Expires at</span><strong>{invitation.expiresAt}</strong></div>
        {invitation.respondedAt ? <div><span>Response time</span><strong>{invitation.respondedAt}</strong></div> : null}
        <div className="club-invitation-detail-grid__message"><span>Personal message</span><p>{invitation.message}</p></div>
      </div>
      <footer><button type="button" className="club-invitation-modal__dismiss" onClick={onClose}>Close</button>{invitation.status === 'pending' ? <button type="button" className="club-invitation-modal__cancel" onClick={onCancel}>Cancel invitation</button> : null}{invitation.status === 'declined' || invitation.status === 'cancelled' ? <button type="button" className="club-invitation-modal__primary" onClick={onResend}>Resend invitation</button> : null}</footer>
    </section>
  </div>
}

function InvitationForm({ clubName, form, setForm, onClose, onSubmit }) {
  return <div className="club-invitation-modal" role="dialog" aria-modal="true" aria-labelledby="invitation-form-title">
    <button type="button" className="club-invitation-modal__backdrop" aria-label="Close send invitation" onClick={onClose} />
    <form className="club-invitation-modal__panel club-invitation-form" onSubmit={onSubmit}>
      <header><div><span>{clubName}</span><h2 id="invitation-form-title">Send club invitation</h2></div><button type="button" className="club-invitation-modal__close" onClick={onClose}>×</button></header>
      <label>Recipient<select required value={form.recipientId} onChange={(event) => setForm((value) => ({ ...value, recipientId: event.target.value }))}><option value="">Select a student</option>{CLUB_INVITATION_CANDIDATES.map((candidate) => <option key={candidate.id} value={candidate.id}>{candidate.name} — {candidate.email}</option>)}</select></label>
      <label>Personal message <em>(optional)</em><textarea value={form.message} rows="5" placeholder="Write a friendly invitation message..." onChange={(event) => setForm((value) => ({ ...value, message: event.target.value }))} /></label>
      <footer><button type="button" className="club-invitation-modal__dismiss" onClick={onClose}>Cancel</button><button type="submit" className="club-invitation-modal__primary">Send invitation</button></footer>
    </form>
  </div>
}

function ConfirmCancel({ recipient, onClose, onConfirm }) {
  return <div className="club-invitation-modal" role="dialog" aria-modal="true" aria-labelledby="invitation-cancel-title">
    <button type="button" className="club-invitation-modal__backdrop" aria-label="Close cancellation" onClick={onClose} />
    <section className="club-invitation-modal__panel club-invitation-confirm"><span className="club-invitation-confirm__icon">!</span><h2 id="invitation-cancel-title">Cancel this invitation?</h2><p>{recipient} will no longer be able to accept this club invitation.</p><footer><button type="button" className="club-invitation-modal__dismiss" onClick={onClose}>Keep invitation</button><button type="button" className="club-invitation-modal__cancel" onClick={onConfirm}>Yes, cancel</button></footer></section>
  </div>
}

export default ClubInvitationsPage
