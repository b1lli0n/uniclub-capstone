import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useToast, useConfirm } from '../../components/common/notificationContext'
import {
  getMemberRewards,
  getMemberRewardDetail,
  redeemReward,
  getMemberRedemptionHistory,
  getManagerRewards,
  getManagerRewardDetail,
  createReward,
  updateReward,
  toggleRewardVisibility,
  getManagerRedemptionHistory,
  approveRedemption,
  rejectRedemption
} from '../../api/reward.api'
import '../../styles/club-rewards.css'

const EMPTY_REWARD = { title: '', points: '', type: '', stock: '', image: '🎁', description: '' }

function RewardImage({ src, alt, className }) {
  const isUrl = src && (src.startsWith('http') || src.startsWith('/'))
  if (isUrl) {
    return <img src={src} alt={alt || 'Reward'} className={className} style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }} />
  }
  return <span className={className}>{src || '🎁'}</span>
}

function RewardEditor({ reward, onClose, onSave }) {
  const [draft, setDraft] = useState(reward || EMPTY_REWARD)
  const change = (field, value) => setDraft((current) => ({ ...current, [field]: value }))

  function submit(event) {
    event.preventDefault()
    if (!draft.title.trim() || !draft.points || draft.stock === '') return
    onSave({ ...draft, title: draft.title.trim(), points: Number(draft.points), stock: Number(draft.stock) })
  }

  return (
    <div className="club-rewards-modal" role="dialog" aria-modal="true">
      <button className="club-rewards-modal__backdrop" aria-label="Close" onClick={onClose} type="button" />
      <form className="club-rewards-modal__panel" onSubmit={submit}>
        <header>
          <h2>{reward?.id ? 'Update Reward' : 'Create New Reward'}</h2>
          <button type="button" onClick={onClose}>×</button>
        </header>
        <label>
          Reward Name
          <input value={draft.title} onChange={(event) => change('title', event.target.value)} required placeholder="e.g. Cinema Ticket, Highlands Coffee Voucher..." />
        </label>
        <div className="club-rewards-form-grid">
          <label>
            Points Required
            <input type="number" min="1" value={draft.points} onChange={(event) => change('points', event.target.value)} required placeholder="e.g. 150" />
          </label>
          <label>
            Stock Quantity
            <input type="number" min="0" value={draft.stock} onChange={(event) => change('stock', event.target.value)} required placeholder="e.g. 20" />
          </label>
        </div>
        <div className="club-rewards-form-grid">
          <label>
            Category / Type
            <input value={draft.type} onChange={(event) => change('type', event.target.value)} placeholder="e.g. Voucher, Ticket, Merchandise..." />
          </label>
          <label>
            Image URL / Emoji Icon
            <input value={draft.image} onChange={(event) => change('image', event.target.value)} placeholder="Emoji (🎁) or image URL" />
          </label>
        </div>
        <label>
          Detailed Description
          <textarea rows="3" value={draft.description} onChange={(event) => change('description', event.target.value)} placeholder="Describe how to use this reward, terms and conditions..." />
        </label>
        <footer>
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit">Save Reward</button>
        </footer>
      </form>
    </div>
  )
}

