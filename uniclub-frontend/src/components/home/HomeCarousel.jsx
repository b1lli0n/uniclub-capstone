import { useRef } from 'react'

function ChevronIcon({ direction }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
      {direction === 'left' ? (
        <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
      ) : (
        <path d="M9 18l6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
      )}
    </svg>
  )
}

function getCardInitials(title = '') {
  return title
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

function CarouselCard({ item, onSelect }) {
  const CardTag = onSelect ? 'button' : 'article'
  const mediaUrl = item.logoUrl || item.imageUrl || item.mediaUrl
  const mediaFit = item.logoFit === 'contain' ? 'contain' : 'cover'
  const fallbackLogoText = item.logoText || getCardInitials(item.title)
  const mediaClassName = `home-carousel-card__media${
    mediaUrl ? ' home-carousel-card__media--image' : ''
  }`
  const cardProps = onSelect
    ? {
        type: 'button',
        onClick: () => onSelect(item),
        'aria-label': `View ${item.title}`,
      }
    : {}

  return (
    <CardTag className="home-carousel-card" {...cardProps}>
      <div className={mediaClassName}>
        {mediaUrl ? (
          <img
            src={mediaUrl}
            alt={item.logoAlt || `${item.title} logo`}
            className={`home-carousel-card__media-img home-carousel-card__media-img--${mediaFit}`}
          />
        ) : (
          <span className="home-carousel-card__media-fallback" aria-hidden="true">
            {fallbackLogoText}
          </span>
        )}
      </div>
      {item.badge ? <span className="home-carousel-card__badge">{item.badge}</span> : null}
      <div className="home-carousel-card__body">
        <h3>{item.title}</h3>
        <p>{item.description}</p>
      </div>
    </CardTag>
  )
}

function HomeCarousel({ title, items, viewAllLabel = 'View All', onSelectItem, onViewAll }) {
  const trackRef = useRef(null)

  function scroll(direction) {
    const track = trackRef.current
    if (!track) return
    const card = track.querySelector('.home-carousel-card')
    const gap = 16
    const amount = card ? card.offsetWidth + gap : 300
    const maxScrollLeft = track.scrollWidth - track.clientWidth
    const tolerance = 4

    if (direction > 0 && track.scrollLeft >= maxScrollLeft - tolerance) {
      track.scrollTo({ left: 0, behavior: 'smooth' })
      return
    }

    if (direction < 0 && track.scrollLeft <= tolerance) {
      track.scrollTo({ left: maxScrollLeft, behavior: 'smooth' })
      return
    }

    track.scrollBy({ left: direction * amount, behavior: 'smooth' })
  }

  return (
    <section className="home-carousel-section" aria-label={title}>
      <div className="home-carousel-section__header">
        <h2 className="home-carousel-section__title">{title}</h2>
        <button
          type="button"
          className="home-carousel-section__link"
          onClick={onViewAll}
        >
          {viewAllLabel}
        </button>
      </div>

      <div className="home-carousel">
        <button
          type="button"
          className="home-carousel__arrow home-carousel__arrow--prev"
          onClick={() => scroll(-1)}
          aria-label={`${title} - scroll left`}
        >
          <ChevronIcon direction="left" />
        </button>

        <div className="home-carousel__track" ref={trackRef}>
          {items.map((item) => (
            <CarouselCard key={item.id} item={item} onSelect={onSelectItem} />
          ))}
        </div>

        <button
          type="button"
          className="home-carousel__arrow home-carousel__arrow--next"
          onClick={() => scroll(1)}
          aria-label={`${title} - scroll right`}
        >
          <ChevronIcon direction="right" />
        </button>
      </div>
    </section>
  )
}

export default HomeCarousel
