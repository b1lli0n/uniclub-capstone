import { useMemo, useState } from 'react'
import { ALL_CLUBS } from '../../data/mockData'
import { CLUB_POLLS, CLUB_POLL_STATUS_OPTIONS } from '../../data/clubPollsMockData'
import '../../styles/club-polls.css'

const EMPTY_FORM = { title: '', description: '', closesAt: '', options: ['', ''] }
const fallbackClub = ALL_CLUBS[0]

function formatStatus(status) { return status === 'open' ? 'Open' : 'Closed' }
function totalVotes(poll) { return poll.options.reduce((sum, option) => sum + option.votes, 0) }

function ClubPollsPage({ clubId }) {
  const club = ALL_CLUBS.find((item) => item.id === clubId) || fallbackClub
  const [polls, setPolls] = useState(() => CLUB_POLLS.filter((poll) => poll.clubId === club.id))
  const [statusFilter, setStatusFilter] = useState('all')
  const [search, setSearch] = useState('')
  const [selectedPoll, setSelectedPoll] = useState(null)
  const [formMode, setFormMode] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [closeTarget, setCloseTarget] = useState(null)
  const [toast, setToast] = useState(null)

  const visiblePolls = useMemo(() => {
    const query = search.trim().toLowerCase()
    return polls.filter((poll) => (statusFilter === 'all' || poll.status === statusFilter)
      && (!query || [poll.title, poll.description].some((value) => value.toLowerCase().includes(query))))
  }, [polls, search, statusFilter])

  function notify(message) { setToast(message); window.setTimeout(() => setToast(null), 3000) }
  function openCreate() { setForm(EMPTY_FORM); setFormMode('create') }
  function openEdit(poll) {
    setForm({ title: poll.title, description: poll.description, closesAt: poll.closesAt, options: poll.options.map((option) => option.label) })
    setSelectedPoll(null); setFormMode(poll)
  }
  function savePoll(event) {
    event.preventDefault()
    const options = form.options.map((label) => label.trim()).filter(Boolean)
    if (options.length < 2) return
    if (formMode === 'create') {
      const poll = { id: `poll-${Date.now()}`, clubId: club.id, title: form.title.trim(), description: form.description.trim(), closesAt: form.closesAt || 'To be announced', options: options.map((label, index) => ({ id: `o${index + 1}`, label, votes: 0 })), status: 'open', createdAt: 'Just now', createdBy: 'Ha Van Son', voters: 0 }
      setPolls((items) => [poll, ...items]); notify('Poll created successfully.')
    } else {
      setPolls((items) => items.map((poll) => poll.id === formMode.id ? { ...poll, title: form.title.trim(), description: form.description.trim(), closesAt: form.closesAt || poll.closesAt, options: options.map((label, index) => ({ ...poll.options[index], id: poll.options[index]?.id || `o${index + 1}`, label, votes: poll.options[index]?.votes || 0 })) } : poll))
      notify('Poll updated successfully.')
    }
    setFormMode(null)
  }
  function closePoll() {
    if (!closeTarget) return
    const updated = { ...closeTarget, status: 'closed' }
    setPolls((items) => items.map((poll) => poll.id === updated.id ? updated : poll))
    setSelectedPoll((poll) => poll?.id === updated.id ? updated : poll)
    setCloseTarget(null); notify('Poll has been closed.')
  }

  return <main className="club-polls-page">
    <section className="club-polls-hero"><div><span>{club.name}</span><h1>Poll Management</h1><p>Create quick polls, collect members’ opinions, and close results when a decision is made.</p></div><div className="club-polls-hero__summary"><span>Open polls</span><strong>{polls.filter((poll) => poll.status === 'open').length}</strong><button type="button" onClick={openCreate}>+ Create poll</button></div></section>
    <section className="club-polls-toolbar"><label><span>⌕</span><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search polls..." /></label><div role="tablist" aria-label="Filter poll status">{CLUB_POLL_STATUS_OPTIONS.map((option) => <button key={option.value} type="button" role="tab" aria-selected={statusFilter === option.value} className={statusFilter === option.value ? 'is-active' : ''} onClick={() => setStatusFilter(option.value)}>{option.label}</button>)}</div></section>
    <section className="club-polls-list">{visiblePolls.map((poll) => <PollCard key={poll.id} poll={poll} onDetails={() => setSelectedPoll(poll)} onEdit={() => openEdit(poll)} onClose={() => setCloseTarget(poll)} />)}{!visiblePolls.length && <div className="club-polls-empty"><strong>No polls found</strong><span>Try another search or create a new poll.</span></div>}</section>
    {selectedPoll && <PollDetail poll={selectedPoll} onDismiss={() => setSelectedPoll(null)} onEdit={() => openEdit(selectedPoll)} onClose={() => setCloseTarget(selectedPoll)} />}
    {formMode && <PollForm poll={formMode === 'create' ? null : formMode} form={form} setForm={setForm} onClose={() => setFormMode(null)} onSubmit={savePoll} />}
    {closeTarget && <ConfirmClose poll={closeTarget} onDismiss={() => setCloseTarget(null)} onConfirm={closePoll} />}
    {toast && <div className="club-polls-toast" role="status">{toast}</div>}
  </main>
}

