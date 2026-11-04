import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import "./AppNavigation.css";

interface NavigationLink {
  label: string;
  to: string;
  end?: boolean;
}

export default function AppNavigation() {
  const { pathname } = useLocation();
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [aboutActive, setAboutActive] = useState(false);

  useEffect(() => {
    if (pathname !== "/") return;

    const aboutSection = document.getElementById("about-section");
    if (!aboutSection) return;

    const observer = new IntersectionObserver(
      ([entry]) => setAboutActive(entry.isIntersecting),
      { rootMargin: "-20% 0px -65% 0px" },
    );
    observer.observe(aboutSection);

    return () => observer.disconnect();
  }, [pathname]);

  const handleHomeClick = () => {
    setMenuOpen(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
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
    : "/services/providers/rapid-flow";
  const accountProfilePath =
    user?.role === "resident" ? "/resident/profile" : profilePath;

  const links: NavigationLink[] = isCompactPage
    ? [
        { label: "Home", to: "/", end: true },
        { label: "Services", to: "/services" },
      ]
    : isProviderArea
    ? [
        { label: "Services", to: "/services" },
        { label: "Messages", to: "/provider/messages" },
        { label: "Profile", to: profilePath },
      ]
    : isResidentArea
      ? [
          { label: "Dashboard", to: "/resident/dashboard" },
          { label: "Services", to: "/services" },
          { label: "Profile", to: "/resident/profile" },
        ]
      : [
          { label: "Home", to: "/", end: true },
          { label: "Services", to: "/services" },
          { label: "About", to: "/#about-section" },
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
              className={({ isActive }) => {
                const isHomeLinkActive =
                  pathname === "/" &&
                  (link.label === "About" ? aboutActive : !aboutActive);
                const isActiveLink =
                  pathname === "/" &&
                  (link.label === "Home" || link.label === "About")
                    ? isHomeLinkActive
                    : isActive;

                return `app-navigation__link${isActiveLink ? " is-active" : ""}`;
              }}
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="app-navigation__actions">
          {user ? (
            <Link
              className="app-navigation__register"
              to={accountProfilePath}
              onClick={() => setMenuOpen(false)}
            >
              Profile
            </Link>
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
