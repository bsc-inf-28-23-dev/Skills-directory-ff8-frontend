import { useEffect, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  MapPin,
  MessageCircle,
  UserRound,
} from "lucide-react";
import { Link, Navigate } from "react-router-dom";
import ErrorAlert from "../../components/ErrorAlert";
import Eyebrow from "../../components/Eyebrow";
import LoadingSpinner from "../../components/LoadingSpinner";
import { categories } from "../../data/provider";
import { useAuth } from "../../hooks/useAuth";
import {
  createProviderProfile,
  getProviderProfileRouteId,
} from "../../data/providerAccount";
import type { User } from "../../types";
import type { ServiceProvider } from "../../types/serviceProvider";
import { getProviders, providerService } from "../../services/providerService";
import "./ProviderDashboardPage.css";

export default function ProviderDashboardPage() {
  const { user } = useAuth();
  const providerProfileId = getProviderProfileRouteId(user);
  const [provider, setProvider] = useState<ServiceProvider | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isCurrent = true;

    async function loadProfile(currentUser: User) {
      setLoading(true);
      setError("");
      try {
        const [providers, profile] = await Promise.all([
          getProviders(),
          providerService.getMyProfile(),
        ]);
        if (!isCurrent) return;

        const base =
          providers.find((item) => item.id === profile.id) ??
          providers.find((item) => item.id === providerProfileId) ??
          createProviderProfile(
            currentUser,
            categories,
            profile.id || providerProfileId || currentUser.id,
          );
        setProvider({
          ...base,
          id: profile.id || base.id,
          name: profile.businessName || base.name,
          person: profile.contactPerson || base.person,
          category: profile.category || base.category,
          area: profile.serviceArea || base.area,
          quote: profile.about || base.quote,
          rating: profile.rating ?? base.rating,
          reviews: profile.reviewCount ?? base.reviews,
          services:
            base.services.length > 0 ? base.services : profile.skills ?? [],
        });
      } catch (loadError: unknown) {
        console.error("Could not load the provider dashboard profile.", loadError);
        if (isCurrent) {
          setError(
            "Your provider dashboard could not load. Please try again.",
          );
        }
      } finally {
        if (isCurrent) setLoading(false);
      }
    }

    if (user?.role === "provider") void loadProfile(user);

    return () => {
      isCurrent = false;
    };
  }, [providerProfileId, user]);

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: "/provider/dashboard" }}
      />
    );
  }

  if (user.role !== "provider") {
    return <Navigate to="/resident/dashboard" replace />;
  }

  return (
    <main className="provider-dashboard">
      <div className="provider-dashboard__container">
        {error && <ErrorAlert message={error} />}
        {loading && <LoadingSpinner label="Loading your provider dashboard..." />}

        <section className="provider-dashboard__welcome">
          <div>
            <Eyebrow>Provider workspace</Eyebrow>
            <h1 className="display-heading display-heading-lg">
              Welcome back, <span className="text-primary">{user.fullName.trim().split(/\s+/)[0]}.</span>
            </h1>
            <p>Manage your services and stay connected with residents.</p>
          </div>
          <div className="provider-dashboard__welcome-actions">
            <Link
              to={`/provider/profile/${providerProfileId ?? user.id}`}
              className="btn provider-dashboard__profile-action"
            >
              <UserRound size={16} aria-hidden="true" />
              Business profile
            </Link>
            <Link to="/provider/services" className="btn btn-athletic">
              Manage services <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </section>

        {provider && (
          <>
            <section className="provider-dashboard__overview" aria-label="Provider overview">
              <article className="provider-dashboard__card provider-dashboard__service-summary">
                <span className="provider-dashboard__icon" aria-hidden="true">
                  <BriefcaseBusiness size={21} />
                </span>
                <p className="eyebrow">Your listing</p>
                <h2>{provider.name}</h2>
                <p className="provider-dashboard__meta">
                  {provider.category} <span aria-hidden="true">·</span>{" "}
                  <MapPin size={14} aria-hidden="true" /> {provider.area}
                </p>
                <div className="provider-dashboard__service-count">
                  <strong>{provider.services.length}</strong>
                  <span>
                    listed {provider.services.length === 1 ? "service" : "services"}
                  </span>
                </div>
                <Link to="/provider/services">
                  Edit your listing <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </article>

              <Link
                to="/provider/messages"
                className="provider-dashboard__card provider-dashboard__messages-card"
              >
                <span className="provider-dashboard__icon" aria-hidden="true">
                  <MessageCircle size={21} />
                </span>
                <p className="eyebrow">Stay connected</p>
                <h2>Messages</h2>
                <p>Read resident enquiries and continue your conversations.</p>
                <span className="provider-dashboard__card-link">
                  Open messages <ArrowRight size={15} aria-hidden="true" />
                </span>
              </Link>
            </section>

            <section className="provider-dashboard__services" aria-labelledby="provider-services-heading">
              <header>
                <div>
                  <p className="eyebrow">What you offer</p>
                  <h2 id="provider-services-heading">My services</h2>
                </div>
                <Link to="/provider/services" className="btn btn-trade">
                  Edit services
                </Link>
              </header>
              <ul>
                {provider.services.map((service) => (
                  <li key={service}>
                    <span className="provider-dashboard__service-check" aria-hidden="true">
                      <BriefcaseBusiness size={15} />
                    </span>
                    <span>{service}</span>
                    <ArrowRight size={15} aria-hidden="true" />
                  </li>
                ))}
              </ul>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
