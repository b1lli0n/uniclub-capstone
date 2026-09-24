import { useMemo, useState, useEffect } from 'react'
import {
  getClubTransactions,
  getFinancialDashboard,
  createTransactionRequest,
  updateTransactionRequest,
  getTransactionDetail,
} from '../../api/finance.api'
import { getClubById } from '../../api/club.api'
import { payWithCash } from '../../api/payment.api'
import { useConfirm, useToast } from '../../components/common/notificationContext'
import '../../styles/club-finance.css'
import Pagination from '../../components/common/Pagination'
import {
  BanknoteIcon,
  CheckIcon,
  XIcon,
  CheckCircleIcon,
  ClockIcon,
  EditIcon,
  ClipboardListIcon,
  SearchIcon,
  PlusIcon,
} from '../../components/common/Icons'

const TRANSACTIONS_PER_PAGE = 8

const EMPTY_FORM = {
  title: '',
  type: 'income',
  period: 'FA26',
  amount: '',
  dateInput: new Date().toISOString().slice(0, 10),
  description: '',
}
const currency = new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 })
const statusLabel = { approved: 'Approved', pending: 'Pending', rejected: 'Rejected' }


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
    title: item.title || item.description || 'New Transaction',
    type: mapTypeToText(item.type),
    period: item.period || 'FA26',
    amount: item.amount || 0,
    date: item.transaction_date ? new Date(item.transaction_date).toLocaleDateString('en-US') : new Date().toLocaleDateString('en-US'),
    dateInput: item.transaction_date ? String(item.transaction_date).slice(0, 10) : new Date().toISOString().slice(0, 10),
    status: mapStatusToText(item.status),
    createdBy: item.created_by?.user_id?.full_name || item.created_by?.full_name || 'Club Board',
    approvedBy: item.approved_by?.user_id?.full_name || item.approved_by?.full_name || (item.status === 'approved' ? 'Club President' : '—'),
    referenceCode: `TR-${String(item._id || '000000').slice(-6).toUpperCase()}`,
    description: item.description || '',
  }
}

