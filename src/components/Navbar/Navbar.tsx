import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import './Navbar.css';

export const Navbar: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();


  const isAuthPage = 
    location.pathname === '/login' || 
    location.pathname === '/register' || 
    location.pathname === '/forgot-password' ||
    location.pathname.includes('/resident/login') ||
    location.pathname.includes('/provider/login');

  
  if (isAuthPage) return null;

  return (
    <nav className="global-navbar">
      <div className="navbar-container">
        {/* Logo / Home */}
        <Link to="/" className="navbar-logo">
          <span className="logo-box">S</span>
          <span className="logo-text">SKILLZ DIRECTORY</span>
        </Link>

        {/* Links */}
        <div className="navbar-links">
          <Link to="/categories" className="nav-link">BROWSE SERVICES</Link>
          <Link to="/resident/dashboard" className="nav-link">DASHBOARD</Link>
          
          {/* YOUR PART - The Messages Link */}
          <Link to="/provider/messages" className="nav-link nav-link-highlight">
            MESSAGES
          </Link>

          <button 
            onClick={() => navigate('/login')} 
            className="nav-btn-logout"
          >
            LOG OUT
          </button>
        </div>
      </div>
    </nav>
  );
};