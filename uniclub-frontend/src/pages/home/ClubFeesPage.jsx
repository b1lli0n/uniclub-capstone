import { useEffect, useState, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '../../components/common/notificationContext'
import { getFeeList, createPaymentUrl } from '../../api/payment.api'
import '../../styles/club-fees.css'

function formatVND(amount) {
  return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(amount || 0)
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A'
  return new Date(dateStr).toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
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
      toast.error?.(err.message || 'Không thể tải danh sách khoản phí')
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

  const handleStartPayment = (payment) => {
    setSelectedPayment(payment)
  }

  const handleConfirmVNPay = async () => {
    if (!selectedPayment) return
    try {
      setProcessing(true)
      const res = await createPaymentUrl({
        club_id: clubId,
        payment_id: selectedPayment._id,
        orderInfo: selectedPayment.order_info || `Thanh toan phi ${selectedPayment.period}`
      })

      if (res.paymentUrl) {
        toast.info?.('Đang chuyển hướng sang cổng thanh toán VNPay...')
        window.location.href = res.paymentUrl
      } else {
        toast.error?.('Không tạo được link thanh toán VNPay')
      }
    } catch (err) {
      console.error('Create payment URL error:', err)
      toast.error?.(err.message || 'Lỗi khởi tạo thanh toán VNPay')
    } finally {
      setProcessing(false)
    }
  }

  return (
    <div className="club-fees-container">
      {/* Header */}
      <div className="club-fees-header">
        <div>
          <h1 className="club-fees-header__title">Danh sách Phí Thành Viên</h1>
          <p className="club-fees-header__subtitle">
            Quản lý và thanh toán các khoản phí sinh hoạt, quỹ câu lạc bộ nhanh chóng qua VNPay
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="club-fees-summary">
        <div className="club-fees-card">
          <div className="club-fees-card__icon club-fees-card__icon--unpaid">⏱</div>
          <div className="club-fees-card__info">
            <span className="club-fees-card__label">Chưa thanh toán</span>
            <span className="club-fees-card__value">{feesData.summary?.unpaid || 0}</span>
          </div>
        </div>

        <div className="club-fees-card">
          <div className="club-fees-card__icon club-fees-card__icon--paid">✓</div>
          <div className="club-fees-card__info">
            <span className="club-fees-card__label">Đã thanh toán</span>
            <span className="club-fees-card__value">{feesData.summary?.paid || 0}</span>
          </div>
        </div>

        <div className="club-fees-card">
          <div className="club-fees-card__icon club-fees-card__icon--failed">✕</div>
          <div className="club-fees-card__info">
            <span className="club-fees-card__label">Thanh toán thất bại</span>
            <span className="club-fees-card__value">{feesData.summary?.failed || 0}</span>
          </div>
        </div>

        <div className="club-fees-card">
          <div className="club-fees-card__icon club-fees-card__icon--all">📋</div>
          <div className="club-fees-card__info">
            <span className="club-fees-card__label">Tổng số khoản</span>
            <span className="club-fees-card__value">{feesData.summary?.all || 0}</span>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="club-fees-filter">
        <div className="club-fees-tabs">
          <button
            type="button"
            className={`club-fees-tab ${activeTab === 'all' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('all')}
          >
            Tất cả ({feesData.summary?.all || 0})
          </button>
          <button
            type="button"
            className={`club-fees-tab ${activeTab === '0' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('0')}
          >
            Chưa nộp ({feesData.summary?.unpaid || 0})
          </button>
          <button
            type="button"
            className={`club-fees-tab ${activeTab === '1' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('1')}
          >
            Đã nộp ({feesData.summary?.paid || 0})
          </button>
          <button
            type="button"
            className={`club-fees-tab ${activeTab === '2' ? 'is-active' : ''}`}
            onClick={() => setActiveTab('2')}
          >
            Thất bại ({feesData.summary?.failed || 0})
          </button>
        </div>

        {periods.length > 0 && (
          <select
            className="club-fees-period-select"
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(e.target.value)}
          >
            <option value="">Tất cả các kỳ</option>
            {periods.map((p) => (
              <option key={p} value={p}>Kỳ {p}</option>
            ))}
          </select>
        )}
      </div>

      {/* Fee List */}
      {loading ? (
        <div className="club-fees-empty">
          <div className="club-fees-empty__icon">⌛</div>
          <p className="club-fees-empty__text">Đang tải danh sách khoản phí...</p>
        </div>
      ) : feesData.items.length === 0 ? (
        <div className="club-fees-empty">
          <div className="club-fees-empty__icon">🧧</div>
          <p className="club-fees-empty__text">Không tìm thấy khoản phí nào</p>
        </div>
      ) : (
        <div className="club-fees-list">
          {feesData.items.map((item) => {
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
                      {item.order_info || `Phí thành viên - ${item.period}`}
                    </h3>
                    <div className="club-fee-item__meta">
                      <span>Kỳ: <strong>{item.period}</strong></span>
                      <span>•</span>
                      <span>CLB: <strong>{item.club_name || 'Câu lạc bộ'}</strong></span>
                      {item.paid_at && (
                        <>
                          <span>•</span>
                          <span>Đã nộp ngày: {formatDate(item.paid_at)}</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="club-fee-item__right">
                  <div className="club-fee-item__amount-wrap">
                    <div className="club-fee-item__amount">{formatVND(item.amount)}</div>
                    {isPending && (
                      <span className="club-fee-badge club-fee-badge--pending">Chưa thanh toán</span>
                    )}
                    {isSuccess && (
                      <span className="club-fee-badge club-fee-badge--success">Đã thanh toán</span>
                    )}
                    {isFailed && (
                      <span className="club-fee-badge club-fee-badge--failed">Thanh toán thất bại</span>
                    )}
                  </div>

                  <div>
                    {(isPending || isFailed) && (
                      <button
                        type="button"
                        className="club-fee-btn club-fee-btn--pay"
                        onClick={() => handleStartPayment(item)}
                      >
                        ⚡ Thanh toán VNPay
                      </button>
                    )}

                    {isSuccess && (
                      <button
                        type="button"
                        className="club-fee-btn club-fee-btn--receipt"
                        onClick={() => navigate(`/clubs/${clubId || item.club_id}/receipts/${item._id}`)}
                      >
                        📄 Xem biên lai
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
            aria-label="Đóng modal"
          />
          <div className="club-fees-modal__panel">
            <div className="club-fees-modal__header">
              <h2 className="club-fees-modal__title">Xác nhận thanh toán</h2>
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
                <span>Nội dung đóng:</span>
                <strong>{selectedPayment.order_info || `Phí thành viên ${selectedPayment.period}`}</strong>
              </div>
              <div className="club-fees-summary-row">
                <span>Kỳ đóng phí:</span>
                <strong>{selectedPayment.period}</strong>
              </div>
              <div className="club-fees-summary-row">
                <span>Phương thức thanh toán:</span>
                <strong>VNPay (ATM / QR / Thẻ quốc tế)</strong>
              </div>
              <div className="club-fees-summary-row club-fees-summary-row--total">
                <span>Số tiền thanh toán:</span>
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
                Hủy bỏ
              </button>
              <button
                type="button"
                className="club-fee-btn club-fee-btn--pay"
                onClick={handleConfirmVNPay}
                disabled={processing}
              >
                {processing ? 'Đang kết nối VNPay...' : 'Xác nhận & Sang VNPay ➔'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
