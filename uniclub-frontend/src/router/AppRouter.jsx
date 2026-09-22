import { useState, useEffect, lazy, Suspense } from 'react'
import { Routes, Route, Navigate, useNavigate, useParams, useLocation } from 'react-router-dom'

import HomeLayout from '../layouts/HomeLayout'
import LogoutConfirmModal from '../components/common/LogoutConfirmModal'

// Lazy-loaded pages for optimized code splitting and smooth page transitions
const LoginPage = lazy(() => import('../pages/auth/LoginPage'))
const AuthCallbackPage = lazy(() => import('../pages/auth/AuthCallbackPage'))
const HomePage = lazy(() => import('../pages/home/HomePage'))
const MyProfilePage = lazy(() => import('../pages/home/MyProfilePage'))
const MyRequestsPage = lazy(() => import('../pages/home/MyRequestsPage'))
const MyClubsPage = lazy(() => import('../pages/home/MyClubsPage'))
const CreateClubPage = lazy(() => import('../pages/home/CreateClubPage'))
const ClubsPage = lazy(() => import('../pages/home/ClubsPage'))
const EventsPage = lazy(() => import('../pages/home/EventsPage'))
const EventDetailPage = lazy(() => import('../pages/home/EventDetailPage'))
const ClubDetailPage = lazy(() => import('../pages/home/ClubDetailPage'))
const ClubEventsPage = lazy(() => import('../pages/home/ClubEventsPage'))
const ClubEventManagementPage = lazy(() => import('../pages/home/ClubEventManagementPage'))
const ClubRankingPage = lazy(() => import('../pages/home/ClubRankingPage'))
const ClubJoinRequestsPage = lazy(() => import('../pages/home/ClubJoinRequestsPage'))
const ClubJoinFormPage = lazy(() => import('../pages/home/ClubJoinFormPage'))
const ClubAttendancePage = lazy(() => import('../pages/home/ClubAttendancePage'))
const ClubPointRulesPage = lazy(() => import('../pages/home/ClubPointRulesPage'))
const ClubRewardsPage = lazy(() => import('../pages/home/ClubRewardsPage'))
const ActivitySchedulePage = lazy(() => import('../pages/home/ActivitySchedulePage'))
const ActivityAttendancePage = lazy(() => import('../pages/home/ActivityAttendancePage'))
const MyEventsPage = lazy(() => import('../pages/home/MyEventsPage'))
const ClubInvitationsPage = lazy(() => import('../pages/home/ClubInvitationsPage'))
const ClubPollsPage = lazy(() => import('../pages/home/ClubPollsPage'))
const ClubFinancePage = lazy(() => import('../pages/home/ClubFinancePage'))
const AdminDashboardPage = lazy(() => import('../pages/admin/AdminDashboardPage'))
const ClubFeesPage = lazy(() => import('../pages/home/ClubFeesPage'))
const ClubReceiptDetailPage = lazy(() => import('../pages/home/ClubReceiptDetailPage'))
const PaymentReturnPage = lazy(() => import('../pages/auth/PaymentReturnPage'))
const ApiTestPage = lazy(() => import('../pages/ApiTestPage'))


import { CURRENT_USER } from '../data/mockData'
import { getMyProfile } from '../api/profile.api'
import { getMyClubs } from '../api/memberClubMembership.api'
import { apiRequest, invalidateApiCache } from '../api/api'


