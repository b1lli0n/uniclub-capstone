import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '../../components/common/notificationContext'
import { getFeeList, createPaymentUrl } from '../../api/payment.api'
import '../../styles/club-fees.css'

function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND', maximumFractionDigits: 0 }).format(amount || 0)
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

export default function ClubFeesPage({ clubId: propClubId }) {
  const params = useParams()
  const navigate = useNavigate()
  const clubId = propClubId || params.clubId
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [feesData, setFeesData] = useState({ items: [], summary: { unpaid: 0, paid: 0, failed: 0, all: 0 } })
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('all') // 'all', 'pending', 'success', 'failed'
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [selectedMethod, setSelectedMethod] = useState('all') // 'all', 'vnpay', 'cash'
  const [sortBy, setSortBy] = useState('newest')
  const [selectedPayment, setSelectedPayment] = useState(null)
  const [paymentMethod, setPaymentMethod] = useState('vnpay') // 'vnpay' | 'cash'
  const [processing, setProcessing] = useState(false)

  const loadFees = async () => {
    try {
      setLoading(true)
      const options = {}
      if (activeTab !== 'all') options.status = activeTab
      if (selectedPeriod) options.period = selectedPeriod

      const res = await getFeeList(clubId, options)
      if (res.data) {
        setFeesData(res.data)
      }
    } catch (err) {
      console.error('Failed to load fees:', err)
      toast.error?.(err.message || 'Failed to load membership fees')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFees()
  }, [clubId, activeTab, selectedPeriod])

  const periods = useMemo(() => {
    const list = feesData.items.map((i) => i.period).filter(Boolean)
    return Array.from(new Set(list))
  }, [feesData.items])

  // Calculated totals
  const totalUnpaidAmount = useMemo(() => {
    return feesData.items
      .filter((i) => i.status === 'pending' || i.status === 0 || i.status === '0')
      .reduce((sum, i) => sum + (i.amount || 0), 0)
  }, [feesData.items])

  const totalPaidAmount = useMemo(() => {
    return feesData.items
      .filter((i) => i.status === 'success' || i.status === 1 || i.status === '1')
      .reduce((sum, i) => sum + (i.amount || 0), 0)
  }, [feesData.items])

  const sortedItems = useMemo(() => {
    let list = [...feesData.items]

    // Text search filter (title, period, club_name, reference code, id)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter((i) => {
        const orderMatch = (i.order_info || '').toLowerCase().includes(q)
        const periodMatch = (i.period || '').toLowerCase().includes(q)
        const clubMatch = (i.club_name || '').toLowerCase().includes(q)
        const idMatch = (i._id || '').toLowerCase().includes(q)
        return orderMatch || periodMatch || clubMatch || idMatch
      })
    }

    // Payment method filter
    if (selectedMethod !== 'all') {
      list = list.filter((i) => {
        const m = String(i.payment_method || '').toLowerCase()
        return m === selectedMethod.toLowerCase()
      })
    }

    // Sort order
    switch (sortBy) {
      case 'newest':
        return list.sort((a, b) => new Date(b.created_at || b.paid_at || 0) - new Date(a.created_at || a.paid_at || 0))
      case 'oldest':
        return list.sort((a, b) => new Date(a.created_at || a.paid_at || 0) - new Date(b.created_at || b.paid_at || 0))
      case 'amount-desc':
        return list.sort((a, b) => (b.amount || 0) - (a.amount || 0))
      case 'amount-asc':
        return list.sort((a, b) => (a.amount || 0) - (b.amount || 0))
      case 'period-desc':
        return list.sort((a, b) => (b.period || '').localeCompare(a.period || ''))
      case 'period-asc':
        return list.sort((a, b) => (a.period || '').localeCompare(b.period || ''))
      default:
        return list
    }
  }, [feesData.items, searchQuery, selectedMethod, sortBy])

  const handleStartPayment = (payment) => {
    setSelectedPayment(payment)
    setPaymentMethod('vnpay')
  }

  const handleConfirmCashNotice = () => {
    toast.info?.('📌 Vui lòng liên hệ Thủ quỹ CLB để nộp tiền mặt. Sau khi nhận đủ tiền, Thủ quỹ sẽ kiểm tra và xác nhận thanh toán trên hệ thống cho bạn.')
    setSelectedPayment(null)
  }

  const handleConfirmVNPay = async () => {
    if (!selectedPayment) return
    try {
      setProcessing(true)
      const res = await createPaymentUrl({
        club_id: selectedPayment.club_id || clubId,
        payment_id: selectedPayment._id,
        orderInfo: selectedPayment.order_info || `Membership fee payment ${selectedPayment.period}`
      })

      if (res.paymentUrl) {
        toast.info?.('Redirecting to VNPay payment gateway...')
        window.location.href = res.paymentUrl
      } else {
        toast.error?.('Failed to generate VNPay payment link')
      }
    } catch (err) {
      console.error('Create payment URL error:', err)
      toast.error?.(err.message || 'Error initializing VNPay payment')
    } finally {
      setProcessing(false)
    }
  }

  const hasActiveFilters = Boolean(searchQuery || selectedPeriod || selectedMethod !== 'all' || activeTab !== 'all')

  const resetFilters = () => {
    setSearchQuery('')
    setSelectedPeriod('')
    setSelectedMethod('all')
    setActiveTab('all')
    setSortBy('newest')
  }

  return (
    <main className="club-fees-page">
      {/* Hero Banner with UniClub Signature Gradient */}
      <section className="club-fees-hero">
        <div>
          <span className="club-fees-hero__eyebrow">💰 Financial Dues & Contributions</span>
          <h1 className="club-fees-hero__title">Club Membership Fees</h1>
          <p className="club-fees-hero__subtitle">
            Manage, review, and settle your club membership dues, activity funds, and fee obligations securely via VNPay or Cash.
          </p>
        </div>

        <div className="club-fees-hero__summary">
          <span>Outstanding Balance</span>
          <strong>{formatVND(totalUnpaidAmount)}</strong>
          <div className="club-fees-hero__summary-sub">
            {feesData.summary?.unpaid || 0} unpaid invoice{feesData.summary?.unpaid !== 1 ? 's' : ''}
          </div>
        </div>
      </section>

      {/* Summary Cards Grid */}
      <section className="club-fees-stats" aria-label="Fee statistics">
        <div className="club-fees-stat-card club-fees-stat-card--unpaid">
          <div className="club-fees-stat-card__icon">⏱️</div>
          <div className="club-fees-stat-card__info">
            <span className="club-fees-stat-card__label">Unpaid Dues</span>
            <strong className="club-fees-stat-card__value">{feesData.summary?.unpaid || 0}</strong>
            <small className="club-fees-stat-card__sub">{formatVND(totalUnpaidAmount)}</small>
          </div>
        </div>

        <div className="club-fees-stat-card club-fees-stat-card--paid">
          <div className="club-fees-stat-card__icon">✓</div>
          <div className="club-fees-stat-card__info">
            <span className="club-fees-stat-card__label">Paid Invoices</span>
            <strong className="club-fees-stat-card__value">{feesData.summary?.paid || 0}</strong>
            <small className="club-fees-stat-card__sub">{formatVND(totalPaidAmount)}</small>
          </div>
        </div>

        <div className="club-fees-stat-card club-fees-stat-card--failed">
          <div className="club-fees-stat-card__icon">✕</div>
          <div className="club-fees-stat-card__info">
            <span className="club-fees-stat-card__label">Failed / Cancelled</span>
            <strong className="club-fees-stat-card__value">{feesData.summary?.failed || 0}</strong>
            <small className="club-fees-stat-card__sub">Needs retry or support</small>
          </div>
        </div>

        <div className="club-fees-stat-card">
          <div className="club-fees-stat-card__icon">📋</div>
          <div className="club-fees-stat-card__info">
            <span className="club-fees-stat-card__label">Total Invoices</span>
            <strong className="club-fees-stat-card__value">{feesData.summary?.all || 0}</strong>
            <small className="club-fees-stat-card__sub">All time records</small>
          </div>
        </div>
      </section>

      {/* Floating Toolbar with Search and Filters */}
      <div className="club-fees-toolbar">
        {/* Status Tabs */}
        <div className="club-fees-tabs" role="tablist" aria-label="Filter fees by status">
          <button
            type="button"
            className={`club-fees-tab ${activeTab === 'all' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All Invoices
            <span className="club-fees-tab__badge">{feesData.summary?.all || 0}</span>
          </button>
          <button
            type="button"
            className={`club-fees-tab ${activeTab === '0' || activeTab === 'pending' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('pending')}
          >
            ⏱️ Unpaid
            <span className="club-fees-tab__badge">{feesData.summary?.unpaid || 0}</span>
          </button>
          <button
            type="button"
            className={`club-fees-tab ${activeTab === '1' || activeTab === 'success' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('success')}
          >
            ✓ Paid
            <span className="club-fees-tab__badge">{feesData.summary?.paid || 0}</span>
          </button>
          <button
            type="button"
            className={`club-fees-tab ${activeTab === '2' || activeTab === 'failed' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('failed')}
          >
            ✕ Failed
            <span className="club-fees-tab__badge">{feesData.summary?.failed || 0}</span>
          </button>
        </div>

        {/* Search and Secondary Filters */}
        <div className="club-fees-controls">
          {/* Search Box */}
          <div className="club-fees-search">
            <svg viewBox="0 0 24 24" aria-hidden="true" className="club-fees-search__svg">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              id="club-fees-search-input"
              type="text"
              className="club-fees-search__input"
              placeholder="Search by fee title, period, club..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              aria-label="Search fees"
            />
            {searchQuery && (
              <button
                type="button"
                className="club-fees-search__clear"
                onClick={() => setSearchQuery('')}
                aria-label="Clear fee search"
              >
                ✕
              </button>
            )}
          </div>

          {/* Period Filter Dropdown */}
          {periods.length > 0 && (
            <div className="club-fees-control-group">
              <label htmlFor="period-filter" className="club-fees-control-label">PERIOD</label>
              <select
                id="period-filter"
                className="club-fees-select"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="">All Periods</option>
                {periods.map((p) => (
                  <option key={p} value={p}>Period {p}</option>
                ))}
              </select>
            </div>
          )}

          {/* Payment Method Filter */}
          <div className="club-fees-control-group">
            <label htmlFor="method-filter" className="club-fees-control-label">METHOD</label>
            <select
              id="method-filter"
              className="club-fees-select"
              value={selectedMethod}
              onChange={(e) => setSelectedMethod(e.target.value)}
            >
              <option value="all">All Methods</option>
              <option value="vnpay">⚡ VNPay</option>
              <option value="cash">💵 Cash (Tiền mặt)</option>
            </select>
          </div>

          {/* Sort By Dropdown */}
          <div className="club-fees-control-group">
            <label htmlFor="fees-sort" className="club-fees-control-label">SORT</label>
            <select
              id="fees-sort"
              className="club-fees-select"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="newest">Newest First</option>
              <option value="oldest">Oldest First</option>
              <option value="amount-desc">Amount: High to Low</option>
              <option value="amount-asc">Amount: Low to High</option>
              <option value="period-desc">Period: Z - A</option>
              <option value="period-asc">Period: A - Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Fee List & Empty State */}
      {loading ? (
        <div className="club-fees-empty">
          <div className="club-fees-empty__icon">⏳</div>
          <h3 className="club-fees-empty__title">Loading membership fees...</h3>
          <p className="club-fees-empty__text">Please wait a moment while we retrieve your fee records.</p>
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="club-fees-empty">
          <div className="club-fees-empty__icon">
            {hasActiveFilters ? '🔍' : '🧧'}
          </div>
          <h3 className="club-fees-empty__title">
            {hasActiveFilters ? 'No matching fees found' : 'No membership fees found'}
          </h3>
          <p className="club-fees-empty__text">
            {hasActiveFilters
              ? 'Try adjusting your search query, status tab, or period filter.'
              : 'You have no outstanding fees or dues for this club.'}
          </p>
          {hasActiveFilters && (
            <button
              type="button"
              className="club-fees-empty__btn"
              onClick={resetFilters}
            >
              Reset All Filters
            </button>
          )}
        </div>
      ) : (
        <div className="club-fees-list">
          {sortedItems.map((item) => {
            const isPending = item.status === 'pending' || item.status === 0 || item.status === '0'
            const isSuccess = item.status === 'success' || item.status === 1 || item.status === '1'
            const isFailed = item.status === 'failed' || item.status === 2 || item.status === '2'
            const isOverdue = isPending && (
              item.period === 'SP26' ||
              item.period === 'SU26' ||
              item.status === 'overdue' ||
              Boolean(item.created_at && ((Date.now() - new Date(item.created_at).getTime()) > 30 * 24 * 3600 * 1000))
            )

            return (
              <article key={item._id} className={`club-fee-card ${isPending ? 'club-fee-card--unpaid' : ''}`} id={`fee-item-${item._id}`}>
                {/* Left Side: Avatar & Details */}
                <div className="club-fee-card__left">
                  <div className="club-fee-card__icon-wrap">
                    {item.club_logo ? (
                      <img src={item.club_logo} alt={item.club_name} className="club-fee-card__club-logo" />
                    ) : (
                      <div className="club-fee-card__avatar-fallback">🏛️</div>
                    )}
                  </div>

                  <div className="club-fee-card__details">
                    <div className="club-fee-card__header-row">
                      <h2 className="club-fee-card__title">
                        {item.order_info || `Membership Fee - ${item.period}`}
                      </h2>
                      <span className="club-fee-card__period-tag">Period {item.period}</span>
                    </div>

                    <div className="club-fee-card__meta">
                      <span>Club: <strong>{item.club_name || 'UniClub'}</strong></span>
                      <span>•</span>
                      <span>Created: {formatDate(item.created_at)}</span>
                      {item.paid_at && (
                        <>
                          <span>•</span>
                          <span>Paid: {formatDate(item.paid_at)}</span>
                        </>
                      )}
                      {isSuccess && (
                        <>
                          <span>•</span>
                          <span className="club-fee-card__method-tag">
                            {String(item.payment_method).toLowerCase() === 'cash' ? '💵 Cash' : '💳 VNPay'}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Side: Amount, Status & Actions */}
                <div className="club-fee-card__right">
                  <div className="club-fee-card__amount-wrap">
                    <strong className="club-fee-card__amount">{formatVND(item.amount)}</strong>
                    {isPending && (
                      isOverdue ? (
                        <span className="club-fee-badge" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontWeight: 800 }}>⚠️ Quá hạn</span>
                      ) : (
                        <span className="club-fee-badge club-fee-badge--pending">⏱️ Chưa đóng</span>
                      )
                    )}
                    {isSuccess && (
                      <span className="club-fee-badge club-fee-badge--success">✓ Paid</span>
                    )}
                    {isFailed && (
                      <span className="club-fee-badge club-fee-badge--failed">✕ Failed</span>
                    )}
                  </div>

                  <div className="club-fee-card__actions">
                    {(isPending || isFailed) && (
                      <button
                        type="button"
                        className="club-fee-btn club-fee-btn--pay"
                        onClick={() => handleStartPayment(item)}
                        id={`btn-pay-${item._id}`}
                      >
                        💳 Pay Now
                      </button>
                    )}

                    {isSuccess && (
                      <button
                        type="button"
                        className="club-fee-btn club-fee-btn--receipt"
                        onClick={() => navigate(`/clubs/${clubId || item.club_id}/receipts/${item._id}`)}
                        id={`btn-receipt-${item._id}`}
                      >
                        📄 View Receipt
                      </button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {selectedPayment && (
        <div className="club-fees-modal" role="dialog" aria-modal="true">
          <button
            type="button"
            className="club-fees-modal__backdrop"
            onClick={() => setSelectedPayment(null)}
            aria-label="Close modal"
          />
          <div className="club-fees-modal__panel">
            <header className="club-fees-modal__header">
              <div>
                <span className="club-fees-modal__eyebrow">Payment Gateway</span>
                <h2 className="club-fees-modal__title">Confirm Fee Payment</h2>
              </div>
              <button
                type="button"
                className="club-fees-modal__close"
                onClick={() => setSelectedPayment(null)}
                aria-label="Close"
              >
                ×
              </button>
            </header>

            {/* Payment Method Selector */}
            <div className="club-fees-modal__methods">
              <label className="club-fees-modal__method-label">
                Select Payment Method:
              </label>
              <div className="club-fees-modal__method-grid">
                <button
                  type="button"
                  className={`club-fees-modal__method-btn ${paymentMethod === 'vnpay' ? 'is-selected is-vnpay' : ''}`}
                  onClick={() => setPaymentMethod('vnpay')}
                >
                  <div className="club-fees-modal__method-btn-head">
                    <span className="club-fees-modal__method-name">⚡ VNPay Gateway</span>
                    {paymentMethod === 'vnpay' && <span className="club-fees-modal__check">✓</span>}
                  </div>
                  <span className="club-fees-modal__method-sub">ATM / Internet Banking / QR Code / Cards</span>
                </button>

                <button
                  type="button"
                  className={`club-fees-modal__method-btn ${paymentMethod === 'cash' ? 'is-selected is-cash' : ''}`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <div className="club-fees-modal__method-btn-head">
                    <span className="club-fees-modal__method-name">💵 Cash (Tiền mặt)</span>
                    {paymentMethod === 'cash' && <span className="club-fees-modal__check is-green">✓</span>}
                  </div>
                  <span className="club-fees-modal__method-sub">Nộp trực tiếp cho Thủ quỹ CLB</span>
                </button>
              </div>
            </div>

            {/* Invoice Breakdown */}
            <div className="club-fees-summary-box">
              <div className="club-fees-summary-row">
                <span>Description:</span>
                <strong>{selectedPayment.order_info || `Membership Fee ${selectedPayment.period}`}</strong>
              </div>
              <div className="club-fees-summary-row">
                <span>Period:</span>
                <strong>Period {selectedPayment.period}</strong>
              </div>
              <div className="club-fees-summary-row">
                <span>Method:</span>
                <strong style={{ color: paymentMethod === 'cash' ? '#16a34a' : '#ea580c' }}>
                  {paymentMethod === 'vnpay' ? '⚡ VNPay Online' : '💵 Cash / Tiền mặt'}
                </strong>
              </div>
              <div className="club-fees-summary-row club-fees-summary-row--total">
                <span>Total Amount:</span>
                <strong className="club-fees-total-amount">{formatVND(selectedPayment.amount)}</strong>
              </div>
            </div>

            {paymentMethod === 'cash' && (
              <div className="club-fees-cash-notice">
                <span className="club-fees-cash-notice__icon">📢</span>
                <div className="club-fees-cash-notice__body">
                  <strong>Lưu ý nộp Tiền mặt:</strong>
                  <div>Vui lòng liên hệ và nộp tiền mặt trực tiếp cho <strong>Thủ quỹ CLB</strong>.</div>
                  <small>Sau khi nhận được tiền, Thủ quỹ sẽ kiểm tra và xác nhận thanh toán trên hệ thống cho bạn.</small>
                </div>
              </div>
            )}

            <footer className="club-fees-modal__footer">
              <button
                type="button"
                className="club-fee-btn club-fee-btn--receipt"
                onClick={() => setSelectedPayment(null)}
                disabled={processing}
              >
                Cancel
              </button>
              {paymentMethod === 'vnpay' ? (
                <button
                  type="button"
                  className="club-fee-btn club-fee-btn--pay"
                  onClick={handleConfirmVNPay}
                  disabled={processing}
                >
                  {processing ? 'Connecting to VNPay...' : 'Proceed to VNPay ➔'}
                </button>
              ) : (
                <button
                  type="button"
                  className="club-fee-btn club-fee-btn--cash-confirm"
                  onClick={handleConfirmCashNotice}
                >
                  Đã hiểu & Liên hệ Thủ quỹ
                </button>
              )}
            </footer>
          </div>
        </div>
      )}
    </main>
  )
}
