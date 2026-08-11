import { apiRequest } from './api'

/** Get Action Types list */
export function getActionTypes() {
  return apiRequest('/president/clubs/action-types')
}

/** Get Point Rules list for club (president or member) */
export function getPointRules(clubId, isPresident = false) {
  const endpoint = isPresident
    ? `/president/clubs/${clubId}/point-rules`
    : `/member/clubs-membership/${clubId}/points/rules`
  return apiRequest(endpoint)
}

/** Create Point Rule (president) */
export function createPointRule(clubId, data) {
  return apiRequest(`/president/clubs/${clubId}/point-rules`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/** Update Point Rule (president) */
export function updatePointRule(clubId, ruleId, data) {
  return apiRequest(`/president/clubs/${clubId}/point-rules/${ruleId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/** Toggle Point Rule Status (president) */
export function togglePointRuleStatus(clubId, ruleId, status) {
  return apiRequest(`/president/clubs/${clubId}/point-rules/${ruleId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ is_active: status }),
  })
}

/** Delete Point Rule (president) */
export function deletePointRule(clubId, ruleId) {
  return apiRequest(`/president/clubs/${clubId}/point-rules/${ruleId}`, {
    method: 'DELETE',
  })
}

/** Manually award points to a member (president) */
export function awardPointsManually(clubId, memberId, data) {
  return apiRequest(`/president/clubs/${clubId}/members/${memberId}/points`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/** Get club points leaderboard */
export function getClubLeaderboard(clubId) {
  return apiRequest(`/member/clubs-membership/${clubId}/points/leaderboard`)
}

/** Get my contribution logs for a club */
export function getMyContributionLogs(clubId) {
  return apiRequest(`/member/clubs-membership/${clubId}/points/logs`)
}
