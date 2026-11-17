import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowRight, ArrowUpRight, LogOut } from "lucide-react";
import Eyebrow from "../components/Eyebrow";
import StatCard from "../components/StatCard";
import FeatureLink from "../components/FeatureLink";
import { FEATURES } from "../config/features";
import { useAuth } from "../hooks/useAuth";
import RecentConversations from "../features/resident/RecentConversations";
import RecentProviders from "../features/resident/RecentProviders";
import { getRecentlyViewedProviders, getRecentConversations } from "../services/residentService";

export default function ResidentDashboardPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  
  const [stats, setStats] = useState({ providersViewed: 0, reviewsWritten: 0, conversations: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        // Fetch real data from backend
        const [providers, conversations] = await Promise.all([
          getRecentlyViewedProviders().catch(() => []),
          getRecentConversations(5).catch(() => [])
        ]);
        
        setStats({
          providersViewed: providers.length,
          reviewsWritten: 0, // Update this if the backend has an endpoint for it
          conversations: conversations.length
        });
      } catch (error) {
        console.error("Failed to load dashboard data:", error);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (!user) return null;

  // This variable is now used in the JSX below
  const firstName = user.fullName.trim().split(/\s+/)[0] || "Resident";

  const onLogout = async () => {
    await logout();
    navigate("/login", { replace: true });
  };

  return (
    <div className="container-fluid py-5 px-4 px-md-5" style={{ width: "100%", maxWidth: 1200, marginLeft: 0, marginRight: "auto", textAlign: "left" }}>
      
      <header className="mb-5">
        <Eyebrow>Local skills. Real connections.</Eyebrow>
        <h1 className="display-heading mb-3" style={{ lineHeight: 1.1 }}>
          <span style={{ fontSize: "56px", color: "var(--ink)" }}>WELCOME BACK,</span>{" "}
          <span style={{ fontSize: "88px", color: "var(--primary)" }}>{firstName.toUpperCase()}.</span>
        </h1>
        <p className="text-muted-ink" style={{ maxWidth: 512, fontSize: 18 }}>
          Your community is right where you left it.
        </p>
      </header>

      <div className="row g-3 mb-5">
        <div className="col-12 col-md-4">
          <StatCard value={loading ? "—" : stats.providersViewed.toString()} label="Providers viewed" />
        </div>
        <div className="col-12 col-md-4">
          <StatCard value={loading ? "—" : stats.reviewsWritten.toString()} label="Reviews written" />
        </div>
        <div className="col-12 col-md-4">
          <StatCard value={loading ? "—" : stats.conversations.toString()} label="Conversations" />
        </div>
      </div>

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
            <FeatureLink to="/services" enabled={FEATURES.searchPage} className="btn btn-athletic">
              Find a pro <ArrowRight />
            </FeatureLink>
            <Link to="/resident/profile" className="btn btn-trade">
              My profile <ArrowUpRight />
            </Link>
          </div>
        </div>
      </div>

      <section className="surface-box p-4 mt-5 mb-4" style={{ maxWidth: 500 }}>
        <h3 className="section-label">Account</h3>
        <p className="text-muted-ink small mb-3">
          Signed in as <strong>{user.email}</strong>.
        </p>
        <button type="button" className="btn btn-danger-outline d-flex align-items-center gap-2" onClick={onLogout}>
          <LogOut size={16} /> Log out
        </button>
      </section>
      
    </div>
  );
}