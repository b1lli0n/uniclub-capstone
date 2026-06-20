import { Routes, Route, Navigate, useNavigate, useParams } from 'react-router-dom';

import LoginPage from '../pages/auth/LoginPage';
import AuthCallbackPage from '../pages/auth/AuthCallbackPage';

import HomeLayout from '../layouts/HomeLayout';
import HomePage from '../pages/home/HomePage';
import MyProfilePage from '../pages/home/MyProfilePage';
import MyRequestsPage from '../pages/home/MyRequestsPage';
import MyClubsPage from '../pages/home/MyClubsPage';
import CreateClubPage from '../pages/home/CreateClubPage';
import ClubsPage from '../pages/home/ClubsPage';
import EventsPage from '../pages/home/EventsPage';
import EventDetailPage from '../pages/home/EventDetailPage';
import ClubDetailPage from '../pages/home/ClubDetailPage';
import ClubEventsPage from '../pages/home/ClubEventsPage';
import ClubRankingPage from '../pages/home/ClubRankingPage';
import ClubJoinRequestsPage from '../pages/home/ClubJoinRequestsPage';
import ClubJoinFormPage from '../pages/home/ClubJoinFormPage';
import AdminDashboardPage from '../pages/admin/AdminDashboardPage';

import { CURRENT_USER, MY_CLUB_MEMBERSHIPS } from '../data/mockData';

function canManageClubMembers(clubId) {
  const membership = MY_CLUB_MEMBERSHIPS.find((item) => item.clubId === clubId);
  return membership?.role?.toLowerCase() === 'leader';
}

function ProtectedLayout({
  pageId,
  activeItem = null,
  clubId = null,
  canManageMembers = false,
  children,
}) {
  const navigate = useNavigate();
  const isAuthenticated = Boolean(localStorage.getItem('token'));

  const handleLogout = () => {
    localStorage.removeItem('token');
    navigate('/login', { replace: true });
  };

  const handleNavigate = (screen) => {
    if (screen === 'profile') navigate('/profile');
    else if (screen === 'requests') navigate('/my-requests');
    else if (screen === 'my-clubs') navigate('/my-clubs');
    else if (screen === 'create-club') navigate('/create-club');
    else if (screen === 'clubs') navigate('/clubs');
    else if (screen === 'events') navigate('/events');
    else if (screen === 'club-detail') navigate(clubId ? `/clubs/${clubId}` : '/clubs');
    else if (screen === 'club-ranking') navigate(clubId ? `/clubs/${clubId}/ranking` : '/club-ranking');
    else if (screen === 'member-approval' && clubId) navigate(`/clubs/${clubId}/join-requests`);
    else if (screen === 'join-form' && clubId) navigate(`/clubs/${clubId}/join-form`);
    else navigate('/');
  };

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <HomeLayout
      activeItem={activeItem}
      pageId={pageId}
      currentUser={CURRENT_USER}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
      canManageMembers={canManageMembers}
    >
      {children}
    </HomeLayout>
  );
}

function ClubDetailRoute() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const canManageMembers = canManageClubMembers(clubId);

  return (
    <ProtectedLayout
      pageId="club-detail"
      activeItem="clubs"
      clubId={clubId}
      canManageMembers={canManageMembers}
    >
      <ClubDetailPage
        key={clubId}
        clubId={clubId}
        onBack={() => navigate('/clubs')}
      />
    </ProtectedLayout>
  );
}

function ClubRankingRoute() {
  const { clubId } = useParams();
  const canManageMembers = canManageClubMembers(clubId);

  return (
    <ProtectedLayout
      pageId="club-ranking"
      activeItem="clubs"
      clubId={clubId}
      canManageMembers={canManageMembers}
    >
      <ClubRankingPage clubId={clubId} />
    </ProtectedLayout>
  );
}

function ClubJoinRequestsRoute() {
  const { clubId } = useParams();
  const canManageMembers = canManageClubMembers(clubId);

  if (!canManageMembers) {
    return <Navigate to={`/clubs/${clubId}`} replace />;
  }

  return (
    <ProtectedLayout
      pageId="member-approval"
      activeItem="clubs"
      clubId={clubId}
      canManageMembers={canManageMembers}
    >
      <ClubJoinRequestsPage clubId={clubId} />
    </ProtectedLayout>
  );
}

function ClubJoinFormRoute() {
  const { clubId } = useParams();
  const canManageMembers = canManageClubMembers(clubId);

  if (!canManageMembers) {
    return <Navigate to={`/clubs/${clubId}`} replace />;
  }

  return (
    <ProtectedLayout
      pageId="join-form"
      activeItem="clubs"
      clubId={clubId}
      canManageMembers={canManageMembers}
    >
      <ClubJoinFormPage clubId={clubId} />
    </ProtectedLayout>
  );
}

function ClubEventsRoute() {
  const { clubId } = useParams();
  const canManageMembers = canManageClubMembers(clubId);

  return (
    <ProtectedLayout
      pageId="club-events"
      activeItem="clubs"
      clubId={clubId}
      canManageMembers={canManageMembers}
    >
      <ClubEventsPage />
    </ProtectedLayout>
  );
}

function AppRouter() {
  const isAuthenticated = Boolean(localStorage.getItem('token'));
  const navigate = useNavigate();

  return (
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
              onViewAll={(target) => navigate(target === 'events' ? '/events' : '/clubs')}
            />
          </ProtectedLayout>
        }
      />

      <Route
        path="/profile"
        element={
          <ProtectedLayout pageId="profile">
            <MyProfilePage currentUser={CURRENT_USER} />
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

      <Route path="/clubs/:clubId/ranking" element={<ClubRankingRoute />} />
      <Route path="/clubs/:clubId/join-requests" element={<ClubJoinRequestsRoute />} />
      <Route path="/clubs/:clubId/join-form" element={<ClubJoinFormRoute />} />

      <Route path="/clubs/:clubId/events" element={<ClubEventsRoute />} />

      <Route
        path="/clubs/:clubId/events/:eventId"
        element={
          <ProtectedLayout pageId="event-detail" activeItem="clubs">
            <EventDetailPage />
          </ProtectedLayout>
        }
      />

      <Route path="/clubs/:clubId" element={<ClubDetailRoute />} />

      <Route
        path="/club-ranking"
        element={
          <ProtectedLayout pageId="club-ranking" activeItem="clubs">
            <ClubRankingPage />
          </ProtectedLayout>
        }
      />

      <Route
        path="/admin"
        element={<AdminDashboardPage onLogout={() => navigate('/login')} />}
      />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default AppRouter;