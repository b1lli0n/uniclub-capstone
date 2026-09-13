import { useEffect, useRef } from 'react'
import { Link } from 'react-router-dom'

const MENU_ITEMS = [
  { id: 'profile', label: 'My Profile', href: '/profile'},
  { id: 'clubs', label: 'My Clubs', href: '/my-clubs' },
  { id: 'my-events', label: 'My Events', href: '/my-events' },
  { id: 'requests', label: 'My Requests', href: '/my-requests'},
  { id: 'fees', label: 'My Membership Fees', href: '/my-fees' },
]

function HomeUserMenuDropdown({ open, onClose, anchorRef }) {
  const panelRef = useRef(null)

  useEffect(() => {
    if (!open) return undefined

    function handlePointerDown(event) {
      const target = event.target
      if (
        panelRef.current?.contains(target) ||
        anchorRef.current?.contains(target)
      ) {
        return
      }
      onClose?.()
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') onClose?.()
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [open, onClose, anchorRef])

  if (!open) return null

  return (
    <div
      ref={panelRef}
      className="home-user-dropdown"
      role="menu"
      aria-label="Account menu"
    >
      <ul className="home-user-dropdown__list">
        {MENU_ITEMS.map((item) => (
          <li key={item.id} role="none">
            {item.href.startsWith('#') ? (
              <a
                href={item.href}
                className="home-user-dropdown__link"
                role="menuitem"
                onClick={onClose}
              >
                {item.label}
              </a>
            ) : (
              <Link
                to={item.href}
                className="home-user-dropdown__link"
                role="menuitem"
                onClick={onClose}
              >
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ul>
    </div>
  )
}

export default HomeUserMenuDropdown
