import { useMemo, useState, useEffect } from 'react'
import { ALL_CLUBS } from '../../data/mockData'
import {
  getClubTransactions,
  getFinancialDashboard,
  createTransactionRequest,
  updateTransactionRequest,
  getTransactionDetail,
} from '../../api/finance.api'
import '../../styles/club-finance.css'

const EMPTY_FORM = { title: '', type: 'expense', category: '', period: '', amount: '', dateInput: '', description: '' }
const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
const statusLabel = { approved: 'Approved', pending: 'Pending', rejected: 'Rejected' }
const fallbackClub = ALL_CLUBS[0]

const mapStatusToText = (statusNum) => {
  if (statusNum === 1 || statusNum === 'approved') return 'approved'
  if (statusNum === 2 || statusNum === 'rejected') return 'rejected'
  return 'pending'
}

const mapTypeToText = (typeNum) => {
  if (typeNum === 0 || typeNum === 'income') return 'income'
  return 'expense'
}

function mapTransactionFromApi(item) {
  return {
    id: item._id || item.id,
    title: item.title || item.description || 'Giao dịch mới',
    type: mapTypeToText(item.type),
    category: item.category || 'Hội phí',
    period: item.period || 'Q1/2026',
    amount: item.amount || 0,
    date: item.transaction_date ? new Date(item.transaction_date).toLocaleDateString('vi-VN') : new Date().toLocaleDateString('vi-VN'),
    dateInput: item.transaction_date ? String(item.transaction_date).slice(0, 10) : new Date().toISOString().slice(0, 10),
    status: mapStatusToText(item.status),
    createdBy: item.created_by?.full_name || 'Ban điều hành',
    referenceCode: `TR-${String(item._id || '000000').slice(-6).toUpperCase()}`,
    description: item.description || '',
  }
}

