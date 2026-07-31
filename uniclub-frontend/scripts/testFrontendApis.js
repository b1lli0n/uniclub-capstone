/**
 * ============================================================
 * UNICLUB – CLI FRONTEND API INTEGRATION TEST
 * ============================================================
 * Tự động kết nối DB lấy User thật và tạo Token hợp lệ để test 100% API endpoints.
 * ============================================================
 */

const mongoose = require('mongoose')
const jwt = require('jsonwebtoken')
const path = require('path')
require('dotenv').config({ path: path.join(__dirname, '../../uniclub-backend/.env') })

process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"
const BASE_URL = 'https://localhost:5000/api'
const JWT_SECRET = process.env.JWT_SECRET || "unclub-secret-key"
const MONGODB_URI = process.env.MONGODB_URI || "mongodb://127.0.0.1:27017/UniClub"

const User = require('../../uniclub-backend/src/models/user.model')
const Club = require('../../uniclub-backend/src/models/club.model')

function makeToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role },
    JWT_SECRET,
    { expiresIn: "7d" }
  )
}

async function runCliTests() {
  await mongoose.connect(MONGODB_URI)
  
  const adminUser = await User.findOne({ email: 'admin@fpt.edu.vn' })
  const tyUser = await User.findOne({ email: 'tynce181041@fpt.edu.vn' })
  const secretaryUser = await User.findOne({ email: 'demo1@fpt.edu.vn' })
  const treasurerUser = await User.findOne({ email: 'demo2@fpt.edu.vn' })
  const musicClub = await Club.findOne({ name: 'Music Club' })

  const adminToken = makeToken(adminUser)
  const presidentToken = makeToken(tyUser)
  const secretaryToken = makeToken(secretaryUser)
  const treasurerToken = makeToken(treasurerUser)

  const MUSIC_CLUB_ID = musicClub ? String(musicClub._id) : "6a3c34121f6805a34580c4b2"

  const ENDPOINTS_TO_TEST = [
    { name: 'Profile API (My Profile)', endpoint: '/profile/my-profile', token: presidentToken },
    { name: 'Clubs List API', endpoint: '/clubs', token: presidentToken },
    { name: 'Club Detail API', endpoint: `/clubs/${MUSIC_CLUB_ID}`, token: presidentToken },
    { name: 'Public Events API', endpoint: '/events/public', token: presidentToken },
    { name: 'My Event Registrations API', endpoint: '/events/my-registrations', token: presidentToken },
    { name: 'Student Club Memberships API', endpoint: '/student/clubs-membership', token: presidentToken },
    { name: 'Club Members API (President)', endpoint: `/president/club-management/clubs/${MUSIC_CLUB_ID}/members`, token: presidentToken },
    { name: 'Club Point Rules API', endpoint: `/president/club-management/clubs/${MUSIC_CLUB_ID}/point-rules`, token: presidentToken },
    { name: 'Member Leaderboard API', endpoint: `/president/club-management/clubs/${MUSIC_CLUB_ID}/leaderboard`, token: presidentToken },
    { name: 'Member Rewards API', endpoint: `/member/clubs-membership/${MUSIC_CLUB_ID}/rewards`, token: presidentToken },
    { name: 'Manager Rewards API', endpoint: `/president/reward-management/clubs/${MUSIC_CLUB_ID}/rewards`, token: presidentToken },
    { name: 'Club Weekly Activities API', endpoint: `/secretary/activity-schedule/clubs/${MUSIC_CLUB_ID}/activities`, token: secretaryToken },
    { name: 'Student Club Fees API', endpoint: '/student/club-fees/payments', token: presidentToken }
  ]

  console.log('==================================================')
  console.log('🚀 UNICLUB FRONTEND API INTEGRATION TEST SUITE')
  console.log(`📡 Base URL: ${BASE_URL}`)
  console.log('==================================================\n')

  let passed = 0
  let failed = 0

  for (const test of ENDPOINTS_TO_TEST) {
    const startTime = Date.now()
    try {
      const response = await fetch(`${BASE_URL}${test.endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${test.token}`
        }
      })
      const duration = Date.now() - startTime
      const isOk = response.status >= 200 && response.status < 300

      if (isOk) {
        passed++
        console.log(` ✅ PASS [${response.status}] ${test.name.padEnd(35)} (${duration}ms) -> ${test.endpoint}`)
      } else {
        failed++
        const text = await response.text()
        console.log(` ❌ FAIL [${response.status}] ${test.name.padEnd(35)} (${duration}ms) -> ${test.endpoint} | ${text.slice(0, 80)}`)
      }
    } catch (err) {
      const duration = Date.now() - startTime
      failed++
      console.log(` ❌ FAIL [ERR] ${test.name.padEnd(35)} (${duration}ms) -> ${err.message}`)
    }
  }

  console.log('\n==================================================')
  console.log(`📊 TEST RESULTS: ${passed} PASSED, ${failed} FAILED (TOTAL ${ENDPOINTS_TO_TEST.length})`)
  console.log('==================================================')

  process.exit(0)
}

runCliTests().catch(err => {
  console.error('Test runner failed:', err)
  process.exit(1)
})
