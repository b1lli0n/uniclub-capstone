import { useState } from 'react'
import Alert from 'react-bootstrap/Alert'
import Button from 'react-bootstrap/Button'
import Card from 'react-bootstrap/Card'
import Col from 'react-bootstrap/Col'
import Container from 'react-bootstrap/Container'
import Form from 'react-bootstrap/Form'
import Row from 'react-bootstrap/Row'
import { fetchDemoApi } from '../../api/demoApi'

function StudentDashboardPage() {
  const [count, setCount] = useState(0)
  const [joined, setJoined] = useState(false)
  const [apiLoading, setApiLoading] = useState(false)
  const [apiData, setApiData] = useState(null)
  const [apiError, setApiError] = useState('')

  const handleCallApi = async () => {
    setApiLoading(true)
    setApiError('')

    try {
      const data = await fetchDemoApi()
      setApiData(data)
    } catch (error) {
      setApiData(null)
      setApiError(error.message || 'Call API failed')
    } finally {
      setApiLoading(false)
    }
  }

  return (
    <Container>
      <Row className="g-4 align-items-stretch">
        <Col md={7}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="p-4">
              <Card.Title as="h1" className="h3 mb-3">
                Student Dashboard
              </Card.Title>
              <Card.Text className="text-secondary mb-4">
                Layout cho student da san sang. Ban co the call API backend tu day.
              </Card.Text>

              <div className="d-flex gap-2 flex-wrap mb-4">
                <Button variant="primary" onClick={() => setCount((value) => value + 1)}>
                  Click count: {count}
                </Button>
                <Button variant="outline-secondary" onClick={() => setCount(0)}>
                  Reset
                </Button>
                <Button variant="warning" onClick={handleCallApi} disabled={apiLoading}>
                  {apiLoading ? 'Dang goi API...' : 'Goi demo API'}
                </Button>
              </div>

              <Alert variant={joined ? 'success' : 'info'} className="mb-0">
                {joined
                  ? 'Ban da dang ky demo thanh cong.'
                  : 'Nhap email ben phai de thu form Bootstrap.'}
              </Alert>

              {apiError ? (
                <Alert variant="danger" className="mt-3 mb-0">
                  {apiError}
                </Alert>
              ) : null}

              {apiData ? (
                <Card className="mt-3 bg-light-subtle border-0">
                  <Card.Body className="py-3 px-3">
                    <div className="small text-secondary mb-1">Response from backend</div>
                    <pre className="api-response mb-0">{JSON.stringify(apiData, null, 2)}</pre>
                  </Card.Body>
                </Card>
              ) : null}
            </Card.Body>
          </Card>
        </Col>

        <Col md={5}>
          <Card className="h-100 border-0 shadow-sm">
            <Card.Body className="p-4">
              <Card.Title className="h5 mb-3">Nhan thong tin CLB</Card.Title>
              <Form
                onSubmit={(event) => {
                  event.preventDefault()
                  setJoined(true)
                }}
              >
                <Form.Group className="mb-3" controlId="fullName">
                  <Form.Label>Ho va ten</Form.Label>
                  <Form.Control type="text" placeholder="Nguyen Van A" required />
                </Form.Group>

                <Form.Group className="mb-3" controlId="email">
                  <Form.Label>Email</Form.Label>
                  <Form.Control type="email" placeholder="you@example.com" required />
                </Form.Group>

                <Button variant="success" type="submit" className="w-100">
                  Dang ky
                </Button>
              </Form>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  )
}

export default StudentDashboardPage
