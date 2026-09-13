import { apiRequest, toQueryString } from './api'

/** View List of Clubs (student discovery) */
export function getClubs(params) {
  return apiRequest(`/clubs${toQueryString(params)}`)
}

/** View Club Detail (student discovery) */
export function getClubById(clubId) {
  return apiRequest(`/clubs/${clubId}`)
}

/** Request to Create Club */
export function requestCreateClub(payload) {
  return apiRequest('/clubs/creation-requests', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}