function ProtectedLayout({
  pageId,
  activeItem = null,
  clubId = null,
  canManageMembers = false,
  canManageInvitations = false,
  canManageEvents = false,
  canManageSchedule = false,
  canViewFees = false,
  canManagePolls = false,
  canManageFinance = false,
  children,
}) {
  const navigate = useNavigate()
  const isAuthenticated = Boolean(localStorage.getItem('token'))
  const [currentUser, setCurrentUser] = useState(() => {
    if (isAuthenticated) {
      return { fullName: '', email: '', avatarUrl: '', avatarInitial: '', role: '' }
    }
    return CURRENT_USER
  })
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  useEffect(() => {
    let active = true
    async function loadUser() {
      try {
        const res = await getMyProfile()
        if (active) {
          const user = res.data.user
          const profileData = res.data.profile
          const localAvatar = user._id ? localStorage.getItem(`uniclub_custom_avatar_${user._id}`) : ''
          setCurrentUser({
            id: user._id,
            fullName: user.full_name || '',
            email: user.email || '',
            avatarUrl: profileData?.avatar || user.avatar_url || localAvatar || '',
            avatarInitial: user.full_name?.slice(0, 1).toUpperCase() || 'U',
            role: user.role || 'UniClub member',
          })
        }
      } catch (err) {
        console.error("Failed to load user profile in ProtectedLayout:", err)
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          localStorage.removeItem('token')
          invalidateApiCache()
          window.location.href = '/login'
        }
      }
    }
    if (isAuthenticated) {
      loadUser()
    }
    return () => { active = false }
  }, [isAuthenticated])

  const handleLogout = () => {
    setShowLogoutModal(true)
  }

  const doConfirmLogout = async () => {
    setIsLoggingOut(true)
    try {
      // Gọi API logout lên backend
      await apiRequest('/auth/logout', {
        method: 'POST',
      })
    } catch (error) {
      // Xử lý ngoại lệ A2: Nếu mất mạng / lỗi server, client vẫn dọn dẹp local token
      console.warn('Network error during logout, fallback to local cleanup:', error)
    } finally {
      // Đảm bảo luôn xóa token và làm mới trang Login sạch sẽ
      localStorage.removeItem('token')
      invalidateApiCache()
      window.location.href = '/login'
    }
  }

  const handleNavigate = (screen) => {
    if (screen === 'profile') navigate('/profile')
    else if (screen === 'requests') navigate('/my-requests')
    else if (screen === 'my-clubs') navigate('/my-clubs')
    else if (screen === 'create-club') navigate('/create-club')
    else if (screen === 'clubs') navigate('/clubs')
    else if (screen === 'events') navigate('/events')
    else if (screen === 'club-detail') navigate(clubId ? `/clubs/${clubId}` : '/clubs')
    else if (screen === 'club-ranking') navigate(clubId ? `/clubs/${clubId}/ranking` : '/club-ranking')
    else if (screen === 'point-rules' && clubId) navigate(`/clubs/${clubId}/point-rules`)
    else if (screen === 'point-rules') navigate('/my-clubs')
    else if (screen === 'rewards' && clubId) navigate(`/clubs/${clubId}/rewards`)
    else if (screen === 'activity-schedule' && clubId) navigate(`/clubs/${clubId}/activity-schedule`)
    else if (screen === 'manage-activity-schedule' && clubId) {
      navigate(`/clubs/${clubId}/manage-activity-schedule`)
    }
    else if (screen === 'member-approval' && clubId) navigate(`/clubs/${clubId}/join-requests`)
    else if (screen === 'invitations' && clubId) navigate(`/clubs/${clubId}/invitations`)
    else if (screen === 'polls' && clubId) navigate(`/clubs/${clubId}/polls`)
    else if (screen === 'finance' && clubId) navigate(`/clubs/${clubId}/finance`)
    else if (screen === 'join-form' && clubId) navigate(`/clubs/${clubId}/join-form`)
    else if (screen === 'manage-events' && clubId) navigate(`/clubs/${clubId}/manage-events`)
    else if (screen === 'attendance' && clubId) navigate(`/clubs/${clubId}/attendance`)
    else if (screen === 'fees' && clubId) navigate(`/clubs/${clubId}/fees`)
    else if (screen === 'fees') navigate('/my-fees')
    else navigate('/')


  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  return (
    <>
      <HomeLayout
        activeItem={activeItem}
        pageId={pageId}
        currentUser={currentUser}
        onNavigate={handleNavigate}
        onLogout={handleLogout}
        canManageMembers={canManageMembers}
        canManageInvitations={canManageInvitations}
        canManageEvents={canManageEvents}
        canManageSchedule={canManageSchedule}
        canViewFees={canViewFees}
        canManagePolls={canManagePolls}
        canManageFinance={canManageFinance}
      >
        {children}
      </HomeLayout>

      <LogoutConfirmModal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        onConfirm={doConfirmLogout}
        isLoggingOut={isLoggingOut}
      />
    </>
  )
}

