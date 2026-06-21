import BaseHomeCarousel from '../../components/home/HomeCarousel'
import heroGroupImage from '../../assets/hero-group.png'
// Mock data import: replace with API data when BE is ready.
import { HOME_CLUB_ITEMS, HOME_EVENT_ITEMS } from '../../data/mockData'
import '../../styles/home.css'

const HOME_CLUB_DETAIL_MAP = {
  'club-creative': 'startup',
  'club-music': 'music',
  'club-code': 'coding',
  'club-sport': 'football',
  'club-book': 'chess',
  'club-culture': 'community',
}

function HomePage({ onCreateClub, onSelectClub, onViewAll }) {
  function handleSelectClubItem(item) {
    onSelectClub?.(HOME_CLUB_DETAIL_MAP[item.id] || item.id)
  }

  return (
    <div className="home-page">
      <div className="home-body">
        <section className="home-hero">
          <div className="home-hero__content">
            <p className="home-hero__eyebrow">Welcome to UniClub</p>
            <h1 className="home-hero__title">Discover clubs, events, and student connections</h1>
            <p className="home-hero__desc">
              Find the right club, join meaningful events, and build valuable connections for your university journey.
            </p>
            <div className="home-hero__actions">
              <button
                type="button"
                className="home-btn home-btn--solid"
                onClick={onCreateClub}
              >
                Create Club
              </button>
            </div>
          </div>
          <div className="home-hero__art">
            <img
              src={heroGroupImage}
              alt="Nhóm sinh viên UniClub"
              className="home-hero__img"
            />
          </div>
        </section>

        <BaseHomeCarousel
          title="Clubs"
          items={HOME_CLUB_ITEMS}
          onSelectItem={handleSelectClubItem}
          onViewAll={() => onViewAll?.('clubs')}
        />
        <BaseHomeCarousel
          title="Events"
          items={HOME_EVENT_ITEMS}
          onViewAll={() => onViewAll?.('events')}
        />
      </div>
    </div>
  )
}

export default HomePage
