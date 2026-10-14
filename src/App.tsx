
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';

import Login from './pages/public/Login/Login';
import Register from './pages/public/Register/Register';

import ResidentLogin from './pages/resident/ResidentLogin';
import ResidentRegister from './pages/resident/ResidentRegister';

import ProviderLogin from './pages/provider/ProviderLogin';
import ProviderRegister from './pages/provider/ProviderRegister';
import ForgotPassword from './pages/public/ForgotPassword/ForgotPassword';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />

        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/resident/login" element={<ResidentLogin />} />
        <Route path="/resident/register" element={<ResidentRegister />} />

        <Route path="/provider/login" element={<ProviderLogin />} />
        <Route path="/provider/register" element={<ProviderRegister />} />

        <Route path="*" element={<Navigate to="/login" replace />} />
        
      </Routes>
    </BrowserRouter>
  );
}

export default App;
