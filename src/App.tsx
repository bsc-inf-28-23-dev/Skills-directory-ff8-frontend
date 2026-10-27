import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';


import { Navbar } from './components/Navbar/Navbar';


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

function App() {
  return (
    <BrowserRouter>
      {/* Global Navbar added here so it shows on all inner pages */}
      <Navbar /> 
      
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        {/* Auth */}
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/resident/login" element={<ResidentLogin />} />
        <Route path="/resident/register" element={<ResidentRegister />} />
        <Route path="/provider/login" element={<ProviderLogin />} />
        <Route path="/provider/register" element={<ProviderRegister />} />

        {/* Chat / Conversation */}
        <Route path="/provider/messages" element={<ProviderInbox />} />
        <Route path="/provider/conversation/:residentId" element={<ProviderConversation />} /> 
        <Route path="/conversation/:providerId" element={<Conversation />} />

        {/* Resident module */}
        <Route path="/resident/dashboard" element={<ResidentDashboardPage />} />
        <Route path="/resident/profile" element={<ResidentProfilePage />} />
        <Route path="/reviews/:providerId" element={<ProviderReviewsPage />} />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;