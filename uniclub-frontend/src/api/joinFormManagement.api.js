import { apiRequest } from './api'

const base = (clubId) => `/president/clubs/${clubId}/join-form`

/**
 * GET /api/president/clubs/:clubId/join-form
 * President xem join form hiện tại của club
 */
export function getPresidentJoinForm(clubId) {
  return apiRequest(base(clubId))
}

/**
 * POST /api/president/clubs/:clubId/join-form
 * President tạo form mới (form cũ tự động bị deactivate)
 * @param {string} clubId
 * @param {{ title: string, description: string, questions: string[] }} payload
 */
export function createPresidentJoinForm(clubId, payload) {
  return apiRequest(base(clubId), {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * PATCH /api/president/clubs/:clubId/join-form/:formId
 * President cập nhật nội dung form
 * @param {string} clubId
 * @param {string} formId
 * @param {{ title?: string, description?: string, questions?: string[] }} payload
 */
export function updatePresidentJoinForm(clubId, formId, payload) {
  return apiRequest(`${base(clubId)}/${formId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

/**
 * PATCH /api/president/clubs/:clubId/join-form/:formId/status
 * President bật/tắt form
 * @param {string} clubId
 * @param {string} formId
 * @param {'active' | 'inactive'} status
 */
export function togglePresidentJoinFormStatus(clubId, formId, status) {
  return apiRequest(`${base(clubId)}/${formId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  })
}
