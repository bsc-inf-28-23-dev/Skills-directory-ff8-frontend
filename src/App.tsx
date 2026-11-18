import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import Login from './pages/public/Login/Login';
import Register from './pages/public/Register/Register';
import ForgotPassword from './pages/public/ForgotPassword/ForgotPassword';
import ChangePassword from './pages/public/ChangePassword/ChangePassword';

import ResidentLogin from './pages/resident/ResidentLogin';
import ResidentRegister from './pages/resident/ResidentRegister';
import { Conversation } from './pages/resident/Conversation/Conversation';

import ProviderLogin from './pages/provider/ProviderLogin';
import ProviderRegister from './pages/provider/ProviderRegister';

// Resident module
import ResidentDashboardPage from './pages/ResidentDashboardPage';
import ResidentProfilePage from './pages/ResidentProfilePage';
import ProviderReviewsPage from './pages/ProviderReviewsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Public authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Shared Change Password page */}
        <Route
          path="/resident/change-password"
          element={<ChangePassword role="resident" />}
        />

        <Route
          path="/provider/change-password"
          element={<ChangePassword role="provider" />}
        />

        {/* Legacy authentication routes */}
        <Route path="/resident/login" element={<ResidentLogin />} />
        <Route path="/resident/register" element={<ResidentRegister />} />
        <Route path="/provider/login" element={<ProviderLogin />} />
        <Route path="/provider/register" element={<ProviderRegister />} />

        {/* Chat / Conversation */}
        <Route
          path="/conversation/:providerId"
          element={<Conversation />}
        />

        {/* Resident module */}
        <Route
          path="/resident/dashboard"
          element={<ResidentDashboardPage />}
        />

        <Route
          path="/resident/profile"
          element={<ResidentProfilePage />}
        />

        <Route
          path="/reviews/:providerId"
          element={<ProviderReviewsPage />}
        />

        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;