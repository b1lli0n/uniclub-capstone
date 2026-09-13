import { useEffect } from 'react'
import '../../styles/logout-modal.css'

export default function LogoutConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  isLoggingOut = false,
  title = 'Confirm Logout',
  message = 'Are you sure you want to log out of UniClub? Your current session will be ended.',
}) {
  useEffect(() => {
    if (!isOpen) return undefined

    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && !isLoggingOut) {
        onClose()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen, onClose, isLoggingOut])

  if (!isOpen) return null

  return (
    <div
      className="logout-modal-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="logout-modal-title"
    >
      <button
        type="button"
        className="logout-modal-backdrop"
        aria-label="Close confirmation"
        onClick={isLoggingOut ? undefined : onClose}
      />
      <div className="logout-modal-panel">
        <div className="logout-modal-icon-wrapper" aria-hidden="true">
          <svg
            width="26"
            height="26"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
        </div>

        <h3 id="logout-modal-title" className="logout-modal-title">
          {title}
        </h3>

        <p className="logout-modal-desc">{message}</p>

        <div className="logout-modal-actions">
          <button
            type="button"
            className="logout-modal-btn logout-modal-btn--cancel"
            onClick={onClose}
            disabled={isLoggingOut}
          >
            Cancel
          </button>
          <button
            type="button"
            className="logout-modal-btn logout-modal-btn--confirm"
            onClick={onConfirm}
            disabled={isLoggingOut}
          >
            {isLoggingOut ? (
              <>
                <span className="logout-spinner" aria-hidden="true" />
                <span>Logging out...</span>
              </>
            ) : (
              'Log Out'
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
