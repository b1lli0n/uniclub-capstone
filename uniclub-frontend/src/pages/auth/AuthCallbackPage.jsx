import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [loadingText, setLoadingText] = useState('Đang kết nối với Google...')

  useEffect(() => {
    const texts = [
      'Đang xác thực tài khoản...',
      'Đang thiết lập phiên đăng nhập...',
      'Đang đồng bộ dữ liệu thành viên...',
      'Đang chuyển hướng về trang chủ...'
    ]
    let index = 0
    const interval = setInterval(() => {
      if (index < texts.length) {
        setLoadingText(texts[index])
        index++
      }
    }, 450)

    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    const token = searchParams.get('token')

    if (token) {
      localStorage.setItem('token', token)
      setTimeout(() => {
        window.location.href = '/'
      }, 1800)
    } else {
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 1800)
    }
  }, [searchParams, navigate])

  return (
    <div className="callback-container">
      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.05); opacity: 1; }
        }
        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-6px); }
        }
        @keyframes shimmer {
          0% { background-position: -200% 0; }
          100% { background-position: 200% 0; }
        }

        .callback-container {
          height: 100vh;
          width: 100vw;
          display: flex;
          justify-content: center;
          align-items: center;
          background: radial-gradient(circle at top right, #2c1810, #0f172a 60%);
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          overflow: hidden;
          position: relative;
        }

        .callback-container::before {
          content: '';
          position: absolute;
          width: 300px;
          height: 300px;
          background: radial-gradient(circle, rgba(253, 126, 20, 0.15) 0%, transparent 70%);
          top: 20%;
          left: 30%;
          filter: blur(40px);
          pointer-events: none;
        }

        .glass-card {
          background: rgba(30, 41, 59, 0.45);
          backdrop-filter: blur(16px);
          -webkit-backdrop-filter: blur(16px);
          border: 1px solid rgba(255, 255, 255, 0.08);
          border-top: 1px solid rgba(255, 255, 255, 0.15);
          border-radius: 28px;
          padding: 48px 40px;
          width: 90%;
          max-width: 440px;
          box-shadow: 0 20px 50px rgba(0, 0, 0, 0.3), 
                      inset 0 1px 0 rgba(255, 255, 255, 0.1);
          display: flex;
          flex-direction: column;
          align-items: center;
          text-align: center;
          animation: float 4s ease-in-out infinite;
        }

        .loader-ring {
          position: relative;
          width: 80px;
          height: 80px;
          margin-bottom: 32px;
        }

        .loader-ring-outer {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 4px solid rgba(253, 126, 20, 0.1);
          border-top-color: #fd7e14;
          border-radius: 50%;
          animation: spin 1s cubic-bezier(0.55, 0.085, 0.68, 0.53) infinite;
          box-shadow: 0 0 15px rgba(253, 126, 20, 0.2);
        }

        .loader-ring-inner {
          position: absolute;
          width: 70%;
          height: 70%;
          top: 15%;
          left: 15%;
          border: 3px solid rgba(255, 255, 255, 0.05);
          border-bottom-color: rgba(255, 255, 255, 0.6);
          border-radius: 50%;
          animation: spin 1.5s linear reverse infinite;
        }

        .logo-center {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          font-weight: 900;
          font-size: 16px;
          color: #fd7e14;
          letter-spacing: 0.5px;
          animation: pulse 2s ease-in-out infinite;
        }

        .title {
          font-size: 22px;
          font-weight: 800;
          margin: 0 0 12px;
          background: linear-gradient(135deg, #ffffff 0%, #cbd5e1 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          letter-spacing: -0.5px;
        }

        .subtitle {
          font-size: 14px;
          color: #94a3b8;
          margin: 0 0 24px;
          line-height: 1.5;
        }

        .progress-bar-container {
          width: 100%;
          height: 6px;
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
          overflow: hidden;
          position: relative;
          margin-bottom: 20px;
        }

        .progress-bar-fill {
          height: 100%;
          width: 100%;
          background: linear-gradient(90deg, #fd7e14, #ff9233, #fd7e14);
          background-size: 200% 100%;
          border-radius: 10px;
          animation: shimmer 1.5s infinite linear;
        }

        .status-text {
          font-size: 13px;
          font-weight: 600;
          color: #fd7e14;
          background: rgba(253, 126, 20, 0.1);
          padding: 6px 14px;
          border-radius: 20px;
          letter-spacing: 0.3px;
          min-height: 31px;
          display: flex;
          align-items: center;
          transition: all 0.3s ease;
        }
      `}</style>

      <div className="glass-card">
        <div className="loader-ring">
          <div className="loader-ring-outer"></div>
          <div className="loader-ring-inner"></div>
          <div className="logo-center">UC</div>
        </div>

        <h2 className="title">Đang xử lý đăng nhập</h2>
        <p className="subtitle">Vui lòng chờ trong giây lát để thiết lập tài khoản của bạn.</p>

        <div className="progress-bar-container">
          <div className="progress-bar-fill"></div>
        </div>

        <div className="status-text">
          {loadingText}
        </div>
      </div>
    </div>
  )
}

export default AuthCallbackPage