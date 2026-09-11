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
  const [activeTab, setActiveTab] = useState('all') // 'all', '0', '1', '2'
  const [selectedPeriod, setSelectedPeriod] = useState('')
  const [sortBy, setSortBy] = useState('newest')
  const [selectedPayment, setSelectedPayment] = useState(null)
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

  const sortedItems = useMemo(() => {
    const list = [...feesData.items]
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
  }, [feesData.items, sortBy])

  const handleStartPayment = (payment) => {
    setSelectedPayment(payment)
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

  return (
    <div className="club-fees-container">
      {/* Header */}
      <div className="club-fees-header">
        <div>
          <h1 className="club-fees-header__title">My Membership Fees</h1>
          <p className="club-fees-header__subtitle">
            Manage and pay your club dues, fund contributions quickly and securely via VNPay
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="club-fees-summary">
        <div className="club-fees-card">
          <div className="club-fees-card__icon club-fees-card__icon--unpaid">⏱</div>
          <div className="club-fees-card__info">
            <span className="club-fees-card__label">Unpaid</span>
            <span className="club-fees-card__value">{feesData.summary?.unpaid || 0}</span>
          </div>
        </div>

        <div className="club-fees-card">
          <div className="club-fees-card__icon club-fees-card__icon--paid">✓</div>
          <div className="club-fees-card__info">
            <span className="club-fees-card__label">Paid</span>
            <span className="club-fees-card__value">{feesData.summary?.paid || 0}</span>
          </div>
        </div>

        <div className="club-fees-card">
          <div className="club-fees-card__icon club-fees-card__icon--failed">✕</div>
          <div className="club-fees-card__info">
            <span className="club-fees-card__label">Failed</span>
            <span className="club-fees-card__value">{feesData.summary?.failed || 0}</span>
          </div>
        </div>

        <div className="club-fees-card">
          <div className="club-fees-card__icon club-fees-card__icon--all">📋</div>
          <div className="club-fees-card__info">
            <span className="club-fees-card__label">Total Fees</span>
            <span className="club-fees-card__value">{feesData.summary?.all || 0}</span>
          </div>
        </div>
      </div>

      {/* Filter and Sort Bar */}
      <div className="club-fees-filter">
        <div className="club-fees-tabs" role="tablist" aria-label="Filter fees by status">
          <button
            type="button"
            className={`club-fees-tab ${activeTab === 'all' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            All ({feesData.summary?.all || 0})
          </button>
          <button
            type="button"
            className={`club-fees-tab ${activeTab === '0' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('0')}
          >
            Unpaid ({feesData.summary?.unpaid || 0})
          </button>
          <button
            type="button"
            className={`club-fees-tab ${activeTab === '1' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('1')}
          >
            Paid ({feesData.summary?.paid || 0})
          </button>
          <button
            type="button"
            className={`club-fees-tab ${activeTab === '2' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('2')}
          >
            Failed ({feesData.summary?.failed || 0})
          </button>
        </div>

        <div className="club-fees-controls">
          {periods.length > 0 && (
            <div className="club-fees-control-group">
              <label htmlFor="period-filter" className="club-fees-control-label">
                PERIOD
              </label>
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

          <div className="club-fees-control-group">
            <label htmlFor="fees-sort" className="club-fees-control-label">
              SORT BY
            </label>
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

      {/* Fee List */}
      {loading ? (
        <div className="club-fees-empty">
          <div className="club-fees-empty__icon">⌛</div>
          <p className="club-fees-empty__text">Loading membership fees...</p>
        </div>
      ) : sortedItems.length === 0 ? (
        <div className="club-fees-empty">
          <div className="club-fees-empty__icon">🧧</div>
          <p className="club-fees-empty__text">No membership fees found</p>
        </div>
      ) : (
        <div className="club-fees-list">
          {sortedItems.map((item) => {
            const isPending = item.status === 0
            const isSuccess = item.status === 1
            const isFailed = item.status === 2

            return (
              <div key={item._id} className="club-fee-item">
                <div className="club-fee-item__left">
                  {item.club_logo ? (
                    <img src={item.club_logo} alt={item.club_name} className="club-fee-item__club-logo" />
                  ) : (
                    <div className="club-fee-item__club-logo">🏰</div>
                  )}
                  <div className="club-fee-item__details">
                    <h3 className="club-fee-item__title">
                      {item.order_info || `Membership Fee - ${item.period}`}
                    </h3>
                    <div className="club-fee-item__meta">
                      <span>Period: <strong>{item.period}</strong></span>
                      <span>•</span>
                      <span>Club: <strong>{item.club_name || 'Club'}</strong></span>
                      {item.paid_at && (
                        <>
                          <span>•</span>
                          <span>Paid on: {formatDate(item.paid_at)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="club-fee-item__right">
                  <div className="club-fee-item__amount-wrap">
                    <div className="club-fee-item__amount">{formatVND(item.amount)}</div>
                    {isPending && (
                      <span className="club-fee-badge club-fee-badge--pending">Unpaid</span>
                    )}
                    {isSuccess && (
                      <span className="club-fee-badge club-fee-badge--success">Paid</span>
                    )}
                    {isFailed && (
                      <span className="club-fee-badge club-fee-badge--failed">Failed</span>
                    )}
                  </div>

                  <div>
                    {(isPending || isFailed) && (
                      <button
                        type="button"
                        className="club-fee-btn club-fee-btn--pay"
                        onClick={() => handleStartPayment(item)}
                      >
                        ⚡ Pay with VNPay
                      </button>
                    )}

                    {isSuccess && (
                      <button
                        type="button"
                        className="club-fee-btn club-fee-btn--receipt"
                        onClick={() => navigate(`/clubs/${clubId || item.club_id}/receipts/${item._id}`)}
                      >
                        📄 View Receipt
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Payment Confirmation Modal */}
      {selectedPayment && (
        <div className="club-fees-modal">
          <button
            type="button"
            className="club-fees-modal__backdrop"
            onClick={() => setSelectedPayment(null)}
            aria-label="Close modal"
          />
          <div className="club-fees-modal__panel">
            <div className="club-fees-modal__header">
              <h2 className="club-fees-modal__title">Payment Confirmation</h2>
              <button
                type="button"
                className="club-fees-modal__close"
                onClick={() => setSelectedPayment(null)}
              >
                ×
              </button>
            </div>

            <div className="club-fees-summary-box">
              <div className="club-fees-summary-row">
                <span>Fee Description:</span>
                <strong>{selectedPayment.order_info || `Membership Fee ${selectedPayment.period}`}</strong>
              </div>
              <div className="club-fees-summary-row">
                <span>Billing Period:</span>
                <strong>{selectedPayment.period}</strong>
              </div>
              <div className="club-fees-summary-row">
                <span>Payment Method:</span>
                <strong>VNPay (ATM / QR / Credit Card)</strong>
              </div>
              <div className="club-fees-summary-row club-fees-summary-row--total">
                <span>Total Amount:</span>
                <strong style={{ color: '#0071e3' }}>{formatVND(selectedPayment.amount)}</strong>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
              <button
                type="button"
                className="club-fee-btn club-fee-btn--receipt"
                onClick={() => setSelectedPayment(null)}
                disabled={processing}
              >
                Cancel
              </button>
              <button
                type="button"
                className="club-fee-btn club-fee-btn--pay"
                onClick={handleConfirmVNPay}
                disabled={processing}
              >
                {processing ? 'Connecting to VNPay...' : 'Confirm & Proceed to VNPay ➔'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
