import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import ServiceCard from "../components/ServiceCard";
import type { ServiceProvider } from "../types/serviceProvider";

interface DirectoryPageProps {
  providers: ServiceProvider[];
  categories: string[];
}

export default function DirectoryPage({
  providers,
  categories,
}: DirectoryPageProps) {
  const [keyword, setKeyword] = useState("");
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("All areas");
  const navigate = useNavigate();

  const areas = useMemo(
    () => ["All areas", ...new Set(providers.map((provider) => provider.area))],
    [providers],
  );

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
        const matchesArea = area === "All areas" || provider.area === area;
        const matchesSearch =
          !term ||
          `${service} ${provider.name} ${provider.category} ${provider.area}`
            .toLowerCase()
            .includes(term);

        return matchesCategory && matchesArea && matchesSearch;
      })
      .sort((a, b) => b.provider.rating - a.provider.rating);
  }, [keyword, category, area, providers]);

  function clearFilters() {
    setKeyword("");
    setCategory("");
    setArea("All areas");
  }

  return (
    <>
      <section className="hero-section">
        <div className="container">
          <div className="hero-copy">
            <h1 className="hero-title">
              Find a service <span className="brand-accent">near you.</span>
            </h1>
            <p className="hero-description">
              Browse local providers and find the right service for your job.
            </p>
            <form
              className="directory-search-form"
              onSubmit={(event) => {
                event.preventDefault();
                setKeyword(keyword.trim());
              }}
            >
              <input
                className="form-control search-input"
                value={keyword}
                onChange={(event) => setKeyword(event.target.value)}
                placeholder="Search services or providers"
                aria-label="Search services or providers"
              />
              <button type="submit" className="btn-brand directory-search-button">
                Search
              </button>
            </form>
          </div>
        </div>
      </section>

      <main className="container pt-3 pb-4">
        <div className="directory-filter-bar mb-3">
          <label className="directory-filter" htmlFor="service-filter">
            <span className="directory-filter-label">Service type</span>
            <select
              id="service-filter"
              className="form-select directory-select"
              value={category}
              onChange={(event) => setCategory(event.target.value)}
            >
              <option value="">All services</option>
              {categories.map((trade) => (
                <option key={trade} value={trade}>
                  {trade}
                </option>
              ))}
            </select>
          </label>

          <label className="directory-filter" htmlFor="area-filter">
            <span className="directory-filter-label">Area</span>
            <select
              id="area-filter"
              className="form-select directory-select"
              value={area}
              onChange={(event) => setArea(event.target.value)}
            >
              {areas.map((areaOption) => (
                <option key={areaOption} value={areaOption}>
                  {areaOption}
                </option>
              ))}
            </select>
          </label>
        </div>

        <section id="services">
          <div className="services-heading-row mb-3">
            <div className="services-heading-copy">
              <h2 className="services-heading mb-0">Services</h2>
              <p className="services-heading-note mb-0">
                Sample listings and ratings
              </p>
            </div>
            <span className="services-result-count">
              {listings.length} {listings.length === 1 ? "result" : "results"}
            </span>
          </div>

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
                    onStartChat={(chatProvider) =>
                      navigate(`/conversation/${chatProvider.id}`)
                    }
                  />
                </div>
              ))}
            </div>
          ) : (
            <div className="alert alert-light border">
              No services found. Try changing your search or filters.
              <button
                type="button"
                className="btn btn-link"
                onClick={clearFilters}
              >
                Clear filters
              </button>
            </div>
          )}
        </section>
      </main>

      <footer className="footer-section py-4 mt-5">
        <div className="container">
          <p className="mb-0">© 2026 Skillz Directory</p>
        </div>
      </footer>
    </>
  );
}
