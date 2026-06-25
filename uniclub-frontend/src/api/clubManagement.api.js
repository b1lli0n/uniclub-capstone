import { apiRequest, toQueryString } from './api'

/** View Club List (student affairs) */
export function getAdminClubList(params) {
  return apiRequest(`/club-management${toQueryString(params)}`)
}

/** View Club Detail (student affairs) */
export function getAdminClubDetail(clubId) {
  return apiRequest(`/club-management/${clubId}`)
}

/** View Member in Club Detail (student affairs) */
export function getAdminClubMembers(clubId, params) {
  return apiRequest(`/club-management/${clubId}/members${toQueryString(params)}`)
}

/** Assign Management Roles */
export function assignManagementRole(clubId, memberId, role) {
  return apiRequest(`/club-management/${clubId}/members/${memberId}/role`, {
    method: 'PATCH',
    body: JSON.stringify({ role }),
  })
}

/** Activate/Deactivate Club */
export function updateClubStatus(clubId, status) {
  return apiRequest(`/club-management/${clubId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}

/** View Club Creation Request List */
export function getClubCreationRequestList(params) {
  return apiRequest(`/club-management/club-creation-requests${toQueryString(params)}`)
}

/** View Club Creation Request Detail */
export function getClubCreationRequestDetail(requestId) {
  return apiRequest(`/club-management/club-creation-requests/${requestId}`)
}

/** Approve/Reject Club Creation Request */
export function reviewClubCreationRequest(requestId, payload) {
  return apiRequest(`/club-management/club-creation-requests/${requestId}/review`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}
