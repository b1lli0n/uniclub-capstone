import React, { useState, useEffect, useRef, useMemo } from 'react';
import { getEventRequests, approveEventRequest, rejectEventRequest } from '../../api/eventRequest.api';
import { useConfirm, useToast } from '../../components/common/notificationContext';

function formatStatusLabel(status = '') {
  if (!status) return 'Pending';
  return `${status.charAt(0).toUpperCase()}${status.slice(1)}`;
}

const ADMIN_EVENT_SORT_OPTIONS = [
  { value: 'status', label: 'Sort: Status (Pending first)' },
  { value: 'all', label: 'All Requests' },
  { value: 'pending', label: 'Status: Pending' },
  { value: 'approved', label: 'Status: Approved' },
  { value: 'rejected', label: 'Status: Rejected' },
  { value: 'newest', label: 'Newest date' },
  { value: 'oldest', label: 'Oldest date' },
];

export default function AdminEventRequestsTab() {
  const confirm = useConfirm();
  const showToast = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [detailRequest, setDetailRequest] = useState(null);
  const [sortMode, setSortMode] = useState('status');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortMenuOpen, setSortMenuOpen] = useState(false);
  const sortRef = useRef(null);

  useEffect(() => {
    fetchRequests();
  }, []);

  useEffect(() => {
    if (!sortMenuOpen) return undefined;

    function handlePointerDown(event) {
      if (!sortRef.current?.contains(event.target)) {
        setSortMenuOpen(false);
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setSortMenuOpen(false);
    }

    document.addEventListener('pointerdown', handlePointerDown);
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [sortMenuOpen]);

  const selectedSort = ADMIN_EVENT_SORT_OPTIONS.find((opt) => opt.value === sortMode);

  const visibleRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    let list = requests.filter((item) => {
      if (!query) return true;
      const title = (item.title || '').toLowerCase();
      const clubName = (item.club_id?.name || '').toLowerCase();
      return title.includes(query) || clubName.includes(query);
    });

    if (sortMode === 'pending') {
      return list.filter((item) => item.status === 'pending');
    }
    if (sortMode === 'approved') {
      return list.filter((item) => item.status === 'approved');
    }
    if (sortMode === 'rejected') {
      return list.filter((item) => item.status === 'rejected');
    }
    if (sortMode === 'newest') {
      return [...list].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    }
    if (sortMode === 'oldest') {
      return [...list].sort((a, b) => new Date(a.created_at) - new Date(b.created_at));
    }
    if (sortMode === 'status') {
      const priority = { pending: 1, approved: 2, rejected: 3 };
      return [...list].sort((a, b) => {
        const pA = priority[a.status] || 99;
        const pB = priority[b.status] || 99;
        if (pA !== pB) return pA - pB;
        return new Date(b.created_at) - new Date(a.created_at);
      });
    }

    return list;
  }, [requests, searchQuery, sortMode]);

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
        <div className="admin-sort" ref={sortRef}>
          <button
            type="button"
            className="admin-sort-btn"
            aria-haspopup="listbox"
            aria-expanded={sortMenuOpen}
            onClick={() => setSortMenuOpen((v) => !v)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M3 6h18M7 12h10M10 18h4" strokeLinecap="round" />
            </svg>
            {selectedSort?.label || 'Sort'}
          </button>

          {sortMenuOpen ? (
            <ul className="admin-sort__menu" role="listbox">
              {ADMIN_EVENT_SORT_OPTIONS.map((option) => (
                <li key={option.value} role="none">
                  <button
                    type="button"
                    className="admin-sort__option"
                    role="option"
                    aria-selected={option.value === sortMode}
                    onClick={() => {
                      setSortMode(option.value);
                      setSortMenuOpen(false);
                    }}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      <div className="admin-card__tools">
        <label className="admin-card__search">
          <span aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="7" />
              <path d="M20 20l-3-3" strokeLinecap="round" />
            </svg>
          </span>
          <input
            type="search"
            placeholder="Search event title or club..."
            aria-label="Search event requests"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </label>
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
        ) : visibleRequests.length === 0 ? (
          <p className="admin-table__empty">No event requests found.</p>
        ) : (
          visibleRequests.map((item) => (
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
