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
  const [fieldErrors, setFieldErrors] = useState({})

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
    return matchesFilter && (!normalized || (item.title && item.title.toLowerCase().includes(normalized)))
  }), [transactions, query, filter])

  const totalPages = Math.max(1, Math.ceil(displayed.length / TRANSACTIONS_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const paginatedTransactions = useMemo(() => {
    const startIndex = (currentPage - 1) * TRANSACTIONS_PER_PAGE
    return displayed.slice(startIndex, startIndex + TRANSACTIONS_PER_PAGE)
  }, [displayed, currentPage])

  function openCreate() {
    setForm(EMPTY_FORM)
    setFieldErrors({})
    setFormTarget('create')
  }

  function openEdit(item) {
    setForm({
      title: item.title || '',
      type: item.type || 'income',
      period: item.period || 'FA26',
      amount: String(item.amount ?? ''),
      dateInput: item.dateInput || '',
      description: item.description || '',
    })
    setFieldErrors({})
    setSelected(null)
    setFormTarget(item)
  }

  async function saveRequest(event) {
    if (event && event.preventDefault) {
      event.preventDefault()
    }

    const newErrors = {}

    const rawTitle = typeof form.title === 'string' ? form.title : String(form.title || '')
    const trimmedTitle = rawTitle.trim()
    if (!trimmedTitle) {
      newErrors.title = 'Vui lòng nhập tên giao dịch (không được để trống hoặc chỉ chứa khoảng trắng).'
    }

    const rawAmount = String(form.amount ?? '').trim()
    const parsedAmount = Number(rawAmount)
    if (!rawAmount) {
      newErrors.amount = 'Vui lòng nhập số tiền (không được để trống hoặc chỉ chứa khoảng trắng).'
    } else if (isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = 'Số tiền phải là số lớn hơn 0.'
    }

    const rawPeriod = typeof form.period === 'string' ? form.period : String(form.period || '')
    const trimmedPeriod = rawPeriod.trim().toUpperCase()
    if (!trimmedPeriod) {
      newErrors.period = 'Vui lòng nhập học kỳ (không được để trống hoặc chỉ chứa khoảng trắng).'
    }

    const rawDate = typeof form.dateInput === 'string' ? form.dateInput : String(form.dateInput || '')
    const trimmedDate = rawDate.trim()
    if (!trimmedDate) {
      newErrors.dateInput = 'Vui lòng chọn ngày giao dịch.'
    }

    const rawDesc = typeof form.description === 'string' ? form.description : String(form.description || '')
    const trimmedDesc = rawDesc.trim()
    if (!trimmedDesc) {
      newErrors.description = 'Vui lòng nhập mô tả chi tiết (không được để trống hoặc chỉ chứa khoảng trắng).'
    }

    if (Object.keys(newErrors).length > 0) {
      setFieldErrors(newErrors)
      const firstErrorMessage = Object.values(newErrors)[0]
      showToast({
        type: 'error',
        title: 'Lỗi nhập liệu',
        message: firstErrorMessage,
      })
      return
    }

    setFieldErrors({})

    const payload = {
      title: trimmedTitle,
      type: form.type === 'income' ? 'income' : 'expense',
      period: trimmedPeriod || 'FA26',
      amount: parsedAmount,
      transaction_date: trimmedDate,
      description: trimmedDesc,
    }

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
    const headers = ['Mã tham chiếu', 'Tên giao dịch', 'Loại', 'Kỳ', 'Số tiền (VNĐ)', 'Ngày giao dịch', 'Trạng thái', 'Người tạo', 'Người duyệt']
    const rowsHtml = transactions.map((item) => {
      const typeLabel = item.type === 'income' ? 'Thu' : 'Chi'
      const statusText = statusLabel[item.status] || item.status
      const formattedAmount = (Number(item.amount) || 0).toLocaleString('vi-VN')
      return `
        <tr>
          <td style="border:1px solid #cbd5e1;padding:8px;mso-number-format:'\\@';">${item.referenceCode || ''}</td>
          <td style="border:1px solid #cbd5e1;padding:8px;">${item.title || ''}</td>
          <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;">${typeLabel}</td>
          <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;">${item.period || ''}</td>
          <td style="border:1px solid #cbd5e1;padding:8px;text-align:right;">${formattedAmount}</td>
          <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;">${item.date || ''}</td>
          <td style="border:1px solid #cbd5e1;padding:8px;text-align:center;">${statusText}</td>
          <td style="border:1px solid #cbd5e1;padding:8px;">${item.createdBy || ''}</td>
          <td style="border:1px solid #cbd5e1;padding:8px;">${item.approvedBy || ''}</td>
        </tr>`
    }).join('')

    const totalIncome = transactions
      .filter((t) => t.type === 'income' && t.status === 'approved')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
    const totalExpense = transactions
      .filter((t) => t.type === 'expense' && t.status === 'approved')
      .reduce((sum, t) => sum + (Number(t.amount) || 0), 0)
    const balance = totalIncome - totalExpense

    const htmlContent = `
      <html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel" xmlns="http://www.w3.org/TR/REC-html40">
      <head>
        <meta http-equiv="content-type" content="application/vnd.ms-excel; charset=UTF-8">
        <!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet><x:Name>Báo cáo tài chính</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions></x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]-->
        <style>
          table { border-collapse: collapse; width: 100%; font-family: 'Segoe UI', Arial, sans-serif; font-size: 13px; }
          th { background-color: #f1f5f9; color: #1e293b; font-weight: bold; border: 1px solid #cbd5e1; padding: 10px; }
          td { border: 1px solid #cbd5e1; padding: 8px; }
          .title { font-size: 18px; font-weight: bold; text-align: center; padding: 15px; color: #0f172a; }
          .summary { font-weight: bold; background-color: #f8fafc; }
        </style>
      </head>
      <body>
        <table>
          <tr><td colspan="9" class="title">BÁO CÁO TÀI CHÍNH - ${clubName || 'CLB'}</td></tr>
          <tr><td colspan="9" style="text-align:center;color:#64748b;padding-bottom:15px;">Ngày xuất: ${new Date().toLocaleDateString('vi-VN')}</td></tr>
          <thead>
            <tr>
              ${headers.map((h) => `<th>${h}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${rowsHtml}
            <tr class="summary">
              <td colspan="4" style="text-align:right;font-weight:bold;padding:10px;">Tổng thu đã duyệt:</td>
              <td style="text-align:right;font-weight:bold;color:#16a34a;padding:10px;">+${totalIncome.toLocaleString('vi-VN')} đ</td>
              <td colspan="4"></td>
            </tr>
            <tr class="summary">
              <td colspan="4" style="text-align:right;font-weight:bold;padding:10px;">Tổng chi đã duyệt:</td>
              <td style="text-align:right;font-weight:bold;color:#dc2626;padding:10px;">-${totalExpense.toLocaleString('vi-VN')} đ</td>
              <td colspan="4"></td>
            </tr>
            <tr class="summary">
              <td colspan="4" style="text-align:right;font-weight:bold;padding:10px;">Số dư hiện tại:</td>
              <td style="text-align:right;font-weight:bold;color:#2563eb;padding:10px;">${balance.toLocaleString('vi-VN')} đ</td>
              <td colspan="4"></td>
            </tr>
          </tbody>
        </table>
      </body>
      </html>
    `
    const blob = new Blob(['\uFEFF' + htmlContent], { type: 'application/vnd.ms-excel;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `${clubId || 'club'}-bao-cao-tai-chinh.xls`
    link.click()
    URL.revokeObjectURL(url)
    showToast({
      type: 'success',
      title: 'Xuất báo cáo thành công',
      message: 'Báo cáo tài chính đã được tải xuống dưới dạng bảng Excel (.xls).',
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
          <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search here ..." />
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
    {formTarget && (
      <TransactionForm
        item={formTarget === 'create' ? null : formTarget}
        form={form}
        setForm={setForm}
        fieldErrors={fieldErrors}
        setFieldErrors={setFieldErrors}
        onClose={() => setFormTarget(null)}
        onSubmit={saveRequest}
      />
    )}
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

function TransactionForm({ item, form, setForm, fieldErrors, setFieldErrors, onClose, onSubmit }) {
  const change = (key, value) => {
    setForm((current) => ({ ...current, [key]: value }))
    if (fieldErrors && fieldErrors[key] && setFieldErrors) {
      setFieldErrors((prev) => ({ ...prev, [key]: null }))
    }
  }
  const openDatePicker = (event) => event.currentTarget.showPicker?.()

  return (
    <FinanceModal title={item ? 'Update transaction request' : 'Create transaction request'} onClose={onClose}>
      <form noValidate className="club-finance-form" onSubmit={onSubmit}>
        <label>
          Transaction title
          <input
            value={form.title}
            onChange={(event) => change('title', event.target.value)}
            placeholder="e.g. Thu tien phi sinh hoat CLB"
            style={fieldErrors?.title ? { borderColor: '#e53e3e', background: '#fff5f5' } : undefined}
          />
          {fieldErrors?.title && (
            <span style={{ color: '#e53e3e', fontSize: '0.72rem', fontWeight: 600, marginTop: '2px', textTransform: 'none' }}>
              {fieldErrors.title}
            </span>
          )}
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
              type="text"
              inputMode="numeric"
              value={form.amount}
              onChange={(event) => change('amount', event.target.value)}
              placeholder="0"
              style={fieldErrors?.amount ? { borderColor: '#e53e3e', background: '#fff5f5' } : undefined}
            />
            {fieldErrors?.amount && (
              <span style={{ color: '#e53e3e', fontSize: '0.72rem', fontWeight: 600, marginTop: '2px', textTransform: 'none' }}>
                {fieldErrors.amount}
              </span>
            )}
          </label>
        </div>
        <div>
          <label>
            Period (Học kỳ)
            <input
              value={form.period}
              onChange={(event) => change('period', event.target.value)}
              placeholder="e.g. FA26, SP26, SU26"
              style={fieldErrors?.period ? { borderColor: '#e53e3e', background: '#fff5f5' } : undefined}
            />
            {fieldErrors?.period && (
              <span style={{ color: '#e53e3e', fontSize: '0.72rem', fontWeight: 600, marginTop: '2px', textTransform: 'none' }}>
                {fieldErrors.period}
              </span>
            )}
          </label>
          <label>
            Transaction date
            <input
              type="date"
              value={form.dateInput}
              onClick={openDatePicker}
              onChange={(event) => change('dateInput', event.target.value)}
              style={fieldErrors?.dateInput ? { borderColor: '#e53e3e', background: '#fff5f5' } : undefined}
            />
            {fieldErrors?.dateInput && (
              <span style={{ color: '#e53e3e', fontSize: '0.72rem', fontWeight: 600, marginTop: '2px', textTransform: 'none' }}>
                {fieldErrors.dateInput}
              </span>
            )}
          </label>
        </div>
        <label>
          Description
          <textarea
            value={form.description}
            rows="3"
            onChange={(event) => change('description', event.target.value)}
            placeholder="Mô tả chi tiết mục đích thu / chi của giao dịch..."
            style={fieldErrors?.description ? { borderColor: '#e53e3e', background: '#fff5f5' } : undefined}
          />
          {fieldErrors?.description && (
            <span style={{ color: '#e53e3e', fontSize: '0.72rem', fontWeight: 600, marginTop: '2px', textTransform: 'none' }}>
              {fieldErrors.description}
            </span>
          )}
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