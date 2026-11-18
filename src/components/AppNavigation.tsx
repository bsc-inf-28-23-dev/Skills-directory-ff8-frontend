import { useState } from "react";
import { LogOut } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./AppNavigation.css";

interface NavigationLink {
  label: string;
  to: string;
  end?: boolean;
}

export default function AppNavigation() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleHomeClick = () => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const handleLogout = () => {
    setMenuOpen(false);
    logout();
    navigate("/provider/login", { replace: true });
  };

  const isAuthPage = /\/(login|register|forgot-password)$/.test(pathname);
  const isCompactPage =
    isAuthPage ||
    pathname.startsWith("/conversation/") ||
    pathname.startsWith("/provider/conversation/");

  const isProviderArea =
    !isCompactPage &&
    (pathname.startsWith("/provider/") ||
      pathname.startsWith("/services/providers/"));

  const isResidentArea =
    !isCompactPage &&
    (pathname.startsWith("/resident/") ||
      pathname.startsWith("/conversation/") ||
      pathname.startsWith("/reviews/"));

  const profilePath = pathname.startsWith("/services/providers/")
    ? pathname
    : "/services";
  
  const accountProfilePath =
    user?.role === "resident" ? "/resident/profile" : profilePath;

  const links: NavigationLink[] = isCompactPage
    ? [
        { label: "Home", to: "/", end: true },
        { label: "About", to: "/about" },
      ]
    : isProviderArea
    ? [
        { label: "About", to: "/about" },
        { label: "Messages", to: "/provider/messages" },
        // REMOVED "Profile" from text links
      ]
    : isResidentArea
      ? [
          { label: "Dashboard", to: "/resident/dashboard" },
          { label: "About", to: "/about" },
          { label: "Messages", to: "/resident/dashboard#recent-conversations-heading" },
          // REMOVED "Profile" from text links
        ]
      : [
          { label: "Home", to: "/", end: true },
          { label: "About", to: "/about" },
        ];

  return (
    <header
      className={`app-navigation${isCompactPage ? " is-compact" : ""}`}
    >
      <Link
        className="app-navigation__brand"
        to="/"
        aria-label="Skillz Directory home"
        onClick={handleHomeClick}
      >
        <span className="app-navigation__mark" aria-hidden="true">
          SD
        </span>
        <span className="app-navigation__brand-copy">
          <span>
            Skillz <strong>Directory</strong>
          </span>
          <small>Connecting residents with service providers</small>
        </span>
      </Link>

      <button
        type="button"
        className="app-navigation__toggle"
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((open) => !open)}
      >
        <span aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
      </button>

      <div
        className={`app-navigation__content${menuOpen ? " is-open" : ""}`}
      >
        <nav className="app-navigation__links" aria-label="Main navigation">
          {links.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              end={link.end}
              onClick={
                link.label === "Home"
                  ? handleHomeClick
                  : () => setMenuOpen(false)
              }
              className={({ isActive }) =>
                `app-navigation__link${isActive ? " is-active" : ""}`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="app-navigation__actions">
          {user ? (
            <>
              {!(user.role === "provider" && isProviderArea) && (
                <Link
                  className="app-navigation__register"
                  to={accountProfilePath}
                  onClick={() => setMenuOpen(false)}
                >
                  Profile
                </Link>
              )}
              {user.role === "provider" && (
                <button
                  type="button"
                  className="app-navigation__logout"
                  onClick={handleLogout}
                >
                  <LogOut size={16} aria-hidden="true" />
                  Log out
                </button>
              )}
            </>
          ) : (
            <>
              <Link
                className="app-navigation__sign-in"
                to="/login"
                onClick={() => setMenuOpen(false)}
              >
                Sign in
              </Link>
              <Link
                className="app-navigation__register"
                to="/register"
                onClick={() => setMenuOpen(false)}
              >
                Register
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}