import HomePage from '../../pages/home/HomePage'

function HomeMainScreen({ onCreateClub, onSelectClub, onSelectEvent, onViewAll }) {
  return (
    <HomePage
      onCreateClub={onCreateClub}
      onSelectClub={onSelectClub}
      onSelectEvent={onSelectEvent}
      onViewAll={onViewAll}
    />
  )
}

export default HomeMainScreen
