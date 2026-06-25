import { useEffect, useState } from 'react'
import '../../styles/my-requests.css'
import {
  cancelJoinRequest,
  getMyJoinRequestDetail,
  getMyJoinRequests,
} from '../../api/studentClubMembership.api'
import { mapJoinRequestFromApi } from '../../api/clubMappers'
import { MY_REQUEST_TABS, REQUEST_STATUS_OPTIONS } from '../../data/mockData'

function MyRequestsPage() {
  const [requests, setRequests] = useState([])
  const [loading, setLoading] = useState(true)
  const [cancelTarget, setCancelTarget] = useState(null)
  const [detailTarget, setDetailTarget] = useState(null)
  const [statusFilter, setStatusFilter] = useState('all')
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadRequests() {
      setLoading(true)
      try {
        const response = await getMyJoinRequests({
          status: statusFilter !== 'all' ? statusFilter : undefined,
        })
        if (!cancelled) {
          setRequests((response.data || []).map((item) => mapJoinRequestFromApi(item)))
        }
      } catch (error) {
        console.error(error)
        if (!cancelled) setRequests([])
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadRequests()
    return () => {
      cancelled = true
    }
  }, [statusFilter])

  const selectedStatus =
    REQUEST_STATUS_OPTIONS.find((option) => option.value === statusFilter) || REQUEST_STATUS_OPTIONS[0]
  const filteredRequests = requests

  async function handleConfirmCancel() {
    if (!cancelTarget) return
    try {
      await cancelJoinRequest(cancelTarget.id)
      setRequests((items) => items.filter((item) => item.id !== cancelTarget.id))
      setCancelTarget(null)
    } catch (error) {
      console.error(error)
      alert(error.message)
    }
  }

  async function handleViewDetails(item) {
    try {
      const response = await getMyJoinRequestDetail(item.id)
      setDetailTarget(mapJoinRequestFromApi(response.data))
    } catch (error) {
      console.error(error)
      setDetailTarget(item)
    }
  }

  function closeCancelModal() {
    setCancelTarget(null)
  }

  function closeDetailModal() {
    setDetailTarget(null)
  }

  return (
    <main className="my-requests-page">
      <section className="my-requests-hero">
        <h1>My Requests & Invitations</h1>
        <p>Switch tabs to view join requests you sent or invitations received from clubs.</p>

        <div className="my-requests-toolbar">
          <div className="my-requests-tabs" aria-label="Request type">
            {MY_REQUEST_TABS.map((tab) => (
              <button key={tab.id} type="button" className={tab.id === 'sent' ? 'is-active' : undefined}>
                {tab.label} ({tab.count})
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

      <section className="my-requests-grid" aria-label="Sent requests">
        {loading ? <p>Loading requests...</p> : null}
        {!loading
          ? filteredRequests.map((item) => (
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
              <button
                type="button"
                className="my-request-card__cancel"
                onClick={() => setCancelTarget(item)}
              >
                Cancel Request
              </button>
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
                <span>Request ID</span>
                <strong>{detailTarget.requestId}</strong>
              </div>
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
              <div className="request-detail-modal__item">
                <span>Content</span>
                <strong>{detailTarget.content}</strong>
              </div>
              <div className="request-detail-modal__item">
                <span>Responder</span>
                <strong>{detailTarget.responder}</strong>
              </div>
              <div className="request-detail-modal__item">
                <span>Sender</span>
                <strong>{detailTarget.sender}</strong>
              </div>
              <div className="request-detail-modal__item">
                <span>Response Time</span>
                <strong>{detailTarget.responseTime}</strong>
              </div>
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
