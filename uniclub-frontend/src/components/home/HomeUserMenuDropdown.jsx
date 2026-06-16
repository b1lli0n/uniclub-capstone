import { useEffect, useRef } from 'react'

const MENU_ITEMS = [
  { id: 'profile', label: 'My Profile', href: '#profile', screen: 'profile' },
  { id: 'clubs', label: 'My Clubs', href: '#my-clubs' },
  { id: 'events', label: 'My Events', href: '#my-events' },
  { id: 'requests', label: 'My Requests', href: '#my-requests', screen: 'requests' },
  { id: 'fees', label: 'My Membership Fees', href: '#my-fees' },
]

function HomeUserMenuDropdown({ open, onClose, anchorRef, onNavigate }) {
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
            <a
              href={item.href}
              className="home-user-dropdown__link"
              role="menuitem"
              onClick={(event) => {
                if (item.screen) {
                  event.preventDefault()
                  onNavigate?.(item.screen)
                }
                onClose?.()
              }}
            >
              {item.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}

export default HomeUserMenuDropdown
