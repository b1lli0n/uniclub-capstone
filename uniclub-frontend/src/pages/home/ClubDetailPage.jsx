import { useState } from 'react'
import ClubLogo from '../../components/home/ClubLogo'
// Mock data import: replace with API data when BE is ready.
import {
  ALL_CLUBS,
  CLUB_DETAIL_COPY,
  CLUB_EVENTS,
  CLUB_MEMBERS,
  JOIN_FORM_QUESTIONS,
  MY_CLUB_MEMBERSHIPS,
} from '../../data/mockData'
import '../../styles/club-detail.css'

const CLUB_DETAIL_FALLBACK = ALL_CLUBS[0]

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
  const [joinModalOpen, setJoinModalOpen] = useState(false)
  const [leaveModalOpen, setLeaveModalOpen] = useState(false)
  const [membersModalOpen, setMembersModalOpen] = useState(false)
  const club = ALL_CLUBS.find((item) => item.id === clubId) || CLUB_DETAIL_FALLBACK
  const isClubMember = MY_CLUB_MEMBERSHIPS.some((membership) => membership.clubId === club.id)
  const detailDescription = `${club.description}. ${CLUB_DETAIL_COPY.descriptionSuffix}`
  const previewMembers = CLUB_MEMBERS.slice(0, 4)

  function handleJoinSubmit(event) {
    event.preventDefault()
    setJoinModalOpen(false)
  }

  function handleLeaveConfirm() {
    // BE hook: call leave-club API here, then refresh membership data.
    setLeaveModalOpen(false)
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
                <strong>{club.members}</strong>
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

                setJoinModalOpen(true)
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
            <p>Featured activities inside this club</p>
          </div>
          <button type="button">View all</button>
        </div>

        <div className="club-event-grid">
          {CLUB_EVENTS.map((event) => (
            <article key={event.id} className="club-event-card">
              <div className="club-event-card__icon">
                <EventIcon />
              </div>
              <span>{event.tag}</span>
              <h3>{event.title}</h3>
              <p>{event.description}</p>
              <small>{event.meta}</small>
            </article>
          ))}
        </div>
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

            {JOIN_FORM_QUESTIONS.map((question) => (
              <label key={question.id} className="club-join-modal__field">
                <span>{question.label}</span>
                <textarea placeholder={question.placeholder} rows={3} />
              </label>
            ))}

            <div className="club-join-modal__actions">
              <button type="submit">Submit</button>
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
                <p>{club.name} - {CLUB_MEMBERS.length} members</p>
              </div>
              <button type="button" onClick={() => setMembersModalOpen(false)}>Close</button>
            </div>

            <div className="club-members-modal__list">
              {CLUB_MEMBERS.map((member) => (
                <article key={member.id} className="club-members-modal__item" style={{ '--member-tone': member.tone }}>
                  <div className="club-members-modal__avatar">
                    {member.name.slice(0, 1)}
                  </div>
                  <div>
                    <strong>{member.name}</strong>
                    <span>{member.role}</span>
                  </div>
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
