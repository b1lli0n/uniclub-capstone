import { apiRequest, toQueryString } from './api'

// ── MEMBER ENDPOINTS ──────────────────────────────────────────────────────────

export function getMemberRewards(clubId, params) {
  return apiRequest(`/member/clubs-membership/${clubId}/rewards${toQueryString(params)}`)
}

export function getMemberRewardDetail(clubId, rewardId) {
  return apiRequest(`/member/clubs-membership/${clubId}/rewards/${rewardId}`)
}

export function redeemReward(clubId, rewardId) {
  return apiRequest(`/member/clubs-membership/${clubId}/rewards/${rewardId}/redeem`, {
    method: 'POST',
  })
}

export function getMemberRedemptionHistory(clubId, params) {
  return apiRequest(`/member/clubs-membership/${clubId}/redemption-history${toQueryString(params)}`)
}


// ── MANAGER (PRESIDENT) ENDPOINTS ─────────────────────────────────────────────

export function getManagerRewards(clubId, params) {
  return apiRequest(`/president/reward-management/clubs/${clubId}/rewards${toQueryString(params)}`)
}

export function getManagerRewardDetail(clubId, rewardId) {
  return apiRequest(`/president/reward-management/clubs/${clubId}/rewards/${rewardId}`)
}

export function createReward(clubId, data) {
  return apiRequest(`/president/reward-management/clubs/${clubId}/rewards`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

export function updateReward(clubId, rewardId, data) {
  return apiRequest(`/president/reward-management/clubs/${clubId}/rewards/${rewardId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

export function toggleRewardVisibility(clubId, rewardId) {
  return apiRequest(`/president/reward-management/clubs/${clubId}/rewards/${rewardId}/hide`, {
    method: 'PATCH',
  })
}

export function getManagerRedemptionHistory(clubId, params) {
  return apiRequest(`/president/reward-management/clubs/${clubId}/reward-redemptions${toQueryString(params)}`)
}

export function reviewRedemption(clubId, redemptionId, { status, rejection_reason = '' }) {
  return apiRequest(`/president/reward-management/clubs/${clubId}/reward-redemptions/${redemptionId}/review`, {
    method: 'PATCH',
    body: JSON.stringify({ status, rejection_reason }),
  })
}

export function approveRedemption(clubId, redemptionId) {
  return reviewRedemption(clubId, redemptionId, { status: 'approved' })
}

export function rejectRedemption(clubId, redemptionId, reason) {
  return reviewRedemption(clubId, redemptionId, { status: 'rejected', rejection_reason: reason })
}
