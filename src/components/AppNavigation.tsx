import { useState, useEffect } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth"; // Import Auth
import { getConversations } from "../services/chatService"; // Import API
import "./AppNavigation.css";

export default function AppNavigation() {
  const { pathname } = useLocation();
  const { user } = useAuth(); // Get logged-in user
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch unread messages for the badge
  useEffect(() => {
    async function checkUnread() {
      if (!user) return;
      try {
        const convs = await getConversations();
        // Count unread messages across all conversations
        const totalUnread = convs.reduce((acc: number, c: any) => acc + (c.unreadCount || 0), 0);
        setUnreadCount(totalUnread);
      } catch (err) {
        // Ignore error silently (e.g. if backend is offline)
      }
    }
    checkUnread();
  }, [user]);

  const isAuthPage = /\/(login|register|forgot-password)$/.test(pathname);
  const isCompactPage = isAuthPage || pathname.startsWith("/conversation/") || pathname.startsWith("/provider/conversation/");
  
  // Hide navbar on auth pages
  if (isAuthPage) return null;

  // Dynamic links based on user role
  const role = user?.role || 'guest';
  const messagesLink = role === 'provider' ? '/provider/messages' : '/resident/messages';

  return (
    <header className={`app-navigation${isCompactPage ? " is-compact" : ""}`}>
      <Link className="app-navigation__brand" to="/" onClick={() => setMenuOpen(false)}>
        <span className="app-navigation__mark" aria-hidden="true">SD</span>
        <span className="app-navigation__brand-copy">
          <span>Skillz <strong>Directory</strong></span>
          <small>Connecting residents with service providers</small>
        </span>
      </Link>

      <button type="button" className="app-navigation__toggle" onClick={() => setMenuOpen((open) => !open)}>
        <span aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
      </button>

      <div className={`app-navigation__content${menuOpen ? " is-open" : ""}`}>
        <nav className="app-navigation__links">
          <NavLink to="/" end className="app-navigation__link" onClick={() => setMenuOpen(false)}>Home</NavLink>
          <NavLink to="/services" className="app-navigation__link" onClick={() => setMenuOpen(false)}>Services</NavLink>

          {/* ONLY SHOW MESSAGES IF LOGGED IN */}
          {user && (
            <NavLink to={messagesLink} className="app-navigation__link" onClick={() => setMenuOpen(false)}>
              Messages
              {unreadCount > 0 && (
                <span className="nav-badge">{unreadCount}</span>
              )}
            </NavLink>
          )}

          {user && <NavLink to={role === 'provider' ? '/provider/profile' : '/resident/profile'} className="app-navigation__link" onClick={() => setMenuOpen(false)}>Profile</NavLink>}
        </nav>

        <div className="app-navigation__actions">
          {!user ? (
            <>
              <Link className="app-navigation__sign-in" to="/login" onClick={() => setMenuOpen(false)}>Sign in</Link>
              <Link className="app-navigation__register" to="/register" onClick={() => setMenuOpen(false)}>Register</Link>
            </>
          ) : (
             <button className="app-navigation__sign-in" onClick={() => {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/login';
             }}>Log Out</button>
          )}
        </div>
      </div>
    </header>
  );
}