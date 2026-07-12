import { apiRequest, toQueryString } from './api'

const base = (clubId) => `/secretary/clubs/${clubId}/activity-schedule`

export function getSecretaryClubActivitySchedule(clubId, params) {
  return apiRequest(`${base(clubId)}${toQueryString(params)}`)
}

export function getSecretaryActivityScheduleDetail(clubId, activityId) {
  return apiRequest(`${base(clubId)}/${activityId}`)
}

export function createSecretaryActivity(clubId, payload) {
  return apiRequest(base(clubId), {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function updateSecretaryActivity(clubId, activityId, payload) {
  return apiRequest(`${base(clubId)}/${activityId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  })
}

export function deleteSecretaryActivity(clubId, activityId) {
  return apiRequest(`${base(clubId)}/${activityId}`, {
    method: 'DELETE',
  })
}
