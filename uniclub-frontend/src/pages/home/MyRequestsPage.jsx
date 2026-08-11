import { useEffect, useState } from 'react'
import '../../styles/my-requests.css'
import {
  cancelJoinRequest,
  getMyJoinRequestDetail,
  getMyJoinRequests,
} from '../../api/studentClubMembership.api'
import {
  acceptClubInvitation,
  getReceivedInvitationDetail,
  getReceivedInvitations,
  rejectClubInvitation,
} from '../../api/clubInvitation.api'
import { mapMemberInvitationFromApi, mapJoinRequestFromApi } from '../../api/clubMappers'
import { MY_REQUEST_TABS, REQUEST_STATUS_OPTIONS } from '../../data/mockData'
import { useToast } from '../../components/common/notificationContext'

function MyRequestsPage() {
  const showToast = useToast()
  const [requests, setRequests] = useState([])
  const [invitations, setInvitations] = useState([])
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [detailTarget, setDetailTarget] = useState(null)
  const [inviteActionTarget, setInviteActionTarget] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('sent')

  useEffect(() => {
    let cancelled = false

    async function loadItems() {
      setLoading(true)
      try {
        const params = {
          status: statusFilter !== 'all' ? statusFilter : undefined,
        }
        const response = activeTab === 'received'
          ? await getReceivedInvitations(params)
          : await getMyJoinRequests(params)

        if (!cancelled) {
          const rows = Array.isArray(response.data)
            ? response.data
            : response.data?.items || response.data?.invitations || response.data?.requests || []

          if (activeTab === 'received') {
            setInvitations(rows.map((item) => mapMemberInvitationFromApi(item)))
          } else {
            setRequests(rows.map((item) => mapJoinRequestFromApi(item)))
          }
        }
      } catch (error) {
        console.error(error)
        if (!cancelled) {
          if (activeTab === 'received') setInvitations([])
          else setRequests([])
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadItems()
    return () => {
      cancelled = true
    }
  }, [activeTab, statusFilter])

  const selectedStatus =
    REQUEST_STATUS_OPTIONS.find((option) => option.value === statusFilter) || REQUEST_STATUS_OPTIONS[0]
  const visibleItems = activeTab === 'received' ? invitations : requests
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
      // Hiển thị thông báo cho chức năng hủy yêu cầu tham gia câu lạc bộ.
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

  async function handleViewDetails(item) {
    try {
      const response = activeTab === 'received'
        ? await getReceivedInvitationDetail(item.id)
        : await getMyJoinRequestDetail(item.id)
      setDetailTarget(
        activeTab === 'received'
          ? mapMemberInvitationFromApi(response.data)
          : mapJoinRequestFromApi(response.data),
      )
    } catch (error) {
      console.error(error)
      setDetailTarget(item)
    }
  }

  async function handleInvitationAction() {
    if (!inviteActionTarget) return

    setActionLoading(true)
    try {
      if (inviteActionTarget.action === 'accept') {
        await acceptClubInvitation(inviteActionTarget.item.id)
      } else {
        await rejectClubInvitation(inviteActionTarget.item.id)
      }

      setInvitations((items) =>
        items.map((item) =>
          item.id === inviteActionTarget.item.id
            ? {
                ...item,
                status: inviteActionTarget.action === 'accept' ? 'accepted' : 'rejected',
                responseTime: new Date().toLocaleDateString('vi-VN'),
              }
            : item,
        ),
      )
      setInviteActionTarget(null)
      showToast({
        type: 'success',
        title: inviteActionTarget.action === 'accept' ? 'Invitation accepted' : 'Invitation rejected',
        message: `${inviteActionTarget.item.club} invitation has been ${inviteActionTarget.action === 'accept' ? 'accepted' : 'rejected'}.`,
      })
    } catch (error) {
      console.error(error)
      showToast({
        type: 'error',
        title: 'Action failed',
        message: error.message || 'Could not update this invitation.',
      })
    } finally {
      setActionLoading(false)
    }
  }

  function closeCancelModal() {
    setCancelTarget(null)
  }

  function closeDetailModal() {
    setDetailTarget(null)
  }

  function handleChangeTab(tabId) {
    setActiveTab(tabId)
    setStatusFilter('all')
    setDetailTarget(null)
    setCancelTarget(null)
    setInviteActionTarget(null)
  }

  function isPendingStatus(status) {
    return String(status || '').toLowerCase() === 'pending'
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
                onClick={() => handleChangeTab(tab.id)}
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
                    {REQUEST_STATUS_OPTIONS.map((option) => (
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

      <section
        className="my-requests-grid"
        aria-label={activeTab === 'received' ? 'Received invitations' : 'Sent requests'}
      >
        {loading ? <p>{activeTab === 'received' ? 'Loading invitations...' : 'Loading requests...'}</p> : null}
        {!loading
          ? visibleItems.map((item) => (
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
                <dt>{activeTab === 'received' ? 'Received Date' : 'Sent Date'}</dt>
                <dd>{item.sentDate}</dd>
              </div>
              {activeTab === 'received' ? (
                <div>
                  <dt>Role</dt>
                  <dd>{item.role || 'Member'}</dd>
                </div>
              ) : null}
            </dl>

            <div className="my-request-card__actions">
              {activeTab === 'received' && isPendingStatus(item.status) ? (
                <>
                  <button
                    type="button"
                    className="my-request-card__accept"
                    onClick={() => setInviteActionTarget({ action: 'accept', item })}
                  >
                    Accept
                  </button>
                  <button
                    type="button"
                    className="my-request-card__cancel"
                    onClick={() => setInviteActionTarget({ action: 'reject', item })}
                  >
                    Reject
                  </button>
                </>
              ) : activeTab === 'sent' && isPendingStatus(item.status) ? (
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
                onClick={() => handleViewDetails(item)}
              >
                View Details
              </button>
            </div>
          </article>
            ))
          : null}
        {!loading && visibleItems.length === 0 ? (
          <p>{activeTab === 'received' ? 'No invitations found.' : 'No requests found.'}</p>
        ) : null}
      </section>

      {cancelTarget ? (
        <div className="request-cancel-modal" role="dialog" aria-modal="true" aria-labelledby="request-cancel-title">
          <button
            type="button"
            className="request-cancel-modal__backdrop"
            aria-label="Close confirmation"
            onClick={closeCancelModal}
          />
          <section className="request-cancel-modal__panel">
            <h2 id="request-cancel-title">Confirm Request Cancellation</h2>
            <p>Are you sure you want to cancel your request for {cancelTarget.club}?</p>
            <div className="request-cancel-modal__actions">
              <button type="button" className="request-cancel-modal__confirm" onClick={handleConfirmCancel}>
                Confirm
              </button>
              <button type="button" className="request-cancel-modal__dismiss" onClick={closeCancelModal}>
                Cancel
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {inviteActionTarget ? (
        <div className="request-cancel-modal" role="dialog" aria-modal="true" aria-labelledby="invitation-action-title">
          <button
            type="button"
            className="request-cancel-modal__backdrop"
            aria-label="Close confirmation"
            onClick={() => setInviteActionTarget(null)}
          />
          <section className="request-cancel-modal__panel">
            <h2 id="invitation-action-title">
              {inviteActionTarget.action === 'accept' ? 'Accept Invitation' : 'Reject Invitation'}
            </h2>
            <p>
              Are you sure you want to {inviteActionTarget.action} the invitation from {inviteActionTarget.item.club}?
            </p>
            <div className="request-cancel-modal__actions">
              <button
                type="button"
                className={inviteActionTarget.action === 'accept' ? 'request-cancel-modal__accept' : 'request-cancel-modal__confirm'}
                onClick={handleInvitationAction}
                disabled={actionLoading}
              >
                {actionLoading ? 'Processing...' : 'Confirm'}
              </button>
              <button
                type="button"
                className="request-cancel-modal__dismiss"
                onClick={() => setInviteActionTarget(null)}
                disabled={actionLoading}
              >
                Cancel
              </button>
            </div>
          </section>
        </div>
      ) : null}

      {detailTarget ? (
        <div className="request-detail-modal" role="dialog" aria-modal="true" aria-labelledby="request-detail-title">
          <button
            type="button"
            className="request-detail-modal__backdrop"
            aria-label="Close request details"
            onClick={closeDetailModal}
          />
          <section className="request-detail-modal__panel">
            <div className="request-detail-modal__header">
              <h2 id="request-detail-title">Request Details</h2>
              <button type="button" onClick={closeDetailModal}>Close</button>
            </div>

            <div className="request-detail-modal__grid">
              <div className="request-detail-modal__item">
                <span>Type</span>
                <strong>{detailTarget.type}</strong>
              </div>
              <div className="request-detail-modal__item">
                <span>Status</span>
                <strong className="request-detail-modal__status">{detailTarget.status}</strong>
              </div>
              <div className="request-detail-modal__item">
                <span>Club</span>
                <strong>{detailTarget.club}</strong>
              </div>
              {detailTarget.role ? (
                <div className="request-detail-modal__item">
                  <span>Role</span>
                  <strong>{detailTarget.role}</strong>
                </div>
              ) : null}
              <div className="request-detail-modal__item">
                <span>Content</span>
                <strong>{detailTarget.content}</strong>
              </div>
              <div className="request-detail-modal__item">
                <span>Reviewer</span>
                <strong>
                  {detailTarget.responder && detailTarget.responder !== '-'
                    ? detailTarget.responder
                    : `Ban chủ nhiệm ${detailTarget.club || ''}`}
                </strong>
              </div>
              {detailTarget.responseTime && detailTarget.responseTime !== '-' ? (
                <div className="request-detail-modal__item">
                  <span>Response Time</span>
                  <strong>{detailTarget.responseTime}</strong>
                </div>
              ) : null}
              <div className="request-detail-modal__item">
                <span>Sent Date</span>
                <strong>{detailTarget.sentTime} {detailTarget.sentDate}</strong>
              </div>
            </div>
          </section>
        </div>
      ) : null}
    </main>
  )
}

export default MyRequestsPage
