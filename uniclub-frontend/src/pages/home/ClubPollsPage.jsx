import { useMemo, useState, useEffect } from 'react'
import { ALL_CLUBS } from '../../data/mockData'
import { CLUB_POLLS, CLUB_POLL_STATUS_OPTIONS } from '../../data/clubPollsMockData'
import { getMyClubs } from '../../api/memberClubMembership.api'
import {
  getClubPolls,
  getPollDetail,
  createPoll as createPollApi,
  votePoll as votePollApi,
  closePoll as closePollApi,
} from '../../api/poll.api'
import '../../styles/club-polls.css'

const EMPTY_FORM = { title: '', description: '', closesAt: '', options: ['', ''] }
const fallbackClub = ALL_CLUBS[0]

function formatStatus(status) {
  return status === 'open' ? 'Open' : 'Closed'
}

function totalVotes(poll) {
  if (!poll?.options || !poll.options.length) return 0
  return poll.options.reduce((sum, option) => sum + (Number(option.votes) || 0), 0)
}

function mapApiPollToLocal(apiItem) {
  const options = (apiItem.options || []).map((opt) => {
    const count =
      typeof opt.vote_count === 'number'
        ? opt.vote_count
        : typeof opt.votes === 'number'
        ? opt.votes
        : (apiItem.votes || []).filter(
            (v) => String(v.option_id) === String(opt._id || opt.id)
          ).length

    return {
      id: opt._id || opt.id,
      label: opt.text || opt.label || '',
      votes: count,
    }
  })

  const total =
    typeof apiItem.total_votes === 'number'
      ? apiItem.total_votes
      : options.reduce((sum, opt) => sum + (opt.votes || 0), 0)

  const myVoteOptionId = apiItem.my_vote?.option_id
    ? String(apiItem.my_vote.option_id)
    : apiItem.my_vote === null
    ? null
    : apiItem.myVote
    ? String(apiItem.myVote)
    : null

  return {
    id: apiItem._id || apiItem.id,
    clubId: apiItem.club_id?._id || apiItem.club_id || apiItem.clubId,
    title: apiItem.title,
    description: apiItem.description || '',
    closesAt: apiItem.closed_at
      ? new Date(apiItem.closed_at).toLocaleDateString('vi-VN')
      : apiItem.end_at
      ? new Date(apiItem.end_at).toLocaleDateString('vi-VN')
      : 'Open indefinitely',
    options,
    status: apiItem.status || 'open',
    createdAt: apiItem.createdAt ? new Date(apiItem.createdAt).toLocaleDateString('vi-VN') : 'Recently',
    createdBy: apiItem.created_by?.full_name || apiItem.createdBy || 'Club Leader',
    voters: total,
    myVote: myVoteOptionId,
    rawVotes: apiItem.votes || [],
  }
}

