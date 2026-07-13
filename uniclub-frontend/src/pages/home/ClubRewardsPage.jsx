// import { useMemo, useState } from 'react'
import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import {
  INITIAL_REDEMPTION_HISTORY,
  INITIAL_REDEMPTION_REQUESTS,
  //REWARDS,
  REWARD_POINTS_BALANCE,
} from '../../data/rewardsMockData'
import { getRewards, getRewardDetail } from '../../api/reward.api'
import '../../styles/club-rewards.css'

const EMPTY_REWARD = { title: '', points: '', type: '', stock: '', image: '🎁', description: '' }

function RewardImage({ src, alt, className }) {
  const isUrl = src && (src.startsWith('http') || src.startsWith('/'))
  if (isUrl) {
    return <img src={src} alt={alt || 'Reward'} className={className} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  }
  return <span className={className}>{src}</span>
}

function RewardEditor({ reward, onClose, onSave }) {
  const [draft, setDraft] = useState(reward || EMPTY_REWARD)
  const change = (field, value) => setDraft((current) => ({ ...current, [field]: value }))

  function submit(event) {
    event.preventDefault()
    if (!draft.title.trim() || !draft.points || !draft.stock) return
    onSave({ ...draft, title: draft.title.trim(), points: Number(draft.points), stock: Number(draft.stock) })
  }

  return (
    <div className="club-rewards-modal" role="dialog" aria-modal="true">
      <button className="club-rewards-modal__backdrop" aria-label="Close" onClick={onClose} />
      <form className="club-rewards-modal__panel" onSubmit={submit}>
        <header><h2>{reward?.id ? 'Update Reward' : 'Create Reward'}</h2><button type="button" onClick={onClose}>×</button></header>
        <label>Reward title<input value={draft.title} onChange={(event) => change('title', event.target.value)} required /></label>
        <div className="club-rewards-form-grid">
          <label>Cost (points)<input type="number" min="1" value={draft.points} onChange={(event) => change('points', event.target.value)} required /></label>
          <label>Stock<input type="number" min="0" value={draft.stock} onChange={(event) => change('stock', event.target.value)} required /></label>
        </div>
        <div className="club-rewards-form-grid">
          <label>Type<input value={draft.type} onChange={(event) => change('type', event.target.value)} placeholder="Voucher, ticket..." /></label>
          <label>Image URL / Icon<input value={draft.image} onChange={(event) => change('image', event.target.value)} placeholder="URL or Emoji" /></label>
        </div>
        <label>Description<textarea rows="3" value={draft.description} onChange={(event) => change('description', event.target.value)} /></label>
        <footer><button type="button" onClick={onClose}>Cancel</button><button type="submit">Save Reward</button></footer>
      </form>
    </div>
  )
}

function RewardDetail({ reward, isManager, points, onClose, onRedeem, onEdit }) {
  return (
    <div className="club-rewards-modal" role="dialog" aria-modal="true">
      <button className="club-rewards-modal__backdrop" aria-label="Close" onClick={onClose} />
      <section className="club-rewards-modal__panel club-rewards-detail">
        <header><h2>Reward Detail</h2><button type="button" onClick={onClose}>×</button></header>
        <div className="club-rewards-detail__body">
          <RewardImage src={reward.image} alt={reward.title} className="club-rewards-detail__emoji" />
          <div><p className="club-rewards-eyebrow">{reward.type || 'Reward'} · {reward.club}</p><h3>{reward.title}</h3><strong>{reward.points} pts</strong><p>{reward.description}</p><small>Stock available: {reward.stock}</small></div>
        </div>
        <footer><button type="button" onClick={onClose}>Close</button>{isManager ? <button type="button" onClick={onEdit}>Edit Reward</button> : <button type="button" disabled={points < reward.points || !reward.stock} onClick={onRedeem}>{points < reward.points ? 'Insufficient points' : 'Redeem reward'}</button>}</footer>
      </section>
    </div>
  )
}

function Status({ value }) {
  return <span className={`club-rewards-status club-rewards-status--${value.toLowerCase()}`}>{value}</span>
}