function RouteLoading({
  message = 'Authenticating Permissions',
  subtitle = 'Verifying your club membership and access role...',
}) {
  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          padding: '2.5rem 2.75rem',
          background: '#ffffff',
          borderRadius: '24px',
          boxShadow: '0 20px 50px rgba(245, 124, 0, 0.08), 0 4px 16px rgba(0, 0, 0, 0.03)',
          border: '1px solid rgba(245, 124, 0, 0.12)',
          maxWidth: '420px',
          width: '100%',
          textAlign: 'center',
          position: 'relative',
          overflow: 'hidden',
          animation: 'routeLoadingFadeIn 0.25s ease-out',
        }}
      >
        {/* Top glowing progress line */}
        <div
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            height: '3.5px',
            background: 'linear-gradient(90deg, #F57C00, #ff9f2f, #ea580c, #F57C00)',
            backgroundSize: '200% 100%',
            animation: 'routeLoadingGradient 1.8s linear infinite',
          }}
        />

        {/* Animated Badge / Shield Spinner */}
        <div style={{ position: 'relative', width: '64px', height: '64px', marginBottom: '1.25rem' }}>
          <div
            style={{
              position: 'absolute',
              inset: 0,
              borderRadius: '50%',
              border: '3px solid rgba(245, 124, 0, 0.14)',
              borderTopColor: '#F57C00',
              borderRightColor: '#ff9f2f',
              animation: 'routeLoadingSpin 0.85s cubic-bezier(0.55, 0.15, 0.45, 0.85) infinite',
            }}
          />
          <div
            style={{
              position: 'absolute',
              inset: '7px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #fff8f0 0%, #ffe9d6 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ea580c',
              boxShadow: 'inset 0 1px 2px rgba(255, 255, 255, 0.8)',
            }}
          >
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
              <path d="M9 12l2 2 4-4" />
            </svg>
          </div>
        </div>

        <h3
          style={{
            margin: '0 0 0.4rem',
            color: '#1e293b',
            fontSize: '1.06rem',
            fontWeight: 800,
            letterSpacing: '-0.01em',
          }}
        >
          {message}
        </h3>

        <p
          style={{
            margin: 0,
            color: '#64748b',
            fontSize: '0.86rem',
            lineHeight: 1.5,
            fontWeight: 500,
          }}
        >
          {subtitle}
        </p>

        <style>{`
          @keyframes routeLoadingSpin {
            to { transform: rotate(360deg); }
          }
          @keyframes routeLoadingGradient {
            0% { background-position: 0% 50%; }
            100% { background-position: 200% 50%; }
          }
          @keyframes routeLoadingFadeIn {
            from { opacity: 0; transform: translateY(6px); }
            to { opacity: 1; transform: translateY(0); }
          }
        `}</style>
      </div>
    </div>
  )
}

function ClubRoute({ pageId, guard = 'member', children }) {
  const { clubId } = useParams()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(true)
  const [membership, setMembership] = useState(null)

  useEffect(() => {
    let active = true
    async function checkAccess() {
      try {
        const res = await getMyClubs()
        if (!active) return
        const list = res.data || []
        
        // Find membership matching clubId (supporting ObjectId, string or club name/slug)
        const found = list.find(item => {
          const id = item.club_id?._id || item.club_id
          const name = item.club_id?.name || ''
          return (
            String(id) === String(clubId) ||
            (name && name.toLowerCase().includes(String(clubId).toLowerCase()))
          )
        })

        if (found) {
          setMembership({
            clubId,
            role: found.role,
            joinedDate: found.joined_at || found.joinedDate || ''
          })
        } else {
          setMembership(null)
        }
      } catch (err) {
        console.error("Failed to fetch clubs membership:", err)
        if (active) {
          setMembership(null)
        }
      } finally {
        if (active) setLoading(false)
      }
    }

    checkAccess()
    return () => { active = false }
  }, [clubId])

  if (loading) {
    return (
      <RouteLoading
        message="Authenticating Permissions"
        subtitle="Verifying your club membership and access role..."
      />
    )
  }

  // Calculate permissions based on dynamic membership
  const role = membership?.role?.toLowerCase()
  const isMember = Boolean(membership)
  
  // Back-end roles: president, secretary, event_manager, treasurer, member
  // Front-end mock roles: leader, vice leader, event management, secretary, member
  const canManageMembers = role === 'president' || role === 'leader'
  const canManageEvents = role === 'president' || role === 'leader' || role === 'event_manager' || role === 'event management'
  const canManageSchedule = role === 'president' || role === 'secretary' || role === 'leader'
  const canViewFees = isMember
  const canManagePolls = role === 'president' || role === 'leader' || role === 'secretary'
  const canManageFinance = role === 'president' || role === 'leader' || role === 'treasurer'
  const canManageInvitations = role === 'president' || role === 'leader' || role === 'secretary'

  const isAllowed =
    guard === 'member'
      ? canViewFees
      : guard === 'leader'
        ? canManageMembers
        : guard === 'event-manager'
          ? canManageEvents
          : guard === 'secretary'
            ? canManageSchedule || canManagePolls || canManageInvitations
            : guard === 'treasurer'
              ? canManageFinance
              : true

  if (!isAllowed) {
    return <Navigate to={`/clubs/${clubId}`} replace />
  }

  return (
    <ProtectedLayout
      pageId={pageId}
      activeItem="clubs"
      clubId={clubId}
      canManageMembers={canManageMembers}
      canManageInvitations={canManageInvitations}
      canManageEvents={canManageEvents}
      canManageSchedule={canManageSchedule}
      canViewFees={canViewFees}
      canManagePolls={canManagePolls}
      canManageFinance={canManageFinance}
    >
      {children({
        clubId,
        membership,
        navigate,
        canManageRewards: role === 'president' || role === 'leader' || role === 'vice leader',
        canManageSchedule,
        canManagePolls,
        canManageInvitations,
      })}
    </ProtectedLayout>
  )
}


