import { useState, useEffect } from 'react'
import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom'

import LoginPage from '../pages/auth/LoginPage'
import AuthCallbackPage from '../pages/auth/AuthCallbackPage'

import HomeLayout from '../layouts/HomeLayout'
import HomePage from '../pages/home/HomePage'
import MyProfilePage from '../pages/home/MyProfilePage'
import MyRequestsPage from '../pages/home/MyRequestsPage'
import MyClubsPage from '../pages/home/MyClubsPage'
import CreateClubPage from '../pages/home/CreateClubPage'
import ClubsPage from '../pages/home/ClubsPage'
import EventsPage from '../pages/home/EventsPage'
import EventDetailPage from '../pages/home/EventDetailPage'
import ClubDetailPage from '../pages/home/ClubDetailPage'
import ClubEventsPage from '../pages/home/ClubEventsPage'
import ClubEventManagementPage from '../pages/home/ClubEventManagementPage'
import ClubRankingPage from '../pages/home/ClubRankingPage'
import ClubJoinRequestsPage from '../pages/home/ClubJoinRequestsPage'
import ClubJoinFormPage from '../pages/home/ClubJoinFormPage'
import ClubAttendancePage from '../pages/home/ClubAttendancePage'
import ClubPointRulesPage from '../pages/home/ClubPointRulesPage'
import ClubRewardsPage from '../pages/home/ClubRewardsPage'
import ActivitySchedulePage from '../pages/home/ActivitySchedulePage'
import MyEventsPage from '../pages/home/MyEventsPage'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import ClubFeesPage from '../pages/home/ClubFeesPage'
import ClubReceiptDetailPage from '../pages/home/ClubReceiptDetailPage'
import PaymentReturnPage from '../pages/auth/PaymentReturnPage'


import { CURRENT_USER, MY_CLUB_MEMBERSHIPS } from '../data/mockData'
import { getMyProfile } from '../api/profile.api'
import { getMyClubs } from '../api/memberClubMembership.api'


function getMembership(clubId) {
  return MY_CLUB_MEMBERSHIPS.find((item) => item.clubId === clubId)
}

function canManageClubMembers(clubId) {
  return getMembership(clubId)?.role?.toLowerCase() === 'leader'
}

function canManageClubEvents(clubId) {
  const role = getMembership(clubId)?.role?.toLowerCase()
  return role === 'leader' || role === 'event management'
}

function isClubMember(clubId) {
  return MY_CLUB_MEMBERSHIPS.some((item) => item.clubId === clubId)
}

function canManageClubRewards(clubId) {
  const role = getMembership(clubId)?.role?.toLowerCase()
  return role === 'leader' || role === 'vice leader'
}

function canManageActivitySchedule(clubId) {
  return getMembership(clubId)?.role?.toLowerCase() === 'secretary'
}

