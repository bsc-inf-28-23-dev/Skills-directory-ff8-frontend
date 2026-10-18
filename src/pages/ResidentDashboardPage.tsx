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

  const firstName = user.fullName.trim().split(/\s+/)[0];

  const hasProfile = Boolean(
    user.bio ||
      user.avatarUrl ||
      user.location ||
      user.occupation ||
      (user.languages && user.languages.length > 0) ||
      user.gender ||
      user.dateOfBirth,
  );

  return (
    <div className="page-container py-5">
      <header className="mb-5">
        <Eyebrow>Local skills. Real connections.</Eyebrow>
        <h1 className="display-heading display-heading-lg mb-3">
          Welcome back, <span className="text-primary">{firstName}.</span>
        </h1>
        <p className="text-muted-ink" style={{ maxWidth: 512 }}>
          Your community is right where you left it.
        </p>
      </header>

      {!hasProfile && (
        <section
          className="surface-box p-4 p-md-5 mb-5 d-flex justify-content-between align-items-center flex-wrap gap-3"
          aria-label="Complete your profile"
        >
          <div>
            <div className="eyebrow mb-2">Get started</div>
            <h2
              className="display-heading display-heading-md mb-2"
              style={{ fontSize: 22 }}
            >
              Create your profile.
            </h2>
            <p className="text-muted-ink mb-0" style={{ maxWidth: 480 }}>
              Add a photo, a short bio, and a few details so the community knows
              who you are.
            </p>
          </div>
          <Link to="/resident/profile" className="btn btn-athletic">
            Create profile <ArrowUpRight />
          </Link>
        </section>
      )}

      <div className="row g-3 mb-5">
        <div className="col-12 col-md-4">
          <StatCard value="-" label="Providers viewed" />
        </div>
        <div className="col-12 col-md-4">
          <StatCard value="-" label="Reviews written" />
        </div>
        <div className="col-12 col-md-4">
          <StatCard value="-!" label="Conversations" />
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