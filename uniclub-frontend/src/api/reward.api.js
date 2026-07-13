import { apiRequest, toQueryString } from './api'

export function getRewards(clubId, params) {
  return apiRequest(`/president/reward-management/clubs/${clubId}/rewards${toQueryString(params)}`)
}

export function getRewardDetail(clubId, rewardId) {
  return apiRequest(`/president/reward-management/clubs/${clubId}/rewards/${rewardId}`)
}
