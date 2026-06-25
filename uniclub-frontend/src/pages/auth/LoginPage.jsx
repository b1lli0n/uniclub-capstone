import { useState } from 'react'
import fptUniversityLogo from '../../assets/Logo-Dai-hoc-FPT.webp'
import heroGroup from '../../assets/hero-group.png'
import '../../styles/login.css'

const MOCK_ACCOUNTS = [
  { email: 'admin@fpt.edu.vn', label: 'Admin (Student Affairs)' },
  { email: 'tynce181041@fpt.edu.vn', label: 'Nguyen Ty (K18 President/Member)' },
  { email: 'bich.tt@fpt.edu.vn', label: 'Tran Thi Bich (Coding Club President)' },
  { email: 'cuong.lv@fpt.edu.vn', label: 'Le Van Cuong (Dance Club President)' },
  { email: 'duc.hm@fpt.edu.vn', label: 'Hoang Minh Duc (Basketball Club President)' },
  { email: 'lan.nt@fpt.edu.vn', label: 'Nguyen Thi Lan (Startup Club President)' },
]

function FptLogo() {
  return <img src={fptUniversityLogo} alt="FPT University" className="login-fpt-logo" />
}

export default function LoginPage() {
  const [selectedEmail, setSelectedEmail] = useState(MOCK_ACCOUNTS[1].email)

  function handleLogin1() {
    window.location.href =
    'https://localhost:5000/api/auth/google'
  }
  function handleLogin2() {
    window.location.href =
    'https://localhost:5000/api/auth/feid'
  }
  function handleDevLogin() {
    window.location.href = `https://localhost:5000/api/auth/dev-login?email=${selectedEmail}`
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

            <div className="dev-login-section" style={{
              marginTop: '1.5rem',
              paddingTop: '1.5rem',
              borderTop: '1px dashed #f0e4d8',
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '0.5rem',
            }}>
              <p className="login-options__hint" style={{ margin: 0, fontWeight: '700', color: '#ff8e0b', textAlign: 'left' }}>
                [DEV ONLY] Quick Mock Login
              </p>
              <div style={{ display: 'flex', gap: '0.5rem', width: '100%' }}>
                <select
                  value={selectedEmail}
                  onChange={(e) => setSelectedEmail(e.target.value)}
                  style={{
                    flex: 1,
                    padding: '0.6rem 0.8rem',
                    borderRadius: '8px',
                    border: '1px solid #f0e4d8',
                    background: '#ffffff',
                    fontSize: '0.85rem',
                    color: '#3d2e24',
                    cursor: 'pointer',
                    outline: 'none',
                  }}
                >
                  {MOCK_ACCOUNTS.map((acc) => (
                    <option key={acc.email} value={acc.email}>
                      {acc.label} ({acc.email.split('@')[0]})
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={handleDevLogin}
                  style={{
                    padding: '0.6rem 1.2rem',
                    background: '#ff8e0b',
                    color: '#ffffff',
                    border: 'none',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontWeight: '700',
                    fontSize: '0.85rem',
                    boxShadow: '0 4px 10px rgba(255, 142, 11, 0.2)',
                  }}
                >
                  Go
                </button>
              </div>
            </div>
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
