import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { getMyClubs } from '../../api/memberClubMembership.api'
import { getMyRegistrations } from '../../api/event.api'

function MyEventsPage() {
  const navigate = useNavigate()
  const [clubsCount, setClubsCount] = useState(0)
  const [registrations, setRegistrations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let active = true
    async function fetchStatsAndEvents() {
      setLoading(true)
      try {
        const [clubsRes, regRes] = await Promise.all([
          getMyClubs().catch(() => ({ data: [] })),
          getMyRegistrations().catch(() => ({ data: [] })),
        ])

        if (!active) return

        setClubsCount(clubsRes.data?.length || 0)
        setRegistrations(regRes.data || [])
      } catch (err) {
        console.error("Error fetching stats and events:", err)
      } finally {
        if (active) setLoading(false)
      }
    }

    fetchStatsAndEvents()
    return () => { active = false }
  }, [])

  return (
    <main className="my-events-page" style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <section className="my-events-hero" style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2.2rem', color: '#3d2e24', margin: '0 0 0.5rem' }}>My Registered Events</h1>
        <p style={{ color: '#6f6676', margin: 0 }}>View your registration tickets and the status of your event participations.</p>
      </section>

      {/* User Stats Summary */}
      <section className="my-profile-stats" style={{
        display: 'flex',
        gap: '1.5rem',
        marginBottom: '2rem'
      }}>
        <div className="my-profile-stat-card" style={{
          flex: 1,
          padding: '1.25rem',
          background: '#ffffff',
          border: '1px solid #f0e4d8',
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 4px 16px rgba(92, 64, 51, 0.03)'
        }}>
          <span className="my-profile-stat-num" style={{
            display: 'block',
            fontSize: '2rem',
            fontWeight: '800',
            color: '#F57C00',
            marginBottom: '0.2rem'
          }}>{clubsCount}</span>
          <span className="my-profile-stat-label" style={{
            fontSize: '0.85rem',
            color: '#6f6676',
            fontWeight: '600'
          }}>Clubs Joined</span>
        </div>
        <div className="my-profile-stat-card" style={{
          flex: 1,
          padding: '1.25rem',
          background: '#ffffff',
          border: '1px solid #f0e4d8',
          borderRadius: '16px',
          textAlign: 'center',
          boxShadow: '0 4px 16px rgba(92, 64, 51, 0.03)'
        }}>
          <span className="my-profile-stat-num" style={{
            display: 'block',
            fontSize: '2rem',
            fontWeight: '800',
            color: '#F57C00',
            marginBottom: '0.2rem'
          }}>{registrations.length}</span>
          <span className="my-profile-stat-label" style={{
            fontSize: '0.85rem',
            color: '#6f6676',
            fontWeight: '600'
          }}>Events Registered</span>
        </div>
      </section>

      {/* User's Registered Events Section */}
      <section className="my-profile-form-card" style={{
        background: '#ffffff',
        border: '1px solid #f0e4d8',
        borderRadius: '20px',
        boxShadow: '0 4px 16px rgba(92, 64, 51, 0.05)',
        padding: '1.5rem',
        margin: '0 auto'
      }}>
        {loading ? (
          <p style={{ textAlign: 'center', color: '#6f6676', margin: '2rem 0' }}>Loading your events...</p>
        ) : registrations.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1.5rem' }}>
            <p style={{ color: '#6f6676', fontSize: '0.95rem', margin: '0 0 1.5rem' }}>
              You haven't registered for any events yet.
            </p>
            <button
              type="button"
              onClick={() => navigate('/events')}
              style={{
                padding: '0.6rem 1.5rem',
                background: '#F57C00',
                color: '#fff',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem'
              }}
            >
              Browse Events
            </button>
          </div>
        ) : (
          <div className="profile-events-list" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {registrations.map((reg) => {
              const event = reg.event_id || {}
              const club = event.club_id || {}
              const startDate = event.start_time ? new Date(event.start_time).toLocaleDateString('vi-VN') : ''
              
              let statusLabel = reg.status
              if (reg.status === 'approved') statusLabel = 'Approved'
              else if (reg.status === 'pending') statusLabel = 'Pending'
              else if (reg.status === 'rejected') statusLabel = 'Rejected'
              else if (reg.status === 'attended') statusLabel = 'Attended'
              else if (reg.status === 'cancelled') statusLabel = 'Cancelled'

              return (
                <div key={reg._id} className="profile-event-row" style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '1.2rem',
                  background: '#fcfaf7',
                  border: '1px solid #f0e4d8',
                  borderRadius: '14px',
                  gap: '1rem',
                  flexWrap: 'wrap',
                  transition: 'all 0.2s ease'
                }}>
                  <div style={{ flex: '1 1 280px' }}>
                    <h3 style={{ margin: '0 0 0.4rem', fontSize: '1.05rem', color: '#3d2e24', fontWeight: '700' }}>
                      {event.title || 'Untitled Event'}
                    </h3>
                    <p style={{ margin: '0 0 0.3rem', fontSize: '0.85rem', color: '#6f6676' }}>
                      Organizer: <strong style={{ color: '#3d2e24' }}>{club.name || 'UniClub'}</strong>
                    </p>
                    <small style={{ color: '#8c7e95', fontSize: '0.8rem' }}>
                      Date: {startDate} | Location: {event.location || 'Campus'}
                    </small>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexShrink: 0, marginLeft: 'auto' }}>
                    <span className={`profile-event-status-badge status-${reg.status}`} style={{
                      padding: '0.4rem 0.85rem',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      borderRadius: '999px',
                      textTransform: 'capitalize',
                      background: reg.status === 'approved' ? '#e2f9e6' : 
                                  reg.status === 'pending' ? '#fff4e6' : 
                                  reg.status === 'attended' ? '#e6f3ff' : 
                                  reg.status === 'cancelled' ? '#f3f4f6' : '#fce8e6',
                      color: reg.status === 'approved' ? '#1b8a36' : 
                             reg.status === 'pending' ? '#d97706' : 
                             reg.status === 'attended' ? '#0284c7' : 
                             reg.status === 'cancelled' ? '#4b5563' : '#dc2626'
                    }}>
                      {statusLabel}
                    </span>
                    <button
                      type="button"
                      onClick={() => navigate(`/events/${event._id || event.id}`)}
                      style={{
                        padding: '0.55rem 1.1rem',
                        background: '#F57C00',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        boxShadow: '0 2px 6px rgba(245, 124, 0, 0.15)'
                      }}
                    >
                      View Ticket
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </section>
    </main>
  )
}

export default MyEventsPage
