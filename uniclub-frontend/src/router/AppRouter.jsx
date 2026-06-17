import { Routes, Route, Navigate } from 'react-router-dom'

import LoginPage from '../pages/auth/LoginPage'
import AuthCallbackPage from '../pages/auth/AuthCallbackPage'

import HomeLayout from '../layouts/HomeLayout'
import HomePage from '../pages/home/HomePage'

import MyProfilePage from '../pages/home/MyProfilePage'

// import { CURRENT_USER } from '../data/mockData'

function AppRouter() {
  const isAuthenticated = Boolean(localStorage.getItem('token'))

  const handleLogout = () => {
    localStorage.removeItem('token')
    // console.log('Token removed from localStorage', localStorage.getItem('token'))
    window.location.href = '/login'
  }

  return (
    <Routes>
      <Route
        path="/login"
        element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />
        }
      />

      <Route
        path="/"
        element={
          isAuthenticated ? (
            <HomeLayout
              activeItem={null}
              pageId="home"
              currentUser={null}
              onNavigate={() => {}}
              onLogout={handleLogout}
            >
              <HomePage
                onCreateClub={() => {}}
                onSelectClub={() => {}}
                onViewAll={() => {}}
              />
              
            </HomeLayout>
          ) : (
            <Navigate to="/login" replace />
          )
        }
      />

      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      <Route path="/profile" element={<MyProfilePage currentUser={null} />} />
      
      <Route path="*" element={<Navigate to="/" replace />} />

    </Routes>
  )
}

export default AppRouter