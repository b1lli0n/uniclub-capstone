import { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import { useToast } from '../../components/common/notificationContext'
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
          <h2>{reward?.id ? 'Cập nhật phần thưởng' : 'Tạo phần thưởng mới'}</h2>
          <button type="button" onClick={onClose}>×</button>
        </header>
        <label>
          Tên phần thưởng
          <input value={draft.title} onChange={(event) => change('title', event.target.value)} required />
        </label>
        <div className="club-rewards-form-grid">
          <label>
            Điểm yêu cầu
            <input type="number" min="1" value={draft.points} onChange={(event) => change('points', event.target.value)} required />
          </label>
          <label>
            Số lượng trong kho
            <input type="number" min="0" value={draft.stock} onChange={(event) => change('stock', event.target.value)} required />
          </label>
        </div>
        <div className="club-rewards-form-grid">
          <label>
            Phân loại
            <input value={draft.type} onChange={(event) => change('type', event.target.value)} placeholder="Voucher, ticket..." />
          </label>
          <label>
            Đường dẫn ảnh / Icon
            <input value={draft.image} onChange={(event) => change('image', event.target.value)} placeholder="Emoji hoặc URL ảnh" />
          </label>
        </div>
        <label>
          Mô tả chi tiết
          <textarea rows="3" value={draft.description} onChange={(event) => change('description', event.target.value)} />
        </label>
        <footer>
          <button type="button" onClick={onClose}>Huỷ bỏ</button>
          <button type="submit">Lưu lại</button>
        </footer>
      </form>
    </div>
  )
}

