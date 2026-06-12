import Badge from 'react-bootstrap/Badge'
import Container from 'react-bootstrap/Container'
import Navbar from 'react-bootstrap/Navbar'
import { AppFooter } from '../components/common'

function StudentLayout({ children }) {
  return (
    <div className="layout-shell student-layout">
      <Navbar bg="primary" data-bs-theme="dark" className="shadow-sm">
        <Container className="d-flex justify-content-between">
          <Navbar.Brand>UniClub Student</Navbar.Brand>
          <Badge bg="light" text="primary">
            Student Portal
          </Badge>
        </Container>
      </Navbar>

      <main className="flex-grow-1 py-4">{children}</main>

      <AppFooter label="Student layout - UniClub frontend" />
    </div>
  )
}

export default StudentLayout
