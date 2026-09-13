import { apiRequest, toQueryString } from './api'

/** Fetch all polls for a club */
export function getClubPolls(clubId, params) {
  return apiRequest(`/member/clubs/${clubId}/polls${toQueryString(params)}`)
}

/** Get poll detail */
export function getPollDetail(clubId, pollId) {
  return apiRequest(`/member/clubs/${clubId}/polls/${pollId}`)
}

/** Create a new poll (President / Secretary) */
export function createPoll(clubId, data) {
  return apiRequest(`/secretary/clubs/${clubId}/polls`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/** Vote on a poll option */
export function votePoll(clubId, pollId, optionId) {
  return apiRequest(`/member/clubs/${clubId}/polls/${pollId}/vote`, {
    method: 'POST',
    body: JSON.stringify({ option_id: optionId }),
  })
}

/** Close a poll */
export function closePoll(clubId, pollId) {
  return apiRequest(`/secretary/clubs/${clubId}/polls/${pollId}/close`, {
    method: 'PATCH',
  })
}
