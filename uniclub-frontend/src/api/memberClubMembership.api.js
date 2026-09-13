import { apiRequest } from './api'

/** View My Club */
export function getMyClubs() {
  return apiRequest('/member/clubs-membership/my-clubs')
}

/** View Club Members (as member) */
export function getClubMembers(clubId) {
  return apiRequest(`/member/clubs-membership/${clubId}/members`)
}

/** Leave Club */
export function leaveClub(clubId) {
  return apiRequest(`/member/clubs-membership/${clubId}/leave`, {
    method: 'PATCH',
  })
}
