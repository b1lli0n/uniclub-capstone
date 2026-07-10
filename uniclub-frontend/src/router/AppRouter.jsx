import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { useEffect, useState } from 'react'

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
import MyEventsPage from '../pages/home/MyEventsPage'
import ClubDetailPage from '../pages/home/ClubDetailPage'
import ClubEventsPage from '../pages/home/ClubEventsPage'
import ClubEventManagementPage from '../pages/home/ClubEventManagementPage'
import ClubRankingPage from '../pages/home/ClubRankingPage'
import ClubJoinRequestsPage from '../pages/home/ClubJoinRequestsPage'
import ClubJoinFormPage from '../pages/home/ClubJoinFormPage'
import ClubAttendancePage from '../pages/home/ClubAttendancePage'
import ClubPointRulesPage from '../pages/home/ClubPointRulesPage'
import ClubRewardsPage from '../pages/home/ClubRewardsPage'

import AdminDashboardPage from '../pages/admin/AdminDashboardPage'
import { getMyProfile } from '../api/profile.api'
import { getMyClubs } from '../api/memberClubMembership.api'

function ProtectedLayout({
  pageId,
  activeItem = null,
  clubId = null,
  children,
}) {
  const navigate = useNavigate()
  const isAuthenticated = Boolean(localStorage.getItem('token'))

  const [currentUser, setCurrentUser] = useState({
    fullName: 'Loading...',
    email: '',
    avatarUrl: '',
    avatarInitial: 'U',
  })

  const [canManageMembers, setCanManageMembers] = useState(false)
  const [canManageEvents, setCanManageEvents] = useState(false)

  useEffect(() => {
    if (!isAuthenticated) return

    let active = true

    async function loadData() {
      try {
        const profileRes = await getMyProfile()
        if (!active) return

        const user = profileRes.data.user

        setCurrentUser({
          id: user._id,
          fullName: user.full_name || '',
          email: user.email || '',
          avatarUrl: user.avatar_url || '',
          avatarInitial: user.full_name?.slice(0, 1).toUpperCase() || 'U',
        })

        if (!clubId) {
          setCanManageMembers(false)
          setCanManageEvents(false)
          return
        }

        const myClubsRes = await getMyClubs()
        if (!active) return

        const membership = (myClubsRes.data || []).find((item) => {
          const id = item.club_id?._id || item.club_id
          return String(id) === String(clubId)
        })

        const isPresident = membership?.role === 'president'
        const isEventManager = membership?.role === 'event_manager'

        setCanManageMembers(isPresident)
        setCanManageEvents(isPresident || isEventManager)
      } catch (error) {
        console.error('Failed to load layout data:', error)
      }
    }

    loadData()

    return () => {
      active = false
    }
  }, [isAuthenticated, clubId])

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout', {}, { withCredentials: true })
    } catch (error) {
      console.error(error)
    }

    localStorage.removeItem('token')
    sessionStorage.clear()
    navigate('/login', { replace: true })
  }

  const handleNavigate = (screen) => {
    if (screen === 'profile') navigate('/profile')
    else if (screen === 'requests') navigate('/my-requests')
    else if (screen === 'my-clubs') navigate('/my-clubs')
    else if (screen === 'create-club') navigate('/create-club')
    else if (screen === 'clubs') navigate('/clubs')
    else if (screen === 'events') navigate('/events')
    else if (screen === 'club-detail') {
      navigate(clubId ? `/clubs/${clubId}` : '/clubs')
    } else if (screen === 'club-ranking') {
      navigate(clubId ? `/clubs/${clubId}/ranking` : '/club-ranking')
    } else if (screen === 'point-rules' && clubId) {
      navigate(`/clubs/${clubId}/point-rules`)
    } else if (screen === 'rewards' && clubId) {
      navigate(`/clubs/${clubId}/rewards`)
    } else if (screen === 'member-approval' && clubId) {
      navigate(`/clubs/${clubId}/join-requests`)
    } else if (screen === 'join-form' && clubId) {
      navigate(`/clubs/${clubId}/join-form`)
    } else if (screen === 'manage-events' && clubId) {
      navigate(`/clubs/${clubId}/manage-events`)
    } else if (screen === 'attendance' && clubId) {
      navigate(`/clubs/${clubId}/attendance`)
    } else {
      navigate('/')
    }
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
    >
      {children}
    </HomeLayout>
  )
}