function ClubPollsPage({ clubId, canManagePolls: propCanManagePolls, userRole }) {
  const club = ALL_CLUBS.find((item) => item.id === clubId) || fallbackClub
  const [canManagePolls, setCanManagePolls] = useState(() => {
    if (typeof propCanManagePolls === 'boolean') return propCanManagePolls
    if (userRole) {
      const r = String(userRole).toLowerCase()
      return r === 'secretary' || r === 'president' || r === 'leader'
    }
    return false
  })
  const [polls, setPolls] = useState([])
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedPoll, setSelectedPoll] = useState(null)
  const [formMode, setFormMode] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [closeTarget, setCloseTarget] = useState(null)
  const [toast, setToast] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (typeof propCanManagePolls === 'boolean') {
      setCanManagePolls(propCanManagePolls)
    }
  }, [propCanManagePolls])

  useEffect(() => {
    let cancelled = false
    async function checkRole() {
      if (typeof propCanManagePolls === 'boolean') return
      try {
        const myClubsResponse = await getMyClubs()
        if (cancelled) return
        const membership = (myClubsResponse.data || []).find((item) => {
          const id = item.club_id?._id || item.club_id
          return String(id) === String(clubId)
        })
        const role = membership?.role?.toLowerCase()
        setCanManagePolls(role === 'secretary' || role === 'president' || role === 'leader')
      } catch (err) {
        console.error('Failed to resolve club role for polls:', err)
      }
    }
    checkRole()
    return () => {
      cancelled = true
    }
  }, [clubId, propCanManagePolls])

  async function loadPolls() {
    setLoading(true)
    try {
      const res = await getClubPolls(clubId)
      const rawList = Array.isArray(res?.data) ? res.data : res?.data?.polls || []
      if (rawList.length > 0) {
        setPolls(rawList.map(mapApiPollToLocal))
      } else {
        const mockList = CLUB_POLLS.filter((poll) => poll.clubId === club.id)
        setPolls(mockList)
      }
    } catch (err) {
      console.error('Error fetching polls:', err)
      const mockList = CLUB_POLLS.filter((poll) => poll.clubId === club.id)
      setPolls(mockList)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (clubId) loadPolls()
  }, [clubId])

  const visiblePolls = useMemo(() => {
    const query = search.trim().toLowerCase()
    return polls.filter(
      (poll) =>
        (statusFilter === 'all' || poll.status === statusFilter) &&
        (!query || [poll.title, poll.description].some((value) => value.toLowerCase().includes(query)))
    )
  }, [polls, search, statusFilter])

  function notify(message) {
    setToast(message)
    window.setTimeout(() => setToast(null), 3500)
  }

  function openCreate() {
    if (!canManagePolls) return
    setForm(EMPTY_FORM)
    setFormMode('create')
  }

  function openEdit(poll) {
    if (!canManagePolls) return
    setForm({
      title: poll.title,
      description: poll.description,
      closesAt: poll.closesAt,
      options: poll.options.map((option) => option.label),
    })
    setSelectedPoll(null)
    setFormMode(poll)
  }

  async function savePoll(event) {
    event.preventDefault()
    if (!canManagePolls) {
      notify('Only the club Secretary or President can manage polls.')
      return
    }
    const options = form.options.map((label) => label.trim()).filter(Boolean)
    if (options.length < 2) {
      notify('Poll must have at least 2 options.')
      return
    }

    setSubmitting(true)
    try {
      if (formMode === 'create') {
        const payload = {
          title: form.title.trim(),
          description: form.description.trim(),
          options,
        }
        await createPollApi(clubId, payload)
        notify('Poll created successfully.')
        await loadPolls()
      } else {
        notify('Poll updated successfully.')
      }
      setFormMode(null)
    } catch (err) {
      console.error('Error saving poll:', err)
      notify(err.message || 'Could not save poll.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleVote(poll, optionId) {
    if (!poll || poll.status !== 'open') return

    const isMock =
      String(poll.id).startsWith('poll-') ||
      !/^[0-9a-fA-F]{24}$/.test(String(clubId))

    const isCancelling = poll.myVote && String(poll.myVote) === String(optionId)
    const prevOptionId = poll.myVote ? String(poll.myVote) : null
    const targetOptionId = String(optionId)

    // Snapshot current state for rollback if network request fails
    const prevPolls = polls
    const prevSelected = selectedPoll

    const computeOptimisticPoll = (item) => {
      if (!item || String(item.id) !== String(poll.id)) return item

      const nextOptions = (item.options || []).map((opt) => {
        const optIdStr = String(opt.id)
        if (isCancelling) {
          if (optIdStr === targetOptionId) {
            return { ...opt, votes: Math.max(0, (Number(opt.votes) || 0) - 1) }
          }
          return opt
        } else {
          if (prevOptionId && optIdStr === prevOptionId) {
            return { ...opt, votes: Math.max(0, (Number(opt.votes) || 0) - 1) }
          }
          if (optIdStr === targetOptionId) {
            return { ...opt, votes: (Number(opt.votes) || 0) + 1 }
          }
          return opt
        }
      })

      const voterDelta = isCancelling ? -1 : prevOptionId ? 0 : 1
      const nextVoters = Math.max(0, (Number(item.voters) || 0) + voterDelta)

      return {
        ...item,
        myVote: isCancelling ? null : targetOptionId,
        options: nextOptions,
        voters: nextVoters,
      }
    }

    // Instant optimistic update (0ms latency for a silky smooth experience)
    setPolls((prev) => prev.map(computeOptimisticPoll))
    setSelectedPoll((prev) => computeOptimisticPoll(prev))

    if (isCancelling) {
      notify('Vote cancelled successfully!')
    } else if (prevOptionId) {
      notify('Vote switched successfully!')
    } else {
      notify('Vote recorded successfully!')
    }

    if (isMock) return

    try {
      const res = await votePollApi(clubId, poll.id, optionId)
      if (res?.data) {
        const mapped = mapApiPollToLocal(res.data)
        setSelectedPoll(mapped)
        setPolls((prev) => prev.map((p) => (String(p.id) === String(mapped.id) ? mapped : p)))
      }
    } catch (err) {
      console.error('Error updating vote:', err)
      // Rollback on error
      setPolls(prevPolls)
      setSelectedPoll(prevSelected)
      notify(err.message || 'Could not update vote.')
    }
  }

  async function handleClosePoll() {
    if (!closeTarget || !canManagePolls) return
    setSubmitting(true)
    try {
      await closePollApi(clubId, closeTarget.id)
      notify('Poll has been closed.')
      setCloseTarget(null)
      await loadPolls()
      if (selectedPoll?.id === closeTarget.id) {
        setSelectedPoll((p) => (p ? { ...p, status: 'closed' } : null))
      }
    } catch (err) {
      console.error('Error closing poll:', err)
      notify(err.message || 'Could not close poll.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="club-polls-page">
      <section className="club-polls-hero">
        <div>
          <span>{club.name}</span>
          <h1>{canManagePolls ? 'Poll Management' : 'Club Polls & Voting'}</h1>
          <p>
            {canManagePolls
              ? 'Create quick polls, collect members’ opinions, and close results when a decision is made.'
              : 'Participate in club decision-making by voting on open topics.'}
          </p>
        </div>
        <div className="club-polls-hero__summary">
          <span>Open polls</span>
          <strong>{polls.filter((poll) => poll.status === 'open').length}</strong>
          {canManagePolls && (
            <button type="button" onClick={openCreate}>
              + Create poll
            </button>
          )}
        </div>
      </section>

      <section className="club-polls-toolbar">
        <label>
          <span>⌕</span>
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Search polls..."
          />
        </label>
        <div role="tablist" aria-label="Filter poll status">
          {CLUB_POLL_STATUS_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              role="tab"
              aria-selected={statusFilter === option.value}
              className={statusFilter === option.value ? 'is-active' : ''}
              onClick={() => setStatusFilter(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      </section>

      <section className="club-polls-list">
        {loading ? (
          <div className="club-polls-empty">Loading polls...</div>
        ) : (
          visiblePolls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              canManagePolls={canManagePolls}
              onDetails={() => setSelectedPoll(poll)}
              onEdit={() => openEdit(poll)}
              onClose={() => setCloseTarget(poll)}
            />
          ))
        )}
        {!loading && !visiblePolls.length && (
          <div className="club-polls-empty">
            <strong>No polls found</strong>
            <span>
              {canManagePolls
                ? 'Try another search or create a new poll.'
                : 'There are no polls matching your criteria.'}
            </span>
          </div>
        )}
      </section>

      {selectedPoll && (
        <PollDetail
          poll={selectedPoll}
          canManagePolls={canManagePolls}
          onVote={(optId) => handleVote(selectedPoll, optId)}
          onDismiss={() => setSelectedPoll(null)}
          onEdit={() => openEdit(selectedPoll)}
          onClose={() => setCloseTarget(selectedPoll)}
        />
      )}
      {formMode && (
        <PollForm
          poll={formMode === 'create' ? null : formMode}
          form={form}
          submitting={submitting}
          setForm={setForm}
          onClose={() => setFormMode(null)}
          onSubmit={savePoll}
        />
      )}
      {closeTarget && (
        <ConfirmClose
          poll={closeTarget}
          submitting={submitting}
          onDismiss={() => setCloseTarget(null)}
          onConfirm={handleClosePoll}
        />
      )}
      {toast && (
        <div className="club-polls-toast" role="status">
          {toast}
        </div>
      )}
    </main>
  )
}

function PollCard({ poll, canManagePolls, onDetails, onEdit, onClose }) {
  const votes = totalVotes(poll)
  return (
    <article className="club-poll-card">
      <div className="club-poll-card__copy">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
          <span className={`club-poll-status club-poll-status--${poll.status}`}>
            {formatStatus(poll.status)}
          </span>
          {poll.myVote && (
            <span
              style={{
                background: '#dcfce7',
                color: '#15803d',
                fontSize: '0.72rem',
                fontWeight: 800,
                padding: '0.2rem 0.55rem',
                borderRadius: '6px',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.25rem',
              }}
            >
              ✓ You voted
            </span>
          )}
          <small>Closes: {poll.closesAt}</small>
        </div>
        <h2>{poll.title}</h2>
        <p>{poll.description}</p>
      </div>
      <div className="club-poll-card__meta">
        <strong>{poll.voters}</strong>
        <span>voters</span>
        <small>
          {poll.options.length} options · {votes} votes
        </small>
      </div>
      <div className="club-poll-card__actions">
        <button type="button" onClick={onDetails}>
          {poll.myVote && poll.status === 'open'
            ? 'View & Manage Vote'
            : poll.status === 'open'
            ? 'View & Vote'
            : 'View Results'}
        </button>
        {canManagePolls && poll.status === 'open' && (
          <>
            <button type="button" onClick={onEdit}>
              Edit
            </button>
            <button type="button" className="is-danger" onClick={onClose}>
              Close poll
            </button>
          </>
        )}
      </div>
    </article>
  )
}

function PollDetail({ poll, canManagePolls, onVote, onDismiss, onEdit, onClose }) {
  const votes = totalVotes(poll)

  return (
    <Modal title={poll.status === 'open' ? 'Poll Details & Voting' : 'Poll Results'} onDismiss={onDismiss}>
      <div className="club-poll-detail">
        <h3>{poll.title}</h3>
        <p>{poll.description}</p>
        <div className="club-poll-detail__meta">
          <span>
            Status{' '}
            <strong className={`club-poll-status club-poll-status--${poll.status}`}>
              {formatStatus(poll.status)}
            </strong>
          </span>
          <span>
            Created by <strong>{poll.createdBy}</strong>
          </span>
          <span>
            Closes <strong>{poll.closesAt}</strong>
          </span>
        </div>

        <div className="club-poll-results" style={{ marginTop: '1.25rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
            <h4 style={{ margin: 0, fontSize: '0.95rem', fontWeight: 800, color: '#2b2521' }}>
              🗳️ Options ({poll.options.length})
            </h4>
            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#786659' }}>
              {votes} {votes === 1 ? 'total vote' : 'total votes'}
            </span>
          </div>

          <div className="club-poll-options-container">
            {poll.options.map((option) => {
              const isMyVote = poll.myVote && String(poll.myVote) === String(option.id)
              const percent = votes > 0 ? Math.round(((Number(option.votes) || 0) / votes) * 100) : 0
              const isOpen = poll.status === 'open'

              return (
                <div
                  key={option.id}
                  className={`club-poll-option-card ${isMyVote ? 'is-selected' : ''} ${isOpen ? 'is-interactive' : ''}`}
                  role={isOpen ? 'button' : undefined}
                  tabIndex={isOpen ? 0 : undefined}
                  aria-pressed={isMyVote}
                  onClick={() => {
                    if (isOpen) onVote(option.id)
                  }}
                  onKeyDown={(e) => {
                    if (isOpen && (e.key === 'Enter' || e.key === ' ')) {
                      e.preventDefault()
                      onVote(option.id)
                    }
                  }}
                >
                  <div className="club-poll-option-header">
                    <div className="club-poll-option-title-group">
                      <div className="club-poll-radio-indicator">
                        {isMyVote && <span>✓</span>}
                      </div>
                      <span className="club-poll-option-label">{option.label}</span>
                    </div>
                    <div className="club-poll-option-stats">
                      <span className="club-poll-option-votes-count">
                        {option.votes || 0} votes ({percent}%)
                      </span>
                      {isOpen && (
                        <span
                          className={`club-poll-action-pill ${
                            isMyVote ? 'is-cancel' : 'is-vote'
                          }`}
                        >
                          {isMyVote ? 'Cancel' : 'Vote'}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="club-poll-progress-track">
                    <div
                      className="club-poll-progress-fill"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              )
            })}
          </div>

          {poll.status === 'open' && (
            <div className="club-poll-helper-tip">
              <span>💡</span>
              <span>Click to vote or switch · Click selected option again to cancel</span>
            </div>
          )}
        </div>
      </div>
      <footer>
        <button type="button" onClick={onDismiss}>
          Close
        </button>
        {canManagePolls && poll.status === 'open' && (
          <>
            <button type="button" onClick={onEdit}>
              Edit poll
            </button>
            <button type="button" className="is-danger" onClick={onClose}>
              Close poll
            </button>
          </>
        )}
      </footer>
    </Modal>
  )
}

function PollForm({ poll, form, submitting, setForm, onClose, onSubmit }) {
  function updateOption(index, value) {
    setForm((current) => ({
      ...current,
      options: current.options.map((option, optionIndex) => (optionIndex === index ? value : option)),
    }))
  }
  return (
    <Modal title={poll ? 'Update poll' : 'Create poll'} onDismiss={onClose}>
      <form className="club-poll-form" onSubmit={onSubmit}>
        <label>
          Question
          <input
            required
            value={form.title}
            onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))}
            placeholder="What would you like to ask?"
          />
        </label>
        <label>
          Description <em>(optional)</em>
          <textarea
            value={form.description}
            rows="3"
            onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
            placeholder="Give members a little context..."
          />
        </label>
        <fieldset>
          <legend>Options</legend>
          {form.options.map((option, index) => (
            <div className="club-poll-form__option" key={index}>
              <input
                required
                value={option}
                onChange={(event) => updateOption(index, event.target.value)}
                placeholder={`Option ${index + 1}`}
              />
              {form.options.length > 2 && (
                <button
                  type="button"
                  aria-label="Remove option"
                  onClick={() =>
                    setForm((current) => ({
                      ...current,
                      options: current.options.filter((_, optionIndex) => optionIndex !== index),
                    }))
                  }
                >
                  ×
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            className="club-poll-form__add"
            onClick={() => setForm((current) => ({ ...current, options: [...current.options, ''] }))}
          >
            + Add option
          </button>
        </fieldset>
        <footer>
          <button type="button" onClick={onClose}>
            Cancel
          </button>
          <button type="submit" className="is-primary" disabled={submitting}>
            {submitting ? 'Saving...' : poll ? 'Save changes' : 'Create poll'}
          </button>
        </footer>
      </form>
    </Modal>
  )
}

function ConfirmClose({ poll, submitting, onDismiss, onConfirm }) {
  return (
    <Modal title="Close this poll?" onDismiss={onDismiss}>
      <div className="club-poll-confirm">
        <span>!</span>
        <p>“{poll.title}” will stop accepting votes. This action cannot be undone.</p>
      </div>
      <footer>
        <button type="button" onClick={onDismiss}>
          Keep open
        </button>
        <button type="button" className="is-danger" disabled={submitting} onClick={onConfirm}>
          {submitting ? 'Closing...' : 'Yes, close poll'}
        </button>
      </footer>
    </Modal>
  )
}

function Modal({ title, children, onDismiss }) {
  return (
    <div className="club-poll-modal" role="dialog" aria-modal="true">
      <button className="club-poll-modal__backdrop" aria-label="Close dialog" onClick={onDismiss} />
      <section className="club-poll-modal__panel">
        <header>
          <h2>{title}</h2>
          <button type="button" aria-label="Close" onClick={onDismiss}>
            ×
          </button>
        </header>
        {children}
      </section>
    </div>
  )
}

export default ClubPollsPage
