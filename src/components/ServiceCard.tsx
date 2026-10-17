
import { useState } from "react";
import type { Provider } from "../types/provider";

interface ServiceCardProps {
  provider: Provider;
  service: string;
  onViewProvider: (provider: Provider) => void;
  onStartChat: (
    provider: Provider,
    service: string
  ) => void;
}

export default function ServiceCard({
  provider,
  service,
  onViewProvider,
  onStartChat,
}: ServiceCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  const showImage = Boolean(provider.photo) && !imageFailed;

  return (
    <article className="card provider-card h-100">
      {showImage ? (
        <img
          src={provider.photo}
          className="card-img-top"
          alt={`${provider.name} service`}
          loading="lazy"
          onError={() => setImageFailed(true)}
        />
      ) : (
        <div
          className="provider-image-fallback"
          aria-label={`No image available for ${provider.name}`}
          role="img"
        >
          <span>{provider.initials || provider.name.slice(0, 2).toUpperCase()}</span>
          <small>LOCAL SERVICE PROVIDER</small>
        </div>
      )}

      <div className="card-body d-flex flex-column">
        <div className="d-flex justify-content-between align-items-start gap-2">
          <div className="min-w-0">
            <p className="provider-category-label mb-2">
              {provider.category}
            </p>

            <h3 className="card-title mb-2">
              {service}
            </h3>
          </div>

          <span className="rating-badge">
            ★ {provider.rating.toFixed(1)}
          </span>
        </div>

        <p className="provider-name mb-2">
          {provider.name}
        </p>

        <p className="provider-meta mb-3">
          <span aria-hidden="true">⌖ </span>
          {provider.area}
        </p>

        <div className="provider-review mb-3">
          <span aria-hidden="true">★ </span>
          {provider.rating.toFixed(1)} rating
          <span className="review-count">
            {" "}({provider.reviews} reviews)
          </span>
        </div>

        <div className="provider-actions mt-auto">
          <button
            type="button"
            className="btn btn-brand"
            onClick={() => onStartChat(provider, service)}
          >
            Chat demo
          </button>

          <button
            type="button"
            className="btn btn-provider-outline"
            onClick={() => onViewProvider(provider)}
          >
            View provider
          </button>
        </div>
      </div>
    </article>
  );
}