function ClubDetailRoute() {
  const { clubId } = useParams()
  const navigate = useNavigate()

  return (
    <ProtectedLayout pageId="club-detail" activeItem="clubs" clubId={clubId}>
      <ClubDetailPage
        key={clubId}
        clubId={clubId}
        onBack={() => navigate('/clubs')}
      />
    </ProtectedLayout>
  )
}

function ClubRankingRoute() {
  const { clubId } = useParams()

  return (
    <ProtectedLayout pageId="club-ranking" activeItem="clubs" clubId={clubId}>
      <ClubRankingPage clubId={clubId} />
    </ProtectedLayout>
  )
}

function ClubJoinRequestsRoute() {
  const { clubId } = useParams()

  return (
    <ProtectedLayout pageId="member-approval" activeItem="clubs" clubId={clubId}>
      <ClubJoinRequestsPage clubId={clubId} />
    </ProtectedLayout>
  )
}

function ClubJoinFormRoute() {
  const { clubId } = useParams()

  return (
    <ProtectedLayout pageId="join-form" activeItem="clubs" clubId={clubId}>
      <ClubJoinFormPage clubId={clubId} />
    </ProtectedLayout>
  )
}

function ClubEventsRoute() {
  const { clubId } = useParams()

  return (
    <ProtectedLayout pageId="club-events" activeItem="clubs" clubId={clubId}>
      <ClubEventsPage />
    </ProtectedLayout>
  )
}

function ClubEventManagementRoute() {
  const { clubId } = useParams()

  return (
    <ProtectedLayout pageId="manage-events" activeItem="clubs" clubId={clubId}>
      <ClubEventManagementPage clubId={clubId} />
    </ProtectedLayout>
  )
}

function ClubAttendanceRoute() {
  const { clubId } = useParams()

  return (
    <ProtectedLayout pageId="attendance" activeItem="clubs" clubId={clubId}>
      <ClubAttendancePage clubId={clubId} />
    </ProtectedLayout>
  )
}

function ClubPointRulesRoute() {
  const { clubId } = useParams()

  return (
    <ProtectedLayout pageId="point-rules" activeItem="clubs" clubId={clubId}>
      <ClubPointRulesPage clubId={clubId} />
    </ProtectedLayout>
  )
}

function ClubRewardsRoute() {
  const { clubId } = useParams()

  return (
    <ProtectedLayout pageId="rewards" activeItem="clubs" clubId={clubId}>
      <ClubRewardsPage />
    </ProtectedLayout>
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
              onSelectEvent={(eventId) => navigate(`/events/${eventId}`)}
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
            <MyProfilePage />
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
        path="/my-events"
        element={
          <ProtectedLayout pageId="my-events" activeItem="events">
            <MyEventsPage />
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
          <ProtectedLayout pageId="event-detail" activeItem="clubs">
            <EventDetailPage />
          </ProtectedLayout>
        }
      />

      <Route path="/clubs/:clubId/point-rules" element={<ClubPointRulesRoute />} />
      <Route path="/clubs/:clubId/rewards" element={<ClubRewardsRoute />} />
      <Route path="/clubs/:clubId/ranking" element={<ClubRankingRoute />} />
      <Route path="/clubs/:clubId/join-requests" element={<ClubJoinRequestsRoute />} />
      <Route path="/clubs/:clubId/join-form" element={<ClubJoinFormRoute />} />
      <Route path="/clubs/:clubId/manage-events" element={<ClubEventManagementRoute />} />
      <Route path="/clubs/:clubId/attendance" element={<ClubAttendanceRoute />} />
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