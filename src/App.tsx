
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import './App.css';

// Public pages
import Home from './pages/public/Home/Home';
import Login from './pages/public/Login/Login';
import Register from './pages/public/Register/Register';
import ForgotPassword from './pages/public/ForgotPassword/ForgotPassword';

// Resident pages
import ResidentLogin from './pages/resident/ResidentLogin';
import ResidentRegister from './pages/resident/ResidentRegister';
import { Conversation } from './pages/resident/Conversation/Conversation';

// Provider authentication pages
import ProviderLogin from './pages/provider/ProviderLogin';
import ProviderRegister from './pages/provider/ProviderRegister';

// Dashboard and profile pages
import ResidentDashboardPage from './pages/ResidentDashboardPage';
import ResidentProfilePage from './pages/ResidentProfilePage';
import ProviderReviewsPage from './pages/ProviderReviewsPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Landing page */}
        <Route path="/" element={<Home />} />

        {/* Public authentication */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Resident authentication */}
        <Route path="/resident/login" element={<ResidentLogin />} />
        <Route path="/resident/register" element={<ResidentRegister />} />

        {/* Resident conversation */}
        <Route
          path="/conversation/:providerId"
          element={<Conversation />}
        />

        {/* Resident dashboard and profile */}
        <Route
          path="/resident/dashboard"
          element={<ResidentDashboardPage />}
        />
        <Route
          path="/resident/profile"
          element={<ResidentProfilePage />}
        />

        {/* Provider pages */}
        <Route path="/provider/login" element={<ProviderLogin />} />
        <Route path="/provider/register" element={<ProviderRegister />} />
        <Route path="/provider/reviews" element={<ProviderReviewsPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
