import {
  ArrowLeft,
  BadgeCheck,
  Clock3,
  MapPin,
  MessageCircle,
  Phone,
  Mail,
  Star,
} from "lucide-react";
import { Navigate, useLocation, useNavigate, useSearchParams } from "react-router-dom";
import Avatar from "../components/Avatar";
import { useAuth } from "../hooks/useAuth";
import type { ServiceProvider } from "../types/serviceProvider";

export default function ServiceDetailsPage({
  provider,
  onBack,
}: {
  provider: ServiceProvider;
  onBack: () => void;
}) {
  const { user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  if (!user) {
    return (
      <Navigate
        to="/login"
        replace
        state={{ from: `${location.pathname}${location.search}` }}
      />
    );
  }

  const requestedService = searchParams.get("service");
  const selectedService = provider.services.includes(requestedService ?? "")
    ? requestedService
    : provider.services[0];
  const profile = provider.profile;

  return (
    <main className="marketplace-detail">
      <div className="page-container">
        <button
          type="button"
          className="marketplace-detail__back"
          onClick={onBack}
        >
          <ArrowLeft size={17} aria-hidden="true" />
          Back to services
        </button>

        <article className="marketplace-detail__card">
          <header className="marketplace-detail__header">
            {profile?.coverImage && (
              <img
                className="marketplace-detail__cover"
                src={profile.coverImage}
                alt=""
              />
            )}
            <div>
              <p className="marketplace-eyebrow">{provider.category}</p>
              <h1>{selectedService || provider.name}</h1>
              <p className="marketplace-detail__business">{provider.name}</p>
              {profile?.tagline && (
                <p className="marketplace-detail__tagline">{profile.tagline}</p>
              )}
            </div>
            <div className="marketplace-detail__rating">
              <Star size={17} fill="currentColor" aria-hidden="true" />
              <strong>{provider.rating.toFixed(1)}</strong>
              <span>{provider.reviews} reviews</span>
            </div>
          </header>

          <div className="marketplace-detail__content">
            <section className="marketplace-detail__main">
              <h2>About this service</h2>
              <p>
                {provider.quote ||
                  `${provider.name} provides ${provider.category.toLowerCase()} services in ${provider.area}.`}
              </p>

              <h2>Services offered</h2>
              <ul className="marketplace-detail__services">
                {provider.services.map((service) => (
                  <li
                    key={service}
                    className={service === selectedService ? "is-selected" : ""}
                  >
                    {service}
                  </li>
                ))}
              </ul>

              {provider.reviewer && provider.quote && (
                <blockquote className="marketplace-detail__review">
                  “{provider.quote}”
                  <cite>
                    {provider.reviewer}
                    {provider.date ? ` · ${provider.date}` : ""}
                  </cite>
                </blockquote>
              )}

              {profile && (
                <>
                  {profile.skills.length > 0 && (
                    <section className="marketplace-detail__profile-section">
                      <h2>Expertise</h2>
                      <div className="marketplace-detail__profile-tags">
                        {profile.skills.map((skill) => <span key={skill}>{skill}</span>)}
                      </div>
                    </section>
                  )}
                  {profile.additionalCategories.length > 0 && (
                    <section className="marketplace-detail__profile-section">
                      <h2>More services</h2>
                      <div className="marketplace-detail__profile-tags">
                        {profile.additionalCategories.map((item) => <span key={item}>{item}</span>)}
                      </div>
                    </section>
                  )}
                  {profile.yearsExperience !== null && profile.yearsExperience !== undefined && (
                    <p className="marketplace-detail__profile-meta">
                      {profile.yearsExperience} {profile.yearsExperience === 1 ? "year" : "years"} of experience
                    </p>
                  )}
                  {profile.qualifications.length > 0 && (
                    <section className="marketplace-detail__profile-section">
                      <h2>Qualifications</h2>
                      <p className="marketplace-detail__disclaimer">
                        Listed by the provider; qualifications are not verified unless marked below.
                      </p>
                      <ul className="marketplace-detail__qualification-list">
                        {profile.qualifications.map((qualification) => (
                          <li key={qualification}>{qualification}</li>
                        ))}
                        {profile.verificationDocuments
                          .filter((document) => document.status === "verified")
                          .map((document) => (
                            <li className="is-verified" key={document.id}>
                              <BadgeCheck size={15} aria-hidden="true" />
                              {document.name} · Verified
                            </li>
                          ))}
                      </ul>
                    </section>
                  )}
                  {profile.portfolio.length > 0 && (
                    <section className="marketplace-detail__profile-section">
                      <h2>Recent work</h2>
                      <div className="marketplace-detail__portfolio">
                        {profile.portfolio.map((item) => (
                          <article key={item.id}>
                            <img src={item.imageUrl} alt={item.title || "Provider portfolio work"} />
                            {(item.title || item.description) && (
                              <div>
                                {item.title && <strong>{item.title}</strong>}
                                {item.description && <p>{item.description}</p>}
                              </div>
                            )}
                          </article>
                        ))}
                      </div>
                    </section>
                  )}
                </>
              )}
            </section>

            <aside className="marketplace-detail__provider">
              {profile?.businessLogo && (
                <img
                  className="marketplace-detail__business-logo"
                  src={profile.businessLogo}
                  alt={`${provider.name} logo`}
                />
              )}
              {profile?.verificationStatus === "verified" && (
                <span className="marketplace-detail__verified">
                  <BadgeCheck size={14} aria-hidden="true" />
                  Verified provider
                </span>
              )}
              <div className="marketplace-detail__provider-heading">
                <Avatar
                  name={provider.person || provider.name}
                  imageUrl={provider.photo}
                  size={58}
                />
                <div>
                  <h2>{provider.person || provider.name}</h2>
                  <p>{provider.name}</p>
                </div>
              </div>
              <p className="marketplace-detail__location">
                <MapPin size={17} aria-hidden="true" />
                Serves {profile?.areasServed.length ? profile.areasServed.join(", ") : profile?.city || provider.area}
              </p>
              {profile?.businessHours && (
                <p className="marketplace-detail__public-meta">
                  <Clock3 size={15} aria-hidden="true" /> {profile.businessHours}
                </p>
              )}
              {profile?.physicalPremises && profile.businessAddress && (
                <p className="marketplace-detail__public-meta">
                  <MapPin size={15} aria-hidden="true" /> {profile.businessAddress}
                </p>
              )}
              {profile?.showPublicPhone && profile.publicPhone && (
                <a className="marketplace-detail__public-contact" href={`tel:${profile.publicPhone}`}>
                  <Phone size={15} aria-hidden="true" /> {profile.publicPhone}
                </a>
              )}
              {profile?.showPublicEmail && profile.publicEmail && (
                <a className="marketplace-detail__public-contact" href={`mailto:${profile.publicEmail}`}>
                  <Mail size={15} aria-hidden="true" /> {profile.publicEmail}
                </a>
              )}
              {profile?.travelsToCustomer && (
                <p className="marketplace-detail__public-meta">Travels to customers</p>
              )}
              <button
                type="button"
                className="marketplace-button marketplace-button--primary marketplace-detail__message"
                onClick={() => navigate(`/conversation/${provider.id}`)}
              >
                <MessageCircle size={17} aria-hidden="true" />
                Message provider
              </button>
              <p className="marketplace-detail__hint">
                Send a message to ask about availability or request a quote.
              </p>
            </aside>
          </div>
        </article>
      </div>
    </main>
  );
}