function PollCard({ poll, onDetails, onEdit, onClose }) { const votes = totalVotes(poll); return <article className="club-poll-card"><div className="club-poll-card__copy"><div><span className={`club-poll-status club-poll-status--${poll.status}`}>{formatStatus(poll.status)}</span><small>Closes {poll.closesAt}</small></div><h2>{poll.title}</h2><p>{poll.description}</p></div><div className="club-poll-card__meta"><strong>{poll.voters}</strong><span>responses</span><small>{poll.options.length} options · {votes} votes</small></div><div className="club-poll-card__actions"><button type="button" onClick={onDetails}>View details</button>{poll.status === 'open' && <><button type="button" onClick={onEdit}>Edit</button><button type="button" className="is-danger" onClick={onClose}>Close poll</button></>}</div></article> }
function PollDetail({ poll, onDismiss, onEdit, onClose }) { const votes = totalVotes(poll); return <Modal title="Poll details" onDismiss={onDismiss}><div className="club-poll-detail"><h3>{poll.title}</h3><p>{poll.description}</p><div className="club-poll-detail__meta"><span>Status <strong className={`club-poll-status club-poll-status--${poll.status}`}>{formatStatus(poll.status)}</strong></span><span>Created by <strong>{poll.createdBy}</strong></span><span>Closes <strong>{poll.closesAt}</strong></span></div><div className="club-poll-results">{poll.options.map((option) => { const percent = votes ? Math.round(option.votes / votes * 100) : 0; return <div key={option.id}><div><strong>{option.label}</strong><span>{option.votes} votes · {percent}%</span></div><i><b style={{ width: `${percent}%` }} /></i></div> })}</div></div><footer><button type="button" onClick={onDismiss}>Close</button>{poll.status === 'open' && <><button type="button" onClick={onEdit}>Edit poll</button><button type="button" className="is-danger" onClick={onClose}>Close poll</button></>}</footer></Modal> }
function PollForm({ poll, form, setForm, onClose, onSubmit }) { function updateOption(index, value) { setForm((current) => ({ ...current, options: current.options.map((option, optionIndex) => optionIndex === index ? value : option) })) } return <Modal title={poll ? 'Update poll' : 'Create poll'} onDismiss={onClose}><form className="club-poll-form" onSubmit={onSubmit}><label>Question<input required value={form.title} onChange={(event) => setForm((current) => ({ ...current, title: event.target.value }))} placeholder="What would you like to ask?" /></label><label>Description <em>(optional)</em><textarea value={form.description} rows="3" onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))} placeholder="Give members a little context..." /></label><label>Close date and time<input value={form.closesAt} onChange={(event) => setForm((current) => ({ ...current, closesAt: event.target.value }))} placeholder="e.g. 30 Jul 2026, 18:00" /></label><fieldset><legend>Options</legend>{form.options.map((option, index) => <div className="club-poll-form__option" key={index}><input required value={option} onChange={(event) => updateOption(index, event.target.value)} placeholder={`Option ${index + 1}`} />{form.options.length > 2 && <button type="button" aria-label="Remove option" onClick={() => setForm((current) => ({ ...current, options: current.options.filter((_, optionIndex) => optionIndex !== index) }))}>×</button>}</div>)}<button type="button" className="club-poll-form__add" onClick={() => setForm((current) => ({ ...current, options: [...current.options, ''] }))}>+ Add option</button></fieldset><footer><button type="button" onClick={onClose}>Cancel</button><button type="submit" className="is-primary">{poll ? 'Save changes' : 'Create poll'}</button></footer></form></Modal> }
function ConfirmClose({ poll, onDismiss, onConfirm }) { return <Modal title="Close this poll?" onDismiss={onDismiss}><div className="club-poll-confirm"><span>!</span><p>“{poll.title}” will stop accepting votes. This action cannot be undone.</p></div><footer><button type="button" onClick={onDismiss}>Keep open</button><button type="button" className="is-danger" onClick={onConfirm}>Yes, close poll</button></footer></Modal> }
function Modal({ title, children, onDismiss }) { return <div className="club-poll-modal" role="dialog" aria-modal="true"><button className="club-poll-modal__backdrop" aria-label="Close dialog" onClick={onDismiss} /><section className="club-poll-modal__panel"><header><h2>{title}</h2><button type="button" aria-label="Close" onClick={onDismiss}>×</button></header>{children}</section></div> }

export default ClubPollsPage
