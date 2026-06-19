import { useMemo, useState } from 'react'
import {
  ALL_CLUBS,
  CLUB_JOIN_REQUESTS,
  CLUB_JOIN_REQUEST_STATUS_OPTIONS,
  MY_CLUB_MEMBERSHIPS,
} from '../../data/mockData'
import '../../styles/club-join-requests.css'

const CLUB_FALLBACK = ALL_CLUBS[0]

function getStatusLabel(status) {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

function getInitials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()
}

function ClubJoinRequestsPage({ clubId }) {
  const club = ALL_CLUBS.find((item) => item.id === clubId) || CLUB_FALLBACK
  const membership = MY_CLUB_MEMBERSHIPS.find((item) => item.clubId === club.id)
  const canApproveMembers = membership?.role?.toLowerCase() === 'leader'
  const [statusFilter, setStatusFilter] = useState('all')
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)
  const [detailRequest, setDetailRequest] = useState(null)
  const [requests, setRequests] = useState(() =>
    CLUB_JOIN_REQUESTS.filter((request) => request.clubId === club.id)
  )
  const selectedStatus =
    CLUB_JOIN_REQUEST_STATUS_OPTIONS.find((option) => option.value === statusFilter) ||
    CLUB_JOIN_REQUEST_STATUS_OPTIONS[0]

  const visibleRequests = useMemo(() => {
    if (statusFilter === 'all') return requests
    return requests.filter((request) => request.status === statusFilter)
  }, [requests, statusFilter])

  function updateRequestStatus(requestId, nextStatus) {
    // BE hook: call approve/reject API here, then refresh join request data.
    setRequests((items) =>
      items.map((item) =>
        item.id === requestId ? { ...item, status: nextStatus } : item
      )
    )
    setDetailRequest((request) =>
      request?.id === requestId ? { ...request, status: nextStatus } : request
    )
  }

  if (!canApproveMembers) {
    return (
      <main className="club-join-requests-page">
        <section className="club-join-requests-empty">
          <h1>Member Approval</h1>
          <p>Only the club leader can view and manage join requests.</p>
        </section>
      </main>
    )
  }

  return (
    <main className="club-join-requests-page">
      <section className="club-join-requests-hero">
        <div>
          <span>{club.name}</span>
          <h1>Member Approval</h1>
          <p>Review join requests and decide who can become a member of this club.</p>
        </div>

        <div className="club-join-requests-filter">
          <span>Status</span>
          <div className="club-join-requests-select">
            <button
              type="button"
              className="club-join-requests-select__button"
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
                  className="club-join-requests-select__backdrop"
                  aria-label="Close status filter"
                  onClick={() => setStatusMenuOpen(false)}
                />
                <ul className="club-join-requests-select__menu" role="listbox">
                  {CLUB_JOIN_REQUEST_STATUS_OPTIONS.map((option) => (
                    <li key={option.value} role="none">
                      <button
                        type="button"
                        role="option"
                        aria-selected={option.value === statusFilter}
                        className="club-join-requests-select__option"
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
      </section>

      <section className="club-join-requests-list" aria-label="Join requests">
        {visibleRequests.map((request) => (
          <article key={request.id} className="club-join-request-card">
            <div className="club-join-request-card__person">
              <div className="club-join-request-card__avatar" aria-hidden="true">
                {getInitials(request.applicantName)}
              </div>
              <div>
                <h2>{request.applicantName}</h2>
                <p>{request.email}</p>
                <span>Submitted at {request.submittedAt}</span>
                <button type="button" onClick={() => setDetailRequest(request)}>
                  View details
                </button>
              </div>
            </div>

            <div className="club-join-request-card__actions">
              <span className={`club-join-request-status club-join-request-status--${request.status}`}>
                {getStatusLabel(request.status)}
              </span>
              {request.status === 'pending' ? (
                <>
                  <button
                    type="button"
                    className="club-join-request-card__approve"
                    onClick={() => updateRequestStatus(request.id, 'approved')}
                  >
                    Approve
                  </button>
                  <button
                    type="button"
                    className="club-join-request-card__reject"
                    onClick={() => updateRequestStatus(request.id, 'rejected')}
                  >
                    Reject
                  </button>
                </>
              ) : (
                <strong>{request.requestedRole}</strong>
              )}
            </div>
          </article>
        ))}

        {visibleRequests.length === 0 ? (
          <div className="club-join-requests-empty">
            <h2>No requests found</h2>
            <p>There are no join requests matching this status.</p>
          </div>
        ) : null}
      </section>

      {detailRequest ? (
        <div
          className="club-join-request-modal"
          role="dialog"
          aria-modal="true"
          aria-labelledby="club-join-request-detail-title"
        >
          <button
            type="button"
            className="club-join-request-modal__backdrop"
            aria-label="Close join request details"
            onClick={() => setDetailRequest(null)}
          />
          <section className="club-join-request-modal__panel">
            <div className="club-join-request-modal__header">
              <div>
                <h2 id="club-join-request-detail-title">Join Request Details</h2>
                <p>{club.name}</p>
              </div>
              <button type="button" onClick={() => setDetailRequest(null)}>
                Close
              </button>
            </div>

            <div className="club-join-request-modal__grid">
              <div>
                <span>Full name</span>
                <strong>{detailRequest.applicantName}</strong>
              </div>
              <div>
                <span>Email</span>
                <strong>{detailRequest.email}</strong>
              </div>
              <div>
                <span>Status</span>
                <strong>{getStatusLabel(detailRequest.status)}</strong>
              </div>
              <div>
                <span>Requested role</span>
                <strong>{detailRequest.requestedRole}</strong>
              </div>
              <div>
                <span>Submitted time</span>
                <strong>{detailRequest.submittedAt}</strong>
              </div>
              <div className="club-join-request-modal__wide">
                <span>Reason</span>
                <strong>{detailRequest.reason}</strong>
              </div>
            </div>

            <div className="club-join-request-modal__answers">
              {detailRequest.answers.map((item) => (
                <div key={item.question}>
                  <span>{item.question}</span>
                  <p>{item.answer}</p>
                </div>
              ))}
            </div>

            {detailRequest.status === 'pending' ? (
              <div className="club-join-request-modal__actions">
                <button
                  type="button"
                  className="club-join-request-card__approve"
                  onClick={() => updateRequestStatus(detailRequest.id, 'approved')}
                >
                  Approve
                </button>
                <button
                  type="button"
                  className="club-join-request-card__reject"
                  onClick={() => updateRequestStatus(detailRequest.id, 'rejected')}
                >
                  Reject
                </button>
              </div>
            ) : null}
          </section>
        </div>
      ) : null}
    </main>
  )
}

export default ClubJoinRequestsPage
