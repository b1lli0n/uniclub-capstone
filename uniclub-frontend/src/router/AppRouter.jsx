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
import ClubInvitationsPage from '../pages/home/ClubInvitationsPage'
import ClubPollsPage from '../pages/home/ClubPollsPage'
import ClubFinancePage from '../pages/home/ClubFinancePage'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'

import { CURRENT_USER, MY_CLUB_MEMBERSHIPS } from '../data/mockData'

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

function canManageClubPolls(clubId) {
  const role = getMembership(clubId)?.role?.toLowerCase()
  return role === 'secretary'
}

function canManageClubFinance(clubId) {
  return getMembership(clubId)?.role?.toLowerCase() === 'treasurer'
}

function ProtectedLayout({
  pageId,
  activeItem = null,
  clubId = null,
  canManageMembers = false,
  canManageEvents = false,
  canViewFees = false,
  canManagePolls = false,
  canManageFinance = false,
  children,
}) {
  const navigate = useNavigate()
  const isAuthenticated = Boolean(localStorage.getItem('token'))

  const handleLogout = () => {
    localStorage.removeItem('token')
    navigate('/login', { replace: true })
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
    else if (screen === 'member-approval' && clubId) navigate(`/clubs/${clubId}/join-requests`)
    else if (screen === 'invitations' && clubId) navigate(`/clubs/${clubId}/invitations`)
    else if (screen === 'polls' && clubId) navigate(`/clubs/${clubId}/polls`)
    else if (screen === 'finance' && clubId) navigate(`/clubs/${clubId}/finance`)
    else if (screen === 'join-form' && clubId) navigate(`/clubs/${clubId}/join-form`)
    else if (screen === 'manage-events' && clubId) navigate(`/clubs/${clubId}/manage-events`)
    else if (screen === 'attendance' && clubId) navigate(`/clubs/${clubId}/attendance`)
    else navigate('/')
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <HomeLayout
      activeItem={activeItem}
      pageId={pageId}
      currentUser={CURRENT_USER}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      canManageMembers={canManageMembers}
      canManageEvents={canManageEvents}
      canViewFees={canViewFees}
      canManagePolls={canManagePolls}
      canManageFinance={canManageFinance}
    >
      {children}
    </HomeLayout>
  )
}

function ClubRoute({ pageId, guard = 'member', children }) {
  const { clubId } = useParams()
  const navigate = useNavigate()
  const membership = getMembership(clubId)
  const canManageMembers = canManageClubMembers(clubId)
  const canManageEvents = canManageClubEvents(clubId)
  const canViewFees = isClubMember(clubId)
  const canManagePolls = canManageClubPolls(clubId)
  const canManageFinance = canManageClubFinance(clubId)

  const isAllowed =
    guard === 'member'
      ? canViewFees
      : guard === 'leader'
        ? canManageMembers
        : guard === 'event-manager'
          ? canManageEvents
          : guard === 'secretary'
            ? canManagePolls
            : guard === 'treasurer'
              ? canManageFinance
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
      canViewFees={canViewFees}
      canManagePolls={canManagePolls}
      canManageFinance={canManageFinance}
    >
      {children({
        clubId,
        membership,
        navigate,
        canManageRewards: canManageClubRewards(clubId),
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

function ClubInvitationsRoute() {
  return (
    <ClubRoute pageId="invitations" guard="leader">
      {({ clubId }) => <ClubInvitationsPage clubId={clubId} />}
    </ClubRoute>
  )
}

function ClubPollsRoute() {
  return (
    <ClubRoute pageId="polls" guard="secretary">
      {({ clubId }) => <ClubPollsPage clubId={clubId} />}
    </ClubRoute>
  )
}

function ClubFinanceRoute() {
  return (
    <ClubRoute pageId="finance" guard="treasurer">
      {({ clubId }) => <ClubFinancePage clubId={clubId} />}
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
      {({ clubId }) => <ClubPointRulesPage clubId={clubId} />}
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
      {({ clubId, membership }) => (
        <ActivitySchedulePage
          clubId={clubId}
          userRole={membership?.role}
        />
      )}
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
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
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

      <Route path="/clubs/:clubId/ranking" element={<ClubRankingRoute />} />
      <Route path="/clubs/:clubId/join-requests" element={<ClubJoinRequestsRoute />} />
      <Route path="/clubs/:clubId/invitations" element={<ClubInvitationsRoute />} />
      <Route path="/clubs/:clubId/polls" element={<ClubPollsRoute />} />
      <Route path="/clubs/:clubId/finance" element={<ClubFinanceRoute />} />
      <Route path="/clubs/:clubId/join-form" element={<ClubJoinFormRoute />} />
      <Route path="/clubs/:clubId/manage-events" element={<ClubEventManagementRoute />} />
      <Route path="/clubs/:clubId/attendance" element={<ClubAttendanceRoute />} />
      <Route path="/clubs/:clubId/point-rules" element={<ClubPointRulesRoute />} />
      <Route path="/clubs/:clubId/rewards" element={<ClubRewardsRoute />} />
      <Route path="/clubs/:clubId/activity-schedule" element={<ClubActivityScheduleRoute />} />
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
        element={<AdminDashboardPage onLogout={() => navigate('/login')} />}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter
