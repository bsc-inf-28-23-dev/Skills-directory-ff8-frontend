import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import EmptyState from "../../components/EmptyState";
import ErrorAlert from "../../components/ErrorAlert";
import LoadingSpinner from "../../components/LoadingSpinner";
import ProviderCover from "../../components/ProviderCover";
import { FEATURES } from "../../config/features";
import { useAsync } from "../../hooks/useAsync";
import { getRecentlyViewedProviders } from "../../services/residentService";
import { StarDisplay } from "../reviews/StarRating";

export default function RecentProviders() {
  const { data, loading, error, reload } = useAsync(getRecentlyViewedProviders);

  if (loading) return <LoadingSpinner label="Loading providers..." />;
  if (error) return <ErrorAlert message={error.message} onRetry={reload} />;
  if (!data || data.length === 0) {
    return (
      <EmptyState icon="bi-clock-history" title="No recently viewed providers">
        Providers you look at will appear here.
      </EmptyState>
    );
  }

  return (
    <div className="row g-3">
      {data.map((p) => (
        <div className="col-12 col-md-6" key={p.id}>
          <article className="provider-card h-100">
            <ProviderCover provider={p} />
            <div className="p-4 d-flex flex-column gap-2 flex-grow-1">
              <div className="d-flex justify-content-between align-items-start gap-2">
                <h3 className="display-heading display-heading-md mb-0" style={{ fontSize: 20 }}>
                  {p.name}
                </h3>
                {p.averageRating != null && (
                  <span className="rating-badge">
                    <StarDisplay value={p.averageRating} size="0.75rem" />
                    {p.averageRating.toFixed(1)}
                  </span>
                )}
              </div>
              <div className="small text-muted-ink text-uppercase" style={{ letterSpacing: "0.08em" }}>
                {p.category}
                {p.serviceArea ? ` · ${p.serviceArea}` : ""}
                {p.reviewCount != null ? ` · ${p.reviewCount} reviews` : ""}
              </div>
              {p.description && <p className="text-muted-ink small mb-0 text-truncate-2">{p.description}</p>}
              <div className="d-flex gap-2 mt-auto pt-3">
                <Link
                  to={FEATURES.providerProfilePage ? `/providers/${p.id}` : `/providers/${p.id}/reviews`}
                  className="btn btn-athletic flex-fill"
                >
                  {FEATURES.providerProfilePage ? "Live chat" : "Reviews"} <ArrowUpRight />
                </Link>
                <Link
                  to={FEATURES.providerProfilePage ? `/providers/${p.id}` : `/providers/${p.id}/reviews`}
                  className="btn btn-trade flex-fill"
                >
                  Profile
                </Link>
              </div>
            </div>
          </article>
        </div>
      ))}
    </div>
  );
}