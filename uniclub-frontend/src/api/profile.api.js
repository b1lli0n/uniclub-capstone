import { apiRequest, cachedApiRequest, invalidateApiCache } from './api'

export function getMyProfile() {
  return cachedApiRequest('/profile/me', {}, 3500)
}

export function updateMyProfile(payload) {
  invalidateApiCache('/profile/me')
  return apiRequest('/profile/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function getUserProfileById(userId) {
  return apiRequest(`/profile/user/${userId}`)
}