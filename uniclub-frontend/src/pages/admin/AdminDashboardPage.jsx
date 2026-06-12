import Badge from 'react-bootstrap/Badge'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Row from 'react-bootstrap/Row'

function AdminDashboardPage() {
  return (
    <Container>
      <Row className="g-4">
        <Col md={4}>
          <Card className="border-0 shadow-sm stat-card">
            <Card.Body>
              <div className="text-secondary small mb-2">Pending approvals</div>
              <div className="display-6 fw-semibold">12</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm stat-card">
            <Card.Body>
              <div className="text-secondary small mb-2">Active students</div>
              <div className="display-6 fw-semibold">248</div>
            </Card.Body>
          </Card>
        </Col>
        <Col md={4}>
          <Card className="border-0 shadow-sm stat-card">
            <Card.Body>
              <div className="text-secondary small mb-2">Events this month</div>
              <div className="display-6 fw-semibold">7</div>
            </Card.Body>
          </Card>
        </Col>
      </Row>

      <Card className="mt-4 border-0 shadow-sm">
        <Card.Body>
          <Card.Title className="h5 mb-3">Admin Dashboard</Card.Title>
          <Card.Text className="mb-0 text-secondary">
            Khu vuc danh cho admin. Ban co the them quan ly CLB, su kien va duyet
            dang ky tai day.
          </Card.Text>
          <Badge bg="dark" className="mt-3">
            Role: admin
          </Badge>
        </Card.Body>
      </Card>
    </Container>
  )
}

export default AdminDashboardPage
