import { apiRequest, toQueryString } from './api'

export function createEventRequest(clubId, payload) {
  return apiRequest(`/event-requests/${clubId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getEventRequests(params) {
  return apiRequest(`/event-requests${toQueryString(params)}`)
}

export function getMyEventRequests(params) {
  return apiRequest(`/event-requests/my-requests${toQueryString(params)}`)
}

export function getEventRequestDetail(requestId) {
  return apiRequest(`/event-requests/${requestId}`)
}

export function approveEventRequest(requestId) {
  return apiRequest(`/event-requests/${requestId}/approve`, {
    method: 'PUT',
  })
}

export function rejectEventRequest(requestId, reviewNote) {
  return apiRequest(`/event-requests/${requestId}/reject`, {
    method: 'PUT',
    body: JSON.stringify({ review_note: reviewNote }),
  })
}
