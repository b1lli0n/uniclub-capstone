import { apiRequest, toQueryString } from './api'

const base = '/club-management'

/** View Club Creation Request List */
export function getClubCreationRequests(params) {
  return apiRequest(`${base}/club-creation-requests${toQueryString(params)}`)
}

/** View Club Creation Request Detail */
export function getClubCreationRequestDetail(requestId) {
  return apiRequest(`${base}/club-creation-requests/${requestId}`)
}

/** Approve/Reject Club Creation Request */
export function reviewClubCreationRequest(requestId, payload) {
  return apiRequest(`${base}/club-creation-requests/${requestId}/review`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

/** View List of Clubs for Admin */
export function getAdminClubs(params) {
  return apiRequest(`${base}${toQueryString(params)}`)
}

/** Update Club Status (active / inactive) */
export function updateClubStatus(clubId, status) {
  return apiRequest(`${base}/${clubId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}
