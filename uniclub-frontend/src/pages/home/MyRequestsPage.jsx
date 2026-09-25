import { useEffect, useState, useMemo } from 'react'
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
import { mapMemberInvitationFromApi, mapJoinRequestFromApi, formatStatusLabel } from '../../api/clubMappers'
import { MY_REQUEST_TABS, REQUEST_STATUS_OPTIONS } from '../../data/mockData'
import { useToast } from '../../components/common/notificationContext'
import Pagination from '../../components/common/Pagination'

const REQUESTS_PER_PAGE = 6

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
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [activeTab, statusFilter])

  useEffect(() => {
    let cancelled = false

    async function loadItems() {
      setLoading(true)
      try {
        const params = {}
        if (statusFilter !== 'all') {
          // If filtering by 'approved', invitations on BE use 'accepted'
          params.status = activeTab === 'received' && statusFilter === 'approved'
            ? 'accepted'
            : statusFilter
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
  const rawItems = activeTab === 'received' ? invitations : requests
  const visibleItems = statusFilter === 'all'
    ? rawItems
    : rawItems.filter((item) => {
        const itemStatus = (item.status || '').toLowerCase()
        if (statusFilter === 'approved') {
          return itemStatus === 'approved' || itemStatus === 'accepted'
        }
        return itemStatus === statusFilter.toLowerCase()
      })
  const tabCounts = {
    sent: requests.length,
    received: invitations.length,
  }

  const totalPages = Math.max(1, Math.ceil(visibleItems.length / REQUESTS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * REQUESTS_PER_PAGE
    return visibleItems.slice(startIndex, startIndex + REQUESTS_PER_PAGE)
  }, [visibleItems, currentPage])

  async function handleConfirmCancel() {
    if (!cancelTarget) return
    try {
      await cancelJoinRequest(cancelTarget.id)
      setRequests((items) => items.filter((item) => item.id !== cancelTarget.id))
      setCancelTarget(null)
      showToast({
        type: 'success',
        title: 'Request Cancelled',
        message: `Your join request for ${cancelTarget.club} has been successfully cancelled.`,
      })
    } catch (error) {
      console.error(error)
      showToast({
        type: 'error',
        title: 'Cancellation Failed',
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
                responseTime: new Date().toLocaleDateString('en-GB'),
              }
            : item,
        ),
      )
      setDetailTarget((prev) =>
        prev && prev.id === inviteActionTarget.item.id
          ? {
              ...prev,
              status: inviteActionTarget.action === 'accept' ? 'accepted' : 'rejected',
              responseTime: new Date().toLocaleDateString('en-GB'),
            }
          : prev,
      )
      setInviteActionTarget(null)
      showToast({
        type: 'success',
        title: inviteActionTarget.action === 'accept' ? 'Invitation Accepted' : 'Invitation Declined',
        message: `Invitation from ${inviteActionTarget.item.club} has been ${inviteActionTarget.action === 'accept' ? 'accepted' : 'declined'}.`,
      })
    } catch (error) {
      console.error(error)
      showToast({
        type: 'error',
        title: 'Action Failed',
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
        <p>Track your submitted club applications or respond to invitations received from clubs.</p>

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
          ? paginatedItems.map((item) => (
          <article key={item.id} className="my-request-card">
            <div className="my-request-card__header">
              <div>
                <h2>{item.club}</h2>
                <div style={{ display: 'flex', gap: '6px', alignItems: 'center', flexWrap: 'wrap', marginTop: '4px' }}>
                  <span className="my-request-card__category">{item.category}</span>
                  {item.isCreationInvite ? (
                    <span style={{ fontSize: '0.72rem', background: '#dbeafe', color: '#1d4ed8', padding: '2px 8px', borderRadius: '4px', fontWeight: 600 }}>
                      Founding Member
                    </span>
                  ) : null}
                </div>
              </div>
              <span className="my-request-card__status">{formatStatusLabel(item.status)}</span>
            </div>

            {item.content ? (
              <p style={{ fontSize: '0.86rem', color: '#475569', margin: '0.5rem 0 0.75rem 0', lineHeight: 1.4 }}>
                {item.content}
              </p>
            ) : null}

            <dl className="my-request-card__meta">
              <div>
                <dt>{activeTab === 'received' ? 'Received Date' : 'Sent Date'}</dt>
                <dd>{item.sentDate}</dd>
              </div>
              {activeTab === 'received' && item.sender && item.sender !== '-' ? (
                <div>
                  <dt>Invited By</dt>
                  <dd>{item.sender}</dd>
                </div>
              ) : null}
              {activeTab === 'received' && !item.isCreationInvite ? (
                <div>
                  <dt>Role</dt>
                  <dd>{item.role || 'Member'}</dd>
                </div>
              ) : null}
              {activeTab === 'received' && item.expiresAt ? (
                <div>
                  <dt>Expires At</dt>
                  <dd style={{ color: item.status === 'expired' ? '#dc2626' : 'inherit', fontWeight: item.status === 'expired' ? 700 : 'normal' }}>
                    {item.expiresAt}
                  </dd>
                </div>
              ) : null}
            </dl>

            <div className="my-request-card__actions">
              {activeTab === 'sent' && isPendingStatus(item.status) ? (
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

      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        ariaLabel="Requests and invitations pagination"
      />

      {detailTarget ? (
        <div className="request-detail-modal" role="dialog" aria-modal="true" aria-labelledby="request-detail-title">
          <button
            type="button"
            className="request-detail-modal__backdrop"
            aria-label="Close details"
            onClick={closeDetailModal}
          />
          <section className="request-detail-modal__panel">
            <div className="request-detail-modal__header">
              <h2 id="request-detail-title">
                {detailTarget.type === 'invitation' || activeTab === 'received'
                  ? 'Invitation Details'
                  : 'Request Details'}
              </h2>
              <button type="button" onClick={closeDetailModal}>Close</button>
            </div>

            <div className="request-detail-modal__grid">
              <div className="request-detail-modal__item">
                <span>Request Type</span>
                <strong>{detailTarget.type}</strong>
              </div>
              <div className="request-detail-modal__item">
                <span>Status</span>
                <strong className="request-detail-modal__status">{formatStatusLabel(detailTarget.status)}</strong>
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
                <span>{activeTab === 'received' ? 'Message' : 'Content'}</span>
                <strong>{detailTarget.content}</strong>
              </div>
              <div className="request-detail-modal__item">
                <span>{activeTab === 'received' ? 'Invited By' : 'Reviewed By'}</span>
                <strong>
                  {detailTarget.responder && detailTarget.responder !== '-'
                    ? detailTarget.responder
                    : (detailTarget.sender && detailTarget.sender !== '-' ? detailTarget.sender : `${detailTarget.club || 'Club'} Board`)}
                </strong>
              </div>
              {detailTarget.responseTime && detailTarget.responseTime !== '-' ? (
                <div className="request-detail-modal__item">
                  <span>Response Time</span>
                  <strong>{detailTarget.responseTime}</strong>
                </div>
              ) : null}
              <div className="request-detail-modal__item">
                <span>{activeTab === 'received' ? 'Received Date' : 'Sent Date'}</span>
                <strong>{detailTarget.sentTime} {detailTarget.sentDate}</strong>
              </div>
              {detailTarget.expiresAt ? (
                <div className="request-detail-modal__item">
                  <span>Expires At (Hạn chót)</span>
                  <strong style={{ color: detailTarget.status === 'expired' ? '#dc2626' : 'inherit' }}>
                    {detailTarget.expiresAt} {detailTarget.status === 'expired' ? '(Expired)' : ''}
                  </strong>
                </div>
              ) : null}
              {detailTarget.reviewNote ? (
                <div className="request-detail-modal__item" style={{ gridColumn: '1 / -1', background: '#fff1f2', padding: '0.75rem 1rem', borderRadius: '12px', border: '1px solid #fecdd3' }}>
                  <span style={{ color: '#be123c', fontWeight: 900 }}>Lý do từ chối / Phản hồi (Reason / Note)</span>
                  <strong style={{ color: '#9f1239', fontSize: '0.88rem' }}>{detailTarget.reviewNote}</strong>
                </div>
              ) : null}
            </div>

            {activeTab === 'received' && isPendingStatus(detailTarget.status) ? (
              <div className="request-detail-modal__actions">
                <button
                  type="button"
                  className="request-detail-modal__accept"
                  onClick={() => setInviteActionTarget({ action: 'accept', item: detailTarget })}
                >
                  Accept
                </button>
                <button
                  type="button"
                  className="request-detail-modal__cancel"
                  onClick={() => setInviteActionTarget({ action: 'reject', item: detailTarget })}
                >
                  Decline
                </button>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}

      {cancelTarget ? (
        <div className="request-cancel-modal" role="dialog" aria-modal="true" aria-labelledby="request-cancel-title">
          <button
            type="button"
            className="request-cancel-modal__backdrop"
            aria-label="Close confirmation"
            onClick={closeCancelModal}
          />
          <section className="request-cancel-modal__panel">
            <h2 id="request-cancel-title">Cancel Request Confirmation</h2>
            <p>Are you sure you want to cancel your join request for {cancelTarget.club}?</p>
            <div className="request-cancel-modal__actions">
              <button type="button" className="request-cancel-modal__confirm" onClick={handleConfirmCancel}>
                Confirm Cancel
              </button>
              <button type="button" className="request-cancel-modal__dismiss" onClick={closeCancelModal}>
                Close
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
              {inviteActionTarget.action === 'accept' ? 'Accept Invitation' : 'Decline Invitation'}
            </h2>
            <p>
              Are you sure you want to {inviteActionTarget.action === 'accept' ? 'accept' : 'decline'} the invitation from {inviteActionTarget.item.club}?
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
    </main>
  )
}

export default MyRequestsPage
