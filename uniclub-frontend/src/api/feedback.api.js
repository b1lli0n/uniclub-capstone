import { apiRequest } from './api'

/**
 * Get feedback for an event
 * GET /api/student/feedback-management/:eventId
 */
export function getEventFeedback(eventId) {
  return apiRequest(`/student/feedback-management/${eventId}`)
}

/**
 * Submit feedback for an event
 * POST /api/student/feedback-management/:eventId
 */
export function submitEventFeedback(eventId, data) {
  return apiRequest(`/student/feedback-management/${eventId}`, {
    method: 'POST',
    body: JSON.stringify(data),
  })
}
