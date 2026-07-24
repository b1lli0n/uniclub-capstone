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
          {detailRequest.status === 'pending' && (
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
              <span className={`admin-detail-status admin-detail-status--${item.status}`}>
                {formatStatusLabel(item.status)}
              </span>
              <button
                type="button"
                className="admin-view-btn"
                onClick={() => setDetailRequest(item)}
              >
                View
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
