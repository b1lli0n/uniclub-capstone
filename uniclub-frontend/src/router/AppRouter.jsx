import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import LoginPage from '../pages/auth/LoginPage'
import AuthCallbackPage from '../pages/auth/AuthCallbackPage'

import HomeLayout from '../layouts/HomeLayout'
import HomePage from '../pages/home/HomePage'
import MyProfilePage from '../pages/home/MyProfilePage'
import MyRequestsPage from '../pages/home/MyRequestsPage'
import MyClubsPage from '../pages/home/MyClubsPage'
import CreateClubPage from '../pages/home/CreateClubPage'
import ClubsPage from '../pages/home/ClubsPage'
import ClubDetailPage from '../pages/home/ClubDetailPage'
import ClubRankingPage from '../pages/home/ClubRankingPage'
import ClubJoinRequestsPage from '../pages/home/ClubJoinRequestsPage'
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'

import { useEffect, useState } from 'react'
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

        if (clubId) {
          const myClubsRes = await getMyClubs()
          if (!active) return
          const membership = (myClubsRes.data || []).find((item) => {
            const id = item.club_id?._id || item.club_id
            return String(id) === String(clubId)
          })
          setCanManageMembers(membership?.role === 'president')
        } else {
          setCanManageMembers(false)
        }
      } catch (err) {
        console.error("Failed to load layout data:", err)
      }
    }
    loadData()
    return () => { active = false }
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
    else if (screen === 'club-detail') navigate(clubId ? `/clubs/${clubId}` : '/clubs')
    else if (screen === 'club-ranking') navigate(clubId ? `/clubs/${clubId}/ranking` : '/club-ranking')
    else if (screen === 'member-approval' && clubId) navigate(`/clubs/${clubId}/join-requests`)
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
    >
      {children}
    </HomeLayout>
  )
}

function ClubDetailRoute() {
  const { clubId } = useParams()
  const navigate = useNavigate()

  return (
    <ProtectedLayout
      pageId="club-detail"
      activeItem="clubs"
      clubId={clubId}
    >
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
    <ProtectedLayout
      pageId="club-ranking"
      activeItem="clubs"
      clubId={clubId}
    >
      <ClubRankingPage clubId={clubId} />
    </ProtectedLayout>
  )
}

function ClubJoinRequestsRoute() {
  const { clubId } = useParams()

  return (
    <ProtectedLayout
      pageId="member-approval"
      activeItem="clubs"
      clubId={clubId}
    >
      <ClubJoinRequestsPage clubId={clubId} />
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
              onViewAll={() => navigate('/clubs')}
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

      <Route path="/clubs/:clubId/ranking" element={<ClubRankingRoute />} />
      <Route path="/clubs/:clubId/join-requests" element={<ClubJoinRequestsRoute />} />
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
