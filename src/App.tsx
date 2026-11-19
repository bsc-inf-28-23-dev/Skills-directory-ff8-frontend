
import { lazy, Suspense, type ReactNode } from 'react';
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from 'react-router-dom';
import AppNavigation from './components/AppNavigation';
import { useAuth } from './hooks/useAuth';
import AboutPage from './pages/public/AboutPage';
import Login from './pages/public/Login/Login';
import Register from './pages/public/Register/Register';
import ForgotPassword from './pages/public/ForgotPassword/ForgotPassword';

import ResidentLogin from './pages/resident/ResidentLogin';
import ResidentRegister from './pages/resident/ResidentRegister';
import { Conversation } from './pages/resident/Conversation/Conversation';

// Provider pages
import ProviderLogin from './pages/provider/ProviderLogin';
import ProviderRegister from './pages/provider/ProviderRegister';
import ProviderDashboardPage from './pages/provider/ProviderDashboardPage';
import ProviderServicesPage from './pages/provider/Services/ProviderServicesPage';
import { Inbox as ProviderInbox } from './pages/provider/Messages/Inbox';
import { ProviderConversation } from './pages/provider/Messages/Conversation';

// Resident module
import ResidentDashboardPage from './pages/ResidentDashboardPage';
import ResidentProfilePage from './pages/ResidentProfilePage';
import ProviderReviewsPage from './pages/ProviderReviewsPage';

// Service directory
const ServiceDirectoryApp = lazy(() => import('./pages/ServiceDirectoryApp'));

function ServiceDirectoryRoute() {
  return (
    <Suspense fallback={<div className="p-4">Loading services...</div>}>
      <ServiceDirectoryApp />
    </Suspense>
  );
}

function HomeRoute() {
  const { user } = useAuth();
  return user?.role === 'provider'
    ? <Navigate to="/provider/dashboard" replace />
    : <ServiceDirectoryRoute />;
}

function RoleRoute({
  role,
  children,
}: {
  role: 'resident' | 'provider';
  children: ReactNode;
}) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    const loginPath = role === 'provider' ? '/provider/login' : '/resident/login';
    return (
      <Navigate
        to={loginPath}
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (user.role !== role) {
    return (
      <Navigate
        to={user.role === 'provider' ? '/provider/dashboard' : '/resident/dashboard'}
        replace
      />
    );
  }

  return children;
}

function App() {
  return (
    <BrowserRouter>
      <AppNavigation />
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<HomeRoute />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<Navigate to="/#services" replace />} />
        <Route
          path="/services/providers/:providerId"
          element={<ServiceDirectoryRoute />}
        />
        <Route
          path="/provider/profile/:providerId"
          element={<ServiceDirectoryRoute />}
        />
        <Route
          path="/resident/saved"
          element={<ServiceDirectoryRoute />}
        />
        <Route path="/services/*" element={<Navigate to="/#services" replace />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Resident authentication */}
        <Route path="/resident/login" element={<ResidentLogin />} />
        <Route path="/resident/register" element={<ResidentRegister />} />

        {/* Provider authentication */}
        <Route path="/provider/login" element={<ProviderLogin />} />
        <Route path="/provider/register" element={<ProviderRegister />} />
        <Route
          path="/provider/dashboard"
          element={<ProviderDashboardPage />}
        />
        <Route
          path="/provider/services"
          element={<ProviderServicesPage />}
        />
        <Route
          path="/provider/services/new"
          element={<ProviderServicesPage />}
        />
        <Route
          path="/provider/services/:serviceId/edit"
          element={<ProviderServicesPage />}
        />
        <Route
          path="/provider/services/:serviceId"
          element={<ProviderServicesPage />}
        />

        {/* Messaging and conversations */}
        <Route
          path="/provider/messages"
          element={
            <RoleRoute role="provider">
              <ProviderInbox />
            </RoleRoute>
          }
        />
        <Route
          path="/provider/conversation/:residentId"
          element={
            <RoleRoute role="provider">
              <ProviderConversation />
            </RoleRoute>
          }
        />
        <Route
          path="/conversation/:providerId"
          element={
            <RoleRoute role="resident">
              <Conversation />
            </RoleRoute>
          }
        />
        <Route
          path="/resident/messages"
          element={
            <RoleRoute role="resident">
              <Conversation />
            </RoleRoute>
          }
        />
        <Route
          path="/resident/messages/:providerId"
          element={
            <RoleRoute role="resident">
              <Conversation />
            </RoleRoute>
          }
        />

        {/* Resident module */}
        <Route
          path="/resident/dashboard"
          element={<ResidentDashboardPage />}
        />
        <Route
          path="/resident/profile"
          element={
            <RoleRoute role="resident">
              <ResidentProfilePage />
            </RoleRoute>
          }
        />
        <Route
          path="/reviews/:providerId"
          element={<ProviderReviewsPage />}
        />

        {/* Redirect unknown URLs to the home page */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
