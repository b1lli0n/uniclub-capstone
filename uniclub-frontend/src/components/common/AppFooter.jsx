import Container from 'react-bootstrap/Container'

function AppFooter({ label }) {
  return (
    <footer className="py-3 border-top bg-white">
      <Container className="small text-secondary">{label}</Container>
    </footer>
  )
}

export default AppFooter
