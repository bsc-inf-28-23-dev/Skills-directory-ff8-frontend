import { useMemo, useState } from "react";

import ProviderMap from "../components/ProviderMap";
import ServiceCard from "../components/ServiceCard";
import type { Provider } from "../types/provider";

interface DirectoryPageProps {
  providers: Provider[];
  categories: string[];
  onOpenProfile: () => void;
}

export default function DirectoryPage({
  providers,
  categories,
  onOpenProfile,
}: DirectoryPageProps) {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [showReviews, setShowReviews] = useState(false);
  const [showHelp, setShowHelp] = useState(false);
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(
    null,
  );
  const [chatTarget, setChatTarget] = useState<{
    provider: Provider;
    service: string;
  } | null>(null);

  const listings = useMemo(() => {
    const term = keyword.trim().toLowerCase();

    return providers
      .flatMap((provider) =>
        provider.services.map((service) => ({
          provider,
          service,
        })),
      )
      .filter(({ provider, service }) => {
        const matchesCategory = !category || provider.category === category;
        const matchesSearch =
          !term ||
          `${service} ${provider.name} ${provider.category}`
            .toLowerCase()
            .includes(term);

        return matchesCategory && matchesSearch;
      })
      .sort((a, b) => b.provider.rating - a.provider.rating);
  }, [keyword, category, providers]);

  const visibleProviders = useMemo(() => {
    const ids = new Set(listings.map(({ provider }) => provider.id));

    return providers.filter((provider) => ids.has(provider.id));
  }, [listings, providers]);

  return (
    <>
      <header className="site-header">
        <nav className="navbar navbar-expand-lg">
          <div className="page-container d-flex align-items-center justify-content-between gap-3 w-100">
            <a
              href="/"
              className="d-flex align-items-center gap-2"
              aria-label="Skillz Directory home"
            >
              <span className="brand-mark">S</span>
              <span className="brand-name">
                Skillz<span className="brand-accent">Directory</span>
              </span>
            </a>

            <button
              type="button"
              className="nav-toggle d-lg-none"
              aria-label={mobileNavOpen ? "Close navigation" : "Open navigation"}
              aria-expanded={mobileNavOpen}
              onClick={() => setMobileNavOpen((open) => !open)}
            >
              <span aria-hidden="true">{mobileNavOpen ? "×" : "☰"}</span>
            </button>

            <div className={`site-nav${mobileNavOpen ? " is-open" : ""}`}>
              <a
                className="nav-link active"
                href="#services"
                onClick={() => setMobileNavOpen(false)}
              >
                Browse services
              </a>
              <button
                className="nav-link border-0 bg-transparent"
                onClick={() => {
                  setShowReviews(true);
                  setMobileNavOpen(false);
                }}
              >
                Reviews
              </button>
              <button
                className="nav-link border-0 bg-transparent"
                onClick={() => {
                  setShowHelp(true);
                  setMobileNavOpen(false);
                }}
              >
                How it works
              </button>
              <button
                type="button"
                className="nav-link border-0 bg-transparent d-md-none"
                onClick={() => {
                  onOpenProfile();
                  setMobileNavOpen(false);
                }}
              >
                Provider profile
              </button>
            </div>

            <div className="d-flex align-items-center gap-2">
              <button
                type="button"
                className="btn provider-cta"
                onClick={onOpenProfile}
              >
                Provider profile
              </button>
            </div>
          </div>
        </nav>
      </header>

      <section className="hero-section">
        <div className="page-container">
          <h1 className="hero-title">
            Every skill on your <span className="brand-accent">street.</span>{" "}
            <span className="d-none d-xl-inline">Listed.</span>
          </h1>

          <p className="hero-description">
            Browse the services local providers offer, compare resident ratings,
            and preview a message when a provider fits the job.
          </p>

          <form
            className="search-row"
            onSubmit={(event) => {
              event.preventDefault();
              setKeyword(keyword.trim());
            }}
          >
            <label className="form-label mb-0 text-secondary">FILTER:</label>
            <input
              className="form-control search-input"
              value={keyword}
              onChange={(event) => setKeyword(event.target.value)}
              placeholder="e.g. drain clearing, rewiring, AC maintenance"
              aria-label="Search services"
            />

            <button type="submit" className="btn-brand px-4">
              Search
            </button>
          </form>
        </div>
      </section>

      <main className="container py-4">
        <div className="d-flex flex-wrap gap-2 mb-4">
          <button
            className={`btn ${
              category === "" ? "btn-dark" : "btn-outline-dark"
            }`}
            onClick={() => setCategory("")}
          >
            All services
          </button>

          {categories.map((trade) => (
            <button
              key={trade}
              className={`btn ${
                category === trade ? "btn-dark" : "btn-outline-dark"
              }`}
              onClick={() => setCategory(category === trade ? "" : trade)}
            >
              {trade}
            </button>
          ))}
        </div>

        <section className="mb-5">
          <div className="d-flex justify-content-between align-items-center mb-3">
            <div>
              <h2 className="h4 mb-1">Providers in Zomba</h2>
              <p className="text-secondary small mb-0">
                Sample provider locations for demonstration.
              </p>
            </div>
            <span className="text-secondary small">
              {visibleProviders.length} providers
            </span>
          </div>

          <ProviderMap
            providers={visibleProviders}
            onSelectProvider={setSelectedProvider}
          />
        </section>

        <section id="services">
          <h2 className="h4 mb-3">
            {keyword || category ? "Matching services" : "All services"}
          </h2>

          <p className="text-secondary small">
            {listings.length} services found · Sample listings and ratings
          </p>

          {listings.length > 0 ? (
            <div className="row g-4">
              {listings.map(({ provider, service }) => (
                <div
                  className="col-12 col-md-6 col-lg-4"
                  key={`${provider.id}-${service}`}
                >
                  <ServiceCard
                    provider={provider}
                    service={service}
                    onViewProvider={setSelectedProvider}
                    onStartChat={(chatProvider, chatService) =>
                      setChatTarget({
                        provider: chatProvider,
                        service: chatService,
                      })
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="alert alert-light border">
              No services match. Try another keyword or clear the category
              filter.
              <button
                className="btn btn-link"
                onClick={() => {
                  setKeyword("");
                  setCategory("");
                }}
              >
                Clear filters
              </button>
            </div>
          )}
        </section>

        {selectedProvider && (
          <div
            className="modal d-block"
            tabIndex={-1}
            role="dialog"
            aria-modal="true"
            aria-label="Provider details"
            style={{ background: "rgba(0,0,0,.5)" }}
            onClick={() => setSelectedProvider(null)}
          >
            <div
              className="modal-dialog modal-dialog-centered"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="modal-content">
                <div className="modal-header">
                  <h2 className="modal-title fs-5">{selectedProvider.name}</h2>
                  <button
                    className="btn-close"
                    aria-label="Close"
                    onClick={() => setSelectedProvider(null)}
                  />
                </div>

                <div className="modal-body">
                  <p>{selectedProvider.person}</p>
                  <p>{selectedProvider.category}</p>
                  <p>
                    ★ {selectedProvider.rating} · {selectedProvider.reviews}{" "}
                    reviews
                  </p>

                  <ul>
                    {selectedProvider.services.map((service) => (
                      <li key={service}>{service}</li>
                    ))}
                  </ul>

                  <blockquote>"{selectedProvider.quote}"</blockquote>
                </div>
              </div>
            </div>
          </div>
        )}

        {chatTarget && (
          <div className="alert alert-info mt-4">
            Chat preview for {chatTarget.provider.name}, regarding{" "}
            {chatTarget.service}.
            <button
              className="btn btn-sm btn-outline-dark ms-3"
              onClick={() => setChatTarget(null)}
            >
              Close
            </button>
            <p className="small mb-0 mt-2">
              Demo only: this message has not been sent to the provider.
            </p>
          </div>
        )}
      </main>

      {(showReviews || showHelp) && (
        <div
          className="modal d-block"
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          aria-label={showReviews ? "Example provider reviews" : "How it works"}
          style={{ background: "rgba(0,0,0,.5)" }}
          onClick={() => {
            setShowReviews(false);
            setShowHelp(false);
          }}
        >
          <div
            className="modal-dialog modal-dialog-centered"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="modal-content">
              <div className="modal-header">
                <h2 className="modal-title fs-5">
                  {showReviews ? "Example provider reviews" : "How it works"}
                </h2>
                <button
                  className="btn-close"
                  aria-label="Close"
                  onClick={() => {
                    setShowReviews(false);
                    setShowHelp(false);
                  }}
                />
              </div>
              <div className="modal-body">
                {showReviews ? (
                  <>
                    <p className="text-secondary small">
                      Sample review content used for the project demo.
                    </p>
                    {providers.map((provider) => (
                      <div key={provider.id} className="mb-3">
                        <h3 className="h6 mb-1">{provider.name}</h3>
                        <p className="mb-1">
                          ★ {provider.rating} · {provider.reviews} reviews
                        </p>
                        <blockquote className="mb-1">
                          "{provider.quote}"
                        </blockquote>
                        <p className="text-secondary small mb-0">
                          {provider.reviewer} · {provider.date}
                        </p>
                      </div>
                    ))}
                  </>
                ) : (
                  <>
                    <ol className="mb-0">
                      <li>Browse services and compare local providers.</li>
                      <li>Check ratings and provider details.</li>
                      <li>Preview a message to the provider.</li>
                    </ol>
                    <p className="text-secondary small mt-3 mb-0">
                      Messages are not delivered; sending them requires a
                      connected backend.
                    </p>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <footer className="footer-section py-4 mt-5">
        <div className="container">
          <p className="mb-1">© 2026 Skillz Directory</p>
          <p className="small mb-0">Local skills. Real connections.</p>
        </div>
      </footer>
    </>
  );
}