function ClubDetailRoute() {
  return (
    <ClubRoute pageId="club-detail" guard="none">
      {({ clubId, navigate }) => (
        <ClubDetailPage
          key={clubId}
          clubId={clubId}
          onBack={() => navigate('/clubs')}
        />
      )}
    </ClubRoute>
  )
}

function ClubRankingRoute() {
  return (
    <ClubRoute pageId="club-ranking" guard="member">
      {({ clubId }) => <ClubRankingPage clubId={clubId} />}
    </ClubRoute>
  )
}

function ClubJoinRequestsRoute() {
  return (
    <ClubRoute pageId="member-approval" guard="leader">
      {({ clubId }) => <ClubJoinRequestsPage clubId={clubId} />}
    </ClubRoute>
  )
}

function ClubInvitationsRoute() {
  return (
    <ClubRoute pageId="invitations" guard="secretary">
      {({ clubId }) => <ClubInvitationsPage clubId={clubId} />}
    </ClubRoute>
  )
}

function ClubPollsRoute() {
  return (
    <ClubRoute pageId="polls" guard="member">
      {({ clubId, canManagePolls, membership }) => (
        <ClubPollsPage
          clubId={clubId}
          canManagePolls={canManagePolls}
          userRole={membership?.role?.toLowerCase()}
        />
      )}
    </ClubRoute>
  )
}

function ClubFinanceRoute() {
  return (
    <ClubRoute pageId="finance" guard="treasurer">
      {({ clubId, membership }) => <ClubFinancePage clubId={clubId} userRole={membership?.role?.toLowerCase()} />}
    </ClubRoute>
  )
}

function ClubJoinFormRoute() {
  return (
    <ClubRoute pageId="join-form" guard="leader">
      {({ clubId }) => <ClubJoinFormPage clubId={clubId} />}
    </ClubRoute>
  )
}

function ClubEventsRoute() {
  return (
    <ClubRoute pageId="club-events" guard="member">
      {() => <ClubEventsPage />}
    </ClubRoute>
  )
}

function ClubEventManagementRoute() {
  return (
    <ClubRoute pageId="manage-events" guard="event-manager">
      {({ clubId }) => <ClubEventManagementPage clubId={clubId} />}
    </ClubRoute>
  )
}

function ClubAttendanceRoute() {
  return (
    <ClubRoute pageId="attendance" guard="event-manager">
      {({ clubId }) => <ClubAttendancePage clubId={clubId} />}
    </ClubRoute>
  )
}

function ClubPointRulesRoute() {
  return (
    <ClubRoute pageId="point-rules" guard="member">
      {({ clubId, canManageRewards }) => (
        <ClubPointRulesPage clubId={clubId} isLeader={canManageRewards} />
      )}
    </ClubRoute>
  )
}

function ClubRewardsRoute() {
  return (
    <ClubRoute pageId="rewards" guard="member">
      {({ canManageRewards }) => (
        <ClubRewardsPage isManager={canManageRewards} />
      )}
    </ClubRoute>
  )
}

function ClubActivityScheduleRoute() {
  return (
    <ClubRoute pageId="activity-schedule" guard="member">
      {({ clubId }) => (
        <ActivitySchedulePage clubId={clubId} isSecretary={false} />
      )}
    </ClubRoute>
  )
}

