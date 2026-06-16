import { useState } from 'react'
import './App.css'
import './styles/layouts.css'
import './styles/pages.css'
import LoginPage from './pages/auth/LoginPage'
import HomeLayout from './layouts/HomeLayout'
import HomePage from './pages/home/HomePage'
import MyProfilePage from './pages/home/MyProfilePage'
import CreateClubPage from './pages/home/CreateClubPage'
import ClubsPage from './pages/home/ClubsPage'
import { CURRENT_USER } from './data/mockData'

function App() {
  const [view, setView] = useState('login')

  function handleLogin() {
    setView('home')
  }

  function handleLogout() {
    setView('login')
  }

  function handleNavigate(screen) {
    if (screen === 'profile') {
      setView('profile')
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

    if (view === 'create-club') {
      return (
        <CreateClubPage
          onCancel={() => setView('home')}
          onSubmit={() => setView('home')}
        />
      )
    }

    if (view === 'clubs') {
      return <ClubsPage onSelectClub={() => {}} />
    }

    return (
      <HomePage
        onCreateClub={() => setView('create-club')}
        onSelectClub={() => {}}
        onViewAll={() => setView('clubs')}
      />
    )
  }

  if (view === 'login') {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <HomeLayout
      activeItem={view === 'clubs' ? 'clubs' : null}
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