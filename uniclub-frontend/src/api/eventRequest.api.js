import { apiRequest, toQueryString } from './api'

// Event Manager / President API
export function createEventRequest(clubId, payload) {
  return apiRequest(`/event-manager/event-requests/${clubId}`, {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function getMyEventRequests(params) {
  return apiRequest(`/event-manager/event-requests/my-requests${toQueryString(params)}`)
}

// Student Affairs API
export function getEventRequests(params) {
  return apiRequest(`/student-affairs/event-requests${toQueryString(params)}`)
}

export function getEventRequestDetail(requestId) {
  return apiRequest(`/student-affairs/event-requests/${requestId}`)
}

export function reviewEventRequest(requestId, { status, review_note = '' }) {
  return apiRequest(`/student-affairs/event-requests/${requestId}/review`, {
    method: 'PUT',
    body: JSON.stringify({ status, review_note }),
  })
}

export function approveEventRequest(requestId) {
  return reviewEventRequest(requestId, { status: 'approved' })
}

export function rejectEventRequest(requestId, reviewNote) {
  return reviewEventRequest(requestId, { status: 'rejected', review_note: reviewNote })
}