function ClubManageActivityScheduleRoute() {
  return (
    <ClubRoute pageId="manage-activity-schedule" guard="secretary">
      {({ clubId }) => (
        <ActivitySchedulePage clubId={clubId} isSecretary />
      )}
    </ClubRoute>
  )
}

function ClubActivityAttendanceRoute() {
  return (
    <ClubRoute pageId="manage-activity-schedule" guard="secretary">
      {() => <ActivityAttendancePage />}
    </ClubRoute>
  )
}

function ClubFeesRoute() {
  return (
    <ClubRoute pageId="fees" guard="member">
      {({ clubId }) => <ClubFeesPage clubId={clubId} />}
    </ClubRoute>
  )
}

function ClubReceiptRoute() {
  return (
    <ClubRoute pageId="fees" guard="member">
      {({ clubId }) => <ClubReceiptDetailPage clubId={clubId} />}
    </ClubRoute>
  )
}


function ScrollToTop() {
  const { pathname } = useLocation()

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: 'instant' })
  }, [pathname])

  return null
}

function AppRouter() {
  const navigate = useNavigate()
  const isAuthenticated = Boolean(localStorage.getItem('token'))
  const [showAdminLogout, setShowAdminLogout] = useState(false)
  const [adminLoggingOut, setAdminLoggingOut] = useState(false)

  const handleAdminLogout = async () => {
    setAdminLoggingOut(true)
    try {
      await apiRequest('/auth/logout', { method: 'POST' })
    } catch (e) {
      console.warn('Network error during admin logout:', e)
    } finally {
      localStorage.removeItem('token')
      invalidateApiCache()
      window.location.href = '/login'
    }
  }

  useEffect(() => {
    const handleOffline = () => {
      if (localStorage.getItem('token')) {
        console.warn('Network lost! Auto clearing token and redirecting to login...')
        localStorage.removeItem('token')
        invalidateApiCache()
        window.location.href = '/login'
      }
    }

    // Nếu lúc mount/F5 mà đang offline
    if (typeof navigator !== 'undefined' && !navigator.onLine && localStorage.getItem('token')) {
      handleOffline()
    }

    window.addEventListener('offline', handleOffline)
    return () => {
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return (
    <>
      <ScrollToTop />
      <Suspense fallback={<RouteLoading message="Loading Page..." subtitle="Preparing page resources..." />}>
        <Routes>
      <Route
        path="/login"
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />}
      />

      <Route path="/auth/callback" element={<AuthCallbackPage />} />

      <Route
        path="/"
        element={
          <ProtectedLayout pageId="home">
            <HomePage
              onCreateClub={() => navigate('/create-club')}
              onSelectClub={(clubId) => navigate(`/clubs/${clubId}`)}
              onSelectEvent={(eventId) => navigate(`/events/${eventId}`)}
              onViewAll={(target) =>
                navigate(target === 'events' ? '/events' : '/clubs')
              }
            />
          </ProtectedLayout>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedLayout pageId="profile">
            <MyProfilePage currentUser={null} />
          </ProtectedLayout>
        }
      />

      <Route
        path="/my-events"
        element={
          <ProtectedLayout pageId="my-events" activeItem="events">
            <MyEventsPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/my-fees"
        element={
          <ProtectedLayout pageId="fees" activeItem="clubs">
            <ClubFeesPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/my-requests"

        element={
          <ProtectedLayout pageId="requests">
            <MyRequestsPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/my-clubs"
        element={
          <ProtectedLayout pageId="my-clubs" activeItem="clubs">
            <MyClubsPage
              onSelectClub={(clubId) => navigate(`/clubs/${clubId}`)}
            />
          </ProtectedLayout>
        }
      />

      <Route
        path="/create-club"
        element={
          <ProtectedLayout pageId="create-club">
            <CreateClubPage
              onCancel={() => navigate('/')}
              onSubmit={() => navigate('/')}
            />
          </ProtectedLayout>
        }
      />

      <Route
        path="/clubs"
        element={
          <ProtectedLayout pageId="clubs" activeItem="clubs">
            <ClubsPage
              onSelectClub={(clubId) => navigate(`/clubs/${clubId}`)}
            />
          </ProtectedLayout>
        }
      />

      <Route
        path="/events"
        element={
          <ProtectedLayout pageId="events" activeItem="events">
            <EventsPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/events/:eventId"
        element={
          <ProtectedLayout pageId="event-detail" activeItem="events">
            <EventDetailPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/clubs/:clubId/events/:eventId"
        element={
          <ClubRoute pageId="event-detail" guard="member">
            {() => <EventDetailPage />}
          </ClubRoute>
        }
      />

      <Route path="/payment/return" element={<PaymentReturnPage />} />
      <Route path="/clubs/:clubId/fees" element={<ClubFeesRoute />} />
      <Route path="/clubs/:clubId/receipts/:receiptId" element={<ClubReceiptRoute />} />
      <Route
        path="/clubs/my-fees/receipts/:receiptId"
        element={
          <ProtectedLayout pageId="fees" activeItem="clubs">
            <ClubReceiptDetailPage />
          </ProtectedLayout>
        }
      />
      <Route path="/clubs/:clubId/ranking" element={<ClubRankingRoute />} />
      <Route path="/clubs/:clubId/join-requests" element={<ClubJoinRequestsRoute />} />
      <Route path="/clubs/:clubId/invitations" element={<ClubInvitationsRoute />} />
      <Route path="/clubs/:clubId/polls" element={<ClubPollsRoute />} />
      <Route path="/clubs/:clubId/finance" element={<ClubFinanceRoute />} />
      <Route path="/clubs/:clubId/join-form" element={<ClubJoinFormRoute />} />
      <Route path="/clubs/:clubId/manage-events" element={<ClubEventManagementRoute />} />
      <Route path="/clubs/:clubId/attendance" element={<ClubAttendanceRoute />} />
      <Route path="/clubs/:clubId/point-rules" element={<ClubPointRulesRoute />} />
      <Route path="/clubs/:clubId/rewards" element={<ClubRewardsRoute />} />
      <Route path="/clubs/:clubId/activity-schedule" element={<ClubActivityScheduleRoute />} />
      <Route path="/clubs/:clubId/manage-activity-schedule" element={<ClubManageActivityScheduleRoute />}/>
      <Route path="/clubs/:clubId/manage-activity-schedule/:activityId/attendance" element={<ClubActivityAttendanceRoute />}/>
      <Route path="/clubs/:clubId/activity-schedule/:activityId/attendance" element={<ClubActivityAttendanceRoute />}/>
      <Route path="/clubs/:clubId/events" element={<ClubEventsRoute />} />
      <Route path="/clubs/:clubId" element={<ClubDetailRoute />} />


      <Route
        path="/admin"
        element={
          <AdminRoute>
            <AdminDashboardPage
              onLogout={() => setShowAdminLogout(true)}
            />
          </AdminRoute>
        }
      />

      <Route path="/test-api" element={<ApiTestPage />} />

      <Route path="*" element={<Navigate to={isAuthenticated ? '/' : '/login'} replace />} />
    </Routes>
    </Suspense>

      <LogoutConfirmModal
        isOpen={showAdminLogout}
        onClose={() => setShowAdminLogout(false)}
        onConfirm={handleAdminLogout}
        isLoggingOut={adminLoggingOut}
        title="Confirm Admin Logout"
        message="Are you sure you want to log out of the UniClub Admin system?"
      />
    </>
  )
}

function AdminRoute({ children }) {
  const token = localStorage.getItem('token')
  const [loading, setLoading] = useState(true)
  const [isAllowed, setIsAllowed] = useState(false)

  useEffect(() => {
    let active = true
    async function checkAdminAccess() {
      if (!token) {
        if (active) setLoading(false)
        return
      }
      try {
        const res = await getMyProfile()
        if (!active) return
        const user = res?.data?.user
        const email = user?.email?.toLowerCase()?.trim()
        const role = user?.role?.toLowerCase()

        const allowed = email === 'uniclub2402@gmail.com' || role === 'student_affairs' || role === 'admin'
        setIsAllowed(allowed)
      } catch (err) {
        console.error("Admin access check error:", err)
        if (typeof navigator !== 'undefined' && !navigator.onLine) {
          localStorage.removeItem('token')
          window.location.href = '/login'
          return
        }
        if (active) setIsAllowed(false)
      } finally {
        if (active) setLoading(false)
      }
    }
    checkAdminAccess()
    return () => { active = false }
  }, [token])

  if (!token) {
    return <Navigate to="/login" replace />
  }

  if (loading) {
    return (
      <RouteLoading
        message="Verifying Admin Access"
        subtitle="Validating administrative credentials and security tokens..."
      />
    )
  }

  if (!isAllowed) {
    return <Navigate to="/" replace />
  }

  return children
}

export default AppRouter
