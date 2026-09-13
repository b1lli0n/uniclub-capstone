import { useEffect, useMemo, useState } from 'react'
import { getClubById } from '../../api/club.api'
import { getMyClubs } from '../../api/memberClubMembership.api'
import {
  approveJoinRequest,
  getClubJoinRequestDetail,
  getClubJoinRequests,
  rejectJoinRequest,
} from '../../api/joinRequestManagement.api'
import { mapClubFromApi, mapPresidentJoinRequestFromApi } from '../../api/clubMappers'
import { CLUB_JOIN_REQUEST_STATUS_OPTIONS } from '../../data/mockData'
import { useConfirm, useToast } from '../../components/common/notificationContext'
import '../../styles/club-join-requests.css'

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
  const confirm = useConfirm()
  const showToast = useToast()
  const [club, setClub] = useState(null)
  const [canApproveMembers, setCanApproveMembers] = useState(false)
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [statusMenuOpen, setStatusMenuOpen] = useState(false)
  const [detailRequest, setDetailRequest] = useState(null)
  const [requests, setRequests] = useState([])

  useEffect(() => {
    let cancelled = false

    async function loadPageData() {
      setLoading(true)
      try {
        const [clubResponse, myClubsResponse] = await Promise.all([
          getClubById(clubId),
          getMyClubs(),
        ])

        if (cancelled) return

        setClub(mapClubFromApi(clubResponse.data))

        const membership = (myClubsResponse.data || []).find((item) => {
          const id = item.club_id?._id || item.club_id
          return String(id) === String(clubId)
        })
        const role = membership?.role?.toLowerCase()
        const isPresident = role === 'president' || role === 'leader'
        setCanApproveMembers(isPresident)

        if (isPresident) {
          try {
            const requestsResponse = await getClubJoinRequests(clubId, {
              status: statusFilter !== 'all' ? statusFilter : undefined,
            })
            if (!cancelled) {
              setRequests(
                (requestsResponse.data || []).map((request) => mapPresidentJoinRequestFromApi(request)),
              )
            }
          } catch (reqError) {
            console.error('Failed to load join requests:', reqError)
            if (!cancelled) setRequests([])
          }
        }
      } catch (error) {
        console.error(error)
        if (!cancelled) {
          setClub(null)
          setRequests([])
          setCanApproveMembers(false)
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

  const selectedStatus =
    CLUB_JOIN_REQUEST_STATUS_OPTIONS.find((option) => option.value === statusFilter) ||
    CLUB_JOIN_REQUEST_STATUS_OPTIONS[0]

  const visibleRequests = useMemo(() => requests, [requests])

  async function refreshRequests() {
    const response = await getClubJoinRequests(clubId, {
      status: statusFilter !== 'all' ? statusFilter : undefined,
    })
    setRequests((response.data || []).map((request) => mapPresidentJoinRequestFromApi(request)))
  }

  async function updateRequestStatus(requestId, nextStatus) {
    const request = requests.find((item) => item.id === requestId) || detailRequest
    const isApprove = nextStatus === 'approved'
    const accepted = await confirm({
      title: isApprove ? 'Approve request?' : 'Reject request?',
      message: `${isApprove ? 'Approve' : 'Reject'} ${request?.applicantName || 'this applicant'}'s join request?`,
      confirmText: isApprove ? 'Approve' : 'Reject',
      tone: isApprove ? 'warning' : 'danger',
    })

    if (!accepted) return

    try {
      if (nextStatus === 'approved') {
        await approveJoinRequest(clubId, requestId)
      } else {
        await rejectJoinRequest(clubId, requestId)
      }
      await refreshRequests()
      setDetailRequest((request) =>
        request?.id === requestId ? { ...request, status: nextStatus } : request,
      )
      // Display notification when join request is approved or rejected.
      showToast({
        type: 'success',
        title: isApprove ? 'Request approved' : 'Request rejected',
        message: `${request?.applicantName || 'The applicant'} has been ${isApprove ? 'approved' : 'rejected'}.`,
      })
    } catch (error) {
      console.error(error)
      showToast({
        type: 'error',
        title: 'Review failed',
        message: error.message || 'Could not update this join request.',
      })
    }
  }

  async function handleViewDetails(request) {
    try {
      const response = await getClubJoinRequestDetail(clubId, request.id)
      const formQuestions = response.data?.form_id?.questions || []
      setDetailRequest(mapPresidentJoinRequestFromApi(response.data, formQuestions))
    } catch (error) {
      console.error(error)
      setDetailRequest(request)
    }
  }

  if (loading) {
    return (
      <main className="club-join-requests-page">
        <section className="club-join-requests-empty">
          <h1>Member Approval</h1>
          <p>Loading join requests...</p>
        </section>
      </main>
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
          <span>{club?.name}</span>
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
                <button type="button" onClick={() => handleViewDetails(request)}>
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
                <p>{club?.name}</p>
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
