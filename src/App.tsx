import { lazy, Suspense, type ReactNode } from "react";
import {
  BrowserRouter,
  Navigate,
  Route,
  Routes,
  useLocation,
} from "react-router-dom";
import AppNavigation from "./components/AppNavigation";
import { getProviderProfileRouteId } from "./data/providerAccount";
import { useAuth } from "./hooks/useAuth";
import type { User } from "./types";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import MessagesPage from "./pages/MessagesPage";
import ProviderReviewsPage from "./pages/ProviderReviewsPage";
import ResidentDashboardPage from "./pages/ResidentDashboardPage";
import ResidentProfilePage from "./pages/ResidentProfilePage";
import AboutPage from "./pages/public/AboutPage";
import ForgotPassword from "./pages/public/ForgotPassword/ForgotPassword";
import Login from "./pages/public/Login/Login";
import Register from "./pages/public/Register/Register";
import ProviderLogin from "./pages/provider/ProviderLogin";
import ProviderRegister from "./pages/provider/ProviderRegister";
import ProviderDashboardPage from "./pages/provider/ProviderDashboardPage";
import ProviderServicesPage from "./pages/provider/Services/ProviderServicesPage";
import ResidentLogin from "./pages/resident/ResidentLogin";
import ResidentRegister from "./pages/resident/ResidentRegister";

type UserRole = User["role"];

const ServiceDirectoryApp = lazy(() => import("./pages/ServiceDirectoryApp"));

function ServiceDirectoryRoute() {
  return (
    <Suspense fallback={<div className="p-4">Loading services...</div>}>
      <ServiceDirectoryApp />
    </Suspense>
  );
}

function HomeRoute() {
  const { user } = useAuth();
  if (user?.role === "provider") {
    return <Navigate to="/provider/dashboard" replace />;
  }
  if (user?.role === "admin") {
    return <Navigate to="/admin/dashboard" replace />;
  }
  return <ServiceDirectoryRoute />;
}

function RoleRoute({
  role,
  children,
}: {
  role: UserRole;
  children: ReactNode;
}) {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return (
      <Navigate
        to={role === "provider" ? "/provider/login" : "/login"}
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }
  if (user.role !== role) {
    const destination =
      user.role === "provider"
        ? "/provider/dashboard"
        : user.role === "admin"
          ? "/admin/dashboard"
          : "/resident/dashboard";
    return <Navigate to={destination} replace />;
  }
  return children;
}

function ProviderProfileRoute() {
  const { user } = useAuth();
  const profileId = getProviderProfileRouteId(user);
  return profileId ? (
    <Navigate to={`/provider/profile/${encodeURIComponent(profileId)}`} replace />
  ) : (
    <ServiceDirectoryRoute />
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppNavigation />
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/about" element={<AboutPage />} />
        <Route path="/services" element={<Navigate to="/#services" replace />} />
        <Route
          path="/services/providers/:providerId"
          element={<ServiceDirectoryRoute />}
        />
        <Route path="/services/*" element={<Navigate to="/#services" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/resident/login" element={<ResidentLogin />} />
        <Route path="/resident/register" element={<ResidentRegister />} />
        <Route path="/provider/login" element={<ProviderLogin />} />
        <Route path="/provider/register" element={<ProviderRegister />} />

        <Route
          path="/resident/dashboard"
          element={
            <RoleRoute role="resident">
              <ResidentDashboardPage />
            </RoleRoute>
          }
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
          path="/resident/saved"
          element={
            <RoleRoute role="resident">
              <ServiceDirectoryRoute />
            </RoleRoute>
          }
        />
        <Route
          path="/resident/messages"
          element={
            <RoleRoute role="resident">
              <MessagesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/resident/messages/:providerId"
          element={
            <RoleRoute role="resident">
              <MessagesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/conversation/:providerId"
          element={
            <RoleRoute role="resident">
              <MessagesPage />
            </RoleRoute>
          }
        />

        <Route
          path="/provider/dashboard"
          element={
            <RoleRoute role="provider">
              <ProviderDashboardPage />
            </RoleRoute>
          }
        />
        <Route
          path="/provider/services/*"
          element={
            <RoleRoute role="provider">
              <ProviderServicesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/provider/profile"
          element={
            <RoleRoute role="provider">
              <ProviderProfileRoute />
            </RoleRoute>
          }
        />
        <Route
          path="/provider/profile/:providerId"
          element={
            <RoleRoute role="provider">
              <ServiceDirectoryRoute />
            </RoleRoute>
          }
        />
        <Route
          path="/provider/messages"
          element={
            <RoleRoute role="provider">
              <MessagesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/provider/conversation/:residentId"
          element={
            <RoleRoute role="provider">
              <MessagesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/provider/reviews"
          element={
            <RoleRoute role="provider">
              <ProviderReviewsPage />
            </RoleRoute>
          }
        />

        <Route
          path="/reviews/:providerId"
          element={
            <RoleRoute role="resident">
              <ProviderReviewsPage />
            </RoleRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <RoleRoute role="admin">
              <AdminDashboardPage />
            </RoleRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;