import { useState } from 'react'
import './App.css'
import './styles/layouts.css'
import './styles/pages.css'
import LoginPage from './pages/auth/LoginPage'
import HomeLayout from './layouts/HomeLayout'
import HomePage from './pages/home/HomePage'
import MyProfilePage from './pages/home/MyProfilePage'
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

    if (screen === 'home') {
      setView('home')
      return
    }

    setView('home')
  }

  if (view === 'login') {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <HomeLayout
      activeItem={null}
      pageId={view}
      currentUser={CURRENT_USER}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {view === 'profile' ? (
        <MyProfilePage currentUser={CURRENT_USER} />
      ) : (
        <HomePage
          onCreateClub={() => {}}
          onSelectClub={() => {}}
          onViewAll={() => {}}
        />
      )}
    </HomeLayout>
  )
}

export default App