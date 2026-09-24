import { useState } from 'react'

function getClubInitials(name = '') {
  return name
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((word) => word[0])
    .join('')
    .toUpperCase()
}

function ClubLogo({ club, className = '' }) {
  const [imgError, setImgError] = useState(false)
  const initials = getClubInitials(club?.name || club?.title || club?.clubName || '') || 'CL'
  const style = {
    '--club-logo-gradient': club?.gradient,
    '--club-logo-fit': club?.logoFit === 'contain' ? 'contain' : 'cover',
  }
  const hasImage = Boolean(club?.logoUrl) && !imgError

  return (
    <div
      className={`club-logo${hasImage ? ' club-logo--image' : ''} ${className}`.trim()}
      style={style}
      aria-label={`Logo ${club?.name || club?.title || ''}`}
      title={club?.name || club?.title || ''}
    >
      {hasImage ? (
        <img
          src={club.logoUrl}
          alt={club?.name || 'Club logo'}
          width="108"
          height="108"
          loading="eager"
          decoding="async"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}

export default ClubLogo

