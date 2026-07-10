import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export default function QrScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [errorMsg, setErrorMsg] = useState('')
  const html5QrcodeRef = useRef(null)

  useEffect(() => {
    if (!isOpen) return undefined

    setErrorMsg('')
    const scannerId = 'qr-scanner-element'
    const html5Qrcode = new Html5Qrcode(scannerId)
    html5QrcodeRef.current = html5Qrcode

    // Start camera scanning
    html5Qrcode.start(
      { facingMode: 'environment' }, // Back camera
      {
        fps: 10,
        qrbox: { width: 220, height: 220 },
      },
      (decodedText) => {
        // On successful scan
        onScanSuccess(decodedText)
        cleanup()
      },
      () => {
        // Verbose errors from scanner are ignored to prevent console cluttering
      }
    ).catch((err) => {
      console.error('Failed to start QR scanner:', err)
      setErrorMsg('Không thể truy cập camera. Vui lòng kiểm tra quyền truy cập camera của trình duyệt.')
    })

    function cleanup() {
      if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
        html5QrcodeRef.current.stop().catch((err) => console.error('Failed to stop camera:', err))
      }
    }

    return () => {
      cleanup()
    }
  }, [isOpen, onScanSuccess])

  if (!isOpen) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.65)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 9999,
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: '#fff',
          padding: '2rem',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '400px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h3 style={{ margin: '0 0 0.5rem 0', color: '#111', fontSize: '1.25rem', fontWeight: 600 }}>Quét QR Check-in</h3>
        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1.5rem', textAlign: 'center' }}>
          Hướng camera điện thoại vào mã QR vé của sinh viên để đón tiếp
        </p>

        {errorMsg ? (
          <p style={{ color: '#d32f2f', fontSize: '0.9rem', textAlign: 'center', margin: '1rem 0', lineHeight: 1.4 }}>{errorMsg}</p>
        ) : (
          <div style={{ position: 'relative', width: '260px', height: '260px', marginBottom: '1.5rem' }}>
            <div
              id="qr-scanner-element"
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '12px',
                border: '2px dashed #ff8e0b',
                overflow: 'hidden',
                backgroundColor: '#000',
              }}
            />
            {/* Animated Laser Scanning Line */}
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: '10%',
                width: '80%',
                height: '2.5px',
                backgroundColor: '#ff8e0b',
                boxShadow: '0 0 8px #ff8e0b',
                animation: 'scanLaser 2.5s infinite linear',
                pointerEvents: 'none',
              }}
            />
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          style={{
            background: '#f5f5f5',
            border: 'none',
            padding: '0.65rem 2.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 500,
            color: '#333',
            transition: 'background 0.2s',
          }}
          onMouseOver={(e) => (e.target.style.background = '#e0e0e0')}
          onMouseOut={(e) => (e.target.style.background = '#f5f5f5')}
        >
          Đóng Camera
        </button>

        {/* Injecting CSS Keyframe animation dynamically */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes scanLaser {
            0% { top: 10%; }
            50% { top: 90%; }
            100% { top: 10%; }
          }
          #qr-scanner-element video {
            width: 100% !important;
            height: 100% !important;
            object-fit: cover !important;
          }
        `}} />
      </div>
    </div>
  )
}
