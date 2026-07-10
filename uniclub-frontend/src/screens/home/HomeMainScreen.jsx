import HomePage from '../../pages/home/HomePage'

function HomeMainScreen({ onCreateClub, onSelectClub, onViewAll }) {
  return (
    <HomePage
      onCreateClub={onCreateClub}
      onSelectClub={onSelectClub}
      onViewAll={onViewAll}
    />
  )
}

export default HomeMainScreen
