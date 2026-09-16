import { useMemo, useRef, useState, useEffect, useCallback } from 'react'
import '../../styles/home.css'
import '../../styles/admin-dashboard.css'
import { ADMIN_NAV_ITEMS } from '../../data/mockData'
import fptUniversityLogo from '../../assets/Logo-Dai-hoc-FPT.webp'
import { useConfirm, useToast } from '../../components/common/notificationContext'
import AdminEventRequestsTab from './AdminEventRequestsTab'
import {
  getAdminClubList,
  getAdminClubDetail,
  getClubCreationRequestList,
  reviewClubCreationRequest,
  updateClubStatus,
  updateClub,
  assignManagementRole,
  getClubMembers,
} from '../../api/clubManagement.api'
import { mapAdminClubFromApi, mapCreationRequestFromApi, mapAdminRoleToApi, mapMemberFromApi } from '../../api/clubMappers'

const ADMIN_SORT_OPTIONS = [
  { value: 'all', label: 'All Requests' },
  { value: 'pending', label: 'Pending' },
  { value: 'approved', label: 'Approved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'newest', label: 'Newest date' },
  { value: 'oldest', label: 'Oldest date' },
]

const ADMIN_CLUB_SORT_OPTIONS = [
  { value: '', label: 'All Status' },
  { value: 'active', label: 'Status: Active' },
  { value: 'inactive', label: 'Status: Inactive' },
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
      <path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2" strokeLinecap="round" strokeLinejoin="round" />
      <rect x="9" y="3" width="6" height="4" rx="1" strokeLinejoin="round" />
      <path d="M9 12h6M9 16h4" strokeLinecap="round" />
    </svg>
  ),
  'event-requests': (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" aria-hidden="true">
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" strokeLinecap="round" />
      <path d="m9 15 2 2 4-4" strokeLinecap="round" strokeLinejoin="round" />
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
            <span
              className="home-user-menu__avatar"
              aria-hidden="true"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#ffeedb',
                color: '#ff8e0b',
                fontSize: '15px',
                borderRadius: '50%',
              }}
            >
              🛡
            </span>
            <span className="home-user-menu__name">Student Affairs</span>
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
  const [sortMode, setSortMode] = useState('all')
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [clubSortMenuOpen, setClubSortMenuOpen] = useState(false)
  const [clubSortMode, setClubSortMode] = useState('')
  const [clubSearchQuery, setClubSearchQuery] = useState('')
  const [detailRequest, setDetailRequest] = useState(null)
  const [selectedActiveClub, setSelectedActiveClub] = useState(null)
  const [isUpdateClubModalOpen, setIsUpdateClubModalOpen] = useState(false)
  const [updatingClub, setUpdatingClub] = useState(false)
  const [clubFormData, setClubFormData] = useState({
    name: '',
    category: 'Arts',
    slogan: '',
    description: '',
    logo_url: '',
  })
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
  const [totalPages, setTotalPages] = useState(1)
  const [totalRequests, setTotalRequests] = useState(0)
  const [clubCurrentPage, setClubCurrentPage] = useState(1)
  const sortRef = useRef(null)
  const clubSortRef = useRef(null)
  const logoFileInputRef = useRef(null)
  const selectedSort = ADMIN_SORT_OPTIONS.find((option) => option.value === sortMode)
  const selectedClubSort = ADMIN_CLUB_SORT_OPTIONS.find((option) => option.value === clubSortMode)
  const visibleClubs = useMemo(() => {
    const query = clubSearchQuery.trim().toLowerCase()
    let clubs = activeClubs.filter((item) => {
      if (!query) return true
      return item.clubName.toLowerCase().includes(query)
    })

    if (clubSortMode === 'active') {
      clubs = clubs.filter((c) => (c.status || 'active') === 'active')
    } else if (clubSortMode === 'inactive') {
      clubs = clubs.filter((c) => c.status === 'inactive')
    }

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

  const activeClubLeader = useMemo(() => {
    if (!selectedActiveClub) return 'Unknown'
    if (selectedActiveClub.leader && selectedActiveClub.leader !== 'Unknown') {
      return selectedActiveClub.leader
    }
    const leaderInMembers = (selectedActiveClub.memberList || []).find(
      (m) => m.role === 'Leader' || m.rawRole === 'president' || m.rawRole === 'leader'
    )
    return leaderInMembers?.name || 'Unknown'
  }, [selectedActiveClub])

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
    }, 300)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    setCurrentPage(1)
  }, [debouncedSearchQuery, sortMode])

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

  const fetchRegistrationRequests = useCallback(() => {
    if (activeView !== 'registrations') return
    let cancelled = false
    setRegistrationsLoading(true)
    setRegistrationsError(null)

    getClubCreationRequestList({
      page: currentPage,
      limit: ADMIN_PAGE_SIZE,
      search: debouncedSearchQuery.trim() || undefined,
      status: sortMode || undefined,
    })
      .then((res) => {
        if (cancelled) return
        const payload = res.data || res || {}
        const rawRequests = payload.requests || (Array.isArray(payload) ? payload : [])
        const requests = rawRequests.map(mapCreationRequestFromApi)
        setRegistrationRequests(requests)

        const pagination = payload.pagination || {}
        const calcTotalPages = pagination.total_pages || Math.max(1, Math.ceil((pagination.total ?? requests.length) / ADMIN_PAGE_SIZE))
        setTotalPages(calcTotalPages)
        setTotalRequests(pagination.total ?? requests.length)
      })
      .catch((err) => {
        if (cancelled) return
        setRegistrationsError(err.message || 'Failed to load registration requests')
      })
      .finally(() => {
        if (!cancelled) setRegistrationsLoading(false)
      })

    return () => { cancelled = true }
  }, [activeView, currentPage, debouncedSearchQuery, sortMode])

  useEffect(() => {
    const cleanup = fetchRegistrationRequests()
    return cleanup
  }, [fetchRegistrationRequests])

  useEffect(() => {
    if (totalPages > 0 && currentPage > totalPages) {
      setCurrentPage(totalPages)
    }
  }, [currentPage, totalPages])

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

  async function handleToggleClubStatus(clubId, currentStatus) {
    const nextStatus = currentStatus === 'inactive' ? 'active' : 'inactive'
    const isActivate = nextStatus === 'active'
    const targetClub = activeClubs.find((item) => item.id === clubId) || (selectedActiveClub?.id === clubId ? selectedActiveClub : null)

    const confirmResult = await confirm({
      title: isActivate ? 'Activate club?' : 'Deactivate club?',
      message: isActivate
        ? `Activate ${targetClub?.clubName || 'this club'}? The club will become active and accessible to members.`
        : `Are you sure you want to deactivate ${targetClub?.clubName || 'this club'}? An email notification will be sent to the club leader.`,
      confirmText: isActivate ? 'Activate' : 'Deactivate',
      tone: isActivate ? 'primary' : 'warning',
      hasInput: !isActivate,
      inputLabel: 'Reason for deactivation (will be sent via email to the Club Leader):',
      inputPlaceholder: 'Enter reason for club deactivation (e.g., Policy violation, temporary suspension under directive...)...',
      inputRequired: false,
    })

    if (!confirmResult) return
    const reason = typeof confirmResult === 'object' ? (confirmResult.value || '') : ''

    try {
      await updateClubStatus(clubId, nextStatus, reason)

      setActiveClubs((clubs) =>
        clubs.map((club) =>
          club.id === clubId ? { ...club, status: nextStatus } : club
        )
      )

      setSelectedActiveClub((club) =>
        club && club.id === clubId ? { ...club, status: nextStatus } : club
      )

      showToast({
        type: 'success',
        title: isActivate ? 'Club activated' : 'Club deactivated',
        message: `${targetClub?.clubName || 'The club'} is now ${nextStatus}.`,
      })
    } catch (err) {
      if (String(clubId).startsWith('club-')) {
        setActiveClubs((clubs) =>
          clubs.map((club) =>
            club.id === clubId ? { ...club, status: nextStatus } : club
          )
        )
        setSelectedActiveClub((club) =>
          club && club.id === clubId ? { ...club, status: nextStatus } : club
        )
        showToast({
          type: 'success',
          title: isActivate ? 'Club activated' : 'Club deactivated',
          message: `${targetClub?.clubName || 'The club'} is now ${nextStatus}.`,
        })
        return
      }
      showToast({
        type: 'error',
        title: 'Error',
        message: err.message || 'Failed to update club status',
      })
    }
  }

  function handleOpenUpdateClubModal(club) {
    if (!club) return
    setClubFormData({
      name: club.clubName || club.name || '',
      category: club.category || 'Arts',
      slogan: club.slogan || '',
      description: club.description || '',
      logo_url: club.logoUrl || club.logo_url || '',
    })
    if (logoFileInputRef.current) {
      logoFileInputRef.current.value = ''
    }
    setIsUpdateClubModalOpen(true)
  }

  function handleLogoFileChange(event) {
    const file = event.target.files?.[0]
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      showToast({
        type: 'error',
        title: 'Image Too Large',
        message: 'Image size must not exceed 5MB.',
      })
      return
    }

    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setClubFormData((prev) => ({ ...prev, logo_url: reader.result }))
      }
    }
    reader.readAsDataURL(file)
  }

  function handleRemoveLogo() {
    setClubFormData((prev) => ({ ...prev, logo_url: '' }))
    if (logoFileInputRef.current) {
      logoFileInputRef.current.value = ''
    }
  }

  async function handleUpdateClubSubmit(e) {
    e.preventDefault()
    if (!selectedActiveClub?.id) return

    if (!clubFormData.name.trim()) {
      showToast({
        type: 'error',
        title: 'Validation error',
        message: 'Club name cannot be empty.',
      })
      return
    }

    setUpdatingClub(true)
    try {
      const payload = {
        name: clubFormData.name.trim(),
        category: clubFormData.category,
        slogan: clubFormData.slogan.trim(),
        description: clubFormData.description.trim(),
        logo_url: clubFormData.logo_url.trim(),
      }

      const res = await updateClub(selectedActiveClub.id, payload)
      const apiClub = res?.data?.club || res?.data || res?.club || {}

      const updatedName = apiClub.name || payload.name
      const updatedCategory = apiClub.category || payload.category
      const updatedSlogan = apiClub.slogan || payload.slogan
      const updatedDesc = apiClub.description || payload.description
      const updatedLogo = apiClub.logo_url || payload.logo_url

      setActiveClubs((clubs) =>
        clubs.map((club) =>
          club.id === selectedActiveClub.id
            ? {
                ...club,
                clubName: updatedName,
                name: updatedName,
                category: updatedCategory,
                slogan: updatedSlogan,
                description: updatedDesc,
                logoUrl: updatedLogo,
              }
            : club
        )
      )

      setSelectedActiveClub((prev) =>
        prev
          ? {
              ...prev,
              clubName: updatedName,
              name: updatedName,
              category: updatedCategory,
              slogan: updatedSlogan,
              description: updatedDesc,
              logoUrl: updatedLogo,
            }
          : prev
      )

      setIsUpdateClubModalOpen(false)
      showToast({
        type: 'success',
        title: 'Club updated',
        message: `${updatedName} has been successfully updated.`,
      })
    } catch (err) {
      showToast({
        type: 'error',
        title: 'Update failed',
        message: err.message || 'Failed to update club information',
      })
    } finally {
      setUpdatingClub(false)
    }
  }

  async function handleDeleteClub(clubId) {
    const targetClub = activeClubs.find((item) => item.id === clubId) || (selectedActiveClub?.id === clubId ? selectedActiveClub : null)
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
      fetchRegistrationRequests()
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
              <strong>{activeClubLeader}</strong>
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
              <strong className={`admin-badge-status admin-badge-status--${selectedActiveClub.status || 'active'}`}>
                {formatStatusLabel(selectedActiveClub.status || 'active')}
              </strong>
            </div>
            <div className="admin-detail-field admin-detail-field--wide">
              <span>Description</span>
              <strong>{selectedActiveClub.description}</strong>
            </div>
          </div>

          <div className="admin-detail-actions admin-club-detail-actions">
            <button
              type="button"
              className={selectedActiveClub.status === 'inactive' ? 'admin-detail-approve' : 'admin-detail-deactivate'}
              onClick={() => handleToggleClubStatus(selectedActiveClub.id, selectedActiveClub.status || 'active')}
            >
              {selectedActiveClub.status === 'inactive' ? (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <path d="M18.36 6.64a9 9 0 1 1-12.73 0M12 2v10" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  Activate Club
                </>
              ) : (
                <>
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="4.93" y1="4.93" x2="19.07" y2="19.07" strokeLinecap="round" />
                  </svg>
                  Deactivate Club
                </>
              )}
            </button>
            <button
              type="button"
              className="admin-detail-update"
              onClick={() => handleOpenUpdateClubModal(selectedActiveClub)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Update Club
            </button>
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
                  <strong className={`admin-badge-status admin-badge-status--${item.status === 'inactive' ? 'inactive' : 'active'}`}>
                    {item.status === 'inactive' ? 'Inactive' : 'Active'}
                  </strong>
                </span>
                <span className="admin-row-actions">
                  <button
                    type="button"
                    className="admin-view-btn"
                    title={`View ${item.clubName}`}
                    aria-label={`View ${item.clubName}`}
                    onClick={async () => {
                      setSelectedActiveClub(item)
                      setIsManagingMembers(false)
                      try {
                        const [detailRes, membersRes] = await Promise.allSettled([
                          getAdminClubDetail(item.id),
                          getClubMembers(item.id),
                        ])

                        let updatedDetail = item
                        if (detailRes.status === 'fulfilled' && (detailRes.value?.data || detailRes.value?.club)) {
                          const rawData = detailRes.value.data || detailRes.value.club
                          updatedDetail = { ...item, ...mapAdminClubFromApi(rawData) }
                        }

                        let fetchedMembers = item.memberList || []
                        if (membersRes.status === 'fulfilled') {
                          fetchedMembers = (membersRes.value.data?.members || []).map((m, idx) => mapMemberFromApi(m, idx))
                        }

                        const leaderFromMembers = fetchedMembers.find(
                          (m) => m.role === 'Leader' || m.rawRole === 'president' || m.rawRole === 'leader'
                        )?.name

                        const finalLeader =
                          updatedDetail.leader && updatedDetail.leader !== 'Unknown'
                            ? updatedDetail.leader
                            : (leaderFromMembers || item.leader || 'Unknown')

                        setSelectedActiveClub({
                          ...updatedDetail,
                          leader: finalLeader,
                          memberList: fetchedMembers,
                        })

                        if (finalLeader !== 'Unknown') {
                          setActiveClubs((clubs) =>
                            clubs.map((c) => (c.id === item.id ? { ...c, leader: finalLeader } : c))
                          )
                        }
                      } catch (err) {
                        console.error('Failed to load club details or members:', err)
                      }
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

  function renderUpdateClubModal() {
    if (!isUpdateClubModalOpen || !selectedActiveClub) return null

    return (
      <div
        className="admin-modal-overlay"
        role="dialog"
        aria-modal="true"
        aria-labelledby="update-club-title"
      >
        <button
          type="button"
          className="admin-modal-backdrop"
          aria-label="Close modal overlay"
          onClick={() => !updatingClub && setIsUpdateClubModalOpen(false)}
        />
        <div className="admin-modal-card admin-update-club-modal">
          <div className="admin-modal-header">
            <div className="admin-modal-header__title">
              <div className="admin-modal-icon-badge">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <h3 id="update-club-title">Update Club Information</h3>
                <p>Modify details for <strong>{selectedActiveClub.clubName}</strong></p>
              </div>
            </div>
            <button
              type="button"
              className="admin-modal-close"
              aria-label="Close modal"
              disabled={updatingClub}
              onClick={() => setIsUpdateClubModalOpen(false)}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="18" y1="6" x2="6" y2="18" strokeLinecap="round" strokeLinejoin="round" />
                <line x1="6" y1="6" x2="18" y2="18" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <form onSubmit={handleUpdateClubSubmit} className="admin-modal-form">
            <div className="admin-form-group">
              <label htmlFor="club-name-input">
                Club Name <span className="admin-form-required">*</span>
              </label>
              <input
                id="club-name-input"
                type="text"
                className="admin-form-input"
                value={clubFormData.name}
                onChange={(e) => setClubFormData((prev) => ({ ...prev, name: e.target.value }))}
                placeholder="e.g. F-Coder Club"
                required
                disabled={updatingClub}
              />
            </div>

            <div className="admin-form-row">
              <div className="admin-form-group">
                <label htmlFor="club-category-select">
                  Category <span className="admin-form-required">*</span>
                </label>
                <select
                  id="club-category-select"
                  className="admin-form-select"
                  value={clubFormData.category}
                  onChange={(e) => setClubFormData((prev) => ({ ...prev, category: e.target.value }))}
                  disabled={updatingClub}
                >
                  <option value="Academic">Academic</option>
                  <option value="Arts">Arts</option>
                  <option value="Sports">Sports</option>
                  <option value="Event">Event</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="admin-form-group">
                <label htmlFor="club-slogan-input">Slogan</label>
                <input
                  id="club-slogan-input"
                  type="text"
                  className="admin-form-input"
                  value={clubFormData.slogan}
                  onChange={(e) => setClubFormData((prev) => ({ ...prev, slogan: e.target.value }))}
                  placeholder="e.g. Code your future"
                  disabled={updatingClub}
                />
              </div>
            </div>

            <div className="admin-form-group">
              <label>Club Logo</label>
              <input
                ref={logoFileInputRef}
                type="file"
                accept="image/*"
                style={{ display: 'none' }}
                onChange={handleLogoFileChange}
                disabled={updatingClub}
              />
              <div className="admin-logo-upload-box">
                {clubFormData.logo_url ? (
                  <div className="admin-logo-uploaded-preview">
                    <img
                      src={clubFormData.logo_url}
                      alt="Club Logo Preview"
                      className="admin-logo-uploaded-img"
                    />
                    <div className="admin-logo-uploaded-info">
                      <span className="admin-logo-uploaded-label">Current logo</span>
                      <div className="admin-logo-uploaded-actions">
                        <button
                          type="button"
                          className="admin-logo-btn-change"
                          onClick={() => logoFileInputRef.current?.click()}
                          disabled={updatingClub}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="17 8 12 3 7 8" />
                            <line x1="12" y1="3" x2="12" y2="15" />
                          </svg>
                          Change image
                        </button>
                        <button
                          type="button"
                          className="admin-logo-btn-remove"
                          onClick={handleRemoveLogo}
                          disabled={updatingClub}
                        >
                          Remove image
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="admin-logo-dropzone"
                    onClick={() => logoFileInputRef.current?.click()}
                    role="button"
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        logoFileInputRef.current?.click()
                      }
                    }}
                  >
                    <div className="admin-logo-dropzone__icon">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="8.5" cy="8.5" r="1.5" />
                        <polyline points="21 15 16 10 5 21" />
                      </svg>
                    </div>
                    <div className="admin-logo-dropzone__text">
                      <strong>Upload logo from computer</strong>
                      <span>Supports PNG, JPG, WebP (Max 5MB)</span>
                    </div>
                    <button
                      type="button"
                      className="admin-logo-dropzone__btn"
                      onClick={(e) => {
                        e.stopPropagation()
                        logoFileInputRef.current?.click()
                      }}
                      disabled={updatingClub}
                    >
                      Browse file
                    </button>
                  </div>
                )}
              </div>
            </div>

            <div className="admin-form-group">
              <label htmlFor="club-desc-input">Description</label>
              <textarea
                id="club-desc-input"
                rows="4"
                className="admin-form-textarea"
                value={clubFormData.description}
                onChange={(e) => setClubFormData((prev) => ({ ...prev, description: e.target.value }))}
                placeholder="Detailed description of the club..."
                disabled={updatingClub}
              />
            </div>

            <div className="admin-modal-actions">
              <button
                type="button"
                className="admin-btn-secondary"
                disabled={updatingClub}
                onClick={() => setIsUpdateClubModalOpen(false)}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="admin-btn-primary"
                disabled={updatingClub}
              >
                {updatingClub ? (
                  <>
                    <span className="admin-spinner" aria-hidden="true" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </button>
            </div>
          </form>
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
                    <span>Total members</span>
                    <strong>{detailRequest.memberCount ?? 0}</strong>
                  </div>
                  <div className="admin-detail-field">
                    <span>Confirmed members</span>
                    <strong style={{ color: (detailRequest.acceptedCount ?? 0) >= 10 ? '#16a34a' : '#d97706' }}>
                      {detailRequest.acceptedCount ?? 0} / {detailRequest.memberCount ?? 0} confirmed
                    </strong>
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

                {detailRequest.members && detailRequest.members.length > 0 && (
                  <div style={{ marginTop: '1.25rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1e293b', marginBottom: '0.5rem' }}>
                      Founding Members Confirmation ({detailRequest.acceptedCount ?? 0}/{detailRequest.members.length})
                    </h4>
                    <div style={{ maxHeight: '180px', overflowY: 'auto', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
                      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.82rem' }}>
                        <thead>
                          <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', textAlign: 'left' }}>
                            <th style={{ padding: '6px 10px' }}>Full Name</th>
                            <th style={{ padding: '6px 10px' }}>Email / Student Code</th>
                            <th style={{ padding: '6px 10px' }}>Confirmation</th>
                          </tr>
                        </thead>
                        <tbody>
                          {detailRequest.members.map((m, idx) => {
                            const u = m.user_id || {}
                            return (
                              <tr key={idx} style={{ borderBottom: '1px solid #f1f5f9' }}>
                                <td style={{ padding: '6px 10px', fontWeight: 600 }}>{u.full_name || 'Student'}</td>
                                <td style={{ padding: '6px 10px', color: '#64748b' }}>{u.student_code || u.email || '-'}</td>
                                <td style={{ padding: '6px 10px' }}>
                                  {m.status === 'accepted' ? (
                                    <span style={{ color: '#16a34a', fontWeight: 600 }}>Accepted</span>
                                  ) : m.status === 'rejected' ? (
                                    <span style={{ color: '#dc2626', fontWeight: 600 }}>Rejected</span>
                                  ) : (
                                    <span style={{ color: '#d97706', fontWeight: 600 }}>Pending</span>
                                  )}
                                </td>
                              </tr>
                            )
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {detailRequest.status === 'pending' ? (
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
                ) : (
                  <div className="admin-detail-actions">
                    <span style={{ fontSize: '0.88rem', color: '#64748b', fontWeight: 700 }}>
                      This registration request is currently <strong className={`admin-badge-status admin-badge-status--${detailRequest.status}`}>{formatStatusLabel(detailRequest.status)}</strong>
                    </span>
                  </div>
                )}
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
                    placeholder="Search by club name or category..."
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
                  registrationRequests.map((item) => (
                    <div className="admin-table__row admin-table__row--body" role="row" key={item.id}>
                      <div className="admin-club-cell">
                        <strong>{item.clubName}</strong>
                        {item.category && item.category !== 'Not specified' ? (
                          <span style={{ fontSize: '0.72rem', color: '#4f46e5', fontWeight: 600 }}>
                            {item.category}
                          </span>
                        ) : null}
                      </div>
                      <span>{item.leader || item.sender || 'Unknown'}</span>
                      <span>{item.sentDate}</span>
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
                              title="Approve request"
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
                              title="Reject request"
                              aria-label="Reject request"
                              onClick={() => updateRegistrationRequestStatus(item, 'rejected')}
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
                          title={`View ${item.clubName} request`}
                          aria-label={`View ${item.clubName} request`}
                          onClick={() => setDetailRequest(item)}
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

                {!registrationsLoading && !registrationsError && registrationRequests.length === 0 ? (
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
                <span>{currentPage} / {totalPages}</span>
                <button
                  type="button"
                  aria-label="Next page"
                  disabled={currentPage >= totalPages}
                  onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
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
      {renderUpdateClubModal()}
    </div>
  )
}

export default AdminDashboardPage
