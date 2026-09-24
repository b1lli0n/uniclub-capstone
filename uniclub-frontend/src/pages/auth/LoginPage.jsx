import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useToast } from '../../components/common/notificationContext'
import fptUniversityLogo from '../../assets/Logo-Dai-hoc-FPT.webp'
import heroGroup from '../../assets/hero-group.png'
import '../../styles/login.css'


function FptLogo() {
  return <img src={fptUniversityLogo} alt="FPT University" className="login-fpt-logo" />
}

export default function LoginPage() {
  const showToast = useToast()
  const [searchParams, setSearchParams] = useSearchParams()

  useEffect(() => {
    const errorParam = searchParams.get('error')
    if (errorParam) {
      let msg = 'Login failed.'
      if (errorParam === 'Only FPT email is allowed') {
        msg = 'Invalid login account! Please use an approved school email address (@fpt.edu.vn).'
      } else if (errorParam === 'Account is inactive') {
        msg = 'Your account has been locked or has not been activated.'
      } else {
        msg = errorParam
      }

      showToast({
        type: 'error',
        title: 'Login failed',
        message: msg,
      })

      // Clean up search param from URL
      setSearchParams({}, { replace: true })
    }
  }, [searchParams, setSearchParams, showToast])

  const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://localhost:5000/api'

  function handleLogin1() {
    window.location.href = `${API_BASE_URL}/auth/google`
  }
  function handleLogin2() {
    window.location.href = `${API_BASE_URL}/auth/feid`
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-card__left">
          <div className="login-brand-panel">
            <FptLogo />
            <h2>UniClub</h2>
            <p>FPT University - Can Tho Campus</p>
            <img src={heroGroup} alt="" className="login-hero-group" aria-hidden="true" />
          </div>
          <p className="login-card__copyright">&copy; {new Date().getFullYear()} UniClub</p>
        </div>

        <div className="login-card__right">
          <h1 className="login-form__title">Login</h1>

          <div className="login-options" aria-label="Login methods">
            <button type="button" className="login-provider login-provider--google" onClick={handleLogin1}>
              <span className="login-provider__icon" aria-hidden="true">
                G+
              </span>
              <span>Login With Google</span>
            </button>

            <p className="login-options__hint">For students from K19, sign in with FEID</p>

            <button type="button" className="login-provider login-provider--feid" onClick={handleLogin2}>
              <span className="login-provider__icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20 5H4a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Zm-.4 4.25-7.07 4.42a1 1 0 0 1-1.06 0L4.4 9.25A1 1 0 0 1 5.46 7.55L12 11.64l6.54-4.09a1 1 0 1 1 1.06 1.7Z" />
                </svg>
              </span>
              <span>Login With FeID</span>
            </button>
          </div>

          <p className="login-form__contact">
            Having trouble? Contact{' '}
            <a href="mailto:support@uniclub.edu.vn">support@uniclub.edu.vn</a>
          </p>
        </div>
      </div>
    </div>
  )
}
