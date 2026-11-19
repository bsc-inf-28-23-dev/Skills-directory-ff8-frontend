import { useState, type FormEvent } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import { ArrowRight, Bookmark, MessageCircle, Search, UserRound } from "lucide-react";
import ErrorAlert from "../components/ErrorAlert";
import Eyebrow from "../components/Eyebrow";
import { providers } from "../data/provider";
import RecentConversations from "../features/resident/RecentConversations";
import RecentProviders from "../features/resident/RecentProviders";
import { useAuth } from "../hooks/useAuth";
import { useSavedServices } from "../hooks/useSavedServices";
import "./ResidentDashboardPage.css";

export default function ResidentDashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [serviceSearch, setServiceSearch] = useState("");
  const {
    savedServices,
    error: savedServicesError,
  } = useSavedServices(user?.id);

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: "/resident/dashboard" }}
      />
    );
  }

  if (user.role !== "resident") {
    return <Navigate to="/provider/dashboard" replace />;
  }

  const firstName = user.fullName.trim().split(/\s+/)[0] || "there";
  const hasProfile = Boolean(
    user.bio ||
      user.avatarUrl ||
      user.location ||
      user.occupation ||
      (user.languages && user.languages.length > 0),
  );
  const visibleSavedServices = savedServices.slice(0, 3);

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const query = serviceSearch.trim();
    navigate(query ? `/?q=${encodeURIComponent(query)}#services` : "/#services");
  }

  return (
    <main className="page-container resident-home">
      <section className="resident-home__hero">
        <div className="resident-home__welcome">
          <Eyebrow>Your local service community</Eyebrow>
          <h1 className="display-heading display-heading-lg">
            Welcome back, <span className="text-primary">{firstName}.</span>
          </h1>
          <p>Find a trusted local professional or pick up where you left off.</p>
        </div>

        <form className="resident-home__search" onSubmit={handleSearch} role="search">
          <Search size={20} aria-hidden="true" />
          <input
            type="search"
            value={serviceSearch}
            onChange={(event) => setServiceSearch(event.target.value)}
            placeholder="What service do you need?"
            aria-label="Search services"
          />
          <button type="submit" className="btn btn-athletic">
            Find services
          </button>
        </form>

      </section>

      {!hasProfile && (
        <section className="resident-home__profile-prompt" aria-label="Complete your profile">
          <div>
            <p className="eyebrow mb-2">A better introduction</p>
            <h2 className="display-heading display-heading-md">
              Complete your profile
            </h2>
            <p>
              Add a photo and a few details so providers know who they are
              speaking with.
            </p>
          </div>
          <Link to="/resident/profile" className="btn btn-trade">
            Set up profile <UserRound size={16} aria-hidden="true" />
          </Link>
        </section>
      )}

      <div className="resident-home__activity-grid">
        <section
          className="resident-home__section resident-home__recent"
          aria-labelledby="recent-providers-heading"
        >
          <div className="resident-home__section-heading">
            <div>
              <p className="eyebrow mb-1">Pick up where you left off</p>
              <h2 id="recent-providers-heading">Recently viewed providers</h2>
            </div>
            <Link to="/#services" aria-label="Explore all services">
              Explore <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
          <RecentProviders />
        </section>

        <div className="resident-home__side-column">
          <section
            className="resident-home__section resident-home__saved"
            aria-labelledby="saved-services-heading"
          >
            <div className="resident-home__section-heading">
              <div>
                <p className="eyebrow mb-1">Your shortlist</p>
                <h2 id="saved-services-heading">Saved services</h2>
              </div>
              <Link to="/resident/saved">
                View all <ArrowRight size={15} aria-hidden="true" />
              </Link>
            </div>

            {savedServicesError && (
              <ErrorAlert message={savedServicesError} />
            )}

            {visibleSavedServices.length > 0 ? (
              <ul className="resident-home__saved-list">
                {visibleSavedServices.map((saved) => {
                  const provider = providers.find(
                    (item) => item.id === saved.providerId,
                  );
                  return (
                    <li key={`${saved.providerId}-${saved.service}`}>
                      <Link
                        to={`/services/providers/${saved.providerId}?service=${encodeURIComponent(saved.service)}`}
                      >
                        <span className="resident-home__saved-icon">
                          <Bookmark size={16} aria-hidden="true" />
                        </span>
                        <span className="resident-home__saved-copy">
                          <strong>{saved.service}</strong>
                          <small>{provider?.name ?? "Service provider"}</small>
                        </span>
                        <ArrowRight size={16} aria-hidden="true" />
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ) : (
              <div className="resident-home__empty">
                <Bookmark size={21} aria-hidden="true" />
                <p>Save services you want to compare or revisit.</p>
                <Link to="/#services">Explore services</Link>
              </div>
            )}
          </section>

          <section
            className="resident-home__section resident-home__messages"
            aria-labelledby="recent-conversations-heading"
          >
            <div className="resident-home__section-heading">
              <div>
                <p className="eyebrow mb-1">Stay in touch</p>
                <h2 id="recent-conversations-heading">Recent messages</h2>
              </div>
              <Link to="/resident/messages" aria-label="View all messages">
                <MessageCircle size={17} aria-hidden="true" />
              </Link>
            </div>
            <RecentConversations />
          </section>
        </div>
      </div>
    </main>
  );
}
