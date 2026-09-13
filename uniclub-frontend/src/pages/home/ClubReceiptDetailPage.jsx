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
          onClick={() => navigate(clubId ? `/clubs/${clubId}/fees` : '/my-fees')}
        >
          Back to Membership Fees
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
          onClick={() => navigate(clubId ? `/clubs/${clubId}/fees` : '/my-fees')}
        >
          ← Back
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
          <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.6rem', color: '#1d1d1f' }}>
            UNICLUB - CLUB MANAGEMENT SYSTEM
          </h2>
          <p style={{ margin: 0, color: '#86868b', fontSize: '0.9rem' }}>
            Receipt ID: <strong>#{receipt.receiptId || receipt._id}</strong>
          </p>
        </div>

        <div className="club-receipt-grid">
          <div className="club-receipt-field">
            <span className="club-receipt-field__label">Club</span>
            <span className="club-receipt-field__value">{receipt.club?.name || 'N/A'}</span>
          </div>

          <div className="club-receipt-field">
            <span className="club-receipt-field__label">Member Name</span>
            <span className="club-receipt-field__value">{receipt.user?.full_name || 'N/A'}</span>
          </div>

          <div className="club-receipt-field">
            <span className="club-receipt-field__label">Member Email</span>
            <span className="club-receipt-field__value">{receipt.user?.email || 'N/A'}</span>
          </div>

          <div className="club-receipt-field">
            <span className="club-receipt-field__label">Billing Period</span>
            <span className="club-receipt-field__value">{receipt.period}</span>
          </div>

          <div className="club-receipt-field">
            <span className="club-receipt-field__label">Description</span>
            <span className="club-receipt-field__value">{receipt.order_info || `Membership Fee ${receipt.period}`}</span>
          </div>

          <div className="club-receipt-field">
            <span className="club-receipt-field__label">Payment Method</span>
            <span className="club-receipt-field__value">{receipt.payment_method_label || 'VNPay'}</span>
          </div>

          {receipt.txn_ref && (
            <div className="club-receipt-field">
              <span className="club-receipt-field__label">VNPay Transaction Ref (TxnRef)</span>
              <span className="club-receipt-field__value" style={{ fontFamily: 'monospace' }}>
                {receipt.txn_ref}
              </span>
            </div>
          )}

          {receipt.vnp_response_code && (
            <div className="club-receipt-field">
              <span className="club-receipt-field__label">VNPay Response Code</span>
              <span className="club-receipt-field__value">{receipt.vnp_response_code} (Success)</span>
            </div>
          )}

          <div className="club-receipt-field">
            <span className="club-receipt-field__label">Payment Date & Time</span>
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
          <span style={{ fontSize: '1.1rem', fontWeight: 600, color: '#1d1d1f' }}>Total Amount Paid:</span>
          <span style={{ fontSize: '1.6rem', fontWeight: 700, color: '#0071e3' }}>{formatVND(receipt.amount)}</span>
        </div>

        <div style={{ marginTop: '2.5rem', textAlign: 'center', color: '#86868b', fontSize: '0.85rem' }}>
          <p style={{ margin: '0 0 0.25rem 0' }}>Thank you for contributing to our club activities!</p>
          <p style={{ margin: 0 }}>This digital receipt serves as official proof of payment in the UniClub system.</p>
        </div>
      </div>
    </div>
  )
}
