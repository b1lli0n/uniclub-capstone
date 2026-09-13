import { apiRequest, toQueryString } from './api'

/** View Received Invitations (member) — requires clubId */
export function getReceivedInvitations(clubId, params) {
  return apiRequest(
    `/member/invitation-management/${clubId}/invitations${toQueryString(params)}`,
  )
}

/** View Invitation Detail (member) */
export function getReceivedInvitationDetail(clubId, invitationId) {
  return apiRequest(
    `/member/invitation-management/${clubId}/invitations/${invitationId}`,
  )
}

/** Accept Club Invitation */
export function acceptInvitation(clubId, invitationId) {
  return apiRequest(
    `/member/invitation-management/${clubId}/invitations/${invitationId}/accept`,
    { method: 'PATCH' },
  )
}

/** Reject Club Invitation */
export function rejectInvitation(clubId, invitationId) {
  return apiRequest(
    `/member/invitation-management/${clubId}/invitations/${invitationId}/reject`,
    { method: 'PATCH' },
  )
}