function RewardDetail({ reward, isManager, points, onClose, onRedeem, onEdit }) {
  return (
    <div className="club-rewards-modal" role="dialog" aria-modal="true">
      <button className="club-rewards-modal__backdrop" aria-label="Close" onClick={onClose} type="button" />
      <section className="club-rewards-modal__panel club-rewards-detail">
        <header>
          <h2>Chi tiết phần thưởng</h2>
          <button type="button" onClick={onClose}>×</button>
        </header>
        <div className="club-rewards-detail__body">
          <div className="club-rewards-detail__emoji-container" style={{ width: 80, height: 80, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#f5f5f7', borderRadius: '12px', fontSize: '2.5rem', overflow: 'hidden' }}>
            <RewardImage src={reward.image} alt={reward.title} className="club-rewards-detail__emoji" />
          </div>
          <div>
            <p className="club-rewards-eyebrow">{reward.type || 'Phần thưởng'} · {reward.club}</p>
            <h3>{reward.title}</h3>
            <strong>{reward.points} pts</strong>
            <p>{reward.description}</p>
            <small>Số lượng khả dụng: {reward.stock}</small>
          </div>
        </div>
        <footer>
          <button type="button" onClick={onClose}>Đóng</button>
          {isManager ? (
            <button type="button" onClick={onEdit}>Sửa thông tin</button>
          ) : (
            <button type="button" disabled={points < reward.points || !reward.stock} onClick={onRedeem}>
              {points < reward.points ? 'Không đủ điểm' : !reward.stock ? 'Hết hàng' : 'Đổi thưởng'}
            </button>
          )}
        </footer>
      </section>
    </div>
  )
}

function Status({ value }) {
  const norm = String(value || '').toUpperCase()
  let className = 'club-rewards-status--pending'
  let label = 'Chờ duyệt'

  if (norm === 'APPROVED' || norm === 'APPROVED') {
    className = 'club-rewards-status--approved'
    label = 'Đã duyệt'
  } else if (norm === 'REJECTED') {
    className = 'club-rewards-status--rejected'
    label = 'Từ chối'
  }

  return <span className={`club-rewards-status ${className}`}>{label}</span>
}

function ClubRewardsPage({ isManager = false }) {
  const { clubId } = useParams()
  const showToast = useToast()
  
  const [rewards, setRewards] = useState([])
  const [history, setHistory] = useState([])
  const [requests, setRequests] = useState([])
  const [points, setPoints] = useState(0)
  
  const [tab, setTab] = useState('inventory')
  const [query, setQuery] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isActionLoading, setIsActionLoading] = useState(false)
  const [reloadKey, setReloadKey] = useState(0)

  const [editorReward, setEditorReward] = useState(null)
  const [editorOpen, setEditorOpen] = useState(false)
  const [detailReward, setDetailReward] = useState(null)
  const [confirmReward, setConfirmReward] = useState(null)

  // 1. Fetch rewards list & points balance
  useEffect(() => {
    if (!clubId) return
    let active = true
    setIsLoading(true)

    const fetchPromise = isManager
      ? getManagerRewards(clubId, { limit: 100 })
      : getMemberRewards(clubId, { limit: 100 })

    fetchPromise
      .then((res) => {
        if (!active) return
        
        if (isManager) {
          // President response layout: { success, data: [...] }
          const list = res.data || []
          setRewards(list.map(r => ({
            id: r._id,
            title: r.name,
            type: 'Voucher',
            club: 'CLB',
            points: r.point_cost,
            stock: r.quantity,
            image: r.image_url,
            description: r.description,
            isVisible: r.status === 'active',
          })))
        } else {
          // Member response layout: { success, data: { available_points, rewards: [...] } }
          const payload = res.data || {}
          setPoints(payload.available_points || 0)
          const list = payload.rewards || []
          setRewards(list.map(r => ({
            id: r._id,
            title: r.name,
            type: 'Voucher',
            club: 'CLB',
            points: r.point_cost,
            stock: r.quantity,
            image: r.image_url,
            description: r.description,
            isVisible: r.status === 'active',
          })))
        }
        setIsLoading(false)
      })
      .catch((err) => {
        console.error('Failed to load rewards:', err)
        if (active) setIsLoading(false)
      })

    return () => { active = false }
  }, [clubId, isManager, reloadKey])

  // 2. Fetch history and request redemptions
  useEffect(() => {
    if (!clubId) return
    let active = true

    if (isManager) {
      // Fetch manager requests & history
      Promise.all([
        getManagerRedemptionHistory(clubId, { status: 'pending', limit: 100 }),
        getManagerRedemptionHistory(clubId, { limit: 100 }),
      ])
        .then(([reqRes, histRes]) => {
          if (!active) return
          
          const reqs = reqRes.data || []
          setRequests(reqs.map(item => ({
            id: item._id,
            date: new Date(item.created_at).toLocaleDateString('vi-VN'),
            member: item.membership_id?.user_id?.full_name || 'Thành viên',
            item: item.reward_id?.name || 'Phần thưởng',
            points: item.total_point,
            status: item.status,
          })))

          const hists = histRes.data || []
          setHistory(hists.map(item => ({
            id: item._id,
            date: new Date(item.created_at).toLocaleDateString('vi-VN'),
            member: item.membership_id?.user_id?.full_name || 'Thành viên',
            item: item.reward_id?.name || 'Phần thưởng',
            points: item.total_point,
            status: item.status,
          })))
        })
        .catch(err => console.error('Failed to load redemption history:', err))
    } else {
      // Fetch member redemption history
      getMemberRedemptionHistory(clubId, { limit: 100 })
        .then((res) => {
          if (!active) return
          const hists = res.data || []
          setHistory(hists.map(item => ({
            id: item._id,
            date: new Date(item.created_at).toLocaleDateString('vi-VN'),
            item: item.reward_id?.name || 'Phần thưởng',
            points: item.total_point || item.points_spent,
            status: item.status,
          })))
        })
        .catch(err => console.error('Failed to load member redemption history:', err))
    }

    return () => { active = false }
  }, [clubId, isManager, reloadKey, tab])

  const visibleRewards = useMemo(() => {
    return rewards.filter((reward) => {
      const search = `${reward.title}`.toLowerCase().includes(query.toLowerCase())
      return search && (isManager || reward.isVisible)
    })
  }, [isManager, query, rewards])

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
            type: 'Voucher',
            club: 'CLB',
            points: r.point_cost,
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
          message: editorReward?.id ? 'Cập nhật phần thưởng thành công!' : 'Tạo phần thưởng mới thành công!',
        })
        setEditorOpen(false)
        setReloadKey(k => k + 1)
      })
      .catch((err) => {
        showToast({ type: 'error', message: err.message || 'Lỗi khi lưu phần thưởng' })
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
          message: 'Yêu cầu đổi quà đã được gửi đi! Vui lòng đợi duyệt.',
        })
        setConfirmReward(null)
        setDetailReward(null)
        setReloadKey(k => k + 1)
      })
      .catch((err) => {
        showToast({ type: 'error', message: err.message || 'Yêu cầu đổi quà thất bại.' })
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
          message: 'Thay đổi trạng thái hiển thị thành công!',
        })
        setReloadKey(k => k + 1)
      })
      .catch((err) => {
        showToast({ type: 'error', message: err.message || 'Lỗi khi cập nhật hiển thị.' })
      })
  }

  // 7. Approve / Reject redemption request
  function processRequest(request, status) {
    if (!clubId) return
    setIsActionLoading(true)

    if (status === 'APPROVED') {
      approveRedemption(clubId, request.id)
        .then(() => {
          showToast({ type: 'success', message: 'Duyệt yêu cầu đổi quà thành công!' })
          setReloadKey(k => k + 1)
        })
        .catch((err) => {
          showToast({ type: 'error', message: err.message || 'Duyệt thất bại.' })
        })
        .finally(() => setIsActionLoading(false))
    } else {
      const reason = window.prompt('Nhập lý do từ chối yêu cầu đổi quà:')
      if (reason === null) {
        setIsActionLoading(false)
        return
      }
      
      rejectRedemption(clubId, request.id, reason || 'Từ chối bởi admin')
        .then(() => {
          showToast({ type: 'success', message: 'Từ chối yêu cầu đổi quà thành công!' })
          setReloadKey(k => k + 1)
        })
        .catch((err) => {
          showToast({ type: 'error', message: err.message || 'Từ chối thất bại.' })
        })
        .finally(() => setIsActionLoading(false))
    }
  }

  return (
    <main className="club-rewards-page">
      <section className="club-rewards-hero">
        <div>
          <span>Quản lý đổi thưởng</span>
          <h1>{isManager ? 'Quản lý phần quà' : 'Cửa hàng đổi quà'}</h1>
          <p>{isManager ? 'Tạo mới, chỉnh sửa, ẩn/hiện và phê duyệt yêu cầu đổi quà của thành viên.' : 'Sử dụng điểm đóng góp của bạn để đổi các phần quà ý nghĩa từ câu lạc bộ.'}</p>
        </div>
        {!isManager && (
          <div className="club-rewards-balance">
            <span>Điểm khả dụng của bạn</span>
            <strong>{points} pts</strong>
          </div>
        )}
      </section>

      <div className="club-rewards-toolbar">
        {isManager && (
          <div className="club-rewards-tabs">
            <button className={tab === 'inventory' ? 'is-active' : ''} onClick={() => setTab('inventory')}>Kho phần thưởng</button>
            <button className={tab === 'requests' ? 'is-active' : ''} onClick={() => setTab('requests')}>
              Yêu cầu chờ duyệt <b>{requests.length}</b>
            </button>
            <button className={tab === 'history' ? 'is-active' : ''} onClick={() => setTab('history')}>Lịch sử duyệt</button>
          </div>
        )}
        {!isManager && (
          <button className="club-rewards-history-link" onClick={() => setTab(tab === 'history' ? 'inventory' : 'history')}>
            {tab === 'history' ? '← Xem cửa hàng quà' : 'Xem lịch sử đổi quà của tôi'}
          </button>
        )}
        {tab === 'inventory' && (
          <input type="search" placeholder="Tìm kiếm phần quà..." value={query} onChange={(event) => setQuery(event.target.value)} />
        )}
      </div>

      {tab === 'inventory' && (
        <section className="club-rewards-grid">
          {isManager && (
            <button className="club-reward-card club-reward-card--add" onClick={() => { setEditorReward(null); setEditorOpen(true) }} type="button">
              +<span>Tạo phần quà</span>
            </button>
          )}
          {isLoading && <p style={{ gridColumn: '1/-1', textAlign: 'center', padding: '2rem', color: '#666' }}>Đang tải danh sách phần quà...</p>}
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
                <small>Còn lại trong kho: {reward.stock}</small>
                {isManager ? (
                  <label className="club-reward-visibility" onClick={(event) => event.stopPropagation()}>
                    <input type="checkbox" checked={reward.isVisible} onChange={() => handleToggleVisibility(reward)} />
                    {reward.isVisible ? 'Hiển thị' : 'Đang ẩn'}
                  </label>
                ) : (
                  <button type="button" disabled={points < reward.points || !reward.stock} onClick={(event) => { event.stopPropagation(); setConfirmReward(reward) }}>
                    Đổi quà
                  </button>
                )}
              </div>
            </article>
          ))}
        </section>
      )}

      {tab === 'requests' && isManager && (
        <section className="club-rewards-table-card">
          <h2>Yêu cầu đổi quà đang chờ phê duyệt</h2>
          <table>
            <thead>
              <tr>
                <th>Ngày tạo</th>
                <th>Thành viên</th>
                <th>Phần quà</th>
                <th>Giá trị</th>
                <th>Hành động</th>
              </tr>
            </thead>
            <tbody>
              {requests.map((request) => (
                <tr key={request.id}>
                  <td>{request.date}</td>
                  <td>{request.member}</td>
                  <td>{request.item}</td>
                  <td>{request.points} pts</td>
                  <td>
                    <button onClick={() => processRequest(request, 'APPROVED')} disabled={isActionLoading}>Duyệt</button>
                    <button className="is-danger" onClick={() => processRequest(request, 'REJECTED')} disabled={isActionLoading}>Từ chối</button>
                  </td>
                </tr>
              ))}
              {!requests.length && (
                <tr>
                  <td colSpan="5" style={{ textAlign: 'center', padding: '2rem' }}>Không có yêu cầu nào chờ duyệt.</td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      )}

      {tab === 'history' && (
        <section className="club-rewards-table-card">
          <h2>{isManager ? 'Lịch sử xử lý đổi thưởng' : 'Lịch sử đổi thưởng của tôi'}</h2>
          <table>
            <thead>
              <tr>
                <th>Ngày tạo</th>
                {isManager && <th>Thành viên</th>}
                <th>Phần quà</th>
                <th>Chi phí</th>
                <th>Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {history.map((item) => (
                <tr key={item.id}>
                  <td>{item.date}</td>
                  {isManager && <td>{item.member}</td>}
                  <td>{item.item}</td>
                  <td>{item.points} pts</td>
                  <td>
                    <Status value={item.status} />
                  </td>
                </tr>
              ))}
              {!history.length && (
                <tr>
                  <td colSpan={isManager ? 5 : 4} style={{ textAlign: 'center', padding: '2rem' }}>Không có lịch sử đổi quà.</td>
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
        />
      )}

      {confirmReward && (
        <div className="club-rewards-modal" role="dialog" aria-modal="true">
          <button className="club-rewards-modal__backdrop" aria-label="Close" onClick={() => setConfirmReward(null)} type="button" />
          <section className="club-rewards-modal__panel club-rewards-confirm">
            <h2>Xác nhận đổi thưởng</h2>
            <p>Bạn có chắc chắn muốn đổi phần quà <strong>{confirmReward.title}</strong> với chi phí <strong>{confirmReward.points} điểm</strong>?</p>
            <p>Số dư điểm sau khi đổi: {points - confirmReward.points} pts</p>
            <footer>
              <button onClick={() => setConfirmReward(null)} type="button" disabled={isActionLoading}>Huỷ</button>
              <button onClick={handleRedeemReward} type="button" disabled={isActionLoading}>Xác nhận</button>
            </footer>
          </section>
        </div>
      )}
    </main>
  )
}

export default ClubRewardsPage
