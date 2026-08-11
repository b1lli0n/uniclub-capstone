import { useMemo, useState, useEffect } from 'react'
import { ALL_CLUBS } from '../../data/mockData'
import { CLUB_POLLS, CLUB_POLL_STATUS_OPTIONS } from '../../data/clubPollsMockData'
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
  if (!poll?.options) return 0
  return poll.options.reduce((sum, option) => sum + (option.votes || 0), 0)
}

function mapApiPollToLocal(apiItem) {
  const options = (apiItem.options || []).map((opt) => ({
    id: opt._id || opt.id,
    label: opt.text || opt.label || '',
    votes: (apiItem.votes || []).filter((v) => String(v.option_id) === String(opt._id || opt.id)).length,
  }))

  const voterSet = new Set((apiItem.votes || []).map((v) => String(v.user_id)))

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
    voters: voterSet.size,
    rawVotes: apiItem.votes || [],
  }
}

function ClubPollsPage({ clubId }) {
  const club = ALL_CLUBS.find((item) => item.id === clubId) || fallbackClub
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
    setForm(EMPTY_FORM)
    setFormMode('create')
  }

  function openEdit(poll) {
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
        notify('Poll created successfully in database.')
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
    setSubmitting(true)
    try {
      await votePollApi(clubId, poll.id, optionId)
      notify('Your vote has been recorded!')
      await loadPolls()
      // Refresh selected poll detail if open
      const res = await getPollDetail(clubId, poll.id)
      if (res?.data) setSelectedPoll(mapApiPollToLocal(res.data))
    } catch (err) {
      console.error('Error voting:', err)
      notify(err.message || 'Could not record vote.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleClosePoll() {
    if (!closeTarget) return
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
          <h1>Poll Management</h1>
          <p>Create quick polls, collect members’ opinions, and close results when a decision is made.</p>
        </div>
        <div className="club-polls-hero__summary">
          <span>Open polls</span>
          <strong>{polls.filter((poll) => poll.status === 'open').length}</strong>
          <button type="button" onClick={openCreate}>
            + Create poll
          </button>
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
          <div className="club-polls-empty">Đang tải danh sách cuộc bình chọn...</div>
        ) : (
          visiblePolls.map((poll) => (
            <PollCard
              key={poll.id}
              poll={poll}
              onDetails={() => setSelectedPoll(poll)}
              onEdit={() => openEdit(poll)}
              onClose={() => setCloseTarget(poll)}
            />
          ))
        )}
        {!loading && !visiblePolls.length && (
          <div className="club-polls-empty">
            <strong>No polls found</strong>
            <span>Try another search or create a new poll.</span>
          </div>
        )}
      </section>

      {selectedPoll && (
        <PollDetail
          poll={selectedPoll}
          submitting={submitting}
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

function PollCard({ poll, onDetails, onEdit, onClose }) {
  const votes = totalVotes(poll)
  return (
    <article className="club-poll-card">
      <div className="club-poll-card__copy">
        <div>
          <span className={`club-poll-status club-poll-status--${poll.status}`}>
            {formatStatus(poll.status)}
          </span>
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
          View & Vote
        </button>
        {poll.status === 'open' && (
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

function PollDetail({ poll, submitting, onVote, onDismiss, onEdit, onClose }) {
  const votes = totalVotes(poll)
  return (
    <Modal title="Poll details & Voting" onDismiss={onDismiss}>
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
          <h4 style={{ margin: '0 0 0.75rem 0', fontSize: '0.95rem', fontWeight: 'bold', color: '#0f172a' }}>
            🗳️ Options & Interactive Voting:
          </h4>
          {poll.options.map((option) => {
            const percent = votes ? Math.round(((option.votes || 0) / votes) * 100) : 0
            return (
              <div
                key={option.id}
                style={{
                  background: '#f8fafc',
                  padding: '0.85rem',
                  borderRadius: '10px',
                  marginBottom: '0.75rem',
                  border: '1px solid #e2e8f0',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                  <strong style={{ color: '#0f172a', fontSize: '0.9rem' }}>{option.label}</strong>
                  <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: '600' }}>
                    {option.votes || 0} votes ({percent}%)
                  </span>
                </div>
                <div style={{ background: '#e2e8f0', borderRadius: '6px', height: '8px', overflow: 'hidden', marginBottom: '0.65rem' }}>
                  <div style={{ width: `${percent}%`, height: '100%', background: 'linear-gradient(90deg, #3b82f6 0%, #2563eb 100%)', transition: 'width 0.4s ease' }} />
                </div>
                {poll.status === 'open' && (
                  <button
                    type="button"
                    disabled={submitting}
                    onClick={() => onVote(option.id)}
                    style={{
                      padding: '0.35rem 0.85rem',
                      fontSize: '0.8rem',
                      fontWeight: 'bold',
                      borderRadius: '6px',
                      background: '#2563eb',
                      color: '#ffffff',
                      border: 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {submitting ? 'Voting...' : '👉 Vote for this option'}
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </div>
      <footer>
        <button type="button" onClick={onDismiss}>
          Close
        </button>
        {poll.status === 'open' && (
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
