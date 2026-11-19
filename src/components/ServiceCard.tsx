import { useState } from "react";
import { ArrowRight, Bookmark, MapPin, MessageCircle, Star } from "lucide-react";
import Avatar from "./Avatar";
import type { ServiceProvider } from "../types/serviceProvider";
import electrician from "../assets/providers/electrician.jpg";
import mechanical from "../assets/providers/mechanical.jpg";
import plumber from "../assets/providers/plumber.jpg";

interface ServiceCardProps {
  provider: ServiceProvider;
  service: string;
  isSaved: boolean;
  onStartChat: (provider: ServiceProvider, service: string) => void;
  onViewService: (provider: ServiceProvider, service: string) => void;
  onToggleSave: (provider: ServiceProvider, service: string) => void;
}

const categoryImages: Record<string, string> = {
  plumbing: plumber,
  electrical: electrician,
  "hvac & mechanical": mechanical,
  mechanical,
};

function getServiceImage(provider: ServiceProvider) {
  if (provider.photo) return provider.photo;

  const category = provider.category.trim().toLowerCase();
  return categoryImages[category] ?? categoryImages[category.split(" ")[0]];
}

export default function ServiceCard({
  provider,
  service,
  isSaved,
  onStartChat,
  onViewService,
  onToggleSave,
}: ServiceCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const image = getServiceImage(provider);

  return (
    <article className="marketplace-service-card">
      <div className="marketplace-service-card__media">
        {image && !imageFailed ? (
          <img
            src={image}
            alt={`${provider.category} service`}
            loading="lazy"
            onError={() => setImageFailed(true)}
          />
        ) : (
          <div
            className="marketplace-service-card__image-fallback"
            role="img"
            aria-label={`${provider.category} service`}
          >
            <span>{provider.category}</span>
          </div>
        )}
        <span className="marketplace-service-card__category">
          {provider.category}
        </span>
      </div>

      <div className="marketplace-service-card__body">
        <div className="marketplace-service-card__title-row">
          <h3>{service}</h3>
          <span className="marketplace-service-card__rating" aria-label={`${provider.rating.toFixed(1)} out of 5`}>
            <Star size={15} fill="currentColor" aria-hidden="true" />
            {provider.rating.toFixed(1)}
          </span>
        </div>

        <div className="marketplace-service-card__provider">
          <button
            type="button"
            className="marketplace-service-card__provider-avatar"
            aria-label={`View ${provider.name} profile`}
            onClick={() => onViewService(provider, service)}
          >
            <Avatar
              name={provider.person || provider.name}
              imageUrl={provider.photo}
              size={40}
            />
          </button>
          <div>
            <button
              type="button"
              className="marketplace-service-card__provider-name"
              onClick={() => onViewService(provider, service)}
            >
              {provider.name}
            </button>
            <span>{provider.person}</span>
          </div>
        </div>

        <div className="marketplace-service-card__meta">
          <span>
            <MapPin size={15} aria-hidden="true" />
            {provider.area}
          </span>
          <span>
            <Star size={15} aria-hidden="true" />
            {provider.reviews} reviews
          </span>
        </div>

        {provider.quote && (
          <blockquote className="marketplace-service-card__quote">
            “{provider.quote}”
            <cite>
              {provider.reviewer}
              {provider.date ? ` · ${provider.date}` : ""}
            </cite>
          </blockquote>
        )}

        <div className="marketplace-service-card__actions">
          <button
            type="button"
            className="marketplace-button marketplace-button--outline"
            onClick={() => onViewService(provider, service)}
          >
            View service <ArrowRight size={15} aria-hidden="true" />
          </button>
          <button
            type="button"
            className={`marketplace-icon-button marketplace-service-card__save${
              isSaved ? " is-saved" : ""
            }`}
            aria-label={`${isSaved ? "Remove" : "Save"} ${service}${
              isSaved ? " from" : " to"
            } saved services`}
            aria-pressed={isSaved}
            onClick={() => onToggleSave(provider, service)}
          >
            <Bookmark size={17} fill={isSaved ? "currentColor" : "none"} aria-hidden="true" />
          </button>
          <button
            type="button"
            className="marketplace-button marketplace-button--primary"
            onClick={() => onStartChat(provider, service)}
          >
            <MessageCircle size={15} aria-hidden="true" />
            Chat
          </button>
        </div>
      </div>
    </article>
  );
}
