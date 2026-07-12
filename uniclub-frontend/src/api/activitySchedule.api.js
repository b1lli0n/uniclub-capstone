import { apiRequest, toQueryString } from './api'

/**
 * Member: View Club Activity Schedule
 * GET /api/member/clubs/:clubId/activity-schedule
 * @param {string} clubId
 * @param {{ start_date?: string, end_date?: string, search?: string, page?: number, limit?: number }} params
 */
export function getClubActivitySchedule(clubId, params) {
  return apiRequest(
    `/member/clubs/${clubId}/activity-schedule${toQueryString(params)}`,
  )
}

/**
 * Member: View Activity Schedule Detail
 * GET /api/member/clubs/:clubId/activity-schedule/:activityId
 */
export function getActivityScheduleDetail(clubId, activityId) {
  return apiRequest(`/member/clubs/${clubId}/activity-schedule/${activityId}`)
}
