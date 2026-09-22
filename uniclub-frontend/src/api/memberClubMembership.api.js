import { apiRequest, cachedApiRequest, invalidateApiCache } from './api'

/** View My Club */
export function getMyClubs() {
  return cachedApiRequest('/member/clubs-membership/my-clubs', {}, 3500)
}

/** View Club Members (as member) */
export function getClubMembers(clubId) {
  return apiRequest(`/member/clubs-membership/${clubId}/members`)
}

/** Leave Club */
export function leaveClub(clubId) {
  invalidateApiCache('/member/clubs-membership')
  return apiRequest(`/member/clubs-membership/${clubId}/leave`, {
    method: 'PATCH',
  })
}

