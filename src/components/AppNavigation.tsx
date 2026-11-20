import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Bell,
  Bookmark,
  BriefcaseBusiness,
  Home,
  Info,
  LogOut,
  MessageCircle,
  Search,
  UserRound,
} from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { getProviderProfileRouteId } from "../data/providerAccount";
import { useAuth } from "../hooks/useAuth";
import { getConversations } from "../services/chatService";
import "./AppNavigation.css";

interface NavigationLink {
  label: string;
  to: string;
  end?: boolean;
  icon: LucideIcon;
  active?: boolean;
}

export default function AppNavigation() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState<number | null>(null);

  const isAuthPage = /\/(login|register|forgot-password)$/.test(pathname);
  const isAdminPage = pathname.startsWith("/admin/");
  const profileId = getProviderProfileRouteId(user);
  const messagesActive =
    pathname.startsWith("/resident/messages") ||
    pathname.startsWith("/provider/messages") ||
    pathname.startsWith("/conversation/") ||
    pathname.startsWith("/provider/conversation/");

  useEffect(() => {
    let active = true;
    async function loadUnreadCount() {
      try {
        const conversations = await getConversations();
        const total = conversations.reduce(
          (count, conversation) => count + (conversation.unreadCount || 0),
          0,
        );
        if (active) setUnreadCount(total);
      } catch (error) {
        console.error("Could not load unread message count.", error);
        if (active) setUnreadCount(null);
      }
    }

    if (user && !isAuthPage) void loadUnreadCount();
    return () => {
      active = false;
    };
  }, [isAuthPage, user]);

  if (isAuthPage || isAdminPage) return null;
  const visibleUnreadCount = user ? unreadCount : null;

  const links: NavigationLink[] =
    user?.role === "provider"
      ? [
          { label: "Dashboard", to: "/provider/dashboard", end: true, icon: Home },
          {
            label: "My Services",
            to: "/provider/services",
            icon: BriefcaseBusiness,
          },
          {
            label: "Messages",
            to: "/provider/messages",
            icon: MessageCircle,
            active: messagesActive,
          },
          {
            label: "Business Profile",
            to: `/provider/profile/${profileId ?? user.id}`,
            icon: UserRound,
          },
        ]
      : user?.role === "resident"
        ? [
            { label: "Home", to: "/resident/dashboard", end: true, icon: Home },
            { label: "Explore Services", to: "/#services", icon: Search },
            { label: "Saved services", to: "/resident/saved", icon: Bookmark },
            {
              label: "Messages",
              to: "/resident/messages",
              icon: MessageCircle,
              active: messagesActive,
            },
          ]
        : user?.role === "admin"
          ? [{ label: "Admin dashboard", to: "/admin/dashboard", icon: Home }]
          : [
              { label: "Home", to: "/", end: true, icon: Home },
              { label: "About", to: "/about", icon: Info },
            ];

  async function handleLogout() {
    setMenuOpen(false);
    let errorMessage = "";
    try {
      await logout();
    } catch (error) {
      console.error("Could not sign out on the server.", error);
      errorMessage = "We could not confirm sign-out with the server.";
    } finally {
      navigate("/login", {
        replace: true,
        state: errorMessage ? { logoutError: errorMessage } : undefined,
      });
    }
  }

  function closeMenu() {
    setMenuOpen(false);
  }

  return (
    <header className="app-navigation">
      <Link
        className="app-navigation__brand"
        to={
          user?.role === "provider"
            ? "/provider/dashboard"
            : user?.role === "resident"
              ? "/resident/dashboard"
              : user?.role === "admin"
                ? "/admin/dashboard"
                : "/"
        }
        aria-label="Skillz Directory home"
        onClick={closeMenu}
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
        onClick={() => setMenuOpen((open) => !open)}
        aria-label={menuOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={menuOpen}
      >
        <span aria-hidden="true">{menuOpen ? "×" : "☰"}</span>
      </button>

      <div className={`app-navigation__content${menuOpen ? " is-open" : ""}`}>
        <nav className="app-navigation__links" aria-label="Main navigation">
          {links.map((link) => (
            <NavLink
              key={link.label}
              to={link.to}
              end={link.end}
              onClick={closeMenu}
              className={({ isActive }) =>
                `app-navigation__link has-icon${
                  isActive || link.active ? " is-active" : ""
                }`
              }
            >
              <span className="app-navigation__link-icon" aria-hidden="true">
                <link.icon size={17} />
                {link.label === "Messages" &&
                  visibleUnreadCount !== null &&
                  visibleUnreadCount > 0 && (
                  <span className="app-navigation__notification">
                    <Bell size={9} />
                  </span>
                )}
              </span>
              {link.label}
              {link.label === "Messages" &&
                visibleUnreadCount !== null &&
                visibleUnreadCount > 0 && (
                <span className="app-navigation__badge">{visibleUnreadCount}</span>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="app-navigation__actions">
          {user ? (
            <>
              {user.role === "resident" && (
                <Link
                  className="app-navigation__profile-icon"
                  to="/resident/profile"
                  aria-label="Profile"
                  title="Profile"
                  onClick={closeMenu}
                >
                  <UserRound size={20} aria-hidden="true" />
                </Link>
              )}
              <button
                type="button"
                className="app-navigation__logout"
                onClick={handleLogout}
              >
                <LogOut size={17} aria-hidden="true" />
                <span>Log out</span>
              </button>
            </>
          ) : (
            <>
              <Link
                className="app-navigation__sign-in"
                to="/login"
                onClick={closeMenu}
              >
                Sign in
              </Link>
              <Link
                className="app-navigation__register"
                to="/register"
                onClick={closeMenu}
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
