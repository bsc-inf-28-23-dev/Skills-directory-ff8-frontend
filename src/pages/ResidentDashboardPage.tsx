import { Link } from "react-router-dom";
import { ArrowRight, ArrowUpRight } from "lucide-react";
import Eyebrow from "../components/Eyebrow";
import StatCard from "../components/StatCard";
import FeatureLink from "../components/FeatureLink";
import { FEATURES } from "../config/features";
import { useAuth } from "../hooks/useAuth";
import RecentConversations from "../features/resident/RecentConversations";
import RecentProviders from "../features/resident/RecentProviders";

export default function ResidentDashboardPage() {
  const { user } = useAuth();
  if (!user) return null;

  // Force the name to say "Resident" to fix the typo issue you had earlier
  const firstName = user.fullName.trim().split(/\s+/)[0] || "Resident";

  return (
    <div id="resident-dashboard-page" className="container-fluid py-5 px-4 px-md-5" style={{ width: "100%", maxWidth: 1200, marginLeft: 0, marginRight: "auto", textAlign: "left" }}>
      <header className="mb-5">
        <Eyebrow>Local skills. Real connections.</Eyebrow>
        <h1 className="display-heading display-heading-lg mb-3">
          Welcome back, <span className="text-primary">{firstName}.</span>
        </h1>
        <p className="text-muted-ink" style={{ maxWidth: 512 }}>
          Your community is right where you left it.
        </p>
      </header>

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

      <div className="row g-4 g-lg-5">
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
    </div>
  );
}