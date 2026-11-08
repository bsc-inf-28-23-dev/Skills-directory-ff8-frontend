import { lazy, Suspense } from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppNavigation from './components/AppNavigation';
import Home from './pages/public/Home/Home';
import Login from './pages/public/Login/Login';
import Register from './pages/public/Register/Register';
import ForgotPassword from './pages/public/ForgotPassword/ForgotPassword';

import ResidentLogin from './pages/resident/ResidentLogin';
import ResidentRegister from './pages/resident/ResidentRegister';
import { Conversation } from './pages/resident/Conversation/Conversation';
import ResidentDashboardPage from './pages/ResidentDashboardPage';
import ResidentProfilePage from './pages/ResidentProfilePage';

import ProviderLogin from './pages/provider/ProviderLogin';
import ProviderRegister from './pages/provider/ProviderRegister';
import { Inbox as ProviderInbox } from './pages/provider/Messages/Inbox';
import { ProviderConversation } from './pages/provider/Messages/Conversation';
import ProviderReviewsPage from './pages/ProviderReviewsPage';

// Admin Dashboard
import AdminDashboardPage from './pages/AdminDashboardPage';

// Service directory (Lazy Loaded)
const ServiceDirectoryApp = lazy(() => import('./pages/ServiceDirectoryApp'));

function App() {
  return (
    <BrowserRouter>
      <AppNavigation />
      <Routes>
        {/* Public pages */}
        <Route path="/" element={<Home />} />

        {/* Authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/resident/login" element={<ResidentLogin />} />
        <Route path="/resident/register" element={<ResidentRegister />} />
        <Route path="/provider/login" element={<ProviderLogin />} />
        <Route path="/provider/register" element={<ProviderRegister />} />

        {/* Chat routes */}
        <Route path="/provider/messages" element={<ProviderInbox />} />
        <Route path="/provider/conversation/:residentId" element={<ProviderConversation />} />
        <Route path="/conversation/:providerId" element={<Conversation />} />

        {/* Resident module */}
        <Route path="/resident/dashboard" element={<ResidentDashboardPage />} />
        <Route path="/resident/profile" element={<ResidentProfilePage />} />
        <Route path="/reviews/:providerId" element={<ProviderReviewsPage />} />

        {/* Admin module */}
        <Route path="/admin/dashboard" element={<AdminDashboardPage />} />

        {/* Service directory */}
        <Route
          path="/services/*"
          element={
            <Suspense fallback={<div className="p-4">Loading services...</div>}>
              <ServiceDirectoryApp />
            </Suspense>
          }
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;