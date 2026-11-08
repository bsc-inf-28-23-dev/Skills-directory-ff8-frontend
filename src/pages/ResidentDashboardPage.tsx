import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, LogOut } from "lucide-react";
import Eyebrow from "../components/Eyebrow";
import StatCard from "../components/StatCard";
import FeatureLink from "../components/FeatureLink";
import { FEATURES } from "../config/features";
import { useAuth } from "../hooks/useAuth";
import RecentConversations from "../features/resident/RecentConversations";
import RecentProviders from "../features/resident/RecentProviders";

export default function ResidentDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  if (!user) return null;

  const firstName = "Resident"; // Forces correct spelling

  const onLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="container-fluid py-5 px-4 px-md-5" style={{ width: "100%", maxWidth: 1200, marginLeft: 0, marginRight: "auto", textAlign: "left" }}>
      
      {/* Header with Two-Tone Color */}
      <header className="mb-5">
        <Eyebrow>Local skills. Real connections.</Eyebrow>
        <h1 className="display-heading display-heading-xl mb-3" style={{ lineHeight: 1.1 }}>
          Welcome back, <span className="text-primary">{firstName}.</span>
        </h1>
        <p className="text-muted-ink" style={{ maxWidth: 512, fontSize: 18 }}>
          Your community is right where you left it.
        </p>
      </header>

      {/* Stat Cards */}
      <div className="row g-3 mb-5">
        <div className="col-12 col-md-4">
          <StatCard value="—" label="Providers viewed" />
        </div>
        <div className="col-12 col-md-4">
          <StatCard value="—" label="Reviews written" />
        </div>
        <div className="col-12 col-md-4">
          <StatCard value="—" label="Conversations" />
        </div>
      </div>

      {/* Main Content */}
      <div className="row g-4 g-lg-5 mb-5">
        <div className="col-12 col-lg-7">
          <section aria-labelledby="recent-providers-heading">
            <h2 id="recent-providers-heading" className="section-label">
              Recently viewed providers
            </h2>
            <RecentProviders />
          </section>
        </div>

        <div className="col-12 col-lg-5">
          <section aria-labelledby="recent-conversations-heading">
            <h2 id="recent-conversations-heading" className="section-label">
              Recent conversations
            </h2>
            <RecentConversations />
          </section>

          <div className="mt-4 d-flex flex-wrap gap-2">
            <FeatureLink
              to="/services"
              enabled={FEATURES.searchPage}
              className="btn btn-athletic"
            >
              Find a pro <ArrowRight />
            </FeatureLink>
            <Link to="/resident/profile" className="btn btn-trade">
              My profile <ArrowUpRight />
            </Link>
          </div>
        </div>
      </div>

      {/* Account / Logout Section at the bottom left */}
      <section className="surface-box p-4 mt-5 mb-4" style={{ maxWidth: 500 }}>
        <h3 className="section-label">Account</h3>
        <p className="text-muted-ink small mb-3">
          Signed in as <strong>{user.email}</strong>.
        </p>
        <button
          type="button"
          className="btn btn-danger-outline d-flex align-items-center gap-2"
          onClick={onLogout}
        >
          <LogOut size={16} /> Log out
        </button>
      </section>
      
    </div>
  );
}