function ClubFinancePage({ clubId, userRole }) {
  const confirm = useConfirm()
  const showToast = useToast()
  const [clubName, setClubName] = useState('')
  const [transactions, setTransactions] = useState([])
  const [loading, setLoading] = useState(true)
  const [dashboard, setDashboard] = useState({ balance: 0, approved_income: 0, approved_expense: 0, pending_requests: 0 })
  const [query, setQuery] = useState('')
  const [filter, setFilter] = useState('all')
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [query, filter])
  const [selected, setSelected] = useState(null)
  const [formTarget, setFormTarget] = useState(null)
  const [form, setForm] = useState(EMPTY_FORM)

  const isPresident = userRole === 'president' || userRole === 'leader'

  const loadData = async () => {
    try {
      setLoading(true)
      const [listRes, dashRes, clubRes] = await Promise.allSettled([
        getClubTransactions(clubId),
        getFinancialDashboard(clubId),
        getClubById(clubId),
      ])

      if (listRes.status === 'fulfilled' && listRes.value?.data) {
        setTransactions(listRes.value.data.map(mapTransactionFromApi))
      }
      if (dashRes.status === 'fulfilled' && dashRes.value?.data) {
        setDashboard(dashRes.value.data)
      }
      if (clubRes.status === 'fulfilled' && clubRes.value?.data) {
        setClubName(clubRes.value.data.name || '')
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
    return matchesFilter && (!normalized || [item.title, item.period, item.referenceCode, item.description, item.createdBy].some((value) => value && value.toLowerCase().includes(normalized)))
  }), [transactions, query, filter])

  const totalPages = Math.max(1, Math.ceil(displayed.length / TRANSACTIONS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * TRANSACTIONS_PER_PAGE
    return displayed.slice(startIndex, startIndex + TRANSACTIONS_PER_PAGE)
  }, [displayed, currentPage])

  function openCreate() { setForm(EMPTY_FORM); setFormTarget('create') }
  function openEdit(item) { setForm({ title: item.title, type: item.type, period: item.period || 'FA26', amount: String(item.amount), dateInput: item.dateInput, description: item.description }); setSelected(null); setFormTarget(item) }

  async function saveRequest(event) {
    event.preventDefault()
    const payload = {
      title: form.title.trim(),
      type: form.type === 'income' ? 'income' : 'expense',
      period: form.period ? form.period.trim().toUpperCase() : 'FA26',
      amount: Number(form.amount),
      transaction_date: form.dateInput,
      description: form.description.trim()
    }
    if (!payload.title || !payload.amount || !payload.transaction_date) return

    try {
      if (formTarget === 'create') {
        await createTransactionRequest(clubId, payload)
        showToast({
          type: 'success',
          title: 'Tạo yêu cầu thành công',
          message: 'Yêu cầu giao dịch mới đã được tạo thành công!',
        })
      } else {
        await updateTransactionRequest(clubId, formTarget.id, payload)
        showToast({
          type: 'success',
          title: 'Cập nhật thành công',
          message: 'Yêu cầu giao dịch đã được cập nhật thành công!',
        })
      }
      setFormTarget(null)
      loadData()
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Lỗi lưu giao dịch',
        message: err.message || 'Thao tác không thành công',
      })
    }
  }

  async function handleApprove(item) {
    const accepted = await confirm({
      title: 'Duyệt yêu cầu giao dịch',
      message: `Bạn có chắc chắn muốn duyệt yêu cầu "${item.title}"?`,
      confirmText: 'Duyệt yêu cầu',
      cancelText: 'Hủy',
      tone: 'warning',
    })
    if (!accepted) return

    try {
      await updateTransactionRequest(clubId, item.id, { status: 1 })
      showToast({
        type: 'success',
        title: 'Đã duyệt yêu cầu',
        message: `Chủ nhiệm đã duyệt yêu cầu "${item.title}" thành công!`,
      })
      loadData()
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Lỗi duyệt giao dịch',
        message: err.message || 'Lỗi khi duyệt giao dịch',
      })
    }
  }

  async function handleReject(item) {
    const accepted = await confirm({
      title: 'Từ chối yêu cầu giao dịch',
      message: `Bạn có chắc chắn muốn từ chối yêu cầu "${item.title}"?`,
      confirmText: 'Từ chối',
      cancelText: 'Hủy',
      tone: 'danger',
    })
    if (!accepted) return

    try {
      await updateTransactionRequest(clubId, item.id, { status: 2 })
      showToast({
        type: 'warning',
        title: 'Đã từ chối',
        message: `Chủ nhiệm đã từ chối yêu cầu "${item.title}".`,
      })
      loadData()
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Lỗi từ chối giao dịch',
        message: err.message || 'Lỗi khi từ chối giao dịch',
      })
    }
  }

  function exportReport() {
    const headers = ['Reference', 'Title', 'Type', 'Period', 'Amount', 'Date', 'Status', 'Requested By', 'Approved By']
    const rows = transactions.map((item) => [item.referenceCode, item.title, item.type, item.period, item.amount, item.date, item.status, item.createdBy, item.approvedBy])
    const blob = new Blob([[headers, ...rows].map((row) => row.map((value) => `"${String(value).replaceAll('"', '""')}"`).join(',')).join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob); const link = document.createElement('a'); link.href = url; link.download = `${clubId}-financial-report.csv`; link.click(); URL.revokeObjectURL(url)
    showToast({
      type: 'success',
      title: 'Xuất báo cáo',
      message: 'Báo cáo tài chính đã được tải xuống dạng CSV.',
    })
  }

  return <main className="club-finance-page">
    <section className="club-finance-hero"><div><span>{clubName || 'Club'} · {isPresident ? 'President' : 'Treasurer'} workspace</span><h1>Financial Dashboard</h1><p>Track approved funds, manage transaction requests, and keep every club expense transparent.</p></div><div className="club-finance-hero__actions"><button type="button" onClick={exportReport}>⇩ Export report</button><button type="button" onClick={openCreate}>+ New request</button></div></section>
    <section className="club-finance-summary" aria-label="Financial overview"><SummaryCard label="Current balance" value={income - expense} accent="balance" /><SummaryCard label="Approved income" value={income} accent="income" /><SummaryCard label="Approved expenses" value={expense} accent="expense" /><div className="club-finance-summary__card club-finance-summary__card--pending"><span>Pending requests</span><strong>{transactions.filter((item) => item.status === 'pending').length}</strong><small>Awaiting review</small></div></section>
    <section className="club-finance-transactions">
      <header>
        <div>
          <span>Transaction requests</span>
          <h2>All transactions</h2>
        </div>
        <label className="club-finance-search">
          <SearchIcon size={16} />
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search title, period, reference or requester..." />
        </label>
      </header>
      <div className="club-finance-filters">
        {[['all', 'All'], ['income', 'Income'], ['expense', 'Expenses'], ['pending', 'Pending'], ['approved', 'Approved']].map(([value, label]) => (
          <button key={value} type="button" className={filter === value ? 'is-active' : ''} onClick={() => setFilter(value)}>
            {label}
          </button>
        ))}
      </div>
      <div className="club-finance-table" role="table">
        <div className="club-finance-table__head" role="row">
          <span>Transaction</span>
          <span>Type</span>
          <span>Amount</span>
          <span>Status</span>
          <span />
        </div>
        {loading ? (
          <div className="club-finance-empty">Loading transaction records...</div>
        ) : (
          paginatedTransactions.map((item) => (
            <div className="club-finance-table__row" role="row" key={item.id}>
              <div>
                <strong>{item.title}</strong>
                <small>{item.referenceCode} · {item.period || item.date}</small>
              </div>
              <span className={`club-finance-type club-finance-type--${item.type}`}>
                {item.type === 'income' ? 'Income' : 'Expense'}
              </span>
              <strong className={item.type === 'income' ? 'is-income' : 'is-expense'}>
                {item.type === 'income' ? '+' : '-'}{currency.format(item.amount)}
              </strong>
              <span className={`club-finance-status club-finance-status--${item.status}`}>
                {statusLabel[item.status]}
              </span>
              <div className="club-finance-table__actions">
                <button type="button" onClick={() => setSelected(item)}>View</button>
              </div>
            </div>
          ))
        )}
        {!loading && !displayed.length && (
          <div className="club-finance-empty">No transaction requests match this filter.</div>
        )}
      </div>
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={setPage}
        ariaLabel="Transactions pagination"
      />
    </section>
    {selected && <TransactionDetail item={selected} clubId={clubId} isPresident={isPresident} handleApprove={handleApprove} handleReject={handleReject} onClose={() => setSelected(null)} onEdit={() => openEdit(selected)} />}
    {formTarget && <TransactionForm item={formTarget === 'create' ? null : formTarget} form={form} setForm={setForm} onClose={() => setFormTarget(null)} onSubmit={saveRequest} />}
  </main>
}

