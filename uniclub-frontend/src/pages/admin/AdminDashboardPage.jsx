import { useMemo, useRef, useState, useEffect } from 'react'
import '../../styles/home.css'
import '../../styles/admin-dashboard.css'
import { ADMIN_NAV_ITEMS } from '../../data/mockData'
import fptUniversityLogo from '../../assets/Logo-Dai-hoc-FPT.webp'
import { useConfirm, useToast } from '../../components/common/notificationContext'
import AdminEventRequestsTab from './AdminEventRequestsTab'
import { getAdminClubList, getClubCreationRequestList, reviewClubCreationRequest, assignManagementRole } from '../../api/clubManagement.api'
import { mapAdminClubFromApi, mapCreationRequestFromApi, mapAdminRoleToApi } from '../../api/clubMappers'

const ADMIN_SORT_OPTIONS = [
  { value: 'pending', label: 'Status: Pending' },
  { value: 'all', label: 'All Requests' },
  { value: 'newest', label: 'Newest date' },
  { value: 'oldest', label: 'Oldest date' },
  { value: 'approved', label: 'Status: Approved' },
  { value: 'rejected', label: 'Status: Rejected' },
]

const ADMIN_CLUB_SORT_OPTIONS = [
  { value: 'name-asc', label: 'Name A-Z' },
  { value: 'newest', label: 'Newest' },
  { value: 'oldest', label: 'Oldest' },
]

const ADMIN_PAGE_SIZE = 10
const MEMBER_ROLE_OPTIONS = ['Leader', 'Vice leader', 'Secretary', 'Treasurer', 'Member']

function formatStatusLabel(status = '') {
  if (!status) return 'Pending'
  return `${status.charAt(0).toUpperCase()}${status.slice(1)}`
}

const adminIcons = {
  dashboard: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path d="M4 13h7V4H4v9ZM13 20h7V4h-7v16ZM4 20h7v-5H4v5Z" strokeLinejoin="round" />
    </svg>
  ),
  registrations: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path d="M8 6h13M8 12h13M8 18h13" strokeLinecap="round" />
      <path d="M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" />
    </svg>
  ),
  clubs: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path d="M12 3 3 7.5v2h18v-2L12 3Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M5 10.5V18M9.5 10.5V18M14.5 10.5V18M19 10.5V18" strokeLinecap="round" />
      <path d="M4 18h16M3 21h18" strokeLinecap="round" />
    </svg>
  ),
  rewards: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path d="M20 12v8H4v-8M3 8h18v4H3V8Z" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M12 8v12M12 8H8.5A2.5 2.5 0 1 1 11 5.5V8ZM12 8h3.5A2.5 2.5 0 1 0 13 5.5V8Z" strokeLinejoin="round" />
    </svg>
  ),
  badges: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path d="m12 3 2.7 5.5 6.1.9-4.4 4.3 1 6.1L12 16.9l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z" strokeLinejoin="round" />
    </svg>
  ),
  notifications: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M10 21h4" strokeLinecap="round" />
    </svg>
  ),
}

