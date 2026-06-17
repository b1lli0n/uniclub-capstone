import { useState } from 'react'
import './App.css'
import './styles/layouts.css'
import './styles/pages.css'
import LoginPage from './pages/auth/LoginPage'
import HomeLayout from './layouts/HomeLayout'
import HomePage from './pages/home/HomePage'
import MyProfilePage from './pages/home/MyProfilePage'
import MyRequestsPage from './pages/home/MyRequestsPage'
import MyClubsPage from './pages/home/MyClubsPage'
import CreateClubPage from './pages/home/CreateClubPage'
import ClubsPage from './pages/home/ClubsPage'
import ClubDetailPage from './pages/home/ClubDetailPage'
import ClubRankingPage from './pages/home/ClubRankingPage'
import AdminDashboardPage from './pages/admin/AdminDashboardPage'
import { CURRENT_USER } from './data/mockData'

function App() {
  const [view, setView] = useState('login')
  const [selectedClubId, setSelectedClubId] = useState(null)
  const [detailBackView, setDetailBackView] = useState('home')

  const routePath = `${window.location.pathname}${window.location.hash}`.toLowerCase()
  const isAdminRoute =
    routePath === '/admin' ||
    routePath.startsWith('/admin/') ||
    routePath.includes('#/admin')

  function handleLogin() {
    setView('home')
  }

  function handleLogout() {
    setView('login')
    setSelectedClubId(null)
    setDetailBackView('home')
  }

  function handleAdminLogout() {
    window.history.pushState({}, '', '/')
    handleLogout()
  }

  function openClubDetail(clubId, backView = view) {
    setSelectedClubId(clubId)
    setDetailBackView(backView)
    setView('club-detail')
  }

  function handleNavigate(screen) {
    if (screen === 'profile') {
      setView('profile')
      return
    }

    if (screen === 'requests') {
      setView('requests')
      return
    }

    if (screen === 'my-clubs') {
      setView('my-clubs')
      return
    }

    if (screen === 'create-club') {
      setView('create-club')
      return
    }

    if (screen === 'clubs') {
      setView('clubs')
      return
    }

    if (screen === 'club-detail') {
      setView('club-detail')
      return
    }

    if (screen === 'club-ranking') {
      setView('club-ranking')
      return
    }

    if (screen === 'home') {
      setView('home')
      return
    }

    setView('home')
  }

  function renderContent() {
    if (view === 'profile') {
      return <MyProfilePage currentUser={CURRENT_USER} />
    }

    if (view === 'requests') {
      return <MyRequestsPage />
    }

    if (view === 'my-clubs') {
      return (
        <MyClubsPage
          onSelectClub={(clubId) => openClubDetail(clubId, 'my-clubs')}
        />
      )
    }

    if (view === 'create-club') {
      return (
        <CreateClubPage
          onCancel={() => setView('home')}
          onSubmit={() => setView('home')}
        />
      )
    }

    if (view === 'clubs') {
      return <ClubsPage onSelectClub={(clubId) => openClubDetail(clubId, 'clubs')} />
    }

    if (view === 'club-detail') {
      return (
        <ClubDetailPage
          clubId={selectedClubId}
          onBack={() => setView(detailBackView)}
        />
      )
    }

    if (view === 'club-ranking') {
      return <ClubRankingPage clubId={selectedClubId} />
    }

    return (
      <HomePage
        onCreateClub={() => setView('create-club')}
        onSelectClub={(clubId) => openClubDetail(clubId, 'home')}
        onViewAll={() => setView('clubs')}
      />
    )
  }

  if (isAdminRoute) {
    return <AdminDashboardPage onLogout={handleAdminLogout} />
  }

  if (view === 'login') {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <HomeLayout
      activeItem={
        view === 'clubs' ||
        view === 'my-clubs' ||
        view === 'club-detail' ||
        view === 'club-ranking'
          ? 'clubs'
          : null
      }
      pageId={view}
      currentUser={CURRENT_USER}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {renderContent()}
    </HomeLayout>
  )
}

export default App