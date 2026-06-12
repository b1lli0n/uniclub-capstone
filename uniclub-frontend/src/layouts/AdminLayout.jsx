import Badge from 'react-bootstrap/Badge'
import Container from 'react-bootstrap/Container'
import Nav from 'react-bootstrap/Nav'
import Navbar from 'react-bootstrap/Navbar'
import { AppFooter } from '../components/common'

function AdminLayout({ children }) {
  return (
    <div className="layout-shell admin-layout">
      <Navbar bg="dark" data-bs-theme="dark" expand="lg" className="shadow-sm">
        <Container>
          <Navbar.Brand>UniClub Admin</Navbar.Brand>
          <Nav className="ms-auto d-flex align-items-center">
            <Badge bg="warning" text="dark">
              Admin Portal
            </Badge>
          </Nav>
        </Container>
      </Navbar>

      <main className="flex-grow-1 py-4">{children}</main>

      <AppFooter label="Admin layout - UniClub frontend" />
    </div>
  )
}

export default AdminLayout