function ClubFinancePage({ clubId, userRole }) {
  const club = ALL_CLUBS.find((item) => item.id === clubId) || fallbackClub
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState({ balance: 0, approved_income: 0, approved_expense: 0, pending_requests: 0 })
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [selected, setSelected] = useState(null)
  const [formTarget, setFormTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)
  const [toast, setToast] = useState(null)

  const isPresident = userRole === 'president' || userRole === 'leader'

  const loadData = async () => {
    try {
      setLoading(true)
      const [listRes, dashRes] = await Promise.allSettled([
        getClubTransactions(clubId),
        getFinancialDashboard(clubId),
      ])

      if (listRes.status === 'fulfilled' && listRes.value?.data) {
        setTransactions(listRes.value.data.map(mapTransactionFromApi))
      }
      if (dashRes.status === 'fulfilled' && dashRes.value?.data) {
        setDashboard(dashRes.value.data)
      }
    } catch (err) {
      console.error('Error fetching finance data:', err)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (clubId) loadData()
  }, [clubId])

  const income = useMemo(() => {
    return dashboard.approved_income || 0
  }, [dashboard])

  const expense = useMemo(() => {
    return dashboard.approved_expense || 0
  }, [dashboard])

  const displayed = useMemo(() => transactions.filter((item) => {
    const matchesFilter = filter === 'all' || item.status === filter || item.type === filter
    const normalized = query.trim().toLowerCase()
    return matchesFilter && (!normalized || [item.title, item.category, item.period, item.referenceCode].some((value) => value && value.toLowerCase().includes(normalized)))
  }), [transactions, query, filter])

  function notify(message) { setToast(message); window.setTimeout(() => setToast(null), 3500) }
  function openCreate() { setForm(EMPTY_FORM); setFormTarget('create') }
  function openEdit(item) { setForm({ title: item.title, type: item.type, category: item.category, period: item.period || '', amount: String(item.amount), dateInput: item.dateInput, description: item.description }); setSelected(null); setFormTarget(item) }

  async function saveRequest(event) {
    event.preventDefault()
    const payload = {
      title: form.title.trim(),
      type: form.type === 'income' ? 0 : 1,
      category: form.category.trim(),
      period: form.period ? form.period.trim() : 'Q1/2026',
      amount: Number(form.amount),
      transaction_date: form.dateInput,
      description: form.description.trim()
    }
    if (!payload.title || !payload.amount || !payload.transaction_date) return

    try {
      if (formTarget === 'create') {
        await createTransactionRequest(clubId, payload)
        notify('🎉 Đã khởi tạo yêu cầu giao dịch mới thành công!')
      } else {
        await updateTransactionRequest(clubId, formTarget.id, payload)
        notify('🎉 Đã cập nhật thông tin giao dịch thành công!')
      }
      setFormTarget(null)
      loadData()
    } catch (err) {
      notify(`❌ Lỗi khi lưu giao dịch: ${err.message || 'Thao tác thất bại'}`)
    }
  }

  async function handleApprove(item) {
    try {
      await updateTransactionRequest(clubId, item.id, { status: 1 })
      notify(`🎉 Chủ tịch đã duyệt yêu cầu "${item.title}" thành công!`)
      loadData()
    } catch (err) {
      notify(`❌ Lỗi duyệt giao dịch: ${err.message}`)
    }
  }

  async function handleReject(item) {
    try {
      await updateTransactionRequest(clubId, item.id, { status: 2 })
      notify(`❌ Chủ tịch đã từ chối yêu cầu "${item.title}".`)
      loadData()
    } catch (err) {
      notify(`❌ Lỗi từ chối giao dịch: ${err.message}`)
    }
  }

  function exportReport() {
    const headers = ['Reference', 'Title', 'Type', 'Category', 'Period', 'Amount', 'Date', 'Status']
    const rows = transactions.map((item) => [item.referenceCode, item.title, item.type, item.category, item.period, item.amount, item.date, item.status])
    const blob = new Blob([[headers, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${club.id}-financial-report.csv`; link.click(); URL.revokeObjectURL(url)
    notify('Financial report exported as CSV.')
  }

  return <main className="club-finance-page">
    <section className="club-finance-hero"><div><span>{club.name} · {isPresident ? 'President' : 'Treasurer'} workspace</span><h1>Financial Dashboard</h1><p>Track approved funds, manage transaction requests, and keep every club expense transparent.</p></div><div className="club-finance-hero__actions"><button type="button" onClick={exportReport}>⇩ Export report</button><button type="button" onClick={openCreate}>+ New request</button></div></section>
    <section className="club-finance-summary" aria-label="Financial overview"><SummaryCard label="Current balance" value={income - expense} accent="balance" /><SummaryCard label="Approved income" value={income} accent="income" /><SummaryCard label="Approved expenses" value={expense} accent="expense" /><div className="club-finance-summary__card club-finance-summary__card--pending"><span>Pending requests</span><strong>{transactions.filter((item) => item.status === 'pending').length}</strong><small>Awaiting review</small></div></section>
    <section className="club-finance-transactions"><header><div><span>Transaction requests</span><h2>All transactions</h2></div><label className="club-finance-search">⌕<input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, category or reference..." /></label></header><div className="club-finance-filters">{[['all', 'All'], ['income', 'Income'], ['expense', 'Expenses'], ['pending', 'Pending'], ['approved', 'Approved']].map(([value, label]) => <button key={value} type="button" className={filter === value ? 'is-active' : ''} onClick={() => setFilter(value)}>{label}</button>)}</div><div className="club-finance-table" role="table"><div className="club-finance-table__head" role="row"><span>Transaction</span><span>Type</span><span>Amount</span><span>Status</span><span /></div>{loading ? <div className="club-finance-empty">Đang tải danh sách giao dịch...</div> : displayed.map((item) => <div className="club-finance-table__row" role="row" key={item.id}><div><strong>{item.title}</strong><small>{item.referenceCode} · {item.period || item.date}</small></div><span className={`club-finance-type club-finance-type--${item.type}`}>{item.type === 'income' ? 'Income' : 'Expense'}</span><strong className={item.type === 'income' ? 'is-income' : 'is-expense'}>{item.type === 'income' ? '+' : '-'}{currency.format(item.amount)}</strong><span className={`club-finance-status club-finance-status--${item.status}`}>{statusLabel[item.status]}</span><div className="club-finance-table__actions"><button type="button" onClick={() => setSelected(item)}>View</button>{item.status === 'pending' && (<>{isPresident ? (<><button type="button" style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.25rem 0.55rem', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => handleApprove(item)}>✓ Approve</button><button type="button" style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: '6px', padding: '0.25rem 0.55rem', cursor: 'pointer', fontWeight: 'bold' }} onClick={() => handleReject(item)}>× Reject</button></>) : (<button type="button" onClick={() => openEdit(item)}>Edit</button>)}</>)}</div></div>)}{!loading && !displayed.length && <div className="club-finance-empty">No transaction requests match this filter.</div>}</div></section>
    {selected && <TransactionDetail item={selected} clubId={clubId} onClose={() => setSelected(null)} onEdit={() => openEdit(selected)} />}
    {formTarget && <TransactionForm item={formTarget === 'create' ? null : formTarget} form={form} setForm={setForm} onClose={() => setFormTarget(null)} onSubmit={saveRequest} />}
    {toast && <div className="club-finance-toast" role="status">{toast}</div>}
  </main>
}

function SummaryCard({ label, value, accent }) { return <div className={`club-finance-summary__card club-finance-summary__card--${accent}`}><span>{label}</span><strong>{currency.format(value)}</strong><small>{accent === 'balance' ? 'Available club funds' : 'This semester'}</small></div> }

function TransactionDetail({ item, clubId, onClose, onEdit }) {
  const [detailData, setDetailData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (item?.id && clubId) {
      setLoading(true)
      getTransactionDetail(clubId, item.id)
        .then((res) => {
          if (res?.data) setDetailData(res.data)
        })
        .catch((err) => console.error('Error fetching transaction details:', err))
        .finally(() => setLoading(false))
    }
  }, [item, clubId])

  const payments = detailData?.member_payments || []
  const totalCount = payments.length
  const paidCount = payments.filter((p) => p.status === 1).length
  const amountPerMember = item.amount || 0
  const totalExpected = totalCount * amountPerMember
  const totalCollected = paidCount * amountPerMember
  const percentage = totalCount > 0 ? Math.round((paidCount / totalCount) * 100) : 0

  return (
    <FinanceModal title="Transaction detail" onClose={onClose}>
      <div className="club-finance-detail" style={{ maxHeight: '75vh', overflowY: 'auto' }}>
        <div className="club-finance-detail__title">
          <span className={`club-finance-type club-finance-type--${item.type}`}>
            {item.type === 'income' ? 'Income' : 'Expense'}
          </span>
          <h3>{item.title}</h3>
          <strong className={item.type === 'income' ? 'is-income' : 'is-expense'}>
            {item.type === 'income' ? '+' : '-'}{currency.format(item.amount)}
          </strong>
        </div>

        <div className="club-finance-detail__grid">
          <div><span>Reference</span><strong>{item.referenceCode}</strong></div>
          <div><span>Status</span><strong className={`club-finance-status club-finance-status--${item.status}`}>{statusLabel[item.status]}</strong></div>
          <div><span>Category</span><strong>{item.category}</strong></div>
          <div><span>Period</span><strong>{item.period || 'Q1/2026'}</strong></div>
          <div><span>Transaction date</span><strong>{item.date}</strong></div>
          <div><span>Requested by</span><strong>{item.createdBy}</strong></div>
        </div>

        <p style={{ marginTop: '0.75rem', marginBottom: '1.25rem', color: '#475569' }}>{item.description}</p>

        {/* Member Payment Status Checklist Section (Only for Income transactions) */}
        {item.type === 'income' && (
          <div style={{ marginTop: '1.25rem', background: '#f8fafc', padding: '1.15rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ margin: 0, color: '#0f172a', fontSize: '0.95rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                📋 Danh Sách Đóng Tiền Thành Viên
              </h4>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#059669', background: '#ecfdf5', padding: '0.2rem 0.55rem', borderRadius: '20px' }}>
                Đã thu: {paidCount}/{totalCount} ({percentage}%)
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ background: '#e2e8f0', borderRadius: '8px', height: '8px', overflow: 'hidden', marginBottom: '0.85rem' }}>
              <div style={{ width: `${percentage}%`, height: '100%', background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', transition: 'width 0.4s ease' }} />
            </div>

            <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.85rem' }}>
              Tổng thu dự kiến: <strong style={{ color: '#0f172a' }}>{currency.format(totalExpected)}</strong> | Thực thu: <strong style={{ color: '#059669' }}>{currency.format(totalCollected)}</strong>
            </div>

            {/* Member List */}
            {loading ? (
              <div style={{ padding: '0.75rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>Đang tải danh sách đóng tiền...</div>
            ) : payments.length === 0 ? (
              <div style={{ padding: '0.75rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>
                Giao dịch chưa được Duyệt (Approved) nên chưa phát hành đơn đóng tiền cho thành viên.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '220px', overflowY: 'auto' }}>
                {payments.map((p) => (
                  <div key={p.payment_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.55rem 0.75rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: p.status === 1 ? '#dcfce7' : '#fef3c7', color: p.status === 1 ? '#15803d' : '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                        {p.full_name?.charAt(0)?.toUpperCase() || 'S'}
                      </div>
                      <div>
                        <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#0f172a' }}>{p.full_name}</div>
                        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.email}</div>
                      </div>
                    </div>

                    <div>
                      {p.status === 1 ? (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', background: '#dcfce7', color: '#15803d', padding: '0.15rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          ✅ Đã thanh toán {p.paid_at ? `(${new Date(p.paid_at).toLocaleDateString('vi-VN')})` : ''}
                        </span>
                      ) : (
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.2rem', background: '#fef3c7', color: '#b45309', padding: '0.15rem 0.5rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                          ⏳ Chưa thanh toán
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <footer>
        <button type="button" onClick={onClose}>Close</button>
        {item.status === 'pending' && <button type="button" className="is-primary" onClick={onEdit}>Edit request</button>}
      </footer>
    </FinanceModal>
  )
}

function TransactionForm({ item, form, setForm, onClose, onSubmit }) { const change = (key, value) => setForm((current) => ({ ...current, [key]: value })); const openDatePicker = (event) => event.currentTarget.showPicker?.(); return <FinanceModal title={item ? 'Update transaction request' : 'Create transaction request'} onClose={onClose}><form className="club-finance-form" onSubmit={onSubmit}><label>Transaction title<input required value={form.title} onChange={(event) => change('title', event.target.value)} placeholder="e.g. Buy event supplies" /></label><div><label>Type<select value={form.type} onChange={(event) => change('type', event.target.value)}><option value="expense">Expense</option><option value="income">Income</option></select></label><label>Amount (VND)<input required min="1" type="number" value={form.amount} onChange={(event) => change('amount', event.target.value)} placeholder="0" /></label></div><div><label>Category<input required value={form.category} onChange={(event) => change('category', event.target.value)} placeholder="e.g. Membership Fee" /></label><label>Period (Kỳ hạn)<input required value={form.period} onChange={(event) => change('period', event.target.value)} placeholder="e.g. Q1/2026, Tháng 08/2026" /></label></div><div><label>Date<input required type="date" value={form.dateInput} onClick={openDatePicker} onChange={(event) => change('dateInput', event.target.value)} /></label></div><label>Description<textarea value={form.description} rows="3" onChange={(event) => change('description', event.target.value)} placeholder="Add context for this transaction request..." /></label><footer><button type="button" onClick={onClose}>Cancel</button><button type="submit" className="is-primary">{item ? 'Save changes' : 'Create request'}</button></footer></form></FinanceModal> }
function FinanceModal({ title, children, onClose }) { return <div className="club-finance-modal" role="dialog" aria-modal="true"><button className="club-finance-modal__backdrop" aria-label="Close dialog" onClick={onClose} /><section className="club-finance-modal__panel"><header><h2>{title}</h2><button type="button" aria-label="Close" onClick={onClose}>×</button></header>{children}</section></div> }

export default ClubFinancePage