function SummaryCard({ label, value, accent }) { return <div className={`club-finance-summary__card club-finance-summary__card--${accent}`}><span>{label}</span><strong>{currency.format(value)}</strong><small>{accent === 'balance' ? 'Available club funds' : 'This semester'}</small></div> }

function TransactionDetail({ item, clubId, isPresident, handleApprove, handleReject, onClose, onEdit }) {
  const confirm = useConfirm()
  const showToast = useToast()
  const [detailData, setDetailData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [collectingId, setCollectingId] = useState(null)

  const reloadDetail = async () => {
    try {
      const res = await getTransactionDetail(clubId, item.id)
      if (res?.data) setDetailData(res.data)
    } catch (err) {
      console.error('Error reloading transaction details:', err)
    }
  }

  const handleCollectCash = async (paymentId, memberName) => {
    const accepted = await confirm({
      title: 'Xác nhận thu tiền mặt',
      message: `Xác nhận đã thu tiền mặt từ thành viên "${memberName}"? Trạng thái sẽ được cập nhật thành đã thanh toán.`,
      confirmText: 'Xác nhận',
      cancelText: 'Hủy',
      tone: 'warning',
    })
    if (!accepted) return

    try {
      setCollectingId(paymentId)
      await payWithCash({ club_id: clubId, payment_id: paymentId })
      showToast({
        type: 'success',
        title: 'Thu tiền thành công',
        message: `Đã ghi nhận thu tiền mặt từ thành viên "${memberName}".`,
      })
      await reloadDetail()
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Lỗi thu tiền mặt',
        message: err.message || 'Lỗi khi xác nhận thu tiền mặt',
      })
    } finally {
      setCollectingId(null)
    }
  }

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
  const paidCount = payments.filter((p) => p.status === 'success' || p.status === 1).length
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
          <div><span>Type</span><strong style={{ textTransform: 'capitalize' }}>{item.type === 'income' ? 'Income (Khoản thu)' : 'Expense (Khoản chi)'}</strong></div>
          <div><span>Period (Kỳ học)</span><strong>{item.period || 'FA26'}</strong></div>
          <div><span>Transaction date</span><strong>{item.date}</strong></div>
          <div><span>Requested by</span><strong>{item.createdBy}</strong></div>
          <div><span>Approved by</span><strong>{item.approvedBy}</strong></div>
        </div>

        <div style={{ marginTop: '0.75rem', marginBottom: '1.25rem' }}>
          <span style={{ fontSize: '0.75rem', fontWeight: 'bold', color: '#64748b', textTransform: 'uppercase' }}>Description</span>
          <p style={{ marginTop: '0.25rem', color: '#334155' }}>{item.description || 'No description provided.'}</p>
        </div>

        {/* Member Payment Status Checklist Section (Only for Income transactions) */}
        {item.type === 'income' && (
          <div style={{ marginTop: '1.25rem', background: '#f8fafc', padding: '1.15rem', borderRadius: '12px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ margin: 0, color: '#0f172a', fontSize: '0.95rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <ClipboardListIcon size={16} /> Member Fee Collection List
              </h4>
              <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: '#059669', background: '#ecfdf5', padding: '0.2rem 0.55rem', borderRadius: '20px' }}>
                Collected: {paidCount}/{totalCount} ({percentage}%)
              </span>
            </div>

            {/* Progress bar */}
            <div style={{ background: '#e2e8f0', borderRadius: '8px', height: '8px', overflow: 'hidden', marginBottom: '0.85rem' }}>
              <div style={{ width: `${percentage}%`, height: '100%', background: 'linear-gradient(90deg, #10b981 0%, #059669 100%)', transition: 'width 0.4s ease' }} />
            </div>

            <div style={{ fontSize: '0.82rem', color: '#64748b', marginBottom: '0.85rem' }}>
              Expected Total: <strong style={{ color: '#0f172a' }}>{currency.format(totalExpected)}</strong> | Actual Collected: <strong style={{ color: '#059669' }}>{currency.format(totalCollected)}</strong>
            </div>

            {/* Member List */}
            {loading ? (
              <div style={{ padding: '0.75rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem' }}>Loading member fee records...</div>
            ) : payments.length === 0 ? (
              <div style={{ padding: '0.75rem', textAlign: 'center', color: '#64748b', fontSize: '0.85rem', fontStyle: 'italic' }}>
                Transaction has not been approved yet, so member fee requests have not been issued.
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.45rem', maxHeight: '220px', overflowY: 'auto' }}>
                {payments.map((p) => {
                  const isPaid = p.status === 'success' || p.status === 1
                  return (
                    <div key={p.payment_id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.55rem 0.75rem', background: '#ffffff', borderRadius: '8px', border: '1px solid #cbd5e1' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.55rem' }}>
                        <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: isPaid ? '#dcfce7' : '#fef3c7', color: isPaid ? '#15803d' : '#d97706', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '0.8rem' }}>
                          {p.full_name?.charAt(0)?.toUpperCase() || 'S'}
                        </div>
                        <div>
                          <div style={{ fontWeight: 'bold', fontSize: '0.85rem', color: '#0f172a' }}>{p.full_name}</div>
                          <div style={{ fontSize: '0.75rem', color: '#64748b' }}>{p.email}</div>
                        </div>
                      </div>

                      <div>
                        {isPaid ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#dcfce7', color: '#15803d', padding: '0.2rem 0.55rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                            <CheckCircleIcon size={14} /> Paid {p.paid_at ? `(${new Date(p.paid_at).toLocaleDateString('en-US')})` : ''}
                          </span>
                        ) : (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '0.3rem', background: '#fef3c7', color: '#b45309', padding: '0.2rem 0.55rem', borderRadius: '12px', fontSize: '0.75rem', fontWeight: 'bold' }}>
                              <ClockIcon size={14} /> Unpaid
                            </span>
                            <button
                              type="button"
                              style={{
                                background: '#10b981',
                                color: '#ffffff',
                                border: 'none',
                                borderRadius: '6px',
                                padding: '0.25rem 0.6rem',
                                fontSize: '0.72rem',
                                fontWeight: 'bold',
                                cursor: collectingId === p.payment_id ? 'not-allowed' : 'pointer',
                                opacity: collectingId === p.payment_id ? 0.6 : 1,
                                display: 'inline-flex',
                                alignItems: 'center',
                                gap: '0.3rem',
                              }}
                              disabled={collectingId === p.payment_id}
                              onClick={() => handleCollectCash(p.payment_id, p.full_name)}
                            >
                              {collectingId === p.payment_id ? '...' : (
                                <>
                                  <BanknoteIcon size={14} /> Thu tiền mặt
                                </>
                              )}
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      <footer>
        <button type="button" onClick={onClose}>Close</button>
        {item.status === 'pending' && (
          isPresident ? (
            <>
              <button
                type="button"
                style={{ background: '#16a34a', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.45rem 0.9rem', cursor: 'pointer', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                onClick={() => { handleApprove(item); onClose(); }}
              >
                <CheckIcon size={15} /> Approve request
              </button>
              <button
                type="button"
                style={{ background: '#dc2626', color: '#fff', border: 'none', borderRadius: '8px', padding: '0.45rem 0.9rem', cursor: 'pointer', fontWeight: 'bold', display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}
                onClick={() => { handleReject(item); onClose(); }}
              >
                <XIcon size={15} /> Reject request
              </button>
            </>
          ) : (
            <button type="button" className="is-primary" onClick={onEdit} style={{ display: 'inline-flex', alignItems: 'center', gap: '0.35rem' }}>
              <EditIcon size={14} /> Edit request
            </button>
          )
        )}
      </footer>
    </FinanceModal>
  )
}

function TransactionForm({ item, form, setForm, onClose, onSubmit }) {
  const change = (key, value) => setForm((current) => ({ ...current, [key]: value }))
  const openDatePicker = (event) => event.currentTarget.showPicker?.()

  return (
    <FinanceModal title={item ? 'Update transaction request' : 'Create transaction request'} onClose={onClose}>
      <form className="club-finance-form" onSubmit={onSubmit}>
        <label>
          Transaction title
          <input
            required
            value={form.title}
            onChange={(event) => change('title', event.target.value)}
            placeholder="e.g. Thu tien phi sinh hoat CLB"
          />
        </label>
        <div>
          <label>
            Type
            <select value={form.type} onChange={(event) => change('type', event.target.value)}>
              <option value="income">Income (Khoản thu / Thu phí thành viên)</option>
              <option value="expense">Expense (Khoản chi quỹ CLB)</option>
            </select>
          </label>
          <label>
            Amount (VND)
            <input
              required
              min="1"
              type="number"
              value={form.amount}
              onChange={(event) => change('amount', event.target.value)}
              placeholder="0"
            />
          </label>
        </div>
        <div>
          <label>
            Period (Học kỳ)
            <input
              required
              value={form.period}
              onChange={(event) => change('period', event.target.value)}
              placeholder="e.g. FA26, SP26, SU26"
            />
          </label>
          <label>
            Transaction date
            <input
              required
              type="date"
              value={form.dateInput}
              onClick={openDatePicker}
              onChange={(event) => change('dateInput', event.target.value)}
            />
          </label>
        </div>
        <label>
          Description
          <textarea
            value={form.description}
            rows="3"
            onChange={(event) => change('description', event.target.value)}
            placeholder="Mô tả chi tiết mục đích thu / chi của giao dịch..."
          />
        </label>
        <footer>
          <button type="button" onClick={onClose}>Cancel</button>
          <button type="submit" className="is-primary">{item ? 'Save changes' : 'Create request'}</button>
        </footer>
      </form>
    </FinanceModal>
  )
}

function FinanceModal({ title, children, onClose }) {
  return (
    <div className="club-finance-modal" role="dialog" aria-modal="true">
      <button className="club-finance-modal__backdrop" aria-label="Close dialog" onClick={onClose} />
      <section className="club-finance-modal__panel">
        <header>
          <h2>{title}</h2>
          <button type="button" aria-label="Close" onClick={onClose}>×</button>
        </header>
        {children}
      </section>
    </div>
  )
}

export default ClubFinancePage