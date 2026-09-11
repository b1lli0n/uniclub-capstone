import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyClubs } from '../../api/memberClubMembership.api'
import { getMyRegistrations } from '../../api/event.api'

// ── QR Modal ─────────────────────────────────────────────────────────────────
function QRModal({ registrationId, eventTitle, onClose }) {
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=260x260&margin=14&data=${registrationId}`

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        onClick={e => e.stopPropagation()}
        style={{
          background: '#fff', borderRadius: '20px', padding: '2rem 2rem 1.5rem',
          maxWidth: '340px', width: '100%', textAlign: 'center',
          boxShadow: '0 30px 70px rgba(0,0,0,0.35)',
        }}
      >
        <div style={{ fontSize: '2.2rem', marginBottom: '0.4rem' }}>🎟️</div>
        <h3 style={{ margin: '0 0 0.3rem', fontSize: '1rem', fontWeight: 700, color: '#1a1a2e' }}>
          Check-in Ticket
        </h3>
        <p style={{ margin: '0 0 1.25rem', fontSize: '0.82rem', color: '#777', lineHeight: 1.4 }}>
          {eventTitle}
        </p>
        <div style={{ background: '#f8f8ff', borderRadius: '12px', padding: '0.75rem', display: 'inline-block', border: '1px solid #e5e5f5' }}>
          <img src={qrUrl} alt="QR check-in" style={{ width: 220, height: 220, display: 'block' }} />
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1.25rem' }}>
          <button
            onClick={onClose}
            style={{
              flex: 1, padding: '0.65rem', background: '#6366f1', color: '#fff',
              border: 'none', borderRadius: '10px', cursor: 'pointer',
              fontWeight: 700, fontSize: '0.88rem',
            }}
          >
            Close
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Event Row ─────────────────────────────────────────────────────────────────
function EventRow({ reg, onShowQR, navigate }) {
  const event = reg.event_id || {}
  const club  = event.club_id || {}

  const startDate = event.start_time
    ? new Date(event.start_time).toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' })
    : '—'
  const startTime = event.start_time
    ? new Date(event.start_time).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
    : ''

  const checkInOpen = event.check_in_status === 'open'

  const STATUS = {
    pending:    { label: 'Pending',              bg: '#fffbeb', color: '#b45309', border: '#fef3c7' },
    approved:   { label: 'Ready for Check-in',   bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
    registered: { label: 'Ready for Check-in',   bg: '#fff7ed', color: '#c2410c', border: '#fed7aa' },
    attended:   { label: '✓ Checked In',         bg: '#f0fdf4', color: '#166534', border: '#bbf7d0' },
    absent:     { label: 'Absent',               bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
    cancelled:  { label: 'Cancelled',            bg: '#f9fafb', color: '#6b7280', border: '#e5e7eb' },
    rejected:   { label: 'Rejected',             bg: '#fef2f2', color: '#991b1b', border: '#fecaca' },
  }
  const st = STATUS[reg.status] || STATUS.registered

  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      padding: '1.1rem 1.25rem', background: '#fcfaf7',
      border: '1px solid #f0e4d8', borderRadius: '14px',
      gap: '1rem', flexWrap: 'wrap', transition: 'box-shadow 0.2s',
    }}>
      {/* Left: info */}
      <div style={{ flex: '1 1 260px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem', flexWrap: 'wrap' }}>
          <h3 style={{ margin: 0, fontSize: '1rem', color: '#3d2e24', fontWeight: 700 }}>
            {event.title || 'Event'}
          </h3>
          {checkInOpen && (
            <span style={{
              display: 'inline-flex', alignItems: 'center', gap: '0.25rem',
              padding: '2px 8px', borderRadius: '8px',
              background: '#dcfce7', color: '#166534', fontSize: '0.7rem', fontWeight: 700,
            }}>
              <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
              Check-in OPEN
            </span>
          )}
        </div>
        <p style={{ margin: 0, fontSize: '0.8rem', color: '#8c7e95' }}>
          🏢 {club.name || '—'} &nbsp;·&nbsp; 📅 {startDate} {startTime}
        </p>
        <p style={{ margin: '0.2rem 0 0', fontSize: '0.78rem', color: '#aaa' }}>
          📍 {event.location || '—'}
        </p>
      </div>

      {/* Right: status + actions */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexShrink: 0 }}>
        <span style={{
          padding: '4px 12px', borderRadius: '999px', fontSize: '0.75rem', fontWeight: 600,
          background: st.bg, color: st.color, border: `1px solid ${st.border}`,
          whiteSpace: 'nowrap',
        }}>
          {st.label}
        </span>

        {/* QR button – show when open & not cancelled/absent */}
        {(reg.status === 'registered' || reg.status === 'approved' || reg.status === 'attended') && (
          <button
            onClick={() => onShowQR(reg)}
            title="View QR check-in code"
            style={{
              padding: '0.5rem 0.9rem', border: 'none', borderRadius: '10px', cursor: 'pointer',
              background: checkInOpen ? '#6366f1' : '#f3f4f6',
              color: checkInOpen ? '#fff' : '#6b7280',
              fontWeight: 700, fontSize: '0.78rem',
              display: 'flex', alignItems: 'center', gap: '0.3rem',
              boxShadow: checkInOpen ? '0 2px 10px rgba(99,102,241,0.25)' : 'none',
              transition: 'all 0.2s',
            }}
          >
            🎟️ {checkInOpen ? 'QR Check-in' : 'View Ticket'}
          </button>
        )}

        <button
          type="button"
          onClick={() => navigate(`/events/${event._id}`)}
          style={{
            padding: '0.5rem 0.9rem', background: '#F57C00', color: '#fff',
            border: 'none', borderRadius: '10px', cursor: 'pointer',
            fontSize: '0.78rem', fontWeight: 700,
            boxShadow: '0 2px 8px rgba(245,124,0,0.2)',
          }}
        >
          Details
        </button>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
function MyEventsPage() {
  const navigate = useNavigate()
  const [clubsCount, setClubsCount] = useState(0)
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)
  const [qrReg, setQrReg] = useState(null)

  useEffect(() => {
    let active = true
    setLoading(true)
    Promise.all([
      getMyClubs().catch(() => ({ data: [] })),
      getMyRegistrations().catch(() => ({ data: [] })),
    ]).then(([clubsRes, regRes]) => {
      if (!active) return
      setClubsCount(clubsRes.data?.length || 0)
      // API returns { success, data: [...] } – support both shapes
      const regs = regRes.data?.data || regRes.data || []
      setRegistrations(Array.isArray(regs) ? regs : [])
      setLoading(false)
    }).catch(err => {
      console.error('MyEventsPage error:', err)
      if (active) setLoading(false)
    })
    return () => { active = false }
  }, [])

  const openRegs     = registrations.filter(r => r.event_id?.check_in_status === 'open' && (r.status === 'registered' || r.status === 'approved'))
  const upcomingRegs = registrations.filter(r => r.status === 'pending' || ((r.status === 'registered' || r.status === 'approved') && r.event_id?.check_in_status !== 'open'))
  const doneRegs     = registrations.filter(r => ['attended','absent','cancelled','rejected'].includes(r.status))

  return (
    <main style={{ padding: '2rem', maxWidth: '900px', margin: '0 auto' }}>
      {/* QR Modal */}
      {qrReg && (
        <QRModal
          registrationId={qrReg._id}
          eventTitle={qrReg.event_id?.title}
          onClose={() => setQrReg(null)}
        />
      )}

      {/* Hero */}
      <section style={{ marginBottom: '1.75rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#3d2e24', margin: '0 0 0.4rem', fontWeight: 800 }}>
          🎟️ My Events
        </h1>
        <p style={{ color: '#8c7e95', margin: 0, fontSize: '0.9rem' }}>
          Events you have registered for – click <strong>QR Check-in</strong> when check-in is open to display your scan code.
        </p>
      </section>

      {/* Stats */}
      <section style={{ display: 'flex', gap: '1rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
        {[
          { num: clubsCount,           label: 'Clubs' },
          { num: registrations.length, label: 'Registered' },
          { num: openRegs.length,      label: 'Check-in Open', highlight: openRegs.length > 0 },
          { num: doneRegs.filter(r => r.status === 'attended').length, label: 'Attended' },
        ].map(s => (
          <div key={s.label} style={{
            flex: '1 1 120px', padding: '1rem 1.25rem', background: '#fff',
            border: `1px solid ${s.highlight ? '#bbf7d0' : '#f0e4d8'}`,
            borderRadius: '14px', textAlign: 'center',
            boxShadow: s.highlight ? '0 2px 12px rgba(34,197,94,0.12)' : '0 2px 8px rgba(92,64,51,0.04)',
          }}>
            <span style={{ display: 'block', fontSize: '1.75rem', fontWeight: 800, color: s.highlight ? '#16a34a' : '#F57C00' }}>
              {s.num}
            </span>
            <span style={{ fontSize: '0.78rem', color: '#8c7e95', fontWeight: 600 }}>{s.label}</span>
          </div>
        ))}
      </section>

      {/* Content */}
      <section style={{ background: '#fff', border: '1px solid #f0e4d8', borderRadius: '20px', padding: '1.5rem', boxShadow: '0 4px 16px rgba(92,64,51,0.05)' }}>
        {loading && <p style={{ textAlign: 'center', color: '#8c7e95', padding: '3rem 0' }}>Loading...</p>}

        {!loading && registrations.length === 0 && (
          <div style={{ textAlign: 'center', padding: '4rem 1.5rem' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📭</div>
            <p style={{ color: '#8c7e95', marginBottom: '1.5rem' }}>You have not registered for any events yet.</p>
            <button onClick={() => navigate('/events')} style={{ padding: '0.6rem 1.5rem', background: '#F57C00', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700 }}>
              Explore Events
            </button>
          </div>
        )}

        {!loading && registrations.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {/* Check-in open first */}
            {openRegs.length > 0 && (
              <>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.78rem', fontWeight: 700, color: '#16a34a', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  🟢 Check-in Open
                </p>
                {openRegs.map(r => <EventRow key={r._id} reg={r} onShowQR={setQrReg} navigate={navigate} />)}
                {(upcomingRegs.length > 0 || doneRegs.length > 0) && <hr style={{ border: 'none', borderTop: '1px dashed #f0e4d8', margin: '0.25rem 0' }} />}
              </>
            )}

            {/* Upcoming */}
            {upcomingRegs.length > 0 && (
              <>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.78rem', fontWeight: 700, color: '#6366f1', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  📅 Registered Events
                </p>
                {upcomingRegs.map(r => <EventRow key={r._id} reg={r} onShowQR={setQrReg} navigate={navigate} />)}
                {doneRegs.length > 0 && <hr style={{ border: 'none', borderTop: '1px dashed #f0e4d8', margin: '0.25rem 0' }} />}
              </>
            )}

            {/* Done */}
            {doneRegs.length > 0 && (
              <>
                <p style={{ margin: '0 0 0.25rem', fontSize: '0.78rem', fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  📁 Past Events
                </p>
                {doneRegs.map(r => <EventRow key={r._id} reg={r} onShowQR={setQrReg} navigate={navigate} />)}
              </>
            )}
          </div>
        )}
      </section>
    </main>
  )
}

export default MyEventsPage
