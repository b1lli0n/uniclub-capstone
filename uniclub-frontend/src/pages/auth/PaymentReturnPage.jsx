import { useSearchParams, useNavigate } from 'react-router-dom'
import '../../styles/club-fees.css'

export default function PaymentReturnPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const status = searchParams.get('status')
  const txnRef = searchParams.get('txnRef')
  const paymentId = searchParams.get('paymentId')
  const vnpResponseCode = searchParams.get('vnpResponseCode')
  const message = searchParams.get('message')

  const isSuccess = status === '1' || vnpResponseCode === '00'

  return (
    <div className="club-fees-container" style={{ maxWidth: '600px', padding: '4rem 1rem' }}>
      <div className="club-receipt-paper" style={{ textAlign: 'center', padding: '3rem 2rem' }}>
        {isSuccess ? (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#e6f9f0',
              color: '#34c759',
              fontSize: '3rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              ✓
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1d1d1f', margin: '0 0 0.5rem 0' }}>
              Thanh Toán Thành Công!
            </h1>
            <p style={{ color: '#86868b', fontSize: '0.95rem', margin: '0 0 2rem 0' }}>
              Giao dịch của bạn qua VNPay đã được xác nhận thành công trên hệ thống UniClub.
            </p>

            <div className="club-fees-summary-box" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              {txnRef && (
                <div className="club-fees-summary-row">
                  <span>Mã giao dịch (TxnRef):</span>
                  <strong style={{ fontFamily: 'monospace' }}>{txnRef}</strong>
                </div>
              )}
              {vnpResponseCode && (
                <div className="club-fees-summary-row">
                  <span>Mã phản hồi VNPay:</span>
                  <strong>{vnpResponseCode} (Giao dịch thành công)</strong>
                </div>
              )}
              {paymentId && (
                <div className="club-fees-summary-row">
                  <span>Mã khoản phí:</span>
                  <strong>#{paymentId}</strong>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              {paymentId && (
                <button
                  type="button"
                  className="club-fee-btn club-fee-btn--pay"
                  onClick={() => navigate(`/clubs/my-fees/receipts/${paymentId}`)}
                >
                  📄 Xem biên lai
                </button>
              )}
              <button
                type="button"
                className="club-fee-btn club-fee-btn--receipt"
                onClick={() => navigate('/my-clubs')}
              >
                Về danh sách CLB
              </button>
            </div>
          </>
        ) : (
          <>
            <div style={{
              width: '80px',
              height: '80px',
              borderRadius: '50%',
              background: '#ffebeb',
              color: '#ff3b30',
              fontSize: '3rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1.5rem auto'
            }}>
              ✕
            </div>
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1d1d1f', margin: '0 0 0.5rem 0' }}>
              Thanh Toán Thất Bại
            </h1>
            <p style={{ color: '#86868b', fontSize: '0.95rem', margin: '0 0 2rem 0' }}>
              {message || 'Giao dịch qua VNPay không thành công hoặc đã bị hủy bỏ bởi người dùng.'}
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="club-fee-btn club-fee-btn--pay"
                onClick={() => navigate(-1)}
              >
                🔄 Thử lại
              </button>
              <button
                type="button"
                className="club-fee-btn club-fee-btn--receipt"
                onClick={() => navigate('/my-clubs')}
              >
                Về trang chủ
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