function ClubRewardsPage({ isManager = false }) {
  // const [rewards, setRewards] = useState(REWARDS)
  const { clubId } = useParams()
  const [rewards, setRewards] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    if (!clubId) return
    let active = true
    setIsLoading(true)

    getRewards(clubId, { limit: 100, status: isManager ? undefined : 'active' })
      .then((res) => {
        if (!active) return
        const mapped = res.data.map((r) => ({
          id: r._id,
          title: r.name,
          type: 'Reward',
          club: 'Club',
          points: r.point_cost,
          stock: r.quantity,
          image: r.image_url || '🎁',
          description: r.description,
          isVisible: r.status === 'active',
        }))
        setRewards(mapped)
        setIsLoading(false)
      })
      .catch((err) => {
        console.error(err)
        setIsLoading(false)
      })

    return () => {
      active = false
    }
  }, [clubId, isManager])

  function fetchDetail(reward) {
    setDetailReward(reward)
    if (!clubId) return
    getRewardDetail(clubId, reward.id)
      .then((res) => {
        const r = res.data
        setDetailReward({
          id: r._id,
          title: r.name,
          type: 'Reward',
          club: 'Club',
          points: r.point_cost,
          stock: r.quantity,
          image: r.image_url || '🎁',
          description: r.description,
          isVisible: r.status === 'active',
        })
      })
      .catch((err) => console.error('Failed to fetch reward detail', err))
  }
  const [history, setHistory] = useState(INITIAL_REDEMPTION_HISTORY)
  const [requests, setRequests] = useState(INITIAL_REDEMPTION_REQUESTS)
  const [tab, setTab] = useState('inventory')
  const [query, setQuery] = useState('')
  const [editorReward, setEditorReward] = useState(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [detailReward, setDetailReward] = useState(null)
  const [confirmReward, setConfirmReward] = useState(null)
  const [points, setPoints] = useState(REWARD_POINTS_BALANCE)

  const visibleRewards = useMemo(() => rewards.filter((reward) => {
    const search = `${reward.title} ${reward.club}`.toLowerCase().includes(query.toLowerCase())
    return search && (isManager || reward.isVisible)
  }), [isManager, query, rewards])

  function saveReward(draft) {
    setRewards((items) => editorReward?.id
      ? items.map((item) => item.id === editorReward.id ? { ...item, ...draft } : item)
      : [{ ...draft, id: `reward-${Date.now()}`, club: 'This club', isVisible: true }, ...items])
    setEditorOpen(false)
  }

  function redeemReward() {
    if (!confirmReward) return
    setPoints((value) => value - confirmReward.points)
    setHistory((items) => [{ id: `redemption-${Date.now()}`, date: new Date().toLocaleDateString('en-CA'), member: 'Hà Văn Sơn', item: confirmReward.title, points: confirmReward.points, status: 'PENDING' }, ...items])
    setConfirmReward(null)
    setDetailReward(null)
  }

  function processRequest(request, status) {
    setRequests((items) => items.filter((item) => item.id !== request.id))
    setHistory((items) => [{ ...request, id: `redemption-${Date.now()}`, status }, ...items])
  }

  return (
    <main className="club-rewards-page">
      <section className="club-rewards-hero">
        <div><span>Club rewards</span><h1>{isManager ? 'Reward Management' : 'Rewards Store'}</h1><p>{isManager ? 'Create, update, hide, and process member redemptions.' : 'Redeem your achievement points for club rewards.'}</p></div>
        {!isManager && <div className="club-rewards-balance"><span>Available balance</span><strong>{points} pts</strong></div>}
      </section>

      <div className="club-rewards-toolbar">
        {isManager && <div className="club-rewards-tabs"><button className={tab === 'inventory' ? 'is-active' : ''} onClick={() => setTab('inventory')}>Inventory</button><button className={tab === 'requests' ? 'is-active' : ''} onClick={() => setTab('requests')}>Requests <b>{requests.length}</b></button><button className={tab === 'history' ? 'is-active' : ''} onClick={() => setTab('history')}>History</button></div>}
        {!isManager && <button className="club-rewards-history-link" onClick={() => setTab(tab === 'history' ? 'inventory' : 'history')}>{tab === 'history' ? 'View rewards' : 'My redemption history'}</button>}
        {tab === 'inventory' && <input type="search" placeholder="Search rewards..." value={query} onChange={(event) => setQuery(event.target.value)} />}
      </div>

      {tab === 'inventory' && <section className="club-rewards-grid">
        {isManager && <button className="club-reward-card club-reward-card--add" onClick={() => { setEditorReward(null); setEditorOpen(true) }}>+<span>Create Reward</span></button>}
        {/* {visibleRewards.map((reward) => <article key={reward.id} className={`club-reward-card${!reward.isVisible ? ' is-hidden' : ''}`} onClick={() => setDetailReward(reward)}></article> */}
        {isLoading && <p>Loading rewards...</p>}
        {!isLoading && visibleRewards.map((reward) => <article key={reward.id} className={`club-reward-card${!reward.isVisible ? ' is-hidden' : ''}`} onClick={() => fetchDetail(reward)}>
          <div className="club-reward-card__image"><RewardImage src={reward.image} alt={reward.title} /><small>{reward.type}</small></div>
          <div className="club-reward-card__body"><h2>{reward.title}</h2><p>{reward.club}</p><strong>{reward.points} pts</strong><small>Stock: {reward.stock}</small>
            {isManager ? <label className="club-reward-visibility" onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={reward.isVisible} onChange={() => setRewards((items) => items.map((item) => item.id === reward.id ? { ...item, isVisible: !item.isVisible } : item))} />{reward.isVisible ? 'Visible' : 'Hidden'}</label> : <button type="button" disabled={points < reward.points || !reward.stock} onClick={(event) => { event.stopPropagation(); setConfirmReward(reward) }}>Redeem</button>}
          </div>
        </article>)}
      </section>}

      {tab === 'requests' && isManager && <section className="club-rewards-table-card"><h2>Pending Redemption Requests</h2><table><thead><tr><th>Date</th><th>Member</th><th>Reward</th><th>Cost</th><th>Action</th></tr></thead><tbody>{requests.map((request) => <tr key={request.id}><td>{request.date}</td><td>{request.member}</td><td>{request.item}</td><td>{request.points} pts</td><td><button onClick={() => processRequest(request, 'APPROVED')}>Approve</button><button className="is-danger" onClick={() => processRequest(request, 'REJECTED')}>Reject</button></td></tr>)}{!requests.length && <tr><td colSpan="5">No pending requests.</td></tr>}</tbody></table></section>}

      {tab === 'history' && <section className="club-rewards-table-card"><h2>{isManager ? 'Redemption History' : 'My Redemption History'}</h2><table><thead><tr><th>Date</th>{isManager && <th>Member</th>}<th>Reward</th><th>Cost</th><th>Status</th></tr></thead><tbody>{history.filter((item) => isManager || item.member === 'Hà Văn Sơn').map((item) => <tr key={item.id}><td>{item.date}</td>{isManager && <td>{item.member}</td>}<td>{item.item}</td><td>{item.points} pts</td><td><Status value={item.status} /></td></tr>)}</tbody></table></section>}

      {editorOpen && <RewardEditor reward={editorReward} onClose={() => setEditorOpen(false)} onSave={saveReward} />}
      {detailReward && <RewardDetail reward={detailReward} isManager={isManager} points={points} onClose={() => setDetailReward(null)} onRedeem={() => setConfirmReward(detailReward)} onEdit={() => { setEditorReward(detailReward); setDetailReward(null); setEditorOpen(true) }} />}
      {confirmReward && <div className="club-rewards-modal" role="dialog" aria-modal="true"><button className="club-rewards-modal__backdrop" aria-label="Close" onClick={() => setConfirmReward(null)} /><section className="club-rewards-modal__panel club-rewards-confirm"><h2>Confirm Redemption</h2><p>Redeem <strong>{confirmReward.title}</strong> for <strong>{confirmReward.points} points</strong>?</p><p>Remaining balance: {points - confirmReward.points} pts</p><footer><button onClick={() => setConfirmReward(null)}>Cancel</button><button onClick={redeemReward}>Confirm</button></footer></section></div>}
    </main>
  )
}

export default ClubRewardsPage
