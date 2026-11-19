import { Bookmark, Search } from "lucide-react";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import ErrorAlert from "../components/ErrorAlert";
import ServiceCard from "../components/ServiceCard";
import { useAuth } from "../hooks/useAuth";
import { useSavedServices } from "../hooks/useSavedServices";
import type { ServiceProvider } from "../types/serviceProvider";

export default function SavedServicesPage({
  providers,
}: {
  providers: ServiceProvider[];
}) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { savedServices, toggleSavedService, error } = useSavedServices(user?.id);

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  if (user.role !== "resident") {
    return <Navigate to="/provider/dashboard" replace />;
  }

  const listings = savedServices.flatMap((saved) => {
    const provider = providers.find((item) => item.id === saved.providerId);
    return provider && provider.services.includes(saved.service)
      ? [{ provider, service: saved.service }]
      : [];
  });
  const unavailableServices = savedServices.filter(
    (saved) =>
      !providers.some(
        (provider) =>
          provider.id === saved.providerId &&
          provider.services.includes(saved.service),
      ),
  );

  return (
    <main className="marketplace-main marketplace-saved">
      <div className="page-container">
        <header className="marketplace-section-heading">
          <div>
            <p className="marketplace-eyebrow">Your shortlist</p>
            <h1>Saved services</h1>
          </div>
          <span className="marketplace-result-count">
            {listings.length} {listings.length === 1 ? "service" : "services"}
          </span>
        </header>

        {error && <ErrorAlert message={error} />}

        {unavailableServices.length > 0 && (
          <div className="marketplace-data-note" role="status">
            Some saved listings are no longer available. Remove them from this
            page to clear your saved list.
            <div className="marketplace-saved__unavailable">
              {unavailableServices.map((saved) => (
                <button
                  type="button"
                  key={`${saved.providerId}-${saved.service}`}
                  onClick={() => toggleSavedService(saved)}
                >
                  Remove {saved.service}
                </button>
              ))}
            </div>
          </div>
        )}

        {listings.length > 0 ? (
          <div className="marketplace-service-grid">
            {listings.map(({ provider, service }) => (
              <ServiceCard
                key={`${provider.id}-${service}`}
                provider={provider}
                service={service}
                isSaved
                onToggleSave={(selectedProvider, selectedService) =>
                  toggleSavedService({
                    providerId: selectedProvider.id,
                    service: selectedService,
                  })
                }
                onViewService={(selectedProvider, selectedService) =>
                  navigate(
                    `/services/providers/${selectedProvider.id}?service=${encodeURIComponent(selectedService)}`,
                  )
                }
                onStartChat={(provider) =>
                  navigate(`/conversation/${provider.id}`)
                }
              />
            ))}
          </div>
        ) : (
          <div className="marketplace-empty-state">
            <Bookmark size={24} aria-hidden="true" />
            <h2>No saved services yet</h2>
            <p>Save services you want to compare or come back to later.</p>
            <Link
              to="/#services"
              className="marketplace-button marketplace-button--primary"
            >
              <Search size={16} aria-hidden="true" />
              Explore services
            </Link>
          </div>
        )}
      </div>
    </main>
  );
}
