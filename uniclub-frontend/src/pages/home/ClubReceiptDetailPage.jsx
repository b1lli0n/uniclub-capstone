import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '../../components/common/notificationContext'
import { getReceiptDetail } from '../../api/payment.api'
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
    minute: '2-digit',
    second: '2-digit'
  })
}

export default function ClubReceiptDetailPage({ clubId: propClubId }) {
  const params = useParams()
  const navigate = useNavigate()
  const clubId = propClubId || params.clubId
  const receiptId = params.receiptId
  const toast = useToast()

  const [loading, setLoading] = useState(true)
  const [receipt, setReceipt] = useState(null)

  useEffect(() => {
    async function loadReceipt() {
      try {
        setLoading(true)
        const res = await getReceiptDetail(clubId, receiptId)
        if (res.data) {
          setReceipt(res.data)
        }
      } catch (err) {
        console.error('Failed to load receipt:', err)
        toast.error?.(err.message || 'Không thể lấy thông tin biên lai thanh toán')
      } finally {
        setLoading(false)
      }
    }

    if (receiptId) {
      loadReceipt()
    }
  }, [clubId, receiptId])

  if (loading) {
    return (
      <div className="club-fees-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⌛</div>
        <p style={{ color: '#86868b' }}>Đang tải thông tin biên lai thanh toán...</p>
      </div>
    )
  }

  if (!receipt) {
    return (
      <div className="club-fees-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
        <p style={{ color: '#86868b' }}>Không tìm thấy biên lai thanh toán</p>
        <button
          type="button"
          className="club-fee-btn club-fee-btn--receipt"
          style={{ marginTop: '1rem' }}
          onClick={() => navigate(clubId ? `/clubs/${clubId}/fees` : '/my-clubs')}
        >
          Quay lại danh sách phí
        </button>
      </div>
    )
  }

  return (
    <div className="club-fees-container">
      <div className="no-print" style={{ marginBottom: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <button
          type="button"
          className="club-fee-btn club-fee-btn--receipt"
          onClick={() => navigate(clubId ? `/clubs/${clubId}/fees` : -1)}
        >
          ← Quay lại
        </button>
        <button
          type="button"
          className="club-fee-btn club-fee-btn--pay"
          onClick={() => window.print()}
        >
          🖨️ In / Tải biên lai (PDF)
        </button>
      </div>

      <div className="club-receipt-paper">
        <div className="club-receipt-header">
          <div className="club-receipt-header__badge">
            ✓ BIÊN LAI THANH TOÁN THÀNH CÔNG
          </div>
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.6rem', color: '#1d1d1f' }}>
            HỆ THỐNG QUẢN LÝ CÂU LẠC BỘ UNICLUB
          </h2>
          <p style={{ margin: 0, color: '#86868b', fontSize: '0.9rem' }}>
            Mã biên lai: <strong>#{receipt.receiptId || receipt._id}</strong>
          </p>
        </div>

        <div className="club-receipt-grid">
          <div className="club-receipt-field">
            <span className="club-receipt-field__label">Câu lạc bộ</span>
            <span className="club-receipt-field__value">{receipt.club?.name || 'N/A'}</span>
          </div>

          <div className="club-receipt-field">
            <span className="club-receipt-field__label">Thành viên nộp</span>
            <span className="club-receipt-field__value">{receipt.user?.full_name || 'N/A'}</span>
          </div>

          <div className="club-receipt-field">
            <span className="club-receipt-field__label">Email thành viên</span>
            <span className="club-receipt-field__value">{receipt.user?.email || 'N/A'}</span>
          </div>

          <div className="club-receipt-field">
            <span className="club-receipt-field__label">Kỳ đóng phí</span>
            <span className="club-receipt-field__value">{receipt.period}</span>
          </div>

          <div className="club-receipt-field">
            <span className="club-receipt-field__label">Nội dung nộp</span>
            <span className="club-receipt-field__value">{receipt.order_info || `Phí thành viên ${receipt.period}`}</span>
          </div>

          <div className="club-receipt-field">
            <span className="club-receipt-field__label">Phương thức thanh toán</span>
            <span className="club-receipt-field__value">{receipt.payment_method_label}</span>
          </div>

          {receipt.txn_ref && (
            <div className="club-receipt-field">
              <span className="club-receipt-field__label">Mã giao dịch VNPay (TxnRef)</span>
              <span className="club-receipt-field__value" style={{ fontFamily: 'monospace' }}>
                {receipt.txn_ref}
              </span>
            </div>
          )}

          {receipt.vnp_response_code && (
            <div className="club-receipt-field">
              <span className="club-receipt-field__label">Mã phản hồi VNPay</span>
              <span className="club-receipt-field__value">{receipt.vnp_response_code} (Thành công)</span>
            </div>
          )}

          <div className="club-receipt-field">
            <span className="club-receipt-field__label">Thời gian thanh toán</span>
            <span className="club-receipt-field__value">{formatDate(receipt.paid_at || receipt.created_at)}</span>
          </div>
        </div>

        <div style={{
          marginTop: '2rem',
          paddingTop: '1.5rem',
          borderTop: '2px solid #1d1d1f',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>

          <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1d1d1f' }}>Tổng số tiền đã nộp:</span>
          <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0071e3' }}>{formatVND(receipt.amount)}</span>
        </div>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', color: '#86868b', fontSize: '0.85rem' }}>
          <p style={{ margin: '0 0 0.25rem 0' }}>Cảm ơn bạn đã tham gia đóng góp cho các hoạt động của câu lạc bộ!</p>
          <p style={{ margin: 0 }}>Biên lai điện tử có giá trị xác nhận thanh toán hợp lệ trên hệ thống UniClub.</p>
        </div>
      </div>
    </div>
  )
}
