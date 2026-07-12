import { apiRequest, toQueryString } from './api'

export function getClubActivitySchedule(clubId, params) {
  return apiRequest(
    `/member/clubs/${clubId}/activity-schedule${toQueryString(params)}`,
  )
}

export function getActivityScheduleDetail(clubId, activityId) {
  return apiRequest(`/member/clubs/${clubId}/activity-schedule/${activityId}`)
}
