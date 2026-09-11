import { apiRequest } from './api'

export function getMyProfile() {
  return apiRequest('/profile/me')
}

export function updateMyProfile(payload) {
  return apiRequest('/profile/me', {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

export function getUserProfileById(userId) {
  return apiRequest(`/profile/user/${userId}`)
}