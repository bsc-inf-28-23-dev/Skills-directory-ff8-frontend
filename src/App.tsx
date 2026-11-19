import { BrowserRouter, Navigate, Route, Routes, useLocation } from "react-router-dom";
import AppNavigation from "./components/AppNavigation";
import AuthForm from "./components/AuthForm/AuthForm";
import { AuthProvider, useAuth } from "./hooks/useAuth";
import type { ReactNode } from "react";
import AdminDashboardPage from "./pages/AdminDashboardPage";
import AboutPage from "./pages/public/AboutPage";
import MessagesPage from "./pages/MessagesPage";
import ProviderProfilePage from "./pages/ProviderProfilepage";
import ResidentDashboardPage from "./pages/ResidentDashboardPage";
import ResidentProfilePage from "./pages/ResidentProfilePage";
import ServiceDirectoryApp from "./pages/ServiceDirectoryApp";
import ProviderDashboardPage from "./pages/provider/ProviderDashboardPage";
import ProviderReviewsPage from "./pages/ProviderReviewsPage";
import ProviderServicesPage from "./pages/provider/Services/ProviderServicesPage";

type UserRole = "resident" | "provider" | "admin";

function HomeRoute() {
  const { user, loading } = useAuth();

  if (loading) return null;
  if (user?.role === "provider") return <Navigate to="/provider/dashboard" replace />;
  if (user?.role === "admin") return <Navigate to="/admin/dashboard" replace />;

  return <ServiceDirectoryApp />;
}

function RoleRoute({ role, children }: { role: UserRole; children: ReactNode }) {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) return null;
  if (!user) {
    const loginPath = role === "provider" ? "/provider/login" : "/login";
    return (
      <Navigate
        to={loginPath}
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

function AppRoutes() {
  return (
    <>
      <AppNavigation />
      <Routes>
        <Route path="/" element={<HomeRoute />} />
        <Route path="/login" element={<AuthForm mode="login" />} />
        <Route path="/register" element={<AuthForm mode="register" />} />
        <Route path="/provider/login" element={<AuthForm mode="login" role="provider" />} />
        <Route path="/provider/register" element={<AuthForm mode="register" role="provider" />} />
        <Route path="/resident/login" element={<AuthForm mode="login" role="resident" />} />
        <Route path="/resident/register" element={<AuthForm mode="register" role="resident" />} />
        <Route path="/about" element={<AboutPage />} />

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
              <ServiceDirectoryApp />
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
          path="/provider/services"
          element={
            <RoleRoute role="provider">
              <ProviderServicesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/provider/services/new"
          element={
            <RoleRoute role="provider">
              <ProviderServicesPage />
            </RoleRoute>
          }
        />
        <Route
          path="/provider/services/:serviceId"
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
              <ProviderProfilePage />
            </RoleRoute>
          }
        />
        <Route
          path="/provider/profile/:providerId"
          element={
            <RoleRoute role="provider">
              <ServiceDirectoryApp />
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
          path="/admin/dashboard"
          element={
            <RoleRoute role="admin">
              <AdminDashboardPage />
            </RoleRoute>
          }
        />
        <Route path="/services/providers/:providerId" element={<ServiceDirectoryApp />} />
        <Route path="/services/*" element={<Navigate to="/#services" replace />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
