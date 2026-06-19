import { useState } from 'react'
import { HomeLayout } from '../../layouts'
import ClubDetailScreen from './ClubDetailScreen'
import ClubRankingScreen from './ClubRankingScreen'
import ClubsScreen from './ClubsScreen'
import CreateClubScreen from './CreateClubScreen'
import EventsScreen from './EventsScreen'
import HomeMainScreen from './HomeMainScreen'
import MyClubsScreen from './MyClubsScreen'
import MyProfileScreen from './MyProfileScreen'
import MyRequestsScreen from './MyRequestsScreen'
// Mock data import: replace with API data when BE is ready.
import { CURRENT_USER } from '../../data/mockData'

const HOME_SCREEN = {
  MAIN: 'home',
  CLUBS: 'clubs',
  EVENTS: 'events',
  CREATE_CLUB: 'create-club',
  CLUB_DETAIL: 'club-detail',
  CLUB_RANKING: 'club-ranking',
  MY_CLUBS: 'my-clubs',
  PROFILE: 'profile',
  REQUESTS: 'requests',
}

function HomeShellScreen({ onLogout }) {
  const [activeScreen, setActiveScreen] = useState(HOME_SCREEN.MAIN)
  const [selectedClubId, setSelectedClubId] = useState(null)
  const [detailBackScreen, setDetailBackScreen] = useState(HOME_SCREEN.MAIN)
  const currentUser = CURRENT_USER

  const activeItem =
    activeScreen === HOME_SCREEN.CLUBS ||
    activeScreen === HOME_SCREEN.CLUB_DETAIL ||
    activeScreen === HOME_SCREEN.CLUB_RANKING ||
    activeScreen === HOME_SCREEN.MY_CLUBS
      ? HOME_SCREEN.CLUBS
      : activeScreen === HOME_SCREEN.EVENTS
        ? HOME_SCREEN.EVENTS
      : null

  function openScreen(screen) {
    setActiveScreen(screen || HOME_SCREEN.MAIN)
  }

  function openClubDetail(clubId) {
    setSelectedClubId(clubId)
    setDetailBackScreen(activeScreen)
    setActiveScreen(HOME_SCREEN.CLUB_DETAIL)
  }

  function closeCreateClubScreen() {
    setActiveScreen(HOME_SCREEN.MAIN)
  }

  function renderScreen() {
    if (activeScreen === HOME_SCREEN.CLUBS) return <ClubsScreen onSelectClub={openClubDetail} />
    if (activeScreen === HOME_SCREEN.MY_CLUBS) return <MyClubsScreen onSelectClub={openClubDetail} />
    if (activeScreen === HOME_SCREEN.EVENTS) return <EventsScreen />
    if (activeScreen === HOME_SCREEN.PROFILE) return <MyProfileScreen currentUser={currentUser} />
    if (activeScreen === HOME_SCREEN.REQUESTS) return <MyRequestsScreen />
    if (activeScreen === HOME_SCREEN.CLUB_DETAIL) {
      return (
        <ClubDetailScreen
          clubId={selectedClubId}
          onBack={() => openScreen(detailBackScreen)}
        />
      )
    }
    if (activeScreen === HOME_SCREEN.CLUB_RANKING) {
      return <ClubRankingScreen clubId={selectedClubId} />
    }
    if (activeScreen === HOME_SCREEN.CREATE_CLUB) {
      return (
        <CreateClubScreen
          onCancel={closeCreateClubScreen}
          onSubmit={closeCreateClubScreen}
        />
      )
    }

    return (
      <HomeMainScreen
        onCreateClub={() => openScreen(HOME_SCREEN.CREATE_CLUB)}
        onSelectClub={openClubDetail}
        onViewAll={openScreen}
      />
    )
  }

  return (
    <HomeLayout
      activeItem={activeItem}
      pageId={activeScreen}
      onNavigate={openScreen}
      onLogout={onLogout}
      currentUser={currentUser}
    >
      {renderScreen()}
    </HomeLayout>
  )
}

export default HomeShellScreen
