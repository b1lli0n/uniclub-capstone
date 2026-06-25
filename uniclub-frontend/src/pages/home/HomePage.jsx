import { useEffect, useState } from 'react'
import BaseHomeCarousel from '../../components/home/HomeCarousel'
import heroGroupImage from '../../assets/hero-group.png'
import { getClubs } from '../../api/club.api'
import { getPublicEvents } from '../../api/event.api'
import { mapClubFromApi } from '../../api/clubMappers'
import '../../styles/home.css'

function HomePage({ onCreateClub, onSelectClub, onSelectEvent, onViewAll }) {
  const [clubs, setClubs] = useState([])
  const [loadingClubs, setLoadingClubs] = useState(true)
  const [events, setEvents] = useState([])
  const [loadingEvents, setLoadingEvents] = useState(true)

  useEffect(() => {
    let active = true
    async function fetchClubs() {
      try {
        const res = await getClubs()
        if (active) {
          const mapped = (res.data || []).map(club => {
            const mappedClub = mapClubFromApi(club)
            return {
              ...mappedClub,
              title: mappedClub.name, // CarouselCard expects title
            }
          })
          setClubs(mapped)
        }
      } catch (err) {
        console.error("Error fetching clubs for homepage:", err)
      } finally {
        if (active) setLoadingClubs(false)
      }
    }
    fetchClubs()
    return () => { active = false }
  }, [])

  useEffect(() => {
    let active = true
    async function fetchEvents() {
      try {
        const res = await getPublicEvents()
        if (active) {
          const mapped = (res.data || []).map(event => {
            return {
              id: event._id || event.id,
              title: event.title,
              description: event.description,
            }
          })
          setEvents(mapped)
        }
      } catch (err) {
        console.error("Error fetching events for homepage:", err)
      } finally {
        if (active) setLoadingEvents(false)
      }
    }
    fetchEvents()
    return () => { active = false }
  }, [])

  function handleSelectClubItem(item) {
    onSelectClub?.(item.id)
  }

  function handleSelectEventItem(item) {
    onSelectEvent?.(item.id)
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

        {loadingClubs ? (
          <div className="home-carousel-section" style={{ padding: '2rem 0', textAlign: 'center' }}>
            <p>Loading clubs...</p>
          </div>
        ) : (
          <BaseHomeCarousel
            title="Clubs"
            items={clubs}
            onSelectItem={handleSelectClubItem}
            onViewAll={() => onViewAll?.('clubs')}
          />
        )}

        {loadingEvents ? (
          <div className="home-carousel-section" style={{ padding: '2rem 0', textAlign: 'center' }}>
            <p>Loading events...</p>
          </div>
        ) : (
          <BaseHomeCarousel
            title="Events"
            items={events}
            onSelectItem={handleSelectEventItem}
            onViewAll={() => onViewAll?.('events')}
          />
        )}
      </div>
    </div>
  )
}

export default HomePage
