import { useMemo, useState } from "react";
import {
  ArrowRight,
  BriefcaseBusiness,
  Fan,
  Hammer,
  House,
  Paintbrush,
  Search,
  Star,
  Wrench,
  Zap,
  type LucideIcon,
} from "lucide-react";
import {
  Link,
  useLocation,
  useNavigate,
  useSearchParams,
} from "react-router-dom";

import Avatar from "../components/Avatar";
import ServiceCard from "../components/ServiceCard";
import { useAuth } from "../hooks/useAuth";
import { useSavedServices } from "../hooks/useSavedServices";
import type { SavedService } from "../services/savedServiceStorage";
import type { ServiceProvider } from "../types/serviceProvider";
import electricianImage from "../assets/providers/electrician.jpg";

type SortOption = "recommended" | "rating" | "recent" | "price";

interface ServiceListing {
  provider: ServiceProvider;
  service: string;
}

interface DirectoryPageProps {
  providers: ServiceProvider[];
  categories: string[];
}

const categoryIcons: Array<{ match: RegExp; icon: LucideIcon }> = [
  { match: /plumb/i, icon: Wrench },
  { match: /elect/i, icon: Zap },
  { match: /hvac|mechan/i, icon: Fan },
  { match: /roof/i, icon: House },
  { match: /carpent/i, icon: Hammer },
  { match: /paint/i, icon: Paintbrush },
];

function getCategoryIcon(category: string): LucideIcon {
  return (
    categoryIcons.find(({ match }) => match.test(category))?.icon ??
    BriefcaseBusiness
  );
}

