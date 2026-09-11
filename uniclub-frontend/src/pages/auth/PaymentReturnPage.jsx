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
              Payment Successful!
            </h1>
            <p style={{ color: '#86868b', fontSize: '0.95rem', margin: '0 0 2rem 0' }}>
              Your VNPay transaction has been successfully confirmed in the UniClub system.
            </p>

            <div className="club-fees-summary-box" style={{ textAlign: 'left', marginBottom: '2rem' }}>
              {txnRef && (
                <div className="club-fees-summary-row">
                  <span>Transaction Ref (TxnRef):</span>
                  <strong style={{ fontFamily: 'monospace' }}>{txnRef}</strong>
                </div>
              )}
              {vnpResponseCode && (
                <div className="club-fees-summary-row">
                  <span>VNPay Response Code:</span>
                  <strong>{vnpResponseCode} (Transaction Successful)</strong>
                </div>
              )}
              {paymentId && (
                <div className="club-fees-summary-row">
                  <span>Fee Record ID:</span>
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
                  📄 View Receipt
                </button>
              )}
              <button
                type="button"
                className="club-fee-btn club-fee-btn--receipt"
                onClick={() => navigate('/my-clubs')}
              >
                Back to My Clubs
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
              Payment Failed
            </h1>
            <p style={{ color: '#86868b', fontSize: '0.95rem', margin: '0 0 2rem 0' }}>
              {message || 'The VNPay transaction was unsuccessful or was cancelled by the user.'}
            </p>

            <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
              <button
                type="button"
                className="club-fee-btn club-fee-btn--pay"
                onClick={() => navigate(-1)}
              >
                🔄 Try Again
              </button>
              <button
                type="button"
                className="club-fee-btn club-fee-btn--receipt"
                onClick={() => navigate('/my-clubs')}
              >
                Back to My Clubs
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
