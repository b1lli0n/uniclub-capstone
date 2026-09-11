const footerLinks = [
  { label: 'Clubs', href: '#clubs' },
  { label: 'Events', href: '#events' },
  { label: 'Create Club', href: '#create-club' },
]

function HomeFooter({ onCreateClub, onViewAll }) {
  function handleLinkClick(event, target) {
    event.preventDefault()

    if (target === '#clubs') {
      onViewAll?.('clubs')
    } else if (target === '#events') {
      onViewAll?.('events')
    } else if (target === '#create-club') {
      onCreateClub?.()
    }
  }

  return (
    <footer className="home-footer">
      <div className="home-footer__main">
        <div className="home-footer__brand">
          <h2>UniClub</h2>
          <p>Discover clubs, events, and student connections</p>
        </div>

        <nav className="home-footer__nav" aria-label="Footer navigation">
          {footerLinks.map((link) => (
            <a
              key={link.href}
              href={link.href}
              onClick={(event) => handleLinkClick(event, link.href)}
            >
              {link.label}
            </a>
          ))}
        </nav>
      </div>

      <div className="home-footer__meta">
        <span>&copy; 2026 UniClub</span>
        <span>Student community platform</span>
      </div>
    </footer>
  )
}

export default HomeFooter
