import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '../../components/common/notificationContext'
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
        toast.error?.(err.message || 'Failed to load receipt details')
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
        <p style={{ color: '#86868b' }}>Loading receipt details...</p>
      </div>
    )
  }

  if (!receipt) {
    return (
      <div className="club-fees-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ fontSize: '2rem', marginBottom: '1rem' }}>⚠️</div>
        <p style={{ color: '#86868b' }}>Payment receipt not found</p>
        <button
          type="button"
          className="club-fee-btn club-fee-btn--receipt"
          style={{ marginTop: '1rem' }}
          onClick={() => navigate(clubId || receipt?.club?._id ? `/clubs/${clubId || receipt?.club?._id}/fees` : '/my-fees')}
        >
          Back to Membership Fees
        </button>
      </div>
    )
  }

  return (
    <div className="club-receipt-container">
      <div className="no-print club-receipt-nav">
        <button
          type="button"
          className="club-fee-btn club-fee-btn--receipt"
          onClick={() => navigate(clubId || receipt?.club?._id ? `/clubs/${clubId || receipt?.club?._id}/fees` : '/my-fees')}
        >
          ← Back to Fees
        </button>
        <button
          type="button"
          className="club-fee-btn club-fee-btn--pay"
          onClick={() => window.print()}
        >
          🖨️ Print / Download Receipt (PDF)
        </button>
      </div>

      <div className="club-receipt-paper">
        <div className="club-receipt-header">
          <div className="club-receipt-header__badge">
            ✓ PAYMENT RECEIPT - SUCCESSFUL
          </div>
          <h1 className="club-receipt-header__title">
            UNICLUB - CLUB MANAGEMENT SYSTEM
          </h1>
          <p className="club-receipt-header__subtitle">
            FPT University Student Club Activities & Finance Platform
          </p>
          <div style={{ marginTop: '0.6rem' }}>
            <span className="club-receipt-header__id">
              Receipt ID: #{receipt.receiptId || receipt._id}
            </span>
          </div>
        </div>

        <div className="club-receipt-grid">
          <div className="club-receipt-field">
            <span className="club-receipt-field__label">🏛️ Organizing Club</span>
            <span className="club-receipt-field__value">{receipt.club?.name || 'N/A'}</span>
          </div>

          <div className="club-receipt-field">
            <span className="club-receipt-field__label">👤 Member Name</span>
            <span className="club-receipt-field__value">{receipt.user?.full_name || 'N/A'}</span>
          </div>

          <div className="club-receipt-field">
            <span className="club-receipt-field__label">✉️ Member Email</span>
            <span className="club-receipt-field__value" style={{ fontFamily: 'monospace' }}>{receipt.user?.email || 'N/A'}</span>
          </div>

          <div className="club-receipt-field">
            <span className="club-receipt-field__label">📅 Billing Period</span>
            <span className="club-receipt-field__value">{receipt.period}</span>
          </div>

          <div className="club-receipt-field">
            <span className="club-receipt-field__label">📝 Description</span>
            <span className="club-receipt-field__value">{receipt.order_info || `Membership Fee ${receipt.period}`}</span>
          </div>

          <div className="club-receipt-field">
            <span className="club-receipt-field__label">💳 Payment Method</span>
            <span className="club-receipt-field__value" style={{ color: '#0071e3' }}>
              {receipt.payment_method_label || 'VNPay Sandbox'}
            </span>
          </div>

          {receipt.txn_ref && (
            <div className="club-receipt-field">
              <span className="club-receipt-field__label">🔢 VNPay TxnRef</span>
              <span className="club-receipt-field__value" style={{ fontFamily: 'monospace' }}>
                {receipt.txn_ref}
              </span>
            </div>
          )}

          {receipt.vnp_response_code && (
            <div className="club-receipt-field">
              <span className="club-receipt-field__label">⚡ Response Code</span>
              <span className="club-receipt-field__value" style={{ color: '#16a34a' }}>
                {receipt.vnp_response_code} (Success)
              </span>
            </div>
          )}

          <div className="club-receipt-field">
            <span className="club-receipt-field__label">⏰ Paid At</span>
            <span className="club-receipt-field__value">{formatDate(receipt.paid_at || receipt.created_at)}</span>
          </div>
        </div>

        <div className="club-receipt-total-box">
          <span className="club-receipt-total-box__label">Total Amount Paid:</span>
          <span className="club-receipt-total-box__amount">{formatVND(receipt.amount)}</span>
        </div>

        <div className="club-receipt-footer">
          <p>🎉 Thank you for contributing to {receipt.club?.name || 'club'} activities!</p>
          <p>This digital receipt serves as official proof of payment authenticated by the UniClub system.</p>
        </div>
      </div>
    </div>
  )
}
