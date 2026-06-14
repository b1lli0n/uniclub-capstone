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
  const initials = getClubInitials(club?.name)
  const style = { '--club-logo-gradient': club?.gradient }

  return (
    <div className={`club-logo ${className}`.trim()} style={style} aria-label={`Logo ${club?.name || ''}`}>
      {club?.logoUrl ? (
        <img src={club.logoUrl} alt="" />
      ) : (
        <span>{initials}</span>
      )}
    </div>
  )
}

export default ClubLogo
