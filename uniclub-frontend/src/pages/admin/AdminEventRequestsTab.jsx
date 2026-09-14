import React, { useState, useEffect } from 'react';
import { getEventRequests, approveEventRequest, rejectEventRequest } from '../../api/eventRequest.api';
import { useConfirm, useToast } from '../../components/common/notificationContext';

function formatStatusLabel(status = '') {
  if (!status) return 'Pending';
  return `${status.charAt(0).toUpperCase()}${status.slice(1)}`;
}

export default function AdminEventRequestsTab() {
  const confirm = useConfirm();
  const showToast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailRequest, setDetailRequest] = useState(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await getEventRequests();
      setRequests(res.data || []);
    } catch (error) {
      showToast({ type: 'error', title: 'Error', message: 'Failed to fetch event requests' });
    } finally {
      setLoading(false);
    }
  };

  const handleApprove = async (request) => {
    const accepted = await confirm({
      title: 'Approve Event Request?',
      message: `Are you sure you want to approve "${request.title}"?`,
      confirmText: 'Approve',
    });
    if (!accepted) return;

    try {
      await approveEventRequest(request._id);
      showToast({ type: 'success', title: 'Approved', message: 'Event request has been approved' });
      fetchRequests();
      if (detailRequest?._id === request._id) setDetailRequest(null);
    } catch (error) {
      showToast({ type: 'error', title: 'Error', message: error.message || 'Failed to approve' });
    }
  };

  const handleReject = async (request) => {
    const note = window.prompt("Enter reason for rejection:");
    if (note === null) return; // User cancelled

    const accepted = await confirm({
      title: 'Reject Event Request?',
      message: `Are you sure you want to reject "${request.title}"?`,
      confirmText: 'Reject',
      tone: 'danger',
    });
    if (!accepted) return;

    try {
      await rejectEventRequest(request._id, note || 'No reason provided');
      showToast({ type: 'success', title: 'Rejected', message: 'Event request has been rejected' });
      fetchRequests();
      if (detailRequest?._id === request._id) setDetailRequest(null);
    } catch (error) {
      showToast({ type: 'error', title: 'Error', message: error.message || 'Failed to reject' });
    }
  };

  if (detailRequest) {
    return (
      <div className="admin-detail-card">
        <div className="admin-detail-header">
          <button
            type="button"
            className="admin-detail-back"
            onClick={() => setDetailRequest(null)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div>
            <h2>Event Request Details</h2>
            <p>View detailed information about this event creation request.</p>
          </div>
        </div>
        <div className="admin-detail-panel">
          <h3>Request Information</h3>
          <div className="admin-detail-grid">
            <div className="admin-detail-field">
              <span>Event Title</span>
              <strong>{detailRequest.title}</strong>
            </div>
            <div className="admin-detail-field">
              <span>Club Name</span>
              <strong>{detailRequest.club_id?.name || 'Unknown'}</strong>
            </div>
            <div className="admin-detail-field">
              <span>Requested By</span>
              <strong>{detailRequest.requested_by?.full_name || 'Unknown'}</strong>
            </div>
            <div className="admin-detail-field">
              <span>Start Time</span>
              <strong>{new Date(detailRequest.start_time).toLocaleString()}</strong>
            </div>
            <div className="admin-detail-field">
              <span>Status</span>
              <strong className={`admin-detail-status admin-detail-status--${detailRequest.status}`}>
                {formatStatusLabel(detailRequest.status)}
              </strong>
            </div>
            <div className="admin-detail-field">
              <span>Document</span>
              <strong>
                <a href={detailRequest.approval_document_url} target="_blank" rel="noopener noreferrer">
                  View Document
                </a>
              </strong>
            </div>
            <div className="admin-detail-field admin-detail-field--wide">
              <span>Detailed content</span>
              <strong>{detailRequest.content}</strong>
            </div>
          </div>
          {detailRequest.status === 'pending' ? (
            <div className="admin-detail-actions">
              <button
                type="button"
                className="admin-detail-approve"
                onClick={() => handleApprove(detailRequest)}
              >
                Approve request
              </button>
              <button
                type="button"
                className="admin-detail-reject"
                onClick={() => handleReject(detailRequest)}
              >
                Reject
              </button>
            </div>
          ) : (
            <div className="admin-detail-actions">
              <span style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 700 }}>
                This event request is currently <strong className={`admin-badge-status admin-badge-status--${detailRequest.status}`}>{formatStatusLabel(detailRequest.status)}</strong>
              </span>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="admin-card">
      <div className="admin-card__header">
        <div>
          <h2>Event Requests List</h2>
          <p>Manage submitted event creation requests.</p>
        </div>
      </div>
      <div className="admin-table" role="table">
        <div className="admin-table__row admin-table__row--head" role="row">
          <span>Event Title</span>
          <span>Club</span>
          <span>Date</span>
          <span>Status</span>
          <span aria-label="Actions" />
        </div>
        {loading ? (
          <p className="admin-table__empty">Loading requests...</p>
        ) : requests.length === 0 ? (
          <p className="admin-table__empty">No event requests found.</p>
        ) : (
          requests.map((item) => (
            <div className="admin-table__row admin-table__row--body" role="row" key={item._id}>
              <div className="admin-club-cell">
                <strong>{item.title}</strong>
              </div>
              <span>{item.club_id?.name || 'Unknown'}</span>
              <span>{new Date(item.created_at).toLocaleDateString()}</span>
              <span>
                <strong className={`admin-badge-status admin-badge-status--${item.status}`}>
                  {formatStatusLabel(item.status)}
                </strong>
              </span>
              <span className="admin-row-actions">
                {item.status === 'pending' && (
                  <>
                    <button
                      type="button"
                      className="admin-status-actions__approve"
                      title="Approve event request"
                      aria-label="Approve event request"
                      onClick={() => handleApprove(item)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                        <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      className="admin-status-actions__reject"
                      title="Reject event request"
                      aria-label="Reject event request"
                      onClick={() => handleReject(item)}
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                        <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                      </svg>
                    </button>
                  </>
                )}
                <button
                  type="button"
                  className="admin-view-btn"
                  title={`View ${item.title} request`}
                  aria-label={`View ${item.title} request`}
                  onClick={() => setDetailRequest(item)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                    <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6Z" />
                    <circle cx="12" cy="12" r="2.6" />
                  </svg>
                </button>
              </span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
