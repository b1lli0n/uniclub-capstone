import { apiRequest, toQueryString } from './api'

/** View Join Request List (president) */
export function getClubJoinRequests(clubId, params) {
  return apiRequest(
    `/president/join-request-management/${clubId}/join-requests${toQueryString(params)}`,
  )
}

/** View Join Request Detail (president) */
export function getClubJoinRequestDetail(clubId, requestId) {
  return apiRequest(
    `/president/join-request-management/${clubId}/join-requests/${requestId}`,
  )
}

/** Review Join Request (Approve / Reject) */
export function reviewJoinRequest(clubId, requestId, { status, review_note = '' }) {
  return apiRequest(
    `/president/join-request-management/${clubId}/join-requests/${requestId}/review`,
    {
      method: 'PATCH',
      body: JSON.stringify({ status, review_note }),
    },
  )
}

/** Approve Join Request */
export function approveJoinRequest(clubId, requestId) {
  return reviewJoinRequest(clubId, requestId, { status: 'approved' })
}

/** Reject Join Request */
export function rejectJoinRequest(clubId, requestId, reviewNote) {
  return reviewJoinRequest(clubId, requestId, { status: 'rejected', review_note: reviewNote })
}
