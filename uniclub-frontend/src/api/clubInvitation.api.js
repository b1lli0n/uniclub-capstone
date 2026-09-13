import { apiRequest, toQueryString } from './api'

const base = '/member/clubs-membership/invitations'

/** View Received Invitations */
export function getReceivedInvitations(params) {
  return apiRequest(`${base}${toQueryString(params)}`)
}

/** View Invitation Detail */
export function getReceivedInvitationDetail(invitationId) {
  return apiRequest(`${base}/${invitationId}`)
}

/** Accept Club Invitation */
export function acceptClubInvitation(invitationId) {
  return apiRequest(`${base}/${invitationId}/accept`, {
    method: 'PATCH',
  })
}

/** Reject Club Invitation */
export function rejectClubInvitation(invitationId) {
  return apiRequest(`${base}/${invitationId}/reject`, {
    method: 'PATCH',
  })
}
