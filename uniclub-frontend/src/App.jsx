import './App.css'
import './styles/layouts.css'
import './styles/pages.css'
import { NotificationProvider } from './components/common/NotificationProvider'
import AppRouter from './router/AppRouter'

function App() {
  return (
    <NotificationProvider>
      <AppRouter />
    </NotificationProvider>
  )
}

export default App
