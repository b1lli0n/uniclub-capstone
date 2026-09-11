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
import {
  getPublicEvents,
  getClubEventsForMember,
} from '../../api/event.api'
import { getUserProfileById } from '../../api/profile.api'
import { formatRoleLabel, mapClubFromApi, mapMemberFromApi } from '../../api/clubMappers'
import { CLUB_DETAIL_COPY } from '../../data/mockData'
import { useConfirm, useToast } from '../../components/common/notificationContext'
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

function mapEventFromApi(apiEvent) {
  if (!apiEvent) return null
  const startDate = apiEvent.start_time ? new Date(apiEvent.start_time) : null
  const formattedDate = startDate ? startDate.toLocaleDateString('vi-VN') : ''
  const formattedTime = startDate ? startDate.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }) : ''

  return {
    id: apiEvent._id || apiEvent.id,
    name: apiEvent.title || '',
    description: apiEvent.description || '',
    date: formattedDate,
    time: formattedTime,
    location: apiEvent.location || 'Campus',
    visibility: apiEvent.is_public ? 'public' : 'private',
    checkinOpen: apiEvent.check_in_status === 'open',
  }
}

function ClubDetailPage({ clubId, onBack }) {
  const navigate = useNavigate()
  const confirm = useConfirm()
  const showToast = useToast()
  const [joinModalOpen, setJoinModalOpen] = useState(false)
  const [leaveModalOpen, setLeaveModalOpen] = useState(false)
  const [membersModalOpen, setMembersModalOpen] = useState(false)
  const [profileModalOpen, setProfileModalOpen] = useState(false)
  const [selectedMemberProfile, setSelectedMemberProfile] = useState(null)
  const [profileLoading, setProfileLoading] = useState(false)
  const [club, setClub] = useState(null)
  const [memberRows, setMemberRows] = useState([])
  const [currentMembership, setCurrentMembership] = useState(null)
  const [joinForm, setJoinForm] = useState(null)
  const [joinAnswers, setJoinAnswers] = useState([])
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)

  async function handleViewMemberProfile(member) {
    if (!member) return
    setSelectedMemberProfile({
      id: member.id,
      userId: member.userId,
      name: member.name,
      email: member.email || '',
      role: member.role,
      rawRole: member.rawRole,
      avatarUrl: member.avatarUrl || '',
      tone: member.tone || '#f5b87a',
      joinedDate: member.joinedDate || '',
      rewardPoint: member.rewardPoint || 0,
      rankingPoint: member.rankingPoint || 0,
      studentCode: '',
      phone: '',
      campus: '',
    })
    setProfileModalOpen(true)

    const targetUserId = member.userId || member.id
    if (targetUserId) {
      setProfileLoading(true)
      try {
        const res = await getUserProfileById(targetUserId)
        if (res?.data) {
          const u = res.data.user || {}
          const p = res.data.profile || {}
          setSelectedMemberProfile((prev) => ({
            ...prev,
            name: u.full_name || prev.name,
            email: u.email || prev.email,
            avatarUrl: p.avatar || u.avatar_url || prev.avatarUrl,
            studentCode: p.student_code || '',
            phone: p.phone || '',
            campus: p.campus || '',
          }))
        }
      } catch (err) {
        console.warn('Could not fetch full user profile:', err)
      } finally {
        setProfileLoading(false)
      }
    }
  }

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

        const isMember = Boolean(membership)

        // Fetch events based on membership status
        let eventsRes
        if (isMember) {
          eventsRes = await getClubEventsForMember(clubId).catch(() => ({ data: [] }))
        } else {
          eventsRes = await getPublicEvents({ clubId }).catch(() => ({ data: [] }))
        }

        if (cancelled) return

        setEvents((eventsRes.data || []).map((ev) => mapEventFromApi(ev)))

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
  const previewClubEvents = events.slice(0, 3)
  const hiddenPrivateEventsCount = 0

  async function openJoinModal() {
    try {
      const response = await getClubJoinForm(clubId)
      const form = response.data
      setJoinForm(form)
      setJoinAnswers((form.questions || []).map(() => ''))
      setJoinModalOpen(true)
    } catch (error) {
      console.error(error)
      showToast({
        type: 'error',
        title: 'Form unavailable',
        message: error.message || 'Could not load the join form.',
      })
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
      // Hiển thị thông báo cho chức năng gửi yêu cầu tham gia câu lạc bộ.
      showToast({
        type: 'success',
        title: 'Join request sent',
        message: 'Your join request has been submitted successfully.',
      })
    } catch (error) {
      console.error(error)
      showToast({
        type: 'error',
        title: 'Submit failed',
        message: error.message || 'Could not submit your join request.',
      })
    } finally {
      setSubmitting(false)
    }
  }

  async function handleLeaveConfirm() {
    try {
      await leaveClub(clubId)
      setCurrentMembership(null)
      setLeaveModalOpen(false)
      // Hiển thị thông báo cho chức năng rời câu lạc bộ.
      showToast({
        type: 'success',
        title: 'Left club',
        message: `You have left ${club?.name || 'this club'}.`,
      })
      onBack?.()
    } catch (error) {
      console.error(error)
      showToast({
        type: 'error',
        title: 'Leave failed',
        message: error.message || 'Could not leave this club.',
      })
    }
  }

  async function handleRemoveMember(memberId) {
    const targetMember = memberRows.find((member) => member.id === memberId)
    const accepted = await confirm({
      title: 'Remove member?',
      message: `Remove ${targetMember?.name || 'this member'} from ${club?.name || 'this club'}?`,
      confirmText: 'Remove',
      tone: 'danger',
    })

    if (!accepted) return

    try {
      await removeMember(clubId, memberId)
      setMemberRows((members) => members.filter((member) => member.id !== memberId))
      // Hiển thị thông báo cho chức năng xóa thành viên khỏi câu lạc bộ.
      showToast({
        type: 'success',
        title: 'Member removed',
        message: `${targetMember?.name || 'The member'} has been removed from the club.`,
      })
    } catch (error) {
      console.error(error)
      showToast({
        type: 'error',
        title: 'Remove failed',
        message: error.message || 'Could not remove this member.',
      })
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
            <p>Core members of the club (click to view profile)</p>
          </div>
          <button type="button" onClick={() => setMembersModalOpen(true)}>View all members</button>
        </div>

        <div className="club-detail-members">
          {previewMembers.map((member) => (
            <article
              key={member.id}
              className="club-detail-member club-detail-member--clickable"
              style={{ '--member-tone': member.tone, cursor: 'pointer' }}
              onClick={() => handleViewMemberProfile(member)}
              title="Click to view profile"
            >
              <div className="club-detail-member__avatar">
                {member.avatarUrl ? (
                  <img
                    src={member.avatarUrl}
                    alt={member.name}
                    style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  member.name.slice(0, 1).toUpperCase()
                )}
              </div>
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
                  <div
                    className="club-members-modal__member-info"
                    style={{ cursor: 'pointer' }}
                    onClick={() => handleViewMemberProfile(member)}
                    title="Click to view member profile"
                  >
                    <div className="club-members-modal__avatar">
                      {member.avatarUrl ? (
                        <img
                          src={member.avatarUrl}
                          alt={member.name}
                          style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }}
                        />
                      ) : (
                        member.name.slice(0, 1).toUpperCase()
                      )}
                    </div>
                    <div>
                      <strong>{member.name}</strong>
                      <span>{member.role}</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                    <button
                      type="button"
                      className="club-members-modal__view-btn"
                      onClick={() => handleViewMemberProfile(member)}
                    >
                      View Profile
                    </button>
                    {canManageMembers && member.rawRole !== 'president' ? (
                      <button
                        type="button"
                        className="club-members-modal__remove"
                        onClick={() => handleRemoveMember(member.id)}
                      >
                        Remove
                      </button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {profileModalOpen && selectedMemberProfile ? (
        <div className="club-profile-modal" role="dialog" aria-modal="true" aria-labelledby="member-profile-modal-title">
          <button
            type="button"
            className="club-profile-modal__backdrop"
            aria-label="Close profile"
            onClick={() => setProfileModalOpen(false)}
          />
          <div className="club-profile-modal__panel">
            <div className="club-profile-modal__header">
              <h2 id="member-profile-modal-title">Member Profile</h2>
              <button type="button" onClick={() => setProfileModalOpen(false)} aria-label="Close">✕</button>
            </div>

            <div className="club-profile-modal__body">
              <div className="club-profile-modal__user-card">
                <div
                  className="club-profile-modal__avatar"
                  style={{ background: selectedMemberProfile.tone || '#f5b87a' }}
                >
                  {selectedMemberProfile.avatarUrl ? (
                    <img src={selectedMemberProfile.avatarUrl} alt={selectedMemberProfile.name} />
                  ) : (
                    selectedMemberProfile.name?.slice(0, 1).toUpperCase() || 'U'
                  )}
                </div>
                <div className="club-profile-modal__user-text">
                  <h3>{selectedMemberProfile.name}</h3>
                  <div className="club-profile-modal__tags">
                    <span className="club-profile-modal__role-tag">{selectedMemberProfile.role}</span>
                    {selectedMemberProfile.rawRole === 'president' && (
                      <span className="club-profile-modal__leader-tag">Club Leader</span>
                    )}
                  </div>
                </div>
              </div>

              {profileLoading ? (
                <div className="club-profile-modal__loading">
                  <p>Loading member details...</p>
                </div>
              ) : (
                <div className="club-profile-modal__info-grid">
                  <div className="club-profile-modal__field">
                    <span className="club-profile-modal__label">Email</span>
                    <strong className="club-profile-modal__val">{selectedMemberProfile.email || 'N/A'}</strong>
                  </div>

                  <div className="club-profile-modal__field">
                    <span className="club-profile-modal__label">Student Code (MSSV)</span>
                    <strong className="club-profile-modal__val">
                      {selectedMemberProfile.studentCode || 'Not provided'}
                    </strong>
                  </div>

                  <div className="club-profile-modal__field">
                    <span className="club-profile-modal__label">Phone Number</span>
                    <strong className="club-profile-modal__val">
                      {selectedMemberProfile.phone || 'Not provided'}
                    </strong>
                  </div>

                  <div className="club-profile-modal__field">
                    <span className="club-profile-modal__label">Campus</span>
                    <strong className="club-profile-modal__val">
                      {selectedMemberProfile.campus || 'Can Tho Campus'}
                    </strong>
                  </div>

                  <div className="club-profile-modal__field">
                    <span className="club-profile-modal__label">Joined Date</span>
                    <strong className="club-profile-modal__val">
                      {selectedMemberProfile.joinedDate || 'Member'}
                    </strong>
                  </div>

                  <div className="club-profile-modal__field">
                    <span className="club-profile-modal__label">Achievement Points</span>
                    <strong className="club-profile-modal__val" style={{ color: '#eb6c18' }}>
                      ⭐ {selectedMemberProfile.rankingPoint || 0} pts
                    </strong>
                  </div>
                </div>
              )}
            </div>

            <div className="club-profile-modal__footer">
              <button
                type="button"
                className="club-profile-modal__btn-close"
                onClick={() => setProfileModalOpen(false)}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export default ClubDetailPage
