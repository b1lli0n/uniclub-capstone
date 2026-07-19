import { useCallback, useMemo, useState } from 'react'
import { ConfirmContext, ToastContext } from './notificationContext'
import './notifications.css'

function ToastIcon({ type }) {
  if (type === 'error') return <span aria-hidden="true">!</span>
  if (type === 'warning') return <span aria-hidden="true">?</span>
  return <span aria-hidden="true">✓</span>
}

function ConfirmDialog({ config, onCancel, onConfirm }) {
  if (!config) return null

  const tone = config.tone || 'warning'

  return (
    <div className="app-confirm" role="dialog" aria-modal="true" aria-labelledby="app-confirm-title">
      <button
        type="button"
        className="app-confirm__backdrop"
        aria-label="Close confirmation"
        onClick={onCancel}
      />
      <section className={`app-confirm__panel app-confirm__panel--${tone}`}>
        <div className="app-confirm__mark" aria-hidden="true">
          {tone === 'danger' ? '!' : '?'}
        </div>
        <div className="app-confirm__content">
          <h2 id="app-confirm-title">{config.title || 'Confirm action'}</h2>
          <p>{config.message || 'Are you sure you want to continue?'}</p>
        </div>
        <div className="app-confirm__actions">
          <button type="button" className="app-confirm__cancel" onClick={onCancel}>
            {config.cancelText || 'Cancel'}
          </button>
          <button type="button" className="app-confirm__confirm" onClick={onConfirm}>
            {config.confirmText || 'Confirm'}
          </button>
        </div>
      </section>
    </div>
  )
}

export function NotificationProvider({ children }) {
  const [toasts, setToasts] = useState([])
  const [confirmState, setConfirmState] = useState(null)

  const removeToast = useCallback((id) => {
    setToasts((items) => items.filter((item) => item.id !== id))
  }, [])

  const showToast = useCallback(({ type = 'success', title, message, duration = 3200 }) => {
    const id = `${Date.now()}-${Math.random()}`
    setToasts((items) => [...items, { id, type, title, message }])

    window.setTimeout(() => {
      removeToast(id)
    }, duration)
  }, [removeToast])

  const confirm = useCallback((config) => (
    new Promise((resolve) => {
      setConfirmState({ config, resolve })
    })
  ), [])

  const handleConfirmCancel = useCallback(() => {
    setConfirmState((state) => {
      state?.resolve(false)
      return null
    })
  }, [])

  const handleConfirmAccept = useCallback(() => {
    setConfirmState((state) => {
      state?.resolve(true)
      return null
    })
  }, [])

  const toastValue = useMemo(() => ({ showToast }), [showToast])
  const confirmValue = useMemo(() => ({ confirm }), [confirm])

  return (
    <ToastContext.Provider value={toastValue}>
      <ConfirmContext.Provider value={confirmValue}>
        {children}
        <div className="app-toast-stack" aria-live="polite" aria-relevant="additions removals">
          {toasts.map((toast) => (
            <article key={toast.id} className={`app-toast app-toast--${toast.type}`}>
              <div className="app-toast__icon">
                <ToastIcon type={toast.type} />
              </div>
              <div className="app-toast__body">
                {toast.title ? <strong>{toast.title}</strong> : null}
                {toast.message ? <p>{toast.message}</p> : null}
              </div>
              <button
                type="button"
                className="app-toast__close"
                aria-label="Close notification"
                onClick={() => removeToast(toast.id)}
              >
                x
              </button>
            </article>
          ))}
        </div>
        <ConfirmDialog
          config={confirmState?.config}
          onCancel={handleConfirmCancel}
          onConfirm={handleConfirmAccept}
        />
      </ConfirmContext.Provider>
    </ToastContext.Provider>
  )
}
