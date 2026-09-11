/**
 * ============================================================
 * UNICLUB – FRONTEND API TEST SUITE RUNNER
 * ============================================================
 * Tự động chạy và kiểm tra kết nối của tất cả các API frontend tới backend.
 * Hỗ trợ tạo JWT Token giả lập 5 vai trò (SA Admin, President, Secretary, Treasurer, Student).
 * ============================================================
 */

import { getMyProfile } from './profile.api'
import { getClubs, getClubById } from './club.api'
import { getPublicEvents, getMyRegistrations } from './event.api'
import { getStudentClubMemberships } from './studentClubMembership.api'
import { getPointRules, getLeaderboard } from './clubManagement.api'
import { getMemberRewards, getManagerRewards, getMemberRedemptionHistory } from './reward.api'
import { getClubActivitySchedule } from './activitySchedule.api'
import { getStudentClubFees } from './payment.api'
import { getMyEventRequests } from './eventRequest.api'

// ID mặc định từ Seed Database
const MUSIC_CLUB_ID = '6a3c34121f6805a34580c4b2'

export const TEST_SUITES = [
  {
    category: 'Profile & Auth',
    tests: [
      {
        name: 'Get Current User Profile',
        endpoint: 'GET /api/profile/me',
        fn: () => getMyProfile()
      }
    ]
  },
  {
    category: 'Club Discovery',
    tests: [
      {
        name: 'Get List of Active Clubs',
        endpoint: 'GET /api/clubs',
        fn: () => getClubs()
      },
      {
        name: 'Get Music Club Detail',
        endpoint: `GET /api/clubs/${MUSIC_CLUB_ID}`,
        fn: () => getClubById(MUSIC_CLUB_ID)
      }
    ]
  },
  {
    category: 'Events & Registration',
    tests: [
      {
        name: 'Get Public Events List',
        endpoint: 'GET /api/events/public',
        fn: () => getPublicEvents()
      },
      {
        name: 'Get My Registered Events',
        endpoint: 'GET /api/events/my-registrations',
        fn: () => getMyRegistrations()
      }
    ]
  },
  {
    category: 'Club Memberships & Roles',
    tests: [
      {
        name: 'Get Student Club Memberships',
        endpoint: 'GET /api/member/clubs-membership/my-clubs',
        fn: () => getStudentClubMemberships()
      }
    ]
  },
  {
    category: 'Point System & Leaderboard',
    tests: [
      {
        name: 'Get Club Point Rules',
        endpoint: `GET /api/president/clubs/${MUSIC_CLUB_ID}/point-rules`,
        fn: () => getPointRules(MUSIC_CLUB_ID)
      },
      {
        name: 'Get Club Member Leaderboard',
        endpoint: `GET /api/member/clubs-membership/${MUSIC_CLUB_ID}/points/leaderboard`,
        fn: () => getLeaderboard(MUSIC_CLUB_ID)
      }
    ]
  },
  {
    category: 'Rewards Store & Redemption',
    tests: [
      {
        name: 'Get Member Rewards List',
        endpoint: `GET /api/member/clubs-membership/${MUSIC_CLUB_ID}/rewards`,
        fn: () => getMemberRewards(MUSIC_CLUB_ID)
      },
      {
        name: 'Get Manager Rewards List',
        endpoint: `GET /api/president/reward-management/clubs/${MUSIC_CLUB_ID}/rewards`,
        fn: () => getManagerRewards(MUSIC_CLUB_ID)
      },
      {
        name: 'Get Member Redemption History',
        endpoint: `GET /api/member/clubs-membership/${MUSIC_CLUB_ID}/redemption-history`,
        fn: () => getMemberRedemptionHistory(MUSIC_CLUB_ID)
      }
    ]
  },
  {
    category: 'Activities & Schedule',
    tests: [
      {
        name: 'Get Club Weekly Activities',
        endpoint: `GET /api/secretary/clubs/${MUSIC_CLUB_ID}/activity-schedule`,
        fn: () => getClubActivitySchedule(MUSIC_CLUB_ID)
      }
    ]
  },
  {
    category: 'Financial Transactions & Payments',
    tests: [
      {
        name: 'Get Student Fee Payments',
        endpoint: 'GET /api/payment/fees',
        fn: () => getStudentClubFees()
      }
    ]
  },
  {
    category: 'Event Requests',
    tests: [
      {
        name: 'Get My Event Creation Requests',
        endpoint: 'GET /api/event-requests/my-requests',
        fn: () => getMyEventRequests()
      }
    ]
  }
]

export async function runApiTest(testItem) {
  const startTime = performance.now()
  try {
    const res = await testItem.fn()
    const endTime = performance.now()
    return {
      name: testItem.name,
      endpoint: testItem.endpoint,
      status: 'PASSED',
      statusCode: 200,
      latencyMs: Math.round(endTime - startTime),
      data: res
    }
  } catch (err) {
    const endTime = performance.now()
    return {
      name: testItem.name,
      endpoint: testItem.endpoint,
      status: 'FAILED',
      statusCode: err.status || 500,
      latencyMs: Math.round(endTime - startTime),
      error: err.message || String(err)
    }
  }
}

export async function runAllApiTests(onProgress) {
  const results = []
  let completed = 0

  for (const group of TEST_SUITES) {
    for (const test of group.tests) {
      const res = await runApiTest(test)
      results.push({ ...res, category: group.category })
      completed++
      if (onProgress) {
        onProgress(completed, results.length, res)
      }
    }
  }
  return results
}
