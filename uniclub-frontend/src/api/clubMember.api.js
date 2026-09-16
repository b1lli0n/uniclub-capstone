import { apiRequest, toQueryString } from './api'

/** View Club Members (president management) */
export function getClubMembersForManagement(clubId, params) {
  return apiRequest(`/club-members/${clubId}/members/manage${toQueryString(params)}`)
}

/** Remove Member */
export function removeMember(clubId, memberId) {
  return apiRequest(`/club-members/${clubId}/members/${memberId}/remove`, {
    method: 'PATCH',
  })
}

/** Get member profile by userId — for viewing member details in a club */
export function getMemberProfileForPresident(clubId, userId) {
  return apiRequest(`/club-members/user/${userId}`)
}