export default function DirectoryPage({
  providers,
  categories,
}: DirectoryPageProps) {
  const [searchParams] = useSearchParams();
  const [keyword, setKeyword] = useState(
    () => searchParams.get("q") ?? "",
  );
  const [category, setCategory] = useState("");
  const [area, setArea] = useState("");
  const [sortBy, setSortBy] = useState<SortOption>("recommended");
  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const {
    savedServices,
    toggleSavedService,
    error: savedServicesError,
  } = useSavedServices(user?.id);

  const categoryCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const provider of providers) {
      counts.set(
        provider.category,
        (counts.get(provider.category) ?? 0) + provider.services.length,
      );
    }
    return counts;
  }, [providers]);

  const filteredProviders = useMemo(() => {
    const term = keyword.trim().toLowerCase();
    const areaQuery = area.trim().toLowerCase();

    return providers.filter((provider) => {
      const matchesCategory = !category || provider.category === category;
      const matchesArea = !areaQuery || provider.area.toLowerCase().includes(areaQuery);
      const searchableText = [
        provider.name,
        provider.person,
        provider.category,
        provider.area,
        ...provider.services,
      ]
        .join(" ")
        .toLowerCase();

      return (
        matchesCategory &&
        matchesArea &&
        (!term || searchableText.includes(term))
      );
    });
  }, [keyword, category, area, providers]);

  const listings = useMemo(() => {
    const results: ServiceListing[] = filteredProviders.flatMap((provider) =>
      provider.services.map((service) => ({ provider, service })),
    );

    return results.sort((a, b) => {
      if (sortBy === "rating") {
        return (
          b.provider.rating - a.provider.rating ||
          b.provider.reviews - a.provider.reviews
        );
      }

      const score = (listing: ServiceListing) =>
        listing.provider.rating * Math.log10(listing.provider.reviews + 1);
      return (
        score(b) - score(a) ||
        b.provider.rating - a.provider.rating ||
        a.service.localeCompare(b.service)
      );
    });
  }, [filteredProviders, sortBy]);

  const topProviders = [...filteredProviders].sort(
    (a, b) => b.rating - a.rating || b.reviews - a.reviews,
  );
  const hasFilters = Boolean(keyword.trim() || category || area.trim());

  function clearFilters() {
    setKeyword("");
    setCategory("");
    setArea("");
    setSortBy("recommended");
  }

  function selectCategory(nextCategory: string) {
    setCategory(nextCategory);
    document.getElementById("services")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  function startConversation(provider: ServiceProvider) {
    const conversationPath = `/conversation/${provider.id}`;
    navigate(
      user ? conversationPath : "/login",
      user ? undefined : { state: { from: conversationPath } },
    );
  }

  function viewService(provider: ServiceProvider, service?: string) {
    const serviceQuery = service
      ? `?service=${encodeURIComponent(service)}`
      : "";
    const destination = `/services/providers/${provider.id}${serviceQuery}`;
    navigate(
      user ? destination : "/login",
      user ? undefined : { state: { from: destination } },
    );
  }

  function toggleSaved(provider: ServiceProvider, service: string) {
    if (!user) {
      const returnTo = `${location.pathname}${location.search}`;
      navigate("/login", { state: { from: returnTo } });
      return;
    }

    toggleSavedService({ providerId: provider.id, service });
  }

  return (
    <>
      <section className="marketplace-hero">
        <div className="page-container">
          <div
            className={`marketplace-hero__grid${user ? " is-authenticated" : ""}`}
          >
            <div
              className="marketplace-hero__banner"
              style={{ backgroundImage: `url("${electricianImage}")` }}
            >
              <div className="marketplace-hero__banner-content">
                <p className="marketplace-eyebrow">SKILLZ DIRECTORY</p>
                <h1>
                  Local skills.
                  <br />
                  <span>Real connections.</span>
                </h1>
                <p className="marketplace-hero__description">
                  Find trusted service providers for the work you need done.
                </p>
                <form
                  className="marketplace-search"
                  role="search"
                  onSubmit={(event) => {
                    event.preventDefault();
                    setKeyword(keyword.trim());
                    document.getElementById("services")?.scrollIntoView({
                      behavior: "smooth",
                      block: "start",
                    });
                  }}
                >
                  <Search size={19} aria-hidden="true" />
                  <input
                    value={keyword}
                    onChange={(event) => setKeyword(event.target.value)}
                    placeholder="What service do you need?"
                    aria-label="Search services, providers, or areas"
                  />
                  <button type="submit">Search</button>
                </form>
              </div>
            </div>

            {!user && (
              <aside className="marketplace-join-panel">
                <span className="marketplace-join-panel__icon" aria-hidden="true">
                  <BriefcaseBusiness size={22} />
                </span>
                <p className="marketplace-eyebrow">Grow your business</p>
                <h2>Share your skills with your community.</h2>
                <p>
                  Create a provider account to showcase your services and connect
                  with residents. Use Register in the navigation and select the
                  provider account option.
                </p>
              </aside>
            )}
          </div>

          <details className="marketplace-mobile-controls">
            <summary>Filters</summary>
            <div className="marketplace-mobile-controls__content">
              <FilterControls
                categories={categories}
                category={category}
                area={area}
                sortBy={sortBy}
                onCategoryChange={setCategory}
                onAreaChange={setArea}
                onSortChange={setSortBy}
                onClear={clearFilters}
                hasFilters={hasFilters}
              />
            </div>
          </details>
        </div>
      </section>

      <main className="marketplace-main">
        <div className="page-container">
          <section className="marketplace-category-section" aria-labelledby="category-heading">
            <div className="marketplace-section-heading">
              <div>
                <p className="marketplace-eyebrow">Find the right professional</p>
                <h2 id="category-heading">Explore service categories</h2>
              </div>
              {category && (
                <button
                  type="button"
                  className="marketplace-text-button"
                  onClick={() => setCategory("")}
                >
                  Show all categories
                </button>
              )}
            </div>
            <div className="marketplace-category-grid">
              {categories.map((item) => {
                const Icon = getCategoryIcon(item);
                const count = categoryCounts.get(item) ?? 0;

                return (
                  <button
                    type="button"
                    className={`marketplace-category-card${
                      category === item ? " is-selected" : ""
                    }`}
                    key={item}
                    aria-pressed={category === item}
                    onClick={() => selectCategory(category === item ? "" : item)}
                  >
                    <span className="marketplace-category-card__icon">
                      <Icon size={21} aria-hidden="true" />
                    </span>
                    <span className="marketplace-category-card__copy">
                      <strong>{item}</strong>
                      <small>
                        {count} {count === 1 ? "service" : "services"}
                      </small>
                    </span>
                    <ArrowRight size={16} aria-hidden="true" />
                  </button>
                );
              })}
            </div>
          </section>

          <section id="services" className="marketplace-all-services" aria-labelledby="services-heading">
            <div className="marketplace-section-heading marketplace-all-services__heading">
              <div>
                <p className="marketplace-eyebrow">Explore local listings</p>
                <h2 id="services-heading">All services</h2>
              </div>
              <span className="marketplace-result-count">
                {listings.length} {listings.length === 1 ? "service" : "services"}
              </span>
            </div>

            <div className="marketplace-desktop-filters">
              <FilterControls
                categories={categories}
                category={category}
                area={area}
                sortBy={sortBy}
                onCategoryChange={setCategory}
                onAreaChange={setArea}
                onSortChange={setSortBy}
                onClear={clearFilters}
                hasFilters={hasFilters}
              />
            </div>

            {savedServicesError && (
              <div className="alert alert-warning" role="alert">
                {savedServicesError}
              </div>
            )}

            {listings.length > 0 ? (
              <ServiceGrid
                listings={listings}
                onStartChat={startConversation}
                onViewService={viewService}
                savedServices={savedServices}
                onToggleSave={toggleSaved}
              />
            ) : (
              <div className="marketplace-empty-state">
                <Search size={24} aria-hidden="true" />
                <h3>No matching services</h3>
                <p>Try a different search or clear the selected filters.</p>
                <button
                  type="button"
                  className="marketplace-button marketplace-button--outline"
                  onClick={clearFilters}
                >
                  Clear filters
                </button>
              </div>
            )}
          </section>

          <section className="marketplace-provider-section" aria-labelledby="providers-heading">
            <div className="marketplace-section-heading">
              <div>
                <p className="marketplace-eyebrow">Community favorites</p>
                <h2 id="providers-heading">Top-rated service providers</h2>
              </div>
            </div>
            {topProviders.length > 0 ? (
              <div className="marketplace-provider-grid">
                {topProviders.slice(0, 4).map((provider) => (
                  <article className="marketplace-provider-card" key={provider.id}>
                  <button
                    type="button"
                    className="marketplace-provider-card__avatar"
                    aria-label={`View ${provider.name} profile`}
                    onClick={() => viewService(provider)}
                  >
                    <Avatar
                      name={provider.person || provider.name}
                      imageUrl={provider.photo}
                      size={58}
                    />
                  </button>
                    <div className="marketplace-provider-card__details">
                    <h3>
                      <button type="button" onClick={() => viewService(provider)}>
                        {provider.name}
                      </button>
                    </h3>
                      <p>{provider.category} · {provider.area}</p>
                      <span>
                        <Star size={15} fill="currentColor" aria-hidden="true" />
                        {provider.rating.toFixed(1)}
                        <small>({provider.reviews} reviews)</small>
                      </span>
                    </div>
                    <button
                      type="button"
                      className="marketplace-icon-button"
                      aria-label={`View ${provider.name} profile`}
                      onClick={() => viewService(provider)}
                    >
                      <ArrowRight size={18} aria-hidden="true" />
                    </button>
                  </article>
                ))}
              </div>
            ) : (
              <div className="marketplace-data-note">No providers match the current filters.</div>
            )}
          </section>

        </div>
      </main>

      <MarketplaceFooter />
    </>
  );
}

