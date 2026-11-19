import { useState } from "react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import {
  Bell,
  Bookmark,
  BriefcaseBusiness,
  Home,
  LogOut,
  MessageCircle,
  Search,
  UserRound,
  type LucideIcon,
} from "lucide-react";
import { useAuth } from "../hooks/useAuth";
import { getProviderProfileRouteId } from "../data/providerAccount";
import { providerConversations } from "../data/providerConversations";
import "./AppNavigation.css";

interface NavigationLink {
  label: string;
  to: string;
  end?: boolean;
  icon?: LucideIcon;
  notification?: boolean;
}

export default function AppNavigation() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const providerProfileId = getProviderProfileRouteId(user);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleHomeClick = () => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };
  const isAuthPage = /\/(login|register|forgot-password)$/.test(pathname);
  const isCompactPage =
    isAuthPage ||
    (pathname.startsWith("/conversation/") && user?.role !== "resident") ||
    (pathname.startsWith("/provider/conversation/") &&
      user?.role !== "provider");
  const isProviderArea =
    !isCompactPage && user?.role === "provider";
  const isResidentArea =
    !isCompactPage && user?.role === "resident";
  const profilePath = providerProfileId
    ? `/provider/profile/${providerProfileId}`
    : "/provider/dashboard";
  const homePath =
    user?.role === "resident"
      ? "/resident/dashboard"
      : user?.role === "provider"
        ? "/provider/dashboard"
        : "/";
  const accountProfilePath =
    user?.role === "resident" ? "/resident/profile" : profilePath;
  const isResidentConversation =
    pathname.startsWith("/conversation/") ||
    pathname.startsWith("/resident/messages/");
  const isProviderConversation = pathname.startsWith("/provider/conversation/");
  const hasUnreadProviderMessages = providerConversations.some(
    (conversation) => conversation.unreadCount > 0,
  );

  async function handleLogout() {
    setMenuOpen(false);
    try {
      await logout();
      navigate(user?.role === "provider" ? "/provider/login" : "/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Could not sign out.", error);
    }
  }

  const links: NavigationLink[] = isCompactPage
    ? [
        { label: "Home", to: "/", end: true },
        { label: "About", to: "/about" },
      ]
    : isResidentArea
      ? [
          { label: "Home", to: "/resident/dashboard", end: true, icon: Home },
          { label: "Explore Services", to: "/#services", icon: Search },
          { label: "Saved services", to: "/resident/saved", icon: Bookmark },
          {
            label: "Messages",
            to: "/resident/messages",
            icon: MessageCircle,
          },
        ]
    : isProviderArea
    ? [
        { label: "Dashboard", to: "/provider/dashboard", end: true, icon: Home },
        { label: "My Services", to: "/provider/services", icon: BriefcaseBusiness },
        {
          label: "Messages",
          to: "/provider/messages",
          icon: MessageCircle,
          notification: hasUnreadProviderMessages,
        },
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
        to={homePath}
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
                `app-navigation__link${
                  isActive ||
                  (link.label === "Messages" &&
                    ((user?.role === "resident" && isResidentConversation) ||
                      (user?.role === "provider" && isProviderConversation)))
                    ? " is-active"
                    : ""
                }${
                  link.icon ? " has-icon" : ""
                }`
              }
            >
              {link.icon && (
                <span className="app-navigation__link-icon" aria-hidden="true">
                  <link.icon size={17} />
                  {link.notification && (
                    <span className="app-navigation__notification">
                      <Bell size={9} />
                    </span>
                  )}
                </span>
              )}
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="app-navigation__actions">
          {user ? (
            <>
              <Link
                className="app-navigation__profile-icon"
                to={accountProfilePath}
                aria-label="Profile"
                title="Profile"
                onClick={() => setMenuOpen(false)}
              >
                <UserRound size={20} aria-hidden="true" />
              </Link>
              {user.role === "provider" && (
                <button
                  type="button"
                  className="app-navigation__logout"
                  onClick={handleLogout}
                >
                  <LogOut size={17} aria-hidden="true" />
                  <span>Log out</span>
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
