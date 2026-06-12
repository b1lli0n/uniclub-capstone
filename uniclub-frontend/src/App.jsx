import { useMemo, useState } from 'react'
import Button from 'react-bootstrap/Button'
import ButtonGroup from 'react-bootstrap/ButtonGroup'
import Container from 'react-bootstrap/Container'
import { AdminLayout, StudentLayout } from './layouts'
import { APP_ROLES, APP_ROUTES } from './routes/appRoutes'
import './App.css'
import './styles/layouts.css'
import './styles/pages.css'

function App() {
  const [activeRole, setActiveRole] = useState(APP_ROLES.STUDENT)

  const ActivePage = APP_ROUTES[activeRole].component
  const ActiveLayout = useMemo(
    () => (activeRole === APP_ROLES.ADMIN ? AdminLayout : StudentLayout),
    [activeRole],
  )

  return (
    <>
      <div className="layout-role-switcher border-bottom bg-white bg-opacity-75">
        <Container className="py-3 d-flex justify-content-between align-items-center gap-3 flex-wrap">
          <div className="fw-semibold">Layout preview</div>
          <ButtonGroup aria-label="Role switcher">
            <Button
              variant={activeRole === APP_ROLES.STUDENT ? 'primary' : 'outline-primary'}
              onClick={() => setActiveRole(APP_ROLES.STUDENT)}
            >
              Student
            </Button>
            <Button
              variant={activeRole === APP_ROLES.ADMIN ? 'dark' : 'outline-dark'}
              onClick={() => setActiveRole(APP_ROLES.ADMIN)}
            >
              Admin
            </Button>
          </ButtonGroup>
        </Container>
      </div>

      <ActiveLayout>
        <ActivePage />
      </ActiveLayout>
    </>
  )
}

export default App