function RewardDetail({ reward, isManager, points, onClose, onRedeem, onEdit, onToggleVisibility }) {
  return (
    <div className="club-rewards-modal" role="dialog" aria-modal="true">
      <button className="club-rewards-modal__backdrop" aria-label="Close" onClick={onClose} type="button" />
      <section className="club-rewards-modal__panel club-rewards-detail">
        <header>
          <h2>Reward Details</h2>
          <button type="button" onClick={onClose}>×</button>
        </header>
        <div className="club-rewards-detail__body">
          <div className="club-rewards-detail__emoji-container" style={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f7', borderRadius: '12px', fontSize: '2.5rem', overflow: 'hidden' }}>
            <RewardImage src={reward.image} alt={reward.title} className="club-rewards-detail__emoji" />
          </div>
          <div>
            <p className="club-rewards-eyebrow">{reward.type || 'Reward'} · {reward.club}</p>
            <h3>{reward.title}</h3>
            <strong>{reward.points} pts</strong>
            <p>{reward.description}</p>
            <small>Available Stock: {reward.stock}</small>
            {isManager && onToggleVisibility && (
              <div className="club-reward-card__visibility-toggle" style={{ marginTop: '0.75rem' }}>
                <label className="club-rewards-switch" title={reward.isVisible ? 'Nhấn để ẩn phần thưởng' : 'Nhấn để hiển thị phần thưởng'}>
                  <input
                    type="checkbox"
                    checked={Boolean(reward.isVisible)}
                    onChange={() => onToggleVisibility(reward)}
                    aria-label={`Trạng thái hiển thị: ${reward.isVisible ? 'Hiển thị' : 'Đang ẩn'}`}
                  />
                  <span className="club-rewards-switch__slider" />
                </label>
                <span className={`club-reward-card__visibility-text ${reward.isVisible ? 'is-visible' : 'is-hidden'}`}>
                  {reward.isVisible ? 'Hiển thị' : 'Đang ẩn'}
                </span>
              </div>
            )}
          </div>
        </div>
        <footer>
          <button type="button" onClick={onClose}>Close</button>
          {isManager ? (
            <button type="button" onClick={onEdit}>Edit Reward</button>
          ) : (
            <button type="button" disabled={points < reward.points || !reward.stock} onClick={onRedeem}>
              {points < reward.points ? 'Insufficient Points' : !reward.stock ? 'Out of Stock' : 'Redeem Reward'}
            </button>
          )}
        </footer>
      </section>
    </div>
  )
}

function HistoryDetailModal({ item, onClose, isManager = false, onApprove, onReject }) {
  if (!item) return null
  const isApproved = item.status?.toLowerCase() === 'approved'
  const isRejected = item.status?.toLowerCase() === 'rejected'
  const isPending = item.status?.toLowerCase() === 'pending'
  const pickupCode = `REDEEM-${item.id?.substring(item.id.length - 8).toUpperCase()}`

  return (
    <div className="club-rewards-modal" role="dialog" aria-modal="true">
      <button className="club-rewards-modal__backdrop" aria-label="Close" onClick={onClose} type="button" />
      <section className="club-rewards-modal__panel club-rewards-detail">
        <header>
          <h2>{isManager ? 'Club Redemption Request Detail' : 'Redemption Voucher Details'}</h2>
          <button type="button" onClick={onClose}>×</button>
        </header>
        <div className="club-rewards-detail__body">
          <div className="club-rewards-detail__emoji-container" style={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f7', borderRadius: '12px', fontSize: '2.5rem', overflow: 'hidden' }}>
            <RewardImage src={item.image} alt={item.item} className="club-rewards-detail__emoji" />
          </div>
          <div style={{ flex: 1 }}>
            <p className="club-rewards-eyebrow">Voucher Code: <strong>{pickupCode}</strong></p>
            <h3>{item.item}</h3>
            <strong style={{ color: '#ea580c' }}>-{item.points} pts</strong>
            <p style={{ marginTop: '0.4rem', color: '#475569', fontSize: '0.9rem' }}>
              {item.description || 'Exclusive club reward redemption on UniClub.'}
            </p>
            {item.stock !== null && item.stock !== undefined && (
              <p style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: '#64748b' }}>
                📦 Current Available Inventory: <strong>{item.stock} item(s)</strong>
              </p>
            )}
            <p style={{ marginTop: '0.25rem', fontSize: '0.85rem', color: '#64748b' }}>📅 Date Requested: {item.date}</p>
            <div style={{ marginTop: '0.6rem' }}>
              <Status value={item.status} />
            </div>

            {/* Requester Information if member info is present */}
            {(item.member || item.studentCode || item.email || item.phone) && (
              <div style={{ marginTop: '0.85rem', padding: '0.75rem 0.9rem', background: '#f8fafc', borderRadius: '10px', border: '1px solid #e2e8f0', fontSize: '0.85rem', lineHeight: 1.6 }}>
                <div style={{ fontWeight: 700, color: '#1e293b', marginBottom: '0.35rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  👤 Requester Information
                </div>
                {item.member && <div><strong>Name:</strong> {item.member}</div>}
                {item.studentCode && <div><strong>Student ID (MSSV):</strong> <span style={{ fontFamily: 'monospace', fontWeight: 600 }}>{item.studentCode}</span></div>}
                {item.email && <div><strong>Email:</strong> {item.email}</div>}
                {item.phone && <div><strong>Phone:</strong> {item.phone}</div>}
              </div>
            )}

            {isApproved && (
              <div style={{ marginTop: '0.8rem', padding: '0.7rem 0.9rem', background: '#f0fdf4', borderRadius: '10px', border: '1px solid #bbf7d0', fontSize: '0.84rem', color: '#166534', lineHeight: 1.5 }}>
                🎉 <strong>APPROVED!</strong><br />
                {isManager
                  ? `This request has been approved. The member can redeem voucher code ${pickupCode} at the Club Board office.`
                  : `Please present voucher code ${pickupCode} at the Club Board office to receive your reward directly.`}
              </div>
            )}
            {isRejected && (
              <div style={{ marginTop: '0.8rem', padding: '0.7rem 0.9rem', background: '#fef2f2', borderRadius: '10px', border: '1px solid #fecaca', fontSize: '0.84rem', color: '#991b1b', lineHeight: 1.5 }}>
                ❌ <strong>REDEMPTION NOT APPROVED</strong><br />
                {item.rejectionReason ? `Reason: "${item.rejectionReason}". ` : ''}Your reward points have been fully refunded to your balance.
              </div>
            )}
          </div>
        </div>
        {isManager && isPending && onApprove && onReject && (
          <footer>
            <button
              type="button"
              className="is-danger"
              onClick={() => {
                onClose()
                onReject(item)
              }}
            >
              Reject
            </button>
            <button
              type="button"
              style={{ background: '#16a34a', color: '#fff' }}
              onClick={() => {
                onClose()
                onApprove(item)
              }}
            >
              Approve
            </button>
          </footer>
        )}
      </section>
    </div>
  )
}

function Status({ value }) {
  const norm = String(value || '').toUpperCase()
  let className = 'club-rewards-status--pending'
  let label = 'Pending'

  if (norm === 'APPROVED') {
    className = 'club-rewards-status--approved'
    label = 'Approved'
  } else if (norm === 'REJECTED') {
    className = 'club-rewards-status--rejected'
    label = 'Rejected'
  }

  return <span className={`club-rewards-status ${className}`}>{label}</span>
}

function ClubRewardsPage({ isManager = false }) {
  const { clubId } = useParams()
  const showToast = useToast()
  const confirm = useConfirm()
  
  const [rewards, setRewards] = useState([])
  const [redemptions, setRedemptions] = useState([])
  const [points, setPoints] = useState(0)
  
  const [tab, setTab] = useState('inventory')
  const [query, setQuery] = useState('')
  const [stockFilter, setStockFilter] = useState('all')
  const [sortBy, setSortBy] = useState('default')
  const [statusFilter, setStatusFilter] = useState('all')

  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const [editorReward, setEditorReward] = useState(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [detailReward, setDetailReward] = useState(null)
  const [confirmReward, setConfirmReward] = useState(null)
  const [detailHistory, setDetailHistory] = useState(null)
  const [approveConfirmRequest, setApproveConfirmRequest] = useState(null)
  const [rejectRequestModal, setRejectRequestModal] = useState(null)
  const [rejectReason, setRejectReason] = useState('')

  // 1. Fetch rewards list & points balance
  useEffect(() => {
    if (!clubId) return
    let active = true
    setIsLoading(true)

    const fetchPromise = isManager
      ? getManagerRewards(clubId, { limit: 100 })
      : getMemberRewards(clubId)

    fetchPromise
      .then((res) => {
        if (!active) return
        const payload = res.data || {}
        const items = payload.rewards || payload.items || (Array.isArray(payload) ? payload : [])
        
        setRewards(
          items.map((r) => ({
            id: r._id,
            title: r.name,
            points: r.points_required,
            stock: r.quantity,
            type: r.category || 'General',
            image: r.image_url,
            isVisible: r.status === 'active' || r.is_active,
            description: r.description,
            club: 'UniClub'
          }))
        )

        if (!isManager) {
          setPoints(payload.available_points ?? payload.total_points ?? 0)
          setPendingPoints(payload.pending_points ?? 0)
        }
      })
      .catch((err) => {
        console.error('Failed to load rewards:', err)
        showToast({ type: 'error', message: 'Could not load rewards catalog.' })
      })
      .finally(() => {
        if (active) setIsLoading(false)
      })

    return () => { active = false }
  }, [clubId, isManager, reloadKey])

  // 2. Fetch redemption requests (both pending and reviewed)
  useEffect(() => {
    if (!clubId) return
    let active = true

    if (isManager) {
      Promise.all([
        getManagerRedemptionHistory(clubId, { status: 'pending', limit: 100 }),
        getManagerRedemptionHistory(clubId, { status: 'reviewed', limit: 100 }),
      ])
        .then(([reqRes, histRes]) => {
          if (!active) return
          
          const rawItems = [
            ...(reqRes.data || []),
            ...(histRes.data || []),
          ]
          const map = new Map()
          for (const item of rawItems) {
            map.set(String(item._id), item)
          }
          const sorted = Array.from(map.values()).sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          )

          setRedemptions(sorted.map(item => ({
            id: item._id,
            date: new Date(item.created_at).toLocaleDateString('en-US'),
            created_at: item.created_at,
            member: item.membership_id?.user_id?.full_name || 'Member',
            studentCode: item.membership_id?.user_id?.student_code || '',
            email: item.membership_id?.user_id?.email || '',
            phone: item.membership_id?.user_id?.phone || '',
            item: item.reward_id?.name || 'Reward',
            points: item.total_point,
            status: item.status,
            rejectionReason: item.rejection_reason || '',
            image: item.reward_id?.image_url || '🎁',
            description: item.reward_id?.description || '',
            stock: item.reward_id?.quantity ?? null,
          })))
        })
        .catch(err => console.error('Failed to load redemption requests:', err))
    } else {
      Promise.all([
        getMemberRedemptionHistory(clubId, { status: 'pending', limit: 100 }),
        getMemberRedemptionHistory(clubId, { status: 'reviewed', limit: 100 }),
      ])
        .then(([pendingRes, reviewedRes]) => {
          if (!active) return

          const rawItems = [
            ...(pendingRes.data || []),
            ...(reviewedRes.data || []),
          ]
          const map = new Map()
          for (const item of rawItems) {
            map.set(String(item._id), item)
          }
          const sorted = Array.from(map.values()).sort(
            (a, b) => new Date(b.created_at) - new Date(a.created_at)
          )

          setRedemptions(sorted.map(item => ({
            id: item._id,
            date: new Date(item.created_at).toLocaleDateString('en-US'),
            created_at: item.created_at,
            item: item.reward_id?.name || 'Reward',
            points: item.total_point || item.points_spent,
            status: item.status,
            image: item.reward_id?.image_url || '🎁',
            description: item.reward_id?.description || '',
            stock: item.reward_id?.quantity ?? null,
            rejectionReason: item.rejection_reason || '',
          })))
        })
        .catch(err => console.error('Failed to load member redemption requests:', err))
    }

    return () => { active = false }
  }, [clubId, isManager, reloadKey, tab])

  const pendingCount = useMemo(() => {
    return redemptions.filter((r) => String(r.status || '').toLowerCase() === 'pending').length
  }, [redemptions])

  const pendingPoints = useMemo(() => {
    return redemptions
      .filter((r) => String(r.status || '').toLowerCase() === 'pending')
      .reduce((sum, r) => sum + (r.points || 0), 0)
  }, [redemptions])

  const visibleRequests = useMemo(() => {
    if (statusFilter === 'all') return redemptions
    return redemptions.filter(
      (item) => String(item.status || '').toLowerCase() === statusFilter.toLowerCase()
    )
  }, [redemptions, statusFilter])

  const visibleRewards = useMemo(() => {
    let result = rewards.filter((reward) => {
      const search = `${reward.title} ${reward.type || ''}`.toLowerCase().includes(query.toLowerCase())
      return search && (isManager || reward.isVisible)
    })

    if (stockFilter === 'in_stock') {
      result = result.filter((r) => r.stock > 0)
    } else if (stockFilter === 'out_of_stock') {
      result = result.filter((r) => r.stock === 0)
    }

    if (sortBy === 'points_asc') {
      result = [...result].sort((a, b) => a.points - b.points)
    } else if (sortBy === 'points_desc') {
      result = [...result].sort((a, b) => b.points - a.points)
    } else if (sortBy === 'name_asc') {
      result = [...result].sort((a, b) => a.title.localeCompare(b.title))
    }

    return result
  }, [isManager, query, rewards, stockFilter, sortBy])

  // 3. Fetch detailed reward info on click
  function fetchDetail(reward) {
    setDetailReward(reward)
    if (!clubId) return
    const detailPromise = isManager
      ? getManagerRewardDetail(clubId, reward.id)
      : getMemberRewardDetail(clubId, reward.id)

    detailPromise
      .then((res) => {
        const r = res.data?.reward || res.data
        if (r) {
          setDetailReward({
            id: r._id,
            title: r.name,
            type: r.type || 'Voucher',
            club: 'Club',
            points: r.points_required ?? 100,
            stock: r.quantity,
            image: r.image_url,
            description: r.description,
            isVisible: r.status === 'active',
          })
        }
      })
      .catch((err) => console.error('Failed to fetch detail:', err))
  }

  // 4. Create or Update reward
  function saveReward(draft) {
    if (!clubId) return
    setIsActionLoading(true)

    const payload = {
      name: draft.title,
      description: draft.description,
      image_url: draft.image,
      points_required: draft.points,
      point_cost: draft.points,
      quantity: draft.stock,
    }

    const apiPromise = editorReward?.id
      ? updateReward(clubId, editorReward.id, payload)
      : createReward(clubId, payload)

    apiPromise
      .then(() => {
        showToast({
          type: 'success',
          message: editorReward?.id ? 'Reward updated successfully!' : 'New reward created successfully!',
        })
        setEditorOpen(false)
        setReloadKey(k => k + 1)
      })
      .catch((err) => {
        showToast({ type: 'error', message: err.message || 'Failed to save reward' })
      })
      .finally(() => setIsActionLoading(false))
  }

  // 5. Member redeem reward
  function handleRedeemReward() {
    if (!confirmReward || !clubId) return
    setIsActionLoading(true)

    redeemReward(clubId, confirmReward.id)
      .then(() => {
        showToast({
          type: 'success',
          message: 'Redemption request submitted! Please wait for approval.',
        })
        setConfirmReward(null)
        setDetailReward(null)
        setReloadKey(k => k + 1)
      })
      .catch((err) => {
        showToast({ type: 'error', message: err.message || 'Failed to redeem reward.' })
      })
      .finally(() => setIsActionLoading(false))
  }

  // 6. Toggle visibility (hide/show)
  function handleToggleVisibility(reward) {
    if (!clubId) return
    toggleRewardVisibility(clubId, reward.id)
      .then(() => {
        showToast({
          type: 'success',
          message: 'Reward visibility updated successfully!',
        })
        setReloadKey(k => k + 1)
      })
      .catch((err) => {
        showToast({ type: 'error', message: err.message || 'Failed to update visibility.' })
      })
  }

  // 7. Approve redemption request confirmation
  function handleApproveConfirm() {
    if (!clubId || !approveConfirmRequest) return
    setIsActionLoading(true)

    approveRedemption(clubId, approveConfirmRequest.id)
      .then(() => {
        showToast({ type: 'success', message: 'Redemption request approved successfully!' })
        setApproveConfirmRequest(null)
        setReloadKey(k => k + 1)
      })
      .catch((err) => {
        showToast({ type: 'error', message: err.message || 'Failed to approve redemption.' })
      })
      .finally(() => setIsActionLoading(false))
  }

  // 8. Reject redemption request with reason
  function handleRejectSubmit(event) {
    event.preventDefault()
    if (!clubId || !rejectRequestModal) return
    if (!rejectReason.trim()) {
      showToast({ type: 'error', message: 'Please provide a reason for rejection.' })
      return
    }

    setIsActionLoading(true)
    rejectRedemption(clubId, rejectRequestModal.id, rejectReason.trim())
      .then(() => {
        showToast({ type: 'success', message: 'Redemption request rejected.' })
        setRejectRequestModal(null)
        setRejectReason('')
        setReloadKey(k => k + 1)
      })
      .catch((err) => {
        showToast({ type: 'error', message: err.message || 'Failed to reject redemption.' })
      })
      .finally(() => setIsActionLoading(false))
  }

  return (
    <main className="club-rewards-page">
      <section className="club-rewards-hero">
        <div>
          <span>Rewards System</span>
          <h1>{isManager ? 'Reward Management' : 'Reward Store'}</h1>
          <p>{isManager ? 'Create, edit, toggle visibility, and approve member redemption requests.' : 'Redeem your earned contribution points for exclusive club rewards and vouchers.'}</p>
        </div>
        {!isManager && (
          <div className="club-rewards-balance">
            <span>Your Available Points</span>
            <strong>{points} pts</strong>
            {pendingPoints > 0 && (
              <small style={{ fontSize: '0.78rem', color: '#c2410c', fontWeight: 600, display: 'block', marginTop: '0.25rem' }}>
                ({pendingPoints} pts pending approval)
              </small>
            )}
          </div>
        )}
      </section>

      <div className="club-rewards-toolbar">
        <div className="club-rewards-tabs">
          <button className={tab === 'inventory' ? 'is-active' : ''} onClick={() => setTab('inventory')}>
            {isManager ? 'Reward Inventory' : 'Reward Store'}
          </button>
          <button className={tab === 'requests' ? 'is-active' : ''} onClick={() => setTab('requests')}>
            Redemption Requests {pendingCount > 0 && <b>{pendingCount}</b>}
          </button>
        </div>

        {tab === 'inventory' && (
          <div className="club-rewards-controls">
            <input
              type="search"
              placeholder="Search rewards..."
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              aria-label="Search rewards"
            />

            <div className="club-rewards-control-group">
              <label htmlFor="rewards-stock" className="club-rewards-control-label">
                STOCK
              </label>
              <select
                id="rewards-stock"
                className="club-rewards-select"
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value)}
              >
                <option value="all">All Rewards</option>
                <option value="in_stock">In Stock</option>
                <option value="out_of_stock">Out of Stock</option>
              </select>
            </div>

            <div className="club-rewards-control-group">
              <label htmlFor="rewards-sort" className="club-rewards-control-label">
                SORT
              </label>
              <select
                id="rewards-sort"
                className="club-rewards-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
              >
                <option value="default">Default</option>
                <option value="points_asc">Points: Low to High</option>
                <option value="points_desc">Points: High to Low</option>
                <option value="name_asc">Name: A - Z</option>
              </select>
            </div>
          </div>
        )}

        {tab === 'requests' && (
          <div className="club-rewards-controls">
            <div className="club-rewards-control-group">
              <label htmlFor="requests-status" className="club-rewards-control-label">
                STATUS
              </label>
              <select
                id="requests-status"
                className="club-rewards-select"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">All Statuses</option>
                <option value="pending">Pending Only</option>
                <option value="approved">Approved Only</option>
                <option value="rejected">Rejected Only</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {tab === 'inventory' && (
        <section className="club-rewards-grid">
          {isManager && (
            <button className="club-reward-card club-reward-card--add" onClick={() => { setEditorReward(null); setEditorOpen(true) }} type="button">
              +<span>Create Reward</span>
            </button>
          )}
          {isLoading && <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: '#666' }}>Loading rewards...</p>}
          {!isLoading && visibleRewards.map((reward) => (
            <article key={reward.id} className={`club-reward-card${!reward.isVisible ? ' is-hidden' : ''}`} onClick={() => fetchDetail(reward)}>
              <div className="club-reward-card__image" style={{ height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f8f9fc', overflow: 'hidden', fontSize: '3.5rem' }}>
                <RewardImage src={reward.image} alt={reward.title} />
                <small>{reward.type}</small>
              </div>
              <div className="club-reward-card__body">
                <h2>{reward.title}</h2>
                <p>{reward.club}</p>
                <strong>{reward.points} pts</strong>
                <small>Available Stock: {reward.stock}</small>
                {isManager ? (
                  <div className="club-reward-card__visibility-toggle" onClick={(event) => event.stopPropagation()}>
                    <label className="club-rewards-switch" title={reward.isVisible ? 'Nhấn để ẩn phần thưởng' : 'Nhấn để hiển thị phần thưởng'}>
                      <input
                        type="checkbox"
                        checked={Boolean(reward.isVisible)}
                        onChange={() => handleToggleVisibility(reward)}
                        aria-label={`Trạng thái hiển thị: ${reward.isVisible ? 'Hiển thị' : 'Đang ẩn'}`}
                      />
                      <span className="club-rewards-switch__slider" />
                    </label>
                    <span className={`club-reward-card__visibility-text ${reward.isVisible ? 'is-visible' : 'is-hidden'}`}>
                      {reward.isVisible ? 'Hiển thị' : 'Đang ẩn'}
                    </span>
                  </div>
                ) : (
                  <button type="button" disabled={points < reward.points || !reward.stock} onClick={(event) => { event.stopPropagation(); setConfirmReward(reward) }}>
                    Redeem Reward
                  </button>
                )}
              </div>
            </article>
          ))}
          {!isLoading && visibleRewards.length === 0 && (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem 1rem', color: '#8c735d' }}>
              <h3>No matching rewards found</h3>
              <p>Try adjusting your search query or stock filter.</p>
            </div>
          )}
        </section>
      )}

      {tab === 'requests' && (
        <section className="club-rewards-table-card">
          <h2>{isManager ? 'Club Redemption Requests' : 'My Redemption Requests'}</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                {isManager && <th>Member</th>}
                <th>Reward</th>
                <th>Cost</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {visibleRequests.map((item) => (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  {isManager && (
                    <td>
                      <div>
                        <strong>{item.member}</strong>
                        {item.studentCode && (
                          <div style={{ fontSize: '0.8rem', color: '#64748b' }}>{item.studentCode}</div>
                        )}
                      </div>
                    </td>
                  )}
                  <td>{item.item}</td>
                  <td><strong style={{ color: '#ea580c' }}>-{item.points} pts</strong></td>
                  <td>
                    <Status value={item.status} />
                  </td>
                  <td>
                    <button
                      type="button"
                      style={{
                        padding: '0.4rem 0.85rem',
                        fontSize: '0.78rem',
                        fontWeight: 800,
                        borderRadius: '10px',
                        background: 'linear-gradient(135deg, #ff9f2f 0%, #ff8000 100%)',
                        color: '#ffffff',
                        border: 'none',
                        boxShadow: '0 3px 10px rgba(245, 124, 0, 0.22)',
                        cursor: 'pointer'
                      }}
                      onClick={() => setDetailHistory(item)}
                    >
                      👁️ View Details
                    </button>
                  </td>
                </tr>
              ))}
              {!visibleRequests.length && (
                <tr>
                  <td colSpan={isManager ? 6 : 5} style={{ textAlign: 'center', padding: '2.5rem', color: '#8c7e95' }}>
                    No redemption requests found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {editorOpen && <RewardEditor reward={editorReward} onClose={() => setEditorOpen(false)} onSave={saveReward} />}
      
      {detailReward && (
        <RewardDetail
          reward={detailReward}
          isManager={isManager}
          points={points}
          onClose={() => setDetailReward(null)}
          onRedeem={() => setConfirmReward(detailReward)}
          onEdit={() => { setEditorReward(detailReward); setDetailReward(null); setEditorOpen(true) }}
          onToggleVisibility={(r) => {
            handleToggleVisibility(r)
            setDetailReward((prev) => (prev ? { ...prev, isVisible: !prev.isVisible } : prev))
          }}
        />
      )}

      {confirmReward && (
        <div className="club-rewards-modal" role="dialog" aria-modal="true">
          <button className="club-rewards-modal__backdrop" aria-label="Close" onClick={() => setConfirmReward(null)} type="button" />
          <section className="club-rewards-modal__panel club-rewards-confirm">
            <h2>Confirm Redemption</h2>
            <p>Are you sure you want to redeem <strong>{confirmReward.title}</strong> for <strong>{confirmReward.points} points</strong>?</p>
            <p>Balance after redemption: {points - confirmReward.points} pts</p>
            <footer>
              <button onClick={() => setConfirmReward(null)} type="button" disabled={isActionLoading}>Cancel</button>
              <button onClick={handleRedeemReward} type="button" disabled={isActionLoading}>Confirm Redeem</button>
            </footer>
          </section>
        </div>
      )}

      {approveConfirmRequest && (
        <div className="club-rewards-modal" role="dialog" aria-modal="true">
          <button className="club-rewards-modal__backdrop" aria-label="Close" onClick={() => setApproveConfirmRequest(null)} type="button" />
          <section className="club-rewards-modal__panel club-rewards-confirm">
            <h2>Approve Redemption Request</h2>
            <p>Are you sure you want to approve the redemption request from <strong>{approveConfirmRequest.member}</strong> for <strong>{approveConfirmRequest.item}</strong> ({approveConfirmRequest.points} pts)?</p>
            <p style={{ fontSize: '0.88rem', color: '#64748b' }}>Points will be deducted from the member's balance and inventory stock will be decremented.</p>
            <footer>
              <button onClick={() => setApproveConfirmRequest(null)} type="button" disabled={isActionLoading}>Cancel</button>
              <button onClick={handleApproveConfirm} type="button" disabled={isActionLoading} style={{ background: '#16a34a', color: '#fff' }}>Confirm Approve</button>
            </footer>
          </section>
        </div>
      )}

      {rejectRequestModal && (
        <div className="club-rewards-modal" role="dialog" aria-modal="true">
          <button className="club-rewards-modal__backdrop" aria-label="Close" onClick={() => setRejectRequestModal(null)} type="button" />
          <form className="club-rewards-modal__panel" onSubmit={handleRejectSubmit}>
            <header>
              <h2>Reject Redemption Request</h2>
              <button type="button" onClick={() => setRejectRequestModal(null)}>×</button>
            </header>
            <p style={{ marginTop: '0.5rem', color: '#475569', fontSize: '0.9rem' }}>
              You are rejecting the request from <strong>{rejectRequestModal.member}</strong> for <strong>{rejectRequestModal.item}</strong> ({rejectRequestModal.points} pts).
            </p>
            <label style={{ display: 'block', marginTop: '1rem', fontWeight: 600 }}>
              Rejection Reason <span style={{ color: '#dc2626' }}>*</span>
              <textarea
                rows="3"
                required
                placeholder="Enter rejection reason (e.g., Item out of stock, invalid request)..."
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                style={{ width: '100%', marginTop: '0.4rem' }}
              />
            </label>
            <footer>
              <button type="button" onClick={() => setRejectRequestModal(null)} disabled={isActionLoading}>Cancel</button>
              <button type="submit" disabled={isActionLoading || !rejectReason.trim()} className="is-danger">Confirm Reject</button>
            </footer>
          </form>
        </div>
      )}

      {detailHistory && (
        <HistoryDetailModal
          item={detailHistory}
          isManager={isManager}
          onClose={() => setDetailHistory(null)}
          onApprove={(req) => setApproveConfirmRequest(req)}
          onReject={(req) => {
            setRejectRequestModal(req)
            setRejectReason('')
          }}
        />
      )}
    </main>
  )
}

export default ClubRewardsPage
