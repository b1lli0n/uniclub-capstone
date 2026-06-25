import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import ClubLogo from '../../components/home/ClubLogo'
import { getClubById } from '../../api/club.api'
import { removeMember } from '../../api/clubMember.api'
import { getClubMembers, getMyClubs, leaveClub } from '../../api/memberClubMembership.api'
import {
  getClubJoinForm,
  submitJoinRequest,
} from '../../api/studentClubMembership.api'
import { formatRoleLabel, mapClubFromApi, mapMemberFromApi } from '../../api/clubMappers'
import { CLUB_DETAIL_COPY, ALL_EVENTS } from '../../data/mockData'
import '../../styles/club-detail.css'

function EventIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
      <path d="M8 14h.01M12 14h.01M16 14h.01M8 18h.01M12 18h.01" strokeLinecap="round" />
    </svg>
  )
}

function ClubDetailPage({ clubId, onBack }) {
  const navigate = useNavigate()
  const [joinModalOpen, setJoinModalOpen] = useState(false)
  const [leaveModalOpen, setLeaveModalOpen] = useState(false)
  const [membersModalOpen, setMembersModalOpen] = useState(false)
  const [club, setClub] = useState(null)
  const [memberRows, setMemberRows] = useState([])
  const [currentMembership, setCurrentMembership] = useState(null)
  const [joinForm, setJoinForm] = useState(null)
  const [joinAnswers, setJoinAnswers] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    let cancelled = false

    async function loadClubDetail() {
      setLoading(true)
      try {
        const [clubResponse, membersResponse, myClubsResponse] = await Promise.all([
          getClubById(clubId),
          getClubMembers(clubId).catch(() => ({ data: [] })),
          getMyClubs().catch(() => ({ data: [] })),
        ])

        if (cancelled) return

        setClub(mapClubFromApi(clubResponse.data, { memberCount: membersResponse.data?.length }))
        setMemberRows((membersResponse.data || []).map((member, index) => mapMemberFromApi(member, index)))

        const membership = (myClubsResponse.data || []).find((item) => {
          const id = item.club_id?._id || item.club_id
          return String(id) === String(clubId)
        })

        setCurrentMembership(
          membership
            ? {
                clubId,
                role: formatRoleLabel(membership.role),
                rawRole: membership.role,
              }
            : null,
        )
      } catch (error) {
        console.error(error)
        if (!cancelled) {
          setClub(null)
          setMemberRows([])
          setCurrentMembership(null)
        }
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    loadClubDetail()
    return () => {
      cancelled = true
    }
  }, [clubId])

  const isClubMember = Boolean(currentMembership)
  const canManageMembers = currentMembership?.rawRole === 'president'
  const detailDescription = club
    ? `${club.description}. ${CLUB_DETAIL_COPY.descriptionSuffix}`
    : ''
  const previewMembers = memberRows.slice(0, 4)
  const clubEvents = club ? ALL_EVENTS.filter((event) => event.clubId === club.id) : []
  const visibleClubEvents = clubEvents.filter(
    (event) => event.visibility !== 'private' || isClubMember
  )
  const previewClubEvents = visibleClubEvents.slice(0, 3)
  const hiddenPrivateEventsCount = clubEvents.length - visibleClubEvents.length

  async function openJoinModal() {
    try {
      const response = await getClubJoinForm(clubId)
      const form = response.data
      setJoinForm(form)
      setJoinAnswers((form.questions || []).map(() => ''))
      setJoinModalOpen(true)
    } catch (error) {
      console.error(error)
      alert(error.message)
    }
  }

  async function handleJoinSubmit(event) {
    event.preventDefault()
    if (!joinForm) return

    setSubmitting(true)
    try {
      await submitJoinRequest(clubId, {
        form_id: joinForm._id,
        answers: joinAnswers,
      })
      setJoinModalOpen(false)
      alert('Join request submitted successfully')
    } catch (error) {
      console.error(error)
      alert(error.message)
    } finally {
      setSubmitting(false)
    }
  }

  async function handleLeaveConfirm() {
    try {
      await leaveClub(clubId)
      setCurrentMembership(null)
      setLeaveModalOpen(false)
      onBack?.()
    } catch (error) {
      console.error(error)
      alert(error.message)
    }
  }

  async function handleRemoveMember(memberId) {
    try {
      await removeMember(clubId, memberId)
      setMemberRows((members) => members.filter((member) => member.id !== memberId))
    } catch (error) {
      console.error(error)
      alert(error.message)
    }
  }

  if (loading) {
    return (
      <div className="club-detail-page">
        <p>Loading club details...</p>
      </div>
    )
  }

  if (!club) {
    return (
      <div className="club-detail-page">
        <button type="button" className="club-product__back" onClick={onBack}>
          Back
        </button>
        <p>Club not found.</p>
      </div>
    )
  }

  return (
    <div className="club-detail-page">
      <section className="club-product">
        <div className="club-product__top">
          <button type="button" className="club-product__back" onClick={onBack}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Back
          </button>
          <h1>{club.name}</h1>
          <span>{club.categoryLabel}</span>
        </div>

        <div className="club-product-card">
          <div className="club-product-card__copy">
            <span>Club slogan</span>
            <h2>{CLUB_DETAIL_COPY.slogan}</h2>
            <p>{club.description}</p>
          </div>

          <div className="club-product-card__logo-wrap">
            <div className="club-product-card__halo" />
            <ClubLogo club={club} className="club-product-card__logo" />
          </div>

          <div className="club-product-card__description">
            <span>Club description</span>
            <p>{detailDescription}</p>
            <div className="club-product-card__meta">
              <div>
                <strong>{memberRows.length}</strong>
                <small>Members</small>
              </div>
              <div>
                <strong>{club.events}</strong>
                <small>Events</small>
              </div>
            </div>
            <button
              type="button"
              className={isClubMember ? 'club-product-card__leave-btn' : undefined}
              onClick={() => {
                if (isClubMember) {
                  setLeaveModalOpen(true)
                  return
                }

                openJoinModal()
              }}
            >
              {isClubMember ? 'Leave Club' : 'Join Now'}
            </button>
          </div>
        </div>
      </section>

      <section className="club-detail-section">
        <div className="club-detail-section__header">
          <div>
            <h2>Ongoing Events</h2>
            <p>
              {isClubMember
                ? 'Public and member-only activities inside this club'
                : 'Public activities available to all students'}
            </p>
          </div>
          <button type="button" onClick={() => navigate(`/clubs/${club.id}/events`)}>
            View all
          </button>
        </div>

        <div className="club-event-grid">
          {previewClubEvents.map((event) => (
            <article
              key={event.id}
              className="club-event-card club-event-card--clickable"
              role="button"
              tabIndex={0}
              onClick={() => navigate(`/clubs/${club.id}/events/${event.id}`)}
              onKeyDown={(keyEvent) => {
                if (keyEvent.key === 'Enter' || keyEvent.key === ' ') {
                  keyEvent.preventDefault()
                  navigate(`/clubs/${club.id}/events/${event.id}`)
                }
              }}
            >
              <div className="club-event-card__icon">
                <EventIcon />
              </div>
              <div className="club-event-card__badges">
                <span className="club-event-card__tag">{event.checkinOpen ? 'Open' : 'Upcoming'}</span>
                <span className={`club-event-card__visibility club-event-card__visibility--${event.visibility || 'public'}`}>
                  {event.visibility === 'private' ? 'Private' : 'Public'}
                </span>
              </div>
              <h3>{event.name}</h3>
              <p>{event.description}</p>
              <small>{event.date} - {event.location || 'Campus'}</small>
            </article>
          ))}
        </div>

        {hiddenPrivateEventsCount > 0 ? (
          <p className="club-event-private-note">
            {hiddenPrivateEventsCount} private event{hiddenPrivateEventsCount > 1 ? 's are' : ' is'} visible to club members only.
          </p>
        ) : null}
      </section>

      <section className="club-detail-section">
        <div className="club-detail-section__header">
          <div>
            <h2>Members</h2>
            <p>Core members of the club</p>
          </div>
          <button type="button" onClick={() => setMembersModalOpen(true)}>View all members</button>
        </div>

        <div className="club-detail-members">
          {previewMembers.map((member) => (
            <article key={member.id} className="club-detail-member" style={{ '--member-tone': member.tone }}>
              <div className="club-detail-member__avatar">{member.name.slice(0, 1)}</div>
              <strong>{member.name}</strong>
              <span>{member.role}</span>
            </article>
          ))}
        </div>
      </section>

      {joinModalOpen ? (
        <div className="club-join-modal" role="dialog" aria-modal="true" aria-labelledby="club-join-title">
          <button
            type="button"
            className="club-join-modal__backdrop"
            aria-label="Close join form"
            onClick={() => setJoinModalOpen(false)}
          />
          <form className="club-join-modal__panel" onSubmit={handleJoinSubmit}>
            <div className="club-join-modal__header">
              <h2 id="club-join-title">Join {club.name}</h2>
              <button type="button" onClick={() => setJoinModalOpen(false)} aria-label="Close">X</button>
            </div>

            {(joinForm?.questions || []).map((question, index) => (
              <label key={`${question}-${index}`} className="club-join-modal__field">
                <span>{question}</span>
                <textarea
                  placeholder="Your answer"
                  rows={3}
                  value={joinAnswers[index] || ''}
                  onChange={(event) => {
                    const nextAnswers = [...joinAnswers]
                    nextAnswers[index] = event.target.value
                    setJoinAnswers(nextAnswers)
                  }}
                  required
                />
              </label>
            ))}

            <div className="club-join-modal__actions">
              <button type="submit" disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            </div>
          </form>
        </div>
      ) : null}

      {leaveModalOpen ? (
        <div className="club-leave-modal" role="dialog" aria-modal="true" aria-labelledby="club-leave-title">
          <button
            type="button"
            className="club-leave-modal__backdrop"
            aria-label="Close leave confirmation"
            onClick={() => setLeaveModalOpen(false)}
          />
          <div className="club-leave-modal__panel">
            <h2 id="club-leave-title">Leave this club?</h2>
            <p>
              Are you sure you want to leave {club.name}? You can send a join request again later.
            </p>
            <div className="club-leave-modal__actions">
              <button type="button" className="club-leave-modal__cancel" onClick={() => setLeaveModalOpen(false)}>
                Cancel
              </button>
              <button type="button" className="club-leave-modal__confirm" onClick={handleLeaveConfirm}>
                Leave Club
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {membersModalOpen ? (
        <div className="club-members-modal" role="dialog" aria-modal="true" aria-labelledby="club-members-title">
          <button
            type="button"
            className="club-members-modal__backdrop"
            aria-label="Close member list"
            onClick={() => setMembersModalOpen(false)}
          />
          <div className="club-members-modal__panel">
            <div className="club-members-modal__header">
              <div>
                <h2 id="club-members-title">All members</h2>
                <p>{club.name} - {memberRows.length} members</p>
              </div>
              <button type="button" onClick={() => setMembersModalOpen(false)}>Close</button>
            </div>

            <div className="club-members-modal__list">
              {memberRows.map((member) => (
                <article key={member.id} className="club-members-modal__item" style={{ '--member-tone': member.tone }}>
                  <div className="club-members-modal__member-info">
                    <div className="club-members-modal__avatar">
                      {member.name.slice(0, 1)}
                    </div>
                    <div>
                      <strong>{member.name}</strong>
                      <span>{member.role}</span>
                    </div>
                  </div>
                  {canManageMembers && member.rawRole !== 'president' ? (
                    <button
                      type="button"
                      className="club-members-modal__remove"
                      onClick={() => handleRemoveMember(member.id)}
                    >
                      Remove
                    </button>
                  ) : null}
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ClubDetailPage
