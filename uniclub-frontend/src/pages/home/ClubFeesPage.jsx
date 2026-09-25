import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '../../components/common/notificationContext'
import { getFeeList, createPaymentUrl } from '../../api/payment.api'
import '../../styles/club-fees.css'
import CustomSelect from '../../components/common/CustomSelect'
import Pagination from '../../components/common/Pagination'

const FEES_PER_PAGE = 6
import {
  ZapIcon,
  BanknoteIcon,
  CreditCardIcon,
  CheckIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  XIcon,
  MegaphoneIcon,
  LandmarkIcon,
  CoinsIcon,
  ClockIcon,
  AlertTriangleIcon,
  FileTextIcon,
  SearchIcon,
} from '../../components/common/Icons'

const METHOD_OPTIONS = [
  { value: 'all', label: 'All Methods' },
  { value: 'vnpay', label: 'VNPay Gateway' },
  { value: 'cash', label: 'Cash (Tiền mặt)' },
]

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'amount-desc', label: 'Amount: High to Low' },
  { value: 'amount-asc', label: 'Amount: Low to High' },
  { value: 'period-desc', label: 'Period: Z - A' },
  { value: 'period-asc', label: 'Period: A - Z' },
]

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
  const [page, setPage] = useState(1)

  useEffect(() => {
    setPage(1)
  }, [searchQuery, selectedPeriod, selectedMethod, activeTab, sortBy])

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

  const periodOptions = useMemo(
    () => [
      { value: '', label: 'All Periods' },
      ...periods.map((p) => ({ value: p, label: `Period ${p}` })),
    ],
    [periods]
  )

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

    // Text search filter (title / name only)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim()
      list = list.filter((i) => {
        const title = (i.title || i.transaction_id?.title || i.order_info || '').toLowerCase()
        return title.includes(q)
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

  const totalPages = Math.max(1, Math.ceil(sortedItems.length / FEES_PER_PAGE))
  const currentPage = Math.min(page, totalPages)
  const paginatedItems = useMemo(() => {
    const startIndex = (currentPage - 1) * FEES_PER_PAGE
    return sortedItems.slice(startIndex, startIndex + FEES_PER_PAGE)
  }, [sortedItems, currentPage])

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
          <span className="club-fees-hero__eyebrow">
            <CoinsIcon size={15} style={{ display: 'inline', verticalAlign: '-2px', marginRight: '6px' }} />
            Financial Dues & Contributions
          </span>
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
          <div className="club-fees-stat-card__icon">
            <ClockIcon size={24} strokeWidth={2} />
          </div>
          <div className="club-fees-stat-card__info">
            <span className="club-fees-stat-card__label">Unpaid Dues</span>
            <strong className="club-fees-stat-card__value">{feesData.summary?.unpaid || 0}</strong>
            <small className="club-fees-stat-card__sub">{formatVND(totalUnpaidAmount)}</small>
          </div>
        </div>

        <div className="club-fees-stat-card club-fees-stat-card--paid">
          <div className="club-fees-stat-card__icon">
            <CheckCircleIcon size={24} strokeWidth={2} />
          </div>
          <div className="club-fees-stat-card__info">
            <span className="club-fees-stat-card__label">Paid Invoices</span>
            <strong className="club-fees-stat-card__value">{feesData.summary?.paid || 0}</strong>
            <small className="club-fees-stat-card__sub">{formatVND(totalPaidAmount)}</small>
          </div>
        </div>

        <div className="club-fees-stat-card club-fees-stat-card--failed">
          <div className="club-fees-stat-card__icon">
            <XIcon size={24} strokeWidth={2} />
          </div>
          <div className="club-fees-stat-card__info">
            <span className="club-fees-stat-card__label">Failed / Cancelled</span>
            <strong className="club-fees-stat-card__value">{feesData.summary?.failed || 0}</strong>
            <small className="club-fees-stat-card__sub">Needs retry or support</small>
          </div>
        </div>

        <div className="club-fees-stat-card">
          <div className="club-fees-stat-card__icon">
            <FileTextIcon size={24} strokeWidth={2} />
          </div>
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
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <ClockIcon size={14} />
            <span>Unpaid</span>
            <span className="club-fees-tab__badge">{feesData.summary?.unpaid || 0}</span>
          </button>
          <button
            type="button"
            className={`club-fees-tab ${activeTab === '1' || activeTab === 'success' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('success')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <CheckIcon size={14} strokeWidth={2.5} />
            <span>Paid</span>
            <span className="club-fees-tab__badge">{feesData.summary?.paid || 0}</span>
          </button>
          <button
            type="button"
            className={`club-fees-tab ${activeTab === '2' || activeTab === 'failed' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('failed')}
            style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}
          >
            <XIcon size={14} strokeWidth={2.5} />
            <span>Failed</span>
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
              placeholder="Search here ..."
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
                <XIcon size={14} />
              </button>
            )}
          </div>

          {/* Period Filter Dropdown */}
          {periods.length > 0 && (
            <div className="club-fees-control-group">
              <label className="club-fees-control-label">PERIOD</label>
              <CustomSelect
                value={selectedPeriod}
                onChange={setSelectedPeriod}
                options={periodOptions}
                ariaLabel="Filter by period"
              />
            </div>
          )}

          {/* Payment Method Filter */}
          <div className="club-fees-control-group">
            <label className="club-fees-control-label">METHOD</label>
            <CustomSelect
              value={selectedMethod}
              onChange={setSelectedMethod}
              options={METHOD_OPTIONS}
              ariaLabel="Filter by payment method"
            />
          </div>

          {/* Sort By Dropdown */}
          <div className="club-fees-control-group">
            <label className="club-fees-control-label">SORT</label>
            <CustomSelect
              value={sortBy}
              onChange={setSortBy}
              options={SORT_OPTIONS}
              align="right"
              ariaLabel="Sort membership fees"
            />
          </div>
        </div>
      </div>

      {/* Fee List & Empty State */}
      {loading ? (
        <div className="club-fees-empty">
          <div className="club-fees-empty__icon">
            <ClockIcon size={40} color="#94a3b8" />
          </div>
          <h3 className="club-fees-empty__title">Loading membership fees...</h3>
          <p className="club-fees-empty__text">Please wait a moment while we retrieve your fee records.</p>
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="club-fees-empty">
          <div className="club-fees-empty__icon">
            {hasActiveFilters ? (
              <SearchIcon size={44} strokeWidth={1.5} color="#94a3b8" />
            ) : (
              <CoinsIcon size={44} strokeWidth={1.5} color="#cbd5e1" />
            )}
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
        <>
          <div className="club-fees-list">
          {paginatedItems.map((item) => {
            const isPending = item.status === 'pending' || item.status === 0 || item.status === '0'
            const isSuccess = item.status === 'success' || item.status === 1 || item.status === '1'
            const isFailed = item.status === 'failed' || item.status === 2 || item.status === '2'
            const isOverdue = isPending && (
              item.period === 'SP26' ||
              item.period === 'SU26' ||
              item.status === 'overdue' ||
              Boolean(item.created_at && ((Date.now() - new Date(item.created_at).getTime()) > 30 * 24 * 3600 * 1000))
            )

            const feeTitle = (item.title && !item.title.startsWith('Payment for'))
              ? item.title
              : (item.transaction_id?.title || (item.order_info && !item.order_info.startsWith('Payment for') ? item.order_info : `Hội phí kỳ ${item.period}`))
            const feeDesc = item.description || item.transaction_id?.description || `Phí sinh hoạt định kỳ ${item.period} của CLB`
            const feeDate = formatDate(item.created_at)

            return (
              <article key={item._id} className={`club-fee-card ${isPending ? 'club-fee-card--unpaid' : ''}`} id={`fee-item-${item._id}`}>
                {/* Left Side: Avatar & Details */}
                <div className="club-fee-card__left">
                  <div className="club-fee-card__icon-wrap">
                    {item.club_logo ? (
                      <img src={item.club_logo} alt={item.club_name} className="club-fee-card__club-logo" />
                    ) : (
                      <div className="club-fee-card__avatar-fallback">
                        <LandmarkIcon size={24} color="#ea580c" />
                      </div>
                    )}
                  </div>

                  <div className="club-fee-card__details">
                    <div className="club-fee-card__header-row">
                      <h2 className="club-fee-card__title">
                        {feeTitle}
                      </h2>
                      <span className="club-fee-card__period-tag">Period {item.period}</span>
                    </div>

                    <div className="club-fee-card__meta">
                      <span className="club-fee-card__desc" style={{ color: '#4b5563', maxWidth: '420px', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {feeDesc}
                      </span>
                      <span>•</span>
                      <span>{feeDate}</span>
                      {item.paid_at && (
                        <>
                          <span>•</span>
                          <span>Paid: {formatDate(item.paid_at)}</span>
                        </>
                      )}
                      {isSuccess && (
                        <>
                          <span>•</span>
                          <span className="club-fee-card__method-tag" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                            {String(item.payment_method).toLowerCase() === 'cash' ? (
                              <>
                                <BanknoteIcon size={13} />
                                <span>Cash</span>
                              </>
                            ) : (
                              <>
                                <CreditCardIcon size={13} />
                                <span>VNPay</span>
                              </>
                            )}
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
                        <span className="club-fee-badge" style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <AlertTriangleIcon size={12} strokeWidth={2.5} />
                          <span>Quá hạn</span>
                        </span>
                      ) : (
                        <span className="club-fee-badge club-fee-badge--pending" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <ClockIcon size={12} strokeWidth={2.5} />
                          <span>Chưa đóng</span>
                        </span>
                      )
                    )}
                    {isSuccess && (
                      <span className="club-fee-badge club-fee-badge--success" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <CheckIcon size={12} strokeWidth={2.5} />
                        <span>Paid</span>
                      </span>
                    )}
                    {isFailed && (
                      <span className="club-fee-badge club-fee-badge--failed" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                        <XIcon size={12} strokeWidth={2.5} />
                        <span>Failed</span>
                      </span>
                    )}
                  </div>

                  <div className="club-fee-card__actions">
                    {(isPending || isFailed) && (
                      <button
                        type="button"
                        className="club-fee-btn club-fee-btn--pay"
                        onClick={() => handleStartPayment(item)}
                        id={`btn-pay-${item._id}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <CreditCardIcon size={14} />
                        <span>Pay Now</span>
                      </button>
                    )}

                    {isSuccess && (
                      <button
                        type="button"
                        className="club-fee-btn club-fee-btn--receipt"
                        onClick={() => navigate(`/clubs/${clubId || item.club_id}/receipts/${item._id}`)}
                        id={`btn-receipt-${item._id}`}
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
                      >
                        <FileTextIcon size={14} />
                        <span>View Receipt</span>
                      </button>
                    )}
                  </div>
                </div>
              </article>
            )
          })}
        </div>

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
          ariaLabel="Membership fees pagination"
        />
      </>
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
                <XIcon size={18} strokeWidth={2.5} />
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
                    <span className="club-fees-modal__method-name">
                      <ZapIcon size={18} strokeWidth={2.5} style={{ color: '#f57c00' }} />
                      <span>VNPay Gateway</span>
                    </span>
                    {paymentMethod === 'vnpay' && (
                      <span className="club-fees-modal__check">
                        <CheckIcon size={16} strokeWidth={2.5} />
                      </span>
                    )}
                  </div>
                  <span className="club-fees-modal__method-sub">ATM / Internet Banking / QR Code / Cards</span>
                </button>

                <button
                  type="button"
                  className={`club-fees-modal__method-btn ${paymentMethod === 'cash' ? 'is-selected is-cash' : ''}`}
                  onClick={() => setPaymentMethod('cash')}
                >
                  <div className="club-fees-modal__method-btn-head">
                    <span className="club-fees-modal__method-name">
                      <BanknoteIcon size={18} strokeWidth={2} style={{ color: '#16a34a' }} />
                      <span>Cash (Tiền mặt)</span>
                    </span>
                    {paymentMethod === 'cash' && (
                      <span className="club-fees-modal__check is-green">
                        <CheckIcon size={16} strokeWidth={2.5} />
                      </span>
                    )}
                  </div>
                  <span className="club-fees-modal__method-sub">Nộp trực tiếp cho Thủ quỹ CLB</span>
                </button>
              </div>
            </div>

            {/* Invoice Breakdown */}
            <div className="club-fees-summary-box">
              <div className="club-fees-summary-row">
                <span>Fee Title:</span>
                <strong>
                  {(selectedPayment.title && !selectedPayment.title.startsWith('Payment for'))
                    ? selectedPayment.title
                    : (selectedPayment.transaction_id?.title || (selectedPayment.order_info && !selectedPayment.order_info.startsWith('Payment for') ? selectedPayment.order_info : `Hội phí kỳ ${selectedPayment.period}`))}
                </strong>
              </div>
              <div className="club-fees-summary-row">
                <span>Description:</span>
                <span>{selectedPayment.description || selectedPayment.transaction_id?.description || `Phí sinh hoạt định kỳ ${selectedPayment.period} của CLB`}</span>
              </div>
              <div className="club-fees-summary-row">
                <span>Created Date:</span>
                <span>{formatDate(selectedPayment.created_at)}</span>
              </div>
              <div className="club-fees-summary-row">
                <span>Period:</span>
                <strong>Period {selectedPayment.period}</strong>
              </div>
              <div className="club-fees-summary-row">
                <span>Method:</span>
                <strong style={{ color: paymentMethod === 'cash' ? '#16a34a' : '#ea580c', display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                  {paymentMethod === 'vnpay' ? (
                    <>
                      <ZapIcon size={15} strokeWidth={2.5} />
                      <span>VNPay Online</span>
                    </>
                  ) : (
                    <>
                      <BanknoteIcon size={15} strokeWidth={2} />
                      <span>Cash / Tiền mặt</span>
                    </>
                  )}
                </strong>
              </div>
              <div className="club-fees-summary-row club-fees-summary-row--total">
                <span>Total Amount:</span>
                <strong className="club-fees-total-amount">{formatVND(selectedPayment.amount)}</strong>
              </div>
            </div>

            {paymentMethod === 'cash' && (
              <div className="club-fees-cash-notice">
                <span className="club-fees-cash-notice__icon">
                  <MegaphoneIcon size={20} strokeWidth={2} style={{ color: '#166534' }} />
                </span>
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
                  style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                >
                  {processing ? 'Connecting to VNPay...' : (
                    <>
                      <span>Proceed to VNPay</span>
                      <ArrowRightIcon size={16} strokeWidth={2.5} />
                    </>
                  )}
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
