import fptUniversityLogo from '../../assets/Logo-Dai-hoc-FPT.webp'
import heroGroup from '../../assets/hero-group.png'
import '../../styles/login.css'

function FptLogo() {
  return <img src={fptUniversityLogo} alt="FPT University" className="login-fpt-logo" />
}

export default function LoginPage({ onLogin }) {
  function handleLogin() {
    onLogin?.()
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
            <button type="button" className="login-provider login-provider--google" onClick={handleLogin}>
              <span className="login-provider__icon" aria-hidden="true">
                G+
              </span>
              <span>Login With Google</span>
            </button>

            <p className="login-options__hint">For students from K19, sign in with FEID</p>

            <button type="button" className="login-provider login-provider--feid" onClick={handleLogin}>
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
