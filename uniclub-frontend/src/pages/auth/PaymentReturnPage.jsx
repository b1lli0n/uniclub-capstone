import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate } from 'react-router-dom'
import { getReceiptDetail } from '../../api/payment.api'
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
    minute: '2-digit',
    second: '2-digit'
  })
}

export default function PaymentReturnPage() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()

  const status = searchParams.get('status')
  const txnRef = searchParams.get('txnRef')
  const paymentId = searchParams.get('paymentId')
  const vnpResponseCode = searchParams.get('vnpResponseCode')
  const message = searchParams.get('message')

  const isSuccess = status === '1' || vnpResponseCode === '00'

  const [receipt, setReceipt] = useState(null)
  const [loadingReceipt, setLoadingReceipt] = useState(false)

  useEffect(() => {
    async function loadReceipt() {
      if (!isSuccess || !paymentId) return
      try {
        setLoadingReceipt(true)
        const res = await getReceiptDetail(null, paymentId)
        if (res.data) {
          setReceipt(res.data)
        }
      } catch (err) {
        console.warn('Could not pre-load receipt in PaymentReturnPage:', err)
      } finally {
        setLoadingReceipt(false)
      }
    }
    loadReceipt()
  }, [isSuccess, paymentId])

  return (
    <div className="club-fees-container" style={{ maxWidth: '650px', padding: '3rem 1rem' }}>
      <div className="club-receipt-paper" style={{ padding: '2.5rem 2rem' }}>
        {isSuccess ? (
          <>
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '72px',
                height: '72px',
                borderRadius: '50%',
                background: '#e6f9f0',
                color: '#34c759',
                fontSize: '2.5rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 1.25rem auto'
              }}>
                ✓
              </div>
              <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: '#1d1d1f', margin: '0 0 0.5rem 0' }}>
                Payment Successful!
              </h1>
              <p style={{ color: '#86868b', fontSize: '0.95rem', margin: '0 0 2rem 0' }}>
                Your VNPay transaction has been successfully confirmed in the UniClub system.
              </p>
            </div>

            {/* Full Detailed Receipt Card */}
            <div style={{
              background: '#fafafa',
              borderRadius: '16px',
              border: '1px solid #e5e5ea',
              padding: '1.5rem',
              marginBottom: '2rem',
              textAlign: 'left'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                borderBottom: '1px solid #e5e5ea',
                paddingBottom: '0.75rem',
                marginBottom: '1rem'
              }}>
                <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#34c759', letterSpacing: '0.5px' }}>
                  ✓ OFFICIAL PAYMENT RECEIPT
                </span>
                <span style={{ fontSize: '0.85rem', color: '#86868b', fontFamily: 'monospace' }}>
                  #{paymentId || receipt?.receiptId}
                </span>
              </div>

              <div className="club-fees-summary-box" style={{ background: 'transparent', padding: 0, border: 'none' }}>
                {receipt?.club?.name && (
                  <div className="club-fees-summary-row">
                    <span>Club:</span>
                    <strong>{receipt.club.name}</strong>
                  </div>
                )}
                {receipt?.user?.full_name && (
                  <div className="club-fees-summary-row">
                    <span>Member:</span>
                    <strong>{receipt.user.full_name} ({receipt.user.email})</strong>
                  </div>
                )}
                {receipt?.period && (
                  <div className="club-fees-summary-row">
                    <span>Billing Period:</span>
                    <strong>{receipt.period}</strong>
                  </div>
                )}
                <div className="club-fees-summary-row">
                  <span>Description:</span>
                  <strong>{receipt?.order_info || `Membership Fee ${receipt?.period || 'FA26'}`}</strong>
                </div>
                <div className="club-fees-summary-row">
                  <span>Payment Method:</span>
                  <strong style={{ color: '#0071e3' }}>{receipt?.payment_method_label || 'VNPay Sandbox'}</strong>
                </div>
                {(txnRef || receipt?.txn_ref) && (
                  <div className="club-fees-summary-row">
                    <span>Transaction Ref:</span>
                    <strong style={{ fontFamily: 'monospace' }}>{receipt?.txn_ref || txnRef}</strong>
                  </div>
                )}
                <div className="club-fees-summary-row">
                  <span>Response Code:</span>
                  <strong>{vnpResponseCode || receipt?.vnp_response_code || '00'} (Transaction Successful)</strong>
                </div>
                <div className="club-fees-summary-row">
                  <span>Payment Date:</span>
                  <span>{formatDate(receipt?.paid_at || receipt?.created_at || new Date())}</span>
                </div>
              </div>

              {receipt?.amount && (
                <div style={{
                  marginTop: '1.25rem',
                  paddingTop: '1rem',
                  borderTop: '2px dashed #d1d1d6',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{ fontSize: '1rem', fontWeight: 600, color: '#1d1d1f' }}>Total Amount Paid:</span>
                  <span style={{ fontSize: '1.5rem', fontWeight: 800, color: '#0071e3' }}>
                    {formatVND(receipt.amount)}
                  </span>
                </div>
              )}
            </div>

            <div style={{ display: 'flex', gap: '0.8rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <button
                type="button"
                className="club-fee-btn club-fee-btn--pay"
                onClick={() => window.print()}
              >
                🖨️ Print Receipt (PDF)
              </button>
              {paymentId && (
                <button
                  type="button"
                  className="club-fee-btn club-fee-btn--receipt"
                  onClick={() => navigate(receipt?.club?._id ? `/clubs/${receipt.club._id}/receipts/${paymentId}` : `/clubs/my-fees/receipts/${paymentId}`)}
                  id="btn-return-view-receipt"
                >
                  📄 View Full Receipt Page
                </button>
              )}
              <button
                type="button"
                className="club-fee-btn club-fee-btn--receipt"
                onClick={() => navigate(receipt?.club?._id ? `/clubs/${receipt.club._id}/fees` : '/my-clubs')}
                id="btn-return-back-fees"
              >
                🏛️ Back to Club Fees
              </button>
            </div>
          </>
        ) : (
          <>
            <div className="payment-return-icon-wrap payment-return-icon-wrap--failed" aria-hidden="true">
              ✕
            </div>
            <h1 className="payment-return-title">
              Payment Incomplete
            </h1>
            <p className="payment-return-sub">
              {message || 'The VNPay transaction was unsuccessful or was cancelled by the user.'}
            </p>

            <div className="payment-return-actions">
              <button
                type="button"
                className="club-fee-btn club-fee-btn--pay"
                onClick={() => navigate(-1)}
                id="btn-return-retry"
              >
                🔄 Try Again
              </button>
              <button
                type="button"
                className="club-fee-btn club-fee-btn--receipt"
                onClick={() => navigate('/clubs/6a3c34121f6805a34580c4b2/fees')}
                id="btn-return-back"
              >
                🏛️ Back to Club Fees
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
