import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'

function AuthCallbackPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()

  useEffect(() => {
    const token = searchParams.get('token')

    // console.log('Received token:', token)

    if (token) {
      localStorage.setItem('token', token)
        // console.log('Token saved to localStorage', localStorage.getItem('token'))
      setTimeout(() => {
        window.location.href = '/'
      }, 2000)
    } else {
      setTimeout(() => {
        navigate('/login', { replace: true })
      }, 2000)
    }
  }, [searchParams, navigate])

  return (
    <div
      style={{
        height: '100vh',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        flexDirection: 'column',
      }}
    >
      <h2>Đang xử lý đăng nhập...</h2>
      <p>Vui lòng chờ trong giây lát.</p>
    </div>
  )
}

export default AuthCallbackPage