function ProtectedLayout({
  pageId,
  activeItem = null,
  clubId = null,
  canManageMembers = false,
  canManageEvents = false,
  canManageSchedule = false,
  canViewFees = false,
  children,
}) {
  const navigate = useNavigate()
  const isAuthenticated = Boolean(localStorage.getItem('token'))
  const [currentUser, setCurrentUser] = useState(CURRENT_USER)

  useEffect(() => {
    let active = true
    async function loadUser() {
      try {
        const res = await getMyProfile()
        if (active) {
          const user = res.data.user
          setCurrentUser({
            id: user._id,
            fullName: user.full_name || '',
            email: user.email || '',
            avatarUrl: user.avatar_url || '',
            avatarInitial: user.full_name?.slice(0, 1).toUpperCase() || 'U',
            role: user.role || 'UniClub member',
          })
        }
      } catch (err) {
        console.error("Failed to load user profile in ProtectedLayout:", err)
      }
    }
    if (isAuthenticated) {
      loadUser()
    }
    return () => { active = false }
  }, [isAuthenticated])

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi UniClub không?')) {
      localStorage.removeItem('token')
      navigate('/login', { replace: true })
    }
  }

  const handleNavigate = (screen) => {
    if (screen === 'profile') navigate('/profile')
    else if (screen === 'requests') navigate('/my-requests')
    else if (screen === 'my-clubs') navigate('/my-clubs')
    else if (screen === 'create-club') navigate('/create-club')
    else if (screen === 'clubs') navigate('/clubs')
    else if (screen === 'events') navigate('/events')
    else if (screen === 'club-detail') navigate(clubId ? `/clubs/${clubId}` : '/clubs')
    else if (screen === 'club-ranking') navigate(clubId ? `/clubs/${clubId}/ranking` : '/club-ranking')
    else if (screen === 'point-rules' && clubId) navigate(`/clubs/${clubId}/point-rules`)
    else if (screen === 'rewards' && clubId) navigate(`/clubs/${clubId}/rewards`)
    else if (screen === 'activity-schedule' && clubId) navigate(`/clubs/${clubId}/activity-schedule`)
    else if (screen === 'manage-activity-schedule' && clubId) {
      navigate(`/clubs/${clubId}/manage-activity-schedule`)
    }
    else if (screen === 'member-approval' && clubId) navigate(`/clubs/${clubId}/join-requests`)
    else if (screen === 'join-form' && clubId) navigate(`/clubs/${clubId}/join-form`)
    else if (screen === 'manage-events' && clubId) navigate(`/clubs/${clubId}/manage-events`)
    else if (screen === 'attendance' && clubId) navigate(`/clubs/${clubId}/attendance`)
    else if (screen === 'fees' && clubId) navigate(`/clubs/${clubId}/fees`)
    else navigate('/')

  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <HomeLayout
      activeItem={activeItem}
      pageId={pageId}
      currentUser={currentUser}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      canManageMembers={canManageMembers}
      canManageEvents={canManageEvents}
      canManageSchedule={canManageSchedule}
      canViewFees={canViewFees}
    >
      {children}
    </HomeLayout>
  )
}

