import { apiRequest, toQueryString } from './api'

/** View Invitation List (secretary) */
export function getClubInvitations(clubId, params) {
  return apiRequest(
    `/secretary/invitation-management/${clubId}/invitations${toQueryString(params)}`,
  )
}

/** View Invitation Detail (secretary) */
export function getClubInvitationDetail(clubId, invitationId) {
  return apiRequest(
    `/secretary/invitation-management/${clubId}/invitations/${invitationId}`,
  )
}

/** Send Club Invitation */
export function sendClubInvitation(clubId, payload) {
  return apiRequest(`/secretary/invitation-management/${clubId}/invitations`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/** Cancel Invitation */
export function cancelClubInvitation(clubId, invitationId) {
  return apiRequest(
    `/secretary/invitation-management/${clubId}/invitations/${invitationId}/cancel`,
    { method: 'PATCH' },
  )
}

/** Resend Invitation */
export function resendClubInvitation(clubId, invitationId, payload) {
  return apiRequest(
    `/secretary/invitation-management/${clubId}/invitations/${invitationId}/resend`,
    {
      method: 'PATCH',
      body: JSON.stringify(payload || {}),
    },
  )
}
