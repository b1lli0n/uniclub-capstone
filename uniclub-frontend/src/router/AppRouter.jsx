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
import AdminDashboardPage from '../pages/admin/AdminDashboardPage'

import { CURRENT_USER } from '../data/mockData'

function ProtectedLayout({ pageId, activeItem = null, children }) {
  const navigate = useNavigate()
  const isAuthenticated = Boolean(localStorage.getItem('token'))


const handleLogout = async () => {
  try {
    await axios.post(
      'https://localhost:5000/api/auth/logout',
      {},
      { withCredentials: true }
    )
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
    else if (screen === 'club-ranking') navigate('/club-ranking')
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
    >
      {children}
    </HomeLayout>
  )
}

function ClubDetailRoute() {
  const { clubId } = useParams()
  const navigate = useNavigate()

  return (
    <ProtectedLayout pageId="club-detail" activeItem="clubs">
      <ClubDetailPage
        clubId={clubId}
        onBack={() => navigate('/clubs')}
      />
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