function ClubRoute({ pageId, guard = 'member', children }) {
  const { clubId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [membership, setMembership] = useState(null)

  useEffect(() => {
    let active = true
    async function checkAccess() {
      try {
        const res = await getMyClubs()
        if (!active) return
        const list = res.data || []
        
        // Find membership matching clubId (supporting both string or populated object)
        const found = list.find(item => {
          const id = item.club_id?._id || item.club_id
          return String(id) === String(clubId)
        })

        if (found) {
          setMembership({
            clubId,
            role: found.role,
            joinedDate: found.joined_at || found.joinedDate || ''
          })
        } else {
          // Fallback to mock data if not found in backend response (for mock compatibility)
          const mockFound = MY_CLUB_MEMBERSHIPS.find(item => String(item.clubId) === String(clubId))
          if (mockFound) {
            setMembership(mockFound)
          }
        }
      } catch (err) {
        console.error("Failed to fetch clubs membership:", err)
        // Fallback to mock data on error
        const mockFound = MY_CLUB_MEMBERSHIPS.find(item => String(item.clubId) === String(clubId))
        if (mockFound && active) {
          setMembership(mockFound)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    checkAccess()
    return () => { active = false }
  }, [clubId])

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
        <p>Đang xác thực quyền truy cập...</p>
      </div>
    )
  }

  // Calculate permissions based on dynamic membership
  const role = membership?.role?.toLowerCase()
  const isMember = Boolean(membership)
  
  // Back-end roles: president, secretary, event_manager, treasurer, member
  // Front-end mock roles: leader, vice leader, event management, secretary, member
  const canManageMembers = role === 'president' || role === 'leader'
  const canManageEvents = role === 'president' || role === 'leader' || role === 'event_manager' || role === 'event management'
  const canManageSchedule = role === 'secretary'
  const canViewFees = isMember

  const isAllowed =
    guard === 'member'
      ? canViewFees
      : guard === 'leader'
        ? canManageMembers
        : guard === 'event-manager'
          ? canManageEvents
          : guard === 'secretary'
            ? canManageSchedule
            : true

  if (!isAllowed) {
    return <Navigate to={`/clubs/${clubId}`} replace />
  }

  return (
    <ProtectedLayout
      pageId={pageId}
      activeItem="clubs"
      clubId={clubId}
      canManageMembers={canManageMembers}
      canManageEvents={canManageEvents}
      canManageSchedule={canManageSchedule}
      canViewFees={canViewFees}
    >
      {children({
        clubId,
        membership,
        navigate,
        canManageRewards: role === 'president' || role === 'leader' || role === 'vice leader',
        canManageSchedule,
      })}
    </ProtectedLayout>
  )
}


function ClubDetailRoute() {
  return (
    <ClubRoute pageId="club-detail" guard="none">
      {({ clubId, navigate }) => (
        <ClubDetailPage
          key={clubId}
          clubId={clubId}
          onBack={() => navigate('/clubs')}
        />
      )}
    </ClubRoute>
  )
}

function ClubRankingRoute() {
  return (
    <ClubRoute pageId="club-ranking" guard="member">
      {({ clubId }) => <ClubRankingPage clubId={clubId} />}
    </ClubRoute>
  )
}

function ClubJoinRequestsRoute() {
  return (
    <ClubRoute pageId="member-approval" guard="leader">
      {({ clubId }) => <ClubJoinRequestsPage clubId={clubId} />}
    </ClubRoute>
  )
}

function ClubJoinFormRoute() {
  return (
    <ClubRoute pageId="join-form" guard="leader">
      {({ clubId }) => <ClubJoinFormPage clubId={clubId} />}
    </ClubRoute>
  )
}

function ClubEventsRoute() {
  return (
    <ClubRoute pageId="club-events" guard="member">
      {() => <ClubEventsPage />}
    </ClubRoute>
  )
}

function ClubEventManagementRoute() {
  return (
    <ClubRoute pageId="manage-events" guard="event-manager">
      {({ clubId }) => <ClubEventManagementPage clubId={clubId} />}
    </ClubRoute>
  )
}

function ClubAttendanceRoute() {
  return (
    <ClubRoute pageId="attendance" guard="event-manager">
      {({ clubId }) => <ClubAttendancePage clubId={clubId} />}
    </ClubRoute>
  )
}

function ClubPointRulesRoute() {
  return (
    <ClubRoute pageId="point-rules" guard="member">
      {({ clubId, canManageRewards }) => (
        <ClubPointRulesPage clubId={clubId} isLeader={canManageRewards} />
      )}
    </ClubRoute>
  )
}

function ClubRewardsRoute() {
  return (
    <ClubRoute pageId="rewards" guard="member">
      {({ canManageRewards }) => (
        <ClubRewardsPage isManager={canManageRewards} />
      )}
    </ClubRoute>
  )
}

function ClubActivityScheduleRoute() {
  return (
    <ClubRoute pageId="activity-schedule" guard="member">
      {({ clubId }) => (
        <ActivitySchedulePage clubId={clubId} isSecretary={false} />
      )}
    </ClubRoute>
  )
}

function ClubManageActivityScheduleRoute() {
  return (
    <ClubRoute pageId="manage-activity-schedule" guard="secretary">
      {({ clubId }) => (
        <ActivitySchedulePage clubId={clubId} isSecretary />
      )}
    </ClubRoute>
  )
}

function ClubFeesRoute() {
  return (
    <ClubRoute pageId="fees" guard="member">
      {({ clubId }) => <ClubFeesPage clubId={clubId} />}
    </ClubRoute>
  )
}

function ClubReceiptRoute() {
  return (
    <ClubRoute pageId="fees" guard="member">
      {({ clubId }) => <ClubReceiptDetailPage clubId={clubId} />}
    </ClubRoute>
  )
}


function AppRouter() {
  const isAuthenticated = Boolean(localStorage.getItem('token'))
  const navigate = useNavigate()

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
        }
      />

      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      <Route
        path="/"
        element={
          <ProtectedLayout pageId="home">
            <HomePage
              onCreateClub={() => navigate('/create-club')}
              onSelectClub={(clubId) => navigate(`/clubs/${clubId}`)}
              onViewAll={(target) =>
                navigate(target === 'events' ? '/events' : '/clubs')
              }
            />
          </ProtectedLayout>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedLayout pageId="profile">
            <MyProfilePage currentUser={CURRENT_USER} />
          </ProtectedLayout>
        }
      />

      <Route
        path="/my-events"
        element={
          <ProtectedLayout pageId="my-events" activeItem="events">
            <MyEventsPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/my-requests"
        element={
          <ProtectedLayout pageId="requests">
            <MyRequestsPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/my-clubs"
        element={
          <ProtectedLayout pageId="my-clubs" activeItem="clubs">
            <MyClubsPage
              onSelectClub={(clubId) => navigate(`/clubs/${clubId}`)}
            />
          </ProtectedLayout>
        }
      />

      <Route
        path="/create-club"
        element={
          <ProtectedLayout pageId="create-club">
            <CreateClubPage
              onCancel={() => navigate('/')}
              onSubmit={() => navigate('/')}
            />
          </ProtectedLayout>
        }
      />

      <Route
        path="/clubs"
        element={
          <ProtectedLayout pageId="clubs" activeItem="clubs">
            <ClubsPage
              onSelectClub={(clubId) => navigate(`/clubs/${clubId}`)}
            />
          </ProtectedLayout>
        }
      />

      <Route
        path="/events"
        element={
          <ProtectedLayout pageId="events" activeItem="events">
            <EventsPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/events/:eventId"
        element={
          <ProtectedLayout pageId="event-detail" activeItem="events">
            <EventDetailPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/clubs/:clubId/events/:eventId"
        element={
          <ClubRoute pageId="event-detail" guard="member">
            {() => <EventDetailPage />}
          </ClubRoute>
        }
      />

      <Route path="/payment/return" element={<PaymentReturnPage />} />
      <Route path="/clubs/:clubId/fees" element={<ClubFeesRoute />} />
      <Route path="/clubs/:clubId/receipts/:receiptId" element={<ClubReceiptRoute />} />
      <Route
        path="/clubs/my-fees/receipts/:receiptId"
        element={
          <ProtectedLayout pageId="fees" activeItem="clubs">
            <ClubReceiptDetailPage />
          </ProtectedLayout>
        }
      />
      <Route path="/clubs/:clubId/ranking" element={<ClubRankingRoute />} />
      <Route path="/clubs/:clubId/join-requests" element={<ClubJoinRequestsRoute />} />
      <Route path="/clubs/:clubId/join-form" element={<ClubJoinFormRoute />} />
      <Route path="/clubs/:clubId/manage-events" element={<ClubEventManagementRoute />} />
      <Route path="/clubs/:clubId/attendance" element={<ClubAttendanceRoute />} />
      <Route path="/clubs/:clubId/point-rules" element={<ClubPointRulesRoute />} />
      <Route path="/clubs/:clubId/rewards" element={<ClubRewardsRoute />} />
      <Route path="/clubs/:clubId/activity-schedule" element={<ClubActivityScheduleRoute />} />
      <Route path="/clubs/:clubId/manage-activity-schedule" element={<ClubManageActivityScheduleRoute />}/>
      <Route path="/clubs/:clubId/events" element={<ClubEventsRoute />} />
      <Route path="/clubs/:clubId" element={<ClubDetailRoute />} />


      <Route
        path="/club-ranking"
        element={
          <ProtectedLayout pageId="club-ranking" activeItem="clubs">
            <ClubRankingPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/admin"
        element={
          <AdminDashboardPage
            onLogout={() => {
              if (window.confirm('Bạn có chắc chắn muốn đăng xuất khỏi hệ thống Admin không?')) {
                localStorage.removeItem('token')
                navigate('/login', { replace: true })
              }
            }}
          />
        }
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter