import { useEffect, useState } from 'react'
import '../../styles/my-requests.css'
import {
  cancelJoinRequest,
  getMyJoinRequestDetail,
  getMyJoinRequests,
} from '../../api/studentClubMembership.api'
import {
  acceptInvitation,
  getReceivedInvitationDetail,
  getReceivedInvitations,
  rejectInvitation,
} from '../../api/memberInvitationManagement.api'
import { getMyClubs } from '../../api/memberClubMembership.api'
import { mapJoinRequestFromApi, mapReceivedInvitationFromApi } from '../../api/clubMappers'
import { MY_REQUEST_TABS, REQUEST_STATUS_OPTIONS } from '../../data/mockData'
import { useToast } from '../../components/common/notificationContext'

const INVITATION_STATUS_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Declined' },
  { value: 'cancelled', label: 'Cancelled' },
]

function MyRequestsPage() {
  const showToast = useToast()
  const [activeTab, setActiveTab] = useState('sent')
  const [requests, setRequests] = useState([])
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [detailTarget, setDetailTarget] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)
  const [submitting, setSubmitting] = useState(false)

  const statusOptions =
    activeTab === 'received' ? INVITATION_STATUS_OPTIONS : REQUEST_STATUS_OPTIONS

  useEffect(() => {
    let cancelled = false

    async function loadData() {
      setLoading(true)
      try {
        if (activeTab === 'sent') {
          const response = await getMyJoinRequests({
            status: statusFilter !== 'all' ? statusFilter : undefined,
          })
          if (!cancelled) {
            setRequests((response.data || []).map((item) => mapJoinRequestFromApi(item)))
          }
        } else {
          const myClubsResponse = await getMyClubs()
          const memberships = myClubsResponse.data || []
          const apiStatus = statusFilter !== 'all' ? statusFilter : undefined

          const results = await Promise.all(
            memberships.map(async (membership) => {
              const clubId = membership.club_id?._id || membership.club_id
              if (!clubId) return []
              try {
                const response = await getReceivedInvitations(clubId, { status: apiStatus })
                return (response.data || []).map((item) => mapReceivedInvitationFromApi(item))
              } catch (error) {
                console.error(error)
                return []
              }
            }),
          )

          if (!cancelled) {
            setInvitations(results.flat())
          }
        }
      } catch (error) {
        console.error(error)
        if (!cancelled) {
          if (activeTab === 'sent') setRequests([])
          else setInvitations([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadData()
    return () => {
      cancelled = true
    }
  }, [statusFilter, activeTab])

  const selectedStatus =
    statusOptions.find((option) => option.value === statusFilter) || statusOptions[0]

  const tabCounts = {
    sent: requests.length,
    received: invitations.length,
  }

  async function handleConfirmCancel() {
    if (!cancelTarget) return
    try {
      await cancelJoinRequest(cancelTarget.id)
      setRequests((items) => items.filter((item) => item.id !== cancelTarget.id))
      setCancelTarget(null)
      showToast({
        type: 'success',
        title: 'Request cancelled',
        message: `Your request for ${cancelTarget.club} has been cancelled.`,
      })
    } catch (error) {
      console.error(error)
      showToast({
        type: 'error',
        title: 'Cancel failed',
        message: error.message || 'Could not cancel this request.',
      })
    }
  }

  async function handleViewRequestDetails(item) {
    try {
      const response = await getMyJoinRequestDetail(item.id)
      setDetailTarget({ kind: 'request', data: mapJoinRequestFromApi(response.data) })
    } catch (error) {
      console.error(error)
      setDetailTarget({ kind: 'request', data: item })
    }
  }

  async function handleViewInvitationDetails(item) {
    try {
      const response = await getReceivedInvitationDetail(item.clubId, item.id)
      setDetailTarget({ kind: 'invitation', data: mapReceivedInvitationFromApi(response.data) })
    } catch (error) {
      console.error(error)
      setDetailTarget({ kind: 'invitation', data: item })
    }
  }

  async function handleAcceptInvitation(item) {
    if (submitting || !item.clubId) return
    setSubmitting(true)
    try {
      await acceptInvitation(item.clubId, item.id)
      setInvitations((items) =>
        items.map((invitation) =>
          invitation.id === item.id
            ? { ...invitation, status: 'accepted', rawStatus: 'accepted' }
            : invitation,
        ),
      )
      setDetailTarget((current) =>
        current?.data?.id === item.id
          ? {
              kind: 'invitation',
              data: { ...current.data, status: 'accepted', rawStatus: 'accepted' },
            }
          : current,
      )
      showToast({
        type: 'success',
        title: 'Invitation accepted',
        message: `You accepted the invitation from ${item.club}.`,
      })
    } catch (error) {
      console.error(error)
      showToast({
        type: 'error',
        title: 'Accept failed',
        message: error.message || 'Could not accept this invitation.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleRejectInvitation(item) {
    if (submitting || !item.clubId) return
    setSubmitting(true)
    try {
      await rejectInvitation(item.clubId, item.id)
      setInvitations((items) =>
        items.map((invitation) =>
          invitation.id === item.id
            ? { ...invitation, status: 'declined', rawStatus: 'rejected' }
            : invitation,
        ),
      )
      setDetailTarget((current) =>
        current?.data?.id === item.id
          ? {
              kind: 'invitation',
              data: { ...current.data, status: 'declined', rawStatus: 'rejected' },
            }
          : current,
      )
      showToast({
        type: 'success',
        title: 'Invitation declined',
        message: `You declined the invitation from ${item.club}.`,
      })
    } catch (error) {
      console.error(error)
      showToast({
        type: 'error',
        title: 'Decline failed',
        message: error.message || 'Could not decline this invitation.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  function handleTabChange(tabId) {
    setActiveTab(tabId)
    setStatusFilter('all')
    setStatusMenuOpen(false)
    setDetailTarget(null)
    setCancelTarget(null)
  }

  return (
    <main className="my-requests-page">
      <section className="my-requests-hero">
        <h1>My Requests & Invitations</h1>
        <p>Switch tabs to view join requests you sent or invitations received from clubs.</p>

        <div className="my-requests-toolbar">
          <div className="my-requests-tabs" aria-label="Request type">
            {MY_REQUEST_TABS.map((tab) => (
              <button
                key={tab.id}
                type="button"
                className={tab.id === activeTab ? 'is-active' : undefined}
                onClick={() => handleTabChange(tab.id)}
              >
                {tab.label} ({tabCounts[tab.id] ?? tab.count})
              </button>
            ))}
          </div>

          <div className="my-requests-filter">
            <span>Filter by status</span>
            <div className="my-requests-select">
              <button
                type="button"
                className="my-requests-select__button"
                aria-haspopup="listbox"
                aria-expanded={statusMenuOpen}
                onClick={() => setStatusMenuOpen((value) => !value)}
              >
                <span>{selectedStatus.label}</span>
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

              {statusMenuOpen ? (
                <>
                  <button
                    type="button"
                    className="my-requests-select__backdrop"
                    aria-label="Close status filter"
                    onClick={() => setStatusMenuOpen(false)}
                  />
                  <ul className="my-requests-select__menu" role="listbox">
                    {statusOptions.map((option) => (
                      <li key={option.value} role="none">
                        <button
                          type="button"
                          role="option"
                          aria-selected={option.value === statusFilter}
                          className="my-requests-select__option"
                          onClick={() => {
                            setStatusFilter(option.value)
                            setStatusMenuOpen(false)
                          }}
                        >
                          {option.label}
                        </button>
                      </li>
                    ))}
                  </ul>
                </>
              ) : null}
            </div>
          </div>
        </div>
      </section>

      <div className="my-requests-divider" aria-hidden="true" />

      {activeTab === 'sent' ? (
        <section className="my-requests-grid" aria-label="Sent requests">
          {loading ? <p>Loading requests...</p> : null}
          {!loading
            ? requests.map((item) => (
                <article key={item.id} className="my-request-card">
                  <div className="my-request-card__header">
                    <div>
                      <h2>{item.club}</h2>
                      <span className="my-request-card__category">{item.category}</span>
                    </div>
                    <span className="my-request-card__status">{item.status}</span>
                  </div>

                  <dl className="my-request-card__meta">
                    <div>
                      <dt>Sent Date</dt>
                      <dd>{item.sentDate}</dd>
                    </div>
                  </dl>

                  <div className="my-request-card__actions">
                    {item.status === 'pending' ? (
                      <button
                        type="button"
                        className="my-request-card__cancel"
                        onClick={() => setCancelTarget(item)}
                      >
                        Cancel Request
                      </button>
                    ) : null}
                    <button
                      type="button"
                      className="my-request-card__details"
                      onClick={() => handleViewRequestDetails(item)}
                    >
                      View Details
                    </button>
                  </div>
                </article>
              ))
            : null}
          {!loading && !requests.length ? <p>No join requests found.</p> : null}
        </section>
      ) : (
        <section className="my-requests-grid" aria-label="Received invitations">
          {loading ? <p>Loading invitations...</p> : null}
          {!loading
            ? invitations.map((item) => (
                <article key={`${item.clubId}-${item.id}`} className="my-request-card">
                  <div className="my-request-card__header">
                    <div>
                      <h2>{item.club}</h2>
                      <span className="my-request-card__category">{item.category}</span>
                    </div>
                    <span className="my-request-card__status">{item.status}</span>
                  </div>

                  <dl className="my-request-card__meta">
                    <div>
                      <dt>Sent Date</dt>
                      <dd>{item.sentDate}</dd>
                    </div>
                    <div>
                      <dt>Invited Role</dt>
                      <dd>{item.role}</dd>
                    </div>
                  </dl>

                  <div className="my-request-card__actions">
                    {item.status === 'pending' ? (
                      <>
                        <button
                          type="button"
                          className="my-request-card__details"
                          disabled={submitting}
                          onClick={() => handleAcceptInvitation(item)}
                        >
                          Accept
                        </button>
                        <button
                          type="button"
                          className="my-request-card__cancel"
                          disabled={submitting}
                          onClick={() => handleRejectInvitation(item)}
                        >
                          Decline
                        </button>
                      </>
                    ) : null}
                    <button
                      type="button"
                      className="my-request-card__details"
                      onClick={() => handleViewInvitationDetails(item)}
                    >
                      View Details
                    </button>
                  </div>
                </article>
              ))
            : null}
          {!loading && !invitations.length ? <p>No invitations found.</p> : null}
        </section>
      )}

      {cancelTarget ? (
        <div className="request-cancel-modal" role="dialog" aria-modal="true" aria-labelledby="request-cancel-title">
          <button
            type="button"
            className="request-cancel-modal__backdrop"
            aria-label="Close confirmation"
            onClick={() => setCancelTarget(null)}
          />
          <section className="request-cancel-modal__panel">
            <h2 id="request-cancel-title">Confirm Request Cancellation</h2>
            <p>Are you sure you want to cancel your request for {cancelTarget.club}?</p>
            <div className="request-cancel-modal__actions">
              <button type="button" className="request-cancel-modal__confirm" onClick={handleConfirmCancel}>
                Confirm
              </button>
              <button
                type="button"
                className="request-cancel-modal__dismiss"
                onClick={() => setCancelTarget(null)}
              >
                Cancel
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {detailTarget?.kind === 'request' ? (
        <div className="request-detail-modal" role="dialog" aria-modal="true" aria-labelledby="request-detail-title">
          <button
            type="button"
            className="request-detail-modal__backdrop"
            aria-label="Close request details"
            onClick={() => setDetailTarget(null)}
          />
          <section className="request-detail-modal__panel">
            <div className="request-detail-modal__header">
              <h2 id="request-detail-title">Request Details</h2>
              <button type="button" onClick={() => setDetailTarget(null)}>
                Close
              </button>
            </div>

            <div className="request-detail-modal__grid">
              <div className="request-detail-modal__item">
                <span>Request ID</span>
                <strong>{detailTarget.data.requestId}</strong>
              </div>
              <div className="request-detail-modal__item">
                <span>Type</span>
                <strong>{detailTarget.data.type}</strong>
              </div>
              <div className="request-detail-modal__item">
                <span>Status</span>
                <strong className="request-detail-modal__status">{detailTarget.data.status}</strong>
              </div>
              <div className="request-detail-modal__item">
                <span>Club</span>
                <strong>{detailTarget.data.club}</strong>
              </div>
              <div className="request-detail-modal__item">
                <span>Content</span>
                <strong>{detailTarget.data.content}</strong>
              </div>
              <div className="request-detail-modal__item">
                <span>Responder</span>
                <strong>{detailTarget.data.responder}</strong>
              </div>
              <div className="request-detail-modal__item">
                <span>Sender</span>
                <strong>{detailTarget.data.sender}</strong>
              </div>
              <div className="request-detail-modal__item">
                <span>Response Time</span>
                <strong>{detailTarget.data.responseTime}</strong>
              </div>
              <div className="request-detail-modal__item">
                <span>Sent Date</span>
                <strong>
                  {detailTarget.data.sentTime} {detailTarget.data.sentDate}
                </strong>
              </div>
            </div>
          </section>
        </div>
      ) : null}

      {detailTarget?.kind === 'invitation' ? (
        <div className="request-detail-modal" role="dialog" aria-modal="true" aria-labelledby="invitation-detail-title">
          <button
            type="button"
            className="request-detail-modal__backdrop"
            aria-label="Close invitation details"
            onClick={() => setDetailTarget(null)}
          />
          <section className="request-detail-modal__panel">
            <div className="request-detail-modal__header">
              <h2 id="invitation-detail-title">Invitation Details</h2>
              <button type="button" onClick={() => setDetailTarget(null)}>
                Close
              </button>
            </div>

            <div className="request-detail-modal__grid">
              <div className="request-detail-modal__item">
                <span>Invitation ID</span>
                <strong>{detailTarget.data.invitationId}</strong>
              </div>
              <div className="request-detail-modal__item">
                <span>Type</span>
                <strong>{detailTarget.data.type}</strong>
              </div>
              <div className="request-detail-modal__item">
                <span>Status</span>
                <strong className="request-detail-modal__status">{detailTarget.data.status}</strong>
              </div>
              <div className="request-detail-modal__item">
                <span>Club</span>
                <strong>{detailTarget.data.club}</strong>
              </div>
              <div className="request-detail-modal__item">
                <span>Message</span>
                <strong>{detailTarget.data.content}</strong>
              </div>
              <div className="request-detail-modal__item">
                <span>Invited Role</span>
                <strong>{detailTarget.data.role}</strong>
              </div>
              <div className="request-detail-modal__item">
                <span>Sent by</span>
                <strong>{detailTarget.data.sender}</strong>
              </div>
              <div className="request-detail-modal__item">
                <span>Response Time</span>
                <strong>{detailTarget.data.responseTime}</strong>
              </div>
              <div className="request-detail-modal__item">
                <span>Sent Date</span>
                <strong>{detailTarget.data.sentDate}</strong>
              </div>
            </div>

            {detailTarget.data.status === 'pending' ? (
              <div className="request-cancel-modal__actions" style={{ marginTop: '1rem' }}>
                <button
                  type="button"
                  className="request-cancel-modal__confirm"
                  disabled={submitting}
                  onClick={() => handleAcceptInvitation(detailTarget.data)}
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="request-cancel-modal__dismiss"
                  disabled={submitting}
                  onClick={() => handleRejectInvitation(detailTarget.data)}
                >
                  Decline
                </button>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </main>
  )
}

export default MyRequestsPage