function FilterControls({
  categories,
  category,
  area,
  sortBy,
  onCategoryChange,
  onAreaChange,
  onSortChange,
  onClear,
  hasFilters,
}: {
  categories: string[];
  category: string;
  area: string;
  sortBy: SortOption;
  onCategoryChange: (value: string) => void;
  onAreaChange: (value: string) => void;
  onSortChange: (value: SortOption) => void;
  onClear: () => void;
  hasFilters: boolean;
}) {
  return (
    <div className="marketplace-filter-bar">
      <label className="marketplace-filter">
        <span>Service type</span>
        <select value={category} onChange={(event) => onCategoryChange(event.target.value)}>
          <option value="">All services</option>
          {categories.map((item) => (
            <option key={item} value={item}>{item}</option>
          ))}
        </select>
      </label>
      <label className="marketplace-filter">
        <span>Provider area</span>
        <input
          type="text"
          value={area}
          onChange={(event) => onAreaChange(event.target.value)}
          placeholder="Enter a location"
          aria-label="Filter providers by area"
        />
      </label>
      <label className="marketplace-filter">
        <span>Sort by</span>
        <select
          value={sortBy}
          onChange={(event) => onSortChange(event.target.value as SortOption)}
        >
          <option value="recommended">Recommended</option>
          <option value="rating">Highest rated</option>
          <option value="recent" disabled>Recently added (dates unavailable)</option>
          <option value="price" disabled>Price (not listed)</option>
        </select>
      </label>
      <button
        type="button"
        className="marketplace-clear-button"
        onClick={onClear}
        disabled={!hasFilters && sortBy === "recommended"}
      >
        Clear filters
      </button>
      <p className="marketplace-filter-note">
        Price and listing-date sorting will be available when providers supply
        those details.
      </p>
    </div>
  );
}

