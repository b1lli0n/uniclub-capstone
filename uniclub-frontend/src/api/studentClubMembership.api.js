import { apiRequest, toQueryString } from './api'

/** View Join Request Status (list) */
export function getMyJoinRequests(params) {
  return apiRequest(`/student/clubs-membership/join-requests${toQueryString(params)}`)
}

/** View Join Request Detail */
export function getMyJoinRequestDetail(requestId) {
  return apiRequest(`/student/clubs-membership/join-requests/${requestId}`)
}

/** Cancel Join Request */
export function cancelJoinRequest(requestId) {
  return apiRequest(`/student/clubs-membership/join-requests/${requestId}/cancel`, {
    method: 'PATCH',
  })
}

/** Get join form before submitting */
export function getClubJoinForm(clubId) {
  return apiRequest(`/student/clubs-membership/${clubId}/join-form`)
}

/** Request to Join Club */
export function submitJoinRequest(clubId, payload) {
  return apiRequest(`/student/clubs-membership/${clubId}/join-requests`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
