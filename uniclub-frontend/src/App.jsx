import './App.css'
import './styles/layouts.css'
import './styles/pages.css'
import LoginPage from './pages/auth/LoginPage'

function App() {
  function handleLogin() {
    console.log('Login clicked')
    // Sau này chỗ này gọi login API hoặc chuyển trang
  }

  return <LoginPage onLogin={handleLogin} />
}

export default App
