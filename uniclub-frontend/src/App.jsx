import { useState } from 'react'
import './App.css'
import './styles/layouts.css'
import './styles/pages.css'
import LoginPage from './pages/auth/LoginPage'
import HomeLayout from './layouts/HomeLayout'
import HomePage from './pages/home/HomePage'
import { CURRENT_USER } from './data/mockData'

function App() {
  const [view, setView] = useState('login')

  function handleLogin() {
    setView('home')
  }

  function handleLogout() {
    setView('login')
  }

  if (view === 'login') {
    return <LoginPage onLogin={handleLogin} />
  }

  return (
    <HomeLayout
      activeItem={null}
      pageId="home"
      currentUser={CURRENT_USER}
      onNavigate={() => {}}
      onLogout={handleLogout}
    >
      <HomePage
        onCreateClub={() => {}}
        onSelectClub={() => {}}
        onViewAll={() => {}}
      />
    </HomeLayout>
  )
}

export default App