import { useEffect, useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useToast } from '../../components/common/notificationContext'
import { getReceiptDetail } from '../../api/payment.api'
import '../../styles/club-fees.css'
import {
  LandmarkIcon,
  CalendarIcon,
  ZapIcon,
  BanknoteIcon,
  CreditCardIcon,
  CheckCircleIcon,
  ClockIcon,
  AlertTriangleIcon,
  FileTextIcon,
  UserIcon,
  HashIcon,
} from '../../components/common/Icons'

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
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <ClockIcon size={40} color="#94a3b8" />
        </div>
        <p style={{ color: '#86868b' }}>Loading receipt details...</p>
      </div>
    )
  }

  if (!receipt) {
    return (
      <div className="club-fees-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '1rem' }}>
          <AlertTriangleIcon size={40} color="#ef4444" />
        </div>
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
    <main className="club-receipt-wrapper">
      {/* Top action bar */}
      <div className="club-receipt-topbar no-print">
        <button
          type="button"
          className="club-fee-btn club-fee-btn--receipt"
          onClick={() => {
            if (window.history.length > 1) {
              navigate(-1)
            } else {
              navigate(clubId || receipt?.club?._id ? `/clubs/${clubId || receipt?.club?._id}/fees` : '/my-fees')
            }
          }}
          id="btn-receipt-back"
        >
          ← Back to Fees
        </button>
        <button
          type="button"
          className="club-fee-btn club-fee-btn--pay"
          onClick={() => window.print()}
          id="btn-receipt-print"
          style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}
        >
          <FileTextIcon size={16} />
          <span>Print / Download Receipt</span>
        </button>
      </div>

      {/* Official Receipt Card */}
      <article className="club-receipt-paper" id="official-e-receipt">
        <header className="club-receipt-header">
          <div className="club-receipt-header__brand">
            <span className="club-receipt-header__logo-icon" style={{ display: 'flex', alignItems: 'center' }}>
              <LandmarkIcon size={32} color="#ea580c" />
            </span>
            <div>
              <h1 className="club-receipt-header__title">UNICLUB MANAGEMENT SYSTEM</h1>
              <p className="club-receipt-header__sub">Official Digital Payment Receipt</p>
            </div>
          </div>

          <div className="club-receipt-header__badge-wrap">
            <span className="club-receipt-badge" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircleIcon size={14} strokeWidth={2.5} />
              <span>PAYMENT SUCCESSFUL</span>
            </span>
            <span className="club-receipt-id">
              ID: #{receipt.receiptId || receipt._id}
            </span>
          </div>
        </header>

        <section className="club-receipt-grid">
          <div className="club-receipt-field">
            <span className="club-receipt-field__label" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <LandmarkIcon size={14} />
              <span>Organizing Club</span>
            </span>
            <span className="club-receipt-field__value">{receipt.club?.name || 'N/A'}</span>
          </div>

          <div className="club-receipt-field">
            <span className="club-receipt-field__label" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <UserIcon size={14} />
              <span>Member Name</span>
            </span>
            <span className="club-receipt-field__value">{receipt.user?.full_name || 'N/A'}</span>
          </div>

          <div className="club-receipt-field">
            <span className="club-receipt-field__label" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <FileTextIcon size={14} />
              <span>Member Email</span>
            </span>
            <span className="club-receipt-field__value">{receipt.user?.email || 'N/A'}</span>
          </div>

          <div className="club-receipt-field">
            <span className="club-receipt-field__label" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <CalendarIcon size={14} />
              <span>Billing Period</span>
            </span>
            <span className="club-receipt-field__value">Period {receipt.period}</span>
          </div>

          <div className="club-receipt-field">
            <span className="club-receipt-field__label" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <FileTextIcon size={14} />
              <span>Fee Description</span>
            </span>
            <span className="club-receipt-field__value">{receipt.order_info || `Membership Fee - ${receipt.period}`}</span>
          </div>

          <div className="club-receipt-field">
            <span className="club-receipt-field__label" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <CreditCardIcon size={14} />
              <span>Payment Method</span>
            </span>
            <span className="club-receipt-field__value" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              {String(receipt.payment_method).toLowerCase() === 'cash' || receipt.payment_method === 0 ? (
                <>
                  <BanknoteIcon size={14} color="#16a34a" />
                  <span>Cash Payment</span>
                </>
              ) : (
                <>
                  <ZapIcon size={14} color="#ea580c" />
                  <span>VNPay Online Gateway</span>
                </>
              )}
            </span>
          </div>

          {receipt.txn_ref && (
            <div className="club-receipt-field">
              <span className="club-receipt-field__label" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <HashIcon size={14} />
                <span>VNPay TxnRef</span>
              </span>
              <span className="club-receipt-field__value" style={{ fontFamily: 'monospace' }}>
                {receipt.txn_ref}
              </span>
            </div>
          )}

          {receipt.vnp_response_code && (
            <div className="club-receipt-field">
              <span className="club-receipt-field__label" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
                <ZapIcon size={14} color="#16a34a" />
                <span>VNPay Response Code</span>
              </span>
              <span className="club-receipt-field__value" style={{ color: '#16a34a' }}>
                {receipt.vnp_response_code} (Success)
              </span>
            </div>
          )}

          <div className="club-receipt-field">
            <span className="club-receipt-field__label" style={{ display: 'inline-flex', alignItems: 'center', gap: '5px' }}>
              <ClockIcon size={14} />
              <span>Paid At</span>
            </span>
            <span className="club-receipt-field__value">{formatDate(receipt.paid_at || receipt.created_at)}</span>
          </div>
        </section>

        {/* Total Amount Paid Banner */}
        <div className="club-receipt-total-bar">
          <span className="club-receipt-total-label">Total Amount Paid</span>
          <strong className="club-receipt-total-value">{formatVND(receipt.amount)}</strong>
        </div>

        {/* Official Footer Note */}
        <footer className="club-receipt-footer">
          <p style={{ margin: '0 0 0.35rem 0', fontWeight: 600, color: '#6e5e52', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
            <CheckCircleIcon size={16} color="#16a34a" />
            <span>Thank you for fulfilling your club membership dues and supporting club activities!</span>
          </p>
          <p style={{ margin: 0, fontSize: '0.78rem' }}>
            This digital receipt serves as verifiable official proof of payment within the UniClub Platform.
          </p>
        </footer>
      </article>
    </main>
  )
}
