import { useEffect, useRef, useState } from 'react'
import { Html5Qrcode } from 'html5-qrcode'

export default function QrScannerModal({ isOpen, onClose, onScanSuccess }) {
  const [errorMsg, setErrorMsg] = useState('')
  const [cameras, setCameras] = useState([])
  const [selectedCameraId, setSelectedCameraId] = useState('')
  const html5QrcodeRef = useRef(null)

  // 1. Lấy danh sách toàn bộ camera (Iriun Webcam, Laptop Webcam, etc.)
  useEffect(() => {
    if (!isOpen) return

    Html5Qrcode.getCameras()
      .then((devices) => {
        if (devices && devices.length > 0) {
          setCameras(devices)
          // Tìm camera Iriun / DroidCam / điện thoại trước, nếu không có thì lấy camera ngoài hoặc mặc định
          const iriunCam = devices.find((d) => /iriun|phone|droidcam|back|rear|external/i.test(d.label))
          if (iriunCam) {
            setSelectedCameraId(iriunCam.id)
          } else if (devices.length > 1) {
            // Thiết bị cắm ngoài thường nằm ở vị trí thứ 2
            setSelectedCameraId(devices[1].id)
          } else {
            setSelectedCameraId(devices[0].id)
          }
        }
      })
      .catch((err) => {
        console.warn('Cannot enumerate cameras:', err)
      })
  }, [isOpen])

  // 2. Khởi động luồng quét QR theo camera được chọn
  useEffect(() => {
    if (!isOpen) return undefined

    setErrorMsg('')
    const scannerId = 'qr-scanner-element'
    const html5Qrcode = new Html5Qrcode(scannerId)
    html5QrcodeRef.current = html5Qrcode

    const cameraConfig = selectedCameraId
      ? selectedCameraId
      : { facingMode: 'environment' }

    // Start camera scanning
    html5Qrcode
      .start(
        cameraConfig,
        {
          fps: 15,
          qrbox: { width: 220, height: 220 },
        },
        (decodedText) => {
          onScanSuccess(decodedText)
          cleanup()
        },
        () => {
          // Verbose errors from scanner are ignored
        }
      )
      .catch((err) => {
        console.error('Failed to start QR scanner:', err)
        setErrorMsg('Không thể truy cập camera. Vui lòng cấp quyền hoặc chọn camera khác bên dưới.')
      })

    function cleanup() {
      if (html5QrcodeRef.current && html5QrcodeRef.current.isScanning) {
        html5QrcodeRef.current.stop().catch((err) => console.error('Failed to stop camera:', err))
      }
    }

    return () => {
      cleanup()
    }
  }, [isOpen, selectedCameraId, onScanSuccess])

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
          padding: '1.75rem 2rem',
          borderRadius: '16px',
          width: '100%',
          maxWidth: '420px',
          boxShadow: '0 8px 32px rgba(0, 0, 0, 0.25)',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
        }}
      >
        <h3 style={{ margin: '0 0 0.4rem 0', color: '#111', fontSize: '1.25rem', fontWeight: 700 }}>
          📷 Quét mã QR Điểm Danh
        </h3>
        <p style={{ fontSize: '0.85rem', color: '#666', marginBottom: '1rem', textAlign: 'center' }}>
          Hướng camera về phía mã QR trên vé sự kiện của sinh viên
        </p>

        {/* Dropdown chọn Camera nếu có nhiều camera (Iriun Webcam / Laptop Webcam) */}
        {cameras.length > 1 && (
          <div style={{ width: '100%', marginBottom: '1rem' }}>
            <label style={{ fontSize: '0.8rem', color: '#475569', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
              🎥 Đang dùng Camera:
            </label>
            <select
              value={selectedCameraId}
              onChange={(e) => setSelectedCameraId(e.target.value)}
              style={{
                width: '100%',
                padding: '0.55rem 0.75rem',
                borderRadius: '8px',
                border: '1.5px solid #ff8e0b',
                fontSize: '0.88rem',
                fontWeight: 600,
                backgroundColor: '#fff7ed',
                color: '#9a3412',
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              {cameras.map((cam, idx) => (
                <option key={cam.id} value={cam.id}>
                  {cam.label || `Camera ${idx + 1}`}
                </option>
              ))}
            </select>
          </div>
        )}

        {errorMsg ? (
          <p style={{ color: '#d32f2f', fontSize: '0.9rem', textAlign: 'center', margin: '1rem 0', lineHeight: 1.4 }}>
            {errorMsg}
          </p>
        ) : (
          <div style={{ position: 'relative', width: '260px', height: '260px', marginBottom: '1.25rem' }}>
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
                boxShadow: '0 0 10px #ff8e0b',
                animation: 'scanLaser 2.2s infinite linear',
                pointerEvents: 'none',
              }}
            />
          </div>
        )}

        <button
          type="button"
          onClick={onClose}
          style={{
            background: '#f1f5f9',
            border: 'none',
            padding: '0.65rem 2.5rem',
            borderRadius: '8px',
            cursor: 'pointer',
            fontSize: '0.9rem',
            fontWeight: 600,
            color: '#334155',
            transition: 'background 0.2s',
          }}
          onMouseOver={(e) => (e.target.style.background = '#e2e8f0')}
          onMouseOut={(e) => (e.target.style.background = '#f1f5f9')}
        >
          Đóng Camera
        </button>

        {/* Injecting CSS Keyframe animation dynamically */}
        <style
          dangerouslySetInnerHTML={{
            __html: `
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
        `,
          }}
        />
      </div>
    </div>
  )
}