function AdminSidebar({ activeItem = 'registrations', onNavigate, onLogout }) {
  return (
    <aside className="home-sidebar admin-home-sidebar" aria-label="Admin navigation">
      <div className="home-sidebar__top">
        <button type="button" className="home-sidebar__menu" aria-label="Open menu">
          <span className="home-sidebar__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
            </svg>
          </span>
        </button>
      </div>

      <nav className="home-sidebar__nav">
        <ul className="home-sidebar__list">
          {ADMIN_NAV_ITEMS.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                className={`home-sidebar__link${item.id === activeItem ? ' is-active' : ''}`}
                title={item.label}
                onClick={() => onNavigate?.(item.id)}
              >
                <span className="home-sidebar__icon">{adminIcons[item.icon]}</span>
                <span className="home-sidebar__label">{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="home-sidebar__footer">
        <button
          type="button"
          className="home-sidebar__link home-sidebar__link--logout"
          title="Logout"
          onClick={onLogout}
        >
          <span className="home-sidebar__icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" strokeLinecap="round" />
              <path d="M16 17l5-5-5-5M21 12H9" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          <span className="home-sidebar__label">Logout</span>
        </button>
      </div>
    </aside>
  )
}

function AdminTopbar() {
  return (
    <div className="home-layout-topbar-container admin-topbar-wrap">
      <header className="home-topbar">
        <button type="button" className="home-topbar__brand admin-brand">
          <img src={fptUniversityLogo} alt="FPT University" className="home-topbar__brand-logo" />
          <span>UniClub</span>
        </button>

        <div className="home-topbar__center" />

        <div className="home-topbar__actions">
          <div className="home-user-menu">
            <span className="home-user-menu__avatar" aria-hidden="true" />
            <span className="home-user-menu__name">Admin</span>
            <span className="home-user-menu__caret" aria-hidden="true">
              <svg viewBox="0 0 12 8" fill="currentColor">
                <path d="M6 8L0 0h12L6 8z" />
              </svg>
            </span>
          </div>
        </div>
      </header>
    </div>
  )
}

function AdminDashboardPage({ onLogout }) {
  const confirm = useConfirm()
  const showToast = useToast()
  const [activeView, setActiveView] = useState('registrations')
  const [sortMenuOpen, setSortMenuOpen] = useState(false)
  const [sortMode, setSortMode] = useState('pending')
  const [searchQuery, setSearchQuery] = useState('')
  const [clubSortMenuOpen, setClubSortMenuOpen] = useState(false)
  const [clubSortMode, setClubSortMode] = useState('')
  const [clubSearchQuery, setClubSearchQuery] = useState('')
  const [detailRequest, setDetailRequest] = useState(null)
  const [selectedActiveClub, setSelectedActiveClub] = useState(null)
  const [isManagingMembers, setIsManagingMembers] = useState(false)
  const [memberRoleFilter, setMemberRoleFilter] = useState('all')
  const [openRoleDropdown, setOpenRoleDropdown] = useState(null)
  const [registrationRequests, setRegistrationRequests] = useState([])
  const [registrationsLoading, setRegistrationsLoading] = useState(false)
  const [registrationsError, setRegistrationsError] = useState(null)
  const [activeClubs, setActiveClubs] = useState([])
  const [clubsLoading, setClubsLoading] = useState(false)
  const [clubsError, setClubsError] = useState(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [clubCurrentPage, setClubCurrentPage] = useState(1)
  const sortRef = useRef(null)
  const clubSortRef = useRef(null)
  const selectedSort = ADMIN_SORT_OPTIONS.find((option) => option.value === sortMode)
  const selectedClubSort = ADMIN_CLUB_SORT_OPTIONS.find((option) => option.value === clubSortMode)
  const visibleRequests = useMemo(() => {
    const query = searchQuery.trim().toLowerCase()
    let requests = registrationRequests.filter((item) => {
      if (!query) return true

      return item.clubName.toLowerCase().includes(query)
    })
    const parseSentDate = (dateText) => {
      if (!dateText) return 0
      const parts = dateText.split('/')
      if (parts.length < 3) return 0
      const [day, month, year] = parts.map(Number)
      return new Date(year, month - 1, day).getTime()
    }

    if (!sortMode || sortMode === 'pending') {
      return requests.filter((item) => item.status === 'pending')
    }

    if (sortMode === 'all') {
      return requests
    }

    if (sortMode === 'oldest') {
      return requests.sort((a, b) => parseSentDate(a.sentDate) - parseSentDate(b.sentDate))
    }

    if (sortMode === 'newest') {
      return requests.sort((a, b) => parseSentDate(b.sentDate) - parseSentDate(a.sentDate))
    }

    return requests.filter((item) => item.status === sortMode)
  }, [registrationRequests, searchQuery, sortMode])
  const pageCount = Math.max(1, Math.ceil(visibleRequests.length / ADMIN_PAGE_SIZE))
  const paginatedRequests = useMemo(() => {
    const startIndex = (currentPage - 1) * ADMIN_PAGE_SIZE
    return visibleRequests.slice(startIndex, startIndex + ADMIN_PAGE_SIZE)
  }, [currentPage, visibleRequests])
  const visibleClubs = useMemo(() => {
    const query = clubSearchQuery.trim().toLowerCase()
    const clubs = activeClubs.filter((item) => {
      if (!query) return true
      return item.clubName.toLowerCase().includes(query)
    })

    if (clubSortMode === 'newest') {
      return clubs.sort((a, b) => b.createdAt - a.createdAt)
    }

    if (clubSortMode === 'oldest') {
      return clubs.sort((a, b) => a.createdAt - b.createdAt)
    }

    if (clubSortMode === 'name-asc') {
      return clubs.sort((a, b) => a.clubName.localeCompare(b.clubName))
    }

    return clubs
  }, [activeClubs, clubSearchQuery, clubSortMode])
  const clubPageCount = Math.max(1, Math.ceil(visibleClubs.length / ADMIN_PAGE_SIZE))
  const paginatedClubs = useMemo(() => {
    const startIndex = (clubCurrentPage - 1) * ADMIN_PAGE_SIZE
    return visibleClubs.slice(startIndex, startIndex + ADMIN_PAGE_SIZE)
  }, [clubCurrentPage, visibleClubs])

  useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, sortMode])

  useEffect(() => {
    setClubCurrentPage(1)
  }, [clubSearchQuery, clubSortMode])

  useEffect(() => {
    if (activeView !== 'clubs') return
    let cancelled = false
    setClubsLoading(true)
    setClubsError(null)
    getAdminClubList()
      .then((res) => {
        if (cancelled) return
        const clubs = (res.data?.clubs || res.clubs || []).map(mapAdminClubFromApi)
        setActiveClubs(clubs)
      })
      .catch((err) => {
        if (cancelled) return
        setClubsError(err.message || 'Failed to load clubs')
      })
      .finally(() => {
        if (!cancelled) setClubsLoading(false)
      })
    return () => { cancelled = true }
  }, [activeView])

  useEffect(() => {
    if (activeView !== 'registrations') return
    let cancelled = false
    setRegistrationsLoading(true)
    setRegistrationsError(null)
    getClubCreationRequestList()
      .then((res) => {
        if (cancelled) return
        const requests = (res.data || res.requests || []).map(mapCreationRequestFromApi)
        setRegistrationRequests(requests)
      })
      .catch((err) => {
        if (cancelled) return
        setRegistrationsError(err.message || 'Failed to load registration requests')
      })
      .finally(() => {
        if (!cancelled) setRegistrationsLoading(false)
      })
    return () => { cancelled = true }
  }, [activeView])

  useEffect(() => {
    if (currentPage > pageCount) {
      setCurrentPage(pageCount)
    }
  }, [currentPage, pageCount])

  useEffect(() => {
    if (clubCurrentPage > clubPageCount) {
      setClubCurrentPage(clubPageCount)
    }
  }, [clubCurrentPage, clubPageCount])

  useEffect(() => {
    if (!sortMenuOpen && !clubSortMenuOpen) return undefined

    function handlePointerDown(event) {
      if (!sortRef.current?.contains(event.target)) {
        setSortMenuOpen(false)
      }
      if (!clubSortRef.current?.contains(event.target)) {
        setClubSortMenuOpen(false)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') setSortMenuOpen(false)
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [sortMenuOpen, clubSortMenuOpen])

  useEffect(() => {
    if (!openRoleDropdown) return undefined

    function handlePointerDown(event) {
      if (!event.target.closest('.admin-role-dropdown')) {
        setOpenRoleDropdown(null)
      }
    }

    function handleKeyDown(event) {
      if (event.key === 'Escape') {
        setOpenRoleDropdown(null)
      }
    }

    document.addEventListener('pointerdown', handlePointerDown)
    document.addEventListener('keydown', handleKeyDown)

    return () => {
      document.removeEventListener('pointerdown', handlePointerDown)
      document.removeEventListener('keydown', handleKeyDown)
    }
  }, [openRoleDropdown])

  function handleAdminNavigate(itemId) {
    setActiveView(itemId)
    setDetailRequest(null)
    setSelectedActiveClub(null)
    setIsManagingMembers(false)
  }

  async function handleDeleteClub(clubId) {
    const targetClub = activeClubs.find((item) => item.id === clubId)
    const accepted = await confirm({
      title: 'Delete club?',
      message: `Delete ${targetClub?.clubName || 'this club'} from the active club list?`,
      confirmText: 'Delete',
      tone: 'danger',
    })

    if (!accepted) return

    setActiveClubs((items) => items.filter((item) => item.id !== clubId))
    if (selectedActiveClub?.id === clubId) {
      setSelectedActiveClub(null)
      setIsManagingMembers(false)
    }
    // Display notification when club is deleted in admin page.
    showToast({
      type: 'success',
      title: 'Club deleted',
      message: `${targetClub?.clubName || 'The club'} has been removed from the list.`,
    })
  }

  function getRoleClass(role) {
    return String(role).toLowerCase().replace(/\s+/g, '-')
  }

  function renderRoleDropdown({ id, value, options, onChange, ariaLabel }) {
    const selectedOption = options.find((option) => option.value === value) || options[0]
    const isOpen = openRoleDropdown === id

    return (
      <div className={`admin-role-dropdown admin-role-dropdown--${getRoleClass(value)}${isOpen ? ' is-open' : ''}`}>
        <button
          type="button"
          className="admin-role-dropdown__button"
          aria-label={ariaLabel}
          aria-haspopup="listbox"
          aria-expanded={isOpen}
          onClick={() => setOpenRoleDropdown((current) => (current === id ? null : id))}
        >
          <span>{selectedOption.label}</span>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
            <path d="m6 9 6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </button>

        {isOpen ? (
          <ul className="admin-role-dropdown__menu" role="listbox">
            {options.map((option) => (
              <li key={option.value} role="none">
                <button
                  type="button"
                  className={`admin-role-dropdown__option admin-role-dropdown__option--${getRoleClass(option.value)}`}
                  role="option"
                  aria-selected={option.value === value}
                  onClick={() => {
                    onChange(option.value)
                    setOpenRoleDropdown(null)
                  }}
                >
                  {option.label}
                </button>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    )
  }

  async function updateMemberRole(memberId, nextRole) {
    const targetMember = selectedActiveClub?.memberList?.find((member) => member.id === memberId)
    if (!targetMember || targetMember.role === nextRole) return

    const accepted = await confirm({
      title: 'Update member role?',
      message: `Change ${targetMember.name}'s role from ${targetMember.role} to ${nextRole}?`,
      confirmText: 'Update role',
    })

    if (!accepted) return

    try {
      if (selectedActiveClub?.id) {
        await assignManagementRole(
          selectedActiveClub.id,
          memberId,
          mapAdminRoleToApi(nextRole)
        )
      }

      const isNewLeader = nextRole === 'Leader'

      setActiveClubs((clubs) =>
        clubs.map((club) => {
          if (club.id !== selectedActiveClub.id) return club

          return {
            ...club,
            leader: isNewLeader ? targetMember.name : club.leader,
            memberList: club.memberList.map((member) => {
              if (member.id === memberId) {
                return { ...member, role: nextRole }
              }
              if (isNewLeader && (member.role === 'Leader' || member.role === 'president')) {
                return { ...member, role: 'Member' }
              }
              return member
            }),
          }
        })
      )

    setSelectedActiveClub((club) => ({
      ...club,
      memberList: club.memberList.map((member) =>
        member.id === memberId ? { ...member, role: nextRole } : member
      ),
    }))
    // Display notification when member role is updated in admin page.
    showToast({
      type: 'success',
      title: 'Role updated',
      message: `${targetMember.name}'s role has been changed to ${nextRole}.`,
    })
      setSelectedActiveClub((club) => ({
        ...club,
        leader: isNewLeader ? targetMember.name : club.leader,
        memberList: club.memberList.map((member) => {
          if (member.id === memberId) {
            return { ...member, role: nextRole }
          }
          if (isNewLeader && (member.role === 'Leader' || member.role === 'president')) {
            return { ...member, role: 'Member' }
          }
          return member
        }),
      }))

      showToast({
        type: 'success',
        title: 'Role updated',
        message: `${targetMember.name}'s role has been changed to ${nextRole}.`,
      })
    } catch (err) {
      console.error(err)
      showToast({
        type: 'error',
        title: 'Update failed',
        message: err.message || 'Failed to update member role',
      })
    }
  }

  async function updateRegistrationRequestStatus(request, nextStatus) {
    const isApprove = nextStatus === 'approved'
    const accepted = await confirm({
      title: isApprove ? 'Approve registration?' : 'Reject registration?',
      message: `${isApprove ? 'Approve' : 'Reject'} the registration request for ${request.clubName || 'this club'}?`,
      confirmText: isApprove ? 'Approve' : 'Reject',
      tone: isApprove ? 'warning' : 'danger',
    })

    if (!accepted) return

    try {
      await reviewClubCreationRequest(request.id, {
        status: nextStatus,
        review_note: isApprove ? 'Approved by admin' : 'Rejected by admin'
      })
      
      setRegistrationRequests((items) =>
        items.map((item) =>
          item.id === request.id ? { ...item, status: nextStatus } : item
        )
      )
      setDetailRequest((current) =>
        current?.id === request.id ? { ...current, status: nextStatus } : current
      )
      showToast({
        type: 'success',
        title: isApprove ? 'Request approved' : 'Request rejected',
        message: `${request.clubName || 'The club'} has been ${isApprove ? 'approved' : 'rejected'}.`,
      })
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Error',
        message: err.message || 'Failed to update request status',
      })
    }
  }

  function renderMemberManagement() {
    const memberRows = selectedActiveClub.memberList || []
    const filterRoleOptions = [
      { value: 'all', label: 'All' },
      ...MEMBER_ROLE_OPTIONS.map((role) => ({ value: role, label: role })),
    ]
    const memberRoleOptions = MEMBER_ROLE_OPTIONS.map((role) => ({ value: role, label: role }))
    const visibleMembers =
      memberRoleFilter === 'all'
        ? memberRows
        : memberRows.filter((member) => member.role === memberRoleFilter)

    return (
      <div className="admin-detail-card admin-member-management-card">
        <div className="admin-detail-header">
          <button
            type="button"
            className="admin-detail-back"
            aria-label="Back to club details"
            onClick={() => setIsManagingMembers(false)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div>
            <h2>Member Management</h2>
            <p>
              {selectedActiveClub.clubName} - {memberRows.length} members
            </p>
          </div>
        </div>

        <div className="admin-member-toolbar">
          <span>Role</span>
          {renderRoleDropdown({
            id: 'member-role-filter',
            value: memberRoleFilter,
            options: filterRoleOptions,
            ariaLabel: 'Filter members by role',
            onChange: setMemberRoleFilter,
          })}
        </div>

        <div className="admin-members-table admin-members-table--full" role="table" aria-label="Full club member list">
          <div className="admin-members-table__row admin-members-table__row--head" role="row">
            <span>Member name</span>
            <span>Email</span>
            <span>Role</span>
            <span>Join date</span>
          </div>
          {visibleMembers.map((member) => (
            <div className="admin-members-table__row" role="row" key={member.id}>
              <span>{member.name}</span>
              <span>{member.email}</span>
              {renderRoleDropdown({
                id: `member-role-${member.id}`,
                value: member.role,
                options: memberRoleOptions,
                ariaLabel: `Change ${member.name} role`,
                onChange: (nextRole) => updateMemberRole(member.id, nextRole),
              })}
              <span>{member.joinDate}</span>
            </div>
          ))}
        </div>

        {visibleMembers.length === 0 ? (
          <p className="admin-table__empty">No members match this role.</p>
        ) : null}
      </div>
    )
  }

  function renderActiveClubDetail() {
    const memberRows = (selectedActiveClub.memberList || []).slice(0, 5)

    return (
      <div className="admin-detail-card admin-club-detail-card">
        <div className="admin-detail-header">
          <button
            type="button"
            className="admin-detail-back"
            aria-label="Back to club management"
            onClick={() => setSelectedActiveClub(null)}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
              <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <div>
            <h2>Club Details</h2>
            <p>View detailed club information.</p>
          </div>
        </div>

        <div className="admin-detail-panel">
          <h3>General information</h3>
          <div className="admin-detail-grid">
            <div className="admin-detail-field">
              <span>Club name</span>
              <strong>{selectedActiveClub.clubName}</strong>
            </div>
            <div className="admin-detail-field">
              <span>Leader</span>
              <strong>{selectedActiveClub.leader}</strong>
            </div>
            <div className="admin-detail-field">
              <span>Category</span>
              <strong>{selectedActiveClub.category}</strong>
            </div>
            <div className="admin-detail-field">
              <span>Created date</span>
              <strong>{selectedActiveClub.createdDate}</strong>
            </div>
            <div className="admin-detail-field">
              <span>Total members</span>
              <strong>{selectedActiveClub.members}</strong>
            </div>
            <div className="admin-detail-field">
              <span>Status</span>
              <strong className="admin-active-status">Active</strong>
            </div>
            <div className="admin-detail-field admin-detail-field--wide">
              <span>Description</span>
              <strong>{selectedActiveClub.description}</strong>
            </div>
          </div>

          <div className="admin-members-section">
            <div className="admin-members-section__header">
              <h3>Members</h3>
              <button
                type="button"
                className="admin-members-section__view-all"
                onClick={() => {
                  setMemberRoleFilter('all')
                  setIsManagingMembers(true)
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" strokeLinecap="round" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
                </svg>
                View all members
              </button>
            </div>

            <div className="admin-members-table" role="table" aria-label="Club members">
              <div className="admin-members-table__row admin-members-table__row--head" role="row">
                <span>Member name</span>
                <span>Email</span>
                <span>Role</span>
                <span>Join date</span>
              </div>
              {memberRows.map((member) => (
                <div className="admin-members-table__row" role="row" key={member.id}>
                  <span>{member.name}</span>
                  <span>{member.email}</span>
                  <strong className={`admin-preview-member-role admin-preview-member-role--${member.role.toLowerCase().replace(/\s+/g, '-')}`}>
                    {member.role}
                  </strong>
                  <span>{member.joinDate}</span>
                </div>
              ))}
            </div>
            <p className="admin-members-section__meta">
              Showing {memberRows.length} of {selectedActiveClub.members} members
            </p>
          </div>
        </div>
      </div>
    )
  }

  function renderClubManagement() {
    if (selectedActiveClub && isManagingMembers) {
      return renderMemberManagement()
    }

    if (selectedActiveClub) {
      return renderActiveClubDetail()
    }

    return (
      <div className="admin-card">
        <div className="admin-card__header">
          <div>
            <h2>Club Management</h2>
            <p>Manage active clubs after approved registration requests.</p>
          </div>
          <div className="admin-sort" ref={clubSortRef}>
            <button
              type="button"
              className="admin-sort-btn"
              aria-haspopup="listbox"
              aria-expanded={clubSortMenuOpen}
              onClick={() => setClubSortMenuOpen((value) => !value)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M3 6h18M7 12h10M10 18h4" strokeLinecap="round" />
              </svg>
              {selectedClubSort?.label || 'Sort'}
            </button>

            {clubSortMenuOpen ? (
              <ul className="admin-sort__menu" role="listbox">
                {ADMIN_CLUB_SORT_OPTIONS.map((option) => (
                  <li key={option.value} role="none">
                    <button
                      type="button"
                      className="admin-sort__option"
                      role="option"
                      aria-selected={option.value === clubSortMode}
                      onClick={() => {
                        setClubSortMode(option.value)
                        setClubSortMenuOpen(false)
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
              placeholder="Search clubs"
              aria-label="Search active clubs"
              value={clubSearchQuery}
              onChange={(event) => setClubSearchQuery(event.target.value)}
            />
          </label>
        </div>

        <div className="admin-table admin-table--clubs" role="table" aria-label="Active clubs">
          <div className="admin-table__row admin-table__row--head admin-table__row--club-head" role="row">
            <span>Club name</span>
            <span>Leader</span>
            <span>Members</span>
            <span>Status</span>
            <span aria-label="Actions" />
          </div>

          {clubsLoading ? (
            <p className="admin-table__empty">Loading clubs...</p>
          ) : clubsError ? (
            <p className="admin-table__empty" style={{ color: 'var(--color-danger, #e53e3e)' }}>
              {clubsError}
            </p>
          ) : (
            paginatedClubs.map((item) => (
              <div className="admin-table__row admin-table__row--body admin-table__row--club" role="row" key={item.id}>
                <strong className="admin-club-name-text">{item.clubName}</strong>
                <span>{item.leader}</span>
                <span>{item.members}</span>
                <span>
                  <strong className={`admin-active-status${item.status === 'inactive' ? ' admin-inactive-status' : ''}`}>
                    {item.status === 'inactive' ? 'Inactive' : 'Active'}
                  </strong>
                </span>
                <span className="admin-row-actions">
                  <button
                    type="button"
                    className="admin-delete-btn"
                    aria-label={`Delete ${item.clubName}`}
                    onClick={() => handleDeleteClub(item.id)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M3 6h18M8 6V4h8v2M6 6l1 15h10l1-15" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                  <button
                    type="button"
                    className="admin-view-btn"
                    aria-label={`View ${item.clubName}`}
                    onClick={() => {
                      setSelectedActiveClub(item)
                      setIsManagingMembers(false)
                    }}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                      <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                      <circle cx="12" cy="12" r="2.6" />
                    </svg>
                  </button>
                </span>
              </div>
            ))
          )}

          {!clubsLoading && !clubsError && visibleClubs.length === 0 ? (
            <p className="admin-table__empty">No active clubs match your search.</p>
          ) : null}
        </div>

        <div className="admin-pagination" aria-label="Club pagination">
          <button
            type="button"
            aria-label="Previous page"
            disabled={clubCurrentPage === 1}
            onClick={() => setClubCurrentPage((page) => Math.max(1, page - 1))}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
          <span>{clubCurrentPage}</span>
          <button
            type="button"
            aria-label="Next page"
            disabled={clubCurrentPage === clubPageCount}
            onClick={() => setClubCurrentPage((page) => Math.min(clubPageCount, page + 1))}
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
              <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="home-shell admin-home-shell">
      <AdminSidebar activeItem={activeView} onNavigate={handleAdminNavigate} onLogout={onLogout} />
      <main className="home-shell__main admin-main">
        <AdminTopbar />

        <section className="admin-page">
          {activeView === 'event-requests' ? (
            <AdminEventRequestsTab />
          ) : activeView === 'clubs' ? renderClubManagement() : detailRequest ? (
            <div className="admin-detail-card">
              <div className="admin-detail-header">
                <button
                  type="button"
                  className="admin-detail-back"
                  aria-label="Back to registration list"
                  onClick={() => setDetailRequest(null)}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <div>
                  <h2>Registration Details</h2>
                  <p>View detailed information about this club creation request.</p>
                </div>
              </div>

              <div className="admin-detail-panel">
                <h3>Request Information</h3>
                <div className="admin-detail-grid">
                  <div className="admin-detail-field">
                    <span>Club name</span>
                    <strong>{detailRequest.clubName}</strong>
                  </div>
                  <div className="admin-detail-field">
                    <span>Leader</span>
                    <strong>{detailRequest.leader || detailRequest.sender || 'Unknown'}</strong>
                  </div>
                  <div className="admin-detail-field">
                    <span>Sent date</span>
                    <strong>{detailRequest.sentDate}</strong>
                  </div>
                  <div className="admin-detail-field">
                    <span>Number of members</span>
                    <strong>{detailRequest.memberCount ?? 0}</strong>
                  </div>
                  <div className="admin-detail-field">
                    <span>Status</span>
                    <strong className={`admin-detail-status admin-detail-status--${detailRequest.status}`}>
                      {formatStatusLabel(detailRequest.status)}
                    </strong>
                  </div>
                  <div className="admin-detail-field">
                    <span>Category</span>
                    <strong>{detailRequest.category || 'Not specified'}</strong>
                  </div>
                  <div className="admin-detail-field admin-detail-field--wide">
                    <span>Detailed content</span>
                    <strong>{detailRequest.description || 'No description provided.'}</strong>
                  </div>
                </div>

                <div className="admin-detail-actions">
                  <button
                    type="button"
                    className="admin-detail-approve"
                    onClick={() => updateRegistrationRequestStatus(detailRequest, 'approved')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Approve request
                  </button>
                  <button
                    type="button"
                    className="admin-detail-reject"
                    onClick={() => updateRegistrationRequestStatus(detailRequest, 'rejected')}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                    </svg>
                    Reject
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="admin-card">
              <div className="admin-card__header">
                <div>
                  <h2>Registration List</h2>
                  <p>Manage submitted club registration requests.</p>
                </div>
                <div className="admin-sort" ref={sortRef}>
                  <button
                    type="button"
                    className="admin-sort-btn"
                    aria-haspopup="listbox"
                    aria-expanded={sortMenuOpen}
                    onClick={() => setSortMenuOpen((value) => !value)}
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                      <path d="M3 6h18M7 12h10M10 18h4" strokeLinecap="round" />
                    </svg>
                    {selectedSort?.label || 'Sort'}
                  </button>

                  {sortMenuOpen ? (
                    <ul className="admin-sort__menu" role="listbox">
                      {ADMIN_SORT_OPTIONS.map((option) => (
                        <li key={option.value} role="none">
                          <button
                            type="button"
                            className="admin-sort__option"
                            role="option"
                            aria-selected={option.value === sortMode}
                            onClick={() => {
                              setSortMode(option.value)
                              setSortMenuOpen(false)
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
                    placeholder="Search"
                    aria-label="Search registrations"
                    value={searchQuery}
                    onChange={(event) => setSearchQuery(event.target.value)}
                  />
                </label>
              </div>

              <div className="admin-table" role="table" aria-label="Registration requests">
                <div className="admin-table__row admin-table__row--head" role="row">
                  <span>Club name</span>
                  <span>Leader</span>
                  <span>Sent date</span>
                  <span>Status</span>
                  <span aria-label="Actions" />
                </div>
                {registrationsLoading ? (
                  <p className="admin-table__empty">Loading registration requests...</p>
                ) : registrationsError ? (
                  <p className="admin-table__empty" style={{ color: 'var(--color-danger, #e53e3e)' }}>
                    {registrationsError}
                  </p>
                ) : (
                  paginatedRequests.map((item) => (
                    <div className="admin-table__row admin-table__row--body" role="row" key={item.id}>
                      <div className="admin-club-cell">
                        <strong>{item.clubName}</strong>
                      </div>
                      <span>{item.leader || item.sender || 'Unknown'}</span>
                      <span>{item.sentDate}</span>
                      <span className="admin-status-actions">
                        <button
                          type="button"
                          className="admin-status-actions__approve"
                          aria-label="Approve request"
                          onClick={() => updateRegistrationRequestStatus(item, 'approved')}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                            <path d="m5 12 4 4L19 6" strokeLinecap="round" strokeLinejoin="round" />
                          </svg>
                        </button>
                        <button
                          type="button"
                          className="admin-status-actions__reject"
                          aria-label="Reject request"
                          onClick={() => updateRegistrationRequestStatus(item, 'rejected')}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" aria-hidden="true">
                            <path d="M18 6 6 18M6 6l12 12" strokeLinecap="round" />
                          </svg>
                        </button>
                      </span>
                      <button
                        type="button"
                        className="admin-view-btn"
                        aria-label={`View ${item.clubName} request`}
                        onClick={() => setDetailRequest(item)}
                      >
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
                          <path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z" />
                          <circle cx="12" cy="12" r="2.6" />
                        </svg>
                      </button>
                    </div>
                  ))
                )}

                {!registrationsLoading && !registrationsError && visibleRequests.length === 0 ? (
                  <p className="admin-table__empty">No registrations match your search or filter.</p>
                ) : null}
              </div>

              <div className="admin-pagination" aria-label="Pagination">
                <button
                  type="button"
                  aria-label="Previous page"
                  disabled={currentPage === 1}
                  onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                    <path d="m15 18-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
                <span>{currentPage}</span>
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={currentPage === pageCount}
                  onClick={() => setCurrentPage((page) => Math.min(pageCount, page + 1))}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" aria-hidden="true">
                    <path d="m9 18 6-6-6-6" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </button>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  )
}

export default AdminDashboardPage
