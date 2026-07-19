import { apiRequest, toQueryString } from './api'

/**
 * View Public Events (học sinh xem các sự kiện được public)
 * GET /api/events/public
 * @param {{ clubId?: string }} params
 */
export function getPublicEvents(params) {
  return apiRequest(`/events/public${toQueryString(params)}`)
}

/**
 * View Event Detail (xem chi tiết event, có check roles)
 * GET /api/events/:eventId
 */
export function getEventDetail(eventId) {
  return apiRequest(`/events/${eventId}`)
}

/**
 * Register for Event (club member đăng ký các sự kiện)
 * POST /api/events/:eventId/register
 */
export function registerForEvent(eventId) {
  return apiRequest(`/events/${eventId}/register`, {
    method: 'POST',
  })
}

/**
 * Cancel Event Registration (club member hủy sự kiện đã đăng ký trước khi sự kiện diễn ra)
 * POST /api/events/:eventId/cancel
 */
export function cancelEventRegistration(eventId) {
  return apiRequest(`/events/${eventId}/cancel`, {
    method: 'POST',
  })
}

/**
 * View Club Events (club member xem hết tất cả sự kiện của club họ tham gia)
 * GET /api/member/clubs-membership/:clubId/events
 */
export function getClubEventsForMember(clubId) {
  return apiRequest(`/member/clubs-membership/${clubId}/events`)
}

/**
 * View My Registrations (xem các sự kiện đã đăng ký tham gia của cá nhân)
 * GET /api/events/my-registrations
 */
export function getMyRegistrations() {
  return apiRequest('/events/my-registrations')
}