function ServiceGrid({
  listings,
  onStartChat,
  onViewService,
  savedServices,
  onToggleSave,
  emptyMessage,
}: {
  listings: ServiceListing[];
  onStartChat: (provider: ServiceProvider) => void;
  onViewService: (provider: ServiceProvider, service: string) => void;
  savedServices: SavedService[];
  onToggleSave: (provider: ServiceProvider, service: string) => void;
  emptyMessage?: string;
}) {
  if (listings.length === 0) {
    return <div className="marketplace-data-note">{emptyMessage}</div>;
  }

  return (
    <div className="marketplace-service-grid">
      {listings.map(({ provider, service }) => (
        <ServiceCard
          key={`${provider.id}-${service}`}
          provider={provider}
          service={service}
          isSaved={savedServices.some(
            (saved) =>
              saved.providerId === provider.id && saved.service === service,
          )}
          onStartChat={() => onStartChat(provider)}
          onViewService={(selectedProvider, service) =>
            onViewService(selectedProvider, service)
          }
          onToggleSave={(selectedProvider, service) =>
            onToggleSave(selectedProvider, service)
          }
        />
      ))}
    </div>
  );
}

function MarketplaceFooter() {
  return (
    <footer className="marketplace-footer">
      <div className="page-container">
        <div className="marketplace-footer__grid">
          <div className="marketplace-footer__brand">
            <Link to="/" className="marketplace-footer__logo">
              Skillz <strong>Directory</strong>
            </Link>
            <p>Connecting residents with local service providers.</p>
          </div>
          <div>
            <h2>Explore</h2>
            <Link to="/#services">Browse services</Link>
            <Link to="/about">About Skillz Directory</Link>
          </div>
          <div>
            <h2>Account</h2>
            <Link to="/login">Sign in</Link>
          </div>
          <div>
            <h2>Contact & support</h2>
            <a href="https://wa.me/265991917168" target="_blank" rel="noopener noreferrer">
              WhatsApp support
            </a>
            <a href="mailto:SkillzDirectory@gmail.com">SkillzDirectory@gmail.com</a>
          </div>
          <div>
            <h2>Legal requests</h2>
            <a href="mailto:SkillzDirectory@gmail.com?subject=Privacy%20policy%20request">
              Request privacy information
            </a>
            <a href="mailto:SkillzDirectory@gmail.com?subject=Terms%20of%20use%20request">
              Request terms of use
            </a>
          </div>
        </div>
        <div className="marketplace-footer__bottom">
          <span>© {new Date().getFullYear()} Skillz Directory</span>
          <span>Find local skills. Build real connections.</span>
        </div>
      </div>
    </footer>
  );
}
