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
 * View Club Events for Event Manager (lấy cả draft và completed)
 * GET /api/event-manager/event-management/:clubId/events
 */
export async function getClubEventsForManager(clubId) {
  const res = await apiRequest(`/event-manager/event-management/${clubId}/events`)
  if (res.data && !Array.isArray(res.data)) {
    res.data = [...(res.data.completed || []), ...(res.data.draft || [])]
  }
  return res
}

/**
 * Create Event (event manager/president tạo sự kiện trực tiếp)
 * POST /api/event-manager/event-management/:clubId/events
 */
export function createEvent(clubId, payload) {
  return apiRequest(`/event-manager/event-management/${clubId}/events`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Update Managed Event (Publish/Edit Draft)
 * PATCH /api/event-manager/event-management/:clubId/events/:eventId
 */
export function updateManagedEvent(clubId, eventId, payload) {
  return apiRequest(`/event-manager/event-management/${clubId}/events/${eventId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

/**
 * Cancel Managed Event
 * PATCH /api/event-manager/event-management/:clubId/events/:eventId/cancel
 */
export function cancelManagedEvent(clubId, eventId) {
  return apiRequest(`/event-manager/event-management/${clubId}/events/${eventId}/cancel`, {
    method: 'PATCH',
  })
}

/**
 * View My Registrations (xem các sự kiện đã đăng ký tham gia của cá nhân)
 * GET /api/events/my-registrations
 */
export function getMyRegistrations() {
  return apiRequest('/events/my-registrations')
}

/**
 * Get event attendance list (Lấy danh sách điểm danh sự kiện)
 * GET /api/events/:eventId/attendance
 */
export function getEventAttendanceList(eventId, params = {}) {
  return apiRequest(`/events/${eventId}/attendance${toQueryString(params)}`)
}

/**
 * Update event attendance status (Cập nhật trạng thái điểm danh: check-in đơn lẻ hoặc bật/tắt check-in sự kiện)
 * PATCH /api/events/:eventId/attendance/status
 */
export function updateEventAttendanceStatus(eventId, data) {
  return apiRequest(`/events/${eventId}/attendance/status`, {
    method: 'PATCH',
    body: JSON.stringify(data),
    headers: {
      'Content-Type': 'application/json',
    },
  })
}

/**
 * Get event timelines
 * GET /api/events/:eventId/timelines
 */
export function getEventTimelines(eventId) {
  return apiRequest(`/events/${eventId}/timelines`)
}

/**
 * Create event timeline
 * POST /api/events/:eventId/timelines
 */
export function createEventTimeline(eventId, payload) {
  return apiRequest(`/events/${eventId}/timelines`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Update event timeline
 * PATCH /api/events/:eventId/timelines/:timelineId
 */
export function updateEventTimeline(eventId, timelineId, payload) {
  return apiRequest(`/events/${eventId}/timelines/${timelineId}`, {
    method: 'PATCH',
    body: JSON.stringify(payload),
  })
}

/**
 * Delete event timeline
 * DELETE /api/events/:eventId/timelines/:timelineId
 */
export function deleteEventTimeline(eventId, timelineId) {
  return apiRequest(`/events/${eventId}/timelines/${timelineId}`, {
    method: 'DELETE',
  })
}

