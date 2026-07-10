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

/** Approve Join Request */
export function approveJoinRequest(clubId, requestId) {
  return apiRequest(
    `/president/join-request-management/${clubId}/join-requests/${requestId}/approve`,
    { method: 'PATCH' },
  )
}

/** Reject Join Request */
export function rejectJoinRequest(clubId, requestId, reviewNote) {
  return apiRequest(
    `/president/join-request-management/${clubId}/join-requests/${requestId}/reject`,
    {
      method: 'PATCH',
      body: JSON.stringify({ review_note: reviewNote }),
    },
  )
}
